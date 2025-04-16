import { Schema, model } from "mongoose";

const transactionSchema = new Schema({
    

    description: {
        type: String,
        required: true,
    },
    
    paymentType: {
        type: String,
        enum: ['Credit', 'Debit', 'Cash'], // Enum values for paymentType
        required: true,
      },
    
    category: {
        type: String,
        enum: ["Saving", "Expense", "Investment", 'Food', 'Entertainment', 'Utilities',"Bills","other"],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        default: "Unknown",
    },
    date: {
        type: Date,
        required: true,
    },
    isRecurring: {
        type: Boolean,
        default: false,
      },
      
},
    { timestamps: true }
);

const Transaction = model("Transaction", transactionSchema);
export default Transaction;