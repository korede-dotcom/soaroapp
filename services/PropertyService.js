// services/LandService.js
const Land = require('../models/Property');  // Import the Land model
// const LandDTO = require('../dto/PropertyDTO');  // Import the Land DTO
const Images = require('../models/Images');
const Lawyers = require('../models/Lawyer');
const Sync = require("../models/index");
const Room = require('../models/Room');
const User = require('../models/User');
Land.belongsTo(Lawyers,{foreignKey:"id",targetKey:"propertyId"})
    Images.belongsTo(Land, { foreignKey: "propertyId" });
    Land.hasMany(Images, { foreignKey: "propertyId", as: "images" });

class LandService {

  // Create a new Land record
//   static async createLand(data) {
//     let transaction = Sync.transaction();
//     let land
//     try {
//     //   const landDTO = LandDTO.validateCreateData(data);  // Validate and map to DTO
//     //   console.log("🚀 ~ LandService ~ createLand ~ landDTO:", landDTO)
//        land = await Land.create({
//         name: data.name,
//         address: data.address,
//         lga: data.lga,
//         state: data.state,
//         country: data.country,
//         sqm: data.sqm,
//         isSold: data.isSold,
//         freshLand: data.freshLand,
//         type: data.type,
//         created_by_name: data.created_by_name,
//         start: data.start,
//         end: data.end,
//         prevOwnerAddress:data.prevOwnerAddress,
//         prevOwnerName:data.prevOwnerName,
//         prevOwnerPhone:data.prevOwnerPhone,
//         prevOwnerEmail:data.prevOwnerEmail,
//       },{transaction});
//       console.log("🚀 ~ LandService ~ createLand ~ land:", land)

//       const {
//         totalroom,
//         bedcount1,
//         bedcount2,
//         bedcount3,
//         bedcount4,
//         bedamount1,
//         bedamount2,
//         bedamount3,
//         bedamount4,
//       } = data;
  
//       let roomIndex = 1; // Initialize room number index
//       let roomsToCreate = [];
  
//       // Function to add rooms dynamically
//       const addRooms = (count, type, amount) => {
//         for (let i = 0; i < count; i++) {
//           roomsToCreate.push({
//             number: `${data.name}-${roomIndex < 10 ? "0" : ""}${roomIndex}`, // Generate room number
//             propertyId:land.id,
//             roomType: type,
//             yearlyAmount: amount,
//             roomCategory: "rent",
//             status: "vancant",
//           });
//           roomIndex++; // Increment for next room number
//         }
//       };
  
//       // Add rooms based on counts
//       addRooms(bedcount1, "1bedroom", bedamount1);
//       addRooms(bedcount2, "2bedroom", bedamount2);
//       addRooms(bedcount3, "3bedroom", bedamount3);
//       addRooms(bedcount4, "4bedroom", bedamount4);
  
//       // Ensure total created rooms do not exceed totalroom
//       if (roomsToCreate.length > totalroom) {
//         return res.status(400).json({ message: "Total rooms exceed allowed limit!" });
//       }
  
//       // Insert all rooms into the database
//      const roomCreated = await Room.bulkCreate(roomsToCreate,{transaction});
//      console.log("🚀 ~ LandService ~ createLand ~ roomCreated:", roomCreated)

//       const imagesurl = await data.Images.map(async d => {
//         const save = await Images.create({
//             imgurl:d,
//             propertyId:land.id
//         })
//         console.log("🚀 ~ LandService ~ createLand ~ save:", save)
//       })
//       await transaction.commit();
//       return Land  // Return the DTO for the created land
//     } catch (error) {
//         await transaction.rolback();
//       throw new Error(`Error creating land: ${error.message}`);
//     }
//   }
static async createLand(data) {
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
                sqm: data.sqm,
                isSold: data.isSold,
                freshLand: data.freshLand,
                type: data.type,
                created_by_name: data.created_by_name,
                start: data.start,
                end: data.end,
                prevOwnerAddress: data.prevOwnerAddress,
                prevOwnerName: data.prevOwnerName,
                prevOwnerPhone: data.prevOwnerPhone,
                prevOwnerEmail: data.prevOwnerEmail,
            },
            { transaction } // ✅ Ensure transaction is passed correctly
        );
        console.log("✅ Land created:", land);

        if (!land) {
            throw new Error("Land creation failed!");
        }

        // Extract room data
        const { totalroom, bedcount1, bedcount2, bedcount3, bedcount4, bedamount1, bedamount2, bedamount3, bedamount4 } = data;

        let roomIndex = 1;
        let roomsToCreate = [];

        // Function to add rooms dynamically
        const addRooms = (count, type, amount) => {
            for (let i = 0; i < count; i++) {
                roomsToCreate.push({
                    number: `${data.name}-${roomIndex.toString().padStart(2, "0")}`,
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

        // Validate total rooms
        if (roomsToCreate.length > totalroom) {
            throw new Error("Total rooms exceed allowed limit!");
        }

        // Bulk insert rooms
        const roomCreated = await Room.bulkCreate(roomsToCreate, { transaction });
        console.log("✅ Rooms created:", roomCreated.length);

        // Insert images asynchronously
        if (data.Images?.length) {
            await Promise.all(
                data.Images.map((imgUrl) =>
                    Images.create({ imgurl: imgUrl, propertyId: land.id }, { transaction })
                )
            );
            console.log("✅ Images uploaded successfully.");
        }

        await transaction.commit();
        return land;
    } catch (error) {
        await transaction.rollback(); // ✅ Ensure rollback on failure
        console.error("❌ Error creating land:", error);
        throw new Error(`Error creating land: ${error.message}`);
    }
}



  // Get all lands
  static async getAllLands() {
    // Land.hasMany(Images, { foreignKey: "propertyId", as: "images" }); 
    // Land.belongsTo(Lawyers, { foreignKey: "id", targetKey: "propertyId", as: "lawyer" });
    
    
    // Land.belongsTo(Lawyers,{foreignKey:"id",targetKey:"propertyId"})
    try {
        const lands = await Land.findAll({
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
          
          
      return lands;  // Return an array of LandDTOs
    } catch (error) {
      throw new Error(`Error retrieving lands: ${error.message}`);
    }
  }

  static async getLandsById(id) {
    // Land.belongsTo(Images,{foreignKey:"id",targetKey:"propertyId"})
    
    // Land.belongsTo(Lawyers,{foreignKey:"id",targetKey:"propertyId"})
    try {
    //   const lands = await Land.findOne({where:{id:id},include:[{model:Images},{model:Lawyers}]});  // Retrieve all Land records
    const lands = await Land.findOne({
        where: { id: id },
        include: [
            { model: Images, as: "images"}, // Matches hasMany alias
            { model: Lawyers, as: "lawyer" }, // Matches belongsTo alias
        
        ]
    });
    
    
      console.log("🚀 ~ LandService ~ getLandsById ~ lands:", lands)
      return lands;  // Return an array of LandDTOs
    } catch (error) {
      throw new Error(`Error retrieving lands: ${error.message}`);
    }
  }

  // Get a land by ID
  static async getLandById(id) {
    try {
      const land = await Land.findByPk(id);  // Find a Land record by its primary key (ID)
      if (!land) {
        throw new Error('Land not found');
      }
      return LandDTO.fromModel(land);  // Return the DTO for the found land
    } catch (error) {
      throw new Error(`Error retrieving land: ${error.message}`);
    }
  }

  // Update a land record
  static async updateLand(id, data) {
    try {
      const landDTO = LandDTO.validateUpdateData({ ...data, id });  // Validate and map to DTO
      const land = await Land.findByPk(id);  // Find the land record by ID
      if (!land) {
        throw new Error('Land not found');
      }

      await land.update({
        name: landDTO.name || land.name,
        address: landDTO.address || land.address,
        lga: landDTO.lga || land.lga,
        state: landDTO.state || land.state,
        country: landDTO.country || land.country,
        sqm: landDTO.sqm || land.sqm,
        isSold: landDTO.isSold || land.isSold,
        freshLand: landDTO.freshLand || land.freshLand,
        start: landDTO.start || land.start,
        end: landDTO.end || land.end,
      });

      return LandDTO.fromModel(land);  // Return the updated DTO
    } catch (error) {
      throw new Error(`Error updating land: ${error.message}`);
    }
  }

  // Delete a land record
  static async deleteLand(id) {
    try {
      const land = await Land.findByPk(id);
      if (!land) {
        throw new Error('Land not found');
      }
      await land.destroy();  // Delete the record
      return { message: 'Land deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting land: ${error.message}`);
    }
  }
}

module.exports = LandService;
