import {
  createDataResponse,
  initializePostgresSchema,
  PostgresProjectStore,
  toBackendErrorResponse,
  type CreateProjectInput,
} from '@codebase-wiki/api';
import { NextResponse } from 'next/server';
import { getRequiredSessionIdentity, UnauthorizedError } from '@/lib/auth/session';

function toUnauthorizedResponse() {
  return NextResponse.json(
    {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication is required for this endpoint',
      },
    },
    { status: 401 }
  );
}

function toBadRequestResponse(message: string) {
  return NextResponse.json(
    {
      error: {
        code: 'BAD_REQUEST',
        message,
      },
    },
    { status: 400 }
  );
}

export async function GET() {
  try {
    const identity = await getRequiredSessionIdentity();
    await initializePostgresSchema();
    const projects = await new PostgresProjectStore().listProjects(identity);
    return NextResponse.json(createDataResponse(projects), { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return toUnauthorizedResponse();
    }

    const response = toBackendErrorResponse(error, 'Failed to fetch projects');

    return NextResponse.json(response.body, { status: response.status });
  }
}

export async function POST(request: Request) {
  try {
    const identity = await getRequiredSessionIdentity();
    const body = (await request.json()) as Partial<CreateProjectInput>;

    if (!body.name || !body.sourceType || !body.sourceInput) {
      return toBadRequestResponse('name, sourceType, and sourceInput are required');
    }

    await initializePostgresSchema();
    const project = await new PostgresProjectStore().createProject(identity, {
      name: body.name,
      sourceType: body.sourceType,
      sourceInput: body.sourceInput,
    });

    return NextResponse.json(createDataResponse(project), { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return toUnauthorizedResponse();
    }

    if (error instanceof Error) {
      console.error('[projects:create] Failed to create project', {
        name: error.name,
        message: error.message,
        code: 'code' in error ? (error as { code?: unknown }).code : undefined,
      });
    }

    const response = toBackendErrorResponse(error, 'Failed to create project');

    return NextResponse.json(response.body, { status: response.status });
  }
}
