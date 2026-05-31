const { db, admin } = require('../../firebase');

const normalizeGoalData = (goal) => ({
  ...goal,
  category: goal.category || 'General',
  priority: goal.priority || 'medium',
  completed: Boolean(goal.completed),
  progress: typeof goal.progress === 'number' ? goal.progress : 0,
  deadline: goal.deadline || null,
  deadlineNotified: Boolean(goal.deadlineNotified),
  createdAt: goal.createdAt || admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
});

exports.getUserGoals = async (userId) => {
  const snapshot = await db.collection('goals')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  if (snapshot.empty) return [];
  return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
};

exports.getGoalById = async (goalId, userId) => {
  const doc = await db.collection('goals').doc(goalId).get();
  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error('Goal not found or unauthorized');
  }
  return { _id: doc.id, ...doc.data() };
};

exports.createGoal = async (userId, goalData) => {
  const newGoal = normalizeGoalData({
    ...goalData,
    userId,
    completed: false,
    progress: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  const docRef = await db.collection('goals').add(newGoal);
  const doc = await docRef.get();
  return { _id: doc.id, ...doc.data() };
};

exports.updateGoal = async (goalId, userId, updateData) => {
  const docRef = db.collection('goals').doc(goalId);
  const doc = await docRef.get();
  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error('Goal not found or unauthorized');
  }

  const allowedUpdate = {
    text: updateData.text,
    category: updateData.category,
    priority: updateData.priority,
    deadline: updateData.deadline === '' ? null : updateData.deadline,
    completed: updateData.completed,
    progress: updateData.progress
  };

  if (updateData.deadline !== undefined && updateData.deadline !== doc.data().deadline) {
    allowedUpdate.deadlineNotified = false;
  }

  const cleanUpdate = Object.entries(allowedUpdate).reduce((acc, [key, value]) => {
    if (value !== undefined) acc[key] = value;
    return acc;
  }, {});

  await docRef.update({
    ...cleanUpdate,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  const updatedDoc = await docRef.get();
  return { _id: updatedDoc.id, ...updatedDoc.data() };
};

exports.updateProgress = async (goalId, userId, progress) => {
  const docRef = db.collection('goals').doc(goalId);
  const doc = await docRef.get();
  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error('Goal not found or unauthorized');
  }

  await docRef.update({
    progress: Number(progress),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  const updatedDoc = await docRef.get();
  return { _id: updatedDoc.id, ...updatedDoc.data() };
};

exports.deleteGoal = async (goalId, userId) => {
  const docRef = db.collection('goals').doc(goalId);
  const doc = await docRef.get();
  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error('Goal not found or unauthorized');
  }

  await docRef.delete();
  return true;
};
