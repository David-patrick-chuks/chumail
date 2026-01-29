import { GoogleGenerativeAI as GoogleGenAI } from '@google/generative-ai';

import { env } from './env.js';

if (!env.GEMINI_API_KEY) {
    console.warn('Gemini API key missing. AI features may not work.');
}

// Pass a dummy key if missing to prevent crash on startup. 
export const ai = new GoogleGenAI(env.GEMINI_API_KEY || 'dummy-key');

