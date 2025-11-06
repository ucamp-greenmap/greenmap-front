/**
 * Point API Redux 커스텀 훅
 *
 * Redux를 사용하여 포인트 관련 데이터를 관리합니다.
 * Redux Toolkit의 createAsyncThunk를 사용하여 API 호출을 처리합니다.
 *
 * 사용 예시:
 * ```jsx
 * const dispatch = useDispatch();
 * const { currentPoints, loading } = usePointState();
 *
 * // 데이터 가져오기
 * dispatch(fetchPointShop());
 *
 * // 포인트 사용
 * dispatch(spendPointAsync({ point: 5000, type: 'VOUCHER' }));
 * ```
 */

import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import {
    fetchPointInfo,
    fetchPointShop,
    fetchUsedPointLogs,
    fetchPointRanking,
    fetchPointDetail,
    fetchCarbonInfo,
    spendPointAsync,
    clearError,
    resetPointData,
} from '../store/slices/pointSlice';

// ============================================
// Selector Hooks
// ============================================

/**
 * 포인트 상태 전체를 가져오는 훅
 * @returns {Object} 포인트 상태
 */
export function usePointState() {
    return useSelector((state) => state.point);
}

/**
 * 포인트 정보를 가져오는 훅 (탄소 절감량 포함)
 * @param {boolean} autoFetch - 자동으로 데이터를 가져올지 여부
 * @returns {Object} { point, carbonSave, loading, error }
 */
export function usePointInfo(autoFetch = false) {
    const dispatch = useDispatch();
    const { currentPoints, carbonSave, loading, error, lastUpdated } =
        useSelector((state) => state.point);

    useEffect(() => {
        if (autoFetch) {
            dispatch(fetchPointInfo());
        }
    }, [autoFetch, dispatch]);

    return {
        point: currentPoints,
        carbon_save: carbonSave,
        loading: loading.info,
        error: error.info,
        lastUpdated: lastUpdated.info,
        refetch: () => dispatch(fetchPointInfo()),
    };
}

/**
 * 포인트샵 데이터를 가져오는 훅 (바우처 목록 포함)
 * @param {boolean} autoFetch - 자동으로 데이터를 가져올지 여부
 * @returns {Object} { point, voucherList, loading, error }
 */
export function usePointShop(autoFetch = false) {
    const dispatch = useDispatch();
    const { currentPoints, voucherList, loading, error, lastUpdated } =
        useSelector((state) => state.point);

    useEffect(() => {
        if (autoFetch) {
            dispatch(fetchPointShop());
        }
    }, [autoFetch, dispatch]);

    return {
        data: {
            point: currentPoints,
            voucherList,
        },
        loading: loading.shop,
        error: error.shop,
        lastUpdated: lastUpdated.shop,
        refetch: () => dispatch(fetchPointShop()),
    };
}

/**
 * 포인트 사용 내역을 가져오는 훅
 * @param {boolean} autoFetch - 자동으로 데이터를 가져올지 여부
 * @returns {Object} { usedLogs, loading, error }
 */
export function useUsedPointLogs(autoFetch = false) {
    const dispatch = useDispatch();
    const { usedLogs, loading, error, lastUpdated } = useSelector(
        (state) => state.point
    );

    useEffect(() => {
        if (autoFetch) {
            dispatch(fetchUsedPointLogs());
        }
    }, [autoFetch, dispatch]);

    return {
        usedLogs,
        loading: loading.logs,
        error: error.logs,
        lastUpdated: lastUpdated.logs,
        refetch: () => dispatch(fetchUsedPointLogs()),
    };
}

/**
 * 포인트 랭킹을 가져오는 훅
 * @param {boolean} autoFetch - 자동으로 데이터를 가져올지 여부
 * @returns {Object} { ranking, myRank, ranks, loading, error }
 */
export function usePointRanking(autoFetch = false) {
    const dispatch = useDispatch();
    const { ranking, myRank, ranks, loading, error, lastUpdated } = useSelector(
        (state) => state.point
    );

    useEffect(() => {
        if (autoFetch) {
            dispatch(fetchPointRanking());
        }
    }, [autoFetch, dispatch]);

    return {
        data: ranking,
        myRank,
        ranks,
        loading: loading.ranking,
        error: error.ranking,
        lastUpdated: lastUpdated.ranking,
        refetch: () => dispatch(fetchPointRanking()),
    };
}

/**
 * 포인트 상세 정보를 가져오는 훅 (필터링 가능)
 * @param {string} type - 필터 타입 (All, Used, Get)
 * @param {boolean} autoFetch - 자동으로 데이터를 가져올지 여부
 * @returns {Object} { getPoint, usedPoint, logs, loading, error }
 */
export function usePointDetail(type = 'All', autoFetch = false) {
    const dispatch = useDispatch();
    const { getPoint, usedPoint, logs, loading, error, lastUpdated } =
        useSelector((state) => state.point);

    useEffect(() => {
        if (autoFetch) {
            dispatch(fetchPointDetail(type));
        }
    }, [autoFetch, type, dispatch]);

    return {
        data: {
            getPoint,
            usedPoint,
            logs,
        },
        loading: loading.detail,
        error: error.detail,
        lastUpdated: lastUpdated.detail,
        refetch: () => dispatch(fetchPointDetail(type)),
    };
}

/**
 * 탄소 절감 정보를 가져오는 훅
 * @param {boolean} autoFetch - 자동으로 데이터를 가져올지 여부
 * @returns {Object} { carbonSave, car, recycle, bike, zero, loading, error }
 */
export function useCarbonInfo(autoFetch = false) {
    const dispatch = useDispatch();
    const { carbonDetail, loading, error, lastUpdated } = useSelector(
        (state) => state.point
    );

    useEffect(() => {
        if (autoFetch) {
            dispatch(fetchCarbonInfo());
        }
    }, [autoFetch, dispatch]);

    return {
        data: carbonDetail,
        loading: loading.carbon,
        error: error.carbon,
        lastUpdated: lastUpdated.carbon,
        refetch: () => dispatch(fetchCarbonInfo()),
    };
}

/**
 * 포인트 사용 훅
 * @returns {Object} { spendPoint, loading, error }
 */
export function useSpendPoint() {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.point);

    const spendPoint = async ({ point, type }) => {
        return dispatch(spendPointAsync({ point, type })).unwrap();
    };

    return {
        spendPoint,
        loading: loading.spend,
        error: error.spend,
    };
}

// ============================================
// Utility Hooks
// ============================================

/**
 * 포인트 관련 모든 데이터를 갱신하는 훅
 * @returns {Function} 갱신 함수
 *
 * @example
 * const refreshAllPointData = useRefreshPointData();
 *
 * // 버튼 클릭 시 모든 포인트 데이터 새로고침
 * <button onClick={refreshAllPointData}>새로고침</button>
 */
export function useRefreshPointData() {
    const dispatch = useDispatch();

    return () => {
        dispatch(fetchPointInfo());
        dispatch(fetchPointShop());
        dispatch(fetchUsedPointLogs());
        dispatch(fetchPointRanking());
    };
}

/**
 * 현재 사용자의 포인트 잔액만 빠르게 가져오는 훅
 * @returns {number} 현재 포인트 잔액
 *
 * @example
 * const currentPoints = useCurrentPoints();
 * console.log('현재 포인트:', currentPoints);
 */
export function useCurrentPoints() {
    const { currentPoints } = useSelector((state) => state.point);
    return currentPoints;
}

/**
 * 에러를 초기화하는 훅
 * @returns {Function} 에러 초기화 함수
 */
export function useClearError() {
    const dispatch = useDispatch();
    return (errorType) => dispatch(clearError(errorType));
}

/**
 * 포인트 데이터를 초기화하는 훅
 * @returns {Function} 초기화 함수
 */
export function useResetPointData() {
    const dispatch = useDispatch();
    return () => dispatch(resetPointData());
}

// ============================================
// Action Export (직접 dispatch용)
// ============================================

export {
    fetchPointInfo,
    fetchPointShop,
    fetchUsedPointLogs,
    fetchPointRanking,
    fetchPointDetail,
    fetchCarbonInfo,
    spendPointAsync,
};
