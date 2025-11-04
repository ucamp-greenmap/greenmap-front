import axios from 'axios';

const api = axios.create({
    // baseURL: 'http://34.50.38.218',
    baseURL: 'http://localhost:8080',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
