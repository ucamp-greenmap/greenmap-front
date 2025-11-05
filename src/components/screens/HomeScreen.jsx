import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';
import { fetchPointInfo } from '../../store/slices/userSlice';
import EcoNewsList from '../screens/EcoNewsList';
import { TrophyIcon } from '@heroicons/react/24/solid';
import { useMemo } from 'react';

const ECO_TIPS = [
    {
        icon: '🛍️',
        title: '제로웨이스트 쇼핑 팁',
        content:
            '제로웨이스트 스토어에서 쇼핑할 때 재사용 가능한 장바구니를 가져가세요. 플라스틱 쓰레기를 줄이고 포인트를 받을 수 있어요',
    },
    {
        icon: '☕',
        title: '텀블러 사용 습관',
        content:
            '일회용 컵 대신 개인 텀블러를 가지고 다니며 커피나 음료를 테이크아웃하세요. 많은 카페에서 할인 혜택을 제공하며, 지구를 위한 작은 실천이 됩니다.',
    },
    {
        icon: '⚡',
        title: '대기 전력 차단',
        content:
            '사용하지 않는 전자제품의 플러그를 뽑거나 멀티탭 스위치를 끄는 습관을 들이세요. 대기 전력 차단으로 전기 요금을 절약하고 탄소 배출을 줄일 수 있습니다.',
    },
    {
        icon: '🚲',
        title: '그린맵 교통 활용',
        content:
            '그린맵에서 따릉이 지도를 활용해 탄소 배출 없는 경로를 찾아보세요. 자동차 대신 대중교통이나 자전거, 걷기를 이용하면 환경과 건강에 모두 이롭습니다.',
    },
];

export default function HomeScreen({ onNavigate }) {
    const dispatch = useDispatch();

    // Redux에서 상태 가져오기
    const { isLoggedIn, profile, stats, loading } = useSelector((s) => s.user);

    // 🔄 처음 화면 열릴 때 사용자 정보 가져오기
    useEffect(() => {
        dispatch(fetchPointInfo());
    }, [dispatch]);

    const randomTip = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * ECO_TIPS.length);
        return ECO_TIPS[randomIndex];
    }, []);

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
                        placeholder='지도 검색...'
                        className='w-full pl-12 pr-4 py-4 rounded-[30px] text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-lg'
                        aria-label='지도 검색'
                    />
                    <div className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                        🔍
                    </div>
                </div>
            </div>

            {/* Page content */}
            <div className='px-4'>
                {/* ⏳ 로딩 중 */}
                {loading && (
                    <div className='mt-4 bg-white rounded-3xl p-6 text-center shadow-xl'>
                        <p className='text-gray-600'>정보를 불러오는 중...</p>
                    </div>
                )}

                {/* 🔒 로그인 안 됨 */}
                {!loading && !isLoggedIn && (
                    <div className='mt-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-6 text-center shadow-xl'>
                        <div className='text-5xl mb-4'>🔒</div>
                        <h3 className='text-gray-900 text-xl font-bold mb-2'>
                            로그인이 필요해요
                        </h3>
                        <p className='text-gray-600 mb-4'>
                            그린 포인트와 활동 내역을 확인하려면 로그인해주세요
                        </p>
                        <button
                            onClick={() => navigate('login')}
                            className='bg-[#4CAF50] text-white px-6 py-3 rounded-[20px] hover:bg-[#45a049]'
                        >
                            로그인하러 가기
                        </button>
                    </div>
                )}

                {/* ✅ 로그인 됨 - 포인트 카드 */}
                {!loading && isLoggedIn && (
                    <div className='mt-4'>
                        <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] rounded-3xl p-6 text-white shadow-xl border-0'>
                            {/* 사용자 이름 표시 */}
                            <div className='flex items-center gap-2 mb-4'>
                                {profile.avatar && (
                                    <img
                                        src={profile.avatar}
                                        alt='프로필'
                                        className='w-10 h-10 rounded-full'
                                    />
                                )}
                                <p className='text-white/90 text-sm'>
                                    {profile.nickname || profile.name}님의 그린
                                    활동
                                </p>
                            </div>

                            <div className='flex items-center justify-between mb-4'>
                                <div>
                                    <p className='text-white/90 mb-1'>
                                        나의 그린 포인트
                                    </p>
                                    <div className='flex items-baseline gap-2'>
                                        <span className='text-4xl font-bold'>
                                            {stats.point}
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
                                    {stats.rank && (
                                        <span className='text-white/90 text-sm'>
                                            🏆 {stats.rank}위
                                        </span>
                                    )}
                                </div>
                                <div className='flex items-baseline gap-2'>
                                    <span className='text-2xl font-semibold'>
                                        {stats.carbonReduction}
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
                )}

                {/* Sections */}
                <div className='mt-6 space-y-6'>
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
                                        {randomTip.title}: {randomTip.content}
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
