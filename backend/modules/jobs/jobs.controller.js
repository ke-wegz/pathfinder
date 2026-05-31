const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const jobsService = require('./jobs.service');

// @desc    Get localized job listings matching career recommendations
// @route   GET /api/jobs
// @access  Private
exports.getJobs = asyncHandler(async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const result = await jobsService.getLocalizedJobs(req.user._id, forceRefresh);
  res.status(200).json(new ApiResponse(200, result, 'Localized job listings retrieved successfully'));
});

// @desc    Force refresh and regenerate localized job listings
// @route   POST /api/jobs/refresh
// @access  Private
exports.refreshJobs = asyncHandler(async (req, res) => {
  const result = await jobsService.getLocalizedJobs(req.user._id, true);
  res.status(200).json(new ApiResponse(200, result, 'Job listings regenerated successfully'));
});
