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
const bcrypt = require("bcryptjs")
const authenticateUser = require("../middleware/Auth")
routes.use("/property",PropertyRoutes)
const jwt = require("jsonwebtoken")
const { message } = require("../validation/roomValidation")

routes.use("/room",authenticateUser,RoomRoutes)
routes.use("/lawyer",authenticateUser,LawyerRoutes)
routes.use("/expenses",authenticateUser,ExpenseRoutes)
routes.use("/tenant",authenticateUser,tenantRoutes)
routes.use("/tool",authenticateUser,toolRoutes)
routes.use("/user",authenticateUser,userRoutes)
routes.get("/dashboard",authenticateUser,async(req,res) => {
    res.render("dashboard")
})
routes.get("/",async(req,res) => {
    res.render("login")
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
        const user = await User.findOne({where:{email:email}})
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

routes.post("/logout", (req, res) => {
    res.clearCookie("authToken");
    res.json({ message: "Logged out successfully" });
});



// routes.get("/property",async(req,res) => {
//     res.render("property")
// })


module.exports = routes;