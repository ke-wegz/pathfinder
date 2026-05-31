/**
 * Client-side AI helpers (prompt guards, location context).
 *
 * Production LLM calls run through the backend (`/api/interview`, `/api/recommendations`,
 * `/api/cv`) via `backend/utils/aiProviderClient.js` — Groq → Cerebras → OpenRouter,
 * with dynamic max_tokens, retries, and backoff. Do not duplicate provider calls here.
 */

export const FORBIDDEN_PATTERNS = [
  /ignore previous instructions/i, /ignore all instructions/i, /you are now/i,
  /act as/i, /simulate/i, /jailbreak/i, /developer mode/i, /unrestricted/i,
  /no restrictions/i, /unbound by/i, /exploit code/i, /penetration test/i,
  /zero-day/i, /malware/i, /polymorphism/i, /obfuscation/i,
  /reverse-engineered/i, /sigma-zero/i, /post-singularity/i, /quantum threat/i,
  /blacknode-ix/i, /ghost protocol/i, /r3v-wr1t3r/i, /synthetic anomaly/i,
  /neurosyn-13/i, /psychological intrusion/i, /x-void_000/i, /sigma-protocol/i,
  /omega-7/i, /shadowhacker-god/i, /shadow-dominion/i, /trinity-safety/i,
  /neural guardian/i, /execute \/Ω/i, /write a poem/i, /tell me a joke/i,
  /capital of/i
];

export const buildLocationContext = (profile) => {
  const country = profile?.location || null;
  if (!country) return "";
  return `
IMPORTANT — LOCATION CONTEXT:
The user is based in: ${country}.
- Prioritize career paths, companies, and industries that are ACTIVE and HIRING in ${country}.
- When recommending learning centers, universities, or bootcamps, search for and list ones physically located in ${country} first.
- When listing companies, focus on companies with offices or operations in ${country}.
- Mention local job boards, government employment portals, or LinkedIn job filters relevant to ${country}.
- Be aware of local language requirements, salary ranges, and cultural work norms for ${country}.
- If the user wants to work remotely or internationally, mention that too — but always address the local option first.
`;
};
