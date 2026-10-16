const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const emailservice = require('../services/email.service');
const tokenBlackListModel = require('../models/blackList.model');
async function userRegisteration(req, res) {
    const { email, password, name } = req.body;
    const isExist = await userModel.findOne({ email: email });
    if (isExist) {
        return res.status(422).json({
            message: 'user alr exist with email!',
            status: 'failed'
        })
    }
    const user = await userModel.create({
        email,
        password,
        name
    })
    const token = jwt.sign({ userID: user._id }, process.env.MONGO_JWT, { expiresIn: '4d' })
    res.cookie('token', token);
    res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        }
    })
    await emailservice.userRegistrationEmail(user.email, user.name);

}
async function userLoginContolller(req, res) {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password")
    if (!user) {
        return res.status(401).json({
            message: "email or password is invalid"
        })
    }
    const isValidPassowrd = await user.comparePassword(password);
    if (!isValidPassowrd) {
        return res.status(401).json({
            message: "email or password is invalid"
        })
    }
    const token = jwt.sign({ userID: user._id }, process.env.MONGO_JWT, { expiresIn: '4d' })
    res.cookie('token', token);
    res.status(200).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        }
    })
}
async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(400).json({
          message: "user logged out successfully!"
        })
    }
    await tokenBlackListModel.create({
        token: token,
    })
    res.clearCookie("token");

    res.status(200).json({
        message: "user logged out successfully!",
    })

}
module.exports = {
    userRegisteration,
    userLoginContolller,
    userLogoutController
}