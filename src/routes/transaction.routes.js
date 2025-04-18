// routes/transaction.route.js
import express from "express";
import auth from "../middleware/auth.js"; // uses both session & token
// import Transaction from "../models/transaction.model.js";
// import transactionRoutes from './routes/transaction.route.js';
import transactionRoutes from "./routes/transaction.route.js";
const router = express.Router();

//  GET all transactions for authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// GET single transaction
router.get("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transaction" });
  }
});

//  POST create a new transaction
router.post("/", auth, async (req, res) => {
  try {
    const newTransaction = new Transaction({
      ...req.body,
      userId: req.user._id,
    });
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: "Failed to create transaction" });
  }
});

// PUT update transaction
router.put("/:id", auth, async (req, res) => {
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTransaction) return res.status(404).json({ message: "Transaction not found" });
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: "Error updating transaction" });
  }
});

//  DELETE transaction
router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) return res.status(404).json({ message: "Transaction not found" });
    res.json(deletedTransaction);
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction" });
  }
});

export default router;
