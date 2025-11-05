import api from '../api/axios';

export async function fetchCarbonData() {
    const token = localStorage.getItem('token');

    try {
        console.log('탄소 데이터 요청...');

        const response = await api.get('/point/carbon', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const result = response.data;

        if (result.status === 'SUCCESS') {
            return {
                success: true,
                data: result.data,
                message: result.message,
            };
        } else {
            return {
                success: false,
                data: null,
                message: result.message || '데이터를 불러오는데 실패했습니다.',
            };
        }
    } catch (error) {
        console.error(
            '❌ API 요청 오류:',
            error.response?.data || error.message
        );

        let message = '네트워크 오류가 발생했습니다.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.response?.status) {
            message = `서버 오류 (${error.response.status})가 발생했습니다.`;
        }

        return {
            success: false,
            data: null,
            message: message,
        };
    }
}
