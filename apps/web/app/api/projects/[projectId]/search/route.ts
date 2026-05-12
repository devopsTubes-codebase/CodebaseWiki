import {
  createDataResponse,
  initializePostgresSchema,
  PostgresProjectStore,
  PostgresVectorIndexStore,
  toBackendErrorResponse,
} from '@codebase-wiki/api';
import { NextResponse } from 'next/server';
import { getRequiredSessionIdentity, UnauthorizedError } from '@/lib/auth/session';

export async function POST(request: Request, context: { params: { projectId: string } }) {
  try {
    const identity = await getRequiredSessionIdentity();
    const body = (await request.json()) as { query?: string; maxResults?: number };
    await initializePostgresSchema();
    const project = await new PostgresProjectStore().getProject(context.params.projectId);

    if (!project || project.ownership.ownerUserId !== identity.userId) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 });
    }

    const result = await new PostgresVectorIndexStore().retrieveContext({
      projectId: context.params.projectId,
      query: body.query?.trim() || 'documentation',
      maxResults: body.maxResults ?? 5,
      allowedSources: ['vector-index', 'codebase-summary'],
    });

    return NextResponse.json(createDataResponse({
      ...result,
      results: result.sources.map((source) => ({
        title: source.title ?? (source.source === 'codebase-summary' ? 'Project summary' : source.reference.replace(/^vector-index:/, '')),
        pageSlug: source.pageSlug,
        excerpt: source.excerpt,
        source: source.source,
        relevanceScore: source.relevanceScore,
        href: source.pageSlug ? `/docs/${context.params.projectId}/${source.pageSlug}` : `/docs/${context.params.projectId}`,
      })),
    }), { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required for this endpoint' } }, { status: 401 });
    }

    const response = toBackendErrorResponse(error, 'Failed to retrieve search context');
    return NextResponse.json(response.body, { status: response.status });
  }
}
