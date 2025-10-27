import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function OfflineBanner() {
    const isOnline = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div className='fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white py-2 px-4 flex items-center justify-center gap-2'>
            <WifiOff className='w-5 h-5' />
            <span className='text-sm font-medium'>
                오프라인 모드입니다. 일부 기능이 제한될 수 있습니다.
            </span>
        </div>
    );
}

export default OfflineBanner;
