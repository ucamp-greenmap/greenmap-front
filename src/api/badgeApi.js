import api from './axios';

/**
 * 뱃지 목록을 조회합니다.
 * @returns {Promise<Array>} 뱃지 목록 배열
 * @throws {Error} API 호출 실패 시
 */
export async function getBadges() {
    try {
        const response = await api.get('/badge');

        if (response.data.status === 'SUCCESS' && response.data.data?.data) {
            return response.data.data.data;
        } else {
            throw new Error(
                response.data.message || '뱃지 정보를 가져올 수 없습니다.'
            );
        }
    } catch (error) {
        console.error('뱃지 조회 실패', error);

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }

        throw new Error('뱃지 정보를 불러오는데 실패했습니다.');
    }
}

export async function registerBadge(req) {
    const res = await api.post('/badge', req);
    return res.data.data;
}

export async function selectBadge(badgeName) {
    const res = await api.get('/badge/select', { params: { badgeName } });
    return res.data.data;
}
