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
import { createCurrentLocationOverlay } from '../../util/location';
import {
    getBikeStations,
    convertBikeStationToFacility,
} from '../../util/bikeStationApi';
import FilterBar from '../map/FilterBar';
import CurrentLocationButton from '../map/CurrentLocationButton';
import BottomSheet from '../map/BottomSheet';
import FacilityList from '../map/FacilityList';
import FacilityDetail from '../map/FacilityDetail';

export default function MapScreen() {
    const facilities = useSelector((s) => s.facility.facilities || []);
    const dispatch = useDispatch();
    const bookmarkedIds = useSelector((s) => s.facility.bookmarkedIds || []); // 따릉이 데이터 상태
    const [bikeStations, setBikeStations] = useState([]);
    const [bikeStationsLoading, setBikeStationsLoading] = useState(false);

    // 따릉이 시설 데이터 메모이제이션 (변환 비용 절감)
    const bikeFacilities = useMemo(() => {
        if (bikeStations.length === 0) return [];
        return bikeStations.map(convertBikeStationToFacility);
    }, [bikeStations]);

    // Dummy facility data with coordinates (used if store has none)
    const dummyFacilities = useMemo(
        () =>
            facilities && facilities.length > 0
                ? facilities
                : [
                      {
                          id: 'f1',
                          name: '재활용 센터 A',
                          category: 'recycle',
                          lat: 37.57,
                          lng: 126.976,
                      },
                      {
                          id: 'f2',
                          name: '전기차 충전소 B',
                          category: 'ev',
                          lat: 37.565,
                          lng: 126.977,
                      },
                      {
                          id: 'f3',
                          name: '제로웨이스트 샵 C',
                          category: 'store',
                          lat: 37.564,
                          lng: 126.982,
                      },
                      {
                          id: 'f4',
                          name: '따릉이 스테이션 D',
                          category: 'bike',
                          lat: 37.568,
                          lng: 126.981,
                      },
                      {
                          id: 'f5',
                          name: '재활용 센터 E',
                          category: 'recycle',
                          lat: 37.562,
                          lng: 126.975,
                      },
                  ],
        [facilities]
    );

    // 따릉이 데이터와 더미 데이터 병합
    const allFacilities = useMemo(() => {
        return [...dummyFacilities, ...bikeFacilities];
    }, [dummyFacilities, bikeFacilities]);

    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedFacility, setSelectedFacility] = useState(null);

    // Map refs
    const mapRef = useRef(null);
    const currentInfoWindowRef = useRef(null);
    const currentLocationOverlayRef = useRef(null);
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY || '';

    // Current location hook
    const {
        currentLocation,
        isLoading: isLocationLoading,
        fetchCurrentLocation,
    } = useCurrentLocation();

    // Close detail view
    const closeDetail = useCallback(() => {
        setSelectedFacility(null);
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

    // 따릉이 대여소 데이터 로드
    useEffect(() => {
        const loadBikeStations = async () => {
            try {
                setBikeStationsLoading(true);
                const stations = await getBikeStations();
                setBikeStations(stations);
            } catch (error) {
                console.error('따릉이 대여소 로드 실패:', error);
                // 실패해도 계속 진행 (다른 시설은 표시)
            } finally {
                setBikeStationsLoading(false);
            }
        };

        loadBikeStations();
    }, []);

    // Manage markers
    const { markersRef, updateVisibleMarkers, visibleFacilities } = useMarkers(
        mapInstance,
        mapLoaded,
        allFacilities,
        currentInfoWindowRef,
        selectedFilter,
        bookmarkedIds
    );

    // 필터나 북마크 변경 시 마커 업데이트
    useEffect(() => {
        if (!mapInstance || !markersRef.current) return;
        updateVisibleMarkers();
    }, [
        selectedFilter,
        bookmarkedIds,
        mapInstance,
        markersRef,
        updateVisibleMarkers,
    ]);

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

    const showDetail = (facility) => {
        setSelectedFacility(facility);

        // Focus on map marker
        const entry = markersRef.current.find((m) => m.id === facility.id);
        if (entry && mapInstance) {
            const { marker, infowindow, data } = entry;

            // Close previously open infowindow
            if (currentInfoWindowRef.current) {
                currentInfoWindowRef.current.close();
            }

            mapInstance.setCenter(
                new window.kakao.maps.LatLng(data.lat, data.lng)
            );
            infowindow.open(mapInstance, marker);
            currentInfoWindowRef.current = infowindow;
        }
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

                    <BottomSheet>
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
                            />
                        )}
                    </BottomSheet>
                </>
            )}
        </div>
    );
}
