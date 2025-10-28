import { useEffect, useRef } from 'react';
import { getCategoryColor, createMarkerImage } from '../util/mapHelpers';

/**
 * Custom hook for managing map markers
 */
export const useMarkers = (
    mapInstance,
    mapLoaded,
    facilities,
    currentInfoWindowRef
) => {
    const markersRef = useRef([]);

    // Create/update markers based on facilities
    useEffect(() => {
        if (!mapInstance || !window.kakao || !window.kakao.maps) return;

        // Clear existing markers
        markersRef.current.forEach((m) => {
            if (m.marker) m.marker.setMap(null);
            if (m.infowindow) m.infowindow.close();
        });

        // Create new markers
        markersRef.current = facilities.map((f) => {
            const position = new window.kakao.maps.LatLng(f.lat, f.lng);
            const color = getCategoryColor(f.category);
            const markerImage = createMarkerImage(window.kakao, color);
            const marker = new window.kakao.maps.Marker({
                position,
                image: markerImage,
            });
            marker.setMap(mapInstance);

            const infoContent = `<div style="padding:8px"><strong>${f.name}</strong><div style="font-size:12px;color:#666">${f.category}</div></div>`;
            const infowindow = new window.kakao.maps.InfoWindow({
                content: infoContent,
            });

            window.kakao.maps.event.addListener(marker, 'click', () => {
                // Close previously open infowindow
                if (currentInfoWindowRef.current) {
                    currentInfoWindowRef.current.close();
                }
                infowindow.open(mapInstance, marker);
                currentInfoWindowRef.current = infowindow;
            });

            return { id: f.id, marker, infowindow, data: f };
        });
    }, [mapLoaded, facilities, mapInstance, currentInfoWindowRef]);

    // Cleanup markers on unmount
    useEffect(() => {
        return () => {
            markersRef.current.forEach((m) => {
                if (m.marker) m.marker.setMap(null);
                if (m.infowindow) m.infowindow.close();
            });
            markersRef.current = [];
        };
    }, []);

    return markersRef;
};
