import { createHash, randomBytes, randomUUID } from 'node:crypto';

import type {
  ChatRetrievalContract,
  GeneratedDocs,
  GroundedKnowledgeSource,
  MCPToken,
  MCPTokenCreateResult,
  MCPTokenRecord,
  MCPTokenStoreContract,
  MCPToolCallInput,
  MCPToolCallResult,
  WikiChatStoreContract,
} from '../../types';

const TOKEN_PREFIX = 'cw_mcp_';
const DEFAULT_SCOPES = ['read:docs'];

export class InMemoryMCPTokenStore implements MCPTokenStoreContract {
  private readonly tokens = new Map<string, MCPTokenRecord>();

  async createToken(input: {
    projectId: string;
    userId: string;
    name: string;
    tokenHash: string;
    tokenPrefix: string;
    scopes: string[];
  }): Promise<MCPToken> {
    const now = new Date().toISOString();
    const record: MCPTokenRecord = {
      id: randomUUID(),
      projectId: input.projectId,
      userId: input.userId,
      name: input.name.trim() || 'MCP token',
      tokenHash: input.tokenHash,
      tokenPrefix: input.tokenPrefix,
      scopes: input.scopes,
      createdAt: now,
    };
    this.tokens.set(record.id, record);
    return toPublicToken(record);
  }

  async listTokens(input: { projectId: string; userId: string }): Promise<MCPToken[]> {
    return Array.from(this.tokens.values())
      .filter((token) => token.projectId === input.projectId && token.userId === input.userId)
      .map(toPublicToken)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findTokenByHash(tokenHash: string): Promise<MCPTokenRecord | null> {
    return Array.from(this.tokens.values()).find((token) => token.tokenHash === tokenHash) ?? null;
  }

  async markTokenUsed(tokenId: string): Promise<void> {
    const token = this.tokens.get(tokenId);
    if (token) this.tokens.set(tokenId, { ...token, lastUsedAt: new Date().toISOString() });
  }

  async revokeToken(input: { projectId: string; userId: string; tokenId: string }): Promise<void> {
    const token = this.tokens.get(input.tokenId);
    if (!token || token.projectId !== input.projectId || token.userId !== input.userId) return;
    this.tokens.set(input.tokenId, { ...token, revokedAt: new Date().toISOString() });
  }
}

export class MCPTokenService {
  constructor(private readonly deps: { store: MCPTokenStoreContract }) {}

  async createToken(input: { projectId: string; userId: string; name: string }): Promise<MCPTokenCreateResult> {
    const plaintextToken = `${TOKEN_PREFIX}${randomBytes(24).toString('base64url')}`;
    const token = await this.deps.store.createToken({
      projectId: input.projectId,
      userId: input.userId,
      name: input.name,
      tokenHash: hashMCPToken(plaintextToken),
      tokenPrefix: plaintextToken.slice(0, 14),
      scopes: DEFAULT_SCOPES,
    });
    return { token, plaintextToken };
  }

  async listTokens(input: { projectId: string; userId: string }): Promise<MCPToken[]> {
    return this.deps.store.listTokens(input);
  }

  async revokeToken(input: { projectId: string; userId: string; tokenId: string }): Promise<void> {
    await this.deps.store.revokeToken(input);
  }

  async verifyToken(input: { plaintextToken: string; projectId: string }): Promise<MCPTokenRecord> {
    const token = await this.deps.store.findTokenByHash(hashMCPToken(input.plaintextToken.trim()));
    if (!token || token.revokedAt) throw new Error('Invalid or revoked MCP token');
    if (token.projectId !== input.projectId) throw new Error('MCP token is not scoped to this project');
    if (!token.scopes.includes('read:docs')) throw new Error('MCP token is missing read scope');
    await this.deps.store.markTokenUsed(token.id);
    return token;
  }
}

export class MCPService {
  constructor(
    private readonly deps: {
      getDocs(projectId: string): Promise<GeneratedDocs | null>;
      retrieveContext: ChatRetrievalContract['retrieveContext'];
      generateAnswer(input: { projectId: string; question: string; context: string; sources: GroundedKnowledgeSource[] }): Promise<{ content: string; sources: GroundedKnowledgeSource[] }>;
      chatStore?: WikiChatStoreContract;
    },
  ) {}

  async callTool(input: MCPToolCallInput): Promise<MCPToolCallResult> {
    if (input.tool === 'search_docs') return this.searchDocs(input);
    if (input.tool === 'ask_wiki') return this.askWiki(input);
    if (input.tool === 'get_page') return this.getPage(input);
    if (input.tool === 'get_source_evidence') return this.getSourceEvidence(input);
    throw new Error('Unknown MCP tool');
  }

  private async searchDocs(input: MCPToolCallInput): Promise<MCPToolCallResult> {
    const query = String(input.arguments.query ?? '').trim() || 'overview';
    const maxResults = Math.min(Number(input.arguments.maxResults ?? 5), 10);
    const retrieval = await this.deps.retrieveContext({
      projectId: input.projectId,
      query,
      maxResults,
      allowedSources: ['generated-docs', 'vector-index', 'codebase-summary'],
    });
    return toTextResult({
      query,
      results: retrieval.sources.map((source) => ({
        title: source.title ?? source.reference,
        pageSlug: source.pageSlug,
        source: source.source,
        relevanceScore: source.relevanceScore,
        excerpt: source.excerpt.slice(0, 1200),
      })),
    });
  }

  private async askWiki(input: MCPToolCallInput): Promise<MCPToolCallResult> {
    const question = String(input.arguments.question ?? '').trim();
    if (!question) throw new Error('question is required');
    const retrieval = await this.deps.retrieveContext({
      projectId: input.projectId,
      query: question,
      maxResults: 5,
      allowedSources: ['generated-docs', 'vector-index', 'codebase-summary'],
    });
    const answer = await this.deps.generateAnswer({
      projectId: input.projectId,
      question,
      context: retrieval.context,
      sources: retrieval.sources,
    });
    return toTextResult({
      answer: answer.content,
      citations: answer.sources.length ? answer.sources : retrieval.sources.slice(0, 5),
    });
  }

  private async getPage(input: MCPToolCallInput): Promise<MCPToolCallResult> {
    const slug = String(input.arguments.slug ?? input.arguments.pageSlug ?? '').trim();
    if (!slug) throw new Error('slug is required');
    const docs = await this.requireDocs(input.projectId);
    const page = docs.pages.find((candidate) => candidate.slug === slug);
    if (!page) throw new Error('Docs page not found');
    return toTextResult({
      page: {
        slug: page.slug,
        title: page.title,
        content: page.content,
        version: docs.version,
        generatedAt: docs.generatedAt,
      },
    });
  }

  private async getSourceEvidence(input: MCPToolCallInput): Promise<MCPToolCallResult> {
    const pageSlug = typeof input.arguments.pageSlug === 'string' ? input.arguments.pageSlug : undefined;
    const docs = await this.requireDocs(input.projectId);
    const page = pageSlug ? docs.pages.find((candidate) => candidate.slug === pageSlug) : undefined;
    const pageContent = page?.content ?? '';
    const allFiles = docs.sourceFiles ?? [];
    const matchedFiles = allFiles
      .filter((file) => !pageSlug || pageContent.includes(file.path) || pageContent.toLowerCase().includes(file.path.split('/').pop()?.toLowerCase() ?? ''))
    const files = (matchedFiles.length > 0 ? matchedFiles : allFiles)
      .slice(0, 8)
      .map((file) => ({
        path: file.path,
        language: file.language,
        excerpt: file.content.slice(0, 2000),
      }));
    return toTextResult({ projectId: input.projectId, pageSlug, files });
  }

  private async requireDocs(projectId: string): Promise<GeneratedDocs> {
    const docs = await this.deps.getDocs(projectId);
    if (!docs) throw new Error('Generated docs not found');
    return docs;
  }
}

export function hashMCPToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function extractBearerToken(header: string | null): string {
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? '';
}

function toPublicToken(token: MCPTokenRecord): MCPToken {
  return {
    id: token.id,
    projectId: token.projectId,
    userId: token.userId,
    name: token.name,
    tokenPrefix: token.tokenPrefix,
    scopes: token.scopes,
    createdAt: token.createdAt,
    lastUsedAt: token.lastUsedAt,
    revokedAt: token.revokedAt,
  };
}

function toTextResult(value: unknown): MCPToolCallResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    structuredContent: value,
  };
}
