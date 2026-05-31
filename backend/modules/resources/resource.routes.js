const express = require('express');
const router = express.Router();
const resourceController = require('./resource.controller');
const { protect } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/requireRole');

router.get('/', resourceController.getResources);
router.get('/:id', resourceController.getResource);

// Admin / Expert only routes
router.use(protect);
router.post('/', authorize('Admin', 'Expert'), resourceController.createResource);
router.put('/:id', authorize('Admin', 'Expert'), resourceController.updateResource);
router.delete('/:id', authorize('Admin', 'Expert'), resourceController.deleteResource);

module.exports = router;
