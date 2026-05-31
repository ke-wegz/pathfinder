const express = require('express');
const router = express.Router();
const interviewController = require('./interview.controller');
const { protect } = require('../../middleware/authenticate');
const { aiLimiter } = require('../../middleware/rateLimiter');

router.use(protect); // Require auth

router.post('/start', aiLimiter, interviewController.startSession);
router.post('/message', aiLimiter, interviewController.sendMessage);
router.get('/sessions', interviewController.getSessions);
router.get('/session/:id', interviewController.getSession);
router.post('/complete', interviewController.completeSession);

module.exports = router;
