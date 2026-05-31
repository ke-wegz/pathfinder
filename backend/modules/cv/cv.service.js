const { db, admin } = require('../../firebase');
const { getCVPrompt } = require('./cv.prompt');
const { generateAIResponse } = require('../../utils/aiProviderClient');
const { parseJsonFromText } = require('../interview/interview.service');

exports.generateCV = async (userId) => {
  // Fetch user profile
  const profileDoc = await db.collection('profiles').doc(userId).get();
  const profile = profileDoc.exists ? profileDoc.data() : {};

  // Fetch recommendations to guide the CV context
  const recommendationsSnapshot = await db.collection('recommendations')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  
  let latestRecommendations = [];
  if (!recommendationsSnapshot.empty) {
    latestRecommendations = recommendationsSnapshot.docs[0].data().recommendations || [];
  }

  const prompt = getCVPrompt(profile, latestRecommendations);
  
  try {
    console.log("[CV Service] Generating AI response...");
    const aiOutput = await generateAIResponse(prompt, { jsonMode: true, tokenPreset: 'MEDIUM_JSON' });
    console.log("[CV Service] AI Output received. Parsing...");
    
    const parsedData = parseJsonFromText(aiOutput);

    if (!parsedData || !parsedData.summary) {
      console.error("[CV Service] Invalid JSON structure. AI Output was:", aiOutput);
      throw new Error('AI did not return a valid CV structure');
    }

    const cvData = {
      userId,
      ...parsedData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Check if user already has a CV
    const cvQuery = await db.collection('cvs').where('userId', '==', userId).get();
    
    if (!cvQuery.empty) {
      // Update existing
      const docId = cvQuery.docs[0].id;
      await db.collection('cvs').doc(docId).update(cvData);
      return { id: docId, ...cvData };
    } else {
      // Create new
      cvData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      const docRef = await db.collection('cvs').add(cvData);
      return { id: docRef.id, ...cvData };
    }
  } catch (error) {
    console.error("[CV Service] Fatal Error during generation:", error);
    throw new Error(`Failed to generate CV: ${error.message}`);
  }
};

exports.getUserCV = async (userId) => {
  const cvQuery = await db.collection('cvs').where('userId', '==', userId).get();
  if (cvQuery.empty) {
    return null;
  }
  const doc = cvQuery.docs[0];
  return { id: doc.id, ...doc.data() };
};

exports.updateCV = async (userId, data) => {
  const cvQuery = await db.collection('cvs').where('userId', '==', userId).get();
  if (cvQuery.empty) {
    throw new Error('CV not found');
  }
  
  const docId = cvQuery.docs[0].id;
  const updateData = {
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  // Prevent updating userId
  delete updateData.userId;
  delete updateData.id;

  await db.collection('cvs').doc(docId).update(updateData);
  return { id: docId, ...updateData };
};

exports.deleteCV = async (userId) => {
  const cvQuery = await db.collection('cvs').where('userId', '==', userId).get();
  if (cvQuery.empty) {
    return false;
  }

  const batch = db.batch();
  cvQuery.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return true;
};
