// validation/tenantValidation.js
const Joi = require('joi');

const tenantValidationSchema = Joi.object({
  propertyId: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Property ID must be a number.',
      'number.integer': 'Property ID must be an integer.',
      'any.required': 'Property ID is required.',
    }),
    imageUrl: Joi.array().items(Joi.object({
      id: Joi.string().required(),
      url: Joi.string().uri().required(),
    })).optional(),
    NextPaymentYear: Joi.string().optional(),

  roomId: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Room ID must be a number.',
      'number.integer': 'Room ID must be an integer.',
      'any.required': 'Room ID is required.',
    }),

  firstname: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'First name must be a string.',
      'string.empty': 'First name cannot be empty.',
      'string.min': 'First name must have at least 3 characters.',
      'string.max': 'First name must have less than or equal to 100 characters.',
      'any.required': 'First name is required.',
    }),

  lastname: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'Last name must be a string.',
      'string.empty': 'Last name cannot be empty.',
      'string.min': 'Last name must have at least 3 characters.',
      'string.max': 'Last name must have less than or equal to 100 characters.',
      'any.required': 'Last name is required.',
    }),

  state: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.base': 'State must be a string.',
      'string.empty': 'State cannot be empty.',
      'string.min': 'State must have at least 3 characters.',
      'any.required': 'State is required.',
    }),

  lcg: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.base': 'LCG must be a string.',
      'string.empty': 'LCG cannot be empty.',
      'string.min': 'LCG must have at least 3 characters.',
      'any.required': 'LCG is required.',
    }),

  country: Joi.string()
    .min(2)
    .required()
    .messages({
      'string.base': 'Country must be a string.',
      'string.empty': 'Country cannot be empty.',
      'string.min': 'Country must have at least 2 characters.',
      'any.required': 'Country is required.',
    }),

  previousAddress: Joi.string()
    .min(5)
    .required()
    .messages({
      'string.base': 'Previous address must be a string.',
      'string.empty': 'Previous address cannot be empty.',
      'string.min': 'Previous address must have at least 5 characters.',
      'any.required': 'Previous address is required.',
    }),

  previousLandlord: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.base': 'Previous landlord must be a string.',
      'string.empty': 'Previous landlord cannot be empty.',
      'string.min': 'Previous landlord must have at least 3 characters.',
      'any.required': 'Previous landlord is required.',
    }),

  guarantor: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.base': 'Guarantor must be a string.',
      'string.empty': 'Guarantor cannot be empty.',
      'string.min': 'Guarantor must have at least 3 characters.',
      'any.required': 'Guarantor is required.',
    }),

  guarantorPhonenumber: Joi.string()
    // .pattern(/^\+?[1-9]\d{1,14}$/)  // Basic regex for international phone number
    .required()
    .messages({
      'string.base': 'Guarantor phone number must be a string.',
      'string.empty': 'Guarantor phone number cannot be empty.',
      'string.pattern.base': 'Guarantor phone number must be in a valid format (e.g. +1234567890).',
      'any.required': 'Guarantor phone number is required.',
    }),

  guarantorAddress: Joi.string()
    .min(5)
    .required()
    .messages({
      'string.base': 'Guarantor address must be a string.',
      'string.empty': 'Guarantor address cannot be empty.',
      'string.min': 'Guarantor address must have at least 5 characters.',
      'any.required': 'Guarantor address is required.',
    }),

  occupation: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.base': 'Occupation must be a string.',
      'string.empty': 'Occupation cannot be empty.',
      'string.min': 'Occupation must have at least 3 characters.',
      'any.required': 'Occupation is required.',
    }),

  maritalStatus: Joi.string()
    .valid("single", "married", "divorced", "widow")
    .default("married")
    .messages({
      'string.base': 'Marital status must be a string.',
      'string.empty': 'Marital status cannot be empty.',
      'any.only': 'Marital status must be one of the following: single, married, divorced, widow.',
    }),

  spouseName: Joi.string()
    .optional()
    .messages({
      'string.base': 'Spouse name must be a string.',
      'string.empty': 'Spouse name cannot be empty.',
    }),

  gender: Joi.string()
    .valid("male", "female")
    .default("male")
    .messages({
      'string.base': 'Gender must be a string.',
      'string.empty': 'Gender cannot be empty.',
      'any.only': 'Gender must be either male or female.',
    }),

  phonenumber: Joi.string()
    // .pattern(/^\+?[1-9]\d{1,14}$/)  // Phone number validation regex
    .required()
    .messages({
      'string.base': 'Phone number must be a string.',
      'string.empty': 'Phone number cannot be empty.',
      'string.pattern.base': 'Phone number must be in a valid format (e.g. +1234567890).',
      'any.required': 'Phone number is required.',
    }),

  familycount: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Family count must be a number.',
      'number.integer': 'Family count must be an integer.',
      'any.required': 'Family count is required.',
    }),
});

module.exports = tenantValidationSchema;
