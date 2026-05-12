import {
  createAIDocGenerationPipelineStub,
  createAIDocGenerationService,
  runAIDocGenerationPipelineStub,
  OpenAICompatibleAIClientStub,
  OpenAICompatibleAIClient,
  CodebaseDocPromptBuilderStub,
  MarkdownFormatterStub,
  MarkdownPageSplitterStub,
  SidebarGeneratorStub,
} from './index';
import { InMemoryDocsHistoryStoreStub, InMemoryDocumentationStoreStub } from '../storage/documentation-store';

describe('AI documentation generation pipeline', () => {
  test('builds prompt with project context and suggested sections', () => {
    const builder = new CodebaseDocPromptBuilderStub();

    const prompt = builder.buildPrompt({
      projectId: 'project-1',
      compactContext: 'compact context payload',
      suggestedDocStructure: ['overview', 'setup-guide', 'improvement-suggestions'],
    });

    expect(prompt.systemPrompt).toContain('multiple Markdown pages');
    expect(prompt.userPrompt).toContain('Project ID: project-1');
    expect(prompt.userPrompt).toContain('- overview');
    expect(prompt.userPrompt).toContain('compact context payload');
  });

  test('maps OpenAI-compatible response into generation output', async () => {
    const client = new OpenAICompatibleAIClient({
      chat: {
        completions: {
          create: async () => ({
            choices: [
              {
                message: {
                  content: '## Overview\n\nGenerated content',
                },
              },
            ],
          }),
        },
      },
    } as never);

    const response = await client.generateText({
      projectId: 'project-1',
      model: 'test-model',
      messages: [{ role: 'user', content: 'hello' }],
    });

    expect(response.projectId).toBe('project-1');
    expect(response.model).toBe('test-model');
    expect(response.content).toContain('Generated content');
  });

  test('builds multiple pages and sidebar from markdown sections', async () => {
    const pipeline = createAIDocGenerationPipelineStub({
      aiClient: new OpenAICompatibleAIClientStub(),
      promptBuilder: new CodebaseDocPromptBuilderStub(),
      markdownFormatter: new MarkdownFormatterStub(),
      pageSplitter: new MarkdownPageSplitterStub(),
      sidebarGenerator: new SidebarGeneratorStub(),
      docsHistoryStore: new InMemoryDocsHistoryStoreStub(),
    });

    pipeline.aiClient.generateText = async () => ({
      projectId: 'project-1',
      model: 'test-model',
      generatedAt: '2026-01-01T00:00:00.000Z',
      content: [
        '# Codebase Wiki',
        '',
        '## Overview',
        'Overview content',
        '',
        '## Setup Guide',
        'Setup content',
        '',
        '## Improvement Suggestions',
        'Improve content',
      ].join('\n'),
    });

    const result = await runAIDocGenerationPipelineStub({
      pipeline,
      projectId: 'project-1',
      model: 'test-model',
      compactContext: 'compact context',
      suggestedDocStructure: ['overview', 'setup-guide', 'improvement-suggestions'],
    });

    expect(result.pages).toEqual([
      {
        slug: 'overview',
        title: 'Overview',
        content: '## Overview\n\nOverview content',
      },
      {
        slug: 'setup-guide',
        title: 'Setup Guide',
        content: '## Setup Guide\n\nSetup content',
      },
      {
        slug: 'improvement-suggestions',
        title: 'Improvement Suggestions',
        content: '## Improvement Suggestions\n\nImprove content',
      },
    ]);

    expect(result.sidebar).toEqual([
      { title: 'Overview', slug: 'overview', children: [] },
      { title: 'Setup Guide', slug: 'setup-guide', children: [] },
      { title: 'Improvement Suggestions', slug: 'improvement-suggestions', children: [] },
    ]);
  });

  test('overwrites current docs while retaining previous generation history', async () => {
    const docsStore = new InMemoryDocumentationStoreStub();
    const docsHistoryStore = new InMemoryDocsHistoryStoreStub();

    const pipeline = createAIDocGenerationPipelineStub({
      aiClient: new OpenAICompatibleAIClientStub(),
      promptBuilder: new CodebaseDocPromptBuilderStub(),
      markdownFormatter: new MarkdownFormatterStub(),
      pageSplitter: new MarkdownPageSplitterStub(),
      sidebarGenerator: new SidebarGeneratorStub(),
      docsHistoryStore,
    });

    const service = createAIDocGenerationService({
      pipeline,
      docsStore,
      docsHistoryStore,
      model: 'test-model',
      suggestedDocStructure: ['overview', 'setup-guide'],
    });

    pipeline.aiClient.generateText = async () => ({
      projectId: 'project-1',
      model: 'test-model',
      generatedAt: '2026-01-01T00:00:00.000Z',
      content: '## Overview\n\nFirst docs',
    });

    const first = await service.generateDocs({
      projectId: 'project-1',
      compactContext: 'first context',
    });

    pipeline.aiClient.generateText = async () => ({
      projectId: 'project-1',
      model: 'test-model',
      generatedAt: '2026-01-01T00:00:01.000Z',
      content: '## Overview\n\nSecond docs',
    });

    const second = await service.generateDocs({
      projectId: 'project-1',
      compactContext: 'second context',
    });

    const current = await docsStore.getCurrentDocs('project-1');
    const history = await docsHistoryStore.listHistory('project-1');

    expect(first.version).toBe(1);
    expect(second.version).toBe(2);
    expect(current?.version).toBe(2);
    expect(current?.pages[0]?.content).toContain('Second docs');
    expect(history).toHaveLength(1);
    expect(history[0].version).toBe(1);
    expect(history[0].pages[0]?.content).toContain('First docs');
  });
});
