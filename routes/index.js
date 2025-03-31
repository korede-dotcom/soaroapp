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
const { Op, fn, col } = require('sequelize');

const bcrypt = require("bcryptjs")
const authenticateUser = require("../middleware/Auth")
const jwt = require("jsonwebtoken")
const { message } = require("../validation/roomValidation")

routes.use("/property",authenticateUser,PropertyRoutes)
routes.use("/room",authenticateUser,RoomRoutes)
routes.use("/lawyer",authenticateUser,LawyerRoutes)
routes.use("/expenses",authenticateUser,ExpenseRoutes)
routes.use("/tenant",authenticateUser,tenantRoutes)
routes.use("/tool",authenticateUser,toolRoutes)
routes.use("/user",authenticateUser,userRoutes)






routes.get("/dashboard",authenticateUser,async(req,res) => {
  Property.hasMany(PaymentRecord, { foreignKey: 'propertyId' });
  PaymentRecord.belongsTo(Property, { foreignKey: 'propertyId' });
    let count ;
    let soldCount;
    if (req.user.user.roleId === 1) {
      count = await Property.count({where:{createdBy:req.user.user.id,isSold:false}})
      soldCount = await Property.count({where:{createdBy:req.user.user.id,isSold:true}})
    }
    count = await Property.count({where:{isSold:false}})
    soldCount = await Property.count({where:{isSold:true}})
    console.log("🚀 ~ routes.get ~ req.user:", req.user.user)



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

console.log("🚀 ~ routes.get ~ rentAnalytics:", rentAnalytics);

const formattedAnalytics = rentAnalytics.map(record => ({
  propertyName: record.property?.name || 'Unknown',
  propertyType: record.property?.type || 'Unknown',
  totalRent: `₦${Number(record.totalRent).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}));



console.log(formattedAnalytics);


const totalSum = rentAnalytics.reduce((sum, record) => sum + parseFloat(record.totalRent || 0), 0);


    
    res.render("dashboard",{count,soldCount,userDetails:req.user.user, analyticsData: formattedAnalytics,totalSum })
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
  tenants.forEach((tenant) => {
    eventEmitter.emit("sendReminder", tenant);
  });
  // console.log("🚀 ~ routes.get ~ tenants:", tenants)
  return res.json({tenants})
  } catch (error) {
    // console.log("🚀 ~ routes.get ~ error:", error)
    
  }
  
})

eventEmitter.on("sendReminder", async (tenant) => {
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
    const url = `https://1960sms.com/api/send/?user=korede&pass=Sulaimon&from=reminder&to=${phoneNumber}&msg=${encodeURIComponent(
      message
    )}`;
    console.log("🚀 ~ eventEmitter.on ~ url:", url)
    // Make the API request
    const response = await fetch(url);

    const result = await response.text();

 

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



    console.log(`✅ Reminder sent for ${tenant.firstname} ${tenant.lastname}`);
  } catch (error) {
    console.error(`❌ Failed to send reminder for ${tenant.id}:`, error);
  }
});



// routes.get("/property",async(req,res) => {
//     res.render("property")
// })


module.exports = routes;