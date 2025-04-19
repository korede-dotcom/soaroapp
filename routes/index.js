const routes = require("express").Router()
const PropertyRoutes = require("./PropertyRoutes")
const RoomRoutes = require("./RoomRoutes")
const LawyerRoutes = require("./LawyerRoutes")
const tenantRoutes = require("./tenantRoutes")
const toolRoutes = require("./ToolRoutes")
const userRoutes = require("./UserRoutes")
const ExpenseRoutes = require("./ExpenseRoutes")
const { validateLogin } = require("../validation/UserValidation")
const User = require("../models/User")
const Property = require("../models/Property")
const Expenses = require("../models/Expenses")
const Lawyer = require("../models/Lawyer")
const PropertPrevRecord = require("../models/PropertPrevRecord")
const Room = require("../models/Room")
const PaymentRecord = require("../models/TenantPaymentRecord")
const Tenants = require("../models/Tenants")
const Images = require("../models/Images")
const sequelize = require("../models")
const eventEmitter = require("../utils/events");
const querystring = require("querystring");
const { Op, fn, col,Sequelize } = require('sequelize');
const dotenv = require("dotenv").config()
const bcrypt = require("bcryptjs")
const authenticateUser = require("../middleware/Auth")
const jwt = require("jsonwebtoken")
const { message } = require("../validation/roomValidation")
const Lawyers = require("../models/Lawyer")
const Delivery = require("../models/Delivery")
const Commision = require("../models/Commission")

routes.use("/property",authenticateUser,PropertyRoutes)
routes.use("/room",authenticateUser,RoomRoutes)
routes.use("/lawyer",authenticateUser,LawyerRoutes)
routes.use("/expenses",authenticateUser,ExpenseRoutes)
routes.use("/tenant",authenticateUser,tenantRoutes)
routes.use("/tool",authenticateUser,toolRoutes)
routes.use("/user",authenticateUser,userRoutes)




routes.post("/create/ceo", async (req, res) => {
  try {
    // Validate request body with Joi
    

    const { name, email, password, roleName, phonenumber, address, roleId } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }


    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      roleName,
      phonenumber,
      address,
      roleId: roleId || 2, // Default to 2 if not provided
    });

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

routes.get("/dashboard",authenticateUser,async(req,res) => {



  Property.hasMany(PaymentRecord, { foreignKey: 'propertyId' });
  PaymentRecord.belongsTo(Property, { foreignKey: 'propertyId' });
    let count ;
    let soldCount;
    let vacant;
    let notvacant;
    let totalUsers
    let totalLawyers
    let totalRooms
    let totalTenats;
    let vancantAndNon;
    let expenses;
    if (req.user.user.roleId === 1) {
      count = await Property.count({where:{createdBy:req.user.user.id,isSold:false}})
      soldCount = await Property.count({where:{createdBy:req.user.user.id,isSold:true}})
    }
    count = await Property.count({where:{isSold:false}})
    soldCount = await Property.count({where:{isSold:true}})
    console.log("🚀 ~ routes.get ~ req.user:", req.user.user)
    vacant = await Room.count({where:{status:'vacant'}})
    totalRooms = await Room.count()
    notvacant = await Room.count({where:{status:'not-vacant'}})
    totalUsers = await User.count();
    totalLawyers = await Lawyers.count();
    totalTenats = await Tenants.count();
    expenses = await Expenses.sum("amount")
  const query = `
    SELECT 
      status, 
      COUNT(*) AS count 
    FROM "rooms" 
    WHERE status IN ('vacant', 'not-vacant') 
    GROUP BY status;
  `;

  const [results, metadata] = await sequelize.query(query);
  vancantAndNon = results;
  console.log("🚀 ~ routes.get ~ results:", results)

 


const rentAnalytics = await PaymentRecord.findAll({
  include: {
    model: Property,
    attributes: ['name', 'type']
  },
  attributes: [
    'propertyId',
    [sequelize.fn('SUM', sequelize.col('paymentrecord.amount')), 'totalRent']
  ],
  group: ['propertyId', 'property.id', 'property.name', 'property.type'],
  raw: true,
  nest: true
});

const rentAnalyticsMonth = await PaymentRecord.findAll({
  include: {
    model: Property,
    attributes: ['name', 'type']
  },
  attributes: [
    'propertyId',
    [sequelize.fn('SUM', sequelize.col('paymentrecord.amount')), 'totalRent'],
    [sequelize.fn('TRIM', sequelize.fn('TO_CHAR', sequelize.col('paymentrecord.createdAt'), 'Month')), 'paymentMonth']
  ],
  group: ['propertyId', 'property.id', 'property.name', 'property.type', 'paymentMonth'],
  raw: true,
  nest: true
});



const formattedAnalytics = rentAnalytics.map(record => ({
  propertyName: record.property?.name || 'Unknown',
  propertyType: record.property?.type || 'Unknown',
  totalRent: `₦${Number(record.totalRent).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}));


const totalSold = await Property.sum("soldAmount",{where:{isSold:true}})
console.log(totalSold);


const totalSum = rentAnalytics.reduce((sum, record) => sum + parseFloat(record.totalRent || 0), 0);



// Get today's date (without time)
const today = new Date();
today.setHours(0, 0, 0, 0);

// Get the start of this year (January 1st)
const currentYear = today.getFullYear();
const startOfThisYear = new Date(currentYear, 0, 1).toISOString().split("T")[0];

// Get the end of two years from now (December 31st)
const endOfTwoYears = new Date(currentYear + 2, 11, 31).toISOString().split("T")[0];

// Fetch properties that end within this range
const propertiesEndingWithinRange = await Property.findAll({
  where: {
    end: {
      [Op.between]: [startOfThisYear, endOfTwoYears],
    },
  },
  attributes: ["type", "name", "start", "end"], // Select specific attributes
});

// Calculate the correct percentage left
const propertiesWithPercentage = propertiesEndingWithinRange.map((property) => {
  const startDate = new Date(property.start);
  const endDate = new Date(property.end);

  // Ensure both dates are valid
  if (isNaN(startDate) || isNaN(endDate)) {
    return { ...property.toJSON(), percentageLeft: "Invalid Date" };
  }

  // If today is after or equal to the end date, force 100%
  if (today >= endDate) {
    return { ...property.toJSON(), percentageLeft: "100.00%" };
  }

  // If today is before the start date, it's 100% left
  if (today <= startDate) {
    return { ...property.toJSON(), percentageLeft: "100.00%" };
  }

  // Total duration from start to end
  const totalDuration = endDate - startDate;
  
  // Remaining time from today to end
  const timeLeft = endDate - today;

  // Percentage calculation
  let percentageLeft = ((timeLeft / totalDuration) * 100).toFixed(2);

  // If percentageLeft is "0.00%", force it to "100.00%"
  if (percentageLeft === "0.00") {
    percentageLeft = "100.00";
  }

  return {
    ...property.toJSON(),
    percentageLeft: `${percentageLeft}`,
  };
});


const recentProperties = await Property.findAll({
  order: [['createdAt', 'DESC']],  // Order by createdAt in descending order (most recent first)
  limit: 3  // Limit the results to the specified number
});

console.log("🚀 ~ routes.get ~ recentProperties:", recentProperties)

const top5Properties = await Property.findAll({
  order: [['amount', 'DESC']],  // Order by 'amount' in descending order (highest amount first)
  limit: 5  // Limit the results to the top 5
});
const top2SoldProperties = await Property.findAll({
  where:{
    isSold:true,
  },
  order: [['soldAmount', 'DESC']],  // Order by 'amount' in descending order (highest amount first)
  limit: 2  // Limit the results to the top 5
});







    
  res.render("dashboard",{count,soldCount,userDetails:req.user.user, analyticsData: formattedAnalytics,totalSum,totalSold:`₦${Number(totalSold).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,seriesData:rentAnalyticsMonth,vacant,notvacant,totalUsers,totalLawyers,totalRooms,totalTenats,vancantAndNon,propertiesEndingWithinRange,top5Properties,top2SoldProperties,expenses})
})

routes.get("/sms",authenticateUser,async(req,res) => {
  const deliveries = await Delivery.findAll({})
    res.render("deliveries",{deliveries,userDetails:req.user.user})
})

routes.get("/",async(req,res) => {
    res.render("login")
})

routes.get("/test",async(req,res) => {
    

      async function getCounts() {
        const totalProperties = await Property.count();
        const totalTenants = await Tenants.count({ where: {  } });
        const totalRooms = await Room.count({ where: {  } });
        const totalExpenses = await Expenses.count({ where: {  } });
      
        return {
          totalProperties,
          totalTenants,
          totalRooms,
          totalExpenses,
        };
      }
      async function getPaymentTrends() {
        const payments = await PaymentRecord.findAll({
          where: {  },
          attributes: [
            [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
          ],
          group: [sequelize.fn('MONTH', sequelize.col('createdAt'))],
          raw: true,
        });
      
        return payments;
      }

      async function getOccupancyRate() {
        const totalRooms = await Room.count({ where: {  } });
        const occupiedRooms = await Room.count({ where: {  status: 'not-vacant' } });
        const vacantRooms = totalRooms - occupiedRooms;
      
        return {
          totalRooms,
          occupiedRooms,
          vacantRooms,
          occupancyRate: (occupiedRooms / totalRooms) * 100,
        };
      }

      async function getIncomeVsExpenses(propertyId) {
        const income = await PaymentRecord.findAll({
          where: {  },
          attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'totalIncome']
          ],
          group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
          raw: true,
        });
      
        const expenses = await Expenses.findAll({
          where: {  },
          attributes: [
            [sequelize.fn('DATE', sequelize.col('occoured')), 'date'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'totalExpenses']
          ],
          group: [sequelize.fn('DATE', sequelize.col('occoured'))],
          raw: true,
        });
      
        return { income, expenses };
      }
      
     

      async function getDashboardData() {
        
        const occupancyRate = await getOccupancyRate();
        const counts = await getCounts();
       
        const totalProperties = await Property.count();
        const totalRooms = await Room.count();
        const totalTenants = await Tenants.count();
    
        const occupiedRooms = await Room.count({ where: { status: "not-vacant" } });
        const vacantRooms = await Room.count({ where: { status: "vacant" } });
    
        // Summing up revenue from the Room table
        const totalRevenue = await Room.sum("amount");
        const yearlyRevenue = await Room.sum("amount", {
          where: {
            updatedAt: {
              [Op.gte]: new Date(new Date().getFullYear(), 0, 1),
            },
          },
        });
    
        const monthlyRevenue = await Room.sum("amount", {
          where: {
            updatedAt: {
              [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        });
    
        const pendingPayments = await Tenants.count({
          where: {
            NextPaymentYear: {
              [Op.lt]: new Date(),
            },
          },
        });
    
        return{
          totalProperties,
          totalRooms,
          occupiedRooms,
          vacantRooms,
          totalTenants,
          totalRevenue,
          yearlyRevenue,
          monthlyRevenue,
          pendingPayments,
        };
      
        // return {
        //   // incomeVsExpenses,
        //   occupancyRate,
        //   // paymentTrends,
        //   counts,
        //   // topPaidTenants,
        //   expectedIncome,
        //   // paymentRecords,
        //   // expenseRecords,
        // };
      }
      const incc = await getDashboardData();
      res.json(incc)
})

routes.post("/login",async(req,res) => {
    const {email,password} = req.body;
    console.log("🚀 ~ routes.post ~ req.body:", req.body)
    const {error} = validateLogin(req.body)
    console.log("🚀 ~ routes.post ~ error:", error)
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const user = await User.findOne({where:{email:email.toString().trim()}})
        delete user.password
        if (!user) {
            return res.status(400).json({status:false,message:"user not found"})
        }
        const compare = await bcrypt.compare(password.toString().trim(),user.password)
        if (!compare) {
            return res.status(400).json({status:false,message:"invalid credentials"})
        }
        const token = jwt.sign({ user }, "your-secret-key", { expiresIn: "5h" });

        res.cookie("authToken", token, {
            httpOnly: true, // Prevent JavaScript access (XSS protection)
            secure: process.env.NODE_ENV === "production", // Enable secure cookies in production
            sameSite: "Strict",
        });
        return res.status(200).json({
            status:true,
            message:"Login Successful",
            user
        })
    } catch (error) {
        console.log("🚀 ~ routes.post ~ error:", error.stack

        )
        return res.status(401).json({ message: "Invalid credentials" });
    }
})

routes.post("/logout", async (req, res) => {
    res.clearCookie("authToken");
    res.redirect("/")
    // res.json({ message: "Logged out successfully" });
});

routes.post("/commission",authenticateUser, async (req, res) => {
    try {
      const getPropertyUser = await Property.findOne({where:{id:req.body.propertyId}})
        const saveCommission = await Commision.create({
          percentage:req.body.percentage,
          propertyId:req.body.propertyId,
          userId:getPropertyUser.createdBy,
        })
        console.log("🚀 ~ routes.post ~ getPropertyUser:", saveCommission)
        res.json({status:true, message: "Commission added successfully",saveCommission });
      } catch (error) {
      res.json({status:false, message: error.message});
      
    }
    // res.json({ message: "Logged out successfully" });
});

routes.post("/edit/address", authenticateUser ,async (req, res) => {
    try {
      // const getPropertyUser = await Property.findOne({where:{id:req.body.propertyId}})
      const saveCommission = await Property.update(
        { address: req.body.address },
        { where: { id: req.body.propertyId } }
      );
      
        console.log("🚀 ~ routes.post ~ getPropertyUser:", saveCommission)
        res.json({status:true, message: "address edited successfully",saveCommission });
      } catch (error) {
      res.json({status:false, message: error.message});
      
    }
    // res.json({ message: "Logged out successfully" });
});
routes.post("/edit/name", authenticateUser ,async (req, res) => {
    try {
      // const getPropertyUser = await Property.findOne({where:{id:req.body.propertyId}})
      const saveCommission = await Property.update(
        { name: req.body.name },
        { where: { id: req.body.propertyId} }
      );
      
        console.log("🚀 ~ routes.post ~ getPropertyUser:", saveCommission)
        res.json({status:true, message: "name edit successfully",saveCommission });
      } catch (error) {
      res.json({status:false, message: error.message});
      
    }
    // res.json({ message: "Logged out successfully" });
});
routes.post("/commission/edit", authenticateUser ,async (req, res) => {
    try {
      // const getPropertyUser = await Property.findOne({where:{id:req.body.propertyId}})
      const saveCommission = await Commision.update(
        { percentage: req.body.percentage },
        { where: { propertyId: req.body.propertyId } }
      );
      
        console.log("🚀 ~ routes.post ~ getPropertyUser:", saveCommission)
        res.json({status:true, message: "Commission added successfully",saveCommission });
      } catch (error) {
      res.json({status:false, message: error.message});
      
    }
    // res.json({ message: "Logged out successfully" });
});

routes.get("/reminder", async (req,res) => {
  try {
    const currentDate = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(currentDate.getMonth() + 3);
  Tenants.belongsTo(Room,{foreignKey:"roomId"})
  const tenants = await Tenants.findAll({
    where: {
      NextPaymentYear: {
        [Op.between]: [currentDate, threeMonthsLater],
      },
    },
    include: [
      {
        model: Room,
        // as:"Room"
       // Ensure this alias matches your Room association in the Tenants model
      },
    ],
  });
  if (!tenants.length) {
    return res.json({tenants})
  }


  eventEmitter.emit("AlertOwner");
  tenants.forEach((tenant) => {
    eventEmitter.emit("sendReminder", tenant);
  });
  // console.log("🚀 ~ routes.get ~ tenants:", tenants)
  return res.json({tenants})

  } catch (error) {
    // console.log("🚀 ~ routes.get ~ error:", error)
    
  }
  
})

routes.get("/reminder/property", async (req,res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the start of this year (January 1st)
    const currentYear = today.getFullYear();
    const startOfThisYear = new Date(currentYear, 0, 1).toISOString().split("T")[0];
    
    // Get the end of two years from now (December 31st)
    const endOfTwoYears = new Date(currentYear + 2, 11, 31).toISOString().split("T")[0];
    
    // Fetch properties that end within this range
    const propertiesEndingWithinRange = await Property.findAll({
      where: {
        end: {
          [Op.between]: [startOfThisYear, endOfTwoYears],
        },
      },
      attributes: ["type", "name", "start", "end"], // Select specific attributes
    });
    if (!propertiesEndingWithinRange.length) {
      return res.json({propertiesEndingWithinRange})
    }
  // eventEmitter.emit("AlertOwner");
  propertiesEndingWithinRange.forEach((prop) => {
    eventEmitter.emit("sendReminderPropertyExpiry", prop);
  });
  // console.log("🚀 ~ routes.get ~ tenants:", tenants)
  return res.json({propertiesEndingWithinRange})

  } catch (error) {
    // console.log("🚀 ~ routes.get ~ error:", error)
    
  }
  
})

eventEmitter.on("sendReminder", async (tenant) => {
  console.log("🚀 ~ eventEmitter.on ~ tenant:", tenant)
  console.log(`🔔 Processing reminder for ${tenant.firstname} ${tenant.lastname}...`);


  try {
    let phoneNumber = tenant.phonenumber.replace(/^0/, "");
    if (!phoneNumber.startsWith("234")) {
      phoneNumber = "234" + phoneNumber;
    }
    const message = `Dear ${tenant.firstname} ${tenant.lastname}, with room number ${
      tenant.Room?.number || "N/A"
    },quick reminder your rent will due on ${tenant.NextPaymentYear}`;

    // Construct URL dynamically
    const url = `https://1960sms.com/api/send/?user=${process.env.smsusername}&pass=${process.env.smspassword}&from=reminder&to=${phoneNumber}&msg=${encodeURIComponent(
      message
    )}`;
    console.log("🚀 ~ eventEmitter.on ~ url:", url)
    // Make the API request
    const response = await fetch(url);

    const result = await response.text();
    console.log("🚀 ~ eventEmitter.on ~ result:", result)

    const saveDelivery = await Delivery.create({
      status:result,
      // tenantId:tenant.id,
      // propertyId:tenant.propertyId,
      name:`${tenant.firstname} ${tenant.lastname}`,
      phoneNumber:tenant.phonenumber,
      propertyName:tenant.Room.number
    })
    console.log("🚀 ~ eventEmitter.on ~ saveDelivery:", saveDelivery)

 

    // if (!response.ok) {
    //   throw new Error(`Failed to send SMS: ${result}`);
    // }

  // const formData = new FormData();
  // // DJvNdjn95RFPL7zGAl8KxcQT3UbuaOrHyfXY1gtVEoCZI6kWmqpi20eB4whsMS
  // formData.append("token", "DJvNdjn95RFPL7zGAl8KxcQT3UbuaOrHyfXY1gtVEoCZI6kWmqpi20eB4whsMS");
  // formData.append("senderID", "soarorealty");
  // formData.append("recipients", `234${tenant.phonenumber.replace(/^0/, "")}`); // Format phone number
  // formData.append(
  //   "message",
  //   `Dear ${tenant.firstname} ${tenant.lastname}, with room number ${
  //     tenant.Room ? tenant.Room.roomNumber : "N/A"
  //   }, this is a quick reminder that your rent will be due on ${tenant.NextPaymentYear}.`
  // );

  // const response = await fetch("https://my.kudisms.net/api/corporate", {
  //   method: "POST",
  //   body: formData, // Send as FormData
  // });

  // const data = await response.json();
  // console.log("🚀 ~ eventEmitter.on ~ data: tenant", data)


  if (!response.ok) throw new Error("Failed to send reminder");



    console.log(`✅ Reminder sent for ${tenant.firstname} ${tenant.lastname}`);
  } catch (error) {
    console.error(`❌ Failed to send reminder for ${tenant.id}:`, error);
  }
});

eventEmitter.on("AlertOwner", async () => {
  try {
    let phoneNumber = process.env.OwnerphoneNumber.replace(/^0/, "");
    if (!phoneNumber.startsWith("234")) {
      phoneNumber = "234" + process.env.OwnerphoneNumber;
    }
    const message = `Dear Soaro Management,rent due notice has been sent out to Tenants logs can be view on the prtal`;

    // Construct URL dynamically
    const url = `https://1960sms.com/api/send/?user=${process.env.smsusername}&pass=${process.env.smspassword}&from=reminder&to=${phoneNumber}&msg=${encodeURIComponent(
      message
    )}`;
    console.log("🚀 ~ eventEmitter.on ~ url:", url)
    // Make the API request
    const response = await fetch(url);

    const result = await response.text();
    console.log("🚀 ~ eventEmitter.on ~ result:", result)

    const saveDelivery = await Delivery.create({
      status:result,
      name:`CEO`,
      phoneNumber:phoneNumber,
      propertyName:'due rent property'
    })
    console.log("🚀 ~ eventEmitter.on ~ saveDelivery:", saveDelivery)

    if (!response.ok) {
      throw new Error(`Failed to send SMS: ${result}`);
    }

    // const axios = require('axios');
    // const FormData = require('form-data');
    
    // const data = new FormData();
    
    // data.append('token', 'DJvNdjn95RFPL7zGAl8KxcQT3UbuaOrHyfXY1gtVEoCZI6kWmqpi20eB4whsMS'); // your API token
    // data.append('senderID', 'soarorelity');
    // data.append('recipients', `234${phoneNumber.replace(/^0/, '')}`); // Format Nigerian number
    // data.append('otp', `${message}`); // Replace with actual OTP
    // data.append('appnamecode', '2266909571'); // Replace with actual app name code
    // data.append('templatecode', '8996945894'); // Replace with actual template code
    
    // const config = {
    //   method: 'post',
    //   maxBodyLength: Infinity,
    //   url: 'https://my.kudisms.net/api/otp',
    //   headers: {
    //     ...data.getHeaders(),
    //   },
    //   data: data,
    // };
    
    // axios.request(config)
    //   .then((response) => {
    //     console.log('✅ Response:', response.data);
    //   })
    //   .catch((error) => {
    //     console.error('❌ Error:', error.response ? error.response.data : error.message);
    //   });
    

  // if (!response.ok) throw new Error("Failed to send reminder");



    console.log(`✅ Reminder sent for rent ceo`);
  } catch (error) {
    console.error(`❌ Failed to send reminder for rent ceo`, error);
  }
});

eventEmitter.on("sendReminderPropertyExpiry", async (prop) => {

  try {
    let phoneNumber = process.env.OwnerphoneNumber.replace(/^0/, "");
    if (!phoneNumber.startsWith("234")) {
      phoneNumber = "234" + process.env.OwnerphoneNumber;
    }
    const message = `Dear Soaro Management,property due notice for ${prop.name} ,type ${prop.type} will due on ${prop.end} `;

    // Construct URL dynamically
    const url = `https://1960sms.com/api/send/?user=${process.env.smsusername}&pass=${process.env.smspassword}&from=reminder&to=${phoneNumber}&msg=${encodeURIComponent(
      message
    )}`;
    console.log("🚀 ~ eventEmitter.on ~ url:", url)
    // Make the API request
    const response = await fetch(url);

    const result = await response.text();
    console.log("🚀 ~ eventEmitter.on ~ result:", result)

    const saveDelivery = await Delivery.create({
      status:result,
      name:`CEO`,
      phoneNumber:phoneNumber,
      propertyName:'due rent property'
    })
    console.log("🚀 ~ eventEmitter.on ~ saveDelivery:", saveDelivery)

 

    if (!response.ok) {
      throw new Error(`Failed to send SMS: ${result}`);
    }

  // const formData = new FormData();
  // // DJvNdjn95RFPL7zGAl8KxcQT3UbuaOrHyfXY1gtVEoCZI6kWmqpi20eB4whsMS
  // formData.append("token", "DJvNdjn95RFPL7zGAl8KxcQT3UbuaOrHyfXY1gtVEoCZI6kWmqpi20eB4whsMS");
  // formData.append("senderID", "soarorealty");
  // formData.append("recipients", `234${tenant.phonenumber.replace(/^0/, "")}`); // Format phone number
  // formData.append(
  //   "message",
  //   `Dear ${tenant.firstname} ${tenant.lastname}, with room number ${
  //     tenant.Room ? tenant.Room.roomNumber : "N/A"
  //   }, this is a quick reminder that your rent will be due on ${tenant.NextPaymentYear}.`
  // );

  // const response = await fetch("https://my.kudisms.net/api/corporate", {
  //   method: "POST",
  //   body: formData, // Send as FormData
  // });

  // if (!response.ok) throw new Error("Failed to send reminder");



    console.log(`✅ Reminder sent for rent ceo`);
  } catch (error) {
    console.error(`❌ Failed to send reminder for rent ceo`, error);
  }
});



// routes.get("/property",async(req,res) => {
//     res.render("property")
// })


module.exports = routes;