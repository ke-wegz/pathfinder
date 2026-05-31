/**
 * Language normalization and bilingual intent matching for AR/EN flows.
 */

const normalizeLanguage = (value) => {
  const language = String(value || '').trim().toLowerCase();

  if (language.startsWith('ar') || language === 'arabic' || language === 'العربية') {
    return 'ar';
  }

  if (language.startsWith('en') || language === 'english') {
    return 'en';
  }

  return 'en';
};

const getLanguageName = (languageCode) => (languageCode === 'ar' ? 'Arabic' : 'English');

/**
 * Unicode-aware trim that preserves Arabic diacritics (tashkeel) and combining marks.
 */
const safeTrim = (value) => {
  if (value == null) return '';
  return String(value).normalize('NFC').trim();
};

/**
 * Detect "continue interview" intent in EN or AR without requiring English-only keywords.
 */
const matchesContinueIntent = (text, language = 'en') => {
  const normalized = safeTrim(text).toLowerCase();
  if (!normalized) return false;

  if (/\bcontinue\b/.test(normalized)) return true;

  if (normalizeLanguage(language) === 'ar') {
    return /(متابعة|استمر|أكمل|اكمل|واصل)/.test(normalized);
  }

  return false;
};

/**
 * Detect "finish interview / get recommendations" intent in EN or AR.
 */
const matchesDoneIntent = (text, language = 'en') => {
  const normalized = safeTrim(text).toLowerCase();
  if (!normalized) return false;

  if (/\b(done|finish|complete|end)\b/.test(normalized)) return true;

  if (normalizeLanguage(language) === 'ar') {
    return /(تم|انتهيت|انهيت|خلص|انتهى|انهى|توصيات|انتقل)/.test(normalized);
  }

  return false;
};

module.exports = {
  normalizeLanguage,
  getLanguageName,
  safeTrim,
  matchesContinueIntent,
  matchesDoneIntent,
};
