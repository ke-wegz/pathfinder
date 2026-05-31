/**
 * @deprecated Use `require('../utils/aiProviderClient')` for all LLM calls.
 * Kept for backward compatibility if any script still imports this module.
 */
const { generateAIResponse } = require('../utils/aiProviderClient');

module.exports = { generateAIResponse };
