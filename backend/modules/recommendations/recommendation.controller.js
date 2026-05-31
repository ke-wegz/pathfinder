const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const recommendationService = require('./recommendation.service');

exports.generateRecommendation = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user.uid || req.user._id;
  const recommendation = await recommendationService.generateRecommendation(userId, sessionId);
  res.status(201).json(new ApiResponse(201, recommendation, 'Recommendation generated'));
});

exports.getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.uid || req.user._id;
  const recommendations = await recommendationService.getUserRecommendations(userId);
  res.status(200).json(new ApiResponse(200, recommendations));
});

exports.clearRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.uid || req.user._id;
  await recommendationService.clearRecommendations(userId);
  res.status(200).json(new ApiResponse(200, null, 'All recommendations cleared'));
});

exports.deleteRecommendationEntry = asyncHandler(async (req, res) => {
  const userId = req.user.uid || req.user._id;
  const { docId, index } = req.params;
  await recommendationService.deleteRecommendationEntry(docId, Number(index), userId);
  res.status(200).json(new ApiResponse(200, null, 'Recommendation entry removed'));
});

exports.saveRecommendation = asyncHandler(async (req, res) => {
  const userId = req.user.uid || req.user._id;
  const recommendation = await recommendationService.saveRecommendation(userId, req.body);
  res.status(201).json(new ApiResponse(201, recommendation, 'Recommendation saved manually'));
});

exports.getRecommendation = asyncHandler(async (req, res) => {
  const recommendation = await recommendationService.getRecommendationById(req.params.id);
  res.status(200).json(new ApiResponse(200, recommendation));
});
