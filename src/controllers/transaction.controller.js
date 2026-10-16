const mongoose = require('mongoose');
const transactionModel = require('../models/transactions.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailServices = require('../services/email.service');

async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, amount and idempotencyKey required",
    });
  }

  // 1. Idempotency Check
  const isTransactionAlreadyExist = await transactionModel.findOne({ idempotencyKey });
  if (isTransactionAlreadyExist) {
    if (isTransactionAlreadyExist.status === 'completed') return res.status(200).json({ message: "Transaction completed successfully", transaction: isTransactionAlreadyExist });
    if (isTransactionAlreadyExist.status === 'pending') return res.status(400).json({ message: "Transaction is still processing, please wait", transaction: isTransactionAlreadyExist });
    if (isTransactionAlreadyExist.status === 'failed') return res.status(400).json({ message: "Previous Transaction failed! Try again.", transaction: isTransactionAlreadyExist });
    if (isTransactionAlreadyExist.status === 'reverse') return res.status(400).json({ message: "Previous Transaction was reversed! Please retry.", transaction: isTransactionAlreadyExist });
  }

  const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({ message: 'invalid fromaccount or touseraccount' });
  }

  if (fromUserAccount.status !== 'active' || toUserAccount.status !== 'active') {
    return res.status(400).json({ message: 'Both accounts must be active for the transaction.' });
  }

  const balance = await fromUserAccount.getBalance();
  if (balance < amount) {
    return res.status(400).json({ message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}` });
  }

  // 2. Register 'pending' transaction OUTSIDE the session
  const transaction = await transactionModel.create({
    toAccount,
    fromAccount,
    idempotencyKey,
    amount,
    status: 'pending'
  });

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    await ledgerModel.create([{
      account: fromAccount,
      amount: amount,
      transaction: transaction._id,
      type: 'debit'
    }], { session });

    await ledgerModel.create([{
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: 'credit'
    }], { session });

    // 3. Update to completed INSIDE the session
    transaction.status = 'completed';
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    await emailServices.transactionEmail(req.user.email, req.user.name, amount, toAccount);

    return res.status(200).json({
      message: 'transaction completed successfully',
      transaction: transaction
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    // Mark as failed outside the aborted session
    transaction.status = 'failed';
    await transaction.save();

    console.error("Transfer Error:", error);
    return res.status(500).json({
      message: "Internal server error during transfer processing",
      error: error.message
    });
  }
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey required",
    });
  }

  // 1. Missing Idempotency Check added here
  const isTransactionAlreadyExist = await transactionModel.findOne({ idempotencyKey });
  if (isTransactionAlreadyExist) {
    if (isTransactionAlreadyExist.status === 'completed') return res.status(200).json({ message: "Initial funds already processed!", transaction: isTransactionAlreadyExist });
    if (isTransactionAlreadyExist.status === 'pending') return res.status(400).json({ message: "Transaction is pending due to some issue please retry", transaction: isTransactionAlreadyExist });
    if (isTransactionAlreadyExist.status === 'failed') return res.status(400).json({ message: "Previous transaction failed! Try again.", transaction: isTransactionAlreadyExist });
  }

  const toUserAccount = await accountModel.findOne({ _id: toAccount });
  if (!toUserAccount) {
    return res.status(400).json({ message: "invalid toAccount" });
  }

  const fromUserAccount = await accountModel.findOne({ user: req.user._id });
  if (!fromUserAccount) {
    return res.status(400).json({ message: "invalid fromUserAccount" });
  }
  
  // 2. Register 'pending' transaction OUTSIDE the session
  const transaction = await transactionModel.create({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "pending" 
  });

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    await ledgerModel.create([{
      account: fromUserAccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "debit"
    }], { session });

    await new Promise((resolve) => setTimeout(resolve, 9000));

    await ledgerModel.create([{
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "credit"
    }], { session });

    // 3. Update status INSIDE the session
    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: 'completed' },
      { session }
    );

    await session.commitTransaction();
    
    return res.status(201).json({
      message: "Initial funds transaction completed successfully",
      transaction: transaction
    });

  } catch (error) {
    await session.abortTransaction();
    
    // Mark as failed outside the aborted session
    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: 'failed' }
    );

    console.error("Transaction Error Details:", error);
    return res.status(400).json({ 
      message: "transaction is pending due to some issue please retry", 
      error: error.message 
    });
  } finally {
    session.endSession();
  }
}

module.exports = { createTransaction, createInitialFundsTransaction };