import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
    name: 'app',
    initialState: {
        appState: 'splash', // 'splash' | 'onboarding' | 'main'
        activeTab: 'home',
        isOnline: true,
        lastSyncTime: null,
    },
    reducers: {
        setAppState: (state, action) => {
            state.appState = action.payload;
        },
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        setOnlineStatus: (state, action) => {
            state.isOnline = action.payload;
        },
        updateSyncTime: (state) => {
            state.lastSyncTime = new Date().toISOString();
        },
    },
});

export const { setAppState, setActiveTab, setOnlineStatus, updateSyncTime } =
    appSlice.actions;
export default appSlice.reducer;
