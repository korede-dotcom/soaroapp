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
        allowNull:true,
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
    hooks: {
        afterFind: (records) => {
            if (!records) return;
            
            // Ensure it works for both single and multiple records
            const formatDate = (record) => {
                if (record.createdAt) {
                    record.dataValues.createdAt = new Date(record.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });
                }
            };

            if (Array.isArray(records)) {
                records.forEach(formatDate);
            } else {
                formatDate(records);
            }
        }
    }
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
  