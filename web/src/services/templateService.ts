import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const templateService = {
    getPublicTemplates: async () => {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get(`${API_URL}/templates/public`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    getUserTemplates: async () => {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get(`${API_URL}/templates/my`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    createTemplate: async (data: any) => {
        const token = localStorage.getItem('auth_token');
        const response = await axios.post(`${API_URL}/templates`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    deleteTemplate: async (id: string) => {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`${API_URL}/templates/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    useTemplate: async (id: string) => {
        const token = localStorage.getItem('auth_token');
        await axios.post(`${API_URL}/templates/${id}/use`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};
