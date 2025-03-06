// models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/config'); // Import the config

// Set up the Sequelize instance
const environment = process.env.NODE_ENV || 'development';  // Get environment (development or production)
const configData = config[environment];

// Initialize Sequelize
const sequelize = new Sequelize(configData.database, configData.username, configData.password, {
  host: configData.host,
  dialect: configData.dialect,
  logging: false /*environment === 'development'*/,  // Enable logging only in development
});





module.exports = sequelize;
