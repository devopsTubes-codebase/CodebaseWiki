import assert from 'node:assert/strict';

import { classifyProjectsResponse } from './dashboardAuthView';

describe('dashboard auth response handling', () => {
  test('redirects to sign-in when project list returns 401', () => {
    assert.deepEqual(classifyProjectsResponse(401), {
      kind: 'redirect',
      target: '/auth/sign-in?callbackUrl=/dashboard',
    });
  });

  test('treats non-ok non-auth responses as load errors', () => {
    assert.deepEqual(classifyProjectsResponse(500), {
      kind: 'error',
      message: 'Could not load projects.',
    });
  });

  test('allows successful responses to continue normally', () => {
    assert.deepEqual(classifyProjectsResponse(200), { kind: 'ok' });
  });
});
