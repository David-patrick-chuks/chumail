import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../utils/logger.js';
import { pool } from '../config/db.js';
import { generateContentStream } from './ai/geminiService.js';


let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust for production
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        // Users can join rooms based on their user_id or agent_id for targeted updates
        socket.on('join', (room: string) => {
            socket.join(room);
            logger.info(`Socket ${socket.id} joined room: ${room}`);
        });

        socket.on('ADMIN_JOIN', async (userId: string) => {
            try {
                const result = await pool.query('SELECT role FROM profiles WHERE id = $1', [userId]);
                if (result.rows.length > 0 && result.rows[0].role === 'admin') {
                    socket.join('admin_room');
                    logger.info(`Admin ${userId} joined the Command Center room`);
                    socket.emit('ADMIN_SYNC_SUCCESS');
                } else {
                    socket.emit('ADMIN_SYNC_ERROR', { error: 'Unauthorized' });
                }
            } catch (err) {
                logger.error('Socket Admin Join Error:', err);
            }
        });


        socket.on('CHAT_STREAM_REQUEST', async (payload: any) => {

            const { agentId, message, history, userId } = payload;

            try {
                // 1. Verify Ownership & Get Persona
                const agentResult = await pool.query(
                    'SELECT persona_prompt FROM agents WHERE id = $1::uuid AND user_id = $2::uuid',
                    [agentId as string, userId as string]
                );


                if (agentResult.rows.length === 0) {
                    socket.emit('CHAT_ERROR', { error: 'Unauthorized or Agent not found' });
                    return;
                }

                const personaPrompt = agentResult.rows[0].persona_prompt;

                // 2. Stream from Gemini
                let fullResponse = '';
                for await (const chunk of generateContentStream(message, {
                    history,
                    systemInstruction: personaPrompt
                })) {

                    fullResponse += chunk;
                    socket.emit('CHAT_CHUNK', { agentId, chunk });
                }

                socket.emit('CHAT_COMPLETE', { agentId });


                // 4. Log the interaction (async)
                const userTokens = Math.ceil(message.length / 4);
                const assistantTokens = Math.ceil(fullResponse.length / 4);

                pool.query(
                    'INSERT INTO messages (agent_id, role, content, tokens_used, user_id) VALUES ($1, $2, $3, $4, $5)',
                    [agentId, 'user', message, userTokens, userId]
                ).catch(e => logger.error('Message log failed:', e));

                pool.query(
                    'INSERT INTO messages (agent_id, role, content, tokens_used, user_id) VALUES ($1, $2, $3, $4, $5)',
                    [agentId, 'assistant', fullResponse, assistantTokens, userId]
                ).catch(e => logger.error('Response log failed:', e));

            } catch (error: any) {
                logger.error('Socket Chat Error:', error.message || error);
                socket.emit('CHAT_ERROR', { error: 'Failed to process chat stream' });
            }
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

/**
 * Standard event names for real-time updates
 */
export const SOCKET_EVENTS = {
    TRAINING_PROGRESS: 'TRAINING_PROGRESS',
    AGENT_STATUS_UPDATE: 'AGENT_STATUS_UPDATE',
    SYSTEM_ALERT: 'SYSTEM_ALERT',
    CHAT_MESSAGE: 'CHAT_MESSAGE',
    ADMIN_STATS_UPDATE: 'ADMIN_STATS_UPDATE',
    ADMIN_LOG_EVENT: 'ADMIN_LOG_EVENT'
};


/**
 * Utility to emit to specific rooms
 */
export const notifyRoom = (room: string, event: string, data: any) => {
    if (io) {
        io.to(room).emit(event, data);
    }
};

/**
 * Utility to emit to all connected clients
 */
export const broadcast = (event: string, data: any) => {
    if (io) {
        io.emit(event, data);
    }
};
