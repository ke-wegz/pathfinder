const { db, admin } = require('../../firebase');
const { normalizeLanguage } = require('../../utils/languageUtils');

const buildDefaultProfile = (uid) => ({
  userId: uid,
  phone: '',
  location: '',
  education: [],
  skills: [],
  interests: [],
  careerGoals: [],
  experience: '',
  language: 'en',
  timezone: 'Pacific Time (PT)',
  privacySettings: {
    profileVisibility: true,
    dataCollection: true,
    shareProgress: false
  },
  notificationSettings: {
    emailNotifications: true,
    goalReminders: true,
    communityActivity: true,
    marketingCommunications: false
  }
});

exports.registerUser = async (userData, uid) => {
  const { email, name } = userData;

  const userRef = db.collection('users').doc(uid);
  const profileRef = db.collection('profiles').doc(uid);

  const [userDoc, profileDoc] = await Promise.all([userRef.get(), profileRef.get()]);
  if (userDoc.exists || profileDoc.exists) {
    throw new Error('User already exists');
  }

  const userRecord = {
    uid,
    email,
    name,
    role: 'standard',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: admin.firestore.FieldValue.serverTimestamp()
  };

  const profileRecord = buildDefaultProfile(uid);

  await Promise.all([
    userRef.set(userRecord),
    profileRef.set(profileRecord)
  ]);

  return { _id: uid, ...userRecord };
};

exports.loginUser = async (uid) => {
  const userRef = db.collection('users').doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error('User profile not found');
  }

  await userRef.update({ lastLogin: admin.firestore.FieldValue.serverTimestamp() });

  return { _id: doc.id, ...doc.data() };
};

exports.getUserProfile = async (uid) => {
  const [userDoc, profileDoc] = await Promise.all([
    db.collection('users').doc(uid).get(),
    db.collection('profiles').doc(uid).get()
  ]);

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();
  const profileData = profileDoc.exists ? profileDoc.data() : buildDefaultProfile(uid);
  const personalInfo = profileData.personalInfo || {};

  return {
    uid,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    createdAt: userData.createdAt,
    lastLogin: userData.lastLogin,
    phone: profileData.phone || personalInfo.phone || '',
    location: profileData.location || personalInfo.location || '',
    education: profileData.education || personalInfo.education || [],
    skills: profileData.skills || personalInfo.skills || [],
    interests: profileData.interests || personalInfo.interests || [],
    careerGoals: profileData.careerGoals || personalInfo.careerGoals || [],
    experience: profileData.experience || personalInfo.experience || '',
    language: normalizeLanguage(profileData.language || personalInfo.language || 'en'),
    timezone: profileData.timezone || personalInfo.timezone || 'Pacific Time (PT)',
    privacySettings: { ...buildDefaultProfile(uid).privacySettings, ...(profileData.privacySettings || personalInfo.privacySettings || {}) },
    notificationSettings: { ...buildDefaultProfile(uid).notificationSettings, ...(profileData.notificationSettings || personalInfo.notificationSettings || {}) }
  };
};

exports.updateUserProfile = async (uid, updateData) => {
  const userRef = db.collection('users').doc(uid);
  const profileRef = db.collection('profiles').doc(uid);

  const [userDoc, profileDoc] = await Promise.all([userRef.get(), profileRef.get()]);
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const profileUpdate = {};
  const personalInfoUpdate = {};
  const userUpdate = {};

  if (updateData.name) {
    userUpdate.name = updateData.name;
  }
  if (updateData.email) {
    userUpdate.email = updateData.email;
  }

  if (updateData.location !== undefined) {
    profileUpdate.location = updateData.location;
    personalInfoUpdate.location = updateData.location;
  }
  if (updateData.phone !== undefined) {
    profileUpdate.phone = updateData.phone;
    personalInfoUpdate.phone = updateData.phone;
  }
  if (updateData.education !== undefined) {
    const educationValue = Array.isArray(updateData.education) ? updateData.education : [updateData.education];
    profileUpdate.education = educationValue;
    personalInfoUpdate.education = educationValue;
  }
  if (updateData.skills !== undefined) {
    profileUpdate.skills = Array.isArray(updateData.skills) ? updateData.skills : [];
    personalInfoUpdate.skills = Array.isArray(updateData.skills) ? updateData.skills : [];
  }
  if (updateData.interests !== undefined) {
    profileUpdate.interests = Array.isArray(updateData.interests) ? updateData.interests : [];
    personalInfoUpdate.interests = Array.isArray(updateData.interests) ? updateData.interests : [];
  }
  if (updateData.careerGoals !== undefined) {
    profileUpdate.careerGoals = Array.isArray(updateData.careerGoals) ? updateData.careerGoals : [];
    personalInfoUpdate.careerGoals = Array.isArray(updateData.careerGoals) ? updateData.careerGoals : [];
  }
  if (updateData.experience !== undefined) {
    profileUpdate.experience = updateData.experience;
    personalInfoUpdate.experience = updateData.experience;
  }
  if (updateData.language !== undefined) {
    const normalizedLanguage = normalizeLanguage(updateData.language);
    profileUpdate.language = normalizedLanguage;
    personalInfoUpdate.language = normalizedLanguage;
  }
  if (updateData.timezone !== undefined) {
    profileUpdate.timezone = updateData.timezone;
    personalInfoUpdate.timezone = updateData.timezone;
  }
  if (updateData.privacySettings !== undefined) {
    profileUpdate.privacySettings = updateData.privacySettings;
    personalInfoUpdate.privacySettings = updateData.privacySettings;
  }
  if (updateData.notificationSettings !== undefined) {
    profileUpdate.notificationSettings = updateData.notificationSettings;
    personalInfoUpdate.notificationSettings = updateData.notificationSettings;
  }

  if (Object.keys(userUpdate).length > 0) {
    userUpdate.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await userRef.update(userUpdate);
  }

  if (Object.keys(profileUpdate).length > 0 || Object.keys(personalInfoUpdate).length > 0) {
    const existingProfile = profileDoc.exists ? profileDoc.data() : {};
    const mergedProfile = {
      ...existingProfile,
      ...profileUpdate,
      personalInfo: {
        ...existingProfile.personalInfo,
        ...personalInfoUpdate
      }
    };

    mergedProfile.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await profileRef.set(mergedProfile, { merge: true });
  }

  const updatedProfile = await profileRef.get();
  const updatedUser = await userRef.get();

  return exports.getUserProfile(uid);
};

exports.deleteUserAccount = async (uid) => {
  const userRef = db.collection('users').doc(uid);
  const profileRef = db.collection('profiles').doc(uid);

  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  await Promise.all([userRef.delete(), profileRef.delete()]);
  try {
    await admin.auth().deleteUser(uid);
  } catch (err) {
    console.error('Error deleting from Firebase Auth', err);
  }
  return true;
};
