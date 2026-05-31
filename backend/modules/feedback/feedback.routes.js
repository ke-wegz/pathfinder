const express = require('express');
const router = express.Router();
const feedbackController = require('./feedback.controller');
const { protect } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/requireRole');

router.use(protect); // All feedback routes require auth

router.post('/', feedbackController.submitFeedback);
router.get('/summary', authorize('Admin'), feedbackController.getFeedbackSummary);

module.exports = router;
