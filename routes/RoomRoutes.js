const express = require('express');
const router = express.Router();
const Joi = require('joi');
const roomValidationSchema = require('../validation/roomValidation'); // Correctly import the validation schema
const Room = require('../models/Room');
const Property = require('../models/Property');
const Tenant = require('../models/Tenants');

Room.belongsTo(Property,{foreignKey:"propertyId"})  // Sequelize model for Room
Room.belongsTo(Tenant,{foreignKey:"propertyId"})  // Sequelize model for Room

// Create a new room
router.post('/rooms', async (req, res) => {
  try {
    const { error, value } = roomValidationSchema.validate(req.body);  // Validate the data
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const newRoom = await Room.create(value);
    return res.status(201).json({ message: 'Room created successfully', room: newRoom });
  } catch (err) {
    console.error('Error creating room:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Get all rooms
router.get('/', async (req, res) => {
  try {
    // const rooms = await Room.findAll();
    const rooms = await Room.findAll({where:{},include:[{model:Property},{model:Tenant}]});
    const property = await Property.findAll({})
    if (req.query.type === "detail" && req.query.propertyId) {
      const rooms = await Room.findAll({where:{propertyId:req.query.propertyId},include:[{model:Property},{model:Tenant}]});
      res.render("rooms",{rooms})
    }
    if (req.query.type === "filter" && req.query.propertyId) {
      const rooms = await Room.findAll({where:{propertyId:req.query.propertyId},include:[{model:Property},{model:Tenant}]});
      return res.render("rooms",{rooms,property})
    }

    console.log("🚀 ~ router.get ~ rooms:", rooms)
    return res.render("rooms",{rooms,property})
    // return res.status(200).json(rooms);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Get a room by its ID
router.get('/rooms/:propertyId', async (req, res) => {
  const propertyId = req.params.propertyId;
  console.log("🚀 ~ router.get ~ propertyId:", propertyId)
  try {
    const room = await Room.findAll({ where:{ propertyId: propertyId}});
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    return res.status(200).json(room);
  } catch (err) {
    console.error('Error fetching room:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

router.get('/rooms/:id', async (req, res) => {
  const roomId = req.params.id;
  try {
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    return res.status(200).json(room);
  } catch (err) {
    console.error('Error fetching room:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Update a room by ID
router.put('/rooms/:id', async (req, res) => {
  const roomId = req.params.id;
  const { error, value } = roomValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    const updatedRoom = await room.update(value);
    return res.status(200).json({ message: 'Room updated successfully', room: updatedRoom });
  } catch (err) {
    console.error('Error updating room:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Delete a room by ID
router.delete('/rooms/:id', async (req, res) => {
  const roomId = req.params.id;
  try {
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    await room.destroy();
    return res.status(200).json({ message: 'Room deleted successfully' });
  } catch (err) {
    console.error('Error deleting room:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router;
