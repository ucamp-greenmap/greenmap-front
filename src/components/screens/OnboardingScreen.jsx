import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setAppState, setActiveTab } from '../../store/slices/appSlice';
import OnboardingImage1 from '../../assets/2803064_17627.jpg';
import OnboardingImage2 from '../../assets/22890508_6692213.jpg';
import OnboardingImage3 from '../../assets/bd09ab29-a980-41cd-9f3a-9edacf7ce5e7.jpg';

const slides = [
    {
        id: 1,
        title: '친환경 시설 찾기',
        image: OnboardingImage1,
        iconEmoji: '🗺️',
        desc: '주변의 전기차 충전소, 제로웨이스트 스토어, 따릉이 대여소등 친환경 시설을 쉽게 찾아보세요',
    },
    {
        id: 2,
        title: '활동 인증하기',
        image: OnboardingImage2,
        iconEmoji: '✅',
        desc: '친환경 활동을 인증하면 포인트를 획득할 수 있어요.',
    },
    {
        id: 3,
        title: '리워드 받기',
        image: OnboardingImage3,
        iconEmoji: '🎁',
        desc: '모은 포인트로 기프티콘을 구매하거나 현금으로 전환하세요',
    },
];

export default function OnboardingScreen() {
    const [index, setIndex] = useState(0);
    const dispatch = useDispatch();
    const startX = useRef(null);

    const currentSlide = slides[index];

    function handleStart() {
        dispatch(setAppState('main'));
        dispatch(setActiveTab('home'));
    }

    function goTo(i) {
        setIndex(Math.max(0, Math.min(slides.length - 1, i)));
    }

    function onTouchStart(e) {
        if (e.touches && e.touches.length > 0) {
            startX.current = e.touches[0].clientX;
        }
    }

    function onTouchEnd(e) {
        if (startX.current == null) return;
        const endX = e.changedTouches[0].clientX;
        const dx = endX - startX.current;

        const swipeThreshold = 40;
        const tapTolerance = 10;

        if (Math.abs(dx) < tapTolerance) {
            startX.current = null;
            return;
        }

        if (dx < -swipeThreshold) {
            goTo(index + 1);
        } else if (dx > swipeThreshold) {
            goTo(index - 1);
        }

        startX.current = null;
    }

    return (
        <div
            className='min-h-screen bg-white flex flex-col'
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <div className='flex-1 flex flex-col w-full max-w-xl lg:max-w-2xl mx-auto items-center'>
                <div className='h-[50vh] relative overflow-hidden flex items-center justify-center w-full'>
                    <div />
                    <img
                        src={currentSlide.image}
                        alt={currentSlide.title}
                        className='relative z-10 w-full h-full object-contain'
                    />
                    <div className='absolute inset-0 bg-gradient-to-b from-transparent to-white/30 z-20' />
                </div>
                <div className='flex-1 flex flex-col justify-between p-6 sm:p-8 text-black w-full **max-w-lg** mx-auto'>
                    <div className='flex flex-col items-center text-center'>
                        <div className='bg-[#4CAF50] rounded-full p-6 shadow-lg mb-4'>
                            <div className='w-12 h-12 text-white flex items-center justify-center text-4xl'>
                                {currentSlide.iconEmoji}
                            </div>
                        </div>

                        <h2
                            className={`mt-6 text-2xl font-bold text-[#4CAF50] sm:text-3xl`}
                        >
                            {currentSlide.title}
                        </h2>
                        <p className='mt-4 text-gray-600 leading-relaxed sm:text-lg'>
                            {currentSlide.desc}
                        </p>
                    </div>

                    {/* 페이지네이션 및 버튼 그룹 */}
                    <div className='flex flex-col items-center gap-6 mt-8'>
                        <div className='flex gap-2'>
                            {slides.map((s, i) => (
                                <button
                                    key={s.id}
                                    aria-label={`슬라이드 ${i + 1}`}
                                    onClick={() => goTo(i)}
                                    className={`h-2 rounded-full transition-all ${
                                        i === index
                                            ? 'w-8 bg-[#4CAF50]'
                                            : 'w-2 bg-gray-300'
                                    }`}
                                />
                            ))}
                        </div>

                        <div className='w-full flex gap-3'>
                            {index === slides.length - 1 ? (
                                <button
                                    onClick={handleStart}
                                    className='flex-1 px-6 py-3 bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-full font-semibold text-lg'
                                >
                                    시작하기
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleStart}
                                        className='flex-1 text-gray-600 rounded-full text-lg'
                                    >
                                        건너뛰기
                                    </button>
                                    <button
                                        onClick={() => goTo(index + 1)}
                                        className='flex-1 px-6 py-3 bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-full font-semibold text-lg'
                                    >
                                        다음
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
