import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setOnlineStatus } from '../store/slices/appSlice';

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );
    const dispatch = useDispatch();

    useEffect(() => {
        function handleOnline() {
            setIsOnline(true);
            dispatch(setOnlineStatus(true));
        }

        function handleOffline() {
            setIsOnline(false);
            dispatch(setOnlineStatus(false));
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [dispatch]);

    return isOnline;
}
