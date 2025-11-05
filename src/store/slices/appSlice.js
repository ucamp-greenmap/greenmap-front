import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
    name: 'app',
    initialState: {
        appState: 'splash', // 'splash' | 'onboarding' | 'main'
        activeTab: 'home',
        isOnline: true,
        lastSyncTime: null,
        onboardingCompleted:
            sessionStorage.getItem('onboardingCompleted') === 'true',
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
        completeOnboarding: (state) => {
            state.onboardingCompleted = true;
            state.appState = 'main';
            sessionStorage.setItem('onboardingCompleted', 'true');
        },
    },
});

export const {
    setAppState,
    setActiveTab,
    setOnlineStatus,
    updateSyncTime,
    completeOnboarding,
} = appSlice.actions;

export default appSlice.reducer;
