const { normalizeLanguage } = require('../../utils/languageUtils');
const { buildLocalizationBlock } = require('../../utils/aiLocalization');

exports.getCVPrompt = (profile, recommendations) => {
  const lang = normalizeLanguage(profile?.language);
  const targetLanguage = lang === 'ar' ? 'Arabic' : 'English';
  const profileStr = JSON.stringify(profile || {}, null, 2);
  const recsStr = JSON.stringify(recommendations || [], null, 2);

  return `
You are an expert resume writer and career coach. Generate a professional CV/resume from the user profile and career recommendations below.

User Profile (reference data — do not translate JSON keys if you echo structure):
${profileStr}

Career Recommendations:
${recsStr}

${buildLocalizationBlock(targetLanguage)}

Requirements:
- Extract and infer relevant experience, education, and skills.
- Tone: highly professional, impactful, tailored to the top career recommendation when available.
- CRITICAL: Write every string VALUE in ${targetLanguage}. JSON keys below MUST stay in English exactly as written.

Structure your response STRICTLY as a JSON object with this schema (keys in English, values in ${targetLanguage}):
{
  "summary": "A strong, professional summary statement (2-3 sentences).",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "e.g., 2020 - Present",
      "points": [
        "Action-oriented bullet point",
        "Another bullet point"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "Graduation Year",
      "description": "Optional brief description"
    }
  ],
  "skills": {
    "technical": ["Skill 1", "Skill 2"],
    "soft": ["Skill A", "Skill B"]
  },
  "languages": ["Language 1", "Language 2"],
  "certifications": ["Certification 1"]
}

If the profile is sparse, infer reasonable professional defaults — keep them realistic.
Return raw JSON only. No markdown fences.
  `.trim();
};
