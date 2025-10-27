import { createSlice } from '@reduxjs/toolkit';

const rankingSlice = createSlice({
    name: 'ranking',
    initialState: {
        list: [],
    },
    reducers: {
        setRanking: (state, action) => {
            state.list = action.payload;
        },
    },
});

export const { setRanking } = rankingSlice.actions;
export default rankingSlice.reducer;
