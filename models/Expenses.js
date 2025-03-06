// models/Expenses.js
const { DataTypes } = require('sequelize');
const sequelize = require('.');  // Import Sequelize instance
const Property = require('./Property');  // Import Property model

const Expenses = sequelize.define('Expenses', {
  // id field (Primary Key, Auto-Incremented)
  id: {
    type: DataTypes.INTEGER,  // Or DataTypes.INTEGER, depending on your preference
    primaryKey: true,
    autoIncrement: true, // Auto-incrementing field (like @GeneratedValue(strategy = GenerationType.IDENTITY))
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,  // Name is required
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false,  // Amount is required
  },
  propertyId:{
    type: DataTypes.INTEGER,
    allowNull:false,
  }
}, {
  // Optional: Table name (defaults to plural form of model name, 'Expenses')
  tableName: 'expenses',
  timestamps: true,  // If you don't need `createdAt` and `updatedAt`
});

// Define the relationship (many expenses belong to one property)
Expenses.belongsTo(Property, {
  foreignKey: 'propertyId', // Foreign key field in the Expenses table
  targetKey: 'id',  // Corresponds to the 'id' field in the Property model
  as: 'property',  // Alias for the association
});

module.exports = Expenses;
