import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import friendRequestRoutes from './friendRequestRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/friend-requests', friendRequestRoutes);

export default router;
