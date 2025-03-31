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
      if (req.user.user.roleId === 1) {
        const tenant = await Tenant.findOne({where:{id:req.query.id,createdBy:req.user.user.id}},{include:[{model:Room},{model:Property}]});
        console.log("🚀 ~ router.get ~ tenant:", tenant)
  
        return res.render("composeone",{tenant})
        
      }
      const tenant = await Tenant.findOne({where:{id:req.query.id}},{include:[{model:Room},{model:Property}]});
      console.log("🚀 ~ router.get ~ tenant:", tenant)

      return res.render("composeone",{tenant})
  }
      if (req.query.type === "compose") {
        
          if (req.user.user.roleId === 1) {
            const lands = await Property.findAll({where:{createdBy:req.user.user.id}})
            return res.render("compose",{lands})
          }
          const lands = await Property.findAll({where:{}})

          return res.render("compose",{lands})
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