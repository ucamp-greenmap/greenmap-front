import { createSlice } from '@reduxjs/toolkit';

const certSlice = createSlice({
    name: 'cert',
    initialState: {
        certifications: [],
        pendingCerts: [],
    },
    reducers: {
        addCertification: (state, action) => {
            state.certifications.unshift(action.payload);
        },
        addPendingCert: (state, action) => {
            state.pendingCerts.push(action.payload);
        },
        syncPendingCerts: (state) => {
            state.certifications.unshift(...state.pendingCerts);
            state.pendingCerts = [];
        },
    },
});

export const { addCertification, addPendingCert, syncPendingCerts } =
    certSlice.actions;
export default certSlice.reducer;
