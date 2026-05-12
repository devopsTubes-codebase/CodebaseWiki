import {
  initializePostgresSchema,
  PostgresJobLogStore,
  PostgresProjectStore,
  toBackendErrorResponse,
  toJobLogsResponse,
} from '@codebase-wiki/api';
import { NextResponse } from 'next/server';
import { getRequiredSessionIdentity, UnauthorizedError } from '@/lib/auth/session';

export async function GET(request: Request, context: { params: { projectId: string } }) {
  try {
    const identity = await getRequiredSessionIdentity();
    await initializePostgresSchema();

    const project = await new PostgresProjectStore().getProject(context.params.projectId);
    if (!project || project.ownership.ownerUserId !== identity.userId) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 });
    }

    const url = new URL(request.url);
    const afterId = url.searchParams.get('afterId') ?? undefined;
    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined;
    const logs = await new PostgresJobLogStore().listLogs({ projectId: project.id, afterId, limit });

    return NextResponse.json(toJobLogsResponse(project.id, logs), { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required for this endpoint' } }, { status: 401 });
    }

    const response = toBackendErrorResponse(error, 'Failed to fetch project logs');
    return NextResponse.json(response.body, { status: response.status });
  }
}
