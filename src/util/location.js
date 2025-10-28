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
