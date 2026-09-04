import { describe, it, expect } from 'vitest';
import { buildEditorConfig } from './runtimeConfig.js';

describe('buildEditorConfig', () => {
  it('omits an empty model so the default model is kept', () => {
    const config = buildEditorConfig({
      ai: { enabled: true, endpoint: 'https://example.test/v1/chat/completions', apiKey: 'k', model: '' },
    });
    expect(config.ai.enabled).toBe(true);
    expect('model' in config.ai).toBe(false);
  });

  it('passes a configured model through', () => {
    const config = buildEditorConfig({
      ai: { enabled: true, endpoint: 'https://example.test/v1/chat/completions', model: 'gpt-4o-mini' },
    });
    expect(config.ai.model).toBe('gpt-4o-mini');
  });

  it('enables AI without an API key for auth-less proxies', () => {
    const config = buildEditorConfig({
      ai: { enabled: true, endpoint: 'https://proxy.test/v1/messages', provider: 'anthropic' },
    });
    expect(config.ai).toMatchObject({ enabled: true, apiKey: '', provider: 'anthropic' });
  });

  it('disables AI when enabled is false', () => {
    expect(buildEditorConfig({ ai: { enabled: false, endpoint: 'x' } }).ai).toEqual({ enabled: false });
  });

  it('does not set ai when runtime config has none', () => {
    expect(buildEditorConfig({}).ai).toBeUndefined();
  });
});
