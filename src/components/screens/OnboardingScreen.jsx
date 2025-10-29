import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setAppState, setActiveTab } from '../../store/slices/appSlice';

const slides = [
    {
        id: 1,
        title: '환경 시설 찾기',
        icon: '🗺️',
        desc: '재활용 센터, 전기차 충전소, 제로웨이스트 스토어 등 친환경 시설을 쉽게 찾아보세요',
    },
    {
        id: 2,
        title: '활동 인증하기',
        icon: '✅',
        desc: '친환경 활동을 인증하고 포인트를 모아보세요',
    },
    {
        id: 3,
        title: '리워드 받기',
        icon: '🎁',
        desc: '모은 포인트로 기프티콘을 구매하거나 현금으로 전환하세요',
    },
];

export default function OnboardingScreen() {
    const [index, setIndex] = useState(0);
    const dispatch = useDispatch();
    const startX = useRef(null);

    function handleStart() {
        dispatch(setAppState('main'));
        dispatch(setActiveTab('home'));
    }

    function goTo(i) {
        setIndex(Math.max(0, Math.min(slides.length - 1, i)));
    }

    function onTouchStart(e) {
        startX.current = e.touches[0].clientX;
    }

    function onTouchEnd(e) {
        if (startX.current == null) return;
        const endX = e.changedTouches[0].clientX;
        const dx = endX - startX.current;
        if (dx < -40) goTo(index + 1);
        else if (dx > 40) goTo(index - 1);
        startX.current = null;
    }

    return (
        <div className='h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#4CAF50] to-[#8BC34A] text-white'>
            <div
                className='w-full max-w-md mx-auto p-6 bg-transparent'
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <div className='h-64 flex items-center justify-center text-6xl'>
                    {slides[index].icon}
                </div>
                <h2 className='text-2xl font-bold text-center mt-4'>
                    {slides[index].title}
                </h2>
                <p className='text-center mt-2 text-sm'>{slides[index].desc}</p>

                <div className='flex items-center justify-center gap-2 mt-6'>
                    {slides.map((s, i) => (
                        <button
                            key={s.id}
                            aria-label={`슬라이드 ${i + 1}`}
                            onClick={() => goTo(i)}
                            className={`w-2 h-2 rounded-full ${
                                i === index ? 'bg-white' : 'bg-white/40'
                            }`}
                        />
                    ))}
                </div>

                <div className='mt-6 flex justify-center'>
                    {index === slides.length - 1 ? (
                        <button
                            onClick={handleStart}
                            className='px-6 py-2 bg-white text-[#4CAF50] rounded-full font-semibold'
                        >
                            시작하기
                        </button>
                    ) : (
                        <div className='flex gap-2'>
                            <button
                                onClick={() => goTo(index - 1)}
                                className='px-4 py-2 bg-white/30 rounded-full'
                            >
                                이전
                            </button>
                            <button
                                onClick={() => goTo(index + 1)}
                                className='px-4 py-2 bg-white rounded-full
                                text-[#4CAF50] font-semibold
                                '
                            >
                                다음
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
