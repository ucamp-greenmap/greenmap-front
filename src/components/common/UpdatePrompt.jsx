import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useServiceWorker } from '../../hooks/useServiceWorker';

export function UpdatePrompt() {
    const { updateAvailable, updateApp } = useServiceWorker();

    if (!updateAvailable) return null;

    return (
        <div className='fixed bottom-20 left-4 right-4 bg-white rounded-xl shadow-xl p-4 z-50 border-2 border-[#4CAF50]'>
            <div className='flex items-center gap-3'>
                <RefreshCw className='w-6 h-6 text-[#4CAF50]' />
                <div className='flex-1'>
                    <p className='font-bold text-gray-800'>
                        새 버전이 있습니다
                    </p>
                    <p className='text-sm text-gray-600'>
                        최신 기능을 사용하려면 업데이트하세요
                    </p>
                </div>
                <button
                    onClick={updateApp}
                    className='px-4 py-2 bg-[#4CAF50] text-white rounded-lg font-medium hover:bg-[#45a049] transition-colors'
                >
                    업데이트
                </button>
            </div>
        </div>
    );
}

export default UpdatePrompt;
