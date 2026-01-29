import { Response } from 'express';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { logger } from '../utils/logger.js';
import { generateContent } from '../services/ai/geminiService.js';
import nodemailer from 'nodemailer';
import { notifyRoom } from '../services/socketService.js';


export const createCampaign = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { name, agent_id, leads: leadsData } = req.body;

    if (!name || !agent_id || !leadsData || !leadsData.length) {
        return res.status(400).json({ error: 'Name, agent_id, and leads are required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Create campaign
        const campaignRes = await client.query(
            'INSERT INTO campaigns (user_id, agent_id, name, total_leads, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, agent_id, name, leadsData.length, 'Draft']
        );
        const campaignId = campaignRes.rows[0].id;

        // 2. Insert leads
        for (const lead of leadsData) {
            await client.query(
                'INSERT INTO leads (campaign_id, email, first_name, role) VALUES ($1, $2, $3, $4)',
                [campaignId, lead.email, lead.name || null, lead.role || null]
            );
        }

        await client.query('COMMIT');
        res.status(201).json(campaignRes.rows[0]);
    } catch (error: any) {
        await client.query('ROLLBACK');
        logger.error('Error creating campaign:', error.message);
        res.status(500).json({ error: 'Failed to create campaign' });
    } finally {
        client.release();
    }
};

export const startCampaign = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    try {
        // Fetch campaign and associated agent
        const campaignRes = await pool.query(
            `SELECT c.*, a.email as agent_email, a.app_password, a.persona_prompt 
             FROM campaigns c 
             JOIN agents a ON c.agent_id = a.id 
             WHERE c.id = $1 AND c.user_id = $2`,
            [id, userId]
        );

        if (campaignRes.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const campaign = campaignRes.rows[0];

        // Update status to InProgress
        await pool.query('UPDATE campaigns SET status = $1 WHERE id = $2', ['InProgress', id]);

        // Start processing leads asynchronously
        processCampaignLeads(campaign, userId);

        res.json({ message: 'Campaign started successfully', id });
    } catch (error: any) {
        logger.error('Error starting campaign:', error.message);
        res.status(500).json({ error: 'Failed to start campaign' });
    }
};

const processCampaignLeads = async (campaign: any, userId?: string) => {
    const { id: campaignId, agent_email, app_password, persona_prompt } = campaign;


    try {
        const leadsRes = await pool.query(
            "SELECT * FROM leads WHERE campaign_id = $1 AND status = 'Pending'",
            [campaignId]
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: agent_email, pass: app_password }
        });

        let sentCount = 0;
        for (const lead of leadsRes.rows) {
            try {
                // Notify processing
                if (userId) notifyRoom(userId, 'CAMPAIGN_PROGRESS', {
                    campaignId,
                    status: 'InProgress',
                    message: `Personalizing for ${lead.email}...`,
                    sentCount
                });

                // 1. Generate Personalized Content
                const prompt = `
                You are an email agent with the following persona:
                "${persona_prompt}"

                Generate a personalized outreach email for:
                Name: ${lead.first_name || 'there'}
                Role: ${lead.role || 'Professional'}
                Email: ${lead.email}

                The goal is to be helpful and relevant based on your persona.
                Keep it concise and professional.
                `;

                const personalizedContent = await generateContent(prompt);

                // 2. Send Email
                await transporter.sendMail({
                    from: agent_email,
                    to: lead.email,
                    subject: `Message from ${campaign.name}`, // Can be improved
                    text: personalizedContent
                });

                // 3. Update Lead Status
                await pool.query(
                    "UPDATE leads SET status = 'Sent', personalized_content = $1, sent_at = NOW() WHERE id = $2",
                    [personalizedContent, lead.id]
                );

                // 4. Update Campaign Progress
                sentCount++;
                await pool.query(
                    "UPDATE campaigns SET sent_leads = sent_leads + 1 WHERE id = $1",
                    [campaignId]
                );

                // Notify progress
                if (userId) notifyRoom(userId, 'CAMPAIGN_PROGRESS', {
                    campaignId,
                    status: 'InProgress',
                    sentCount
                });

                // Wait a bit to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error: any) {
                logger.error(`Failed to process lead ${lead.email}: ${error.message}`);
                await pool.query(
                    "UPDATE leads SET status = 'Failed', error_message = $1 WHERE id = $2",
                    [error.message, lead.id]
                );
            }
        }

        // Finalize campaign
        await pool.query('UPDATE campaigns SET status = $1 WHERE id = $2', ['Completed', campaignId]);
        if (userId) notifyRoom(userId, 'CAMPAIGN_PROGRESS', { campaignId, status: 'Completed', sentCount });

    } catch (error: any) {
        logger.error(`Fatal error in campaign ${campaignId}: ${error.message}`);
        await pool.query('UPDATE campaigns SET status = $1 WHERE id = $2', ['Failed', campaignId]);
        if (userId) notifyRoom(userId, 'CAMPAIGN_PROGRESS', { campaignId, status: 'Failed', error: error.message });
    }

};

export const getCampaigns = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
        const result = await pool.query(
            'SELECT * FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
};

export const getCampaignLeads = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM leads WHERE campaign_id = $1', [id]);
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
};
