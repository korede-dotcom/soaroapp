// models/Images.js
const { DataTypes } = require('sequelize');
const sequelize = require('../models');  // Import the Sequelize instance
const Property = require('./Property');  // Assuming Property model is defined
const Tenants = require('./Tenants');

const Delivery = sequelize.define('Delivery', {
  // id field (Primary Key, Auto-Incremented)
  id: {
    type: DataTypes.INTEGER,  // Or DataTypes.INTEGER, depending on your preference
    primaryKey: true,
    autoIncrement: true, // Auto-incrementing field (like @GeneratedValue(strategy = GenerationType.IDENTITY))
  },
  status:{
    type:DataTypes.STRING,
    allowNull:true,
    
  },
  name:{
    type:DataTypes.STRING,
    allowNull:true,
    
  },
  phoneNumber:{
    type:DataTypes.STRING,
    allowNull:true,
    
  },
  propertyName:{
    type:DataTypes.STRING,
    allowNull:true,
    
  },
}, {
  // Optional: Table name (defaults to plural form of model name, 'Images')
  tableName: 'delivery',
  timestamps: true,  // If no need for `createdAt` and `updatedAt`
});



module.exports = Delivery;
