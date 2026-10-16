const mongoose = require('mongoose');
const ledgreSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Ledger must be associated with a form account'],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required for transaction'],
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transaction',
        required: [true, 'Ledger must be associated with a form account'],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ['credit', 'debit'],
            message: 'type can be either credit or debit!'
        },
        required: [true, 'Ledger type is required'],
        immutable: true

    }
})
function preventLedgerModification() {
    // FIX: Capitalize 'Error'
    throw new Error('Ledger entries are immutable and cannot be modified or deleted');
}
ledgreSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgreSchema.pre('findOneAndDelete', preventLedgerModification);
ledgreSchema.pre('findOneAndReplace', preventLedgerModification);
ledgreSchema.pre('updateOne', preventLedgerModification); // FIX: lower-case 'u'
ledgreSchema.pre('deleteOne', preventLedgerModification);
ledgreSchema.pre('deleteMany', preventLedgerModification);
ledgreSchema.pre('updateMany', preventLedgerModification); // Recommended to add

const ledgerModel = mongoose.model('ledger', ledgreSchema);
module.exports = ledgerModel

