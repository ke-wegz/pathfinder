const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const cvService = require('./cv.service');

exports.getCV = asyncHandler(async (req, res) => {
  const userId = req.user.uid || req.user._id;
  const cv = await cvService.getUserCV(userId);
  if (!cv) {
    return res.status(200).json(new ApiResponse(200, null, 'No CV found'));
  }
  res.status(200).json(new ApiResponse(200, cv));
});

exports.generateCV = asyncHandler(async (req, res) => {
  const userId = req.user.uid || req.user._id;
  const cv = await cvService.generateCV(userId);
  res.status(201).json(new ApiResponse(201, cv, 'CV generated successfully'));
});

exports.updateCV = asyncHandler(async (req, res) => {
  const userId = req.user.uid || req.user._id;
  const cv = await cvService.updateCV(userId, req.body);
  res.status(200).json(new ApiResponse(200, cv, 'CV updated successfully'));
});

exports.deleteCV = asyncHandler(async (req, res) => {
  const userId = req.user.uid || req.user._id;
  await cvService.deleteCV(userId);
  res.status(200).json(new ApiResponse(200, null, 'CV deleted successfully'));
});
