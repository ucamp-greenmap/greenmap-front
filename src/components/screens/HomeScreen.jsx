import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';
import EcoNewsList from '../screens/EcoNewsList';
import { TrophyIcon } from '@heroicons/react/24/solid';

// HomeScreen
// Props: onNavigate?: (tab: string) => void
export default function HomeScreen({ onNavigate }) {
    const dispatch = useDispatch();
    const currentPoints = useSelector((s) => s.point.currentPoints);

    const placeholderSvg = encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'>" +
            "<rect fill='%23e5e7eb' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23939' font-size='12'>이미지</text></svg>"
    );
    const placeholder = `data:image/svg+xml;charset=UTF-8,${placeholderSvg}`;

    const navigate = (tab) => {
        if (typeof onNavigate === 'function') {
            onNavigate(tab);
            return;
        }
        dispatch(setActiveTab(tab));
    };

    return (
        /**
         * 📱 HomeScreen 스크롤 영역 설정
         *
         * paddingBottom: var(--bottom-nav-inset)
         * - 하단에 BottomNavigation 높이만큼 padding 추가
         * - 스크롤 시 BottomNavigation이 콘텐츠를 가리지 않도록 함
         * - --bottom-nav-inset는 index.css에서 정의 (기본값: 96px)
         *
         * 조정 방법:
         * - padding을 더 크게: index.css에서 --bottom-nav-inset 값 증가
         * - padding을 더 작게: index.css에서 --bottom-nav-inset 값 감소
         *
         * ⚠️ 주의: className='pb-24' 대신 inline style 사용
         * - pb-24는 고정 padding (96px)
         * - CSS 변수 사용으로 일관된 spacing 유지
         */
        <div style={{ paddingBottom: 'var(--bottom-nav-inset)' }}>
            {/* Header - gradient */}
            <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] px-6 pt-12 pb-6 rounded-b-3xl text-white'>
                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-white rounded-full p-5 shadow-xl mb-4'>
                        <div className='w-12 h-12 flex items-center justify-center text-[#4CAF50] text-3xl'>
                            🌿
                        </div>
                    </div>
                    <h1 className='text-white text-2xl font-bold mb-1'>
                        그린맵
                    </h1>
                    <p className='text-white/90 text-sm'>
                        지속가능한 생활 지도
                    </p>
                </div>

                <div className='relative w-full'>
                    <input
                        type='text'
                        placeholder='지도...'
                        className='w-full pl-12 pr-4 py-4 rounded-[30px] text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-lg'
                        aria-label='시설, 뉴스, 챌린지 검색'
                    />
                    <div className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                        🔍
                    </div>
                </div>
            </div>

            {/* Page content */}
            <div className='px-4'>
                {/* Point card */}
                <div className='mt-4'>
                    <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] rounded-3xl p-6 text-white shadow-xl border-0'>
                        <div className='flex items-center justify-between mb-4'>
                            <div>
                                <p className='text-white/90 mb-1'>
                                    나의 그린 포인트
                                </p>
                                <div className='flex items-baseline gap-2'>
                                    <span className='text-4xl font-bold'>
                                        {currentPoints}
                                    </span>
                                    <span className='text-lg'>P</span>
                                </div>
                            </div>
                            <div className='bg-white/20 p-3 rounded-2xl backdrop-blur-sm'>
                                <TrophyIcon className='w-6 h-6 text-white' />
                            </div>
                        </div>

                        <div className='bg-white/20 rounded-2xl p-3 backdrop-blur-sm mb-4'>
                            <div className='flex items-center justify-between mb-2'>
                                <span className='text-white/90'>
                                    탄소 감축량
                                </span>
                            </div>
                            <div className='flex items-baseline gap-2'>
                                <span className='text-2xl font-semibold'>
                                    42.5
                                </span>
                                <span className='text-sm'>kg CO₂</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('cert')}
                            className='w-full bg-white text-[#4CAF50] py-3 rounded-[20px] text-center transition-transform hover:scale-105'
                        >
                            활동 인증하고 포인트 받기
                        </button>
                    </div>
                </div>

                {/* Sections */}
                <div className='mt-6 space-y-6'>
                    {/*  EcoNewsList 컴포넌트 삽입 */}
                    <EcoNewsList placeholder={placeholder} />

                    {/* Quick actions */}
                    <div>
                        <h2 className='text-gray-900 mb-4 font-semibold'>
                            빠른 실행
                        </h2>
                        <div className='grid grid-cols-2 gap-3'>
                            <button
                                onClick={() => navigate('map')}
                                className='bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100'
                            >
                                <div className='text-4xl mb-3'>🗺️</div>
                                <p className='text-gray-900'>시설 찾기</p>
                            </button>

                            <button
                                onClick={() => navigate('challenge')}
                                className='bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100'
                            >
                                <div className='text-4xl mb-3'>🎯</div>
                                <p className='text-gray-900'>챌린지 참여</p>
                            </button>

                            <button
                                onClick={() => navigate('cert')}
                                className='bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100'
                            >
                                <div className='text-4xl mb-3'>📸</div>
                                <p className='text-gray-900'>활동 인증</p>
                            </button>

                            <button
                                onClick={() => navigate('mypage')}
                                className='bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100'
                            >
                                <div className='text-4xl mb-3'>👤</div>
                                <p className='text-gray-900'>내 프로필</p>
                            </button>
                        </div>
                    </div>

                    {/* Eco tip */}
                    <div>
                        <div className='bg-[#8BC34A] bg-opacity-10 rounded-2xl p-4 border-2 border-[#8BC34A] border-opacity-30'>
                            <div className='items-center gap-3'>
                                <div>
                                    <h3 className='text-gray-900 mb-2 font-semibold'>
                                        오늘의 에코 팁
                                    </h3>
                                    <p className='text-gray-600 text-sm'>
                                        제로웨이스트 스토어에서 쇼핑할 때 재사용
                                        가능한 장바구니를 가져가세요. 플라스틱
                                        쓰레기를 줄이고 추가 포인트를 받을 수
                                        있어요!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
