const express = require('express');
const AppError = require('./utils/AppError');
const errorHandler = require('./middleware/Errorhandler');
const catchAsync = require('./utils/catchAsync');
const cors = require("cors")
require("dotenv").config()
const { Sequelize } = require('sequelize');
const {sync} = require("./models/sync")
const app = express();
const routes = require("./routes/index")
const path = require("path")
const cookieParser = require("cookie-parser");

app.use(cors());




app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser()); 

app.set('view engine', 'ejs');


// Middleware to serve static files (like CSS, JS, images)
app.use(express.static(path.join(__dirname, 'views')));
// app.use((req, res, next) => {
//   if (req.path.startsWith('/portal')) {
//     app.use(express.static(path.join(__dirname, 'views/portal')));
//     app.set('views', path.join(__dirname, 'views', 'portal'));
//   } else {
//     app.set('views', path.join(__dirname, 'views'));
//   }
//   next();
// });





app.use(routes)


// Handle non-existent routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  });
  
  // Global error handler (must be the last middleware)
  app.use(errorHandler);

  


  
  // Start the server
  const port = 3010;
  app.listen(port, () => {
    sync()
    console.log(`App running on port ${port}`);
  });