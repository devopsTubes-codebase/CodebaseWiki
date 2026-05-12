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

export async function DELETE(_request: Request, context: { params: { projectId: string; tokenId: string } }) {
  try {
    const identity = await getRequiredSessionIdentity();
    await initializePostgresSchema();
    const project = await new PostgresProjectStore().getProject(context.params.projectId);
    if (!project || project.ownership.ownerUserId !== identity.userId) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 });
    }
    await new MCPTokenService({ store: new PostgresMCPTokenStore() }).revokeToken({
      projectId: context.params.projectId,
      userId: identity.userId,
      tokenId: context.params.tokenId,
    });
    return NextResponse.json(createDataResponse({ revoked: true }), { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required for this endpoint' } }, { status: 401 });
    }
    const response = toBackendErrorResponse(error, 'Failed to revoke MCP token');
    return NextResponse.json(response.body, { status: response.status });
  }
}
