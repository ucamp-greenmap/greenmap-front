import api from '../api/axios';

/**
 * 카테고리 ID 매핑
 */
export const CATEGORY = {
    BIKE: 1,
    ZERO_WASTE: 2,
    EVCAR: 3,
    HCAR: 4,
    RECYCLING_CENTER: 5,
    BOOKMARK: 10,
};

/**
 * 카테고리 ID를 필터 이름으로 변환
 */
export const categoryIdToFilter = {
    1: 'bike',
    2: 'store',
    3: 'ev',
    4: 'hcar',
    5: 'recycle',
};

/**
 * 필터 이름을 카테고리 ID로 변환
 */
export const filterToCategoryId = {
    bike: 1,
    store: 2,
    ev: 3,
    hcar: 4,
    recycle: 5,
};

/**
 * 장소 데이터를 가져옵니다.
 * @param {number} longitude - 경도
 * @param {number} latitude - 위도
 * @returns {Promise<Array>} 장소 목록
 */
export async function getPlaces(longitude, latitude) {
    try {
        const response = await api.get('/place', {
            params: {
                longitude,
                latitude,
            },
        });
        console.log('장소 데이터 응답:', response.data);
        if (response.data.status === 'SUCCESS') {
            return response.data.data.places || [];
        } else {
            console.error('장소 데이터 조회 실패:', response.data.message);
            return [];
        }
    } catch (error) {
        console.error('장소 데이터 API 호출 오류:', error);
        return [];
    }
}

/**
 * API 응답 장소 데이터를 앱에서 사용하는 형식으로 변환합니다.
 * @param {Object} place - API 응답 장소 객체
 * @returns {Object} 변환된 장소 객체
 */
export function convertPlaceToFacility(place) {
    return {
        id: `place-${place.placeId}`,
        placeId: place.placeId,
        name: place.placeName,
        address: place.address,
        distance: place.distance,
        openingHours: place.openingHours,
        telNum: place.telNum,
        lat: place.longitude, // API의 longitude가 실제 위도
        lng: place.latitude, // API의 latitude가 실제 경도
        imageUrl: place.imageUrl,
        isBookMarked: place.isBookMarked,
        category: categoryIdToFilter[place.categoryId] || 'store',
        categoryId: place.categoryId,
    };
}
