const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { protect } = require('../../middleware/authenticate');

router.use(protect); // All notification routes require auth

router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.delete('/', notificationController.deleteAllNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
