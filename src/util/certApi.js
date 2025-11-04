const BASE_URL = 'http://34.50.38.218:8080';

// 인증 요청 (공통)
async function sendVerification(url, memberId, body) {
    try {
        console.log(`📤 API 요청: ${BASE_URL}${url}`);
        console.log('📦 body:', body);

        const response = await fetch(`${BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                memberId: memberId.toString(),
            },
            body: JSON.stringify(body),
        });

        console.log('📥 Response Status:', response.status);

        const result = await response.json();
        console.log('📥 Response Data:', result);

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
        console.error('❌ API 요청 오류:', error);
        return {
            success: false,
            message: '네트워크 오류가 발생했습니다.',
        };
    }
}

// 따릉이 인증
export async function verifyBike(memberId, data) {
    return sendVerification('/verification/bike', memberId, data);
}

// 전기차 인증
export async function verifyCar(memberId, data) {
    return sendVerification('/verification/car', memberId, data);
}

// 상점 인증
export async function verifyShop(memberId, data) {
    return sendVerification('/verification/shop', memberId, data);
}

// 이번 달 인증 통계 조회
export async function fetchMonthlyStats(memberId) {
    try {
        const response = await fetch(`${BASE_URL}/verification/monthly`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                memberId: memberId.toString(),
            },
        });

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
                data: { verifyTimes: 0, pointSum: 0 },
                message: result.message || '조회에 실패했습니다.',
            };
        }
    } catch (error) {
        console.error('API 요청 오류:', error);
        return {
            success: false,
            data: { verifyTimes: 0, pointSum: 0 },
            message: '네트워크 오류가 발생했습니다.',
        };
    }
}

// 최근 인증 내역 조회
export async function fetchCertificationHistory(memberId) {
    try {
        const response = await fetch(`${BASE_URL}/verification/history`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                memberId: memberId.toString(),
            },
        });

        const result = await response.json();

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
        console.error('API 요청 오류:', error);
        return {
            success: false,
            data: [],
            message: '네트워크 오류가 발생했습니다.',
        };
    }
}
