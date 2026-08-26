import { parse as parseYaml } from 'yaml';

/**
 * Runtime Configuration Loader
 *
 * Fetches /config.json at runtime for Docker deployments.
 * Falls back to defaults if not found (for editor.datacontract.com).
 *
 * Config schema matches the embed API - see CONFIGURATION.md
 */

/**
 * Load runtime config from /config.json
 * @returns {Promise<object>} Runtime config or empty object
 */
export async function loadRuntimeConfig() {
  let config = {};
  try {
    const response = await fetch('/config.json');
    if (response.ok) {
      config = await response.json();
      console.log('Loaded runtime config:', Object.keys(config));
    }
  } catch (e) {
    // Expected when no config.json exists (e.g., editor.datacontract.com)
  }

  // A customization.yaml served next to the app (see CUSTOMIZATION.md) is applied
  // unless config.json already carries customizations.
  if (config.customizations == null) {
    const customizations = await loadCustomizationYaml();
    if (customizations) {
      config = { ...config, customizations };
    }
  }

  return config;
}

/**
 * Fetch and parse /customization.yaml. Returns null when the file is missing,
 * unparseable, or not a customization document. SPA servers answer unknown paths
 * with index.html and a 200, so the content type and shape are checked as well.
 * @returns {Promise<object|null>}
 */
export async function loadCustomizationYaml() {
  try {
    const response = await fetch('/customization.yaml');
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) return null;

    const text = await response.text();
    const parsed = parseYaml(text);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!('dataContract' in parsed) && !('yamlFormat' in parsed)) {
      console.warn('customization.yaml ignored: expected top-level "dataContract" or "yamlFormat"');
      return null;
    }
    console.log('Loaded customization.yaml:', Object.keys(parsed));
    return parsed;
  } catch (e) {
    console.warn('Failed to load customization.yaml:', e.message);
    return null;
  }
}

/**
 * Build editor config from runtime config
 * Passes through config using same schema as embed API
 * @param {object} runtimeConfig - Config from /config.json
 * @returns {object} Editor config for App component
 */
export function buildEditorConfig(runtimeConfig) {
  const config = {};

  // Tests config - only include values that are explicitly set in runtime config
  // to avoid overwriting user's persisted settings with null values
  if (runtimeConfig.tests !== undefined) {
    config.tests = {
      enabled: runtimeConfig.tests.enabled ?? true,
    };
    // Only include URL if explicitly set (not null/undefined/empty)
    if (runtimeConfig.tests.dataContractCliApiServerUrl) {
      config.tests.dataContractCliApiServerUrl = runtimeConfig.tests.dataContractCliApiServerUrl;
    }
  }
  // Don't set config.tests at all if no runtime config - let persisted values remain

  // AI config - pass through directly
  if (runtimeConfig.ai !== undefined) {
    if (runtimeConfig.ai.enabled === false) {
      config.ai = { enabled: false };
    } else if (runtimeConfig.ai.endpoint && runtimeConfig.ai.apiKey) {
      config.ai = {
        enabled: true,
        provider: runtimeConfig.ai.provider || 'openai',
        endpoint: runtimeConfig.ai.endpoint,
        apiKey: runtimeConfig.ai.apiKey,
        model: runtimeConfig.ai.model,
        authHeader: runtimeConfig.ai.authHeader || 'bearer',
        headers: runtimeConfig.ai.headers || {},
      };
    }
  }
  // If runtimeConfig.ai is undefined, don't set config.ai
  // This lets store.js defaults be used for editor.datacontract.com

  // Customizations - pass through directly, or explicitly clear persisted value
  config.customizations = runtimeConfig.customizations || null;

  return config;
}
