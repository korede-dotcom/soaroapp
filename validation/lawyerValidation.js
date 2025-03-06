// validation/lawyerValidation.js
const Joi = require('joi');

const lawyerValidationSchema = Joi.object({
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

  companyName: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.base': 'Company name must be a string.',
      'string.empty': 'Company name cannot be empty.',
      'string.min': 'Company name must have at least 3 characters.',
      'string.max': 'Company name must have less than or equal to 200 characters.',
      'any.required': 'Company name is required.',
    }),

  address: Joi.string()
    .min(5)
    .required()
    .messages({
      'string.base': 'Address must be a string.',
      'string.empty': 'Address cannot be empty.',
      'string.min': 'Address must have at least 5 characters.',
      'any.required': 'Address is required.',
    }),

  officeAddress: Joi.string()
    .min(5)
    .required()
    .messages({
      'string.base': 'Office address must be a string.',
      'string.empty': 'Office address cannot be empty.',
      'string.min': 'Office address must have at least 5 characters.',
      'any.required': 'Office address is required.',
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

  phonenumber: Joi.string()
    // .pattern(/^\+?[1-9]\d{1,14}$/)  // Basic regex for international phone number
    .required()
    .messages({
      'string.base': 'Phone number must be a string.',
      'string.empty': 'Phone number cannot be empty.',
      'string.pattern.base': 'Phone number must be in a valid format (e.g. +1234567890).',
      'any.required': 'Phone number is required.',
    }),

  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      'string.base': 'Email must be a string.',
      'string.empty': 'Email cannot be empty.',
      'string.email': 'Email must be a valid email address.',
      'any.required': 'Email is required.',
    }),

  // imageUrl: Joi.string()
  //   .uri()
  //   .required()
  //   .messages({
  //     'string.base': 'Image URL must be a string.',
  //     'string.empty': 'Image URL cannot be empty.',
  //     'string.uri': 'Image URL must be a valid URL.',
  //     'any.required': 'Image URL is required.',
  //   }),
  images: Joi.array().items(),

  propertyId: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Property ID must be a number.',
      'number.integer': 'Property ID must be an integer.',
      'any.required': 'Property ID is required.',
    }),
});

module.exports = lawyerValidationSchema;
