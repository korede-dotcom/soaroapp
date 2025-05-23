const Joi = require('joi');

const propertySchema = Joi.object({
  name: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  lga: Joi.string().trim().required(),
  type: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  country: Joi.string().trim().required(),
  floors: Joi.number().integer().min(1).required(),
  totalroom: Joi.number().integer().min(1).required(),
  miniflat: Joi.number().integer().min(0).required(),
  miniflatamount: Joi.number().integer().min(0).required(),
  bedcount1: Joi.number().integer().min(0).required(),
  bedamount1: Joi.number().integer().min(0).required(),
  bedcount2: Joi.number().integer().min(0).required(),
  bedamount2: Joi.number().integer().min(0).required(),
  bedcount3: Joi.number().integer().min(0).required(),
  bedamount3: Joi.number().integer().min(0).required(),
  bedcount4: Joi.number().integer().min(0).required(),
  bedamount4: Joi.number().integer().min(0).required(),
  shopamount: Joi.number().integer().min(0).required(),
  shopcount: Joi.number().integer().min(0).required(),
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
  images: Joi.array().items(),
//   images: Joi.array().items(Joi.string().uri()).required(),
})
/*.custom((value, helpers) => {
  const { totalroom, bedcount1, bedcount2, bedcount3, bedcount4 } = value;
  
  const totalBeds = (bedcount1 || 0) + (bedcount2 || 0) + (bedcount3 || 0) + (bedcount4 || 0);
  console.log("🚀 ~ totalBeds:", totalBeds)
  console.log("🚀 ~ totalBeds > totalroom:", totalroom)
  
  if (totalBeds > totalroom) {
    return helpers.error('any.invalid', 'Sum of all room types should not be greater than total rooms');
  }

  return value;
}, 'Total Rooms Validation');*/

const validateProperty = (req, res, next) => {
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

module.exports = validateProperty;
