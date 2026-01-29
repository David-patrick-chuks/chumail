import { Response } from 'express';
import { scrapeWebsite } from '../services/scraperService.js';
import { logger } from '../utils/logger.js';
import { notifyRoom } from '../services/socketService.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';


export const handleScrape = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { url } = req.body;


    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        logger.info(`Scrape request received for: ${url}`);

        // Notify start
        if (userId) notifyRoom(userId, 'SCRAPE_STATUS', { status: 'InProgress', message: 'Starting deep discovery...' });

        const leads = await scrapeWebsite(url);

        // Notify complete
        if (userId) notifyRoom(userId, 'SCRAPE_STATUS', { status: 'Completed', leadsCount: leads.length });

        res.json({ leads });

    } catch (error: any) {
        logger.error(`Scrape controller error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
