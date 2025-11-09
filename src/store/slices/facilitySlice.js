import { createSlice } from '@reduxjs/toolkit';

const facilitySlice = createSlice({
    name: 'facility',
    initialState: {
        facilities: [],
        bookmarkedIds: [],
        selectedFacility: null,
        filter: 'all',
    },
    reducers: {
        setFacilities: (state, action) => {
            state.facilities = action.payload;
        },
        toggleBookmark: (state, action) => {
            const id = action.payload;
            const index = state.bookmarkedIds.indexOf(id);
            if (index > -1) {
                state.bookmarkedIds.splice(index, 1);
            } else {
                state.bookmarkedIds.push(id);
            }
        },
        setBookmarkedIds: (state, action) => {
            state.bookmarkedIds = action.payload;
        },
        selectFacility: (state, action) => {
            state.selectedFacility = action.payload;
        },
        setFilter: (state, action) => {
            state.filter = action.payload;
        },
    },
});

export const {
    setFacilities,
    toggleBookmark,
    setBookmarkedIds,
    selectFacility,
    setFilter,
} = facilitySlice.actions;
export default facilitySlice.reducer;
