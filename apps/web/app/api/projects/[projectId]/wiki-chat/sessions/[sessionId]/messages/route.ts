import {
  createDataResponse,
  createOpenAIClient,
  getBackendConfig,
  initializePostgresSchema,
  isAIProviderConfigured,
  OpenAICompatibleAIClient,
  PostgresProjectStore,
  PostgresVectorIndexStore,
  PostgresWikiChatStore,
  toBackendErrorResponse,
  WikiChatService,
} from '@codebase-wiki/api';
import { NextResponse } from 'next/server';
import { getRequiredSessionIdentity, UnauthorizedError } from '@/lib/auth/session';

export async function GET(_request: Request, context: { params: { projectId: string; sessionId: string } }) {
  try {
    const identity = await getRequiredSessionIdentity();
    await initializePostgresSchema();
    const project = await new PostgresProjectStore().getProject(context.params.projectId);
    if (!project || project.ownership.ownerUserId !== identity.userId) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 });
    }

    const store = new PostgresWikiChatStore();
    const session = await store.getSession({
      projectId: context.params.projectId,
      userId: identity.userId,
      sessionId: context.params.sessionId,
    });
    if (!session) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, { status: 404 });
    }
    const messages = await store.listMessages({
      projectId: context.params.projectId,
      userId: identity.userId,
      sessionId: context.params.sessionId,
    });
    return NextResponse.json(createDataResponse({ session, messages }), { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required for this endpoint' } }, { status: 401 });
    }
    const response = toBackendErrorResponse(error, 'Failed to load Ask Wiki messages');
    return NextResponse.json(response.body, { status: response.status });
  }
}

export async function POST(request: Request, context: { params: { projectId: string; sessionId: string } }) {
  try {
    const identity = await getRequiredSessionIdentity();
    const body = (await request.json()) as { question?: string };
    await initializePostgresSchema();
    const project = await new PostgresProjectStore().getProject(context.params.projectId);
    if (!project || project.ownership.ownerUserId !== identity.userId) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 });
    }

    const config = getBackendConfig();
    const store = new PostgresWikiChatStore();
    const service = new WikiChatService({
      store,
      retrieveContext: (input) => new PostgresVectorIndexStore().retrieveContext(input),
      aiClient: isAIProviderConfigured(config.ai)
        ? new OpenAICompatibleAIClient(createOpenAIClient())
        : {
            async generateText(input) {
              return {
                projectId: input.projectId,
                model: input.model,
                generatedAt: new Date().toISOString(),
                content: 'I found relevant indexed documentation, but AI answer generation is not configured. Review the cited sources for the grounded context.',
              };
            },
          },
      model: config.ai.model,
    });
    const result = await service.sendMessage({
      projectId: context.params.projectId,
      userId: identity.userId,
      sessionId: context.params.sessionId,
      question: body.question ?? '',
    });
    return NextResponse.json(createDataResponse(result), { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required for this endpoint' } }, { status: 401 });
    }
    const response = toBackendErrorResponse(error, 'Failed to send Ask Wiki message');
    return NextResponse.json(response.body, { status: response.status });
  }
}
