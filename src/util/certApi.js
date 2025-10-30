const BASE_URL = 'https://your-api-domain.com'; // 나중에 실제 URL로 변경

// 최근 인증 내역 조회
export async function fetchCertificationHistory(category = '') {
    try {
        const params = category ? `?category=${category}` : '';

        const response = await fetch(
            `${BASE_URL}/verification/history${params}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    memberId: 'USER_A001', // 실제로는 로그인 정보에서 가져와야 함
                    authorization: 'Bearer YOUR_TOKEN', // 실제 토큰으로 변경
                },
            }
        );

        const result = await response.json();

        if (result.status === 'SUCCESS') {
            return {
                success: true,
                data: result.data,
                message: result.message,
            };
        } else {
            return {
                success: false,
                data: [],
                message: result.message || '조회에 실패했습니다.',
            };
        }
    } catch (error) {
        console.error('API 요청 오류:', error);
        return {
            success: false,
            data: [],
            message: '네트워크 오류가 발생했습니다.',
        };
    }
}
