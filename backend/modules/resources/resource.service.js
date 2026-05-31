const { db, admin } = require('../../firebase');

exports.getAllResources = async (queryParams) => {
  let collection = db.collection('learning_resources');

  const queryKeys = Object.keys(queryParams || {}).filter(key => queryParams[key]);
  let query = collection;

  if (queryParams?.type) {
    query = query.where('type', '==', queryParams.type);
  }
  if (queryParams?.topic) {
    query = query.where('topics', 'array-contains', queryParams.topic);
  }
  if (queryParams?.search) {
    const search = queryParams.search.toLowerCase();
    const snapshot = await collection.get();
    if (snapshot.empty) return [];
    return snapshot.docs
      .map(doc => ({ resourceId: doc.id, ...doc.data() }))
      .filter(resource =>
        resource.name?.toLowerCase().includes(search) ||
        resource.provider?.toLowerCase().includes(search) ||
        (Array.isArray(resource.topics) && resource.topics.some(topic => topic.toLowerCase().includes(search)))
      );
  }

  const snapshot = await query.orderBy('createdAt', 'desc').get();
  if (snapshot.empty) return [];
  return snapshot.docs.map(doc => ({ resourceId: doc.id, ...doc.data() }));
};

exports.getResourceById = async (id) => {
  const doc = await db.collection('learning_resources').doc(id).get();
  if (!doc.exists) throw new Error('Resource not found');
  return { resourceId: doc.id, ...doc.data() };
};

exports.createResource = async (data) => {
  const newResource = {
    name: data.name,
    provider: data.provider,
    type: data.type,
    url: data.url,
    topics: Array.isArray(data.topics) ? data.topics : (data.topics ? [data.topics] : []),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await db.collection('learning_resources').add(newResource);
  const doc = await docRef.get();
  return { resourceId: doc.id, ...doc.data() };
};

exports.updateResource = async (id, data) => {
  const docRef = db.collection('learning_resources').doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Resource not found');

  const updatePayload = {
    ...data,
    topics: data.topics ? (Array.isArray(data.topics) ? data.topics : [data.topics]) : undefined
  };

  const cleanedPayload = Object.entries(updatePayload).reduce((acc, [key, value]) => {
    if (value !== undefined) acc[key] = value;
    return acc;
  }, {});

  if (Object.keys(cleanedPayload).length === 0) {
    return { resourceId: doc.id, ...doc.data() };
  }

  cleanedPayload.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  await docRef.update(cleanedPayload);
  const updatedDoc = await docRef.get();
  return { resourceId: updatedDoc.id, ...updatedDoc.data() };
};

exports.deleteResource = async (id) => {
  const docRef = db.collection('learning_resources').doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Resource not found');
  await docRef.delete();
  return true;
};
