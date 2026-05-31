const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().required().email(),
  role: Joi.string().valid('Standard', 'Expert', 'Admin').optional()
});

module.exports = {
  registerSchema
};
