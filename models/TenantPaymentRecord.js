const { DataTypes } = require('sequelize');
const sequelize = require('../models');  // Assuming sequelize instance is exported from models directory
const Room = require('./Room');
const Tenants = require('./Tenants');
const Property = require('./Property');

const PaymentRecord = sequelize.define('paymentrecord', {
    start:{
        type:DataTypes.DATEONLY,
        allowNull:false,
    },
    end:{
        type:DataTypes.DATEONLY,
        allowNull:false,
    },
    propertyId:{
        type: DataTypes.INTEGER,
        allowNull:false,
    },
    roomId:{
        type: DataTypes.INTEGER,
        allowNull:false, 
    },
    tenantId:{
        type: DataTypes.INTEGER,
        allowNull:false, 
    }


},{
    tableName: 'paymentrecord',
    timestamps: true, 
})

// Many-to-One relationship: Tenants belong to one Property
PaymentRecord.belongsTo(Property, {
    foreignKey: 'propertyId',  // Foreign key in the Tenants table
    targetKey: 'id',  // Corresponds to the 'id' field in the Property model
    as: 'property',  // Alias for the association
  });
  
  // One-to-One relationship: Tenants belong to one Room
  PaymentRecord.belongsTo(Room, {
    foreignKey: 'roomId',  // Foreign key in the Tenants table
    targetKey: 'id',  // Corresponds to the 'id' field in the Room model
    as: 'room',  // Alias for the association
  });
  PaymentRecord.belongsTo(Tenants, {
    foreignKey: 'tenantId',  // Foreign key in the Tenants table
    targetKey: 'id',  // Corresponds to the 'id' field in the Room model
    as: 'tenant',  // Alias for the association
  });


  module.exports = PaymentRecord;
  