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
import FilterBar from '../map/FilterBar';
import BottomSheet from '../map/BottomSheet';
import FacilityList from '../map/FacilityList';
import FacilityDetail from '../map/FacilityDetail';

export default function MapScreen() {
    const facilities = useSelector((s) => s.facility.facilities || []);
    const dispatch = useDispatch();
    const bookmarkedIds = useSelector((s) => s.facility.bookmarkedIds || []);

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

    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedFacility, setSelectedFacility] = useState(null);

    const filtered = useMemo(
        () =>
            selectedFilter === 'all'
                ? dummyFacilities
                : selectedFilter === 'bookmark'
                ? dummyFacilities.filter((d) => bookmarkedIds.includes(d.id))
                : dummyFacilities.filter((d) => d.category === selectedFilter),
        [selectedFilter, dummyFacilities, bookmarkedIds]
    );

    // Map refs
    const mapRef = useRef(null);
    const currentInfoWindowRef = useRef(null);
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY || '';

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

    // Manage markers
    const markersRef = useMarkers(
        mapInstance,
        mapLoaded,
        dummyFacilities,
        currentInfoWindowRef
    );

    // Update markers visibility based on filter/bookmarks
    useEffect(() => {
        if (!mapInstance || !markersRef.current) return;

        markersRef.current.forEach(({ id, marker }) => {
            const data = dummyFacilities.find((d) => d.id === id);
            if (!data) return;
            const shouldShow =
                selectedFilter === 'all'
                    ? true
                    : selectedFilter === 'bookmark'
                    ? bookmarkedIds.includes(id)
                    : data.category === selectedFilter;
            marker.setMap(shouldShow ? mapInstance : null);
        });
    }, [
        selectedFilter,
        bookmarkedIds,
        mapLoaded,
        dummyFacilities,
        mapInstance,
        markersRef,
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            currentInfoWindowRef.current = null;
        };
    }, []);

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
        <div className='relative h-screen w-screen overflow-hidden'>
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
                        className='absolute inset-0 z-0'
                    />

                    <FilterBar
                        selectedFilter={selectedFilter}
                        onFilterChange={setSelectedFilter}
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
                                facilities={filtered}
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
