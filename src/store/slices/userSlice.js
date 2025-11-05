import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchPointInfo = createAsyncThunk(
    'user/fetchPointInfo',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('로그인이 필요합니다');

            const response = await api.get('/point/info', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.message || '포인트 정보를 가져올 수 없습니다');
        }
    }
);

export const fetchMyPageData = createAsyncThunk(
    'user/fetchMyPageData',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('로그인이 필요합니다');

            const response = await api.get('/mypage', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.message || '회원 정보를 가져올 수 없습니다');
        }
    }
);

export const fetchMyBadgeData = createAsyncThunk(
  'user/fetchMyBadgeData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('로그인이 필요합니다');

      const response = await api.get('/badge', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || '뱃지 정보를 가져올 수 없습니다');
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
        badges: {},
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.isLoggedIn = false;
            state.profile = {
                memberId: null,
                name: '그린 발자국',
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
            state.badges = {};
            localStorage.removeItem('token');
        },

        login: (state, action) => {
            state.isLoggedIn = true;
            if (action.payload.token) {
                localStorage.setItem('token', action.payload.token);
            }
        },

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
            })
            .addCase(fetchMyBadgeData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyBadgeData.fulfilled, (state, action) => {
                state.loading = false;
                state.badges = action.payload;
            })
            .addCase(fetchMyBadgeData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, login, updateProfile } = userSlice.actions;
export default userSlice.reducer;
