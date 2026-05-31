const express = require('express');
const router = express.Router();
const recommendationController = require('./recommendation.controller');
const { protect } = require('../../middleware/authenticate');
const { aiLimiter } = require('../../middleware/rateLimiter');

router.use(protect); // Require auth

router.post('/generate', aiLimiter, recommendationController.generateRecommendation);
router.post('/', recommendationController.saveRecommendation);
router.get('/', recommendationController.getRecommendations);
router.delete('/', recommendationController.clearRecommendations);
router.delete('/:docId/entry/:index', recommendationController.deleteRecommendationEntry);
router.get('/:id', recommendationController.getRecommendation);

module.exports = router;
