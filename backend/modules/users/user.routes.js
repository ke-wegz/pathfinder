const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect } = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const { registerSchema, forgotPasswordOtpSchema, resetPasswordSchema } = require('../../schemas/user.schema');

// Profile creation route after Firebase Auth
router.post('/register', protect, validate(registerSchema), userController.registerUser);

// OTP routes (public)
router.post('/otp/send', userController.sendOTP);
router.post('/otp/verify', userController.verifyOTP);
router.post('/otp/send-forgot-password', validate(forgotPasswordOtpSchema), userController.sendForgotPasswordOTP);
router.post('/otp/reset-password', validate(resetPasswordSchema), userController.resetPassword);


// Profile fetch route during login (if needed explicitly)
router.post('/login', protect, userController.loginUser);

// Profile routes (protected)
router.get('/profile', protect, userController.getProfile);
router.patch('/profile', protect, userController.updateProfile);
router.delete('/account', protect, userController.deleteAccount);
router.delete('/reset-data', protect, userController.resetData);

module.exports = router;
