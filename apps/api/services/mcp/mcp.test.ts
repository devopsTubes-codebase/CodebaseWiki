import type { GeneratedDocs, WikiChatStoreContract } from '../../types';
import {
  InMemoryMCPTokenStore,
  MCPService,
  MCPTokenService,
} from './index';

const docs: GeneratedDocs = {
  projectId: 'project-1',
  pages: [
    { slug: 'overview', title: 'Overview', content: '## Overview\n\nProject exposes `GET /health`.' },
    { slug: 'api-reference', title: 'API Reference', content: '## API Reference\n\n- `GET /health`' },
  ],
  sidebar: [],
  sourceFiles: [
    { path: 'internal/proxy/handler.go', language: 'go', content: 'mux.Handle("GET /health", h)' },
  ],
  generatedAt: '2026-01-01T00:00:00.000Z',
  version: 1,
};

describe('MCP token service', () => {
  test('returns plaintext token once and stores only hash metadata', async () => {
    const store = new InMemoryMCPTokenStore();
    const service = new MCPTokenService({ store });

    const created = await service.createToken({
      projectId: 'project-1',
      userId: 'user-1',
      name: 'Cursor',
    });

    expect(created.plaintextToken).toMatch(/^cw_mcp_/);
    expect(created.token.tokenPrefix).toBe(created.plaintextToken.slice(0, 14));
    expect(JSON.stringify(await store.listTokens({ projectId: 'project-1', userId: 'user-1' }))).not.toContain(created.plaintextToken);
  });

  test('rejects revoked and project-mismatched tokens', async () => {
    const store = new InMemoryMCPTokenStore();
    const service = new MCPTokenService({ store });
    const created = await service.createToken({ projectId: 'project-1', userId: 'user-1', name: 'Droid' });

    await expect(service.verifyToken({ plaintextToken: created.plaintextToken, projectId: 'project-2' })).rejects.toThrow('MCP token is not scoped');
    await service.revokeToken({ projectId: 'project-1', userId: 'user-1', tokenId: created.token.id });
    await expect(service.verifyToken({ plaintextToken: created.plaintextToken, projectId: 'project-1' })).rejects.toThrow('Invalid or revoked MCP token');
  });
});

describe('MCP service tools', () => {
  test('executes read-only docs tools and keeps ask_wiki stateless', async () => {
    const chatStore = createCountingChatStore();
    const service = new MCPService({
      getDocs: async () => docs,
      retrieveContext: async () => ({
        projectId: 'project-1',
        query: 'health',
        groundedOnly: true,
        context: 'API Reference\nGET /health',
        sources: [
          {
            source: 'generated-docs',
            reference: 'generated-docs:api-reference',
            relevanceScore: 8,
            excerpt: 'GET /health',
            pageSlug: 'api-reference',
            title: 'API Reference',
          },
        ],
      }),
      generateAnswer: async () => ({
        content: 'The project exposes `GET /health`.\n\n- `GET /health` checks service health.',
        sources: [],
      }),
      chatStore,
    });

    const search = await service.callTool({ projectId: 'project-1', tool: 'search_docs', arguments: { query: 'health' } });
    expect(search.content[0].text).toContain('GET /health');

    const page = await service.callTool({ projectId: 'project-1', tool: 'get_page', arguments: { slug: 'api-reference' } });
    expect(page.content[0].text).toContain('API Reference');
    const pageByPageSlug = await service.callTool({ projectId: 'project-1', tool: 'get_page', arguments: { pageSlug: 'api-reference' } });
    expect(pageByPageSlug.content[0].text).toContain('API Reference');

    const evidence = await service.callTool({ projectId: 'project-1', tool: 'get_source_evidence', arguments: { pageSlug: 'api-reference' } });
    expect(evidence.content[0].text).toContain('internal/proxy/handler.go');

    const answer = await service.callTool({ projectId: 'project-1', tool: 'ask_wiki', arguments: { question: 'What endpoints?' } });
    expect(answer.content[0].text).toContain('GET /health');
    expect(chatStore.appendCount).toBe(0);
  });
});

function createCountingChatStore(): WikiChatStoreContract & { appendCount: number } {
  return {
    appendCount: 0,
    async listSessions() { return []; },
    async createSession() { throw new Error('should not create sessions'); },
    async getSession() { return null; },
    async deleteSession() {},
    async listMessages() { return []; },
    async appendMessage() {
      this.appendCount += 1;
      throw new Error('should not append messages');
    },
  };
}
