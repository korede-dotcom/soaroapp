// models/Land.js
const { DataTypes } = require('sequelize');
const sequelize = require('../models');  // Assuming sequelize instance is exported from models directory

const Land = sequelize.define('property', {
  // id field (Primary Key, Auto-Incremented)
  id: {
    type: DataTypes.INTEGER, // or INTEGER, depending on your preference and DB choice
    primaryKey: true,
    autoIncrement: true, // This will automatically increment the ID like `GenerationType.IDENTITY`
  },
  type:{
    type: DataTypes.STRING,
    allowNull:false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lga: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sqm: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  isSold: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  },
  floors:{
    type:DataTypes.INTEGER,
    defaultValue:1,
  },
  freshLand: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  },
  amount:{
    type:DataTypes.DOUBLE,
    defaultValue:"0.0"
  },
  created_by_name:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdBy:{
    type: DataTypes.INTEGER,
    allowNull:true,
},
  start: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  end: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  prevOwnerName:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  prevOwnerEmail:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  prevOwnerAddress:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  prevOwnerPhone:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  newOwnerName:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  newOwnerEmail:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  newOwnerAddress:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  newOwnerPhone:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  soldAmount:{
    type:DataTypes.DOUBLE,
    defaultValue:"0.0"
  },
  soldDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  // Additional model options
  tableName: 'property', // optional, but you can define the table name explicitly
  timestamps: true,  // Disable automatic timestamp columns (`createdAt`, `updatedAt`) if not needed
  hooks: {
    afterFind: (prop) => {
      if (!prop) return;
      if (Array.isArray(prop)) {
        prop.forEach(prop => {
          if (prop.amount !== null) {
            prop.amount = `₦${Number(prop.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
          }
        });
      } else {
        if (prop.amount !== null) {
          prop.amount = `₦${Number(prop.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
        }
      }
    }
  }
});

module.exports = Land;
