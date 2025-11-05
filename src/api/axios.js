// baseURL: '/',
import axios from 'axios';
// baseURL: 'http://34.64.191.137:8080/',

const api = axios.create({
    baseURL: 'http://localhost:8080/',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
