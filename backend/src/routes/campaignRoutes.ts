import { Router } from 'express';
import {
    createCampaign,
    startCampaign,
    getCampaigns,
    getCampaignLeads
} from '../controllers/campaignController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate as any, getCampaigns as any);
router.post('/', authenticate as any, createCampaign as any);
router.post('/:id/start', authenticate as any, startCampaign as any);
router.get('/:id/leads', authenticate as any, getCampaignLeads as any);

export default router;
