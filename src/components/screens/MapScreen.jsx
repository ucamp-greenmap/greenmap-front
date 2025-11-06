import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleBookmark as toggleBookmarkAction } from '../../store/slices/facilitySlice';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import { useMarkers } from '../../hooks/useMarkers';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import {
    createCurrentLocationOverlay,
    calculateDistancesForFacilities,
} from '../../util/location';
import { getPlaces, convertPlaceToFacility } from '../../util/placeApi';
import FilterBar from '../map/FilterBar';
import CurrentLocationButton from '../map/CurrentLocationButton';
import BottomSheet from '../map/BottomSheet';
import FacilityList from '../map/FacilityList';
import FacilityDetail from '../map/FacilityDetail';

export default function MapScreen() {
    const dispatch = useDispatch();
    const bookmarkedIds = useSelector((s) => s.facility.bookmarkedIds || []);

    // 장소 데이터 상태
    const [places, setPlaces] = useState([]);
    const [placesLoading, setPlacesLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedFacility, setSelectedFacility] = useState(null);

    // Map refs
    const mapRef = useRef(null);
    const bottomSheetRef = useRef(null);
    const currentInfoWindowRef = useRef(null);
    const currentLocationOverlayRef = useRef(null);
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY || '';

    // Current location hook - useMemo보다 먼저 호출
    const {
        currentLocation,
        isLoading: isLocationLoading,
        fetchCurrentLocation,
    } = useCurrentLocation();

    // 장소 시설 데이터 메모이제이션 (거리 계산 포함)
    const placeFacilities = useMemo(() => {
        if (places.length === 0) return [];
        const facilities = places.map(convertPlaceToFacility);

        // 현재 위치가 있으면 거리 계산
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

        // BottomSheet 축소
        if (bottomSheetRef.current) {
            bottomSheetRef.current.collapse();
        }

        // Close infowindow
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

    // 장소 데이터 로드
    useEffect(() => {
        const loadPlaces = async () => {
            // 현재 위치 또는 기본 위치 사용 (강남역 근처)
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

    // showDetail 콜백 - useMarkers보다 먼저 정의
    const showDetail = useCallback(
        (facility) => {
            setSelectedFacility(facility);

            // BottomSheet 확장
            if (bottomSheetRef.current) {
                bottomSheetRef.current.expand();
            }

            // Focus on map marker
            if (mapInstance) {
                mapInstance.setCenter(
                    new window.kakao.maps.LatLng(facility.lat, facility.lng)
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
        showDetail // 마커 클릭 콜백 전달
    );

    // 검색에서 선택된 시설로 자동 포커스
    useEffect(() => {
        if (!mapInstance || allFacilities.length === 0) return;

        try {
            const selectedFacilityData =
                sessionStorage.getItem('selectedFacility');
            if (selectedFacilityData) {
                const facility = JSON.parse(selectedFacilityData);

                // sessionStorage 클리어
                sessionStorage.removeItem('selectedFacility');

                // 해당 시설 찾기
                const targetFacility = allFacilities.find(
                    (f) => f.placeId === facility.placeId
                );

                if (targetFacility) {
                    // 지도 중심 이동 및 줌
                    setTimeout(() => {
                        if (mapInstance) {
                            mapInstance.setCenter(
                                new window.kakao.maps.LatLng(
                                    targetFacility.lat,
                                    targetFacility.lng
                                )
                            );
                            mapInstance.setLevel(3); // 줌인

                            // 마커 애니메이션 적용
                            if (updateSelectedMarker) {
                                updateSelectedMarker(targetFacility.id);
                            }

                            // 시설 상세 표시
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

    // Cleanup on unmount - 즉시 반환하여 페이지 전환 속도 향상
    useEffect(() => {
        return () => {
            // 백그라운드에서 정리 (페이지 전환을 블로킹하지 않음)
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

            // 참조는 즉시 초기화
            currentInfoWindowRef.current = null;
            currentLocationOverlayRef.current = null;
        };
    }, []);

    // Update current location overlay
    useEffect(() => {
        if (!mapInstance || !currentLocation || !window.kakao) return;

        // Remove old overlay
        if (currentLocationOverlayRef.current) {
            currentLocationOverlayRef.current.setMap(null);
        }

        // Create and add new overlay
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
                mapInstance.setLevel(3); // Zoom in to level 3
            }
        } catch (error) {
            console.error('Failed to get current location:', error);
            alert('현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
        }
    };

    const toggleBookmarkLocal = (id) => {
        dispatch(toggleBookmarkAction(id));
    };

    return (
        /**
         * 🎨 MapScreen 최상위 컨테이너 레이아웃 설정
         *
         * height: calc(100vh - var(--bottom-nav-inset))
         * - 화면 전체 높이(100vh)에서 BottomNavigation 영역(--bottom-nav-inset)을 뺀 높이
         * - 이렇게 하면 지도가 BottomNavigation과 겹치지 않음
         * - --bottom-nav-inset는 index.css에서 정의 (기본값: 96px)
         *
         * 조정 방법:
         * - 지도 영역을 더 크게: index.css에서 --bottom-nav-inset 값을 줄임
         * - 지도 영역을 더 작게: index.css에서 --bottom-nav-inset 값을 늘림
         *
         * relative: 내부의 absolute 요소들(FilterBar, CurrentLocationButton, BottomSheet)의 기준점
         * overflow-hidden: 지도가 컨테이너 밖으로 넘치지 않도록 제한
         */
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
                    {/**
                     * 🗺️ 카카오 지도 컨테이너
                     *
                     * w-full h-full: 부모 컨테이너의 너비와 높이를 100% 채움
                     * - w-full (width: 100%): 좌우 여백 없이 전체 너비 사용
                     * - h-full (height: 100%): 상하 여백 없이 전체 높이 사용
                     *
                     * z-0: 다른 UI 요소들(FilterBar, BottomSheet) 아래에 배치
                     *
                     * ⚠️ 주의: absolute inset-0 대신 w-full h-full 사용
                     * - absolute inset-0을 사용하면 좌측에 여백이 생김
                     * - w-full h-full은 부모의 크기를 그대로 따라감
                     */}
                    <div
                        ref={mapRef}
                        role='application'
                        aria-label='카카오 지도'
                        className='w-full h-full z-0'
                    />

                    {/* 지도 로딩 인디케이터 */}
                    {!mapLoaded && (
                        <div className='absolute inset-0 bg-white z-10 flex flex-col items-center justify-center'>
                            <div className='relative'>
                                {/* 회전하는 원형 로더 */}
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
                </>
            )}
        </div>
    );
}
