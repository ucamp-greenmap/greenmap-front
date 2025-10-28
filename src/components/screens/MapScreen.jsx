import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleBookmark as toggleBookmarkAction } from '../../store/slices/facilitySlice';

export default function MapScreen() {
    const facilities = useSelector((s) => s.facility.facilities || []);

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
    const dispatch = useDispatch();
    const bookmarkedIds = useSelector((s) => s.facility.bookmarkedIds || []);

    const filtered =
        selectedFilter === 'all'
            ? dummyFacilities
            : selectedFilter === 'bookmark'
            ? dummyFacilities.filter((d) => bookmarkedIds.includes(d.id))
            : dummyFacilities.filter((d) => d.category === selectedFilter);

    // Map and marker refs
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const currentInfoWindowRef = useRef(null); // Track currently open infowindow
    const [mapLoaded, setMapLoaded] = useState(false);
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY || '';

    // Bottom sheet state
    const sheetRef = useRef(null);
    const [sheetHeight, setSheetHeight] = useState(80); // collapsed px
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);
    const [selectedFacility, setSelectedFacility] = useState(null); // Track selected facility for detail view

    // Define closeDetail before it's used in useEffect
    const closeDetail = useCallback(() => {
        setSelectedFacility(null);
        // Don't collapse the sheet, just return to list view
        // setSheetHeight(80);

        // Close infowindow
        if (currentInfoWindowRef.current) {
            currentInfoWindowRef.current.close();
            currentInfoWindowRef.current = null;
        }
    }, []);

    // Load Kakao SDK and initialize map only once
    useEffect(() => {
        if (!KAKAO_KEY) return;

        const scriptId = 'kakao-map-sdk';

        const initMap = () => {
            if (!mapRef.current || !window.kakao || !window.kakao.maps) return;
            if (mapInstanceRef.current) return; // Prevent re-initialization

            const container = mapRef.current;
            const options = {
                center: new window.kakao.maps.LatLng(37.5665, 126.978),
                level: 6,
            };
            const map = new window.kakao.maps.Map(container, options);
            mapInstanceRef.current = map;

            // Add click event listener to map to collapse bottom sheet
            window.kakao.maps.event.addListener(map, 'click', () => {
                if (selectedFacility) {
                    closeDetail();
                } else {
                    setSheetHeight(80);
                }
            });

            setMapLoaded(true);
        };

        if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(initMap);
            return;
        }

        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`;
            script.async = true;
            script.onload = () => {
                if (window.kakao && window.kakao.maps) {
                    window.kakao.maps.load(initMap);
                }
            };
            document.head.appendChild(script);
        }
    }, [KAKAO_KEY, selectedFacility, closeDetail]);

    // Create/update markers based on dummyFacilities
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !window.kakao || !window.kakao.maps) return;

        // Clear existing markers
        markersRef.current.forEach((m) => {
            if (m.marker) m.marker.setMap(null);
            if (m.infowindow) m.infowindow.close();
        });

        // Helper functions
        const colorFor = (cat) => {
            return (
                {
                    recycle: '#4CAF50',
                    ev: '#2196F3',
                    store: '#9C27B0',
                    bike: '#FF9800',
                }[cat] || '#666'
            );
        };

        const makeMarkerImage = (color) => {
            const svg =
                `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>` +
                `<circle cx='18' cy='12' r='8' fill='${color}' />` +
                `<path d='M18 20 L13 33 L23 33 Z' fill='${color}' />` +
                `</svg>`;
            const url = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
            return new window.kakao.maps.MarkerImage(
                url,
                new window.kakao.maps.Size(36, 36),
                new window.kakao.maps.Point(18, 36)
            );
        };

        // Create new markers
        markersRef.current = dummyFacilities.map((f) => {
            const position = new window.kakao.maps.LatLng(f.lat, f.lng);
            const color = colorFor(f.category);
            const markerImage = makeMarkerImage(color);
            const marker = new window.kakao.maps.Marker({
                position,
                image: markerImage,
            });
            marker.setMap(map);

            const infoContent = `<div style="padding:8px"><strong>${f.name}</strong><div style="font-size:12px;color:#666">${f.category}</div></div>`;
            const infowindow = new window.kakao.maps.InfoWindow({
                content: infoContent,
            });

            window.kakao.maps.event.addListener(marker, 'click', () => {
                // Close previously open infowindow
                if (currentInfoWindowRef.current) {
                    currentInfoWindowRef.current.close();
                }
                infowindow.open(map, marker);
                currentInfoWindowRef.current = infowindow;
            });

            return { id: f.id, marker, infowindow, data: f };
        });
    }, [mapLoaded, dummyFacilities]);

    // update markers visibility based on filter/bookmarks
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !markersRef.current) return;

        markersRef.current.forEach(({ id, marker }) => {
            const data = dummyFacilities.find((d) => d.id === id);
            if (!data) return;
            const shouldShow =
                selectedFilter === 'all'
                    ? true
                    : selectedFilter === 'bookmark'
                    ? bookmarkedIds.includes(id)
                    : data.category === selectedFilter;
            marker.setMap(shouldShow ? map : null);
        });
    }, [selectedFilter, bookmarkedIds, mapLoaded, dummyFacilities]);

    // relayout map when viewport or sheet height changes so map doesn't appear misaligned
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !map.relayout) return;

        if (typeof map.relayout === 'function') map.relayout();

        const onResize = () => {
            if (typeof map.relayout === 'function') map.relayout();
        };

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [mapLoaded, sheetHeight]);

    // cleanup markers and map on unmount
    useEffect(() => {
        return () => {
            markersRef.current.forEach((m) => {
                if (m.marker) m.marker.setMap(null);
                if (m.infowindow) m.infowindow.close();
            });
            markersRef.current = [];
            currentInfoWindowRef.current = null;
            mapInstanceRef.current = null;
        };
    }, []);

    // bottom sheet drag handlers
    const startDrag = (e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        startYRef.current = e.clientY;
        startHeightRef.current = sheetRef.current.clientHeight;

        const onPointerMove = (moveEvent) => {
            if (!isDraggingRef.current) return;
            const dy = startYRef.current - moveEvent.clientY;
            let newHeight = Math.min(
                window.innerHeight * 0.9,
                Math.max(80, startHeightRef.current + dy)
            );
            setSheetHeight(newHeight);
        };

        const onPointerUp = () => {
            isDraggingRef.current = false;
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);

            const currentHeight = sheetRef.current.clientHeight;
            const threshold = window.innerHeight * 0.25;
            if (currentHeight > threshold) {
                setSheetHeight(window.innerHeight * 0.6);
            } else {
                setSheetHeight(80);
            }
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    const toggleBookmarkLocal = (id) => {
        // dispatch to redux slice to persist bookmark state globally
        dispatch(toggleBookmarkAction(id));
    };

    const showDetail = (facility) => {
        // Show detail view and expand sheet
        setSelectedFacility(facility);
        setSheetHeight(window.innerHeight * 0.6);

        // Focus on map marker
        const entry = markersRef.current.find((m) => m.id === facility.id);
        if (entry && mapInstanceRef.current) {
            const { marker, infowindow, data } = entry;

            // Close previously open infowindow
            if (currentInfoWindowRef.current) {
                currentInfoWindowRef.current.close();
            }

            mapInstanceRef.current.setCenter(
                new window.kakao.maps.LatLng(data.lat, data.lng)
            );
            infowindow.open(mapInstanceRef.current, marker);
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

                    {/* top overlay filters (centered pill) */}
                    <div className='absolute top-4 left-0 right-0 z-10 w-full px-4 pointer-events-none'>
                        <div className='max-w-full mx-auto flex justify-center'>
                            <div className='inline-flex gap-2 overflow-x-auto pb-2 pointer-events-auto bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-3 py-2'>
                                {[
                                    { key: 'all', label: '전체' },
                                    { key: 'recycle', label: '재활용 센터' },
                                    { key: 'ev', label: '충전소' },
                                    { key: 'store', label: '제로웨이스트' },
                                    { key: 'bike', label: '따릉이' },
                                    { key: 'bookmark', label: '북마크' },
                                ].map((c) => (
                                    <button
                                        key={c.key}
                                        onClick={() => setSelectedFilter(c.key)}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ' '
                                            ) {
                                                e.preventDefault();
                                                setSelectedFilter(c.key);
                                            }
                                        }}
                                        aria-pressed={selectedFilter === c.key}
                                        aria-label={`필터 ${c.label}`}
                                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                            selectedFilter === c.key
                                                ? 'bg-green-500 text-white shadow'
                                                : 'bg-white/80 text-gray-800 hover:bg-gray-50'
                                        }`}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* bottom sheet */}
                    <div
                        ref={sheetRef}
                        className='absolute left-0 right-0 bg-white rounded-t-2xl shadow-2xl overflow-hidden z-20'
                        style={{
                            height: `${sheetHeight}px`,
                            transition: isDraggingRef.current
                                ? 'none'
                                : 'height 200ms ease-out',
                            bottom: 'var(--bottom-nav-inset, 96px)',
                        }}
                        role='region'
                        aria-label='시설 목록 패널'
                        aria-expanded={
                            typeof window !== 'undefined'
                                ? sheetHeight > window.innerHeight * 0.25
                                : sheetHeight > 200
                        }
                    >
                        <div
                            className='h-10 flex items-center justify-center'
                            style={{ touchAction: 'none' }}
                        >
                            <button
                                className='cursor-grab w-full h-full flex items-center justify-center bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500'
                                onPointerDown={startDrag}
                                onKeyDown={(e) => {
                                    const expanded =
                                        typeof window !== 'undefined'
                                            ? sheetHeight >
                                              window.innerHeight * 0.25
                                            : sheetHeight > 200;
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        if (expanded) {
                                            setSheetHeight(80);
                                        } else {
                                            setSheetHeight(
                                                window.innerHeight * 0.6
                                            );
                                        }
                                    }
                                    if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setSheetHeight(
                                            window.innerHeight * 0.6
                                        );
                                    }
                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setSheetHeight(80);
                                    }
                                }}
                                aria-label='시설 목록 열기/닫기'
                                aria-expanded={
                                    typeof window !== 'undefined'
                                        ? sheetHeight >
                                          window.innerHeight * 0.25
                                        : sheetHeight > 200
                                }
                            >
                                <div className='w-12 h-1.5 bg-gray-300 rounded-full' />
                            </button>
                        </div>
                        <div
                            className='px-4 overflow-auto'
                            style={{ height: `calc(${sheetHeight}px - 40px)` }}
                        >
                            {selectedFacility ? (
                                // Detail view
                                <div className='relative'>
                                    <button
                                        onClick={closeDetail}
                                        className='absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 transition-colors'
                                        aria-label='닫기'
                                    >
                                        <svg
                                            className='w-6 h-6'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M6 18L18 6M6 6l12 12'
                                            />
                                        </svg>
                                    </button>

                                    <h3 className='text-xl font-bold mb-4 pr-10'>
                                        {selectedFacility.name}
                                    </h3>

                                    {/* Image placeholder */}
                                    <div className='w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4'>
                                        <span className='text-gray-500'>
                                            이미지 없음
                                        </span>
                                    </div>

                                    {/* Category */}
                                    <div className='mb-4'>
                                        <span className='inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'>
                                            {selectedFacility.category ===
                                                'recycle' && '재활용 센터'}
                                            {selectedFacility.category ===
                                                'ev' && '전기차 충전소'}
                                            {selectedFacility.category ===
                                                'store' && '제로웨이스트'}
                                            {selectedFacility.category ===
                                                'bike' && '따릉이'}
                                        </span>
                                    </div>

                                    {/* Address */}
                                    <div className='mb-4'>
                                        <h4 className='text-sm font-semibold text-gray-600 mb-1'>
                                            주소
                                        </h4>
                                        <p className='text-gray-800'>
                                            {selectedFacility.address ||
                                                '서울시 중구 을지로 123'}
                                        </p>
                                    </div>

                                    {/* Coordinates */}
                                    <div className='mb-4'>
                                        <h4 className='text-sm font-semibold text-gray-600 mb-1'>
                                            위치
                                        </h4>
                                        <p className='text-gray-800 text-sm'>
                                            위도: {selectedFacility.lat}, 경도:{' '}
                                            {selectedFacility.lng}
                                        </p>
                                    </div>

                                    {/* Bookmark button */}
                                    <button
                                        onClick={() =>
                                            toggleBookmarkLocal(
                                                selectedFacility.id
                                            )
                                        }
                                        className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                                            bookmarkedIds.includes(
                                                selectedFacility.id
                                            )
                                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                    >
                                        <svg
                                            className='w-5 h-5'
                                            fill={
                                                bookmarkedIds.includes(
                                                    selectedFacility.id
                                                )
                                                    ? 'currentColor'
                                                    : 'none'
                                            }
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
                                            />
                                        </svg>
                                        {bookmarkedIds.includes(
                                            selectedFacility.id
                                        )
                                            ? '북마크 해제'
                                            : '북마크 추가'}
                                    </button>
                                </div>
                            ) : (
                                // List view
                                <>
                                    <h3 className='text-base font-bold mb-3 px-1'>
                                        시설 목록
                                    </h3>
                                    <ul
                                        className='space-y-2'
                                        role='list'
                                        aria-label='시설 목록'
                                    >
                                        {filtered.map((f) => (
                                            <li
                                                key={f.id}
                                                role='listitem'
                                                onClick={() => showDetail(f)}
                                                className='flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'
                                            >
                                                <div>
                                                    <div className='font-semibold text-gray-800'>
                                                        {f.name}
                                                    </div>
                                                    <div className='text-sm text-gray-500'>
                                                        {f.category ===
                                                            'recycle' &&
                                                            '재활용 센터'}
                                                        {f.category === 'ev' &&
                                                            '전기차 충전소'}
                                                        {f.category ===
                                                            'store' &&
                                                            '제로웨이스트'}
                                                        {f.category ===
                                                            'bike' && '따릉이'}
                                                    </div>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <button
                                                        className='text-2xl text-gray-400 hover:text-blue-500 transition-colors'
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleBookmarkLocal(
                                                                f.id
                                                            );
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                    'Enter' ||
                                                                e.key === ' '
                                                            ) {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                toggleBookmarkLocal(
                                                                    f.id
                                                                );
                                                            }
                                                        }}
                                                        aria-pressed={bookmarkedIds.includes(
                                                            f.id
                                                        )}
                                                        aria-label={
                                                            bookmarkedIds.includes(
                                                                f.id
                                                            )
                                                                ? `${f.name} 북마크 해제`
                                                                : `${f.name} 북마크 추가`
                                                        }
                                                    >
                                                        <svg
                                                            className='w-6 h-6'
                                                            fill={
                                                                bookmarkedIds.includes(
                                                                    f.id
                                                                )
                                                                    ? 'currentColor'
                                                                    : 'none'
                                                            }
                                                            stroke='currentColor'
                                                            viewBox='0 0 24 24'
                                                        >
                                                            <path
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                                strokeWidth={2}
                                                                d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
