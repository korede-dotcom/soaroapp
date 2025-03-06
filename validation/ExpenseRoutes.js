const Joi = require('joi');

// Define validation schema for Expense
const expenseValidationSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.number().required(),
  propertyId: Joi.number().integer().required(), // Ensure propertyId is a valid integer
});

const validateExpense = (expenseData) => {
  return expenseValidationSchema.validate(expenseData);
};

module.exports = {
  validateExpense,
};
