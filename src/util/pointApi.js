import api from '../api/axios';

// ============================================
// Type Definitions (JSDoc)
// ============================================

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 요청 성공 여부
 * @property {string} message - 응답 메시지
 * @property {*} data - 응답 데이터
 */

/**
 * @typedef {Object} Voucher
 * @property {number} voucherId - 바우처 ID
 * @property {string} imageUrl - 이미지 URL
 * @property {string} name - 바우처 이름
 * @property {number} price - 가격 (포인트)
 * @property {string} category - 카테고리
 * @property {string} brand - 브랜드
 * @property {boolean} popular - 인기 상품 여부
 */

/**
 * @typedef {Object} UsedPointLog
 * @property {number} logId - 로그 ID
 * @property {string} type - 포인트 타입 (USED, GET 등)
 * @property {number} point - 포인트 양
 * @property {string} createdAt - 생성 날짜
 */

/**
 * @typedef {Object} Ranking
 * @property {number} memberId - 회원 ID
 * @property {string} nickname - 닉네임
 * @property {number} memberPoint - 보유 포인트
 * @property {number} carbonSave - 탄소 절감량
 * @property {string} imageUrl - 프로필 이미지
 * @property {number} rank - 순위
 */

/**
 * @typedef {'VOUCHER' | 'CASH'} PointUsageType
 */

/**
 * @typedef {'All' | 'Used' | 'Get'} PointFilterType
 */

// ============================================
// API Functions
// ============================================

/**
 * 포인트를 사용합니다. (바우처 구매 또는 현금 전환)
 * @param {number} point - VOUCHER: voucher_id, CASH: 실제 포인트 양
 * @param {PointUsageType} type - 사용 유형 (VOUCHER 또는 CASH)
 * @returns {Promise<{memberId: number, point: number}>} 사용 후 남은 포인트 정보
 *
 * @example
 * // 바우처 구매 시 (voucher_id 전달)
 * await spendPoint(12345, 'VOUCHER');
 *
 * // 현금 전환 시 (포인트 양 전달)
 * await spendPoint(5000, 'CASH');
 */
export async function spendPoint(point, type) {
    try {
        const token = localStorage.getItem('token');
        const response = await api.post(
            '/point',
            { point, type },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.data.status === 'SUCCESS') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || '포인트 사용 실패');
        }
    } catch (error) {
        console.error('포인트 사용 오류:', error);
        throw error;
    }
}

/**
 * 사용자의 포인트 정보를 가져옵니다. (탄소 절감량 포함)
 * @returns {Promise<{carbon_save: number, point: number}>} 포인트 정보
 */
export async function getPointInfo() {
    try {
        const token = localStorage.getItem('token');
        const response = await api.get('/point/info', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.data.status === 'SUCCESS') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || '포인트 정보 조회 실패');
        }
    } catch (error) {
        console.error('포인트 정보 조회 오류:', error);
        throw error;
    }
}

/**
 * 포인트샵 데이터를 가져옵니다. (바우처 목록 포함)
 * @returns {Promise<{point: number, voucherList: Voucher[]}>} 상점 정보
 */
export async function getPointShop() {
    try {
        const token = localStorage.getItem('token');
        const response = await api.get('/point/shop', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.data.status === 'SUCCESS') {
            return {
                point: response.data.data.point,
                voucherList: response.data.data.voucherList || [],
            };
        } else {
            console.error('포인트샵 데이터 조회 실패:', response.data.message);
            return {
                point: 0,
                voucherList: [],
            };
        }
    } catch (error) {
        console.error('포인트샵 API 호출 오류:', error);
        return {
            point: 0,
            voucherList: [],
        };
    }
}

/**
 * 포인트 사용 내역을 가져옵니다.
 * @returns {Promise<{memberId: number, usedLogs: UsedPointLog[]}>} 포인트 사용 내역
 */
export async function getUsedPointLogs() {
    try {
        const token = localStorage.getItem('token');

        const response = await api.get('/point/used', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.data.status === 'SUCCESS') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || '사용 내역 조회 실패');
        }
    } catch (error) {
        console.error('포인트 사용 내역 조회 오류:', error);
        throw error;
    }
}

/**
 * 포인트 랭킹을 조회합니다.
 * @returns {Promise<{memberId: number, nickname: string, memberPoint: number, carbonSave: number, imageUrl: string, rank: number, ranks: Ranking[]}>} 랭킹 정보
 */
export async function getPointRanking() {
    try {
        const token = localStorage.getItem('token');
        const response = await api.get('/point/ranking', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.data.status === 'SUCCESS') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || '랭킹 조회 실패');
        }
    } catch (error) {
        console.error('포인트 랭킹 조회 오류:', error);
        throw error;
    }
}

/**
 * 사용자 포인트 상세 내역을 조회합니다. (필터링 가능)
 * @param {PointFilterType} type - 필터 타입 (All, Used, Get)
 * @returns {Promise<{memberId: number, getPoint: number, usedPoint: number, logs: UsedPointLog[]}>} 포인트 상세 정보
 */
export async function getPointDetail(type = 'All') {
    try {
        const token = localStorage.getItem('token');
        const response = await api.get('/point', {
            params: { type },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.data.status === 'SUCCESS') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || '포인트 상세 조회 실패');
        }
    } catch (error) {
        console.error('포인트 상세 조회 오류:', error);
        throw error;
    }
}

/**
 * 탄소 절감 정보를 조회합니다.
 * @returns {Promise<{carbonSave: number, car: number, recycle: number, bike: number, zero: number}>} 탄소 절감 정보
 */
export async function getCarbonInfo() {
    try {
        const token = localStorage.getItem('token');
        const response = await api.get('/point/carbon', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.data.status === 'SUCCESS') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || '탄소 정보 조회 실패');
        }
    } catch (error) {
        console.error('탄소 정보 조회 오류:', error);
        throw error;
    }
}

// ============================================
// Utility Functions
// ============================================

/**
 * API 응답 바우처 데이터를 앱에서 사용하는 형식으로 변환합니다.
 * @param {Voucher} voucher - API 응답 바우처 객체
 * @returns {Object} 변환된 바우처 객체
 */
export function convertVoucherToGifticon(voucher) {
    return {
        id: voucher.voucherId,
        voucherId: voucher.voucherId,
        name: voucher.name,
        brand: voucher.brand,
        category: voucher.category,
        image: voucher.imageUrl,
        imageUrl: voucher.imageUrl,
        price: voucher.price,
        popular: voucher.popular,
    };
}

/**
 * 포인트 타입을 한글로 변환합니다.
 * @param {string} type - 포인트 타입
 * @returns {string} 한글 타입명
 */
export function formatPointType(type) {
    const typeMap = {
        USED: '사용',
        GET: '획득',
        VOUCHER: '바우처 구매',
        CASH: '현금 전환',
    };
    return typeMap[type] || type;
}

/**
 * 날짜를 포맷팅합니다.
 * @param {string} dateString - ISO 날짜 문자열
 * @returns {string} 포맷된 날짜 (YYYY-MM-DD)
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}
