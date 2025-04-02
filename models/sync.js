const sequelize = require('./index');  // Import the Sequelize instance
const User = require('./User');  // Import the User model
const Property = require('./Property');  // Import the User model
const Images = require('./Images');  // Import the User model
const Expensis = require('./Expenses');  // Import the User model
const Room = require('./Room');  // Import the User model
const Tenants = require("./Tenants");
const Lawyers = require("./Lawyer");
const PaymentRecord = require("./TenantPaymentRecord")


function sync () {
  // Sync models with the database
  sequelize.sync({})  // force: true will drop the table if it already exists (use cautiously)
    .then(() => {
      console.log('Database synchronized');
    })
    .catch((error) => {
      console.error('Error syncing database:', error);
    });

}

module.exports = {
  sync  
}  