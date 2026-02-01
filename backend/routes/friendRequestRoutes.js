import express from 'express';
import { friendRequestController } from '../controllers/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', friendRequestController.sendFriendRequest);
router.get('/received', friendRequestController.listReceived);
router.get('/sent', friendRequestController.listSent);
router.post('/:id/accept', friendRequestController.acceptFriendRequest);
router.post('/:id/decline', friendRequestController.declineFriendRequest);
router.post('/:id/cancel', friendRequestController.cancelFriendRequest);

export default router;
