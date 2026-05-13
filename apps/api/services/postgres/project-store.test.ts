import assert from 'node:assert/strict';

import { PostgresProjectStore } from './index';

describe('PostgresProjectStore', () => {
  test('reuses the newest matching github project and deletes older duplicates', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'project-newest',
            user_id: 'user-1',
            owner_user_id: 'user-1',
            created_by: 'user-1',
            name: 'sixth-proxy',
            source_type: 'github',
            source_input: 'https://github.com/hshinosa/sixth-proxy.git',
            status: 'completed',
            created_at: '2026-05-12T10:00:00.000Z',
            updated_at: '2026-05-12T11:00:00.000Z',
          },
          {
            id: 'project-older',
            user_id: 'user-1',
            owner_user_id: 'user-1',
            created_by: 'user-1',
            name: 'sixth-proxy',
            source_type: 'github',
            source_input: 'https://github.com/hshinosa/sixth-proxy',
            status: 'completed',
            created_at: '2026-05-12T08:00:00.000Z',
            updated_at: '2026-05-12T09:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'project-newest',
            user_id: 'user-1',
            owner_user_id: 'user-1',
            created_by: 'user-1',
            name: 'sixth-proxy',
            source_type: 'github',
            source_input: 'https://github.com/hshinosa/sixth-proxy.git/',
            status: 'queued',
            created_at: '2026-05-12T10:00:00.000Z',
            updated_at: '2026-05-13T01:00:00.000Z',
          },
        ],
      });

    const store = new PostgresProjectStore({ query } as never);
    const project = await store.createProject(
      { userId: 'user-1' },
      {
        name: 'sixth-proxy',
        sourceType: 'github',
        sourceInput: 'https://github.com/hshinosa/sixth-proxy.git/',
      },
    );

    assert.equal(project.id, 'project-newest');
    assert.equal(project.status, 'queued');
    expect(query).toHaveBeenNthCalledWith(2, 'delete from projects where id = any($1::text[])', [['project-older']]);
    expect(query).toHaveBeenNthCalledWith(
      3,
      'update projects set name=$2, source_input=$3, status=$4, updated_at=$5 where id=$1 returning *',
      ['project-newest', 'sixth-proxy', 'https://github.com/hshinosa/sixth-proxy.git/', 'queued', expect.any(String)],
    );
  });

  test('cleans up historical duplicate github projects during listing', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'project-newest',
            user_id: 'user-1',
            owner_user_id: 'user-1',
            created_by: 'user-1',
            name: 'sixth-proxy',
            source_type: 'github',
            source_input: 'https://github.com/hshinosa/sixth-proxy.git/',
            status: 'completed',
            created_at: '2026-05-12T10:00:00.000Z',
            updated_at: '2026-05-12T11:00:00.000Z',
          },
          {
            id: 'project-older',
            user_id: 'user-1',
            owner_user_id: 'user-1',
            created_by: 'user-1',
            name: 'sixth-proxy',
            source_type: 'github',
            source_input: 'https://github.com/hshinosa/sixth-proxy',
            status: 'completed',
            created_at: '2026-05-12T08:00:00.000Z',
            updated_at: '2026-05-12T09:00:00.000Z',
          },
          {
            id: 'project-other',
            user_id: 'user-1',
            owner_user_id: 'user-1',
            created_by: 'user-1',
            name: 'billing-api',
            source_type: 'github',
            source_input: 'https://github.com/hshinosa/billing-api',
            status: 'completed',
            created_at: '2026-05-12T07:00:00.000Z',
            updated_at: '2026-05-12T07:30:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] });

    const store = new PostgresProjectStore({ query } as never);
    const projects = await store.listProjects({ userId: 'user-1' });

    assert.deepEqual(
      projects.map((project) => project.id),
      ['project-newest', 'project-other'],
    );
    expect(query).toHaveBeenNthCalledWith(2, 'delete from projects where id = any($1::text[])', [['project-older']]);
  });
});
