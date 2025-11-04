import axios from 'axios';

const api = axios.create({
    baseURL: 'http://34.50.38.218',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
