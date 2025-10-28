import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for initializing Kakao Map
 */
export const useKakaoMap = (mapRef, KAKAO_KEY, onMapClick) => {
    const mapInstanceRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);

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

            // Add click event listener to map
            if (onMapClick) {
                window.kakao.maps.event.addListener(map, 'click', onMapClick);
            }

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
    }, [KAKAO_KEY, mapRef, onMapClick]);

    return { mapInstance: mapInstanceRef.current, mapLoaded };
};
