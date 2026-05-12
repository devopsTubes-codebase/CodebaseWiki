import {
  createDataResponse,
  initializePostgresSchema,
  MCPTokenService,
  PostgresMCPTokenStore,
  PostgresProjectStore,
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
    const tokens = await new MCPTokenService({ store: new PostgresMCPTokenStore() }).listTokens({
      projectId: context.params.projectId,
      userId: identity.userId,
    });
    return NextResponse.json(createDataResponse({ tokens }), { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required for this endpoint' } }, { status: 401 });
    }
    const response = toBackendErrorResponse(error, 'Failed to list MCP tokens');
    return NextResponse.json(response.body, { status: response.status });
  }
}

export async function POST(request: Request, context: { params: { projectId: string } }) {
  try {
    const identity = await getRequiredSessionIdentity();
    const body = (await request.json().catch(() => ({}))) as { name?: string };
    await initializePostgresSchema();
    const project = await new PostgresProjectStore().getProject(context.params.projectId);
    if (!project || project.ownership.ownerUserId !== identity.userId) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 });
    }
    const result = await new MCPTokenService({ store: new PostgresMCPTokenStore() }).createToken({
      projectId: context.params.projectId,
      userId: identity.userId,
      name: body.name ?? 'Coding agent',
    });
    return NextResponse.json(createDataResponse(result), { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required for this endpoint' } }, { status: 401 });
    }
    const response = toBackendErrorResponse(error, 'Failed to create MCP token');
    return NextResponse.json(response.body, { status: response.status });
  }
}
