// routes/lawyerRoutes.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const lawyerValidationSchema = require('../validation/lawyerValidation'); // Import the Joi validation schema
const Lawyers = require('../models/Lawyer');  // Sequelize model for Lawyers
const Land = require('../models/Property');

// Create a new lawyer
router.post('/', async (req, res) => {
  try {
    // Validate the incoming request data
    const { error, value } = lawyerValidationSchema.validate(req.body);  // Validate request body
    if (error) {
      return res.status(400).json({ message: error.details[0].message });  // Send validation error message
    }

    if (req.user.user.roleId === 1) {
      const newLawyer = await Lawyers.create({...value,createdBy:req.user.user.id});
      return res.status(201).json({ message: 'Lawyer created successfully', lawyer: newLawyer ,status:true});
    }
    // If data is valid, create the new lawyer
    const newLawyer = await Lawyers.create(value);
    return res.status(201).json({ message: 'Lawyer created successfully', lawyer: newLawyer ,status:true});
  } catch (err) {
    console.error('Error creating lawyer:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message,status:false });
  }
});

router.post('/add/property',async (req,res) =>{
    try {
      const {propertyId,lawyerId} = req.body;
      const addProperty = await Lawyers.update({propertyId:propertyId},{where:{id:lawyerId}})
      // if (!addProperty) {
      // }
      return res.status(200).json({ message: 'Lawyer added successfully', lawyer: addProperty ,status:true});
    } catch (error) {
      return res.status(200).json({ message: error.message ,status:false});
      
    }
})

// Get all lawyers
router.get('/', async (req, res) => {
  console.log("🚀 ~ router.get ~ req:", req.user.id)
  Lawyers.belongsTo(Land,{foreignKey:"propertyId"})
  try {
    const lawyers = await Lawyers.findAll({include:[{model:Land}]});
    const allLands = await Land.findAll();
    if (req.query.type === "add") {
        if (req.user.user.roleId === 1) {
          const allLands = await Land.findAll({where:{createdBy:req.user.user.id}});
          return res.render("addlawyer",{allLands,userDetails:req.user.user}) 
        }
        return res.render("addlawyer",{allLands,userDetails:req.user.user})    
    }
    if (req.query.type === "details" && req.query.id ) {

        if (req.user.user.roleId === 1) {
          const lawyers = await Lawyers.findAll({where:{createdBy:req.user.user.id},include:[{model:Land}]});
          return res.render("lawyerprofile",{lawyers,userDetails:req.user.user})
          
        }
         
        return res.render("lawyerprofile",{lawyers,userDetails:req.user.user})
    }
    if (req.user.user.roleId === 1) {
      const lawyers = await Lawyers.findAll({where:{createdBy:req.user.user.id},include:[{model:Land}]});
      return res.render("lawyers",{lawyers,userDetails:req.user.user})

    }
    return res.render("lawyers",{lawyers,userDetails:req.user.user})
    return res.status(200).json(lawyers);
  } catch (err) {
    console.error('Error fetching lawyers:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Get a lawyer by ID
router.get('/:id', async (req, res) => {
  const lawyerId = req.params.id;
  try {
    const lawyer = await Lawyers.findByPk(lawyerId);
    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }
    return res.status(200).json(lawyer);
  } catch (err) {
    console.error('Error fetching lawyer:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Update a lawyer by ID
router.put('/:id', async (req, res) => {
  const lawyerId = req.params.id;

  // Validate the input data using Joi schema
  const { error, value } = lawyerValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });  // Send validation error message
  }

  try {
    const lawyer = await Lawyers.findByPk(lawyerId);
    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    // If lawyer exists, update with validated data
    const updatedLawyer = await lawyer.update(value);
    return res.status(200).json({ message: 'Lawyer updated successfully', lawyer: updatedLawyer });
  } catch (err) {
    console.error('Error updating lawyer:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Delete a lawyer by ID
router.delete('/:id', async (req, res) => {
  const lawyerId = req.params.id;
  try {
    const lawyer = await Lawyers.findByPk(lawyerId);
    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    // Delete lawyer from the database
    await lawyer.destroy();
    return res.status(200).json({ message: 'Lawyer deleted successfully' });
  } catch (err) {
    console.error('Error deleting lawyer:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router;
