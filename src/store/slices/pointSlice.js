import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    spendPoint,
    getPointInfo,
    getPointShop,
    getUsedPointLogs,
    getPointRanking,
    getPointDetail,
    getCarbonInfo,
} from '../../util/pointApi';

// ============================================
// Async Thunks (API 호출)
// ============================================

/**
 * 포인트 정보 조회
 */
export const fetchPointInfo = createAsyncThunk(
    'point/fetchPointInfo',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getPointInfo();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/**
 * 포인트샵 데이터 조회
 */
export const fetchPointShop = createAsyncThunk(
    'point/fetchPointShop',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getPointShop();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/**
 * 포인트 사용 내역 조회
 */
export const fetchUsedPointLogs = createAsyncThunk(
    'point/fetchUsedPointLogs',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getUsedPointLogs();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/**
 * 포인트 랭킹 조회
 */
export const fetchPointRanking = createAsyncThunk(
    'point/fetchPointRanking',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getPointRanking();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/**
 * 포인트 상세 정보 조회
 */
export const fetchPointDetail = createAsyncThunk(
    'point/fetchPointDetail',
    async (type = 'All', { rejectWithValue }) => {
        try {
            const data = await getPointDetail(type);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/**
 * 탄소 절감 정보 조회
 */
export const fetchCarbonInfo = createAsyncThunk(
    'point/fetchCarbonInfo',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getCarbonInfo();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/**
 * 포인트 사용 (바우처 구매 또는 현금 전환)
 */
export const spendPointAsync = createAsyncThunk(
    'point/spendPoint',
    async ({ point, type }, { rejectWithValue, dispatch }) => {
        try {
            const data = await spendPoint(point, type);
            // 포인트 사용 후 관련 데이터 갱신
            dispatch(fetchPointInfo());
            dispatch(fetchPointShop());
            dispatch(fetchUsedPointLogs());
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ============================================
// Slice
// ============================================

const pointSlice = createSlice({
    name: 'point',
    initialState: {
        // 포인트 정보
        currentPoints: 0,
        carbonSave: 0,

        // 포인트샵 데이터
        voucherList: [],

        // 포인트 내역
        usedLogs: [],
        logs: [],
        getPoint: 0,
        usedPoint: 0,

        // 랭킹 정보
        ranking: null,
        myRank: 0,
        ranks: [],

        // 탄소 정보
        carbonDetail: null,

        // 로딩 상태
        loading: {
            info: false,
            shop: false,
            logs: false,
            ranking: false,
            detail: false,
            carbon: false,
            spend: false,
        },

        // 에러 상태
        error: {
            info: null,
            shop: null,
            logs: null,
            ranking: null,
            detail: null,
            carbon: null,
            spend: null,
        },

        // 마지막 업데이트 시간
        lastUpdated: {
            info: null,
            shop: null,
            logs: null,
            ranking: null,
            detail: null,
            carbon: null,
        },

        // 레거시 (호환성 유지)
        history: [],
        totalEarned: 0,
        totalUsed: 0,
    },
    reducers: {
        // 로컬 포인트 추가 (레거시)
        addPoints: (state, action) => {
            const { points, type, category } = action.payload;
            state.currentPoints += points;
            state.totalEarned += points;
            state.history.unshift({
                id: Date.now(),
                type,
                date: new Date().toISOString(),
                points,
                action: 'earn',
                category,
            });
        },

        // 로컬 포인트 사용 (레거시)
        usePoints: (state, action) => {
            const { points, type, category } = action.payload;
            state.currentPoints -= points;
            state.totalUsed += points;
            state.history.unshift({
                id: Date.now(),
                type,
                date: new Date().toISOString(),
                points: -points,
                action: 'use',
                category,
            });
        },

        // 에러 초기화
        clearError: (state, action) => {
            const errorType = action.payload;
            if (errorType) {
                state.error[errorType] = null;
            } else {
                state.error = {
                    info: null,
                    shop: null,
                    logs: null,
                    ranking: null,
                    detail: null,
                    carbon: null,
                    spend: null,
                };
            }
        },

        // 모든 포인트 데이터 초기화
        resetPointData: (state) => {
            state.currentPoints = 0;
            state.carbonSave = 0;
            state.voucherList = [];
            state.usedLogs = [];
            state.logs = [];
            state.ranking = null;
            state.carbonDetail = null;
        },
    },
    extraReducers: (builder) => {
        // ============================================
        // fetchPointInfo
        // ============================================
        builder
            .addCase(fetchPointInfo.pending, (state) => {
                state.loading.info = true;
                state.error.info = null;
            })
            .addCase(fetchPointInfo.fulfilled, (state, action) => {
                state.loading.info = false;
                state.currentPoints = action.payload.point;
                state.carbonSave = action.payload.carbon_save;
                state.lastUpdated.info = new Date().toISOString();
            })
            .addCase(fetchPointInfo.rejected, (state, action) => {
                state.loading.info = false;
                state.error.info = action.payload;
            });

        // ============================================
        // fetchPointShop
        // ============================================
        builder
            .addCase(fetchPointShop.pending, (state) => {
                state.loading.shop = true;
                state.error.shop = null;
            })
            .addCase(fetchPointShop.fulfilled, (state, action) => {
                state.loading.shop = false;
                state.currentPoints = action.payload.point;
                state.voucherList = action.payload.voucherList;
                state.lastUpdated.shop = new Date().toISOString();
            })
            .addCase(fetchPointShop.rejected, (state, action) => {
                state.loading.shop = false;
                state.error.shop = action.payload;
            });

        // ============================================
        // fetchUsedPointLogs
        // ============================================
        builder
            .addCase(fetchUsedPointLogs.pending, (state) => {
                state.loading.logs = true;
                state.error.logs = null;
            })
            .addCase(fetchUsedPointLogs.fulfilled, (state, action) => {
                state.loading.logs = false;
                state.usedLogs = action.payload.usedLogs;
                state.lastUpdated.logs = new Date().toISOString();
            })
            .addCase(fetchUsedPointLogs.rejected, (state, action) => {
                state.loading.logs = false;
                state.error.logs = action.payload;
            });

        // ============================================
        // fetchPointRanking
        // ============================================
        builder
            .addCase(fetchPointRanking.pending, (state) => {
                state.loading.ranking = true;
                state.error.ranking = null;
            })
            .addCase(fetchPointRanking.fulfilled, (state, action) => {
                state.loading.ranking = false;
                state.ranking = action.payload;
                state.myRank = action.payload.rank;
                state.ranks = action.payload.ranks;
                state.lastUpdated.ranking = new Date().toISOString();
            })
            .addCase(fetchPointRanking.rejected, (state, action) => {
                state.loading.ranking = false;
                state.error.ranking = action.payload;
            });

        // ============================================
        // fetchPointDetail
        // ============================================
        builder
            .addCase(fetchPointDetail.pending, (state) => {
                console.log('⏳ [Redux] fetchPointDetail.pending');
                state.loading.detail = true;
                state.error.detail = null;
            })
            .addCase(fetchPointDetail.fulfilled, (state, action) => {
                console.log(
                    '✅ [Redux] fetchPointDetail.fulfilled - Payload:',
                    action.payload
                );
                state.loading.detail = false;
                state.getPoint = action.payload.getPoint;
                state.usedPoint = action.payload.usedPoint;
                state.logs = action.payload.logs;
                state.lastUpdated.detail = new Date().toISOString();
                console.log('📦 [Redux] Updated state:', {
                    getPoint: state.getPoint,
                    usedPoint: state.usedPoint,
                    logsCount: state.logs?.length,
                });
            })
            .addCase(fetchPointDetail.rejected, (state, action) => {
                console.error(
                    '❌ [Redux] fetchPointDetail.rejected - Error:',
                    action.payload
                );
                state.loading.detail = false;
                state.error.detail = action.payload;
            });

        // ============================================
        // fetchCarbonInfo
        // ============================================
        builder
            .addCase(fetchCarbonInfo.pending, (state) => {
                state.loading.carbon = true;
                state.error.carbon = null;
            })
            .addCase(fetchCarbonInfo.fulfilled, (state, action) => {
                state.loading.carbon = false;
                state.carbonDetail = action.payload;
                state.lastUpdated.carbon = new Date().toISOString();
            })
            .addCase(fetchCarbonInfo.rejected, (state, action) => {
                state.loading.carbon = false;
                state.error.carbon = action.payload;
            });

        // ============================================
        // spendPointAsync
        // ============================================
        builder
            .addCase(spendPointAsync.pending, (state) => {
                state.loading.spend = true;
                state.error.spend = null;
            })
            .addCase(spendPointAsync.fulfilled, (state, action) => {
                state.loading.spend = false;
                state.currentPoints = action.payload.point;
            })
            .addCase(spendPointAsync.rejected, (state, action) => {
                state.loading.spend = false;
                state.error.spend = action.payload;
            });
    },
});

export const { addPoints, usePoints, clearError, resetPointData } =
    pointSlice.actions;
export default pointSlice.reducer;
