import { buildPostgresPoolConfig, initializePostgresSchema } from './index';

describe('buildPostgresPoolConfig', () => {
  test('leaves the connection string unchanged and disables explicit ssl by default', () => {
    const poolConfig = buildPostgresPoolConfig({
      database: {
        url: 'postgresql://user:pass@db.example.com:5432/codebase_wiki',
        sslEnabled: false,
        sslRejectUnauthorized: true,
        sslRootCert: '',
      },
    } as never);

    expect(poolConfig).toEqual({
      connectionString: 'postgresql://user:pass@db.example.com:5432/codebase_wiki',
    });
  });

  test('removes ssl query parameters and applies explicit ssl options when enabled', () => {
    const poolConfig = buildPostgresPoolConfig({
      database: {
        url: 'postgresql://user:pass@db.example.com:5432/codebase_wiki?sslmode=require&sslrootcert=%2Ftmp%2Froot.crt',
        sslEnabled: true,
        sslRejectUnauthorized: false,
        sslRootCert: 'test-root-ca',
      },
    } as never);

    expect(poolConfig).toEqual({
      connectionString: 'postgresql://user:pass@db.example.com:5432/codebase_wiki',
      ssl: {
        rejectUnauthorized: false,
        ca: 'test-root-ca',
      },
    });
  });
});

describe('initializePostgresSchema', () => {
  test('continues initializing non-vector tables when pgvector is unavailable', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const queries: string[] = [];
    const pool = {
      query: jest.fn(async (query: string) => {
        queries.push(query);
        if (query.includes('create extension if not exists vector')) {
          const error = new Error('extension "vector" is not available') as Error & { code: string };
          error.code = '0A000';
          throw error;
        }
        return { rows: [] };
      }),
    };

    try {
      await expect(initializePostgresSchema(pool as never)).resolves.toBeUndefined();
      expect(queries.some((query) => query.includes('create table if not exists projects'))).toBe(true);
      expect(queries.some((query) => query.includes('create table if not exists vector_chunks'))).toBe(false);
    } finally {
      warnSpy.mockRestore();
    }
  });
});
