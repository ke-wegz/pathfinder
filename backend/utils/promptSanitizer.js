/**
 * Sanitize user input before passing it to LLM prompts (prompt-injection defense).
 * Pair with wrapUserContent() from aiLocalization.js for boundary tagging.
 */

const { wrapUserContent } = require('./aiLocalization');

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\0/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
};

/**
 * Sanitize and wrap user text for safe inclusion in system prompts.
 */
const sanitizeAndWrap = (input) => wrapUserContent(sanitizeInput(input));

module.exports = {
  sanitizeInput,
  sanitizeAndWrap,
};
