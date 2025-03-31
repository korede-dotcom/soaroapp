const Joi = require('joi');

const generateRoomSchema = Joi.object({
 
  floors: Joi.number().integer().min(1).required(),
  totalroom: Joi.number().integer().min(1).required(),
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

  
  prevOwnerName: Joi.string().trim().required(),
  prevOwnerPhone: Joi.string().trim().required(),
  prevOwnerEmail: Joi.string().trim().email().required(),
  prevOwnerAddress: Joi.string().trim().required(),

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

const validateGenerateRoom = (req, res, next) => {
  const { error } = generateRoomSchema.validate(req.body, { abortEarly: false });

  console.log("🚀 ~ validateProperty ~ eq.body:", req.body)
  if (error) {
    return res.status(400).json({
      status: false,
      errors: error.details.map((err) => err.message),
    });
  }
  
  next();
};

module.exports = validateGenerateRoom;
