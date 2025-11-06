import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAppState } from '../../store/slices/appSlice';

export function SplashScreen() {
    const dispatch = useDispatch();
    const onboardingCompleted = useSelector(
        (state) => state.app.onboardingCompleted
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onboardingCompleted) {
                dispatch(setAppState('main'));
            } else {
                dispatch(setAppState('onboarding'));
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [dispatch, onboardingCompleted]);

    return (
        <div className='w-full h-screen flex items-center justify-center bg-gradient-to-b from-[#4CAF50] to-[#8BC34A]'>
            <div className='text-center text-white'>
                <div className='text-6xl'></div>
                {/* <img
                    src='/public/그린맵 로고 디자인 (3).png'
                    alt='Logo'
                    className='mx-auto'
                /> */}
                <h1 className='text-3xl font-bold mt-4'>GREEN MAP</h1>
                <p className='mt-2 text-xl'>
                    녹색 발자국과 함께하는 지속가능한 생활 지도
                </p>
            </div>
        </div>
    );
}

export default SplashScreen;
