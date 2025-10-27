import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import appReducer from './slices/appSlice';
import userReducer from './slices/userSlice';
import pointReducer from './slices/pointSlice';
import facilityReducer from './slices/facilitySlice';
import certReducer from './slices/certSlice';
import challengeReducer from './slices/challengeSlice';
import rankingReducer from './slices/rankingSlice';
import badgeReducer from './slices/badgeSlice';

const persistConfig = {
    key: 'greenmap',
    storage,
    whitelist: ['user', 'point', 'facility', 'cert', 'challenge', 'badge'],
};

export const store = configureStore({
    reducer: {
        app: appReducer,
        user: persistReducer(persistConfig, userReducer),
        point: persistReducer(persistConfig, pointReducer),
        facility: persistReducer(persistConfig, facilityReducer),
        cert: persistReducer(persistConfig, certReducer),
        challenge: persistReducer(persistConfig, challengeReducer),
        ranking: rankingReducer,
        badge: persistReducer(persistConfig, badgeReducer),
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export const persistor = persistStore(store);

export default store;
