/**
 * Get user's current location
 */
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                }
            );
        } else {
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    });
};

/**
 * Watch user's position and call callback when position changes
 */
export const watchUserLocation = (onSuccess, onError) => {
    if (!navigator.geolocation) {
        onError(new Error('Geolocation is not supported by this browser.'));
        return null;
    }

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            onSuccess({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            });
        },
        (error) => {
            onError(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );

    return watchId;
};

/**
 * Stop watching user's position
 */
export const clearLocationWatch = (watchId) => {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
    }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return Math.round(distance); // Round to nearest meter
};

/**
 * Format distance for display
 * @param {number} distance - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
    if (distance === null || distance === undefined) {
        return null;
    }

    if (distance < 1000) {
        return `${Math.round(distance)}m`;
    }

    return `${(distance / 1000).toFixed(1)}km`;
};

/**
 * Calculate distances for multiple facilities from a given location
 * @param {Array} facilities - Array of facility objects with lat/lng
 * @param {Object} currentLocation - Current location with lat/lng
 * @returns {Array} Facilities array with added distance property
 */
export const calculateDistancesForFacilities = (
    facilities,
    currentLocation
) => {
    if (!currentLocation) {
        return facilities;
    }

    return facilities.map((facility) => ({
        ...facility,
        distance: calculateDistance(
            currentLocation.lat,
            currentLocation.lng,
            facility.lat,
            facility.lng
        ),
    }));
};

/**
 * Sort facilities by distance
 * @param {Array} facilities - Array of facilities with distance property
 * @returns {Array} Sorted facilities array
 */
export const sortByDistance = (facilities) => {
    return [...facilities].sort((a, b) => {
        // 거리 정보가 없는 경우 뒤로 이동
        if (!a.distance && !b.distance) return 0;
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        return a.distance - b.distance;
    });
};

/**
 * Create custom overlay for current location marker
 */
export const createCurrentLocationOverlay = (kakao, position) => {
    // Create custom overlay content
    const content = document.createElement('div');
    content.className = 'current-location-marker';
    content.innerHTML = `
        <div style="position: relative; width: 40px; height: 40px;">
            <!-- Pulsing circle -->
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                background: rgba(59, 130, 246, 0.2);
                border-radius: 50%;
                animation: pulse 2s ease-out infinite;
            "></div>
            <!-- Inner circle -->
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 16px;
                height: 16px;
                background: #3B82F6;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            "></div>
        </div>
        <style>
            @keyframes pulse {
                0% {
                    transform: translate(-50%, -50%) scale(0.8);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(2);
                    opacity: 0;
                }
            }
        </style>
    `;

    const customOverlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(position.lat, position.lng),
        content: content,
        xAnchor: 0.5,
        yAnchor: 0.5,
    });

    return customOverlay;
};
