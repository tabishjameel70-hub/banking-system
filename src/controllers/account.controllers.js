const accountModel = require('../models/account.model');
async function CreateaccountController(req, res) {
    const user = req.user;
    const account = await accountModel.create({
        user: user._id
    })
    res.status(201).json({ account })
}
async function getUserAccountController(req, res) {
    const accounts = await accountModel.find({ user: req.user._id });
    res.status(201).json({
        accounts,
    })
}
async function getUserAccountBalance(req, res) {
    const { accountId } = req.params;
    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    });
if (!account) {
        // FIXED: Added 'return' to halt execution and changed status to 404
        return res.status(404).json({
            message: "Account not found or you do not have permission to view it."
        });
    }
    const balance = await account.getBalance();
    res.status(200).json({
       accountId : account._id,
        balance: balance
    })

}
module.exports = {
    CreateaccountController,
    getUserAccountController,
    getUserAccountBalance
}