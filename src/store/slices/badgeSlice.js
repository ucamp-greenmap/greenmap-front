import { createSlice } from '@reduxjs/toolkit';

const badgeSlice = createSlice({
    name: 'badge',
    initialState: {
        badges: [],
        earnedIds: [],
    },
    reducers: {
        setBadges: (state, action) => {
            state.badges = action.payload;
        },
        earnBadge: (state, action) => {
            const { id, earnedDate } = action.payload;
            const badge = state.badges.find((b) => b.id === id);
            if (badge) {
                badge.earned = true;
                badge.earnedDate = earnedDate;
                if (!state.earnedIds.includes(id)) state.earnedIds.push(id);
            }
        },
    },
});

export const { setBadges, earnBadge } = badgeSlice.actions;
export default badgeSlice.reducer;
