import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/adminMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

router.use(authenticate as any);
router.use(adminOnly as any);

router.get('/stats', adminController.getPlatformStats);
router.get('/users', adminController.getAllUsers);
router.patch('/users/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

export default router;
