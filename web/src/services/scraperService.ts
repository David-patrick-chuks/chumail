import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const scraperService = {
    scrape: async (url: string) => {
        const token = localStorage.getItem('auth_token');
        const response = await axios.post(`${API_URL}/scraper/scrape`,
            { url },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data.leads;
    }
};
