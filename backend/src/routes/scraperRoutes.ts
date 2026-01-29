import { Router } from 'express';
import { handleScrape } from '../controllers/scraperController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/scrape', authenticate as any, handleScrape as any);

export default router;
