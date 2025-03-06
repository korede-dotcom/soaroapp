const express = require('express');
const router = express.Router();
const Joi = require('joi');
const  Property = require('../models/Property');  // Import necessary models
const  Expenses  = require('../models/Expenses');  



router.get('/', async (req, res) => {
    try {
    //   const tenants = await Tenants.findAll({include:[{model:Room},{model:Property}]});
      
    //   console.log("🚀 ~ router.get ~ formattedTenants:", tenants)
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