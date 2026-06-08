const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { protect } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/requireRole');

// Protect all routes under /api/admin/ with authentication and role verification
router.use(protect);
router.use(authorize('admin'));

// Users management (4 routes)
router.get('/users', adminController.usersList);
router.patch('/users/:uid/disable', adminController.disableUser);
router.patch('/users/:uid/enable', adminController.enableUser);
router.delete('/users/:uid', adminController.deleteUser);

// Experts management (3 routes)
router.get('/experts', adminController.expertsList);
router.post('/experts', adminController.addExpert);
router.delete('/experts/:uid', adminController.removeExpert);

// Resources CRUD (4 routes)
router.get('/resources', adminController.resourcesList);
router.post('/resources', adminController.createResource);
router.put('/resources/:id', adminController.updateResource);
router.delete('/resources/:id', adminController.deleteResource);

// Analytics (1 route)
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
