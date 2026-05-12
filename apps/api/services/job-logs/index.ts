import type {
  AppendJobLogInput,
  JobLog,
  JobLogLevel,
  JobLogPhase,
  JobLogsResponse,
  JobLogStoreContract,
  ListJobLogsInput,
} from '../../types';
import { sanitizeForLogging } from '../../utils';

const DEFAULT_LOG_LIMIT = 100;
const MAX_LOG_LIMIT = 500;

export class JobLogger {
  constructor(private readonly input: { projectId: string; store: JobLogStoreContract }) {}

  info(phase: JobLogPhase, message: string, metadata?: Record<string, unknown>): Promise<JobLog> {
    return this.append('info', phase, message, metadata);
  }

  warn(phase: JobLogPhase, message: string, metadata?: Record<string, unknown>): Promise<JobLog> {
    return this.append('warn', phase, message, metadata);
  }

  error(phase: JobLogPhase, message: string, metadata?: Record<string, unknown>): Promise<JobLog> {
    return this.append('error', phase, message, metadata);
  }

  debug(phase: JobLogPhase, message: string, metadata?: Record<string, unknown>): Promise<JobLog> {
    return this.append('debug', phase, message, metadata);
  }

  queued(message = 'Project processing queued', metadata?: Record<string, unknown>): Promise<JobLog> {
    return this.info('queued', message, metadata);
  }

  completed(message = 'Project processing completed', metadata?: Record<string, unknown>): Promise<JobLog> {
    return this.info('completed', message, metadata);
  }

  failed(errorCode: string, metadata?: Record<string, unknown>): Promise<JobLog> {
    return this.error('failed', 'Project processing failed', { ...metadata, errorCode });
  }

  private append(
    level: JobLogLevel,
    phase: JobLogPhase,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<JobLog> {
    return this.input.store.appendLog({
      projectId: this.input.projectId,
      level,
      phase,
      message,
      metadata,
    });
  }
}

export class InMemoryJobLogStore implements JobLogStoreContract {
  private readonly logs: JobLog[] = [];
  private nextId = 1;

  async appendLog(input: AppendJobLogInput): Promise<JobLog> {
    const log = sanitizeJobLog({
      id: String(this.nextId),
      projectId: input.projectId,
      level: input.level,
      phase: input.phase,
      message: input.message,
      metadata: input.metadata ?? {},
      createdAt: new Date().toISOString(),
    });
    this.nextId += 1;
    this.logs.push(log);
    return log;
  }

  async listLogs(input: ListJobLogsInput): Promise<JobLog[]> {
    const limit = normalizeLogLimit(input.limit);
    const afterId = input.afterId ? Number(input.afterId) : 0;
    return this.logs
      .filter((log) => log.projectId === input.projectId)
      .filter((log) => Number(log.id) > afterId)
      .slice(0, limit);
  }

  snapshot(projectId?: string): JobLog[] {
    return projectId ? this.logs.filter((log) => log.projectId === projectId) : [...this.logs];
  }
}

export function sanitizeJobLog(log: JobLog): JobLog {
  return {
    ...log,
    message: sanitizeForLogging(log.message),
    metadata: sanitizeForLogging(log.metadata),
  };
}

export function normalizeLogLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit) || limit < 1) return DEFAULT_LOG_LIMIT;
  return Math.min(Math.floor(limit), MAX_LOG_LIMIT);
}

export function toJobLogsResponse(projectId: string, logs: JobLog[]): JobLogsResponse {
  return {
    data: {
      projectId,
      logs,
    },
  };
}
