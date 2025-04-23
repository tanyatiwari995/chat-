import express from 'express';
import auth from '../middleware/auth.js';
import {
  sendMessage,
  getMessages,
  reactToMessage,
  markAsRead,
  editMessage,
  deleteMessage
} from '../controllers/message.controller.js';

const router = express.Router();

router.post('/send', auth, sendMessage);
router.get('/:user1/:user2', auth, getMessages);
router.post('/react/:id', auth, reactToMessage);
router.post('/read/:id', auth, markAsRead);
router.put('/edit/:id', auth, editMessage);
router.delete('/:id', auth, deleteMessage);

export default router;
