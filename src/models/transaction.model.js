import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  paymentType: { type: String, enum: ['Credit', 'Debit', 'Cash'], required: true },
  category: { type: String, enum: ['Saving', 'Expense', 'Investment', 'Food', 'Entertainment', 'Utilities', 'Bills', 'Other'], required: true },
  amount: { type: Number, required: true },
  location: { type: String, default: "Unknown" },
  date: { type: Date, required: true },
  isRecurring: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;