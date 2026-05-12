import type { ChatRetrievalResponse } from '../../types';
import { InMemoryWikiChatStore, WikiChatService } from './index';

describe('Ask Wiki chat service', () => {
  test('persists user and grounded assistant messages with citations', async () => {
    const store = new InMemoryWikiChatStore();
    const retrievalResult: ChatRetrievalResponse = {
      projectId: 'project-1',
      query: 'What routes exist?',
      groundedOnly: true,
      context: 'API Reference\nGET /health checks service health.',
      sources: [
        {
          source: 'vector-index',
          reference: 'vector-index:docs:api-reference',
          relevanceScore: 0.91,
          excerpt: 'GET /health checks service health.',
        },
      ],
    };
    const service = new WikiChatService({
      store,
      retrieveContext: async () => retrievalResult,
      aiClient: {
        async generateText(input) {
          expect(input.messages[0].content).toContain('Answer only from the retrieved Codebase Wiki context');
          expect(input.messages[1].content).toContain('GET /health checks service health');
          return {
            projectId: input.projectId,
            model: input.model,
            generatedAt: '2026-01-01T00:00:00.000Z',
            content: 'The service exposes `GET /health` for health checks.',
          };
        },
      },
      model: 'test-model',
    });

    const response = await service.sendMessage({
      projectId: 'project-1',
      userId: 'user-1',
      question: 'What routes exist?',
    });

    expect(response.session.projectId).toBe('project-1');
    expect(response.messages.map((message) => message.role)).toEqual(['user', 'assistant']);
    expect(response.messages[1].content).toContain('GET /health');
    expect(response.messages[1].sources[0]).toMatchObject({
      reference: 'vector-index:docs:api-reference',
      excerpt: 'GET /health checks service health.',
    });

    const sessions = await store.listSessions({ projectId: 'project-1', userId: 'user-1' });
    expect(sessions).toHaveLength(1);
    expect(sessions[0].title).toBe('What routes exist?');
  });

  test('instructs AI to produce scannable summary plus bullet answers', async () => {
    const store = new InMemoryWikiChatStore();
    const service = new WikiChatService({
      store,
      retrieveContext: async () => ({
        projectId: 'project-1',
        query: 'What endpoints does this project expose?',
        groundedOnly: true,
        context: 'API Reference\nGET /health\nPOST /v1/chat/completions',
        sources: [
          {
            source: 'generated-docs',
            reference: 'generated-docs:api-reference',
            relevanceScore: 9,
            excerpt: 'GET /health\nPOST /v1/chat/completions',
            pageSlug: 'api-reference',
            title: 'API Reference',
          },
        ],
      }),
      aiClient: {
        async generateText(input) {
          expect(input.messages[0].content).toContain('Start with one short direct answer sentence');
          expect(input.messages[0].content).toContain('Use bullet points for multiple facts');
          expect(input.messages[0].content).toContain('Wrap endpoints, file paths, symbols, and commands in inline code');
          return {
            projectId: input.projectId,
            model: input.model,
            generatedAt: '2026-01-01T00:00:00.000Z',
            content: 'This project exposes two documented endpoints.\n\n- `GET /health`\n- `POST /v1/chat/completions`',
          };
        },
      },
      model: 'test-model',
    });

    const response = await service.sendMessage({
      projectId: 'project-1',
      userId: 'user-1',
      question: 'What endpoints does this project expose?',
    });

    expect(response.messages[1].content).toContain('- `GET /health`');
  });

  test('persists fallback assistant message when retrieval context is empty', async () => {
    const store = new InMemoryWikiChatStore();
    const service = new WikiChatService({
      store,
      retrieveContext: async () => ({
        projectId: 'project-empty',
        query: 'How does auth work?',
        groundedOnly: true,
        sources: [],
        context: '',
      }),
      aiClient: {
        async generateText() {
          throw new Error('AI should not be called without context');
        },
      },
      model: 'test-model',
    });

    const response = await service.sendMessage({
      projectId: 'project-empty',
      userId: 'user-1',
      question: 'How does auth work?',
    });

    expect(response.messages[1].role).toBe('assistant');
    expect(response.messages[1].content).toContain("couldn't find enough indexed documentation");
    expect(response.messages[1].sources).toEqual([]);
  });

  test('lists and deletes user-scoped chat sessions', async () => {
    const store = new InMemoryWikiChatStore();
    const session = await store.createSession({
      projectId: 'project-1',
      userId: 'user-1',
      title: 'Session one',
    });
    await store.createSession({
      projectId: 'project-1',
      userId: 'user-2',
      title: 'Other user',
    });

    expect(await store.listSessions({ projectId: 'project-1', userId: 'user-1' })).toHaveLength(1);
    await store.deleteSession({ projectId: 'project-1', userId: 'user-1', sessionId: session.id });
    expect(await store.listSessions({ projectId: 'project-1', userId: 'user-1' })).toHaveLength(0);
    expect(await store.listSessions({ projectId: 'project-1', userId: 'user-2' })).toHaveLength(1);
  });
});
