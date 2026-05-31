const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const userService = require('./user.service');

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
