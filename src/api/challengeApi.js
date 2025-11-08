import api from './axios';

/**
 * 참여 가능한 챌린지 목록을 조회합니다.
 * @returns {Promise<Array>} 참여 가능한 챌린지 배열
 */
export async function getAvailableChallenges() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('로그인이 필요합니다.');
        }

        const response = await api.get('/chal/available', {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === 'SUCCESS') {
            return response.data.data.availableChallenges || [];
        } else {
            throw new Error(
                response.data.message || '참여 가능한 챌린지를 가져올 수 없습니다.'
            );
        }
    } catch (error) {
        console.error('참여 가능한 챌린지 조회 실패', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('참여 가능한 챌린지 정보를 불러오는데 실패했습니다.');
    }
}

/**
 * 참여중인 챌린지 목록을 조회합니다.
 * @returns {Promise<Array>} 참여중인 챌린지 배열
 */
export async function getAttendingChallenges() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('로그인이 필요합니다.');
        }

        const response = await api.get('/chal/attend', {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === 'SUCCESS') {
            return response.data.data.challenges || [];
        } else {
            throw new Error(
                response.data.message || '참여중인 챌린지를 가져올 수 없습니다.'
            );
        }
    } catch (error) {
        console.error('참여중인 챌린지 조회 실패', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('참여중인 챌린지 정보를 불러오는데 실패했습니다.');
    }
}

/**
 * 완료한 챌린지 목록을 조회합니다.
 * @returns {Promise<Array>} 완료한 챌린지 배열
 */
export async function getCompletedChallenges() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('로그인이 필요합니다.');
        }

        const response = await api.get('/chal/end', {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === 'SUCCESS') {
            return response.data.data.challenges || [];
        } else {
            throw new Error(
                response.data.message || '완료한 챌린지를 가져올 수 없습니다.'
            );
        }
    } catch (error) {
        console.error('완료한 챌린지 조회 실패', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('완료한 챌린지 정보를 불러오는데 실패했습니다.');
    }
}

/**
 * 모든 챌린지 목록을 조회합니다 (참여 가능, 참여중, 완료).
 * @returns {Promise<Object>} { available, attend, end } 객체
 */
export async function getAllChallenges() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                available: [],
                attend: [],
                end: [],
            };
        }

        const [attendRes, availableRes, endRes] = await Promise.all([
            getAttendingChallenges(),
            getAvailableChallenges(),
            getCompletedChallenges(),
        ]);

        return {
            available: availableRes,
            attend: attendRes,
            end: endRes,
        };
    } catch (error) {
        console.error('챌린지 목록 조회 실패', error);
        throw error;
    }
}

/**
 * 챌린지에 참여합니다.
 * @param {number} challengeId - 참여할 챌린지 ID
 * @returns {Promise<Object>} 참여 결과
 */
export async function participateChallenge(challengeId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('로그인이 필요합니다.');
        }

        const response = await api.post(
            '/chal',
            { challengeId },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status === 'SUCCESS') {
            return response.data.data;
        } else {
            throw new Error(
                response.data.message || '챌린지 참여에 실패했습니다.'
            );
        }
    } catch (error) {
        console.error('챌린지 참여 실패', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('챌린지 참여에 실패했습니다.');
    }
}

/**
 * 챌린지를 등록합니다 (관리자용).
 * @param {Object} challengeData - 챌린지 데이터
 * @param {string} challengeData.updatedAt - 만료 기한 (ISO 8601)
 * @param {string} challengeData.challengeName - 챌린지명
 * @param {string} challengeData.description - 설명
 * @param {number} challengeData.success - 목표치
 * @param {number} challengeData.pointAmount - 보상 포인트
 * @param {number} challengeData.deadline - 기간 (일수)
 * @returns {Promise<Object>} 등록 결과
 */
export async function createChallenge(challengeData) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('로그인이 필요합니다.');
        }

        const response = await api.post('/chalregis', challengeData, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === 'SUCCESS') {
            return response.data.data;
        } else {
            throw new Error(
                response.data.message || '챌린지 등록에 실패했습니다.'
            );
        }
    } catch (error) {
        console.error('챌린지 등록 실패', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('챌린지 등록에 실패했습니다.');
    }
}

/**
 * 챌린지 진행률을 업데이트합니다.
 * @param {number} memberChallengeId - 멤버 챌린지 ID
 * @param {number} times - 증가시킬 진행률 값
 * @returns {Promise<Object>} 업데이트 결과
 */
export async function updateChallengeProgress(memberChallengeId, times) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('로그인이 필요합니다.');
        }

        const response = await api.put(
            '/chal',
            { memberChallengeId, times },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status === 'SUCCESS') {
            return response.data.data;
        } else {
            throw new Error(
                response.data.message || '진행률 업데이트에 실패했습니다.'
            );
        }
    } catch (error) {
        console.error('진행률 업데이트 실패', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('진행률 업데이트에 실패했습니다.');
    }
}

