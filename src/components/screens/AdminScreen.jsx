import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab as setActiveTabAction } from '../../store/slices/appSlice';
import BadgeForm from '../badge/BadgeForm';
import ChallengeForm from '../challenge/ChallengeForm';
import ShopForm from '../shop/ShopForm';

const AdminScreen = ({ onNavigate }) => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('badge');

    const navigate = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTabAction(tab));
    };

    return (
        <>
            {/* 뒤로가기 버튼이 있는 헤더 */}
            <div className='w-full bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] py-6 text-white shadow-lg relative'>
                {/* 뒤로가기 버튼 */}
                <button
                    onClick={() => navigate('mypage')}
                    className='absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors'
                    aria-label='뒤로가기'
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={2.5}
                        stroke='currentColor'
                        className='w-6 h-6'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M15.75 19.5L8.25 12l7.5-7.5'
                        />
                    </svg>
                </button>

                {/* 제목 */}
                <div className='text-center px-16'>
                    <h1 className='text-2xl font-bold mb-1'>관리자 페이지</h1>
                    <p className='text-white text-opacity-90 text-sm'>
                        환영합니다 관리자님 👋
                    </p>
                </div>
            </div>

            <div className='p-4 max-w-lg mx-auto'>
                {/* 탭 네비게이션 */}
                <div className='relative mb-8 mt-6'>
                    <div className='bg-white rounded-2xl p-1.5 shadow-lg border border-gray-100 flex gap-1'>
                        <button
                            className={`relative flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ease-out ${
                                activeTab === 'badge'
                                    ? 'bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] text-white shadow-md transform scale-[1.02]'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                            onClick={() => setActiveTab('badge')}
                        >
                            <span className='relative z-10 flex items-center justify-center gap-2'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    strokeWidth={2}
                                    stroke='currentColor'
                                    className={`w-4 h-4 ${
                                        activeTab === 'badge'
                                            ? 'text-white'
                                            : 'text-gray-400'
                                    }`}
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                    />
                                </svg>
                                뱃지 추가
                            </span>
                        </button>
                        <button
                            className={`relative flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ease-out ${
                                activeTab === 'challenge'
                                    ? 'bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] text-white shadow-md transform scale-[1.02]'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                            onClick={() => setActiveTab('challenge')}
                        >
                            <span className='relative z-10 flex items-center justify-center gap-2'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    strokeWidth={2}
                                    stroke='currentColor'
                                    className={`w-4 h-4 ${
                                        activeTab === 'challenge'
                                            ? 'text-white'
                                            : 'text-gray-400'
                                    }`}
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z'
                                    />
                                </svg>
                                챌린지 추가
                            </span>
                        </button>
                        <button
                            className={`relative flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ease-out ${
                                activeTab === 'shop'
                                    ? 'bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] text-white shadow-md transform scale-[1.02]'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                            onClick={() => setActiveTab('shop')}
                        >
                            <span className='relative z-10 flex items-center justify-center gap-2'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    strokeWidth={2}
                                    stroke='currentColor'
                                    className={`w-4 h-4 ${
                                        activeTab === 'shop'
                                            ? 'text-white'
                                            : 'text-gray-400'
                                    }`}
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'
                                    />
                                </svg>
                                상품 추가
                            </span>
                        </button>
                    </div>
                </div>
                {activeTab === 'badge' ? (
                    <BadgeForm />
                ) : activeTab === 'challenge' ? (
                    <ChallengeForm />
                ) : (
                    <ShopForm />
                )}
            </div>
        </>
    );
};

export default AdminScreen;
