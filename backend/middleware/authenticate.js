const { admin, db } = require('../firebase');
const asyncHandler = require('../utils/asyncHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token with Firebase Admin
    const decoded = await admin.auth().verifyIdToken(token);

    const userDoc = await db.collection('users').doc(decoded.uid).get();
    
    if (!userDoc.exists) {
      // Basic info for users who just signed up and haven't created a profile yet
      req.user = { _id: decoded.uid, uid: decoded.uid, email: decoded.email };
    } else {
      req.user = { _id: decoded.uid, uid: decoded.uid, ...userDoc.data() };
    }

    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
});
