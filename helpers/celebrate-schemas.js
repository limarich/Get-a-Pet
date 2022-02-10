const { Joi } = require("celebrate");

const userSchema = {
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
const petSchema = {
  name: Joi.string().required(),
  age: Joi.number().required(),
  weight: Joi.number().required(),
  color: Joi.string().required(),
  images: Joi.string(),
};
const updatePetSchema = {
  name: Joi.string().required(),
  age: Joi.number().required(),
  weight: Joi.number().required(),
  color: Joi.string().required(),
  images: Joi.string(),
  available: Joi.boolean(),
};
module.exports = {
  userSchema,
  loginSchema,
  updateSchema,
  petSchema,
  updatePetSchema,
};
