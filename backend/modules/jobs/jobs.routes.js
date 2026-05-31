const express = require('express');
const router = express.Router();
const jobsController = require('./jobs.controller');
const { protect } = require('../../middleware/authenticate');

// Localized job search routes (all protected by firebase token)
router.get('/', protect, jobsController.getJobs);
router.post('/refresh', protect, jobsController.refreshJobs);

module.exports = router;
