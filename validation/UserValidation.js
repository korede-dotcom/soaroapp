const Joi = require('joi');

// Define validation schema for Expense
const userValidationSchema = Joi.object({
  name: Joi.string().required(),
  // password: Joi.string().required(),
  email: Joi.string().required(),
  roleName: Joi.string().required(),
  address: Joi.string().required(),
  phonenumber:Joi.string().trim().required(),
  roleId:Joi.number().integer().required(),
  // amount: Joi.number().required(),
  // propertyId: Joi.number().integer().required(), // Ensure propertyId is a valid integer
});

const LoginValidationSchema = Joi.object({
  email:Joi.string().required(),
  password:Joi.string().required(),
})

const validateUser = (userData) => {
  return userValidationSchema.validate(userData);
};
const validateLogin = (loginData) => {
  return LoginValidationSchema.validate(loginData)
}

module.exports = {
  validateUser,
  validateLogin
};
