import express from 'express';
import auth from '../middleware/auth.js';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  validateTransactionData,
} from '../controllers/transaction.controller.js';

const router = express.Router();

router.get('/', auth, getAllTransactions);
router.post('/:transactionId', auth, getTransactionById);
router.post('/', auth, validateTransactionData, createTransaction);
router.put('/:transactionId', auth, validateTransactionData, updateTransaction);
router.delete('/:transactionId', auth, deleteTransaction);

export default router;