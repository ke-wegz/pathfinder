const Joi = require('joi');

const goalSchema = Joi.object({
  text: Joi.string().required(),
  category: Joi.string().valid('Career', 'Academic', 'Skill', 'Personal').required(),
  priority: Joi.number().min(1).max(3).optional(),
  deadline: Joi.date().optional()
});

module.exports = {
  goalSchema
};
