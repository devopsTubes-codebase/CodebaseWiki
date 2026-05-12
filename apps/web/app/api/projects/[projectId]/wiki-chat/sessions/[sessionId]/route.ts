import {
  createDataResponse,
  initializePostgresSchema,
  PostgresProjectStore,
  PostgresWikiChatStore,
  toBackendErrorResponse,
} from '@codebase-wiki/api';
import { NextResponse } from 'next/server';
import { getRequiredSessionIdentity, UnauthorizedError } from '@/lib/auth/session';

export async function DELETE(_request: Request, context: { params: { projectId: string; sessionId: string } }) {
  try {
    const identity = await getRequiredSessionIdentity();
    await initializePostgresSchema();
    const project = await new PostgresProjectStore().getProject(context.params.projectId);
    if (!project || project.ownership.ownerUserId !== identity.userId) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 });
    }

    await new PostgresWikiChatStore().deleteSession({
      projectId: context.params.projectId,
      userId: identity.userId,
      sessionId: context.params.sessionId,
    });
    return NextResponse.json(createDataResponse({ deleted: true }), { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required for this endpoint' } }, { status: 401 });
    }
    const response = toBackendErrorResponse(error, 'Failed to delete Ask Wiki session');
    return NextResponse.json(response.body, { status: response.status });
  }
}
