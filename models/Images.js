// models/Images.js
const { DataTypes } = require('sequelize');
const sequelize = require('../models');  // Import the Sequelize instance
const Property = require('./Property');  // Assuming Property model is defined

const Images = sequelize.define('Images', {
  // id field (Primary Key, Auto-Incremented)
  id: {
    type: DataTypes.INTEGER,  // Or DataTypes.INTEGER, depending on your preference
    primaryKey: true,
    autoIncrement: true, // Auto-incrementing field (like @GeneratedValue(strategy = GenerationType.IDENTITY))
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false, 
    defaultValue:"property" // You can adjust this depending on whether 'type' is required
  },
  imgurl: {
    type: DataTypes.STRING,
    allowNull: false,  // This field should be required
  },
  propertyId:{
    type: DataTypes.INTEGER,
    allowNull:false,
  }
}, {
  // Optional: Table name (defaults to plural form of model name, 'Images')
  tableName: 'images',
  timestamps: true,  // If no need for `createdAt` and `updatedAt`
});

// Define the relationship (many images belong to one property)
Images.belongsTo(Property, {
  foreignKey: 'propertyId', // Foreign key field in the Images table
  targetKey: 'id',  // Corresponds to the 'id' field in the Property model
  as: 'property',  // Alias for the association
});

module.exports = Images;
