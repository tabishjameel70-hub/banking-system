const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'transaction must be associated with a form account'],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'transaction must be associated with a to account'],
        index: true
    },
    status:{
        type: String,
        enum:{
            values:['pending','completed', 'failed', 'reverse'],
            message: "status can be either pending, completed or reverse!"
        },
        default: "pending",
    },
    amount:{
      type: Number,
      required: [true, 'Amount is required for transaction'],
      min: [0, 'Transaction Amount cannot b e negative']
    },
    idempotencyKey:{
        type: String,
        required:[true,'idempotency is required for transaction' ],
        index: true,
        unique: true
    }
},{timestamps: true});
const transactionModel = mongoose.model('transaction',transactionSchema);
module.exports = transactionModel;
