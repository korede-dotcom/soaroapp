// routes/tenantRoutes.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const tenantValidationSchema = require('../validation/tenantValidation'); // Import Joi validation schema
const Tenants = require('../models/Tenants');  // Sequelize model for Tenants
const Room = require("../models/Room")
const Property = require("../models/Property")
const TenantPaymentRecord = require("../models/TenantPaymentRecord")
const Lands = require("../services/PropertyService")
const Sync = require("../models/index")
const { Op } = require('sequelize');


Tenants.belongsTo(Room,{foreignKey:"roomId"})
Tenants.belongsTo(Property,{foreignKey:"propertyId"})
// Create a new tenant
// Create a new tenant
router.post('/', async (req, res) => {
  const transaction = await Sync.transaction();
    try {

      if (req.query.type === "pay") {
          const {end,propertyId,roomId,tenantId} = req.body;
          console.log("🚀 ~ router.post ~ req.body:", req.body)
          if (!end || !propertyId || !roomId || !tenantId) {
            return res.json({status:false,message:"please input dates"})
          }
         

          const CheckPropertyEndDate = await Property.findOne({
            where: {
              id:propertyId,   
            },
          });

          if (!CheckPropertyEndDate) {
            return res.json({status:false,message:"Invalid Property"})
          }
          if (CheckPropertyEndDate && CheckPropertyEndDate.end) {
            const checkEndDate = new Date(CheckPropertyEndDate.end);
            const inputDate = new Date(end);
            const getStart = new Date();
          
            if (inputDate.getFullYear() > checkEndDate.getFullYear()) {
              console.log("Invalid: The end date's year is greater than the allowed year.");
              if (CheckPropertyEndDate.type !== "PERSONAL") {
                return res.status(400).json({status:false,message:`Error this property is not personal owned it's ${CheckPropertyEndDate.type} tenant payment end date is greater than property end date`})
              }
              res.json({status:false,message:`Error Occured`})
            } else {
              console.log("🚀 ~ router.post ~ CheckPropertyEndDate:", CheckPropertyEndDate)
              const savePayment = await TenantPaymentRecord.create({...req.body,start:getStart.getFullYear()})
              console.log("🚀 ~ router.post ~ savePayment:", savePayment)
              const saveNextPayment = await Tenants.update({NextPaymentYear:end},{where:{id:tenantId}})
              console.log("🚀 ~ router.post ~ saveNextPayment:", saveNextPayment)
              return res.json({status:true,message:`Tenant next payment is ${end}`})
            }
            return
          } else {
            console.log("CheckPropertyEndDate or its end date is missing.");
            return res.json({status:false,message:`Error Occured`})
            
          }
          
          
      }

        console.log("🚀 ~ router.post ~ req.body:", req.body)
      const { error, value } = tenantValidationSchema.validate(req.body);  // Validate incoming request data
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
    
  
      // Check if the roomId exists in the Rooms table
      const room = await Room.findByPk(value.roomId);
      if (!room) {
        return res.status(400).json({ message: 'Invalid roomId, no such room exists.' });
      }
      
      
      // If data is valid, create the new tenant
      const newTenant = await Tenants.create(value,{transaction});
      transaction.commit()
      const updateRoom = await Room.update({tenantId:newTenant.id,status:"not-vacant"},{where:{id:value.roomId}})
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
    let tenants = await Tenants.findAll({where:{isPrevious:false},include:[{model:Room},{model:Property}]});
    const allLands = await Lands.getAllLands();
    
    
    if (req.query.type === "add") {
        
       
        return res.render("addtenant",{tenants,allLands})
    }
    if (req.query.type === "edit" && req.query.id) {
        console.log("🚀 ~ router.get ~ req.query.id:", req.query.id)
        
        tenants  = await Tenants.findOne({
          where: { id:req.query.id },
          include: [
            { model: Room },
            { model: Property }
          ]
        });
        console.log("🚀 ~ router.get ~ tenants:", tenants)

        return res.render("edittenant",{tenants}) 
    }

    if (req.query.type === "addfromroom" && req.query.id) {
        console.log("🚀 ~ router.get ~ req.query.id:", req.query.id)
        Room.belongsTo(Property,{foreignKey:"propertyId"})
        tenants  = await Room.findOne({
          where: { id:req.query.id },
          include: [
            // { model: Room },
            { model: Property }
          ]
        });
        console.log("🚀 ~ router.get ~ tenants:", tenants)

        return res.render("roomaddtenant",{tenants}) 
    }

    if (req.query.type === "detail" && req.query.id) {
        tenants  = await Tenants.findOne({
          where: { id:req.query.id },
          include: [
            { model: Room },
            { model: Property }
          ]
        });
        const paymentLogs =  await TenantPaymentRecord.findAll({where:{tenantId:req.query.id}})
        console.log("🚀 ~ router.get ~ tenants:", paymentLogs)
        return res.render("tenantpaymentlist",{tenants,paymentLogs}) 
    }

    if (req.query.type === "filter" && req.query.propertyId) {
       tenants = await Tenants.findAll({
        where: { propertyId: req.query.propertyId,isPrevious:false },
        include: [
          { model: Room },
          { model: Property }
        ]
      });
      
        return res.render("tenant",{tenants,allLands}) 
    }

    if (req.query.type === "pasttenant" && req.query.roomId) {
       tenants = await Tenants.findAll({
        where: { roomId: req.query.roomId,isPrevious:true },
        include: [
          { model: Room },
          { model: Property }
        ]
      });
      
        return res.render("pasttenant",{tenants,allLands}) 
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
  const transaction = await Sync.transaction();

  try {
    // const tenant = await Tenants.findByPk(tenantId);
    // console.log("🚀 ~ router.put ~ tenant:", tenant)
    // if (!tenant) {
    //   return res.status(404).json({ message: 'Tenant not found' });
    // }
    const date = new Date();

    // If tenant exists, update with validated data
    // const updatedTenant = await tenant.update({isPrevious:true,lastUsed:date.getFullYear()});
    const tenants = await Tenants.update({isPrevious:true,lastUsed:date.getFullYear()},{where:{id:tenantId}},{transaction});
    console.log("🚀 ~ router.put ~ tenant:", tenants)
    const newTenant = await Tenants.create(value,{transaction});
    // const updateRoom = await Room.update({tenantId:newTenant.id,status:"not-vacant"},{where:{id:value.roomId}})
    // console.log("🚀 ~ router.put ~ newTenant:", newTenant)
    // console.log("🚀 ~ router.put ~ updateRoom:", updateRoom)
    // console.log("🚀 ~ router.put ~ newTenant:", newTenant)
    // const tenants = await Tenants.update({isPrevious:true,lastUsed:date.getFullYear()},{where:{id:tenantId}});
    // console.log("🚀 ~ router.put ~ tenant:", tenants)
    transaction.commit()
        const updateRoom = await Room.update({tenantId:newTenant.id,status:"not-vacant"},{where:{id:value.roomId}})

        console.log("🚀 ~ router.put ~ updateRoom:", updateRoom)
    return res.status(200).json({ message: 'Tenant updated successfully',/* tenant: updatedTenant*/ });
  } catch (err) {
    console.error('Error updating tenant:', err);
    transaction.rollback();
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
