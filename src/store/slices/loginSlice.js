import { createSlice } from '@reduxjs/toolkit';

const loginSlice = createSlice({
    name: 'login',
    initialState: {
        list: [],
    },
    reducers: {
        setRanking: (state, action) => {
            state.list = action.payload;
        },
    },
});

export default loginSlice.reducer;
