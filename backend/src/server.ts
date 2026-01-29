import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import aiRoutes from './routes/aiRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import scraperRoutes from './routes/scraperRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import { errorHandler } from './middlewares/errorHandler.js';




import { authenticate } from './middlewares/authMiddleware.js';

import { createServer } from 'http';
import { initSocket } from './services/socketService.js';

const app = express();
const server = createServer(app);

// Initialize Socket.io
initSocket(server);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/agents', authenticate as any, agentRoutes);
app.use('/api/scraper', authenticate as any, scraperRoutes);
app.use('/api/templates', authenticate as any, templateRoutes);
app.use('/api/campaigns', authenticate as any, campaignRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', analyticsRoutes);


app.use('/api/settings', settingsRoutes);


app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

const PORT = env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`ChuMail Kernel active on port ${PORT}`);
});
