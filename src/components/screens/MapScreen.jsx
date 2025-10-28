import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleBookmark as toggleBookmarkAction } from '../../store/slices/facilitySlice';

export default function MapScreen() {
    const facilities = useSelector((s) => s.facility.facilities || []);

    // Dummy facility data with coordinates (used if store has none)
    const dummyFacilities = useMemo(
        () =>
            (facilities && facilities.length) || 0
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
    const [mapLoaded, setMapLoaded] = useState(false);
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY || '';

    // Bottom sheet state
    const sheetRef = useRef(null);
    const [sheetHeight, setSheetHeight] = useState(80); // collapsed px
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);

    // Load Kakao SDK and initialize map + markers
    useEffect(() => {
        if (!KAKAO_KEY) return;

        const scriptId = 'kakao-map-sdk';

        const initMap = () => {
            if (!mapRef.current || !window.kakao || !window.kakao.maps) return;
            const container = mapRef.current;
            const options = {
                center: new window.kakao.maps.LatLng(37.5665, 126.978),
                level: 6,
            };
            const map = new window.kakao.maps.Map(container, options);
            mapInstanceRef.current = map;

            // create markers for dummyFacilities
            markersRef.current.forEach(
                (m) => m.marker && m.marker.setMap(null)
            );
            // helper to create a small SVG data URL marker per category
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
                const url =
                    'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
                return new window.kakao.maps.MarkerImage(
                    url,
                    new window.kakao.maps.Size(36, 36),
                    new window.kakao.maps.Point(18, 36)
                );
            };

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
                    infowindow.open(map, marker);
                });

                return { id: f.id, marker, infowindow, data: f };
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
                try {
                    window.kakao.maps.load(initMap);
                } catch {
                    // ignore
                }
            };
            document.head.appendChild(script);
        } else {
            const existing = document.getElementById(scriptId);
            if (existing)
                existing.addEventListener('load', () =>
                    window.kakao.maps.load(initMap)
                );
        }
    }, [KAKAO_KEY, dummyFacilities]);

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

    // cleanup markers on unmount
    useEffect(() => {
        return () => {
            markersRef.current.forEach(
                (m) => m.marker && m.marker.setMap(null)
            );
            markersRef.current = [];
        };
    }, []);

    // bottom sheet drag handlers
    useEffect(() => {
        const onPointerMove = (e) => {
            if (!isDraggingRef.current) return;
            const dy = startYRef.current - e.clientY;
            let newHeight = Math.min(
                window.innerHeight * 0.9,
                Math.max(80, startHeightRef.current + dy)
            );
            setSheetHeight(newHeight);
        };
        const onPointerUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            const threshold = window.innerHeight * 0.25;
            if (sheetHeight > threshold)
                setSheetHeight(window.innerHeight * 0.6);
            else setSheetHeight(80);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        if (isDraggingRef.current) {
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [sheetHeight]);

    const startDrag = (e) => {
        isDraggingRef.current = true;
        startYRef.current = e.clientY;
        startHeightRef.current = sheetHeight;
    };

    const toggleBookmarkLocal = (id) => {
        // dispatch to redux slice to persist bookmark state globally
        dispatch(toggleBookmarkAction(id));
    };

    const focusOn = (id) => {
        const entry = markersRef.current.find((m) => m.id === id);
        if (!entry || !mapInstanceRef.current) return;
        const { marker, infowindow, data } = entry;
        mapInstanceRef.current.setCenter(
            new window.kakao.maps.LatLng(data.lat, data.lng)
        );
        infowindow.open(mapInstanceRef.current, marker);
        setSheetHeight(80); // collapse
    };

    return (
        <div className='relative h-screen w-screen'>
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
                                            if (e.key === 'Enter' || e.key === ' ') {
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
                        className='absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl overflow-hidden z-20'
                        style={{
                            height: `${sheetHeight}px`,
                            transition: isDraggingRef.current
                                ? 'none'
                                : 'height 200ms ease-out',
                            // bottom safe area is handled by parent padding
                        }}
                        role='region'
                        aria-label='시설 목록 패널'
                        aria-expanded={
                            typeof window !== 'undefined'
                                ? sheetHeight > window.innerHeight * 0.25
                                : sheetHeight > 200
                        }
                    >
                        <div className='h-10 flex items-center justify-center'>
                            <button
                                className='cursor-grab w-full h-full flex items-center justify-center bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500'
                                onPointerDown={startDrag}
                                onKeyDown={(e) => {
                                    const expanded =
                                        typeof window !== 'undefined'
                                            ? sheetHeight > window.innerHeight * 0.25
                                            : sheetHeight > 200;
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        if (expanded) {
                                            setSheetHeight(80);
                                        } else {
                                            setSheetHeight(window.innerHeight * 0.6);
                                        }
                                    }
                                    if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setSheetHeight(window.innerHeight * 0.6);
                                    }
                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setSheetHeight(80);
                                    }
                                }}
                                aria-label='시설 목록 열기/닫기'
                                aria-expanded={
                                    typeof window !== 'undefined'
                                        ? sheetHeight > window.innerHeight * 0.25
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
                            <h3 className='text-base font-bold mb-3 px-1'>
                                시설 목록
                            </h3>
                            <ul className='space-y-2' role='list' aria-label='시설 목록'>
                                {filtered.map((f) => (
                                    <li
                                        key={f.id}
                                        role='listitem'
                                        className='flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors'
                                    >
                                        <div>
                                            <div className='font-semibold text-gray-800'>
                                                {f.name}
                                            </div>
                                            <div className='text-sm text-gray-500'>
                                                {f.category}
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <button
                                                className='text-2xl text-gray-400 hover:text-yellow-500 transition-colors'
                                                onClick={() => toggleBookmarkLocal(f.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        toggleBookmarkLocal(f.id);
                                                    }
                                                }}
                                                aria-pressed={bookmarkedIds.includes(f.id)}
                                                aria-label={
                                                    bookmarkedIds.includes(f.id)
                                                        ? `${f.name} 즐겨찾기 해제`
                                                        : `${f.name} 즐겨찾기 추가`
                                                }
                                            >
                                                {bookmarkedIds.includes(f.id) ? '★' : '☆'}
                                            </button>
                                            <button
                                                className='text-sm px-4 py-2 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors'
                                                onClick={() => focusOn(f.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        focusOn(f.id);
                                                    }
                                                }}
                                                aria-label={`${f.name} 위치 보기`}
                                            >
                                                보기
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
