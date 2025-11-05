import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
export const fetchPointInfo = createAsyncThunk(
    'user/fetchPointInfo',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('로그인이 필요합니다');
            }

            const response = await api.get('/point/info', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = response.data;

            if (result.status !== 'SUCCESS') {
                throw new Error(result.message || '정보를 가져올 수 없습니다');
            }

            return result.data;
        } catch (error) {
            console.error(
                '❌ 포인트 정보 조회 오류:',
                error.response?.data || error.message
            );

            let message = '네트워크 오류가 발생했습니다.';
            if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.message) {
                message = error.message;
            }

            return rejectWithValue(message);
        }
    }
);

export const fetchMyPageData = createAsyncThunk(
    'user/fetchMyPageData',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('로그인이 필요합니다');
            }

            const response = await api.get('/mypage', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = response.data;

            if (result.status !== 'SUCCESS') {
                throw new Error(result.message || '정보를 가져올 수 없습니다');
            }

            return result.data;
        } catch (error) {
            console.error(
                '❌ 마이페이지 조회 오류:',
                error.response?.data || error.message
            );

            let message = '네트워크 오류가 발생했습니다.';
            if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.message) {
                message = error.message;
            }

            return rejectWithValue(message);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        isLoggedIn: false,
        profile: {
            memberId: null,
            name: '',
            email: '',
            avatar: null,
            nickname: '',
        },

        ranking: {
            rank: null,
        },

        stats: {
            point: 0,
            carbonReduction: 0,
        },

        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.isLoggedIn = false;
            state.profile = {
                memberId: null,
                name: '',
                email: '',
                avatar: null,
                nickname: '',
            };
            state.ranking = {
                rank: null,
            };
            state.stats = {
                point: 0,
                carbonReduction: 0,
            };
            localStorage.removeItem('token');
        },

        // 로그인 처리 (토큰 저장)
        login: (state, action) => {
            state.isLoggedIn = true;
            if (action.payload.token) {
                localStorage.setItem('token', action.payload.token);
            }
        },

        // 프로필 업데이트 (MyPageScreen용)
        updateProfile: (state, action) => {
            state.profile = { ...state.profile, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPointInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPointInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;

                state.stats = {
                    point: action.payload.point,
                    carbonReduction: action.payload.carbon_save,
                };
            })
            .addCase(fetchPointInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isLoggedIn = false;
            })

            .addCase(fetchMyPageData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyPageData.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;

                const { member, point, ranking } = action.payload;

                // 프로필 정보 저장
                state.profile = {
                    memberId: member.memberId,
                    name: member.nickname,
                    email: member.email,
                    avatar: member.imageUrl,
                    nickname: member.nickname,
                };

                state.ranking = {
                    rank: ranking.rank,
                };

                state.stats = {
                    point: point.point,
                    carbonReduction: point.carbonSave,
                };
            })
            .addCase(fetchMyPageData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isLoggedIn = false;
            });
    },
});

export const { logout, login, updateProfile } = userSlice.actions;
export default userSlice.reducer;
