import api from './axios';

export async function getBadges() {
    const res = await api.get('/badge');
    return res.data.data;
}

export async function registerBadge(req) {
    const res = await api.post('/badge', req);
    return res.data.data;
}

export async function selectBadge(badgeName) {
    const res = await api.get('/badge/select', { params: { badgeName } });
    return res.data.data;
}
