const { db, admin } = require('../../firebase');
const { generateAIResponse } = require('../../utils/aiProviderClient');

/**
 * Returns a list of localized Jordanian job listings, using cache or generating via AI.
 * @param {string} userId - The user's ID.
 * @param {boolean} forceRefresh - If true, regenerates via AI and ignores cache.
 * @returns {Promise<Array>}
 */
exports.getLocalizedJobs = async (userId, forceRefresh) => {
  const jobsDocRef = db.collection('jobs').doc(userId);

  // 1. Check cache first
  if (!forceRefresh) {
    try {
      const cachedDoc = await jobsDocRef.get();
      if (cachedDoc.exists) {
        const cachedData = cachedDoc.data();
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
        
        if (cachedData.updatedAt && cachedData.updatedAt.toDate().getTime() > twentyFourHoursAgo) {
          console.log(`[JOBS] Returning cached Jordanian job listings for user ${userId}`);
          return cachedData.jobs || [];
        }
      }
    } catch (cacheError) {
      console.error('[JOBS] Cache read error:', cacheError);
    }
  }

  // 2. Fetch User metadata and Career Recommendations to tailor the results
  let profileSkills = [];
  let userName = 'User';
  let recommendedTitles = [];

  try {
    const [userDoc, profileDoc, recsSnapshot] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('profiles').doc(userId).get(),
      db.collection('recommendations').where('userId', '==', userId).get()
    ]);

    if (userDoc.exists) {
      userName = userDoc.data().name || 'User';
    }

    if (profileDoc.exists) {
      profileSkills = profileDoc.data().skills || [];
    }

    recsSnapshot.forEach(doc => {
      const data = doc.data();
      if (Array.isArray(data.recommendations)) {
        data.recommendations.forEach(r => {
          if (r.title) recommendedTitles.push(r.title);
        });
      }
    });
  } catch (dbError) {
    console.error('[JOBS] Database fetch error:', dbError);
  }

  // If there are no recommendations, try parsing saved goals or skills as a fallback
  if (recommendedTitles.length === 0) {
    recommendedTitles = ['Software Engineer', 'UX Designer', 'Product Manager', 'Data Analyst', 'Marketing Specialist'];
  }

  // 3. Construct the localized AI prompt
  const systemPrompt = `You are an expert career advisory AI specializing in the Jordanian job market. 
Your goal is to generate exactly 6 highly realistic, true-to-life, and tailored job listings for a user named "${userName}" based in Jordan.

The user's skills are: ${JSON.stringify(profileSkills)}.
The user's recommended career paths are: ${JSON.stringify(recommendedTitles)}.

Ensure that:
1. **Local Context**: The listings MUST be located in Jordan (e.g., "Amman, Jordan", "Irbid, Jordan", "Zarqa, Jordan", "Aqaba, Jordan", or "Remote (Jordan)").
2. **Real Local Companies**: Use active, real Jordanian companies, banks, start-ups, or multinationals operating in Jordan (e.g. Zain Jordan, Orange Jordan, Umniah, Mawdoo3, Amazon Jordan, Expedia Jordan, Arab Bank, Housing Bank, Jeeran, Mixed Dimensions, Altibbi, Liwwa, or local tech startups).
3. **Realistic JOD Salaries**: Salaries must be represented in Jordanian Dinars (JOD) per month and reflect actual Jordanian job market rates. For example:
   - Entry Level: "500 JOD - 800 JOD" per month
   - Mid-Level: "900 JOD - 1500 JOD" per month
   - Senior/Lead: "1600 JOD - 2600 JOD" per month
   Do NOT use inflated US salaries (like $120k JOD) or standard US notations. Express them monthly in JOD.
4. **Jordanian Market Alignments**: Include typical requirements like degrees from local universities (e.g., PSUT, JU, JUST, AHU, GJU), bilingual Arabic/English proficiency, or standard local skills.
5. **JSON Schema**: Return ONLY a valid JSON array of job objects matching this JSON schema:
[
  {
    "id": "job-[unique-number]",
    "title": "Job Title (matching or highly relevant to user's recommendations/skills)",
    "company": "Company Name",
    "location": "City, Jordan",
    "type": "Full-time" | "Part-time" | "Contract" | "Remote" | "Internship",
    "experience": "Entry Level" | "Mid-Level" | "Senior" | "Lead",
    "salary": "Min JOD - Max JOD per month",
    "posted": "e.g., 2 days ago",
    "description": "Short 1-2 sentence description",
    "requirements": ["Skill 1", "Requirement 2", ...],
    "benefits": ["Benefit 1", "Benefit 2", ...],
    "logo": "🏢" | "🎨" | "📊" | "💻" | "📢" | "📦" | "📈" | "📋" | "💼" (choose the emoji key that best fits the job),
    "matchScore": [integer between 75 and 98 based on user's skill match]
  }
]

CRITICAL: Return ONLY a valid JSON array. Do not include any conversational preamble or markdown backticks outside the JSON.`;

  let jobsList = [];

  try {
    console.log(`[JOBS] Invoking AI to generate localized Jordanian jobs for ${userId}...`);
    const aiResponse = await generateAIResponse(systemPrompt, { jsonMode: true, tokenPreset: 'MEDIUM_JSON' });
    
    // Parse JSON
    const parsed = parseJsonFromText(aiResponse);
    if (Array.isArray(parsed) && parsed.length > 0) {
      jobsList = parsed;
    } else {
      console.warn('[JOBS] AI returned empty or invalid JSON array. Falling back.');
      jobsList = getFallbackJobs(recommendedTitles);
    }
  } catch (aiError) {
    console.error('[JOBS] AI generation failed. Falling back to pre-defined listings:', aiError);
    jobsList = getFallbackJobs(recommendedTitles);
  }

  // 4. Cache listings in Firestore jobs collection
  try {
    await jobsDocRef.set({
      userId,
      jobs: jobsList,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`[JOBS] Successfully cached new job listings for user ${userId}`);
  } catch (writeError) {
    console.error('[JOBS] Firestore cache write failed:', writeError);
  }

  return jobsList;
};

/**
 * Parses JSON from a model output text, handling potential code block annotations.
 */
function parseJsonFromText(text) {
  if (!text) return null;
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/```\s*([\s\S]*?)```/) || text.match(/[\{\[][\s\S]*[\}\]]/);
  if (!jsonMatch) return null;

  let jsonString = jsonMatch[1] || jsonMatch[0];
  jsonString = jsonString.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('Error parsing JSON from text:', err);
    return null;
  }
}

/**
 * High-fidelity fallback Jordanian job listings to guarantee system reliability.
 */
function getFallbackJobs(recommendedTitles) {
  const primaryTitle = recommendedTitles[0] || 'Software Engineer';
  const secondaryTitle = recommendedTitles[1] || 'UI/UX Designer';

  return [
    {
      id: "fallback-1",
      title: `Junior ${primaryTitle}`,
      company: "Mawdoo3",
      location: "Amman, Jordan",
      type: "Full-time",
      experience: "Entry Level",
      salary: "600 JOD - 850 JOD per month",
      posted: "1 day ago",
      description: "Join the leading Arabic content platform to develop next-generation digital products. Ideal for tech graduates looking to scale.",
      requirements: ["Familiarity with standard tech/business stacks", "Excellent problem solving", "Bachelors in Computer Science, IT, or business equivalents", "Strong command of Arabic and English"],
      benefits: ["Comprehensive medical insurance", "Social security benefits", "Flexible office setups"],
      logo: "💻",
      matchScore: 92
    },
    {
      id: "fallback-2",
      title: `${secondaryTitle} Specialist`,
      company: "Zain Jordan",
      location: "Amman, Jordan",
      type: "Full-time",
      experience: "Mid-Level",
      salary: "1100 JOD - 1500 JOD per month",
      posted: "3 days ago",
      description: "Accelerate your career in telecommunications. Zain is seeking a dedicated professional to join our core operations division.",
      requirements: ["2-3 years of proven experience", "Strong communication and organizational skills", "Familiarity with local market dynamics", "Bilingual proficiency"],
      benefits: ["Social security and premium health coverage", "Annual performance bonuses", "Corporate perks"],
      logo: "🏢",
      matchScore: 88
    },
    {
      id: "fallback-3",
      title: `Senior ${primaryTitle}`,
      company: "Orange Jordan",
      location: "Amman, Jordan",
      type: "Full-time",
      experience: "Senior",
      salary: "1800 JOD - 2400 JOD per month",
      posted: "2 days ago",
      description: "Take the lead in building dynamic enterprise products. Coordinate with product managers to deliver state-of-the-art solutions.",
      requirements: ["5+ years of software/business engineering", "Experience leading small to mid-sized teams", "PSUT, JU, or JUST engineering graduate preferred", "Excellent bilingual communication skills"],
      benefits: ["Premium medical and dental care", "Paid learning budgets", "Gym memberships"],
      logo: "💻",
      matchScore: 84
    },
    {
      id: "fallback-4",
      title: "Solutions Architect",
      company: "Amazon Jordan",
      location: "Amman, Jordan",
      type: "Full-time",
      experience: "Lead",
      salary: "2200 JOD - 3000 JOD per month",
      posted: "1 week ago",
      description: "Support key cloud infrastructures across the Middle East. Work closely with regional developers to build secure, robust environments.",
      requirements: ["6+ years relevant industry experience", "Deep knowledge of system designs and integrations", "Strong English command", "Familiarity with local startup hubs"],
      benefits: ["Global salary benefits", "Excellent career pathing", "Flexible work options"],
      logo: "🏢",
      matchScore: 81
    },
    {
      id: "fallback-5",
      title: "Digital Marketing Executive",
      company: "Umniah",
      location: "Amman, Jordan",
      type: "Full-time",
      experience: "Mid-Level",
      salary: "900 JOD - 1200 JOD per month",
      posted: "5 days ago",
      description: "Manage digital marketing and brand campaigns across mobile products. Optimize advertisement funnels to drive conversion rates.",
      requirements: ["3+ years of experience in digital ads", "Strong analytics and performance marketing knowledge", "Arabic native with excellent English"],
      benefits: ["Social security & health package", "Learning budgets", "Annual bonuses"],
      logo: "📢",
      matchScore: 79
    }
  ];
}
