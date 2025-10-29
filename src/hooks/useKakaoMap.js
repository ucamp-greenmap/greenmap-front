import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for initializing Kakao Map
 */
export const useKakaoMap = (mapRef, KAKAO_KEY, onMapClick) => {
    const mapInstanceRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapClickListenerRef = useRef(null);
    const initAttemptedRef = useRef(false);

    useEffect(() => {
        if (!KAKAO_KEY) return;

        const scriptId = 'kakao-map-sdk';

        const initMap = () => {
            // mapRef가 아직 준비되지 않았으면 나중에 다시 시도
            if (!mapRef.current) {
                console.log('[Kakao Map] mapRef not ready, will retry...');
                return;
            }

            if (!window.kakao || !window.kakao.maps) {
                console.log('[Kakao Map] Kakao SDK not ready');
                return;
            }

            if (mapInstanceRef.current) {
                console.log('[Kakao Map] Map already initialized');
                return; // Prevent re-initialization
            }

            console.log('[Kakao Map] Initializing map...');
            initAttemptedRef.current = true;

            const container = mapRef.current;
            const options = {
                center: new window.kakao.maps.LatLng(37.5665, 126.978),
                level: 6,
            };
            const map = new window.kakao.maps.Map(container, options);
            mapInstanceRef.current = map;

            // Add click event listener to map
            if (onMapClick) {
                mapClickListenerRef.current =
                    window.kakao.maps.event.addListener(
                        map,
                        'click',
                        onMapClick
                    );
            }

            console.log('[Kakao Map] Map initialized successfully');
            setMapLoaded(true);
        };

        // Case 1: Kakao SDK already loaded
        if (window.kakao && window.kakao.maps) {
            console.log('[Kakao Map] SDK already loaded, initializing...');
            // SDK가 로드되어 있으면 바로 초기화 시도
            if (window.kakao.maps.load) {
                window.kakao.maps.load(initMap);
            } else {
                // 이미 완전히 로드된 경우
                initMap();
            }
            return;
        }

        // Case 2: Script tag already exists but SDK not ready
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
            console.log('[Kakao Map] Script exists, waiting for SDK...');
            // 스크립트가 있지만 SDK가 아직 로드되지 않은 경우
            // 100ms마다 체크
            const checkInterval = setInterval(() => {
                if (window.kakao && window.kakao.maps) {
                    clearInterval(checkInterval);
                    console.log('[Kakao Map] SDK ready, initializing...');
                    window.kakao.maps.load(initMap);
                }
            }, 100);

            // 5초 후 타임아웃
            setTimeout(() => {
                clearInterval(checkInterval);
            }, 5000);

            return () => clearInterval(checkInterval);
        }

        // Case 3: Script tag doesn't exist, need to load
        console.log('[Kakao Map] Loading SDK script...');
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`;
        script.async = true;
        script.onload = () => {
            console.log('[Kakao Map] Script loaded, initializing SDK...');
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(initMap);
            }
        };
        script.onerror = () => {
            console.error('[Kakao Map] Failed to load SDK script');
        };
        document.head.appendChild(script);

        return () => {
            // Cleanup map click listener
            if (
                mapClickListenerRef.current &&
                window.kakao &&
                window.kakao.maps
            ) {
                window.kakao.maps.event.removeListener(
                    mapClickListenerRef.current
                );
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [KAKAO_KEY]);

    // mapRef가 변경되면 지도 초기화 다시 시도
    useEffect(() => {
        if (
            mapRef.current &&
            !mapInstanceRef.current &&
            !initAttemptedRef.current &&
            window.kakao &&
            window.kakao.maps
        ) {
            console.log('[Kakao Map] mapRef ready, initializing...');
            const initMap = () => {
                if (!mapRef.current || mapInstanceRef.current) return;

                const container = mapRef.current;
                const options = {
                    center: new window.kakao.maps.LatLng(37.5665, 126.978),
                    level: 6,
                };
                const map = new window.kakao.maps.Map(container, options);
                mapInstanceRef.current = map;

                if (onMapClick) {
                    mapClickListenerRef.current =
                        window.kakao.maps.event.addListener(
                            map,
                            'click',
                            onMapClick
                        );
                }

                setMapLoaded(true);
            };

            window.kakao.maps.load(initMap);
            initAttemptedRef.current = true;
        }
    }, [mapRef, onMapClick]);

    // Update click listener when onMapClick changes
    useEffect(() => {
        if (!mapInstanceRef.current || !onMapClick || !window.kakao) return;

        // Remove old listener
        if (mapClickListenerRef.current) {
            window.kakao.maps.event.removeListener(mapClickListenerRef.current);
        }

        // Add new listener
        mapClickListenerRef.current = window.kakao.maps.event.addListener(
            mapInstanceRef.current,
            'click',
            onMapClick
        );

        return () => {
            if (mapClickListenerRef.current && window.kakao) {
                window.kakao.maps.event.removeListener(
                    mapClickListenerRef.current
                );
            }
        };
    }, [onMapClick]);

    return { mapInstance: mapInstanceRef.current, mapLoaded };
};
