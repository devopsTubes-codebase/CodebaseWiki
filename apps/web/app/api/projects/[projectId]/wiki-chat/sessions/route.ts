import {
  createDataResponse,
  initializePostgresSchema,
  PostgresProjectStore,
  PostgresWikiChatStore,
  toBackendErrorResponse,
} from '@codebase-wiki/api';
import { NextResponse } from 'next/server';
import { getRequiredSessionIdentity, UnauthorizedError } from '@/lib/auth/session';

export async function GET(_request: Request, context: { params: { projectId: string } }) {
  try {
    const identity = await getRequiredSessionIdentity();
    await initializePostgresSchema();
    const project = await new PostgresProjectStore().getProject(context.params.projectId);
    if (!project || project.ownership.ownerUserId !== identity.userId) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 });
    }

    const sessions = await new PostgresWikiChatStore().listSessions({
      projectId: context.params.projectId,
      userId: identity.userId,
    });
    return NextResponse.json(createDataResponse({ sessions }), { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required for this endpoint' } }, { status: 401 });
    }
    const response = toBackendErrorResponse(error, 'Failed to list Ask Wiki sessions');
    return NextResponse.json(response.body, { status: response.status });
  }
}

export async function POST(request: Request, context: { params: { projectId: string } }) {
  try {
    const identity = await getRequiredSessionIdentity();
    const body = (await request.json().catch(() => ({}))) as { title?: string };
    await initializePostgresSchema();
    const project = await new PostgresProjectStore().getProject(context.params.projectId);
    if (!project || project.ownership.ownerUserId !== identity.userId) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 });
    }

    const session = await new PostgresWikiChatStore().createSession({
      projectId: context.params.projectId,
      userId: identity.userId,
      title: body.title ?? 'New chat',
    });
    return NextResponse.json(createDataResponse({ session }), { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required for this endpoint' } }, { status: 401 });
    }
    const response = toBackendErrorResponse(error, 'Failed to create Ask Wiki session');
    return NextResponse.json(response.body, { status: response.status });
  }
}
