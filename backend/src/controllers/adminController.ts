import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { logger } from '../utils/logger.js';

export const getPlatformStats = async (req: Request, res: Response) => {
    try {
        const stats = {
            users: (await pool.query('SELECT COUNT(*) FROM profiles')).rows[0].count,
            agents: (await pool.query('SELECT COUNT(*) FROM agents')).rows[0].count,
            campaigns: (await pool.query('SELECT COUNT(*) FROM campaigns')).rows[0].count,
            leads: (await pool.query('SELECT COUNT(*) FROM leads')).rows[0].count,
            messages: (await pool.query('SELECT COUNT(*) FROM messages')).rows[0].count,
        };
        res.json(stats);
    } catch (error: any) {
        logger.error('Error fetching admin stats:', error.message);
        res.status(500).json({ error: 'Failed to fetch platform statistics' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT p.*, 
            (SELECT COUNT(*) FROM agents WHERE user_id = p.id) as agent_count,
            (SELECT COUNT(*) FROM campaigns WHERE user_id = p.id) as campaign_count
            FROM profiles p 
            ORDER BY p.updated_at DESC
        `);
        res.json(result.rows);
    } catch (error: any) {
        logger.error('Error fetching all users:', error.message);
        res.status(500).json({ error: 'Failed to fetch user list' });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    const { userId, role } = req.body;
    try {
        await pool.query('UPDATE profiles SET role = $1 WHERE id = $2', [role, userId]);
        res.json({ message: 'User role updated successfully' });
    } catch (error: any) {
        logger.error('Error updating user role:', error.message);
        res.status(500).json({ error: 'Failed to update user role' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        // Cascading delete should handle related table data if schema set up correctly
        await pool.query('DELETE FROM profiles WHERE id = $1', [userId]);
        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        logger.error('Error deleting user:', error.message);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
