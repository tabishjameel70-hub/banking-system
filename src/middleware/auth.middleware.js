const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const tokenBlackListModel = require('../models/blackList.model');
async function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            message: 'unauthorized access, token is missing'
        })
    }
    const isBlackListed = await tokenBlackListModel.findOne({ token });
    if (isBlackListed) {
        return res.status(401).json({
            message: 'unauthroized token is inValid!'
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.MONGO_JWT);
        const user = await userModel.findById(decoded.userID);
        req.user = user;
        return next();

    } catch (err) {
        // THIS WILL PRINT THE REAL ERROR IN YOUR VS CODE TERMINAL
        console.log("CRASH REASON:", err.message);

        return res.status(401).json({
            message: 'unauthorized access, token is invallid'
        })
    }
}
async function authsystemMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
    if (!token) {
        return res.status(401).json({
            message: 'unauthorized access, token is missing'
        })
    }
    const isBlackListed = await tokenBlackListModel.findOne({ token });
    if (isBlackListed) {
        return res.status(401).json({
            message: 'unauthroized token is inValid!'
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.MONGO_JWT);
        const user = await userModel.findById(decoded.userID).select('+systemUser');
        if (!user.systemUser) {
            return res.status(401).json({
                message: 'forbidden access, not a system user!'
            })
        }
        req.user = user;
        return next()

    } catch (err) {
        // THIS WILL PRINT THE REAL ERROR IN YOUR VS CODE TERMINAL
        console.log("CRASH REASON:", err.message);

        return res.status(401).json({
            message: 'unauthorized access, token is invallid'
        })
    }
}

// ... keeping your existing token verification logic here ...

// Change this line at the bottom:
module.exports = { authMiddleware, authsystemMiddleware };
