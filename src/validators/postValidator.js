const Joi = require("joi");

const postSchema = Joi.object({
  title: Joi.string().max(100).required(),
  content: Joi.string().required(),
});

const validatePost = (data) => postSchema.validate(data);

module.exports = { validatePost };
