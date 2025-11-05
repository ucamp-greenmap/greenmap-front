import api from '../api/axios';

// 인증 요청 (공통)
async function sendVerification(url, body) {
    const token = localStorage.getItem('token');

    try {
        console.log(`📤 API 요청: ${url}`);
        console.log('📦 body:', body);

        const response = await api.post(url, body, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const result = response.data;

        if (result.status === 'SUCCESS') {
            return {
                success: true,
                data: result.data,
                message: result.message,
            };
        } else {
            return {
                success: false,
                message: result.message || '인증에 실패했습니다.',
            };
        }
    } catch (error) {
        const errorDetails = error.response?.data
            ? JSON.stringify(error.response.data)
            : error.message;

        console.error('❌ API 요청 오류:', errorDetails);

        let message = '네트워크 오류가 발생했습니다.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.response?.status) {
            message = `서버 오류 (${error.response.status})가 발생했습니다.`;
        }

        return {
            success: false,
            message: message,
        };
    }
}

// 따릉이 인증
export async function verifyBike(data) {
    return sendVerification('/verification/bike', data);
}

// 전기차 인증
export async function verifyEVCar(data) {
    const evCarBody = {
        ...data,
        category: 'EVCAR',
    };
    return sendVerification('/verification/car', evCarBody);
}

// 수소차 인증 (HCAR)
export async function verifyHCar(data) {
    const hCarBody = {
        ...data,
        category: 'HCAR',
    };
    return sendVerification('/verification/car', hCarBody);
}

// 상점 인증
export async function verifyShop(data) {
    return sendVerification('/verification/shop', data);
}

// 이번 달 인증 통계 조회
export async function fetchMonthlyStats() {
    const token = localStorage.getItem('token');

    try {
        const response = await api.get('/verification/month', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const result = response.data;

        if (result.status === 'SUCCESS') {
            return {
                success: true,
                data: result.data,
                message: result.message,
            };
        } else {
            return {
                success: false,
                data: { verifyTimes: 0, pointSum: 0 },
                message: result.message || '조회에 실패했습니다.',
            };
        }
    } catch (error) {
        console.error('API 요청 오류:', error.response?.data || error.message);
        return {
            success: false,
            data: { verifyTimes: 0, pointSum: 0 },
            message: '네트워크 오류가 발생했습니다.',
        };
    }
}

// 최근 인증 내역 조회
export async function fetchCertificationHistory() {
    const token = localStorage.getItem('token');

    try {
        const response = await api.get('/verification/history', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const result = response.data;

        if (result.status === 'SUCCESS') {
            return {
                success: true,
                data: result.data.historyItems,
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
        console.error('API 요청 오류:', error.response?.data || error.message);
        return {
            success: false,
            data: [],
            message: '네트워크 오류가 발생했습니다.',
        };
    }
}
