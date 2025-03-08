// routes/LandRoutes.js
const express = require('express');
const LandService = require('../services/PropertyService');
const validateProperty = require('../validation/PropertyValidation');
const router = express.Router();
const Land = require("../models/Property");
const Sync = require("../models/index")
const Room = require("../models/Room")
const Images = require("../models/Images");
const Tenants = require('../models/Tenants');


// POST - Create new land
router.post('/',validateProperty, async (req, res) => {
  try {
    //   console.log("🚀 ~ router.post ~ req.body:", req.body)
    const data = await req.body;
    const transaction = await Sync.transaction(); // ✅ Ensure correct transaction initialization
    try {
        // Create land entry
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
                created_by_name: data.created_by_name,
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

router.get('/add', async (req, res) => {
    try {
      const lands = await LandService.getAllLands();
      console.log("🚀 ~ router.get ~ lands:", lands)
      res.render("addproperty",{lands})
      
      // res.status(200).json(lands);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

router.get('/detail', async (req, res) => {
    try {
    //   const lands = await LandService.getLandsById(req.params.id);
    //   console.log("🚀 ~ router.get ~ lands:", lands)
    
      return res.render("propertydetail")
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
      res.render("propertyanalysis")
      
      // res.status(200).json(lands);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


// GET - Get all lands
router.get('/', async (req, res) => {
  try {
    const lands = await LandService.getAllLands();
    // console.log("🚀 ~ router.get ~ lands:", lands.)
    if (req.query.type === "add") {
        return res.render("addproperty")    
    }
    if (req.query.type === "details" && req.query.id ) {
          const lands = await LandService.getLandsById(req.query.id);
          const tenantCount = await Tenants.count({where:{propertyId:req.query.id,isPrevious:false}})
          const roomCount = await Room.count({where:{propertyId:req.query.id}})
        //   console.log("🚀 ~ router.get ~ lands:", lands.dataValues)
        return res.render("propertydetail",{lands,tenantCount,roomCount})
    }

    console.log("🚀 ~ router.get ~ lands:", lands)
    // return res.json({lands})
    return res.render("property",{lands})
    
    // res.status(200).json(lands);
  } catch (error) {
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
