// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../../api/axios';
// export const fetchPointInfo = createAsyncThunk(
//     'user/fetchPointInfo',
//     async (_, { rejectWithValue }) => {
//         try {
//             const token = localStorage.getItem('token');

//             if (!token) {
//                 throw new Error('로그인이 필요합니다');
//             }

//             const response = await api.get('/point/info', {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             const result = response.data;

//             if (result.status !== 'SUCCESS') {
//                 throw new Error(result.message || '정보를 가져올 수 없습니다');
//             }

//             return result.data;
//         } catch (error) {
//             console.error(
//                 '❌ 포인트 정보 조회 오류:',
//                 error.response?.data || error.message
//             );

//             let message = '네트워크 오류가 발생했습니다.';
//             if (error.response?.data?.message) {
//                 message = error.response.data.message;
//             } else if (error.message) {
//                 message = error.message;
//             }

//             return rejectWithValue(message);
//         }
//     }
// );

// export const fetchMyPageData = createAsyncThunk(
//     'user/fetchMyPageData',
//     async (_, { rejectWithValue }) => {
//         try {
//             const token = localStorage.getItem('token');

//             if (!token) {
//                 throw new Error('로그인이 필요합니다');
//             }

//             const response = await api.get('/mypage', {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             const result = response.data;

//             if (result.status !== 'SUCCESS') {
//                 throw new Error(result.message || '정보를 가져올 수 없습니다');
//             }

//             return result.data;
//         } catch (error) {
//             console.error(
//                 '❌ 마이페이지 조회 오류:',
//                 error.response?.data || error.message
//             );

//             let message = '네트워크 오류가 발생했습니다.';
//             if (error.response?.data?.message) {
//                 message = error.response.data.message;
//             } else if (error.message) {
//                 message = error.message;
//             }

//             return rejectWithValue(message);
//         }
//     }
// );

// const userSlice = createSlice({
//     name: 'user',
//     initialState: {
//         isLoggedIn: false,
//         profile: {
//             memberId: null,
//             name: '',
//             email: '',
//             avatar: null,
//             nickname: '',
//         },

//         ranking: {
//             rank: null,
//         },

//         stats: {
//             point: 0,
//             carbonReduction: 0,
//         },

//         loading: false,
//         error: null,
//     },
//     reducers: {
//         logout: (state) => {
//             state.isLoggedIn = false;
//             state.profile = {
//                 memberId: null,
//                 name: '',
//                 email: '',
//                 avatar: null,
//                 nickname: '',
//             };
//             state.ranking = {
//                 rank: null,
//             };
//             state.stats = {
//                 point: 0,
//                 carbonReduction: 0,
//             };
//             localStorage.removeItem('token');
//         },

//         // 로그인 처리 (토큰 저장)
//         login: (state, action) => {
//             state.isLoggedIn = true;
//             if (action.payload.token) {
//                 localStorage.setItem('token', action.payload.token);
//             }
//         },

//         // 프로필 업데이트 (MyPageScreen용)
//         updateProfile: (state, action) => {
//             state.profile = { ...state.profile, ...action.payload };
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchPointInfo.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchPointInfo.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.isLoggedIn = true;

//                 state.stats = {
//                     point: action.payload.point,
//                     carbonReduction: action.payload.carbon_save,
//                 };
//             })
//             .addCase(fetchPointInfo.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//                 state.isLoggedIn = false;
//             })

//             .addCase(fetchMyPageData.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchMyPageData.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.isLoggedIn = true;

//                 const { member, point, ranking } = action.payload;

//                 // 프로필 정보 저장
//                 state.profile = {
//                     memberId: member.memberId,
//                     name: member.nickname,
//                     email: member.email,
//                     avatar: member.imageUrl,
//                     nickname: member.nickname,
//                 };

//                 state.ranking = {
//                     rank: ranking.rank,
//                 };

//                 state.stats = {
//                     point: point.point,
//                     carbonReduction: point.carbonSave,
//                 };
//             })
//             .addCase(fetchMyPageData.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//                 state.isLoggedIn = false;
//             });
//     },
// });

// export const { logout, login, updateProfile } = userSlice.actions;
// export default userSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMyPageData } from '../../api/userApi';
import { getPointInfo } from '../../util/pointApi';

export const fetchPointInfo = createAsyncThunk(
    'user/fetchPointInfo',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getPointInfo();
            return data;
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
            const data = await getMyPageData();
            return data;
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
    },
    {
        // 이미 진행 중인 요청이 있으면 새로운 요청을 스킵
        condition: (_, { getState }) => {
            const state = getState();
            const { loading } = state.user;
            // 이미 로딩 중이면 새로운 요청을 스킵
            if (loading) {
                return false;
            }
            return true;
        },
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
            totalPoint: 0,
            carbonReduction: 0,
        },

        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            // 로그아웃 전 memberId 저장 (sessionStorage 정리용)
            const currentMemberId = state.profile?.memberId;

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
                totalPoint: 0,
                carbonReduction: 0,
            };
            state.loading = false;
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('memberId');

            // 뉴스 상태 sessionStorage 정리 (모든 사용자 데이터 삭제)
            try {
                // 현재 사용자의 뉴스 상태 삭제
                if (currentMemberId) {
                    sessionStorage.removeItem(
                        `ecoNewsState_${currentMemberId}`
                    );
                }
                // 게스트 데이터도 삭제
                sessionStorage.removeItem('ecoNewsState_guest');

                // 혹시 남아있을 수 있는 다른 사용자 데이터도 정리
                // (모든 ecoNewsState_로 시작하는 키 삭제)
                const keysToRemove = [];
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key && key.startsWith('ecoNewsState_')) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach((key) => sessionStorage.removeItem(key));
            } catch (e) {
                console.error('뉴스 상태 정리 실패:', e);
            }
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
                    totalPoint: action.payload.totalPoint || 0,
                    carbonReduction: action.payload.carbon_save,
                };

                if (action.payload.member) {
                    const member = action.payload.member;
                    state.profile = {
                        memberId: member.memberId,
                        name: member.nickname,
                        email: member.email,
                        avatar: member.image?.imageUrl || null,
                        nickname: member.nickname,
                    };
                }
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
                    totalPoint: point.totalPoint || 0,
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
