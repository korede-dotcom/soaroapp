// routes/LandRoutes.js
const express = require('express');
const LandService = require('../services/PropertyService');
const validateProperty = require('../validation/PropertyValidation');
const validatePropertyLand = require('../validation/FreshValidation');
const validateGenerateRoom = require('../validation/GenerateRoomsValidation');
const validateImage = require('../validation/ImageValidation');
const router = express.Router();
const Land = require("../models/Property");
const Sync = require("../models/index")
const Room = require("../models/Room")
const Images = require("../models/Images");
const Tenants = require('../models/Tenants');
const Expenses = require('../models/Expenses');
const PrevRecord = require('../models/PropertPrevRecord');
const PropertyRecord = require('../models/PropertPrevRecord');
const PaymentRecord = require('../models/TenantPaymentRecord');
const sequelize = require("../models")
const {Sequelize,Op, where} = require("sequelize");
const Lawyers = require('../models/Lawyer');
const User = require('../models/User');
const Commision = require('../models/Commission');

// POST - Create new land
router.post('/',validateProperty, async (req, res) => {
  try {
    //   console.log("🚀 ~ router.post ~ req.body:", req.body)
    const data = await req.body;
    const transaction = await Sync.transaction(); // ✅ Ensure correct transaction initialization
    try {
      
        // Create land entry
        if (req.user.user.roleId === 1) {
          const land = await Land.create(
            {
                name: data.name,
                address: data.address,
                lga: data.lga,
                state: data.state,
                country: data.country,
                amount: data.amount,
                sqm: data.sqm,
                description:data.description,
                isSold: data.isSold,
                freshLand: data.freshLand,
                type: data.type,
                created_by_name: req.user.user.name,
                start: data.start,
                end: data.end.length > 1 ? data.end : null,
                prevOwnerAddress: data.prevOwnerAddress,
                prevOwnerName: data.prevOwnerName,
                prevOwnerPhone: data.prevOwnerPhone,
                prevOwnerEmail: data.prevOwnerEmail,
                createdBy:req.user.user.id
            },
            { transaction } // ✅ Ensure transaction is passed correctly
        );

        if (!land) {
            throw new Error("Land creation failed!");
        }

        // Extract room data
        const { miniflat,miniflatamount,totalroom, bedcount1, bedcount2, bedcount3, bedcount4, bedamount1, bedamount2, bedamount3, bedamount4,shopcount,shopamount } = data;

        let roomIndex = 1;
        let roomsToCreate = [];

        // Function to add rooms dynamically
        const addRooms = (count, type, amount) => {
            for (let i = 0; i < count; i++) {
                roomsToCreate.push({
                    number: `soaro-${data.name}-${roomIndex.toString().padStart(2, "0")}`,
                    name:`soaro-${data.name}-room-${roomIndex.toString().padStart(2, "0")}`,
                    propertyId: land.id,
                    roomType: type,
                    yearlyAmount: amount,
                    roomCategory: "rent",
                    status: "vacant",
                    createdBy:req.user.user.id
                });
                roomIndex++;
            }
        };

        // Add rooms based on counts
        addRooms(bedcount1, "1bedroom", bedamount1);
        addRooms(bedcount2, "2bedroom", bedamount2);
        addRooms(bedcount3, "3bedroom", bedamount3);
        addRooms(bedcount4, "4bedroom", bedamount4);
        addRooms(shopcount, "shop", shopamount);
        addRooms(miniflat, "miniflat", miniflatamount);

        // Validate total rooms
        console.log("🚀 ~ router.post ~ roomsToCreate.length > totalroom:", roomsToCreate.length , totalroom)
        if (roomsToCreate.length > totalroom) {
            throw new Error("Total rooms exceed allowed limit!");
        }

        // Bulk insert rooms
        const roomCreated = await Room.bulkCreate(roomsToCreate, { transaction });
        console.log("✅ Rooms created:", roomCreated.length);
        console.log("🚀 ~ router.post ~ data.Images:", data.Images)

        // Insert images asynchronously
        if (data.images?.length) {
            await Promise.all(
                data.images.map((imgUrl) =>
                    Images.create({ imgurl: imgUrl, propertyId: land.id }, { transaction })
                )
            );
            console.log("✅ Images uploaded successfully.");
        }

        await transaction.commit();
        return res.status(201).json({
            land,
            status:true,
            message:"Property created"
        });
        }

        const land = await Land.create(
            {
                name: data.name,
                address: data.address,
                lga: data.lga,
                state: data.state,
                country: data.country,
                amount: data.amount,
                sqm: data.sqm,
                description:data.description,
                isSold: data.isSold,
                freshLand: data.freshLand,
                type: data.type,
                created_by_name: req.user.user.name,
                start: data.start,
                end: data.end.length > 1 ? data.end : null,
                prevOwnerAddress: data.prevOwnerAddress,
                prevOwnerName: data.prevOwnerName,
                prevOwnerPhone: data.prevOwnerPhone,
                prevOwnerEmail: data.prevOwnerEmail,
            },
            { transaction } // ✅ Ensure transaction is passed correctly
        );

        if (!land) {
            throw new Error("Land creation failed!");
        }

        // Extract room data
        const { totalroom, bedcount1, bedcount2, bedcount3, bedcount4, bedamount1, bedamount2, bedamount3, bedamount4,shopcount,shopamount } = data;

        let roomIndex = 1;
        let roomsToCreate = [];

        // Function to add rooms dynamically
        const addRooms = (count, type, amount) => {
            for (let i = 0; i < count; i++) {
                roomsToCreate.push({
                    number: `soaro-${data.name}-${roomIndex.toString().padStart(2, "0")}`,
                    name:`soaro-${data.name}-room-${roomIndex.toString().padStart(2, "0")}`,
                    propertyId: land.id,
                    roomType: type,
                    yearlyAmount: amount,
                    roomCategory: "rent",
                    status: "vacant",
                });
                roomIndex++;
            }
        };

        // Add rooms based on counts
        addRooms(bedcount1, "1bedroom", bedamount1);
        addRooms(bedcount2, "2bedroom", bedamount2);
        addRooms(bedcount3, "3bedroom", bedamount3);
        addRooms(bedcount4, "4bedroom", bedamount4);
        addRooms(shopcount, "shop", shopamount);

        // Validate total rooms
        console.log("🚀 ~ router.post ~ roomsToCreate.length > totalroom:", roomsToCreate.length , totalroom)
        if (roomsToCreate.length > totalroom) {
            throw new Error("Total rooms exceed allowed limit!");
        }

        // Bulk insert rooms
        const roomCreated = await Room.bulkCreate(roomsToCreate, { transaction });
        console.log("✅ Rooms created:", roomCreated.length);
        console.log("🚀 ~ router.post ~ data.Images:", data.Images)

        // Insert images asynchronously
        if (data.images?.length) {
            await Promise.all(
                data.images.map((imgUrl) =>
                    Images.create({ imgurl: imgUrl, propertyId: land.id }, { transaction })
                )
            );
            console.log("✅ Images uploaded successfully.");
        }

        await transaction.commit();
        return res.status(201).json({
            land,
            status:true,
            message:"Property created"
        });
    } catch (error) {
        await transaction.rollback(); // ✅ Ensure rollback on failure
        console.error("❌ Error creating land:", error);
        throw new Error(`Error creating land: ${error.message}`);
    }
   
    // res.status(201).json(land);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/generateroom',validateGenerateRoom ,async (req, res) => {
  try {
    //   console.log("🚀 ~ router.post ~ req.body:", req.body)
    const data = await req.body;

    try {
      const land = await Land.findOne({where:{id:data.propertyId}})
        // Create land entry
        if (req.user.user.roleId === 1) {
       

       
        // Extract room data
        const {miniflat,miniflatamount, totalroom, bedcount1, bedcount2, bedcount3, bedcount4, bedamount1, bedamount2, bedamount3, bedamount4,shopcount,shopamount,propertyId } = data;

        let roomIndex = 1;
        let roomsToCreate = [];

        // Function to add rooms dynamically
        const addRooms = (count, type, amount) => {
            for (let i = 0; i < count; i++) {
                roomsToCreate.push({
                    number: `soaro-${land.name}-${roomIndex.toString().padStart(2, "0")}`,
                    name:`soaro-${land.name}-room-${roomIndex.toString().padStart(2, "0")}`,
                    propertyId: land.id,
                    roomType: type,
                    yearlyAmount: amount,
                    roomCategory: "rent",
                    status: "vacant",
                    createdBy:req.user.user.id
                });
                roomIndex++;
            }
        };

        // Add rooms based on counts
        addRooms(bedcount1, "1bedroom", bedamount1);
        addRooms(bedcount2, "2bedroom", bedamount2);
        addRooms(bedcount3, "3bedroom", bedamount3);
        addRooms(bedcount4, "4bedroom", bedamount4);
        addRooms(shopcount, "shop", shopamount);
        addRooms(miniflat, "miniflat", miniflatamount);

        // Validate total rooms
        console.log("🚀 ~ router.post ~ roomsToCreate.length > totalroom:", roomsToCreate.length , totalroom)
        if (roomsToCreate.length > totalroom) {
            throw new Error("Total rooms exceed allowed limit!");
        }

        // Bulk insert rooms
        const roomCreated = await Room.bulkCreate(roomsToCreate);
        console.log("✅ Rooms created:", roomCreated.length);
        console.log("🚀 ~ router.post ~ data.Images:", data.Images)

       

        // await transaction.commit();
        return res.status(201).json({
            land,
            status:true,
            message:"Property created"
        });
        }

        

        // Extract room data
        const {miniflat,miniflatamount, totalroom, bedcount1, bedcount2, bedcount3, bedcount4, bedamount1, bedamount2, bedamount3, bedamount4,shopcount,shopamount } = data;

        let roomIndex = 1;
        let roomsToCreate = [];

        // Function to add rooms dynamically
        const addRooms = (count, type, amount) => {
            for (let i = 0; i < count; i++) {
                roomsToCreate.push({
                    number: `soaro-${land.name}-${roomIndex.toString().padStart(2, "0")}`,
                    name:`soaro-${land.name}-room-${roomIndex.toString().padStart(2, "0")}`,
                    propertyId: land.id,
                    roomType: type,
                    yearlyAmount: amount,
                    roomCategory: "rent",
                    status: "vacant",
                });
                roomIndex++;
            }
        };

        // Add rooms based on counts
        addRooms(bedcount1, "1bedroom", bedamount1);
        addRooms(bedcount2, "2bedroom", bedamount2);
        addRooms(bedcount3, "3bedroom", bedamount3);
        addRooms(bedcount4, "4bedroom", bedamount4);
        addRooms(shopcount, "shop", shopamount);
        addRooms(miniflat, "shop", miniflatamount);

        // Validate total rooms
        console.log("🚀 ~ router.post ~ roomsToCreate.length > totalroom:", roomsToCreate.length , totalroom)
        if (roomsToCreate.length > totalroom) {
            throw new Error("Total rooms exceed allowed limit!");
        }

        // Bulk insert rooms
        const roomCreated = await Room.bulkCreate(roomsToCreate);
        console.log("✅ Rooms created:", roomCreated.length);
        console.log("🚀 ~ router.post ~ data.Images:", data.Images)

        

        
        return res.status(201).json({
            land,
            status:true,
            message:"Property created"
        });
    } catch (error) {
        // ✅ Ensure rollback on failure
        console.error("❌ Error creating land:", error);
        throw new Error(`Error creating land: ${error.message}`);
    }
   
    // res.status(201).json(land);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.post('/freshland',validatePropertyLand,async(req,res) => {
  try {
    const data = req.body;
    if (req.user.user.roleId === 1) {
      const land = await Land.create(
        {
            name: data.name,
            address: data.address,
            lga: data.lga,
            state: data.state,
            country: data.country,
            amount: data.amount,
            sqm: data.sqm,
            description:data.description,
            freshLand: true,
            type: data.type,
            created_by_name: req.user.user.name,
            start: data.start,
            end: data.end.length > 1 ? data.end : null,
            prevOwnerAddress: data.prevOwnerAddress,
            prevOwnerName: data.prevOwnerName,
            prevOwnerPhone: data.prevOwnerPhone,
            prevOwnerEmail: data.prevOwnerEmail,
            createdBy:req.user.user.id
        },
    
    );
    return res.status(201).json({ message: "freshland added successfully!",status:true });
  }
  const saveFreshland = await Land.create({
            name: data.name,
            address: data.address,
            lga: data.lga,
            state: data.state,
            country: data.country,
            amount: data.amount,
            sqm: data.sqm,
            description:data.description,
            freshLand: true,
            type: data.type,
            created_by_name: req.user.user.name,
            start: data.start,
            end: data.end.length > 1 ? data.end : null,
            prevOwnerAddress: data.prevOwnerAddress,
            prevOwnerName: data.prevOwnerName,
            prevOwnerPhone: data.prevOwnerPhone,
            prevOwnerEmail: data.prevOwnerEmail,
            createdBy:req.user.user.id
  })
  console.log("🚀 ~ router.post ~ saveFreshland:", saveFreshland)
  return res.status(201).json({ message: "freshland added successfully!",status:true });

  } catch (error) {
     console.log("🚀 ~ router.post ~ error:", error)
     res.status(400).json({ message: error,status:false });
  }
})


router.get('/add', async (req, res) => {
    try {
      const lands = await LandService.getAllLands();
      console.log("🚀 ~ router.get ~ lands:", lands)
      res.render("addproperty",{lands,userDetails:req.user.user})
      
      // res.status(200).json(lands);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

router.get('/detail', async (req, res) => {
    try {
    //   const lands = await LandService.getLandsById(req.params.id);
    //   console.log("🚀 ~ router.get ~ lands:", lands)
    
      return res.render("propertydetail",{userDetails:req.user.user})
    //   res.render("propertydetail",{lands})
      
      // res.status(200).json(lands);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

router.get('/analysis', async (req, res) => {
    try {
    //   const lands = await LandService.getAllLands();
    //   console.log("🚀 ~ router.get ~ lands:", lands)
      res.render("propertyanalysis",{userDetails:req.user.user})
      
      // res.status(200).json(lands);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

router.post("/addimage",validateImage,async (req,res) => {
    const {id,images} = req.body;
    try {
      const imageRecords = images.map((imgUrl) => ({
        propertyId: id, // Assign propertyId from request
        imgurl: imgUrl, // Image URL from request
        type: "property", // Default value
      }));
  
      // Bulk insert into Images table
      await Images.bulkCreate(imageRecords);
  
      return res.status(201).json({ message: "Images added successfully!",status:true });
    } catch (error) {
      console.error("Error inserting images:", error);
      return res.status(500).json({ error: error.message,status:false});
  
    }
})


// GET - Get all lands
router.get('/', async (req, res) => {
  try {
    let lands = await LandService.getAllLands();
    // console.log("🚀 ~ router.get ~ lands:", lands.)
    if (req.query.type === "add") {
        return res.render("addproperty",{userDetails:req.user.user})    
    }
    if (req.query.type === "addfresh") {
        return res.render("addpropertyfresh",{userDetails:req.user.user})    
    }

    if (req.query.type === "details" && req.query.id ) {
      
      if (req.user.user.roleId === 1) {
        const lawyers = await Lawyers.findAll({where:{createdBy:req.user.user.id}})
        const lands = await Land.findOne({
          where:{createdBy:req.user.user.id,id:req.query.id},
          include: [
            {
              model: Images,
              as: "images", // Ensure this alias matches `hasMany`
            },
            {
              model: Lawyers,
              as: "lawyer", // Ensure this alias matches `belongsTo`
            },
             
          ],
        });

        const getPercentage = await Commision.findOne({where:{propertyId:req.query.id}})
        console.log("🚀 ~ router.get ~ getPercentage:", getPercentage)
        

     

        const roomCount = await Room.count({where:{propertyId:req.query.id}})
        const tenantCount = await Tenants.count({where:{propertyId:req.query.id,isPrevious:false,}})
        const shopCount = await Room.count({where:{propertyId:req.query.id,roomType:"shop"}})
        const expensesCount = await Expenses.count({where:{propertyId:req.query.id,}})
     
        return res.render("propertydetail",{getPercentage,lands,tenantCount,roomCount,expensesCount,shopCount,userDetails:req.user.user,lawyers})
        
      }
          const lawyers = await Lawyers.findAll({where:{}})
          const getPercentage = await Commision.findOne({where:{propertyId:req.query.id}})
          console.log("🚀 ~ router.get ~ getPercentage:", getPercentage)
      
          console.log("🚀 ~ router.get ~ lawyers:", lawyers)
          const lands = await LandService.getLandsById(req.query.id);
          const tenantCount = await Tenants.count({where:{propertyId:req.query.id,isPrevious:false}})
          const roomCount = await Room.count({where:{propertyId:req.query.id}})
          const shopCount = await Room.count({where:{propertyId:req.query.id,roomType:"shop"}})
          const expensesCount = await Expenses.count({where:{propertyId:req.query.id}})
        //   console.log("🚀 ~ router.get ~ lands:", lands.dataValues)
        return res.render("propertydetail",{getPercentage,lands,tenantCount,roomCount,expensesCount,shopCount,userDetails:req.user.user,lawyers})
    }

    if (req.query.type === "filter" && req.query.name) {
      if (req.user.user.roleId == 1) {
        console.log("🚀 ~ router.get ~ req.user.user.roleId == 1:", req.user.user.roleId == 1)
        const lands = await Land.findAll({where:{createdBy:req.user.user.id,type:req.query.name}});
        console.log("🚀 ~ router.get ~ lands:", lands)
         return res.render("property",{lands,userDetails:req.user.user})
         
       }
      
        
        const lands = await Land.findAll({where:{type:req.query.name}});
        console.log("🚀 ~ router.get ~ lands:", lands)
         return res.render("property",{lands,userDetails:req.user.user})
         
       
    }

    if (req.query.type === "dashboard" && req.query.propertyId) {
    
      // if (req.user.user.roleId == 1) {
        
      //         const result = await sequelize.query(
      //           `SELECT 
      //               p.id AS propertyId, 
      //               COALESCE(
      //                   SUM(r."yearlyAmount") * 
      //                   GREATEST(EXTRACT(YEAR FROM AGE(COALESCE(p.end, NOW()), p.start)), 1), 
      //                   0
      //               ) AS expectedIncome
      //           FROM property p
      //           LEFT JOIN rooms r ON p.id = r."propertyId"
      //           WHERE p.id = :propertyId
      //           GROUP BY p.id `,
      //           {
      //             replacements: { propertyId: req.query.propertyId },
      //             type: Sequelize.QueryTypes.SELECT
      //           }
      //         );

   
              
            
            
      //         const expectedYearlyAmount = result[0].expectedincome ? result[0].expectedincome : 0;
      //         console.log("🚀 ~ router.get ~ expectedYearlyAmount:", expectedYearlyAmount)
      //         // console.log(result[0].expectedIncome)
      //         async function getCounts(propertyId) {
      //           // const totalProperties = await Land.count({where:{pro}});
      //           const totalTenants = await Tenants.count({ where: { propertyId:propertyId } });
      //           const totalRooms = await Room.count({ where: { propertyId:propertyId } });
      //           const totalExpenses = await Expenses.sum("amount", {
      //             where: { propertyId: propertyId }
      //           });
      //           const totalRent = await PaymentRecord.sum("amount",{
      //             where: { propertyId: propertyId }
      //           })
      //          const vacant = await Room.count({where:{status:'vacant',propertyId:propertyId}})
             
      //         const  notvacant = await Room.count({where:{status:'not-vacant',propertyId:propertyId}})
      //           return {
      //             // totalProperties,
      //             totalTenants,
      //             totalRooms,
      //             totalExpenses,
      //             totalRent,
      //             vacant,
      //             notvacant
      //           };
      //         }
      //         const propertyDetails = await Land.findOne({where:{id:req.query.propertyId}})
        
      //         PaymentRecord.belongsTo(Land,{foreignKey:"propertyId"})
      //         PaymentRecord.belongsTo(Tenants,{foreignKey:"tenantId"})
      //         PaymentRecord.belongsTo(Room,{foreignKey:"roomId"})
      //         const paymentLogs = await PaymentRecord.findAll({where:{propertyId:req.query.propertyId},include:[{model:Tenants},{model:Room},{model:Land}]})
      //         const getValues = await getCounts(req.query.propertyId)
      //         const totalPaymentForTheYear = await PaymentRecord.sum('amount', {
      //           where: {
      //             start: {
      //               [Op.gte]: new Date(new Date().getFullYear(), 0, 1), // From January 1st of the current year
      //               [Op.lte]: new Date(), // Up to today
      //             },
      //             propertyId:req.query.propertyId
      //           },
      //           // group: ['propertyId']
      //         });
      //         console.log("🚀 ~ router.get ~ totalPaymentForTheYear:", totalPaymentForTheYear)
            
      //         return res.render("propertyanalytics",{getValues,paymentLogs,propertyDetails,expectedYearlyAmount,userDetails:req.user.user,totalPaymentForTheYear})

      // }

      const result = await sequelize.query(
        `SELECT 
            p.id AS propertyId, 
            COALESCE(
                SUM(r."yearlyAmount") * 
                GREATEST(EXTRACT(YEAR FROM AGE(COALESCE(p.end, NOW()), p.start)), 1), 
                0
            ) AS expectedIncome
        FROM property p
        LEFT JOIN rooms r ON p.id = r."propertyId"
        WHERE p.id = :propertyId
        GROUP BY p.id`,
        {
          replacements: { propertyId: req.query.propertyId },
          type: Sequelize.QueryTypes.SELECT
        }
      );

      const currentYear = new Date().getFullYear();

      const totalRent = await PaymentRecord.sum('amount', {
        where: {
          propertyId: req.query.propertyId,
          createdAt: {
            [Op.gte]: new Date(`${currentYear}-01-01`),
            [Op.lte]: new Date(`${currentYear}-12-31`)
          }
        }
      });
      
      const commissionRecord = await Commision.findOne({
        where: { propertyId: req.query.propertyId }
      });
      
      const percentage = commissionRecord?.percentage || 0;
      const commissionAmount = (percentage / 100) * totalRent;

const formattedAmountUserCommission = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN'
}).format(commissionAmount);



      
      console.log({
        totalRent,
        percentage,
        commissionAmount
      });
      
    
    
      const expectedYearlyAmount = result[0].expectedincome ? result[0].expectedincome : 0;
      console.log("🚀 ~ router.get ~ expectedYearlyAmount:", expectedYearlyAmount)
      // console.log(result[0].expectedIncome)
      async function getCounts(propertyId) {
        // const totalProperties = await Land.count({where:{pro}});
        const totalTenants = await Tenants.count({ where: { propertyId:propertyId } });
        const totalRooms = await Room.count({ where: { propertyId:propertyId } });
        const totalExpenses = await Expenses.sum("amount", {
          where: { propertyId: propertyId }
        });
        const totalRent = await PaymentRecord.sum("amount",{
          where: { propertyId: propertyId }
        })
        const vacant = await Room.count({where:{status:'vacant',propertyId:propertyId}})
        console.log("🚀 ~ getCounts ~ notvacant:", vacant)
             
              const  notvacant = await Room.count({where:{status:'not-vacant',propertyId:propertyId}})
              console.log("🚀 ~ getCounts ~ notvacant:", notvacant)

        return {
          // totalProperties,
          totalTenants,
          totalRooms,
          totalExpenses,
          totalRent,
          vacant,
          notvacant
        };
      }
      const propertyDetails = await Land.findOne({where:{id:req.query.propertyId}})

      PaymentRecord.belongsTo(Land,{foreignKey:"propertyId"})
      PaymentRecord.belongsTo(Tenants,{foreignKey:"tenantId"})
      PaymentRecord.belongsTo(Room,{foreignKey:"roomId"})
      const paymentLogs = await PaymentRecord.findAll({where:{propertyId:req.query.propertyId},include:[{model:Tenants},{model:Room},{model:Land}]})
      const getValues = await getCounts(req.query.propertyId)
      const totalPaymentForTheYear = await PaymentRecord.sum('amount', {
        where: {
          start: {
            [Op.gte]: new Date(new Date().getFullYear(), 0, 1), // From January 1st of the current year
            [Op.lte]: new Date(), // Up to today
          },
          propertyId:req.query.propertyId
        },
        // group: ['propertyId']
      });
      console.log("🚀 ~ router.get ~ totalPaymentForTheYear:", totalPaymentForTheYear)
    
      return res.render("propertyanalytics",{formattedAmountUserCommission,getValues,paymentLogs,propertyDetails,expectedYearlyAmount,userDetails:req.user.user,totalPaymentForTheYear})
    }

    if (req.query.type === "past" && req.query.id) {
      PropertyRecord.belongsTo(Land,{foreignKey:"propertyId"})
      if (req.user.user.roleId === 1) {
        const pastrecord = await PropertyRecord.findAll({where:{createdBy:req.user.user.id},include:[{model:Land}]})
        return res.render("propertypast",{pastrecord,userDetails:req.user.user})
        
      }
      const pastrecord = await PropertyRecord.findAll({where:{},include:[{model:Land}]})
      return res.render("propertypast",{pastrecord,userDetails:req.user.user})
      
    }

   if (req.user.user.roleId == 1) {
    
    // const lands = await /*Land.findAll({where:{createdBy:req.user.user.id}});*/
    const lands = await Land.findAll({
      where:{createdBy:req.user.user.id},
      include: [
        {
          model: Images,
          as: "images", // Ensure this alias matches `hasMany`
        },
        {
          model: Lawyers,
          as: "lawyer", // Ensure this alias matches `belongsTo`
        },
      ],
    });
    console.log("🚀 ~ router.get ~ lands:", lands)
     return res.render("property",{lands,userDetails:req.user.user})
     
   }


    // return res.json({lands})
    return res.render("property",{lands,userDetails:req.user.user})
    
    // res.status(200).json(lands);
  } catch (error) {
    console.log("🚀 ~ router.get ~ error:", error.stack)
    
    res.status(400).json({ error: error.message });
  }
});


// GET - Get land by ID
router.get('/:id', async (req, res) => {
  try {
    const land = await LandService.getLandById(req.params.id);
    res.status(200).json(land);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT - Update land
router.put('/:id', async (req, res) => {
  try {
    const updatedLand = await LandService.updateLand(req.params.id, req.body);
    res.status(200).json(updatedLand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/update/amount', async (req, res) => {
  try {
    const updatedAmount = await Land.update({amount:req.body.amount},{where:{id:req.body.propertyId}});
    res.status(200).json({status:true,updatedAmount,message:"amount updated successfully"});
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error)
    res.status(400).json({ message: error.message,status:false });
  }
});

router.post('/update/sold', async (req, res) => {
  try {
    const updatedSold = await Land.update({...req.body},{where:{id:req.body.propertyId}});
    res.status(200).json({status:true,updatedSold,message:"sold updated successfully"});
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error)
    res.status(400).json({ message: error.message,status:false });
  }
});

router.post('/update/desc', async (req, res) => {
  try {
    const updatedDescription = await Land.update({description:req.body.description},{where:{id:req.body.propertyId}});
    res.status(200).json({status:true,updatedDescription,message:"description updated successfully"});
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error)
    res.status(400).json({ message: error.message,status:false });
  }
});

router.patch('/:id', async (req, res) => {
  try {
      if (req.user.user.roleId === 1) {
        const {type,start,end} = req.body;
        const id = req.params.id;
        let checkEnd = end === undefined || null ? null : end
        const getProp = await Land.findOne({where:{id:id,createdBy:req.user.user.id}})
        
        const UpdateProp = await Land.update({start:start,end:checkEnd,type:type},{where:{id:id,createdBy:req.user.user.id}})
        const createRecord = await PrevRecord.create({start:getProp.start,end:getProp.end,type:getProp.type,propertyId:id})
    
        res.status(200).json({status:true,message:"property updated and previous record is kept",UpdateProp});
        
      }
    const {type,start,end} = req.body;
    console.log("🚀 ~ router.patch ~ end:", end)
    const id = req.params.id;
    let checkEnd = end === undefined || null ? null : end
    const getProp = await Land.findOne({where:{id:id}})
    console.log("🚀 ~ router.patch ~ checkEnd:", checkEnd)
    
    const UpdateProp = await Land.update({start:start,end:checkEnd,type:type},{where:{id:id}})
    const createRecord = await PrevRecord.create({start:getProp.start,end:getProp.end,type:getProp.type,propertyId:id})

    res.status(200).json({status:true,message:"property updated and previous record is kept",UpdateProp});
  } catch (error) {
    console.log("🚀 ~ router.patch ~ error:", error)
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Delete land
router.delete('/:id', async (req, res) => {
  try {
    await LandService.deleteLand(req.params.id);
    res.status(200).json({ message: 'Land deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
