const express = require('express');
const router = express.Router();
const Joi = require('joi');
const  Property = require('../models/Property');  // Import necessary models
const  Expenses  = require('../models/Expenses');  
const {validateUser} = require("../validation/UserValidation");
const User = require('../models/User');


router.get('/', async (req, res) => {
    try {
      if (req.query.type === "add") {
        return res.render("adduser",{userDetails:req.user.user})    
      }
      const users = await User.findAll({});
   
      return res.render("users",{users,userDetails:req.user.user})
      
    } catch (err) {
      console.error('Error fetching tenants:', err);
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });

router.post("/",async(req,res) => {

  const { error } = validateUser(req.body);
  

  if (error) {
    return res.status(400).json({ message: error.details[0].message,status:false });
  }
  try {
    const saveUser = await User.create({...req.body,password:"fileopen"});
    return res.status(201).json({status:true,message:"user created"})
  } catch (error) {

    return res.status(400).json({status:false,message:"error creating user"})
  }

})


module.exports = router;