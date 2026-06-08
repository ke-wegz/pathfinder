const { db, admin } = require('../../firebase');
const asyncHandler = require('../../utils/asyncHandler');
const userService = require('../users/user.service');
const resourceService = require('../resources/resource.service');
const communityService = require('../community/community.service');

// 1. List Users
exports.usersList = asyncHandler(async (req, res) => {
  const usersSnapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
  const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  res.status(200).json({ success: true, data: users });
});

// 2. Disable User
exports.disableUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  try {
    await admin.auth().updateUser(uid, { disabled: true });
  } catch (err) {
    console.warn(`Could not update user disabled status in Firebase Auth for ${uid}:`, err.message);
  }
  await db.collection('users').doc(uid).update({ disabled: true });
  res.status(200).json({ success: true, message: 'User disabled successfully' });
});

// 3. Enable User
exports.enableUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  try {
    await admin.auth().updateUser(uid, { disabled: false });
  } catch (err) {
    console.warn(`Could not update user enabled status in Firebase Auth for ${uid}:`, err.message);
  }
  await db.collection('users').doc(uid).update({ disabled: false });
  res.status(200).json({ success: true, message: 'User enabled successfully' });
});

// 4. Delete User
exports.deleteUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  await userService.deleteUserAccount(uid);
  res.status(200).json({ success: true, message: 'User account deleted successfully' });
});

// 5. List Experts
exports.expertsList = asyncHandler(async (req, res) => {
  const expertsSnapshot = await db.collection('users')
    .where('role', 'in', ['Expert', 'expert'])
    .get();
  const experts = expertsSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  res.status(200).json({ success: true, data: experts });
});

// 6. Add Expert
exports.addExpert = asyncHandler(async (req, res) => {
  const { email, password, name, skills, education } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Email, password, and name are required' });
  }

  // 1. Create Firebase Auth user
  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName: name
  });

  const uid = userRecord.uid;

  // 2. Set user record in Firestore
  const userDoc = {
    uid,
    email: email.toLowerCase(),
    name,
    role: 'Expert',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: admin.firestore.FieldValue.serverTimestamp()
  };

  // 3. Set default profile in Firestore
  const profileDoc = {
    userId: uid,
    phone: '',
    location: '',
    education: education ? [education] : [],
    skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [],
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
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await Promise.all([
    db.collection('users').doc(uid).set(userDoc),
    db.collection('profiles').doc(uid).set(profileDoc)
  ]);

  res.status(201).json({ success: true, data: { uid, ...userDoc } });
});

// 7. Remove Expert
exports.removeExpert = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const doc = await db.collection('users').doc(uid).get();
  if (!doc.exists) {
    return res.status(404).json({ success: false, message: 'Expert not found' });
  }
  const role = String(doc.data().role || '').toLowerCase();
  if (role !== 'expert') {
    return res.status(400).json({ success: false, message: 'User is not an expert' });
  }

  await userService.deleteUserAccount(uid);
  res.status(200).json({ success: true, message: 'Expert removed successfully' });
});

// 8. List Resources
exports.resourcesList = asyncHandler(async (req, res) => {
  const resources = await resourceService.getAllResources(req.query);
  res.status(200).json({ success: true, data: resources });
});

// 9. Create Resource
exports.createResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.createResource(req.body);
  res.status(201).json({ success: true, data: resource });
});

// 10. Update Resource
exports.updateResource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const resource = await resourceService.updateResource(id, req.body);
  res.status(200).json({ success: true, data: resource });
});

// 11. Delete Resource
exports.deleteResource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await resourceService.deleteResource(id);
  res.status(200).json({ success: true, message: 'Resource deleted successfully' });
});

// 12. Unified Analytics
exports.getAnalytics = asyncHandler(async (req, res) => {
  // 1. Gather User Counts
  const usersSnapshot = await db.collection('users').get();
  let totalUsers = 0;
  let standardCount = 0;
  let expertCount = 0;
  let adminCount = 0;
  let disabledCount = 0;

  usersSnapshot.forEach(doc => {
    totalUsers++;
    const data = doc.data();
    const role = String(data.role || '').toLowerCase();
    if (role === 'admin') adminCount++;
    else if (role === 'expert') expertCount++;
    else standardCount++;

    if (data.disabled) disabledCount++;
  });

  // 2. Gather Goal Completion Stats
  const goalsSnapshot = await db.collection('goals').get();
  let totalGoals = 0;
  let completedGoals = 0;
  goalsSnapshot.forEach(doc => {
    totalGoals++;
    if (doc.data().completed) completedGoals++;
  });
  const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // 3. Gather Session Stats
  const sessionsSnapshot = await db.collection('interview_sessions').get();
  let totalSessions = 0;
  let completedSessions = 0;
  sessionsSnapshot.forEach(doc => {
    totalSessions++;
    if (doc.data().status === 'completed' || doc.data().completed) {
      completedSessions++;
    }
  });

  // 4. Gather API Usage Logs (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const logsSnapshot = await db.collection('api_logs')
    .where('timestamp', '>=', sevenDaysAgo)
    .get();

  const dailyUsageMap = {};
  const routeUsageMap = {};

  logsSnapshot.forEach(doc => {
    const data = doc.data();
    let dateStr = 'Unknown';
    if (data.timestamp) {
      const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
      dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Daily aggregate
    dailyUsageMap[dateStr] = (dailyUsageMap[dateStr] || 0) + 1;

    // Route aggregate
    const path = data.path || 'Unknown';
    routeUsageMap[path] = (routeUsageMap[path] || 0) + 1;
  });

  // Format daily logs (fill missing days if necessary, or just extract sorted)
  const dailyUsage = Object.entries(dailyUsageMap).map(([date, count]) => ({
    date,
    requests: count
  }));

  // Format top routes
  const topRoutes = Object.entries(routeUsageMap)
    .map(([route, count]) => ({ route, requests: count }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 5);

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        standard: standardCount,
        expert: expertCount,
        admin: adminCount,
        active: totalUsers - disabledCount,
        disabled: disabledCount
      },
      goals: {
        total: totalGoals,
        completed: completedGoals,
        active: totalGoals - completedGoals,
        rate: goalCompletionRate
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        avgPerUser: totalUsers > 0 ? (totalSessions / totalUsers).toFixed(1) : 0
      },
      apiUsage: {
        daily: dailyUsage,
        topRoutes: topRoutes
      }
    }
  });
});

// 13. List Community Posts (Admin)
exports.communityPostsList = asyncHandler(async (req, res) => {
  const posts = await communityService.getAllPosts(req.query);
  res.status(200).json({ success: true, data: posts });
});

// 14. Delete Community Post (Admin - bypass owner check)
exports.deleteCommunityPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const docRef = db.collection('community').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }
  
  await docRef.delete();
  
  // delete associated comments
  const commentsSnapshot = await db.collection('comments').where('postID', '==', id).get();
  const batch = db.batch();
  commentsSnapshot.docs.forEach(c => batch.delete(c.ref));
  await batch.commit();
  
  res.status(200).json({ success: true, message: 'Post and associated comments deleted successfully by admin' });
});

// 15. Delete Community Comment (Admin - bypass owner check)
exports.deleteCommunityComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const docRef = db.collection('comments').doc(commentId);
  const doc = await docRef.get();
  
  if (!doc.exists || doc.data().postID !== postId) {
    return res.status(404).json({ success: false, message: 'Comment not found or does not belong to this post' });
  }
  
  await docRef.delete();
  
  // Decrement comment count on the post
  const postRef = db.collection('community').doc(postId);
  const postDoc = await postRef.get();
  if (postDoc.exists) {
    await postRef.update({
      comments_count: admin.firestore.FieldValue.increment(-1)
    });
  }
  
  res.status(200).json({ success: true, message: 'Comment deleted successfully by admin' });
});

