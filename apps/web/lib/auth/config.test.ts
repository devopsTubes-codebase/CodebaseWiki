import assert from 'node:assert/strict';

describe('auth secure cookie policy', () => {
  test('enables secure cookies on https origins', () => {
    const originalNextauthUrl = process.env.NEXTAUTH_URL;

    try {
      process.env.NEXTAUTH_URL = 'https://wiki-team.hackathon.sev-2.com';
      jest.resetModules();

      const { resolveUseSecureCookies } = require('./config') as typeof import('./config');

      assert.equal(resolveUseSecureCookies(), true);
    } finally {
      process.env.NEXTAUTH_URL = originalNextauthUrl;
      jest.resetModules();
    }
  });

  test('keeps secure cookies disabled on http origins', () => {
    const originalNextauthUrl = process.env.NEXTAUTH_URL;

    try {
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      jest.resetModules();

      const { resolveUseSecureCookies } = require('./config') as typeof import('./config');

      assert.equal(resolveUseSecureCookies(), false);
    } finally {
      process.env.NEXTAUTH_URL = originalNextauthUrl;
      jest.resetModules();
    }
  });
});
