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
    console.log(
        'getMyPageData response.data',
        JSON.stringify(response.data, null, 2)
    );
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
    console.log(
        'getMyProfile response.data',
        JSON.stringify(response.data, null, 2)
    );
    const result = response.data;
    if (result.status && result.status !== 'SUCCESS') {
        throw new Error(result.message || '프로필을 가져올 수 없습니다');
    }
    // 일부 백엔드가 status 없이 data만 반환할 수 있어 data 우선 사용
    return result.data || result;
}

/**
 * 북마크를 토글합니다 (추가/삭제).
 * @param {number} placeId - 장소 ID
 * @returns {Promise<{bookmarked: boolean}>} 북마크 상태 (true: 추가됨, false: 삭제됨)
 * @throws {Error} API 호출 실패 시
 */
export async function toggleBookmark(placeId) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('로그인이 필요합니다');
    }

    try {
        const response = await api.post(
            '/mark',
            { placeId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const result = response.data;
        if (result.status !== 'SUCCESS') {
            throw new Error(result.message || '북마크 처리에 실패했습니다');
        }

        return result.data;
    } catch (error) {
        console.error('북마크 토글 실패', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('북마크 처리 중 오류가 발생했습니다');
    }
}

/**
 * 북마크 목록을 조회합니다.
 * @returns {Promise<Array>} 북마크된 장소 목록
 * @throws {Error} API 호출 실패 시
 */
export async function getMyBookmarks() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('로그인이 필요합니다');
    }

    try {
        const response = await api.get('/mark/list', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const result = response.data;
        if (result.status !== 'SUCCESS') {
            throw new Error(
                result.message || '북마크 목록을 가져올 수 없습니다'
            );
        }

        // 응답 데이터가 배열이거나 data 속성에 배열이 있을 수 있음
        const bookmarks = Array.isArray(result.data) ? result.data : [];

        // 운영 시간 필드가 null인 경우 필터링하여 반환
        return bookmarks.map((bookmark) => ({
            placeId: bookmark.placeId,
            placeName: bookmark.placeName || '',
            address: bookmark.address || '',
            detailAddress: bookmark.detailAddress || '',
            locationX: bookmark.locationX,
            locationY: bookmark.locationY,
            telNum: bookmark.telNum || null,
            weekdayOpen: bookmark.weekdayOpen || null,
            weekdayClose: bookmark.weekdayClose || null,
            weekendOpen: bookmark.weekendOpen || null,
            weekendClose: bookmark.weekendClose || null,
            openingDays: bookmark.openingDays || null,
        }));
    } catch (error) {
        console.error('북마크 목록 조회 실패', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('북마크 목록을 불러오는데 실패했습니다');
    }
}
