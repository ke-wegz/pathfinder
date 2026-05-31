const { db, admin } = require('../../firebase');
const { getRecommendationPrompt } = require('./recommendation.prompt');
const { generateAIResponse } = require('../../utils/aiProviderClient');

const parseJsonFromText = (text) => {
  if (!text) {
    console.error("[Recommendations Parser] Received empty text from AI.");
    return null;
  }
  
  console.log("[Recommendations Parser] Raw AI Output (first 100 chars):", text.substring(0, 100).replace(/\n/g, '\\n') + "...");
  
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[Recommendations Parser] CRITICAL: No JSON-like structure found in the AI response!");
    return null;
  }
  
  let jsonString = jsonMatch[1] || jsonMatch[0];
  jsonString = jsonString.trim();
  try {
    const parsed = JSON.parse(jsonString);
    console.log("[Recommendations Parser] Successfully parsed JSON!");
    return parsed;
  } catch (err) {
    console.error("[Recommendations Parser] JSON.parse threw an error:", err.message);
    console.error("[Recommendations Parser] The faulty JSON string was:\n", jsonString);
    return null;
  }
};

exports.generateRecommendation = async (userId, sessionId) => {
  const sessionDoc = await db.collection('interview_sessions').doc(sessionId).get();
  if (!sessionDoc.exists) throw new Error('Session not found');

  const session = sessionDoc.data();
  if (session.userId !== userId) throw new Error('Unauthorized');
  if (!session.completed) {
    console.log(`[Recommendations] Session ${sessionId} was not marked as completed. Forcing complete: true.`);
    await db.collection('interview_sessions').doc(sessionId).update({
      completed: true,
      phase: 'complete',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    session.completed = true;
    session.phase = 'complete';
  }

  const profileDoc = await db.collection('profiles').doc(userId).get();
  const profile = profileDoc.exists ? profileDoc.data() : {};

  // Clamp recommendationCount (required: default 3, then clamp 1..5)
  const rawCount = typeof session.recommendationCount === 'number' ? session.recommendationCount : 3;
  const recommendationCount = Math.max(1, Math.min(5, Number.isFinite(rawCount) ? rawCount : 3));

  const prompt = getRecommendationPrompt(profile, session);

  try {
    console.log("[Recommendations] Generating AI response...");
    const aiOutput = await generateAIResponse(prompt, {
      jsonMode: true,
      recommendationCount,
    });
    console.log("[Recommendations] AI Output received. Parsing...");
    
    const parsedData = parseJsonFromText(aiOutput);

    if (!parsedData || !Array.isArray(parsedData.recommendations)) {
      console.error("[Recommendations] Invalid JSON structure. AI Output was:", aiOutput);
      throw new Error('AI did not return valid recommendation JSON');
    }

    let recommendations = parsedData.recommendations;

    // Enforce exact count (required: generate recommendationCount recommendations)
    if (recommendations.length > recommendationCount) {
      recommendations = recommendations.slice(0, recommendationCount);
    } else if (recommendations.length < recommendationCount) {
      // If AI underproduced, pad by trimming/duplication is NOT ideal,
      // but better than breaking flow. We will repeat last item to satisfy schema.
      const last = recommendations[recommendations.length - 1];
      while (recommendations.length < recommendationCount && last) {
        recommendations.push({ ...last, rank: recommendations.length + 1 });
      }
    }

    // Fix ranks to match 1..recommendationCount
    recommendations = recommendations.map((r, idx) => ({
      ...r,
      rank: idx + 1
    }));

    const newRecommendation = {
      userId,
      userID: userId,
      sessionId,
      recommendations,
      overallSummary: parsedData.overallSummary || '',
      recommendationCount,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log("[Recommendations] Attempting to save to Firestore database...");
    const docRef = await db.collection('recommendations').add(newRecommendation);
    const doc = await docRef.get();
    console.log(`[Recommendations] SUCCESS! Saved to Firestore with ID: ${doc.id}`);
    return { recId: doc.id, ...doc.data() };
  } catch (error) {
    console.error("[Recommendations] Fatal Error during generation:", error);
    throw new Error(`Failed to generate recommendation: ${error.message}`);
  }
};

exports.saveRecommendation = async (userId, data) => {
  const recommendation = {
    userId,
    userID: userId,
    sessionId: data.sessionId || null,
    recommendations: data.recommendations || [],
    overallSummary: data.overallSummary || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await db.collection('recommendations').add(recommendation);
  const doc = await docRef.get();
  return { recId: doc.id, ...doc.data() };
};

exports.getUserRecommendations = async (userId) => {
  const [snapshotByUserId, snapshotByUserID] = await Promise.all([
    db.collection('recommendations')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get(),
    db.collection('recommendations')
      .where('userID', '==', userId)
      .orderBy('createdAt', 'desc')
      .get()
  ]);

  const docs = [...snapshotByUserId.docs, ...snapshotByUserID.docs];
  const uniqueDocs = new Map();

  docs.forEach((doc) => {
    if (!uniqueDocs.has(doc.id)) {
      uniqueDocs.set(doc.id, doc);
    }
  });

  const sortedDocs = Array.from(uniqueDocs.values()).sort((a, b) => {
    const aCreated = a.data()?.createdAt?.toMillis ? a.data().createdAt.toMillis() : a.data()?.createdAt || 0;
    const bCreated = b.data()?.createdAt?.toMillis ? b.data().createdAt.toMillis() : b.data()?.createdAt || 0;
    return bCreated - aCreated;
  });

  return sortedDocs.map(doc => ({ recId: doc.id, ...doc.data() }));
};

exports.clearRecommendations = async (userId) => {
  const [snapshotByUserId, snapshotByUserID] = await Promise.all([
    db.collection('recommendations').where('userId', '==', userId).get(),
    db.collection('recommendations').where('userID', '==', userId).get()
  ]);

  const docs = [...snapshotByUserId.docs, ...snapshotByUserID.docs];
  const uniqueRefs = new Map();

  docs.forEach((doc) => {
    if (!uniqueRefs.has(doc.id)) {
      uniqueRefs.set(doc.id, doc.ref);
    }
  });

  if (uniqueRefs.size === 0) return 0;

  const batch = db.batch();
  uniqueRefs.forEach((ref) => batch.delete(ref));
  await batch.commit();
  return uniqueRefs.size;
};

exports.getRecommendationById = async (id, userId) => {
  const doc = await db.collection('recommendations').doc(id).get();
  if (!doc.exists) throw new Error('Recommendation not found');
  const data = doc.data();
  if (userId && data.userId !== userId && data.userID !== userId) throw new Error('Unauthorized');
  return { recId: doc.id, ...data };
};

exports.deleteRecommendationEntry = async (docId, entryIndex, userId) => {
  const docRef = db.collection('recommendations').doc(docId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Recommendation not found');

  const data = doc.data();
  if (data.userId !== userId && data.userID !== userId) throw new Error('Unauthorized');

  const recommendations = Array.isArray(data.recommendations) ? [...data.recommendations] : [];
  if (entryIndex < 0 || entryIndex >= recommendations.length) {
    throw new Error('Recommendation entry not found');
  }

  recommendations.splice(entryIndex, 1);

  if (recommendations.length === 0) {
    await docRef.delete();
  } else {
    await docRef.update({ recommendations });
  }

  return true;
};
