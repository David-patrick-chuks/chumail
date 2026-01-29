import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const campaignService = {
    getCampaigns: async () => {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get(`${API_URL}/campaigns`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    getCampaignLeads: async (id: string) => {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get(`${API_URL}/campaigns/${id}/leads`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    createCampaign: async (data: any) => {
        const token = localStorage.getItem('auth_token');
        const response = await axios.post(`${API_URL}/campaigns`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    startCampaign: async (id: string) => {
        const token = localStorage.getItem('auth_token');
        const response = await axios.post(`${API_URL}/campaigns/${id}/start`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
