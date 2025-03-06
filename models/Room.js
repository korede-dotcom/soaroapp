// models/Room.js
const { DataTypes } = require('sequelize');
const sequelize = require('../models');  // Import the Sequelize instance
const Property = require('./Property');  // Import the Property model

const Room = sequelize.define('Room', {
  // id field (Primary Key, Auto-Incremented)
  id: {
    type: DataTypes.INTEGER,  // Or DataTypes.INTEGER, depending on your preference
    primaryKey: true,
    autoIncrement: true,  // Auto-incrementing field (like @GeneratedValue(strategy = GenerationType.IDENTITY))
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,  // Name of the room is required
  },
  floor: {
    type: DataTypes.STRING,
    allowNull: true,  // Optional: If floor is not required, set to allowNull: true
  },
  number: {
    type: DataTypes.STRING,
    allowNull: true,  // Optional: If room number is not required, set to allowNull: true
  },
  tenantId:{
    type: DataTypes.INTEGER,
    allowNull:true,
  },
  propertyId:{
    type: DataTypes.INTEGER,
    allowNull:false,
  },
  roomType:{
    type:DataTypes.ENUM("1bedroom","2bedroom","3bedroom"),
    defaultValue:"1bedroom",
  },
  yearlyAmount:{
      type:DataTypes.DOUBLE,
      defaultValue:"0.0"
  },
  roomCategory:{
    type:DataTypes.ENUM("rent","lease","sold"),
    defaultValue:"rent",
  },
  status:{
    type:DataTypes.ENUM("vacant","not-vacant","sold"),
    defaultValue:"vancant"
  },
  imageUrl: {
    type: DataTypes.JSON,  // Using JSON data type
    allowNull: true,  // Optional, depending on whether you want it to be nullable or not
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('imageUrl must be an array');
        }
      },
      isObjectArray(value) {
        if (value && value.some(item => typeof item !== 'object')) {
          throw new Error('Each item in imageUrl must be an object');
        }
      },
    },
  },
}, {
  // Optional: Table name (defaults to plural form of model name, 'Rooms')
  tableName: 'rooms',
  timestamps: true,  // If you don't need `createdAt` and `updatedAt` columns
});

// Define the relationship (many rooms belong to one property)
Room.belongsTo(Property, {
  foreignKey: 'propertyId',  // Foreign key field in the Room table
  targetKey: 'id',  // Corresponds to the 'id' field in the Property model
  as: 'property',  // Alias for the association
});

module.exports = Room;
