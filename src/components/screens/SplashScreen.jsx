import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAppState } from '../../store/slices/appSlice';

export function SplashScreen() {
    const dispatch = useDispatch();

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(setAppState('onboarding'));
        }, 3000);
        return () => clearTimeout(timer);
    }, [dispatch]);

    return (
        <div className='w-full h-screen flex items-center justify-center bg-gradient-to-b from-[#4CAF50] to-[#8BC34A]'>
            <div className='text-center text-white'>
                <div className='text-6xl'>🌱</div>
                <h1 className='text-3xl font-bold mt-4'>그린맵</h1>
                <p className='mt-2 text-sm'>
                    녹색 발자국과 함께하는 지속가능한 생활 지도
                </p>
            </div>
        </div>
    );
}

export default SplashScreen;
