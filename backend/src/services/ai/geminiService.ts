import { GoogleGenerativeAI as GoogleGenAI, Content } from "@google/generative-ai";

import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { GEMINI_MODELS, MAX_RETRY_COUNT, DEFAULT_TEMPERATURE } from '../../constants/index.js';
import path from 'path';
import fs from 'fs';

class GeminiServiceClass {
    private apiKeys: string[];
    private currentApiKeyIndex: number = 0;
    private clients: GoogleGenAI[] = [];

    constructor() {
        this.apiKeys = [];
        if (env.GEMINI_API_KEY) this.apiKeys.push(env.GEMINI_API_KEY);

        for (let i = 1; i <= 10; i++) {
            const key = process.env[`GEMINI_API_KEY_${i}`];
            if (key && key !== env.GEMINI_API_KEY) {
                this.apiKeys.push(key);
            }
        }

        if (this.apiKeys.length === 0) {
            throw new Error('No Gemini API keys found in environment variables');
        }

        this.clients = this.apiKeys.map(key => new GoogleGenAI(key));
        logger.info(`Initialized Gemini service with ${this.apiKeys.length} API keys`);

    }

    private switchApiKey(): void {
        this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.apiKeys.length;
        logger.info(`Switched to API key ${this.currentApiKeyIndex + 1}/${this.apiKeys.length}`);
    }

    private getCurrentClient(): GoogleGenAI {
        return this.clients[this.currentApiKeyIndex];
    }

    async embedText(text: string, retryCount: number = 0, maxRetries: number = 3): Promise<number[]> {
        try {
            const ai = this.getCurrentClient();
            const model = ai.getGenerativeModel({ model: GEMINI_MODELS.EMBEDDING });
            const res = await model.embedContent(text);

            return res.embedding?.values || [];

        } catch (error: any) {
            if (retryCount < maxRetries) {
                const msg = error.message || "";
                if (msg.includes("429") || msg.includes("Too Many Requests")) {
                    logger.warn(`API key ${this.currentApiKeyIndex + 1} limit exhausted, switching...`);
                    this.switchApiKey();
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    return this.embedText(text, retryCount + 1, maxRetries);
                } else if (msg.includes("503") || msg.includes("Service Unavailable") || msg.includes("500")) {
                    logger.warn(`Gemini service error (${msg}). Retrying...`);
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                    return this.embedText(text, retryCount + 1, maxRetries);
                }
            }
            logger.error("Error embedding text after retries:", error);
            return new Array(768).fill(0);
        }
    }

    private formatContents(prompt: string, history: any[] = []): any[] {
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        // Remove assistant placeholders or empty messages from history to prevent SDK errors
        const validHistory = formattedHistory.filter(h => h.parts[0].text);

        return [...validHistory, { role: 'user', parts: [{ text: prompt }] }];
    }

    async generateContent(prompt: string, options: any = {}): Promise<string> {
        try {
            const ai = this.getCurrentClient();
            const model = ai.getGenerativeModel({
                model: GEMINI_MODELS.FLASH_1_5,
                generationConfig: {
                    temperature: options.temperature || DEFAULT_TEMPERATURE,
                },
                systemInstruction: options.systemInstruction
            });
            const contents = this.formatContents(prompt, options.history || []);

            const res = await model.generateContent({ contents });

            return res.response.text() || '';

        } catch (error: any) {
            logger.error("Error generating content:", error);
            if (error.message?.includes("429")) {
                this.switchApiKey();
                return this.generateContent(prompt, options);
            }
            throw new Error("Failed to generate content");
        }
    }

    async *generateContentStream(prompt: string, options: any = {}) {
        try {
            const ai = this.getCurrentClient();
            const model = ai.getGenerativeModel({
                model: GEMINI_MODELS.FLASH_1_5,
                generationConfig: {
                    temperature: options.temperature || DEFAULT_TEMPERATURE,
                },
                systemInstruction: options.systemInstruction
            });
            const contents = this.formatContents(prompt, options.history || []);

            const stream = await model.generateContentStream({ contents });

            for await (const chunk of stream.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                    yield chunkText;
                }
            }

        } catch (error: any) {
            logger.error("Error generating content stream:", error);
            if (error.message?.includes("429")) {
                this.switchApiKey();
                // We can't easily recurse an async generator for the whole stream without more complex handling,
                // but for now, we'll log and throw or retry once.
                throw error;
            }
            throw new Error("Failed to generate content stream");
        }
    }

}

export const geminiService = new GeminiServiceClass();
export const generateContent = (prompt: string, options: any = {}) => geminiService.generateContent(prompt, options);
export const generateContentStream = (prompt: string, options: any = {}) => geminiService.generateContentStream(prompt, options);
export const embedText = (text: string) => geminiService.embedText(text);

