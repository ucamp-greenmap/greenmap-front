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

// ============================================
// Request Interceptor - JWT 토큰 자동 삽입
// ============================================
api.interceptors.request.use(
    (config) => {
        // localStorage에서 토큰 가져오기
        const token = localStorage.getItem('token');

        // 토큰이 있으면 Authorization 헤더에 추가
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ============================================
// Response Interceptor - 에러 핸들링
// ============================================
api.interceptors.response.use(
    (response) => {
        // 성공 응답은 그대로 반환
        return response;
    },
    (error) => {
        // 에러 응답 처리
        if (error.response) {
            const { status, data } = error.response;

            // 401 Unauthorized - 토큰 만료 또는 인증 실패
            if (status === 401) {
                console.error('인증 오류: 로그인이 필요합니다.');

                // 토큰 제거
                localStorage.removeItem('token');

                // 로그인 페이지로 리다이렉트 (선택사항)
                // window.location.href = '/login';
            }

            // 403 Forbidden - 권한 없음
            if (status === 403) {
                console.error('권한 오류: 접근 권한이 없습니다.');
            }

            // 404 Not Found
            if (status === 404) {
                console.error('요청 오류: 리소스를 찾을 수 없습니다.');
            }

            // 500 Internal Server Error
            if (status === 500) {
                console.error('서버 오류: 서버에 문제가 발생했습니다.');
            }

            // 에러 메시지가 있으면 콘솔에 출력
            if (data?.message) {
                console.error('API 에러:', data.message);
            }
        } else if (error.request) {
            // 요청은 보냈지만 응답을 받지 못한 경우
            console.error('네트워크 오류: 서버에 연결할 수 없습니다.');
        } else {
            // 요청 설정 중 에러 발생
            console.error('요청 오류:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
