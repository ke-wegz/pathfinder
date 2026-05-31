const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const userService = require('./user.service');
const { db, admin } = require('../../firebase');
const emailService = require('../../utils/emailService');

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

