import { Response } from 'express';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { logger } from '../utils/logger.js';

export const getPublicTemplates = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM templates WHERE is_public = true ORDER BY usage_count DESC, created_at DESC'
        );
        res.json(result.rows);
    } catch (error: any) {
        logger.error('Error fetching public templates:', error.message);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
};

export const getUserTemplates = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
        const result = await pool.query(
            'SELECT * FROM templates WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error: any) {
        logger.error('Error fetching user templates:', error.message);
        res.status(500).json({ error: 'Failed to fetch your templates' });
    }
};

export const createTemplate = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { name, subject, content, category, is_public } = req.body;

    if (!name || !content) {
        return res.status(400).json({ error: 'Name and content are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO templates (user_id, name, subject, content, category, is_public) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, name, subject, content, category || 'General', is_public !== false]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        logger.error('Error creating template:', error.message);
        res.status(500).json({ error: 'Failed to create template' });
    }
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM templates WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found or unauthorized' });
        }
        res.json({ message: 'Template deleted successfully' });
    } catch (error: any) {
        logger.error('Error deleting template:', error.message);
        res.status(500).json({ error: 'Failed to delete template' });
    }
};

export const incrementUsage = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE templates SET usage_count = usage_count + 1 WHERE id = $1', [id]);
        res.json({ message: 'Usage updated' });
    } catch (error: any) {
        logger.error('Error incrementing usage:', error.message);
        res.status(500).json({ error: 'Failed to update usage' });
    }
};
