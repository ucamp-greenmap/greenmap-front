// baseURL: '/',
import axios from 'axios';
// baseURL: 'http://34.64.191.137:8080/',

const api = axios.create({
    baseURL: import.meta.env.VITE_APP_SERVER_URL || 'http://localhost:8080',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
