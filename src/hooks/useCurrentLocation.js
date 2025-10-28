import { useState, useEffect, useRef } from 'react';
import {
    getCurrentLocation,
    watchUserLocation,
    clearLocationWatch,
} from '../util/location';

/**
 * Custom hook for tracking user's current location
 */
export const useCurrentLocation = (options = {}) => {
    const { watchPosition = false, onLocationChange } = options;

    const [currentLocation, setCurrentLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const watchIdRef = useRef(null);

    // Get current location once
    const fetchCurrentLocation = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const location = await getCurrentLocation();
            setCurrentLocation(location);
            if (onLocationChange) {
                onLocationChange(location);
            }
            return location;
        } catch (err) {
            setError(err.message || 'Failed to get current location');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Start watching position
    const startWatching = () => {
        if (watchIdRef.current !== null) return;

        watchIdRef.current = watchUserLocation(
            (location) => {
                setCurrentLocation(location);
                if (onLocationChange) {
                    onLocationChange(location);
                }
            },
            (err) => {
                setError(err.message || 'Failed to watch location');
            }
        );
    };

    // Stop watching position
    const stopWatching = () => {
        if (watchIdRef.current !== null) {
            clearLocationWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    };

    // Auto start watching if enabled
    useEffect(() => {
        if (watchPosition) {
            startWatching();
        }

        return () => {
            stopWatching();
        };
    }, [watchPosition]);

    return {
        currentLocation,
        isLoading,
        error,
        fetchCurrentLocation,
        startWatching,
        stopWatching,
    };
};
