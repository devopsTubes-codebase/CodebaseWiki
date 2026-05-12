import {
  InMemoryJobLogStore,
  JobLogger,
  toJobLogsResponse,
} from './index';
import { PostgresJobLogStore } from '../postgres';

describe('job logs', () => {
  it('persists sanitized terminal-style logs in creation order with afterId support', async () => {
    const store = new InMemoryJobLogStore();
    const logger = new JobLogger({ projectId: 'project-1', store });

    const first = await logger.info('cloning', 'Cloning repository', {
      authorization: 'secret authorization header',
      fileCount: 11,
    });
    await logger.info('scanning', 'Found 11 files', { fileCount: 11 });

    const logs = await store.listLogs({ projectId: 'project-1' });
    expect(logs.map((log) => log.phase)).toEqual(['cloning', 'scanning']);
    expect(JSON.stringify(logs)).not.toContain('secret authorization header');
    expect(logs[0]).toMatchObject({
      id: first.id,
      projectId: 'project-1',
      level: 'info',
      phase: 'cloning',
      message: 'Cloning repository',
      metadata: { authorization: '[REDACTED]', fileCount: 11 },
    });

    const incremental = await store.listLogs({ projectId: 'project-1', afterId: first.id });
    expect(incremental).toHaveLength(1);
    expect(incremental[0].phase).toBe('scanning');
  });

  it('formats logs for API retrieval', async () => {
    const store = new InMemoryJobLogStore();
    const logger = new JobLogger({ projectId: 'project-api', store });
    await logger.error('failed', 'Generation failed', { errorCode: 'AI_FAILURE' });

    const response = toJobLogsResponse('project-api', await store.listLogs({ projectId: 'project-api' }));

    expect(response).toEqual({
      data: {
        projectId: 'project-api',
        logs: [
          expect.objectContaining({
            id: '1',
            level: 'error',
            phase: 'failed',
            message: 'Generation failed',
            metadata: { errorCode: 'AI_FAILURE' },
          }),
        ],
      },
    });
  });

  it('sanitizes logs before writing through PostgreSQL storage', async () => {
    const queries: Array<{ sql: string; params: unknown[] }> = [];
    const pool = {
      async query(sql: string, params: unknown[]) {
        queries.push({ sql, params });
        return {
          rows: [{
            id: '42',
            project_id: params[0],
            level: params[1],
            phase: params[2],
            message: params[3],
            metadata: JSON.parse(params[4] as string),
            created_at: '2026-05-12T00:00:00.000Z',
          }],
        };
      },
    };

    const log = await new PostgresJobLogStore(pool as never).appendLog({
      projectId: 'project-db',
      level: 'info',
      phase: 'cloning',
      message: 'Clone started',
      metadata: { rawSource: 'RAW_SOURCE_SECRET', safeCount: 3 },
    });

    expect(log.message).toBe('Clone started');
    expect(log.metadata).toEqual({ rawSource: '[REDACTED]', safeCount: 3 });
    expect(JSON.stringify(queries)).not.toContain('RAW_SOURCE_SECRET');
  });
});
