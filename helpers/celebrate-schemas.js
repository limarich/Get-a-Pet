const { Joi } = require("celebrate");

const registerSchema = {
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().required(),
  phone: Joi.string().required(),
};
const loginSchema = {
  email: Joi.string().email().required(),
  password: Joi.string().required(),
};
const updateSchema = {
  name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string(),
  confirmPassword: Joi.string(),
  phone: Joi.string(),
};
module.exports = {
  registerSchema,
  loginSchema,
  updateSchema,
};
