import {
  initializePostgresSchema,
  PostgresJobLogStore,
  PostgresProjectStore,
  toBackendErrorResponse,
} from '@codebase-wiki/api';
import { NextResponse } from 'next/server';
import { getRequiredSessionIdentity, UnauthorizedError } from '@/lib/auth/session';

const POLL_INTERVAL_MS = 1000;
const MAX_STREAM_POLLS = 300;

export async function GET(_request: Request, context: { params: { projectId: string } }) {
  try {
    const identity = await getRequiredSessionIdentity();
    await initializePostgresSchema();

    const projectStore = new PostgresProjectStore();
    const project = await projectStore.getProject(context.params.projectId);
    if (!project || project.ownership.ownerUserId !== identity.userId) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 });
    }

    const logStore = new PostgresJobLogStore();
    const encoder = new TextEncoder();
    let afterId = '0';

    const stream = new ReadableStream({
      async start(controller) {
        for (let poll = 0; poll < MAX_STREAM_POLLS; poll += 1) {
          const logs = await logStore.listLogs({ projectId: project.id, afterId, limit: 100 });
          for (const log of logs) {
            afterId = log.id;
            controller.enqueue(encoder.encode(`event: job-log\ndata: ${JSON.stringify(log)}\n\n`));
          }

          const latestProject = await projectStore.getProject(project.id);
          if (latestProject?.status === 'completed' || latestProject?.status === 'failed') {
            controller.enqueue(encoder.encode(`event: terminal\ndata: ${JSON.stringify({ status: latestProject.status })}\n\n`));
            controller.close();
            return;
          }

          await delay(POLL_INTERVAL_MS);
        }

        controller.close();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required for this endpoint' } }, { status: 401 });
    }

    const response = toBackendErrorResponse(error, 'Failed to stream project logs');
    return NextResponse.json(response.body, { status: response.status });
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
