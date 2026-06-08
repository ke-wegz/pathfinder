const { db, admin } = require('../firebase');

module.exports = async (req, res, next) => {
  // Exclude admin analytics reads to prevent infinite feedback loops / excessive writes
  const isAnalyticsOrAdminRead = 
    req.originalUrl.includes('/api/admin/analytics') || 
    req.originalUrl.includes('/api/admin/users') ||
    req.originalUrl.includes('/api/admin/experts') ||
    req.originalUrl.includes('/api/admin/resources') ||
    req.originalUrl.includes('/api/admin/api_logs');

  if (isAnalyticsOrAdminRead) {
    return next();
  }

  const startTime = Date.now();

  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      
      await db.collection('api_logs').add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        path: req.baseUrl + req.path,
        method: req.method,
        statusCode: res.statusCode,
        duration: duration,
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
      });
    } catch (err) {
      console.error('Error logging API usage:', err);
    }
  });

  next();
};
