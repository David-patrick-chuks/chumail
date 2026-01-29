import { Response } from 'express';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

/**
 * Verify SMTP Credentials using nodemailer
 */
const verifySMTP = async (email: string, app_password: string): Promise<boolean> => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Default to gmail for now, can be expanded later
            auth: {
                user: email,
                pass: app_password
            }
        });
        await transporter.verify();
        return true;
    } catch (error: any) {
        logger.error(`SMTP Verification failed for ${email}: ${error.message}`);
        return false;
    }
};

export const getAgents = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
        const result = await pool.query(
            'SELECT id, name, email, persona_prompt, status, created_at, last_active FROM agents WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error: any) {
        logger.error('Error fetching agents:', error.message);
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
};

export const createAgent = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { name, email, app_password, persona_prompt } = req.body;

    if (!name || !email || !app_password) {
        return res.status(400).json({ error: 'Name, email, and app password are required' });
    }

    // Verify SMTP credentials before saving
    const isValid = await verifySMTP(email, app_password);
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or app password. Could not connect to SMTP server.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO agents (name, email, app_password, persona_prompt, status, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, persona_prompt, status',
            [name, email, app_password, persona_prompt, 'Active', userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        logger.error('Error creating agent:', error.message);
        res.status(500).json({ error: 'Failed to create agent' });
    }
};

export const getAgentById = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT id, name, email, persona_prompt, status, created_at, last_active FROM agents WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json(result.rows[0]);
    } catch (error: any) {
        logger.error('Error fetching agent:', error.message);
        res.status(500).json({ error: 'Failed to fetch agent' });
    }
};

export const updateAgent = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, email, app_password, persona_prompt, status } = req.body;

    try {
        // If email or app_password is being updated, verify again
        if (email || app_password) {
            // Get current values if one is missing
            const currentRes = await pool.query('SELECT email, app_password FROM agents WHERE id = $1 AND user_id = $2', [id, userId]);
            if (currentRes.rows.length === 0) return res.status(404).json({ error: 'Agent not found' });

            const verifyEmail = email || currentRes.rows[0].email;
            const verifyPass = app_password || currentRes.rows[0].app_password;

            const isValid = await verifySMTP(verifyEmail, verifyPass);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid new credentials. Verification failed.' });
            }
        }

        const result = await pool.query(
            `UPDATE agents 
             SET name = COALESCE($1, name), 
                 email = COALESCE($2, email), 
                 app_password = COALESCE($3, app_password), 
                 persona_prompt = COALESCE($4, persona_prompt),
                 status = COALESCE($5, status),
                 last_active = NOW()
             WHERE id = $6 AND user_id = $7 
             RETURNING id, name, email, persona_prompt, status`,
            [name, email, app_password, persona_prompt, status, id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json(result.rows[0]);
    } catch (error: any) {
        logger.error('Error updating agent:', error.message);
        res.status(500).json({ error: 'Failed to update agent' });
    }
};

export const deleteAgent = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM agents WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json({ message: 'Agent deleted successfully' });
    } catch (error: any) {
        logger.error('Error deleting agent:', error.message);
        res.status(500).json({ error: 'Failed to delete agent' });
    }
};

export const getAgentHealth = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT email, app_password, status FROM agents WHERE id = $1 AND user_id = $2', [id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        const agent = result.rows[0];
        const isHealthy = await verifySMTP(agent.email, agent.app_password);

        res.json({
            status: isHealthy ? 'Healthy' : 'Error',
            connectivity: isHealthy ? 'Active' : 'Failed',
            lastCheck: new Date().toISOString(),
            email: agent.email
        });
    } catch (error: any) {
        logger.error('Error checking agent health:', error.message);
        res.status(500).json({ error: 'Failed to check agent health' });
    }
};
