import React from 'react';

const badges = [
    {
        id: 1,
        name: '첫걸음',
        icon: '🌱',
        earned: true,
        earnedDate: '2024-10-15',
    },
    {
        id: 5,
        name: '제로웨이스트 영웅',
        icon: '🛍️',
        earned: false,
        progress: '8/15',
    },
];

export default function BadgeScreen() {
    return (
        <div className='p-4'>
            <h2 className='text-lg font-bold'>뱃지 컬렉션</h2>
            <div className='mt-3 grid grid-cols-2 gap-3'>
                {badges.map((b) => (
                    <div
                        key={b.id}
                        className={`bg-white rounded-2xl p-4 shadow text-center ${
                            b.earned ? '' : 'opacity-60'
                        }`}
                    >
                        <div className='text-3xl'>{b.icon}</div>
                        <div className='font-medium mt-2'>{b.name}</div>
                        <div className='text-xs text-gray-500 mt-1'>
                            {b.earned
                                ? `획득: ${b.earnedDate}`
                                : `진행: ${b.progress}`}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
