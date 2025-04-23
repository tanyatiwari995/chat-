import express from 'express';
import { updateTypingStatus } from '../controllers/typing.controller.js';

const router = express.Router();

router.post('/', updateTypingStatus);

export default router;
