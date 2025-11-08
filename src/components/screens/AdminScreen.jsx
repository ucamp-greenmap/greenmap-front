import React, { useState } from 'react';
import BadgeForm from '../badge/BadgeForm';
import ChallengeForm from '../challenge/ChallengeForm';

const AdminScreen = () => {
    const [activeTab, setActiveTab] = useState('badge');

    return (
        <div className='p-4 max-w-lg mx-auto'>
            <h1 className='text-2xl font-bold mb-4'>관리자 페이지</h1>
            <div className='flex gap-2 mb-6'>
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
    );
};

export default AdminScreen;
