// models/Tenants.js
const { DataTypes } = require('sequelize');
const sequelize = require('../models');  // Import Sequelize instance
const Property = require('./Property');  // Import Property model
const Room = require('./Room');  // Import Room model

const Tenants = sequelize.define('Tenants', {
  // id field (Primary Key, Auto-Incremented)
  id: {
    type: DataTypes.INTEGER,  // Or DataTypes.INTEGER, depending on your preference
    primaryKey: true,
    autoIncrement: true,  // Auto-incrementing field (like @GeneratedValue(strategy = GenerationType.IDENTITY))
  },
  propertyId:{
    type: DataTypes.INTEGER,
    allowNull:false,
  },
  createdBy:{
    type: DataTypes.INTEGER,
    allowNull:true,
},
  roomId:{
    type: DataTypes.INTEGER,
    allowNull:true,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lcg: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  previousAddress:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  previousLandlord:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  NextPaymentYear:{
    type: DataTypes.DATEONLY,
    // allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guarantor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guarantorPhonenumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guarantorAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  occupation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  maritalStatus:{
    type:DataTypes.ENUM("single","married","divorced","widow"),
    defaultValue:"married"
  },
  spouseName:{
    type: DataTypes.STRING,
  },
  gender:{
    type:DataTypes.ENUM("male","female"),
    defaultValue:"male"
  },
  isPrevious:{
    type: DataTypes.BOOLEAN,
    defaultValue:false
  },
  lastUsed:{
    type: DataTypes.DATEONLY,
    allowNull:true
  },
  phonenumber:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  familycount:{
    type:DataTypes.INTEGER,
    allowNull:false
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
  // Optional: Table name (defaults to plural form of model name, 'Tenants')
  tableName: 'tenants',
  timestamps: true,
    // If you don't need `createdAt` and `updatedAt`
});

// Define the relationships

// Many-to-One relationship: Tenants belong to one Property
//Tenants.belongsTo(Property, {
  //foreignKey: 'propertyId',  // Foreign key in the Tenants table
  //targetKey: 'id',  // Corresponds to the 'id' field in the Property model
  //as: 'property',  // Alias for the association
//});

//Tenants.belongsTo(Room, {
  //foreignKey: 'roomId',
  //targetKey: 'id',
  //as: 'room',
  //onDelete: 'SET NULL',
  //onUpdate: 'CASCADE',
//});


// One-to-One relationship: Tenants belong to one Room


module.exports = Tenants;
