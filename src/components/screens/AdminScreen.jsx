import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';
import BadgeForm from '../badge/BadgeForm';
import ChallengeForm from '../challenge/ChallengeForm';

const AdminScreen = ({ onNavigate }) => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('badge');

    const navigate = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTab(tab));
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
                <div className='flex gap-2 mb-6 mt-4'>
                    <button
                        className={`px-4 py-2 rounded ${
                            activeTab === 'badge'
                                ? 'bg-primary text-white'
                                : 'bg-gray-200'
                        }`}
                        onClick={() => setActiveTab('badge')}
                    >
                        뱃지 추가
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${
                            activeTab === 'challenge'
                                ? 'bg-primary text-white'
                                : 'bg-gray-200'
                        }`}
                        onClick={() => setActiveTab('challenge')}
                    >
                        챌린지 추가
                    </button>
                </div>
                {activeTab === 'badge' ? <BadgeForm /> : <ChallengeForm />}
            </div>
        </>
    );
};

export default AdminScreen;
