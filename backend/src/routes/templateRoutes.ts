import { Router } from 'express';
import {
    getPublicTemplates,
    getUserTemplates,
    createTemplate,
    deleteTemplate,
    incrementUsage
} from '../controllers/templateController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/public', authenticate as any, getPublicTemplates as any);
router.get('/my', authenticate as any, getUserTemplates as any);
router.post('/', authenticate as any, createTemplate as any);
router.delete('/:id', authenticate as any, deleteTemplate as any);
router.post('/:id/use', authenticate as any, incrementUsage as any);

export default router;
