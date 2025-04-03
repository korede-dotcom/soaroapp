// validation/roomValidation.js
// validation/roomValidation.js
const Joi = require('joi');


const roomSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  floor: Joi.string().allow('', null).max(50),
  number: Joi.string().allow('', null).max(50),
  propertyId: Joi.number().integer().required(),
  roomType: Joi.string().valid('1bedroom', '2bedroom', '3bedroom','shop').default('1bedroom'),
  yearlyAmount: Joi.number().precision(2).default(0),
  roomCategory: Joi.string().valid('rent', 'lease', 'sold').default('rent'),
  status: Joi.string().valid('vancant', 'not-vacant', 'sold').default('vancant'),
  imageUrl: Joi.array().items(Joi.object({
    id: Joi.number().integer().required(),
    url: Joi.string().uri().required(),
  })).optional(),
});



module.exports = roomSchema;
