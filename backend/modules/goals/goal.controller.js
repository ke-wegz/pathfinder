const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const goalService = require('./goal.service');

exports.getGoals = asyncHandler(async (req, res) => {
  const goals = await goalService.getUserGoals(req.user._id);
  res.status(200).json(new ApiResponse(200, goals));
});

exports.getGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.getGoalById(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, goal));
});

exports.createGoal = asyncHandler(async (req, res) => {
  const newGoal = await goalService.createGoal(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, newGoal, 'Goal created successfully'));
});

exports.updateGoal = asyncHandler(async (req, res) => {
  const updatedGoal = await goalService.updateGoal(req.params.id, req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, updatedGoal, 'Goal updated successfully'));
});

exports.updateProgress = asyncHandler(async (req, res) => {
  const updatedGoal = await goalService.updateProgress(req.params.id, req.user._id, req.body.progress);
  res.status(200).json(new ApiResponse(200, updatedGoal, 'Progress updated'));
});

exports.deleteGoal = asyncHandler(async (req, res) => {
  await goalService.deleteGoal(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'Goal deleted successfully'));
});
