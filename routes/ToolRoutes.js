const express = require('express');
const router = express.Router();
const Joi = require('joi');
const  Property = require('../models/Property');  // Import necessary models
const  Expenses  = require('../models/Expenses');  
const Tenant = require("../models/Tenants")
const Room = require("../models/Room")
Tenant.belongsTo(Property,{foreignKey:"propertyId"})
Tenant.belongsTo(Room,{foreignKey:"roomId"})





router.get('/', async (req, res) => {
    try {
    //   const tenants = await Tenants.findAll({include:[{model:Room},{model:Property}]});
      
    //   console.log("🚀 ~ router.get ~ formattedTenants:", tenants)
    if (req.query.type === "compose" && req.query.id) {
      const tenant = await Tenant.findOne({where:{id:req.query.id}},{include:[{model:Room},{model:Property}]});
      console.log("🚀 ~ router.get ~ tenant:", tenant)
      return res.render("composeone",{tenant})
  }
      if (req.query.type === "compose") {
         
          return res.render("compose")
      }
    
      if (req.query.type === "deliveries") {
         
          return res.render("addtenant",{tenants,allLands})
      }
      if (req.query.type === "calendar") {
         
          return res.render("constructioncalendar")
      }
      if (req.query.type === "detail" && req.query.id) {
          return res.render("tenantpaymentlist",{tenants})
          
      }
   
      return res.render("compose")
      return res.status(200).json(tenants);
    } catch (err) {
      console.error('Error fetching tenants:', err);
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });


module.exports = router;