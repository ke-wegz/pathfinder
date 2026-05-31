/**
 * Re-exports shared client-side AI utilities.
 * LLM provider calls belong on the backend — see `backend/utils/aiProviderClient.js`.
 */
export { FORBIDDEN_PATTERNS, buildLocationContext } from '../utils/aiHelpers';
