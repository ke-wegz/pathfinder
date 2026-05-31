const { db, admin } = require('../../firebase');
const notificationService = require('../notifications/notification.service');

exports.getAllPosts = async (queryParams) => {
  const snapshot = await db.collection('community').orderBy('date', 'desc').get();
  if (snapshot.empty) return [];

  const posts = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data();

      let authorName = 'Unknown User';
      if (data.userID) {
        const userDoc = await db.collection('users').doc(data.userID).get();
        if (userDoc.exists) authorName = userDoc.data().name;
      }

      const commentsSnapshot = await db
        .collection('comments')
        .where('postID', '==', doc.id)
        .get();

      const comments = [];
      for (const c of commentsSnapshot.docs) {
        const commentData = c.data();

        let commentAuthorName = 'Unknown User';
        if (commentData.userID) {
          const u = await db.collection('users').doc(commentData.userID).get();
          if (u.exists) commentAuthorName = u.data().name;
        }

        comments.push({
          _id: c.id,
          ...commentData,
          id: c.id,
          authorName: commentAuthorName,
          author: commentAuthorName
        });
      }

      return {
        _id: doc.id,
        ...data,
        authorName,
        comments
      };
    })
  );

  return posts;
};

exports.getPostById = async (postId) => {
  const doc = await db.collection('community').doc(postId).get();
  if (!doc.exists) throw new Error('Post not found');

  const data = doc.data();

  let authorName = 'Unknown User';
  if (data.userID) {
    const userDoc = await db.collection('users').doc(data.userID).get();
    if (userDoc.exists) authorName = userDoc.data().name;
  }

  const commentsSnapshot = await db
    .collection('comments')
    .where('postID', '==', doc.id)
    .get();

  const comments = [];
  for (const c of commentsSnapshot.docs) {
    const commentData = c.data();

    let commentAuthorName = 'Unknown User';
    if (commentData.userID) {
      const u = await db.collection('users').doc(commentData.userID).get();
      if (u.exists) commentAuthorName = u.data().name;
    }

    comments.push({
      _id: c.id,
      ...commentData,
      id: c.id,
      authorName: commentAuthorName,
      author: commentAuthorName
    });
  }

  return { _id: doc.id, ...data, authorName, comments };
};

exports.createPost = async (userId, postData) => {
  const newPost = {
    ...postData,
    userID: userId,
    date: admin.firestore.FieldValue.serverTimestamp(),
    likes_count: 0,
    comments_count: 0
  };
  
  const docRef = await db.collection('community').add(newPost);
  const doc = await docRef.get();
  return { _id: doc.id, ...doc.data() };
};

exports.updatePost = async (postId, userId, updateData) => {
  const docRef = db.collection('community').doc(postId);
  const doc = await docRef.get();
  
  if (!doc.exists || doc.data().userID !== userId) {
    throw new Error('Post not found or unauthorized');
  }

  await docRef.update({
    ...updateData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  const updatedDoc = await docRef.get();
  return { _id: updatedDoc.id, ...updatedDoc.data() };
};

exports.deletePost = async (postId, userId) => {
  const docRef = db.collection('community').doc(postId);
  const doc = await docRef.get();
  
  if (!doc.exists || doc.data().userID !== userId) {
    throw new Error('Post not found or unauthorized');
  }
  
  await docRef.delete();
  
  // delete associated comments
  const commentsSnapshot = await db.collection('comments').where('postID', '==', postId).get();
  const batch = db.batch();
  commentsSnapshot.docs.forEach(c => batch.delete(c.ref));
  await batch.commit();
  
  return true;
};

exports.likePost = async (postId, userId) => {
  const docRef = db.collection('community').doc(postId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Post not found');

  const data = doc.data();
  const likes = Array.isArray(data.likes) ? data.likes : [];

  const isLiked = likes.includes(userId);

  if (isLiked) {
    // Unlike
    await docRef.update({
      likes: admin.firestore.FieldValue.arrayRemove(userId),
      likes_count: Math.max(0, likes.length - 1),
    });
  } else {
    // Like
    await docRef.update({
      likes: admin.firestore.FieldValue.arrayUnion(userId),
      likes_count: likes.length + 1,
    });

    if (data.userID && data.userID !== userId) {
      let likerName = 'Someone';
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) likerName = userDoc.data().name;
      
      await notificationService.createNotification(
        data.userID,
        'New Like',
        `${likerName} liked your post`,
        'community',
        null,
        null,
        postId
      ).catch(err => console.error('Error creating like notification:', err));
    }
  }

  const updatedDoc = await docRef.get();
  return { _id: updatedDoc.id, ...updatedDoc.data() };
};

exports.addComment = async (postId, userId, text) => {
  const newComment = {
    postID: postId,
    userID: userId,
    text,
    date: admin.firestore.FieldValue.serverTimestamp()
  };
  
  const commentRef = await db.collection('comments').add(newComment);
  const commentDoc = await commentRef.get();
  
  const postRef = db.collection('community').doc(postId);
  await postRef.update({
    comments_count: admin.firestore.FieldValue.increment(1)
  });
  
  const postDoc = await postRef.get();
  if (postDoc.exists) {
    const postData = postDoc.data();
    if (postData.userID && postData.userID !== userId) {
      let commenterName = 'Someone';
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) commenterName = userDoc.data().name;
      
      await notificationService.createNotification(
        postData.userID,
        'New Comment',
        `${commenterName} commented on your post`,
        'community',
        null,
        commentDoc.id,
        postId
      ).catch(err => console.error('Error creating comment notification:', err));
    }
  }
  
  return { _id: commentDoc.id, ...commentDoc.data() };
};

exports.getCommentsForPost = async (postId) => {
  const snapshot = await db.collection('comments')
    .where('postID', '==', postId)
    .get();
    
  if (snapshot.empty) return [];
  
  const comments = [];
  for (let doc of snapshot.docs) {
    const data = doc.data();
    let authorName = 'Unknown User';
    if (data.userID) {
      const userDoc = await db.collection('users').doc(data.userID).get();
      if (userDoc.exists) authorName = userDoc.data().name;
    }
    comments.push({ _id: doc.id, ...data, authorName });
  }
  return comments;
};

exports.deleteComment = async (postId, commentId, userId) => {
  const docRef = db.collection('comments').doc(commentId);
  const doc = await docRef.get();
  
  if (!doc.exists || doc.data().postID !== postId || doc.data().userID !== userId) {
    throw new Error('Comment not found or unauthorized');
  }
  
  await docRef.delete();
  
  const postRef = db.collection('community').doc(postId);
  await postRef.update({
    comments_count: admin.firestore.FieldValue.increment(-1)
  });
  
  return true;
};
