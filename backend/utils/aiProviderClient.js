const axios = require('axios');

/** Completion token presets — keep reservations aligned with expected output size. */
const TOKEN_PRESETS = {
  SHORT_JSON: 384,
  MEDIUM_JSON: 2048,
};

const LARGE_JSON_BASE = 800;
const LARGE_JSON_PER_REC = 1200;
const LARGE_JSON_CAP = 8192;

const DEFAULT_TIMEOUT_MS = 45_000;
const LARGE_TIMEOUT_MS = 90_000;

const MAX_RETRIES_PER_PROVIDER = 2;
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

const PROVIDERS = [
  {
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    keyEnv: 'GROQ_API_KEY',
    model: 'llama-3.3-70b-versatile',
  },
  {
    name: 'Cerebras',
    url: 'https://api.cerebras.ai/v1/chat/completions',
    keyEnv: 'CEREBRAS_API_KEY',
    model: 'llama-3.3-70b',
  },
  {
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    model: 'google/gemini-2.5-flash',
    extraHeaders: {
      'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:5000',
      'X-Title': process.env.OPENROUTER_APP_TITLE || 'Pathfinder AI',
    },
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const resolveMaxTokens = (options = {}) => {
  if (typeof options.maxTokens === 'number' && options.maxTokens > 0) {
    return Math.min(options.maxTokens, LARGE_JSON_CAP);
  }

  if (options.tokenPreset === 'MEDIUM_JSON') {
    return TOKEN_PRESETS.MEDIUM_JSON;
  }

  if (options.tokenPreset === 'SHORT_JSON' || options.tokenPreset == null) {
    if (typeof options.recommendationCount === 'number') {
      const count = Math.max(1, Math.min(5, options.recommendationCount));
      return Math.min(
        LARGE_JSON_BASE + count * LARGE_JSON_PER_REC,
        LARGE_JSON_CAP
      );
    }
    return TOKEN_PRESETS.SHORT_JSON;
  }

  if (typeof options.recommendationCount === 'number') {
    const count = Math.max(1, Math.min(5, options.recommendationCount));
    return Math.min(LARGE_JSON_BASE + count * LARGE_JSON_PER_REC, LARGE_JSON_CAP);
  }

  return TOKEN_PRESETS.SHORT_JSON;
};

const resolveTimeoutMs = (maxTokens) =>
  maxTokens > TOKEN_PRESETS.MEDIUM_JSON ? LARGE_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;

const parseRetryAfterMs = (headers = {}) => {
  const raw =
    headers['retry-after'] ??
    headers['Retry-After'] ??
    headers['x-ratelimit-reset-requests'] ??
    headers['x-ratelimit-reset-tokens'];

  if (raw == null) return null;

  const seconds = Number(raw);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds < 10_000 ? seconds * 1000 : null;
  }

  const dateMs = Date.parse(raw);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, dateMs - Date.now());
  }

  return null;
};

const logRateLimitHeaders = (providerName, headers = {}) => {
  const remaining =
    headers['x-ratelimit-remaining-requests'] ??
    headers['x-ratelimit-remaining-tokens'] ??
    headers['x-ratelimit-remaining'];

  if (remaining != null) {
    console.warn(`[AI] ${providerName} rate-limit remaining: ${remaining}`);
  }
};

const isRetryableError = (error) => {
  const status = error.response?.status;
  if (status && RETRYABLE_STATUSES.has(status)) return true;
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return true;
  return false;
};

const backoffDelayMs = (attempt, retryAfterMs) => {
  if (retryAfterMs != null && retryAfterMs > 0) {
    return Math.min(retryAfterMs, 60_000);
  }
  return Math.min(1000 * 2 ** attempt, 16_000);
};

const callProviderOnce = async (provider, requestBody, timeoutMs) => {
  const apiKey = process.env[provider.keyEnv];
  if (!apiKey) {
    return { skipped: true, reason: 'missing_key' };
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    ...(provider.extraHeaders || {}),
  };

  const response = await axios.post(provider.url, requestBody, {
    headers,
    timeout: timeoutMs,
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    const err = new Error(
      response.data?.error?.message ||
        `HTTP ${response.status} from ${provider.name}`
    );
    err.response = response;
    throw err;
  }

  logRateLimitHeaders(provider.name, response.headers);

  const content = response.data?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    const err = new Error(`Empty completion from ${provider.name}`);
    err.emptyResponse = true;
    throw err;
  }

  return { content, provider };
};

const callProviderWithRetries = async (provider, requestBody, timeoutMs) => {
  const apiKey = process.env[provider.keyEnv];
  if (!apiKey) {
    console.warn(`[AI] Skipping ${provider.name}: no ${provider.keyEnv} in .env`);
    return null;
  }

  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES_PER_PROVIDER; attempt++) {
    try {
      const result = await callProviderOnce(provider, requestBody, timeoutMs);
      if (result.skipped) return null;
      console.log(`[AI] Success via ${provider.name} (${provider.model})`);
      return result.content;
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const message =
        error.response?.data?.error?.message || error.message;
      console.warn(
        `[AI] ${provider.name} attempt ${attempt + 1} failed:`,
        status ? `HTTP ${status} — ${message}` : message
      );

      if (status === 401) {
        const authErr = new Error(
          'API keys are missing, expired, or invalid (401). Check backend .env.'
        );
        authErr.status = 401;
        throw authErr;
      }

      if (error.emptyResponse) break;

      const canRetry =
        attempt < MAX_RETRIES_PER_PROVIDER && isRetryableError(error);

      if (!canRetry) break;

      const retryAfterMs = parseRetryAfterMs(error.response?.headers || {});
      const delay = backoffDelayMs(attempt, retryAfterMs);
      console.warn(`[AI] Retrying ${provider.name} in ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
};

/**
 * Call Groq → Cerebras → OpenRouter with per-provider retries and dynamic max_tokens.
 *
 * @param {string} prompt
 * @param {{ jsonMode?: boolean, maxTokens?: number, tokenPreset?: 'SHORT_JSON'|'MEDIUM_JSON', recommendationCount?: number }} options
 */
const generateAIResponse = async (prompt, options = {}) => {
  const { jsonMode = false } = options;
  const maxTokens = resolveMaxTokens(options);
  const timeoutMs = resolveTimeoutMs(maxTokens);

  const requestBody = {
    messages: [{ role: 'system', content: prompt }],
    max_tokens: maxTokens,
    temperature: maxTokens <= TOKEN_PRESETS.SHORT_JSON ? 0.4 : 0.6,
  };

  if (jsonMode) {
    requestBody.response_format = { type: 'json_object' };
  }

  const errors = [];
  let sawAuthError = false;

  for (const provider of PROVIDERS) {
    const body = { ...requestBody, model: provider.model };

    try {
      const content = await callProviderWithRetries(provider, body, timeoutMs);
      if (content) return content;
    } catch (error) {
      if (error.status === 401) sawAuthError = true;
      errors.push({ provider: provider.name, message: error.message });
    }
  }

  if (sawAuthError) {
    throw new Error(
      'API keys are missing, expired, or invalid (401). Check backend .env.'
    );
  }

  const detail = errors.map((e) => `${e.provider}: ${e.message}`).join('; ');
  throw new Error(
    detail
      ? `AI service unavailable. All providers failed. ${detail}`
      : 'AI service unavailable. No provider API keys configured in backend .env.'
  );
};

module.exports = {
  generateAIResponse,
  TOKEN_PRESETS,
  resolveMaxTokens,
};
