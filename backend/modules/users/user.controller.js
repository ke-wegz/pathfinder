const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const userService = require('./user.service');
const { db, admin } = require('../../firebase');
const emailService = require('../../utils/emailService');
const axios = require('axios');


// @desc    Register a new user profile
// @route   POST /api/users/register
// @access  Private (Needs Firebase Token)
exports.registerUser = asyncHandler(async (req, res) => {
  // req.user._id is populated by the protect middleware
  const result = await userService.registerUser(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, result, 'User registered successfully'));
});

// @desc    Login user (Fetch profile)
// @route   POST /api/users/login
// @access  Private (Needs Firebase Token)
exports.loginUser = asyncHandler(async (req, res) => {
  const result = await userService.loginUser(req.user._id);
  res.status(200).json(new ApiResponse(200, result, 'Login successful'));
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.user._id);
  res.status(200).json(new ApiResponse(200, user));
});

// @desc    Get another user's public profile
// @route   GET /api/users/profile/:uid
// @access  Private
exports.getPublicProfile = asyncHandler(async (req, res) => {
  const targetUid = req.params.uid;
  const userProfile = await userService.getUserProfile(targetUid);
  
  if (!userProfile) {
    return res.status(404).json(new ApiResponse(404, null, 'User profile not found'));
  }
  
  const privacy = userProfile.privacySettings || {};
  
  // If profile visibility is disabled, return a restricted profile
  if (privacy.profileVisibility === false) {
    return res.status(200).json(new ApiResponse(200, {
      uid: targetUid,
      name: userProfile.name,
      isPrivate: true,
      avatar: userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'
    }));
  }
  
  // Build public profile based on privacy settings
  const publicProfile = {
    uid: targetUid,
    name: userProfile.name,
    avatar: userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U',
    isPrivate: false,
    createdAt: userProfile.createdAt,
    lastLogin: userProfile.lastLogin,
  };
  
  if (privacy.showEmail !== false) {
    publicProfile.email = userProfile.email;
  }
  if (privacy.showPhone === true) {
    publicProfile.phone = userProfile.phone;
  }
  if (privacy.showLocation !== false) {
    publicProfile.location = userProfile.location;
  }
  if (privacy.showEducation !== false) {
    publicProfile.education = userProfile.education;
  }
  if (privacy.showExperience !== false) {
    publicProfile.experience = userProfile.experience;
  }
  if (privacy.showSkills !== false) {
    publicProfile.skills = userProfile.skills;
  }
  if (privacy.showInterests !== false) {
    publicProfile.interests = userProfile.interests;
  }
  
  if (privacy.shareProgress === true) {
    publicProfile.careerGoals = userProfile.careerGoals;
    // Fetch user's goals
    const goalsSnapshot = await db.collection('goals')
      .where('userId', '==', targetUid)
      .limit(10)
      .get();
    
    publicProfile.goals = goalsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text,
        category: data.category,
        priority: data.priority,
        completed: data.completed || false,
        progress: data.progress || 0
      };
    });
  }
  
  res.status(200).json(new ApiResponse(200, publicProfile));
});


// @desc    Update user profile
// @route   PATCH /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateUserProfile(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res) => {
  await userService.deleteUserAccount(req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'Account deleted successfully'));
});

// @desc    Send OTP to email for signup verification
// @route   POST /api/users/otp/send
// @access  Public
exports.sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  // Check if user already exists in Firebase Auth
  try {
    await admin.auth().getUserByEmail(email);
    return res.status(400).json({ success: false, message: 'This email is already registered' });
  } catch (authError) {
    if (authError.code !== 'auth/user-not-found') {
      console.error('Firebase Auth search error:', authError);
      throw authError;
    }
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiration

  // Store in Firestore otps collection with email as doc ID
  await db.collection('otps').doc(email).set({
    email,
    otp,
    expiresAt,
    verified: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Send the email via Resend
  await emailService.sendOTPEmail(email, otp);

  res.status(200).json(new ApiResponse(200, null, 'Verification code sent successfully'));
});

// @desc    Verify OTP code
// @route   POST /api/users/otp/verify
// @access  Public
exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Please provide both email and verification code' });
  }

  const otpDoc = await db.collection('otps').doc(email).get();

  if (!otpDoc.exists) {
    return res.status(400).json({ success: false, message: 'No verification request found for this email' });
  }

  const data = otpDoc.data();

  if (data.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid verification code' });
  }

  if (Date.now() > data.expiresAt) {
    return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
  }

  // Mark as verified in Firestore
  await db.collection('otps').doc(email).update({
    verified: true,
    verifiedAt: Date.now()
  });

  res.status(200).json(new ApiResponse(200, null, 'Email verified successfully'));
});

// @desc    Reset all user data
// @route   DELETE /api/users/reset-data
// @access  Private (Needs Firebase Token)
exports.resetData = asyncHandler(async (req, res) => {
  await userService.resetUserData(req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'All user data has been successfully reset'));
});

// @desc    Send OTP for forgot password verification
// @route   POST /api/users/otp/send-forgot-password
// @access  Public
exports.sendForgotPasswordOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  // Check if user exists in Firebase Auth
  try {
    await admin.auth().getUserByEmail(email);
  } catch (authError) {
    if (authError.code === 'auth/user-not-found') {
      return res.status(400).json({ success: false, message: 'User with this email does not exist' });
    }
    console.error('Firebase Auth search error:', authError);
    throw authError;
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiration

  // Store in Firestore otps collection with email as doc ID
  await db.collection('otps').doc(email).set({
    email,
    otp,
    expiresAt,
    verified: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Send the email via Resend/Brevo (new sendPasswordResetOTPEmail function)
  await emailService.sendPasswordResetOTPEmail(email, otp);

  res.status(200).json(new ApiResponse(200, null, 'Password reset verification code sent successfully'));
});

// @desc    Reset user password after OTP verification
// @route   POST /api/users/otp/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both email and new password' });
  }

  // Security check: Verify that the email was verified via OTP in the last 15 minutes
  const otpDoc = await db.collection('otps').doc(email).get();
  if (!otpDoc.exists) {
    return res.status(400).json({ success: false, message: 'Email verification is required before resetting password' });
  }

  const otpData = otpDoc.data();
  if (!otpData.verified) {
    return res.status(400).json({ success: false, message: 'Email verification is required before resetting password' });
  }

  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  if (!otpData.verifiedAt || otpData.verifiedAt < fifteenMinutesAgo) {
    return res.status(400).json({ success: false, message: 'Email verification session has expired. Please verify again.' });
  }

  // Fetch the Firebase User to verify and get UID
  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
  } catch (authError) {
    if (authError.code === 'auth/user-not-found') {
      return res.status(400).json({ success: false, message: 'User with this email does not exist' });
    }
    console.error('Firebase Auth search error:', authError);
    throw authError;
  }

  // Update password in Firebase Auth
  await admin.auth().updateUser(userRecord.uid, { password });

  // Delete the OTP document so it cannot be reused
  await db.collection('otps').doc(email).delete();

  res.status(200).json(new ApiResponse(200, null, 'Password reset successfully'));
});

// @desc    Change logged in user's password
// @route   POST /api/users/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
  }

  const email = req.user.email;
  const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAUJ9q_dnKYWX0bE0-M9LMS91fKRdAUc0o';

  // Verify the current password by signing in to Firebase Auth REST API
  try {
    await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
      email,
      password: currentPassword,
      returnSecureToken: true
    });
  } catch (error) {
    const firebaseErrorMessage = error.response?.data?.error?.message;
    console.error('Firebase sign-in verification failed:', firebaseErrorMessage || error.message);
    if (firebaseErrorMessage === 'INVALID_PASSWORD') {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }
    return res.status(400).json({ success: false, message: 'Current password verification failed' });
  }

  // Update password in Firebase Auth
  try {
    await admin.auth().updateUser(req.user.uid, { password: newPassword });
  } catch (authError) {
    console.error('Firebase Auth password update failed:', authError);
    return res.status(500).json({ success: false, message: 'Failed to update password. Please try again.' });
  }

  res.status(200).json(new ApiResponse(200, null, 'Password updated successfully'));
});




