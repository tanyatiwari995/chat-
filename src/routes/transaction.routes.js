import express from "express";
import auth from "../middleware/auth.js";
import Transaction from "../models/transaction.model.js";

// Validation function for transaction data
const validateTransactionData = (req, res, next) => {
  const { description, paymentType, category, amount, date } = req.body;

  if (!description || !paymentType || !category || !amount || !date) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  next();
};

const router = express.Router();

// GET all transactions for the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id });
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transactions", error: error.message });
  }
});

// POST create a new transaction
router.post("/", auth, validateTransactionData, async (req, res) => {
  try {
    const { description, paymentType, category, amount, date, location, isRecurring } = req.body;

    const newTransaction = new Transaction({
      description,
      paymentType,
      category,
      amount,
      date,
      location: location || "Unknown", // Default location if not provided
      isRecurring: isRecurring || false, // Default value for isRecurring
      userId: req.user._id, // Associate the transaction with the authenticated user
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(400).json({ success: false, message: "Failed to create transaction", error: error.message });
  }
});

// GET a single transaction by ID (secured to owner)
router.get("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access to this transaction" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ success: false, message: "Error fetching transaction", error: error.message });
  }
});

// PUT update a transaction by ID (secured to owner)
router.put("/:id", auth, validateTransactionData, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access to this transaction" });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ success: false, message: "Error updating transaction", error: error.message });
  }
});

// DELETE a transaction by ID (secured to owner)
router.delete("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access to this transaction" });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ success: false, message: "Error deleting transaction", error: error.message });
  }
});

export default router;
