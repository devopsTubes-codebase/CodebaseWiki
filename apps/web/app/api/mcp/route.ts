import {
  createDataResponse,
  createOpenAIClient,
  extractBearerToken,
  getBackendConfig,
  initializePostgresSchema,
  isAIProviderConfigured,
  MCPService,
  MCPTokenService,
  OpenAICompatibleAIClient,
  PostgresDocumentationStore,
  PostgresMCPTokenStore,
  PostgresVectorIndexStore,
  toBackendErrorResponse,
  type GroundedKnowledgeSource,
  type MCPToolName,
} from '@codebase-wiki/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await initializePostgresSchema();
    const body = (await request.json()) as {
      tool?: MCPToolName;
      arguments?: Record<string, unknown>;
      params?: { name?: MCPToolName; arguments?: Record<string, unknown> };
    };
    const tool = body.tool ?? body.params?.name;
    const toolArguments = body.arguments ?? body.params?.arguments ?? {};
    const projectId = String(toolArguments.projectId ?? '');
    if (!tool || !projectId) {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'tool and arguments.projectId are required' } }, { status: 400 });
    }

    const token = extractBearerToken(request.headers.get('authorization'));
    await new MCPTokenService({ store: new PostgresMCPTokenStore() }).verifyToken({ plaintextToken: token, projectId });

    const config = getBackendConfig();
    const aiClient = isAIProviderConfigured(config.ai) ? new OpenAICompatibleAIClient(createOpenAIClient()) : null;
    const mcp = new MCPService({
      getDocs: (inputProjectId) => new PostgresDocumentationStore().getDocumentation(inputProjectId),
      retrieveContext: (input) => new PostgresVectorIndexStore().retrieveContext(input),
      generateAnswer: async (input) => generateStatelessAnswer({ ...input, aiClient, model: config.ai.model }),
    });

    const result = await mcp.callTool({
      projectId,
      tool,
      arguments: toolArguments,
    });
    return NextResponse.json(createDataResponse(result), { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid or revoked MCP token') {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'MCP token is not scoped to this project') {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: error.message } }, { status: 403 });
    }
    const response = toBackendErrorResponse(error, 'MCP request failed');
    return NextResponse.json(response.body, { status: response.status });
  }
}

async function generateStatelessAnswer(input: {
  projectId: string;
  question: string;
  context: string;
  sources: GroundedKnowledgeSource[];
  aiClient: OpenAICompatibleAIClient | null;
  model: string;
}) {
  const sources = input.sources.filter((source) => source.excerpt.trim()).slice(0, 5);
  if (!input.context.trim() || sources.length === 0) {
    return {
      content: "I couldn't find enough indexed documentation to answer that.",
      sources: [],
    };
  }
  if (!input.aiClient) {
    return {
      content: 'I found relevant indexed documentation, but AI answer generation is not configured. Review the cited sources.',
      sources,
    };
  }
  const response = await input.aiClient.generateText({
    projectId: input.projectId,
    model: input.model,
    temperature: 0,
    maxTokens: 800,
    messages: [
      {
        role: 'system',
        content: [
          'You are an MCP docs assistant for Codebase Wiki.',
          'Answer only from the retrieved context.',
          'Start with one short direct sentence.',
          'Use bullets for multiple facts.',
          'Wrap endpoints, file paths, symbols, and commands in inline code.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: [`Question: ${input.question}`, '', 'Context:', input.context].join('\n'),
      },
    ],
  });
  return { content: response.content.trim(), sources };
}
