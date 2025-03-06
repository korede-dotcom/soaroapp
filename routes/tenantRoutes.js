// routes/tenantRoutes.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const tenantValidationSchema = require('../validation/tenantValidation'); // Import Joi validation schema
const Tenants = require('../models/Tenants');  // Sequelize model for Tenants
const Room = require("../models/Room")
const Property = require("../models/Property")
const Lands = require("../services/PropertyService")
const Sync = require("../models/index")

Tenants.belongsTo(Room,{foreignKey:"roomId"})
Tenants.belongsTo(Property,{foreignKey:"propertyId"})
// Create a new tenant
// Create a new tenant
router.post('/', async (req, res) => {
    try {
        console.log("🚀 ~ router.post ~ req.body:", req.body)
      const { error, value } = tenantValidationSchema.validate(req.body);  // Validate incoming request data
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      const transaction = await Sync.transaction();
  
      // Check if the roomId exists in the Rooms table
      const room = await Room.findByPk(value.roomId);
      if (!room) {
        return res.status(400).json({ message: 'Invalid roomId, no such room exists.' });
      }
      
      
      // If data is valid, create the new tenant
      const newTenant = await Tenants.create(value,{transaction});
      const updateRoom = await Room.update({tenantId:newTenant.id,status:"not-vacant"},{where:{id:value.roomId}},{transaction})
      transaction.commit()
      return res.status(201).json({ message: 'Tenant created successfully', tenant: newTenant });
    } catch (err) {
      transaction.rollback();
      console.error('Error creating tenant:', err);
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });
  

// Get all tenants
router.get('/', async (req, res) => {
  try {
    let tenants = await Tenants.findAll({include:[{model:Room},{model:Property}]});
    const allLands = await Lands.getAllLands();
    
    console.log("🚀 ~ router.get ~ formattedTenants:", tenants)
    if (req.query.type === "add") {
        
       
        return res.render("addtenant",{tenants,allLands})
    }
    if (req.query.type === "detail" && req.query.id) {
        console.log("🚀 ~ router.get ~ req.query.id:", req.query.id)
        tenants  = await Tenants.findOne({
          where: { id:req.query.id },
          include: [
            { model: Room },
            { model: Property }
          ]
        });
        return res.render("tenantpaymentlist",{tenants}) 
    }
    if (req.query.type === "filter" && req.query.propertyId) {
       tenants = await Tenants.findAll({
        where: { propertyId: req.query.propertyId },
        include: [
          { model: Room },
          { model: Property }
        ]
      });
      
        return res.render("tenant",{tenants,allLands}) 
    }
 
    return res.render("tenant",{tenants,allLands})
    return res.status(200).json(tenants);
  } catch (err) {
    console.error('Error fetching tenants:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Get a tenant by ID
router.get('/:id', async (req, res) => {
  const tenantId = req.params.id;
  try {
    const tenant = await Tenants.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    return res.status(200).json(tenant);
  } catch (err) {
    console.error('Error fetching tenant:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Update a tenant by ID
router.put('/:id', async (req, res) => {
  const tenantId = req.params.id;

  // Validate the input data using Joi schema
  const { error, value } = tenantValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });  // Send validation error message
  }

  try {
    const tenant = await Tenants.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // If tenant exists, update with validated data
    const updatedTenant = await tenant.update(value);
    return res.status(200).json({ message: 'Tenant updated successfully', tenant: updatedTenant });
  } catch (err) {
    console.error('Error updating tenant:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Delete a tenant by ID
router.delete('/:id', async (req, res) => {
  const tenantId = req.params.id;
  try {
    const tenant = await Tenants.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Delete tenant from the database
    await tenant.destroy();
    return res.status(200).json({ message: 'Tenant deleted successfully' });
  } catch (err) {
    console.error('Error deleting tenant:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router;
