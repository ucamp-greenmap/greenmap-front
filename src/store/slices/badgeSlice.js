import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const STATIC_ALL_BADGES = [
    {
        id: 1,
        name: '첫 발자국 (Lv. 0)',
        requiredPoint: 0,
        description: '가입 환영',
        image_url: '/src/assets/lv0.png',
    },
    {
        id: 2,
        name: '새싹 지킴이 (Lv. 1)',
        requiredPoint: 1000,
        description: '누적 포인트 1,000점 달성',
        image_url: '/src/assets/lv1.png',
    },
    {
        id: 3,
        name: '푸른 숲 봉사자 (Lv. 2)',
        requiredPoint: 2000,
        description: '누적 포인트 2,000점 달성',
        image_url: '/src/assets/lv2.png',
    },
    {
        id: 4,
        name: '환경 보호 리더 (Lv. 3)',
        requiredPoint: 5000,
        description: '누적 포인트 5,000점 달성',
        image_url: '/src/assets/lv3.png',
    },
    {
        id: 5,
        name: '그린 마스터 (Lv. 4)',
        requiredPoint: 10000,
        description: '누적 포인트 10,000점 달성',
        image_url: '/src/assets/lv4.png',
    },
];

export const fetchUserBadgeStatus = createAsyncThunk(
    'badge/fetchUserBadgeStatus',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('로그인이 필요합니다');

            // 뱃지 정보 API 호출 (단일 객체 응답 가정)
            const response = await api.get('/badge', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.status !== 'SUCCESS') {
                throw new Error(
                    response.data.message || '뱃지 정보를 가져올 수 없습니다.'
                );
            }
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const badgeSlice = createSlice({
    name: 'badge',
    initialState: {
        allBadges: STATIC_ALL_BADGES,
        currentBadge: {},
        earnedIds: [],
        loading: false,
        error: null,
    },
    reducers: {
        calculateEarnedBadges: (state, action) => {
            const totalPoint = action.payload;

            const newlyEarnedIds = state.allBadges
                .filter((badge) => totalPoint >= badge.requiredPoint)
                .map((badge) => badge.id);

            state.earnedIds = newlyEarnedIds;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserBadgeStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserBadgeStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBadge = action.payload;
            })
            .addCase(fetchUserBadgeStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { calculateEarnedBadges } = badgeSlice.actions;
export default badgeSlice.reducer;
