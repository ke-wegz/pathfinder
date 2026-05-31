const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const privacyService = require('./privacy.service');

exports.getPrivacySettings = asyncHandler(async (req, res) => {
  const settings = await privacyService.getSettings(req.user._id);
  res.status(200).json(new ApiResponse(200, settings));
});

exports.updatePrivacySettings = asyncHandler(async (req, res) => {
  const settings = await privacyService.updateSettings(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, settings, 'Privacy settings updated'));
});

exports.getDataUsagePolicy = asyncHandler(async (req, res) => {
  // Static or dynamic policy text
  res.status(200).json(new ApiResponse(200, {
    policy: "We only use your data to generate personalized recommendations. We do not sell your data."
  }));
});
