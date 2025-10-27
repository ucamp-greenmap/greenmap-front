import { createSlice } from '@reduxjs/toolkit';

const challengeSlice = createSlice({
    name: 'challenge',
    initialState: {
        challenges: [],
        completedIds: [],
    },
    reducers: {
        setChallenges: (state, action) => {
            state.challenges = action.payload;
        },
        updateProgress: (state, action) => {
            const { id, progress } = action.payload;
            const challenge = state.challenges.find((c) => c.id === id);
            if (challenge) {
                challenge.progress = progress;
                if (progress >= challenge.total) {
                    challenge.completed = true;
                    if (!state.completedIds.includes(id))
                        state.completedIds.push(id);
                }
            }
        },
    },
});

export const { setChallenges, updateProgress } = challengeSlice.actions;
export default challengeSlice.reducer;
