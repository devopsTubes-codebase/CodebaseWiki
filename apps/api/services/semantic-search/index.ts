import type {
  ChatRetrievalContract,
  ChatRetrievalRequest,
  ChatRetrievalResponse,
  EmbeddingChunk,
  EmbeddingGeneratorContract,
  EmbeddingGenerationRequest,
  EmbeddingGenerationResponse,
  GroundedKnowledgeSource,
  SemanticIndexBuildRequest,
  SemanticIndexBuildResult,
  VectorIndexStoreContract,
  VectorIndexUpsertRequest,
  VectorIndexUpsertResult,
} from '../../types';

export interface SemanticSearchServiceContract {
  buildIndex(input: SemanticIndexBuildRequest): Promise<SemanticIndexBuildResult>;
}

export interface SemanticSearchPrepContract {
  embeddingGenerator: EmbeddingGeneratorContract;
  vectorIndexStore: VectorIndexStoreContract;
  retrieval: ChatRetrievalContract;
}

type OpenAICompatibleEmbeddingsClient = {
  embeddings: {
    create(input: { model: string; input: string[] | string }): Promise<{
      data: Array<{ embedding: number[] }>;
    }>;
  };
};

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

const vectorIndexByProject = new Map<string, { projectId: string; embeddings: EmbeddingChunk[]; indexedAt: string }>();

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function buildIndexChunks(input: { summary: string; docs: Array<{ slug: string; title: string; content: string }> }) {
  const docChunks = input.docs.map((page) => ({
    chunkId: `docs:${page.slug}`,
    text: `${page.title}\n\n${page.content}`,
    metadata: {
      source: 'docs' as const,
      pageSlug: page.slug,
    },
  }));

  const summaryChunk = {
    chunkId: 'summary:root',
    text: input.summary,
    metadata: {
      source: 'codebase-summary' as const,
    },
  };

  return [...docChunks, summaryChunk];
}

export class OpenAICompatibleEmbeddingGenerator implements EmbeddingGeneratorContract {
  constructor(
    private readonly client: OpenAICompatibleEmbeddingsClient,
  ) {}

  async generateEmbeddings(input: EmbeddingGenerationRequest): Promise<EmbeddingGenerationResponse> {
    const response = await this.client.embeddings.create({
      model: input.model,
      input: input.chunks.map((chunk) => chunk.text),
    });

    return {
      projectId: input.projectId,
      model: input.model,
      generatedAt: new Date().toISOString(),
      embeddings: input.chunks.map((chunk, index) => ({
        chunkId: chunk.chunkId,
        text: chunk.text,
        metadata: chunk.metadata,
        embedding: response.data[index]?.embedding ?? [],
      })),
    };
  }
}

export class GeminiEmbeddingGenerator implements EmbeddingGeneratorContract {
  constructor(
    private readonly input: {
      apiKey: string;
      baseURL?: string;
      fetchImpl?: FetchLike;
    },
  ) {}

  async generateEmbeddings(input: EmbeddingGenerationRequest): Promise<EmbeddingGenerationResponse> {
    const baseURL = this.input.baseURL ?? 'https://generativelanguage.googleapis.com/v1beta';
    const modelPath = input.model.startsWith('models/') ? input.model : `models/${input.model}`;
    const fetchImpl = this.input.fetchImpl ?? fetch;
    const response = await fetchImpl(`${baseURL.replace(/\/$/, '')}/${modelPath}:batchEmbedContents?key=${this.input.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: input.chunks.map((chunk) => ({
          model: modelPath,
          content: { parts: [{ text: chunk.text }] },
        })),
      }),
    });

    if (!response.ok) {
      throw new Error('Gemini embedding request failed');
    }

    const payload = (await response.json()) as { embeddings?: Array<{ values?: number[] }> };

    return {
      projectId: input.projectId,
      model: input.model,
      generatedAt: new Date().toISOString(),
      embeddings: input.chunks.map((chunk, index) => ({
        chunkId: chunk.chunkId,
        text: chunk.text,
        metadata: chunk.metadata,
        embedding: payload.embeddings?.[index]?.values ?? [],
      })),
    };
  }
}

export class NotImplementedEmbeddingGenerator implements EmbeddingGeneratorContract {
  async generateEmbeddings(input: EmbeddingGenerationRequest): Promise<EmbeddingGenerationResponse> {
    const embeddings: EmbeddingChunk[] = input.chunks.map((chunk) => ({
      chunkId: chunk.chunkId,
      text: chunk.text,
      embedding: [],
      metadata: chunk.metadata,
    }));

    return {
      projectId: input.projectId,
      model: input.model,
      embeddings,
      generatedAt: new Date().toISOString(),
    };
  }
}

export class InMemoryVectorIndexStoreStub implements VectorIndexStoreContract {
  async upsertIndex(input: VectorIndexUpsertRequest): Promise<VectorIndexUpsertResult> {
    vectorIndexByProject.set(input.projectId, {
      projectId: input.projectId,
      embeddings: input.embeddings,
      indexedAt: new Date().toISOString(),
    });

    return {
      projectId: input.projectId,
      indexedAt: vectorIndexByProject.get(input.projectId)!.indexedAt,
      chunkCount: input.embeddings.length,
    };
  }
}

export class InMemoryVectorIndexStore extends InMemoryVectorIndexStoreStub {
  async getIndex(projectId: string) {
    return vectorIndexByProject.get(projectId) ?? null;
  }
}

export class GroundedDocsRetrievalStub implements ChatRetrievalContract {
  async retrieveContext(input: ChatRetrievalRequest): Promise<ChatRetrievalResponse> {
    const sources: GroundedKnowledgeSource[] = input.allowedSources.map((source) => ({
      source,
      reference:
        source === 'generated-docs'
          ? `generated-docs:${input.projectId}`
          : source === 'vector-index'
            ? `vector-index:${input.projectId}`
            : `codebase-summary:${input.projectId}`,
      relevanceScore: 0,
      excerpt: '',
    }));

    return {
      projectId: input.projectId,
      query: input.query,
      groundedOnly: true,
      sources,
      context: '',
    };
  }
}

export function rankGroundedKnowledgeSources(input: {
  query: string;
  sources: GroundedKnowledgeSource[];
  maxResults: number;
}): GroundedKnowledgeSource[] {
  const queryTerms = tokenizeForLexicalSearch(input.query);
  return input.sources
    .map((source, index) => ({
      source: {
        ...source,
        relevanceScore: Math.max(source.relevanceScore, lexicalRelevance(input.query, queryTerms, source)),
      },
      index,
    }))
    .sort((a, b) => b.source.relevanceScore - a.source.relevanceScore || a.index - b.index)
    .slice(0, input.maxResults)
    .map(({ source }) => source);
}

function lexicalRelevance(query: string, queryTerms: string[], source: GroundedKnowledgeSource): number {
  const searchable = `${source.title ?? ''} ${source.pageSlug ?? ''} ${source.reference} ${source.excerpt}`.toLowerCase();
  let score = 0;
  for (const term of queryTerms) {
    if (searchable.includes(term)) score += 1;
  }

  if (/\bendpoint|route|api|path|expose/.test(query.toLowerCase())) {
    const endpointMatches = source.excerpt.match(/\b(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+\/[^\s`,)]+/gi) ?? [];
    score += endpointMatches.length * 4;
    if (source.pageSlug === 'api-reference') score += 3;
    if (source.pageSlug === 'overview') score += 2;
  }

  if (source.source === 'generated-docs') score += 0.5;
  return score;
}

function tokenizeForLexicalSearch(query: string): string[] {
  const stopWords = new Set(['what', 'which', 'does', 'this', 'that', 'the', 'and', 'for', 'with', 'project', 'codebase']);
  return query
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 2 && !stopWords.has(term));
}

export class GroundedDocsRetrievalService implements ChatRetrievalContract {
  constructor(
    private readonly input: {
      embeddingGenerator: EmbeddingGeneratorContract;
      vectorIndexStore: InMemoryVectorIndexStore;
      model: string;
    },
  ) {}

  async retrieveContext(input: ChatRetrievalRequest): Promise<ChatRetrievalResponse> {
    const queryEmbeddings = await this.input.embeddingGenerator.generateEmbeddings({
      projectId: input.projectId,
      model: this.input.model,
      chunks: [
        {
          chunkId: 'query',
          text: input.query,
          metadata: { source: 'docs' },
        },
      ],
    });

    const queryVector = queryEmbeddings.embeddings[0]?.embedding ?? [];
    const stored = await this.input.vectorIndexStore.getIndex(input.projectId);
    const available = stored?.embeddings ?? [];

    const ranked = available
      .map((chunk) => ({
        chunk,
        score: cosineSimilarity(queryVector, chunk.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, input.maxResults);

    const sources: GroundedKnowledgeSource[] = ranked.map(({ chunk, score }) => ({
      source: chunk.metadata.source === 'docs' ? 'vector-index' : 'codebase-summary',
      reference: `vector-index:${chunk.chunkId}`,
      relevanceScore: score,
      excerpt: chunk.text,
      pageSlug: chunk.metadata.pageSlug,
    }));
    const reranked = rankGroundedKnowledgeSources({
      query: input.query,
      sources,
      maxResults: input.maxResults,
    });

    return {
      projectId: input.projectId,
      query: input.query,
      groundedOnly: true,
      sources: reranked,
      context: reranked.map((source) => source.excerpt).join('\n\n'),
    };
  }
}

export async function buildSemanticIndex(input: {
  projectId: string;
  model: string;
  summary: string;
  docs: Array<{ slug: string; title: string; content: string }>;
  embeddingGenerator: EmbeddingGeneratorContract;
  vectorIndexStore: VectorIndexStoreContract;
}): Promise<SemanticIndexBuildResult> {
  const chunks = buildIndexChunks({
    summary: input.summary,
    docs: input.docs,
  });

  const generated = await input.embeddingGenerator.generateEmbeddings({
    projectId: input.projectId,
    model: input.model,
    chunks,
  });

  return input.vectorIndexStore.upsertIndex({
    projectId: input.projectId,
    embeddings: generated.embeddings,
  });
}
