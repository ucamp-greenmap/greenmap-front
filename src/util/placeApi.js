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
 * 캐시 설정
 */
const CACHE_KEY_PREFIX = 'places_cache_';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30분

/**
 * 위치 기반 캐시 키 생성 (소수점 3자리까지만 사용하여 약 100m 반경 내에서 같은 캐시 사용)
 * @param {number} longitude - 경도
 * @param {number} latitude - 위도
 * @returns {string} 캐시 키
 */
function getCacheKey(longitude, latitude) {
    const roundedLng = longitude.toFixed(3);
    const roundedLat = latitude.toFixed(3);
    return `${CACHE_KEY_PREFIX}${roundedLng}_${roundedLat}`;
}

/**
 * 로컬 스토리지에서 캐시된 장소 데이터 가져오기
 * @param {number} longitude - 경도
 * @param {number} latitude - 위도
 * @returns {Array|null} 캐시된 장소 목록 또는 null
 */
function getCachedPlaces(longitude, latitude) {
    try {
        const cacheKey = getCacheKey(longitude, latitude);
        const cached = localStorage.getItem(cacheKey);

        if (!cached) {
            return null;
        }

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        // 캐시 만료 확인
        if (now - timestamp > CACHE_EXPIRY_MS) {
            localStorage.removeItem(cacheKey);
            return null;
        }

        console.log('캐시된 장소 데이터 사용:', cacheKey);
        return data;
    } catch (error) {
        console.error('캐시 데이터 읽기 오류:', error);
        return null;
    }
}

/**
 * 로컬 스토리지에 장소 데이터 캐시 저장
 * @param {number} longitude - 경도
 * @param {number} latitude - 위도
 * @param {Array} places - 장소 목록
 */
function setCachedPlaces(longitude, latitude, places) {
    try {
        const cacheKey = getCacheKey(longitude, latitude);
        const cacheData = {
            data: places,
            timestamp: Date.now(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log('장소 데이터 캐시 저장:', cacheKey);
    } catch (error) {
        console.error('캐시 데이터 저장 오류:', error);
        // 로컬 스토리지 용량 초과 시 오래된 캐시 삭제
        if (error.name === 'QuotaExceededError') {
            clearOldCaches();
        }
    }
}

/**
 * 오래된 캐시 삭제
 */
function clearOldCaches() {
    try {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter((key) =>
            key.startsWith(CACHE_KEY_PREFIX)
        );

        // 타임스탬프 기준으로 정렬하여 오래된 캐시부터 삭제
        const cacheEntries = cacheKeys
            .map((key) => {
                try {
                    const cached = JSON.parse(localStorage.getItem(key));
                    return { key, timestamp: cached.timestamp || 0 };
                } catch {
                    return { key, timestamp: 0 };
                }
            })
            .sort((a, b) => a.timestamp - b.timestamp);

        // 오래된 캐시 절반 삭제
        const toDelete = Math.ceil(cacheEntries.length / 2);
        for (let i = 0; i < toDelete; i++) {
            localStorage.removeItem(cacheEntries[i].key);
        }
        console.log(`오래된 캐시 ${toDelete}개 삭제 완료`);
    } catch (error) {
        console.error('캐시 삭제 오류:', error);
    }
}

/**
 * 장소 데이터를 가져옵니다. (캐시 우선)
 * @param {number} longitude - 경도
 * @param {number} latitude - 위도
 * @param {boolean} forceRefresh - 캐시 무시하고 강제로 새로 가져오기
 * @returns {Promise<Array>} 장소 목록
 */
export async function getPlaces(longitude, latitude, forceRefresh = false) {
    // 캐시 확인 (강제 새로고침이 아닌 경우)
    if (!forceRefresh) {
        const cachedData = getCachedPlaces(longitude, latitude);
        if (cachedData) {
            return cachedData;
        }
    }

    // API 호출
    try {
        console.log('API에서 새로운 장소 데이터 가져오기');
        const response = await api.get('/place', {
            params: {
                longitude,
                latitude,
            },
        });

        if (response.data.status === 'SUCCESS') {
            const places = response.data.data.places || [];
            // 캐시 저장
            setCachedPlaces(longitude, latitude, places);
            return places;
        } else {
            console.error('장소 데이터 조회 실패:', response.data.message);
            return [];
        }
    } catch (error) {
        console.error('장소 데이터 API 호출 오류:', error);
        // API 호출 실패 시 만료된 캐시라도 반환 시도
        const cacheKey = getCacheKey(longitude, latitude);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const { data } = JSON.parse(cached);
                console.log('API 호출 실패, 만료된 캐시 사용');
                return data;
            } catch {
                return [];
            }
        }
        return [];
    }
}

/**
 * 특정 위치의 캐시 삭제
 * @param {number} longitude - 경도
 * @param {number} latitude - 위도
 */
export function clearPlacesCache(longitude, latitude) {
    const cacheKey = getCacheKey(longitude, latitude);
    localStorage.removeItem(cacheKey);
    console.log('캐시 삭제:', cacheKey);
}

/**
 * 모든 장소 캐시 삭제
 */
export function clearAllPlacesCache() {
    try {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter((key) =>
            key.startsWith(CACHE_KEY_PREFIX)
        );
        cacheKeys.forEach((key) => localStorage.removeItem(key));
        console.log(`모든 장소 캐시 삭제 완료 (${cacheKeys.length}개)`);
    } catch (error) {
        console.error('캐시 삭제 오류:', error);
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
        lat: place.latitude,
        lng: place.longitude,
        imageUrl: place.imageUrl,
        isBookMarked: place.isBookMarked,
        category: categoryIdToFilter[place.categoryId] || 'store',
        categoryId: place.categoryId,
    };
}
