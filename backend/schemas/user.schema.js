const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().required().email(),
  role: Joi.string().valid('Standard', 'Expert', 'Admin').optional()
});

const forgotPasswordOtpSchema = Joi.object({
  email: Joi.string().required().email()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6)
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(6)
});

module.exports = {
  registerSchema,
  forgotPasswordOtpSchema,
  resetPasswordSchema,
  changePasswordSchema
};


