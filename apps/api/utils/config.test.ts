import { isAIProviderConfigured, isGeminiEmbeddingConfigured } from '../config';

describe('backend config helpers', () => {
  test('treats placeholder OpenAI API key as unconfigured', () => {
    expect(isAIProviderConfigured({ apiKey: 'changeme-openai-api-key' })).toBe(false);
  });

  test('treats real-looking OpenAI API key as configured', () => {
    expect(isAIProviderConfigured({ apiKey: 'sk-test-key' })).toBe(true);
  });

  test('treats Gemini embedding as configured only when API key is present', () => {
    expect(isGeminiEmbeddingConfigured({ apiKey: '' })).toBe(false);
    expect(isGeminiEmbeddingConfigured({ apiKey: 'test-gemini-key' })).toBe(true);
  });

  test('reads explicit database ssl flags from environment', () => {
    const originalDatabaseUrl = process.env.DATABASE_URL;
    const originalSslEnabled = process.env.DATABASE_SSL_ENABLED;
    const originalSslRejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED;
    const originalSslRootCert = process.env.DATABASE_SSL_ROOT_CERT;

    try {
      process.env.DATABASE_URL = 'postgres://example';
      process.env.DATABASE_SSL_ENABLED = 'true';
      process.env.DATABASE_SSL_REJECT_UNAUTHORIZED = 'false';
      process.env.DATABASE_SSL_ROOT_CERT = 'root-cert';

      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getBackendConfig: loadConfig } = require('../config') as typeof import('../config');
      const config = loadConfig();

      expect(config.database.sslEnabled).toBe(true);
      expect(config.database.sslRejectUnauthorized).toBe(false);
      expect(config.database.sslRootCert).toBe('root-cert');
    } finally {
      process.env.DATABASE_URL = originalDatabaseUrl;
      process.env.DATABASE_SSL_ENABLED = originalSslEnabled;
      process.env.DATABASE_SSL_REJECT_UNAUTHORIZED = originalSslRejectUnauthorized;
      process.env.DATABASE_SSL_ROOT_CERT = originalSslRootCert;
      jest.resetModules();
    }
  });
});
