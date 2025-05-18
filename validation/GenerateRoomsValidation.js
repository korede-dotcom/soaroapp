const Joi = require('joi');

const validateGenerateRoom = (req, res, next) => {
  // Filter out empty strings and create a new object with only non-empty values
  const filteredBody = Object.entries(req.body).reduce((acc, [key, value]) => {
    if (value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});

  // Create a dynamic schema based on the fields present in the filtered request
  const schema = Joi.object({
    propertyId: Joi.number().required(),
    floors: Joi.number().optional(),
    totalroom: Joi.number().optional(),
    miniflat: Joi.number().optional(),
    miniflatamount: Joi.number().optional(),
    bedcount1: Joi.number().optional(),
    bedamount1: Joi.number().optional(),
    bedcount2: Joi.number().optional(),
    bedamount2: Joi.number().optional(),
    bedcount3: Joi.number().optional(),
    bedamount3: Joi.number().optional(),
    bedcount4: Joi.number().optional(),
    bedamount4: Joi.number().optional(),
    shopcount: Joi.number().optional(),
    shopamount: Joi.number().optional()
  }).min(2); // At least propertyId and one other field must be present

  const { error } = schema.validate(filteredBody, { 
    abortEarly: false,
    stripUnknown: true, // This will remove unknown fields
    convert: true // This will attempt to convert string numbers to actual numbers
  });

  if (error) {
    return res.status(400).json({
      status: false,
      errors: error.details.map(err => err.message)
    });
  }

  // Replace the original body with the filtered body
  req.body = filteredBody;
  next();
};

module.exports = validateGenerateRoom;
