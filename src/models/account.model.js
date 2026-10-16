const mongoose = require('mongoose');
const ledgerModel = require('../models/ledger.model');

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, 'acc must be associated with user'],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'frozen', 'closed'],
            message: "status can be either active, frozen or closed!",
        },
        default: "active",
    },
    currency: {
        type: String,
        required: [true, 'currency is required for creating account'],
        default: 'PKR'
    }
}, { timestamps: true });

// Compound index for optimized querying
accountSchema.index({ user: 1, status: 1 });

// Corrected getBalance method
accountSchema.methods.getBalance = async function () {
    const balanceData = await ledgerModel.aggregate([
        // 1. Match only transactions belonging to this account
        { $match: { account: this._id } },

        // 2. Separate and sum debits and credits correctly
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "debit"] }, // CORRECTED: lowercase 'debit'
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "credit"] }, // CORRECTED: lowercase 'credit'
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },

        // 3. Move $project OUTSIDE of the $group stage
        {
            $project: {
                _id: 0,
                balance: { $subtract: ["$totalCredit", "$totalDebit"] } // Match casing accurately
            }
        }
    ]);

    if (balanceData.length === 0) {
        return 0;
    }

    return balanceData[0].balance;
};

const accountModel = mongoose.model("account", accountSchema);
module.exports = accountModel;
