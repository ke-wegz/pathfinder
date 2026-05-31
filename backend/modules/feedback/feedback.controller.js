const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const feedbackService = require('./feedback.service');

exports.submitFeedback = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.submitFeedback(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, feedback, 'Feedback submitted successfully'));
});

exports.getFeedbackSummary = asyncHandler(async (req, res) => {
  const summary = await feedbackService.getFeedbackSummary();
  res.status(200).json(new ApiResponse(200, summary));
});
