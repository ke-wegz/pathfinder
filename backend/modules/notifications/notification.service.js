const { db, admin } = require('../../firebase');

exports.getUserNotifications = async (userId) => {
  const snapshot = await db.collection('notifications')
    .where('userID', '==', userId)
    .get();
  if (snapshot.empty) return [];
  
  const notifications = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
  
  // Sort in memory to avoid requiring a composite index in Firestore
  return notifications.sort((a, b) => {
    const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
    return timeB - timeA;
  });
};

exports.createNotification = async (userId, title, body, type, goalID = null, commentID = null, postID = null) => {
  const newNotif = {
    userID: userId,
    title,
    body,
    type,
    goalID,
    commentID,
    postID,
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };
  const docRef = await db.collection('notifications').add(newNotif);
  const doc = await docRef.get();
  return { _id: doc.id, ...doc.data() };
};

exports.markAsRead = async (notificationId, userId) => {
  const docRef = db.collection('notifications').doc(notificationId);
  const doc = await docRef.get();
  if (!doc.exists || doc.data().userID !== userId) throw new Error('Notification not found');
  
  await docRef.update({ isRead: true });
  const updatedDoc = await docRef.get();
  return { _id: updatedDoc.id, ...updatedDoc.data() };
};

exports.deleteNotification = async (notificationId, userId) => {
  const docRef = db.collection('notifications').doc(notificationId);
  const doc = await docRef.get();
  if (!doc.exists || doc.data().userID !== userId) throw new Error('Notification not found');
  
  await docRef.delete();
  return true;
};

exports.markAllAsRead = async (userId) => {
  const snapshot = await db.collection('notifications')
    .where('userID', '==', userId)
    .where('isRead', '==', false)
    .get();
    
  if (snapshot.empty) return;
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { isRead: true });
  });
  await batch.commit();
  return true;
};

exports.deleteAllNotifications = async (userId) => {
  const snapshot = await db.collection('notifications')
    .where('userID', '==', userId)
    .get();
    
  if (snapshot.empty) return;
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  return true;
};
