import {
  InMemoryVectorIndexStore,
  OpenAICompatibleEmbeddingGenerator,
  GroundedDocsRetrievalService,
  buildSemanticIndex,
} from './index';

describe('semantic search preparation', () => {
  test('maps OpenAI-compatible embedding response into typed chunks', async () => {
    const generator = new OpenAICompatibleEmbeddingGenerator({
      embeddings: {
        create: async () => ({
          data: [
            { embedding: [0.1, 0.2, 0.3] },
            { embedding: [0.4, 0.5, 0.6] },
          ],
        }),
      },
    } as never);

    const result = await generator.generateEmbeddings({
      projectId: 'project-1',
      model: 'embedding-model',
      chunks: [
        { chunkId: 'docs:overview', text: 'Overview docs', metadata: { source: 'docs', pageSlug: 'overview' } },
        { chunkId: 'summary:root', text: 'Project summary', metadata: { source: 'codebase-summary' } },
      ],
    });

    expect(result.projectId).toBe('project-1');
    expect(result.embeddings).toEqual([
      {
        chunkId: 'docs:overview',
        text: 'Overview docs',
        embedding: [0.1, 0.2, 0.3],
        metadata: { source: 'docs', pageSlug: 'overview' },
      },
      {
        chunkId: 'summary:root',
        text: 'Project summary',
        embedding: [0.4, 0.5, 0.6],
        metadata: { source: 'codebase-summary' },
      },
    ]);
  });

  test('builds semantic index from generated docs and summary', async () => {
    const generator = {
      generateEmbeddings: async (input: { projectId: string; model: string; chunks: Array<{ chunkId: string; text: string; metadata: { source: 'docs' | 'codebase-summary'; pageSlug?: string } }> }) => ({
        projectId: input.projectId,
        model: input.model,
        generatedAt: '2026-01-01T00:00:00.000Z',
        embeddings: input.chunks.map((chunk, index) => ({
          chunkId: chunk.chunkId,
          text: chunk.text,
          metadata: chunk.metadata,
          embedding: [index + 1, index + 1, index + 1],
        })),
      }),
    };

    const store = new InMemoryVectorIndexStore();

    const result = await buildSemanticIndex({
      projectId: 'project-1',
      model: 'embedding-model',
      summary: 'This project generates documentation automatically.',
      docs: [
        { slug: 'overview', title: 'Overview', content: 'Overview content' },
        { slug: 'setup', title: 'Setup', content: 'Setup content' },
      ],
      embeddingGenerator: generator as never,
      vectorIndexStore: store,
    });

    expect(result.projectId).toBe('project-1');
    expect(result.chunkCount).toBe(3);

    const stored = await store.getIndex('project-1');
    expect(stored?.embeddings).toHaveLength(3);
    expect(stored?.embeddings[0]?.metadata.source).toBe('docs');
    expect(stored?.embeddings[2]?.metadata.source).toBe('codebase-summary');
  });

  test('retrieves grounded context from indexed docs and summary', async () => {
    const embeddingGenerator = {
      generateEmbeddings: async () => ({
        projectId: 'project-1',
        model: 'embedding-model',
        generatedAt: '2026-01-01T00:00:00.000Z',
        embeddings: [
          {
            chunkId: 'query',
            text: 'How to setup project?',
            embedding: [1, 0, 0],
            metadata: { source: 'docs' as const },
          },
        ],
      }),
    };

    const store = new InMemoryVectorIndexStore();
    await store.upsertIndex({
      projectId: 'project-1',
      embeddings: [
        {
          chunkId: 'docs:setup',
          text: 'Run npm install and npm run dev',
          embedding: [1, 0, 0],
          metadata: { source: 'docs', pageSlug: 'setup' },
        },
        {
          chunkId: 'summary:root',
          text: 'This project builds docs from codebases',
          embedding: [0, 1, 0],
          metadata: { source: 'codebase-summary' },
        },
      ],
    });

    const retrieval = new GroundedDocsRetrievalService({
      embeddingGenerator: embeddingGenerator as never,
      vectorIndexStore: store,
      model: 'embedding-model',
    });

    const result = await retrieval.retrieveContext({
      projectId: 'project-1',
      query: 'How to setup project?',
      maxResults: 2,
      allowedSources: ['generated-docs', 'vector-index', 'codebase-summary'],
    });

    expect(result.groundedOnly).toBe(true);
    expect(result.sources[0]?.reference).toBe('vector-index:docs:setup');
    expect(result.context).toContain('Run npm install and npm run dev');
  });
});
