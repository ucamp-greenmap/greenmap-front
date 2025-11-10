import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    toggleBookmark as toggleBookmarkAction,
    setBookmarkedIds,
} from '../../store/slices/facilitySlice';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import { useMarkers } from '../../hooks/useMarkers';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import {
    createCurrentLocationOverlay,
    calculateDistancesForFacilities,
} from '../../util/location';
import { getPlaces, convertPlaceToFacility } from '../../util/placeApi';
import { toggleBookmark, getMyBookmarks } from '../../api/userApi';
import FilterBar from '../map/FilterBar';
import CurrentLocationButton from '../map/CurrentLocationButton';
import BottomSheet from '../map/BottomSheet';
import FacilityList from '../map/FacilityList';
import FacilityDetail from '../map/FacilityDetail';
import MessageModal from '../common/MessageModal';

export default function MapScreen() {
    const dispatch = useDispatch();
    const bookmarkedIds = useSelector((s) => s.facility.bookmarkedIds || []);

    // 장소 데이터 상태
    const [places, setPlaces] = useState([]);
    const [placesLoading, setPlacesLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedFacility, setSelectedFacility] = useState(null);

    // 모달 상태 추가
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Map refs
    const mapRef = useRef(null);
    const bottomSheetRef = useRef(null);
    const currentInfoWindowRef = useRef(null);
    const currentLocationOverlayRef = useRef(null);
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY || '';

    // Current location hook
    const {
        currentLocation,
        isLoading: isLocationLoading,
        fetchCurrentLocation,
    } = useCurrentLocation();

    // 장소 시설 데이터 메모이제이션 (거리 계산 포함)
    const placeFacilities = useMemo(() => {
        if (places.length === 0) return [];
        const facilities = places.map(convertPlaceToFacility);

        if (currentLocation) {
            return calculateDistancesForFacilities(facilities, currentLocation);
        }

        return facilities;
    }, [places, currentLocation]);

    // 모든 시설 데이터
    const allFacilities = useMemo(() => {
        return placeFacilities;
    }, [placeFacilities]);

    // Close detail view
    const closeDetail = useCallback(() => {
        setSelectedFacility(null);

        if (bottomSheetRef.current) {
            bottomSheetRef.current.collapse();
        }

        if (currentInfoWindowRef.current) {
            currentInfoWindowRef.current.close();
            currentInfoWindowRef.current = null;
        }
    }, []);

    // Handle map click to collapse detail view
    const handleMapClick = useCallback(() => {
        if (selectedFacility) {
            closeDetail();
        }
    }, [selectedFacility, closeDetail]);

    // Initialize Kakao Map
    const { mapInstance, mapLoaded } = useKakaoMap(
        mapRef,
        KAKAO_KEY,
        handleMapClick
    );

    // 북마크 목록 로드
    useEffect(() => {
        const loadBookmarks = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    dispatch(setBookmarkedIds([]));
                    return;
                }

                const bookmarks = await getMyBookmarks();
                const bookmarkIds = bookmarks.map(
                    (bookmark) => `place-${bookmark.placeId}`
                );
                dispatch(setBookmarkedIds(bookmarkIds));
            } catch (error) {
                console.error('북마크 목록 로드 실패:', error);
                dispatch(setBookmarkedIds([]));
            }
        };

        loadBookmarks();
    }, [dispatch]);

    // 장소 데이터 로드
    useEffect(() => {
        const loadPlaces = async () => {
            const location = currentLocation || { lat: 37.4979, lng: 127.0276 };

            try {
                setPlacesLoading(true);
                const placesData = await getPlaces(location.lng, location.lat);
                setPlaces(placesData);
            } catch (error) {
                console.error('장소 데이터 로드 실패:', error);
            } finally {
                setPlacesLoading(false);
            }
        };

        loadPlaces();
    }, [currentLocation]);

    // showDetail 콜백
    const showDetail = useCallback(
        (facility) => {
            setSelectedFacility(facility);

            if (bottomSheetRef.current) {
                bottomSheetRef.current.expand();
            }

            let offsetLat = 0.002;
            if (mapInstance) {
                const zoomLevel = mapInstance.getLevel();
                console.log('Current zoom level:', zoomLevel);
                switch (zoomLevel) {
                    case 3:
                        offsetLat = 0.0007;
                        break;
                    case 4:
                        offsetLat = 0.001;
                        break;
                    case 5:
                        offsetLat = 0.002;
                        break;
                    case 6:
                        offsetLat = 0.0025;
                        break;
                    default:
                        offsetLat = 0.002;
                        break;
                }
                mapInstance.setCenter(
                    new window.kakao.maps.LatLng(
                        facility.lat - offsetLat * zoomLevel,
                        facility.lng
                    )
                );
            }
        },
        [mapInstance]
    );

    // Manage markers
    const { visibleFacilities, updateSelectedMarker } = useMarkers(
        mapInstance,
        mapLoaded,
        allFacilities,
        currentInfoWindowRef,
        selectedFilter,
        bookmarkedIds,
        showDetail
    );

    // 검색에서 선택된 시설로 자동 포커스
    useEffect(() => {
        if (!mapInstance || allFacilities.length === 0) return;

        try {
            const selectedFacilityData =
                sessionStorage.getItem('selectedFacility');
            if (selectedFacilityData) {
                const facility = JSON.parse(selectedFacilityData);

                sessionStorage.removeItem('selectedFacility');

                const targetFacility = allFacilities.find(
                    (f) => f.placeId === facility.placeId
                );

                if (targetFacility) {
                    setTimeout(() => {
                        if (mapInstance) {
                            mapInstance.setCenter(
                                new window.kakao.maps.LatLng(
                                    targetFacility.lat,
                                    targetFacility.lng
                                )
                            );
                            mapInstance.setLevel(3);

                            if (updateSelectedMarker) {
                                updateSelectedMarker(targetFacility.id);
                            }

                            showDetail(targetFacility);
                        }
                    }, 300);
                }
            }
        } catch (error) {
            console.error('선택된 시설 로드 오류:', error);
        }
    }, [mapInstance, allFacilities, showDetail, updateSelectedMarker]);

    // Relayout map on resize
    useEffect(() => {
        if (!mapInstance || !mapInstance.relayout) return;

        if (typeof mapInstance.relayout === 'function') mapInstance.relayout();

        const onResize = () => {
            if (typeof mapInstance.relayout === 'function')
                mapInstance.relayout();
        };

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [mapInstance]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (window.requestIdleCallback) {
                window.requestIdleCallback(() => {
                    if (currentInfoWindowRef.current) {
                        currentInfoWindowRef.current.close();
                    }
                    if (currentLocationOverlayRef.current) {
                        currentLocationOverlayRef.current.setMap(null);
                    }
                });
            }

            currentInfoWindowRef.current = null;
            currentLocationOverlayRef.current = null;
        };
    }, []);

    // Update current location overlay
    useEffect(() => {
        if (!mapInstance || !currentLocation || !window.kakao) return;

        if (currentLocationOverlayRef.current) {
            currentLocationOverlayRef.current.setMap(null);
        }

        const overlay = createCurrentLocationOverlay(
            window.kakao,
            currentLocation
        );
        overlay.setMap(mapInstance);
        currentLocationOverlayRef.current = overlay;
    }, [mapInstance, currentLocation]);

    // Handle current location button click
    const handleCurrentLocationClick = async () => {
        try {
            const location = await fetchCurrentLocation();
            if (mapInstance && location) {
                mapInstance.setCenter(
                    new window.kakao.maps.LatLng(location.lat, location.lng)
                );
                mapInstance.setLevel(3);
            }
        } catch (error) {
            console.error('Failed to get current location:', error);
            setModalMessage(
                '현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.'
            );
            setShowModal(true);
        }
    };

    // facility.id에서 placeId 추출
    const getPlaceIdFromFacilityId = (facilityId) => {
        if (typeof facilityId === 'string' && facilityId.startsWith('place-')) {
            return parseInt(facilityId.replace('place-', ''), 10);
        }
        return null;
    };

    // 북마크 토글 함수 (모달 추가)
    const toggleBookmarkLocal = async (facilityId) => {
        try {
            // 로그인 체크 - 모달 표시
            const token = localStorage.getItem('token');
            if (!token) {
                setModalMessage(
                    '북마크 기능을 사용하려면\n로그인이 필요합니다.'
                );
                setShowModal(true);
                return;
            }

            // facilityId에서 placeId 추출
            const placeId = getPlaceIdFromFacilityId(facilityId);
            if (!placeId) {
                console.error('유효하지 않은 facility ID:', facilityId);
                return;
            }

            // API 호출
            const result = await toggleBookmark(placeId);

            // 성공 시 Redux 상태 업데이트
            if (result.bookmarked !== undefined) {
                dispatch(toggleBookmarkAction(facilityId));
            }
        } catch (error) {
            console.error('북마크 토글 실패:', error);
            // 로그인 에러인 경우 모달 표시
            if (error.message && error.message.includes('로그인')) {
                setModalMessage('로그인이 필요합니다.');
                setShowModal(true);
            } else {
                setModalMessage(error.message || '북마크 처리에 실패했습니다.');
                setShowModal(true);
            }
        }
    };

    // 모달 닫기 함수
    const handleCloseModal = () => {
        setShowModal(false);
        setModalMessage('');
    };

    return (
        <div
            className='relative w-full overflow-hidden'
            style={{ height: 'calc(100vh - var(--bottom-nav-inset))' }}
        >
            {!KAKAO_KEY ? (
                <div className='p-4'>
                    <div className='bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 rounded-lg p-4'>
                        카카오 맵 API 키가 설정되어 있지 않습니다. 루트에{' '}
                        <code className='bg-white px-1 rounded'>.env</code>{' '}
                        파일을 만들고
                        <div className='mt-2 font-mono text-xs'>
                            VITE_KAKAO_MAP_KEY=발급받은_키
                        </div>
                        를 추가한 뒤 개발 서버를 재시작하세요.
                    </div>
                </div>
            ) : (
                <>
                    <div
                        ref={mapRef}
                        role='application'
                        aria-label='카카오 지도'
                        className='w-full h-full z-0'
                    />

                    {!mapLoaded && (
                        <div className='absolute inset-0 bg-white z-10 flex flex-col items-center justify-center'>
                            <div className='relative'>
                                <div className='w-16 h-16 border-4 border-gray-200 rounded-full'></div>
                                <div className='w-16 h-16 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin absolute top-0 left-0'></div>
                            </div>
                            <p className='mt-6 text-gray-600 font-medium'>
                                지도를 불러오는 중...
                            </p>
                            <p className='mt-2 text-sm text-gray-400'>
                                🗺️ 카카오 맵 초기화 중
                            </p>
                        </div>
                    )}

                    <FilterBar
                        selectedFilter={selectedFilter}
                        onFilterChange={setSelectedFilter}
                    />

                    <CurrentLocationButton
                        onClick={handleCurrentLocationClick}
                        isLoading={isLocationLoading}
                    />

                    <BottomSheet ref={bottomSheetRef}>
                        {selectedFacility ? (
                            <FacilityDetail
                                facility={selectedFacility}
                                bookmarkedIds={bookmarkedIds}
                                onClose={closeDetail}
                                onBookmarkToggle={toggleBookmarkLocal}
                            />
                        ) : (
                            <FacilityList
                                facilities={visibleFacilities}
                                bookmarkedIds={bookmarkedIds}
                                onFacilityClick={showDetail}
                                onBookmarkToggle={toggleBookmarkLocal}
                                isLoading={placesLoading}
                            />
                        )}
                    </BottomSheet>

                    {/* 모달 표시 */}
                    {showModal && (
                        <MessageModal
                            message={modalMessage}
                            type='error'
                            onClose={handleCloseModal}
                        />
                    )}
                </>
            )}
        </div>
    );
}
