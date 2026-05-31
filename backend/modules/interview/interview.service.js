const { db, admin } = require('../../firebase');
const { generateAIResponse } = require('../../utils/aiProviderClient');
const { getSystemPrompt, getLocalizationBlock } = require('./interview.prompt');
const { sanitizeInput } = require('../../utils/promptSanitizer');
const { formatConversationForPrompt } = require('../../utils/aiLocalization');
const {
  normalizeLanguage,
  matchesContinueIntent,
  matchesDoneIntent,
} = require('../../utils/languageUtils');
const userService = require('../users/user.service');

const parseJsonFromText = (text) => {
  if (!text) return null;
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/```\s*([\s\S]*?)```/) || text.match(/[\{\[][\s\S]*[\}\]]/);
  if (!jsonMatch) return null;

  let jsonString = jsonMatch[1] || jsonMatch[0];
  jsonString = jsonString.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    return null;
  }
};

const getLocaleText = (language, englishText, arabicText) => {
  return language === 'ar' ? arabicText : englishText;
};

const buildAssistantPrompt = (messages, questionCount, questionLimit, profile, language) => {
  const normalizedLanguage = normalizeLanguage(language);
  const conversation = formatConversationForPrompt(messages);

  let profileContext = '';
  if (profile) {
    const { education, experience, skills, interests } = profile;
    profileContext = `
User Profile Context (DO NOT ask trivial questions about these if they are clear and sufficient. IF they are gibberish, vague, or missing, ask for clarification):
- Education: ${JSON.stringify(education || [])}
- Experience: ${JSON.stringify(experience || '')}
- Skills: ${JSON.stringify(skills || [])}
- Interests: ${JSON.stringify(interests || [])}
`;
  }

  const targetLanguage = normalizedLanguage === 'ar' ? 'Arabic' : 'English';

  return `${getSystemPrompt(normalizedLanguage)}

${getLocalizationBlock(normalizedLanguage)}

This is question ${questionCount} of ${questionLimit}.

${profileContext}

Conversation so far:
${conversation}

Based on the Profile Context and the last user response inside <user_content> tags, ask ONE follow-up interview question. If the profile context contains sufficient clear information about education, experience, and skills, SKIP asking basic questions about them and focus on their specific career goals, location, preferred working style, or deeper technical nuances. If the profile data is missing, vague, or looks like random gibberish, politely ask for clarification.
CRITICAL: The "nextText" value MUST be entirely in ${targetLanguage}. JSON keys MUST stay in English.
Return ONLY valid JSON in the specified schema.`;
};

exports.startSession = async (userId, language = 'en') => {
  const sessionRef = db.collection('interview_sessions').doc();
  const normalizedLanguage = normalizeLanguage(language);

  const initialMessage = getLocaleText(
    normalizedLanguage,
    "Welcome to your PathFinder AI career interview! Before we begin, how many questions would you like me to ask you? You can choose anywhere between 5 and 20 questions. The more questions you answer, the more accurate your career recommendations will be.",
    "مرحباً بك في مقابلة PathFinder AI المهنية! قبل أن نبدأ، كم سؤالاً تريدني أن أطرح عليك؟ يمكنك اختيار أي عدد بين 5 و20 سؤالاً. كلما أجبت عن أسئلة أكثر، أصبحت توصياتك المهنية أدق."
  );

  const sessionData = {
    userId,
    messages: [
      { role: 'assistant', content: initialMessage }
    ],
    answers: [],
    completed: false,
    questionCount: 0,
    questionLimit: 10,
    timeline: null,
    recommendationCount: 3,
    phase: 'setup_limit',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await sessionRef.set(sessionData);
  return { sessionId: sessionRef.id, question: initialMessage, phase: 'setup_limit' };
};

exports.processMessage = async (userId, sessionId, userMessage) => {
  const sessionRef = db.collection('interview_sessions').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    throw new Error('Session not found');
  }

  const session = sessionDoc.data();
  if (session.userId !== userId) {
    throw new Error('Unauthorized');
  }
  if (session.completed) {
    throw new Error('Session already completed');
  }

  const sanitized = sanitizeInput(userMessage);
  const messages = session.messages || [];
  const answers = Array.isArray(session.answers) ? session.answers : [];

  messages.push({ role: 'user', content: sanitized });
  answers.push(sanitized);

  let userProfile = null;
  let userLanguage = 'en';
  try {
    userProfile = await userService.getUserProfile(userId);
    userLanguage = normalizeLanguage(userProfile?.language || 'en');
  } catch (err) {
    console.error('Error fetching user profile for interview:', err);
  }

  if (session.phase === 'setup_limit') {
    let limit = parseInt(sanitized.replace(/[^0-9]/g, ''), 10);
    if (isNaN(limit)) limit = 10;
    limit = Math.max(5, Math.min(20, limit));

    const nextCount = 1;
    const prompt = buildAssistantPrompt(messages, nextCount, limit, userProfile, userLanguage);
    const aiReply = await generateAIResponse(prompt, { jsonMode: true, tokenPreset: 'SHORT_JSON' });
    
    const parsed = parseJsonFromText(aiReply);
    const questionText = parsed?.nextText || parsed?.question || getLocaleText(userLanguage, "Could you tell me a bit about your background?", "هل يمكنك أن تخبرني قليلاً عن خلفيتك؟");

    const combinedReply = getLocaleText(
      userLanguage,
      `Great, I'll ask you ${limit} questions. Let's get started!\n\n${questionText}`,
      `رائع، سأطرح عليك ${limit} سؤالاً. لنبدأ!\n\n${questionText}`
    );
    messages.push({ role: 'assistant', content: combinedReply });

    await sessionRef.update({
      questionLimit: limit,
      phase: 'questioning',
      questionCount: nextCount,
      messages,
      answers,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { question: combinedReply, phase: 'questioning', questionCount: nextCount, questionLimit: limit };
  }

  if (session.phase === 'questioning') {
    if (session.questionCount >= session.questionLimit) {
      const newPhase = 'limit_reached';
      const msg = getLocaleText(
        userLanguage,
        `You've completed your ${session.questionLimit} questions! Would you like to continue with 5 more questions so I can learn even more about you, or shall we move on to generating your career recommendations?\nReply "continue" to add 5 more questions, or "done" to get your recommendations.`,
        `لقد أكملت ${session.questionLimit} سؤالاً! هل ترغب في المتابعة مع 5 أسئلة إضافية لأتعرف عليك أكثر، أم ننتقل إلى إنشاء توصياتك المهنية؟\nأجب بـ "متابعة" أو "continue" لإضافة 5 أسئلة أخرى، أو "تم" أو "done" للحصول على التوصيات.`
      );
      messages.push({ role: 'assistant', content: msg });
      
      await sessionRef.update({
        phase: newPhase,
        messages,
        answers,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { question: msg, phase: newPhase, questionCount: session.questionCount, questionLimit: session.questionLimit };
    } else {
      const nextCount = session.questionCount + 1;
      const prompt = buildAssistantPrompt(messages, nextCount, session.questionLimit, userProfile, userLanguage);
      const aiReply = await generateAIResponse(prompt, { jsonMode: true, tokenPreset: 'SHORT_JSON' });
      
      const parsed = parseJsonFromText(aiReply);
      const questionText = parsed?.nextText || parsed?.question || getLocaleText(
        userLanguage,
        'What else can you tell me about your career aspirations?',
        'ما الذي يمكنك إخبارني به عن تطلعاتك المهنية؟'
      );

      messages.push({ role: 'assistant', content: questionText });
      
      await sessionRef.update({
        questionCount: nextCount,
        messages,
        answers,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { question: questionText, phase: 'questioning', questionCount: nextCount, questionLimit: session.questionLimit };
    }
  }

  if (session.phase === 'limit_reached') {
    if (matchesContinueIntent(sanitized, userLanguage)) {
      const newLimit = session.questionLimit + 5;
      const nextCount = session.questionCount + 1;
      
      const prompt = buildAssistantPrompt(messages, nextCount, newLimit, userProfile, userLanguage);
      const aiReply = await generateAIResponse(prompt, { jsonMode: true, tokenPreset: 'SHORT_JSON' });
      
      const parsed = parseJsonFromText(aiReply);
      const questionText = parsed?.nextText || parsed?.question || getLocaleText(userLanguage, "Let's continue. Can you elaborate on your latest experience?", "لنواصل. هل يمكنك توضيح تجربتك الأخيرة؟");

      messages.push({ role: 'assistant', content: questionText });
      
      await sessionRef.update({
        phase: 'questioning',
        questionLimit: newLimit,
        questionCount: nextCount,
        messages,
        answers,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { question: questionText, phase: 'questioning', questionCount: nextCount, questionLimit: newLimit };
    }

    if (!matchesDoneIntent(sanitized, userLanguage)) {
      const clarifyMsg = getLocaleText(
        userLanguage,
        'Please reply "continue" for 5 more questions, or "done" to generate your recommendations.',
        'يرجى الرد بـ "متابعة" أو "continue" لإضافة 5 أسئلة أخرى، أو "تم" أو "done" لإنشاء توصياتك.'
      );
      messages.push({ role: 'assistant', content: clarifyMsg });
      await sessionRef.update({
        messages,
        answers,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { question: clarifyMsg, phase: 'limit_reached', questionCount: session.questionCount, questionLimit: session.questionLimit };
    }

    {
      const newPhase = 'timeline';
      const msg = getLocaleText(
        userLanguage,
        "Based on everything you've shared with me, I have a good understanding of your skills and interests. Now, how much time would you like to dedicate to reaching your career goal?\nFor example: 3 months, 6 months, 1 year, or 2 years.\nThis will help me build you a precise, week-by-week roadmap.",
        "بناءً على كل ما شاركته معي، لدي فهم جيد لمهاراتك واهتماماتك. الآن، كم من الوقت ترغب في تخصيصه للوصول إلى هدفك المهني؟\nعلى سبيل المثال: 3 أشهر، 6 أشهر، سنة، أو سنتان.\nسيساعدني هذا على بناء خطة طريق دقيقة أسبوعاً بأسبوع."
      );
      messages.push({ role: 'assistant', content: msg });
      
      await sessionRef.update({
        phase: newPhase,
        messages,
        answers,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { question: msg, phase: newPhase };
    }
  }

  if (session.phase === 'timeline') {
      const newPhase = 'rec_count';
      const msg = getLocaleText(
        userLanguage,
        "Last question before I generate your results — how many career recommendations would you like me to provide?\nI can give you between 1 and 5. More recommendations means more career paths to explore.",
        "السؤال الأخير قبل أن أُنشئ النتائج — كم عدد التوصيات المهنية التي تريدني أن أقدمها؟\nيمكنني إعطاؤك بين 1 و5. كلما زادت التوصيات، زادت المسارات المهنية التي يمكنك استكشافها."
      );
    messages.push({ role: 'assistant', content: msg });
    
    await sessionRef.update({
      timeline: sanitized,
      phase: newPhase,
      messages,
      answers,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { question: msg, phase: newPhase };
  }

  if (session.phase === 'rec_count') {
    let limit = parseInt(sanitized.replace(/[^0-9]/g, ''), 10);
    if (isNaN(limit)) limit = 3;
    limit = Math.max(1, Math.min(5, limit));

    const newPhase = 'complete';
    const msg = getLocaleText(
      userLanguage,
      "Perfect! I have everything I need. Generating your personalized career recommendations now...",
      "رائع! لدي كل ما أحتاجه. جاري إنشاء توصياتك المهنية المخصصة الآن..."
    );
    messages.push({ role: 'assistant', content: msg });
    
    await sessionRef.update({
      recommendationCount: limit,
      completed: true,
      phase: newPhase,
      messages,
      answers,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { complete: true, question: msg, phase: newPhase };
  }

  return {
    question: getLocaleText(userLanguage, "I'm not sure how to proceed. Let's finish up.", "لست متأكداً من الخطوة التالية. لننهي الأمر."),
    phase: session.phase,
    complete: true
  };
};

exports.getSession = async (sessionId, userId) => {
  const sessionDoc = await db.collection('interview_sessions').doc(sessionId).get();
  if (!sessionDoc.exists) {
    throw new Error('Session not found');
  }

  const session = sessionDoc.data();
  if (session.userId !== userId) {
    throw new Error('Unauthorized');
  }

  return { sessionId, ...session };
};

exports.completeSession = async (userId, sessionId) => {
  const sessionRef = db.collection('interview_sessions').doc(sessionId);
  const sessionDoc = await sessionRef.get();
  if (!sessionDoc.exists) {
    throw new Error('Session not found');
  }

  const session = sessionDoc.data();
  if (session.userId !== userId) {
    throw new Error('Unauthorized');
  }

  await sessionRef.update({
    completed: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { sessionId, completed: true };
};

exports.getUserSessions = async (userId) => {
  const snapshot = await db.collection('interview_sessions')
    .where('userId', '==', userId)
    .get();

  const sessions = [];
  snapshot.forEach(doc => {
    sessions.push({
      sessionId: doc.id,
      ...doc.data()
    });
  });

  // Sort in-memory by createdAt descending to avoid compound index requirements
  sessions.sort((a, b) => {
    const aTime = a.createdAt && typeof a.createdAt.toDate === 'function'
      ? a.createdAt.toDate().getTime()
      : (a.createdAt instanceof Date ? a.createdAt.getTime() : Number(a.createdAt) || 0);
    const bTime = b.createdAt && typeof b.createdAt.toDate === 'function'
      ? b.createdAt.toDate().getTime()
      : (b.createdAt instanceof Date ? b.createdAt.getTime() : Number(b.createdAt) || 0);
    return bTime - aTime;
  });

  return sessions;
};

exports.deleteSession = async (sessionId, userId) => {
  const sessionRef = db.collection('interview_sessions').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    throw new Error('Session not found');
  }

  const session = sessionDoc.data();
  if (session.userId !== userId) {
    throw new Error('Unauthorized');
  }

  await sessionRef.delete();
  return { sessionId, deleted: true };
};

exports.parseJsonFromText = parseJsonFromText;

