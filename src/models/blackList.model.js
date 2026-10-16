const mongoose = require('mongoose');
const tokenBlackListSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'token is required for balcklisting!'],
        unique: [true, 'token is already blacklisted!']
    }
}, {
    timestamps: true
})
tokenBlackListSchema.index({ craetedAt: 1 }, {
    expireAfterSeconds: 60 * 60 * 24 * 3
})
const tokenBlackListModel = mongoose.model('tokenBlackList', tokenBlackListSchema);
module.exports = tokenBlackListModel;