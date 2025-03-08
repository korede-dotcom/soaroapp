const jwt = require('jsonwebtoken');
const os = require('os');


const AuthUser = (req, res, next) => {
 
    // const token = req.cookies.jwt;
    const token = req.header('Authorization')?.split(' ')[1];
    // const token = req.session.user;
    if (!token) {
        return res.status(401).json({
            message: 'You are not logged in!',
            status: false
        });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({
                status: false,
                message: 'You are not logged in!'
            });
        }
        req.user = decodedToken;
        req.token = token;
        next();
    });
}


const authenticateUser = (req, res, next) => {
    const token = req.cookies.authToken; // Get token from cookies
    if (!token) {
        return res.redirect("/");
    }
    
    // Verify token (assuming it's a JWT)
    try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, "your-secret-key"); // Replace with your actual secret key
        req.user = decoded; // Store user info in request
        next();
    } catch (error) {
        return res.redirect("/");
        return res.status(403).json({ message: "Invalid token" });
    }
};





module.exports = authenticateUser;