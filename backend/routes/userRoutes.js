import express from 'express';
import { userController } from '../controllers/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', userController.getUsers);
router.get('/search', userController.searchUsers);
router.get('/me/friends', requireAuth, userController.getFriends);
router.get('/:userId/friends', userController.getFriends);

export default router;
