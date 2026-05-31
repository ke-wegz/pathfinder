const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const interviewService = require('./interview.service');
const userService = require('../users/user.service');
const { normalizeLanguage } = require('../../utils/languageUtils');

exports.startSession = asyncHandler(async (req, res) => {
  const profile = await userService.getUserProfile(req.user._id);
  const session = await interviewService.startSession(
    req.user._id,
    normalizeLanguage(profile?.language || 'en')
  );
  res.status(201).json(new ApiResponse(201, session, 'Interview session started'));
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const { sessionId, message } = req.body;
  const reply = await interviewService.processMessage(req.user._id, sessionId, message);
  res.status(200).json(new ApiResponse(200, reply, 'Message processed'));
});

exports.getSession = asyncHandler(async (req, res) => {
  const session = await interviewService.getSession(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, session));
});

exports.completeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const result = await interviewService.completeSession(req.user._id, sessionId);
  res.status(200).json(new ApiResponse(200, result, 'Session completed'));
});
