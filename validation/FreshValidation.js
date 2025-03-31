const Joi = require('joi');

const propertySchema = Joi.object({
  name: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  lga: Joi.string().trim().required(),
  type: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  country: Joi.string().trim().required(),
  
  
//   shopcount: Joi.number().integer().min(0).allow('', null),
  sqm: Joi.number().integer().min(0).required(),
  amount: Joi.number().integer().min(1).required(),
  description: Joi.string().trim().required(),
  start: Joi.date().iso().required(),
  // end: Joi.date().iso().greater(Joi.ref('start')).required().optional(),
  // end: Joi.date().allow(null).optional(),
  end: Joi.alternatives().conditional('start', {
    is: Joi.exist(),
    then: Joi.alternatives().try(
      Joi.date().iso().greater(Joi.ref('start')).raw(),
      Joi.valid(null, '') // Explicitly allow null and empty string
    ).required(),
    otherwise: Joi.alternatives().try(
      Joi.date().iso().raw(),
      Joi.valid(null, '')
    )
  }).default(null), 
  
  prevOwnerName: Joi.string().trim().required(),
  prevOwnerPhone: Joi.string().trim().required(),
  prevOwnerEmail: Joi.string().trim().email().required(),
  prevOwnerAddress: Joi.string().trim().required(),
  
//   images: Joi.array().items(Joi.string().uri()).required(),
})

const validatePropertyLand = (req, res, next) => {
    const { error } = propertySchema.validate(req.body, { abortEarly: false });
  
    console.log("🚀 ~ validateProperty ~ eq.body:", req.body)
    if (error) {
      return res.status(400).json({
        status: false,
        errors: error.details.map((err) => err.message),
      });
    }
    
    next();
  };

  module.exports = validatePropertyLand;