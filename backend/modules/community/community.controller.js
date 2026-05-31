const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const communityService = require('./community.service');

exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await communityService.getAllPosts(req.query);
  res.status(200).json(new ApiResponse(200, posts));
});

exports.getPost = asyncHandler(async (req, res) => {
  const post = await communityService.getPostById(req.params.id);
  res.status(200).json(new ApiResponse(200, post));
});

exports.createPost = asyncHandler(async (req, res) => {
  const post = await communityService.createPost(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, post, 'Post created'));
});

exports.updatePost = asyncHandler(async (req, res) => {
  const post = await communityService.updatePost(req.params.id, req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, post, 'Post updated'));
});

exports.deletePost = asyncHandler(async (req, res) => {
  await communityService.deletePost(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'Post deleted'));
});

exports.likePost = asyncHandler(async (req, res) => {
  const post = await communityService.likePost(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, post, 'Post liked'));
});

exports.addComment = asyncHandler(async (req, res) => {
  const comment = await communityService.addComment(req.params.id, req.user._id, req.body.text);
  res.status(201).json(new ApiResponse(201, comment, 'Comment added'));
});

exports.getComments = asyncHandler(async (req, res) => {
  const comments = await communityService.getCommentsForPost(req.params.id);
  res.status(200).json(new ApiResponse(200, comments));
});

exports.deleteComment = asyncHandler(async (req, res) => {
  await communityService.deleteComment(req.params.postId, req.params.commentId, req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'Comment deleted'));
});
