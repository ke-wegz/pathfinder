const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const notificationService = require('./notification.service');

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(req.user._id);
  res.status(200).json(new ApiResponse(200, notifications));
});

exports.createNotification = asyncHandler(async (req, res) => {
  const { title, body, type } = req.body;
  const notification = await notificationService.createNotification(req.user._id, title, body, type);
  res.status(201).json(new ApiResponse(201, notification, 'Notification created'));
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'Notification deleted'));
});

exports.deleteAllNotifications = asyncHandler(async (req, res) => {
  await notificationService.deleteAllNotifications(req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'All notifications deleted'));
});
