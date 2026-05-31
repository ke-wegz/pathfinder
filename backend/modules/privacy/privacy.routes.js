const express = require('express');
const router = express.Router();
const privacyController = require('./privacy.controller');
const { protect } = require('../../middleware/authenticate');

router.get('/data-usage-policy', privacyController.getDataUsagePolicy);
router.use(protect); // Require auth for the remaining routes

router.get('/settings', privacyController.getPrivacySettings);
router.patch('/settings', privacyController.updatePrivacySettings);

module.exports = router;
