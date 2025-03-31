const Joi = require('joi');

const propertySchema = Joi.object({
  id: Joi.number().required(),

  images: Joi.array().items(),
//   images: Joi.array().items(Joi.string().uri()).required(),
})/*.custom((value, helpers) => {
  const { totalroom, bedcount1, bedcount2, bedcount3, bedcount4 } = value;
  
  const totalBeds = (bedcount1 || 0) + (bedcount2 || 0) + (bedcount3 || 0) + (bedcount4 || 0);
  console.log("🚀 ~ totalBeds:", totalBeds)
  console.log("🚀 ~ totalBeds > totalroom:", totalroom)
  
  if (totalBeds > totalroom) {
    return helpers.error('any.invalid', 'Sum of all room types should not be greater than total rooms');
  }

  return value;
}, 'Total Rooms Validation');*/

const validateImage = (req, res, next) => {
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

module.exports = validateImage;
