// models/Expenses.js
const { DataTypes } = require('sequelize');
const sequelize = require('.');  // Import Sequelize instance
const Property = require('./Property');  // Import Property model

const Commision = sequelize.define('Commision', {
  // id field (Primary Key, Auto-Incremented)
  id: {
    type: DataTypes.INTEGER,  // Or DataTypes.INTEGER, depending on your preference
    primaryKey: true,
    autoIncrement: true, // Auto-incrementing field (like @GeneratedValue(strategy = GenerationType.IDENTITY))
  },
  percentage: {
    type: DataTypes.DOUBLE,
    allowNull: false,  // Amount is required
  },
  userId:{
      type: DataTypes.INTEGER,
     allowNull: true,
  },
  // createdBy:{
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  // },
  propertyId:{
    type: DataTypes.INTEGER,
    allowNull:false,
  }
}, {
  // Optional: Table name (defaults to plural form of model name, 'Expenses')
  tableName: 'commission',
  timestamps: true,  // If you don't need `createdAt` and `updatedAt`
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

// Define the relationship (many expenses belong to one property)
// Expenses.belongsTo(Property, {
//   foreignKey: 'propertyId', // Foreign key field in the Expenses table
//   targetKey: 'id',  // Corresponds to the 'id' field in the Property model
//   as: 'property',  // Alias for the association
// });

module.exports = Commision;
