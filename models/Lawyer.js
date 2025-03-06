const { DataTypes } = require('sequelize');
const sequelize = require('../models');  // Assuming sequelize instance is exported from models directory

const Lawyers = sequelize.define('lawyer', {

    id: {
        type: DataTypes.INTEGER,  // Or DataTypes.INTEGER, depending on your preference
        primaryKey: true,
        autoIncrement: true,  // Auto-incrementing field (like @GeneratedValue(strategy = GenerationType.IDENTITY))
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    companyName:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    address:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    officeAddress:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    country:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    phonenumber:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    propertyId:{
        type: DataTypes.INTEGER,
        allowNull:false,
    },
    images: {
        type: DataTypes.JSON,  // Using JSON data type
        allowNull: true,  // Optional, depending on whether you want it to be nullable or not
        // validate: {
        //     isArray(value) {
        //     if (!Array.isArray(value)) {
        //         throw new Error('imageUrl must be an array');
        //     }
        //     },
        //     isObjectArray(value) {
        //     if (value && value.some(item => typeof item !== 'object')) {
        //         throw new Error('Each item in imageUrl must be an object');
        //     }
        //     },
        // },
    },
   

})

module.exports = Lawyers;