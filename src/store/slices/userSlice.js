import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        profile: {
            name: '그린 사용자',
            email: 'green.user@email.com',
            avatar: null,
            level: 1,
            badge: '🌱 첫걸음',
        },
        stats: {
            totalCerts: 24,
            carbonReduction: 42.5,
            rank: 345,
        },
    },
    reducers: {
        updateProfile: (state, action) => {
            state.profile = { ...state.profile, ...action.payload };
        },
        updateStats: (state, action) => {
            state.stats = { ...state.stats, ...action.payload };
        },
    },
});

export const { updateProfile, updateStats } = userSlice.actions;
export default userSlice.reducer;
