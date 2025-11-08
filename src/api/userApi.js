import api from '../api/axios';

/**
 * 마이페이지 데이터를 조회합니다.
 * 응답 포맷: { member, point, ranking }
 */
export async function getMyPageData() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('로그인이 필요합니다');
    }

    const response = await api.get('/mypage', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const result = response.data;
    if (result.status !== 'SUCCESS') {
        throw new Error(result.message || '정보를 가져올 수 없습니다');
    }
    return result.data;
}

/**
 * 현재 로그인한 사용자 프로필을 조회합니다.
 * 응답 포맷: { nickname, email, imageUrl, memberId, ... }
 */
export async function getMyProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('로그인이 필요합니다');
    }

    const response = await api.get('/member/me', {
        headers: { Authorization: `Bearer ${token}` },
    });
    const result = response.data;
    if (result.status && result.status !== 'SUCCESS') {
        throw new Error(result.message || '프로필을 가져올 수 없습니다');
    }
    // 일부 백엔드가 status 없이 data만 반환할 수 있어 data 우선 사용
    return result.data || result;
}
