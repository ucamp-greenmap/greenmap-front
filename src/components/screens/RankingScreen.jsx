import React from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';

const top10 = [
    { rank: 1, name: '친환경왕', points: 5280, carbonReduction: 125.8 },
    { rank: 2, name: '그린러', points: 4210, carbonReduction: 98.3 },
    { rank: 3, name: '에코스타', points: 3980, carbonReduction: 86.4 },
    { rank: 4, name: '제로영웅', points: 3210, carbonReduction: 72.1 },
    { rank: 5, name: '그린피플', points: 2980, carbonReduction: 65.9 },
    { rank: 6, name: '클린러너', points: 2650, carbonReduction: 58.3 },
    { rank: 7, name: '리사이클러', points: 2410, carbonReduction: 51.2 },
    { rank: 8, name: '바이크러', points: 1980, carbonReduction: 44.7 },
    { rank: 9, name: '에코버디', points: 1720, carbonReduction: 39.5 },
    { rank: 10, name: '그린뉴비', points: 1500, carbonReduction: 34.0 },
];

export default function RankingScreen({ onNavigate }) {
    const dispatch = useDispatch();

    const navigate = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTab(tab));
    };

    const medalFor = (rank) => {
        if (rank === 1)
            return {
                bg: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
                icon: '🥇',
            };
        if (rank === 2)
            return {
                bg: 'bg-gradient-to-br from-gray-200 to-gray-300',
                icon: '🥈',
            };
        if (rank === 3)
            return {
                bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
                icon: '🥉',
            };
        return { bg: 'bg-gray-200', icon: null };
    };

    return (
        <div className='p-4'>
            <div className='flex items-center gap-3 mb-4'>
                <button
                    onClick={() => navigate('home')}
                    aria-label='뒤로가기'
                    title='뒤로'
                    className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm text-sm text-gray-700 hover:bg-gray-50'
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth='2'
                        aria-hidden
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M15 19l-7-7 7-7'
                        />
                    </svg>
                    <span className='hidden sm:inline'>뒤로</span>
                </button>
                <h2 className='text-lg font-bold'>랭킹</h2>
            </div>

            <div className='mt-2 space-y-3'>
                {top10.map((t) => {
                    const medal = medalFor(t.rank);
                    return (
                        <div
                            key={t.rank}
                            className='bg-white rounded-2xl p-3 shadow flex items-center justify-between'
                        >
                            <div className='flex items-center gap-3'>
                                <div
                                    className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold ${
                                        medal.bg
                                    } ${
                                        t.rank <= 3
                                            ? 'text-white shadow-md'
                                            : 'text-gray-700'
                                    }`}
                                >
                                    {medal.icon ? (
                                        <span className='text-xl' aria-hidden>
                                            {medal.icon}
                                        </span>
                                    ) : (
                                        <span className='text-sm'>
                                            {t.rank}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <div className='font-medium'>{t.name}</div>
                                    <div className='text-xs text-gray-500'>
                                        탄소 감축 {t.carbonReduction}kg
                                    </div>
                                </div>
                            </div>
                            <div className='font-semibold'>{t.points}P</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
