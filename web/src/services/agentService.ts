import apiClient from './apiClient';
import type { Agent } from '../types/index.js';

export const agentService = {
    async fetchAgents(): Promise<Agent[]> {
        return apiClient.get<Agent[]>('/agents');
    },

    async createAgent(agent: Partial<Agent>): Promise<Agent> {
        return apiClient.post<Agent>('/agents', agent);
    },

    async updateAgent(id: string, agent: Partial<Agent>): Promise<Agent> {
        return apiClient.patch<Agent>(`/agents/${id}`, agent);
    },

    async deleteAgent(id: string): Promise<{ success: boolean }> {
        return apiClient.delete<{ success: boolean }>(`/agents/${id}`);
    }
};

