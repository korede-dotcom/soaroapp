const routes = require("express").Router()
const PropertyRoutes = require("./PropertyRoutes")
const RoomRoutes = require("./RoomRoutes")
const LawyerRoutes = require("./LawyerRoutes")
const tenantRoutes = require("./tenantRoutes")
const toolRoutes = require("./ToolRoutes")
const ExpenseRoutes = require("./ExpenseRoutes")

routes.use("/property",PropertyRoutes)

routes.use("/room",RoomRoutes)
routes.use("/lawyer",LawyerRoutes)
routes.use("/expenses",ExpenseRoutes)
routes.use("/tenant",tenantRoutes)
routes.use("/tool",toolRoutes)
routes.get("/dashboard",async(req,res) => {
    res.render("dashboard")
})
routes.get("/",async(req,res) => {
    res.render("login")
})

// routes.get("/property",async(req,res) => {
//     res.render("property")
// })


module.exports = routes;