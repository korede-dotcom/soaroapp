// config/config.js
module.exports = {
    development: {
      username: "postgres",  // Database username
      password: "4896",  // Database password
      database: "soaroapp",  // Database name
      host: "127.0.0.1",  // Database host (default localhost)
      dialect: "postgres",  // Dialect can be 'mysql', 'postgres', 'sqlite', etc.
    },
    production: {
      username: process.env.DB_USER,  // Database username (use environment variables in production)
      password: process.env.DB_PASSWORD,  // Database password
      database: process.env.DB_NAME,  // Database name
      host: process.env.DB_HOST,  // Database host
      dialect: "postgres",  // Dialect for production
      logging: false,  // Disable logging in production
    },
  };
  