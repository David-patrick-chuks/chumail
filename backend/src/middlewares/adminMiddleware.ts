import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware.js';
import { pool } from '../config/db.js';
import { logger } from '../utils/logger.js';

export const adminOnly = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await pool.query('SELECT role FROM profiles WHERE id = $1', [req.user.id]);

        if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
            logger.warn(`Unauthorized admin access attempt by user: ${req.user.id}`);
            return res.status(403).json({ error: 'Forbidden: Admin access only' });
        }

        next();
    } catch (error: any) {
        logger.error('Admin middleware error:', error.message);
        res.status(500).json({ error: 'Internal server error during authorization' });
    }
};
