import mongoose from 'mongoose';
import Transaction from '../models/transaction.model.js';

// Helper to check valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Validate transaction data
export const validateTransactionData = (req, res, next) => {
  const { description, paymentType, category, amount, date } = req.body;
  if (!description || !paymentType || !category || amount == null || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  next();
};

// Get all transactions for user
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id });
    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get single transaction
export const getTransactionById = async (req, res) => {
  const { transactionId } = req.params;
  if (!isValidObjectId(transactionId)) {
    return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
  }

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (err) {
    console.error('Fetch by ID Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Create new transaction
export const createTransaction = async (req, res) => {
  try {
    const payload = { ...req.body, userId: req.user._id };
    const newTransaction = new Transaction(payload);
    const saved = await newTransaction.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Create Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Update transaction
export const updateTransaction = async (req, res) => {
  const { transactionId } = req.params;
  if (!isValidObjectId(transactionId)) {
    return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
  }

  try {
    const existing = await Transaction.findById(transactionId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const allowedUpdates = ['description', 'paymentType', 'category', 'amount', 'date', 'location', 'isRecurring'];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] != null) updates[field] = req.body[field];
    });

    const updated = await Transaction.findByIdAndUpdate(transactionId, updates, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  const { transactionId } = req.params;
  if (!isValidObjectId(transactionId)) {
    return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
  }

  try {
    const existing = await Transaction.findById(transactionId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await existing.remove();
    res.status(200).json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
