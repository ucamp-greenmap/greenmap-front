import { createSlice } from '@reduxjs/toolkit';

const pointSlice = createSlice({
    name: 'point',
    initialState: {
        currentPoints: 1500,
        history: [],
        totalEarned: 3840,
        totalUsed: 2340,
    },
    reducers: {
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
    },
});

export const { addPoints, usePoints } = pointSlice.actions;
export default pointSlice.reducer;
