export * from './agent.js';
export * from './template.js';
export * from './campaign.js';


export interface ChatMessage {
    role: "assistant" | "user";
    text: string;
    sources?: string[];
}
export * from './chat.js';
