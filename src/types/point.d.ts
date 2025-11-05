/**
 * Point API 관련 TypeScript 타입 정의
 */

// ============================================
// Common Types
// ============================================

/**
 * API 공통 응답 래퍼
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/**
 * 포인트 사용 유형
 */
export type PointUsageType = 'VOUCHER' | 'CASH';

/**
 * 포인트 필터 타입
 */
export type PointFilterType = 'All' | 'Used' | 'Get';

/**
 * 포인트 로그 타입
 */
export type PointLogType = 'USED' | 'GET' | 'VOUCHER' | 'CASH';

// ============================================
// Request Types
// ============================================

/**
 * 포인트 사용 요청
 */
export interface UsePointRequest {
    point: number;
    type: PointUsageType;
}

// ============================================
// Response Data Types
// ============================================

/**
 * 포인트 사용 후 응답
 */
export interface UsePointResponse {
    memberId: number;
    point: number;
}

/**
 * 포인트 정보 응답
 */
export interface PointInfoResponse {
    carbon_save: number;
    point: number;
}

/**
 * 바우처 정보
 */
export interface Voucher {
    voucherId: number;
    imageUrl: string;
    name: string;
    price: number;
    category: string;
    brand: string;
    popular: boolean;
}

/**
 * 포인트샵 응답
 */
export interface PointShopResponse {
    point: number;
    voucherList: Voucher[];
}

/**
 * 포인트 사용 로그
 */
export interface UsedPointLog {
    logId: number;
    type: PointLogType;
    point: number;
    createdAt: string;
    reason?: string;
}

/**
 * 포인트 사용 내역 응답
 */
export interface UsedPointLogsResponse {
    memberId: number;
    usedLogs: UsedPointLog[];
}

/**
 * 랭킹 정보
 */
export interface Ranking {
    memberId: number;
    nickname: string;
    memberPoint: number;
    carbonSave: number;
    imageUrl: string;
    rank: number;
}

/**
 * 포인트 랭킹 응답
 */
export interface PointRankingResponse {
    memberId: number;
    nickname: string;
    memberPoint: number;
    carbonSave: number;
    imageUrl: string;
    rank: number;
    ranks: Ranking[];
}

/**
 * 포인트 상세 정보 응답
 */
export interface PointDetailResponse {
    memberId: number;
    getPoint: number;
    usedPoint: number;
    logs: UsedPointLog[];
}

/**
 * 탄소 절감 정보 응답
 */
export interface CarbonInfoResponse {
    carbonSave: number;
    car: number;
    recycle: number;
    bike: number;
    zero: number;
}

// ============================================
// Frontend Display Types
// ============================================

/**
 * 기프티콘 표시용 데이터 (변환된 바우처)
 */
export interface Gifticon {
    id: number;
    voucherId: number;
    name: string;
    brand: string;
    category: string;
    image: string;
    imageUrl: string;
    price: number;
    popular: boolean;
}
