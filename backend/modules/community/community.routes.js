const express = require('express');
const router = express.Router();
const communityController = require('./community.controller');
const { protect } = require('../../middleware/authenticate');

// Public routes (if any)
router.get('/posts', communityController.getPosts);
router.get('/posts/:id', communityController.getPost);

// Protected routes
router.use(protect);
router.post('/posts', communityController.createPost);
router.put('/posts/:id', communityController.updatePost);
router.delete('/posts/:id', communityController.deletePost);

router.post('/posts/:id/like', communityController.likePost);

router.post('/posts/:id/comments', communityController.addComment);
router.get('/posts/:id/comments', communityController.getComments);
router.delete('/posts/:postId/comments/:commentId', communityController.deleteComment);

module.exports = router;
