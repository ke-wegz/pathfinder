const Joi = require('joi');

const postSchema = Joi.object({
  title: Joi.string().required().max(200),
  text: Joi.string().required(),
  topic: Joi.string().optional()
});

const commentSchema = Joi.object({
  text: Joi.string().required().max(1000)
});

module.exports = {
  postSchema,
  commentSchema
};
