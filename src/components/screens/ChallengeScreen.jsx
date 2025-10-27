import React from 'react';

const sampleChallenges = [
    {
        id: 1,
        title: '일주일 동안 따릉이 5회 이용하기',
        description: '대중교통 대신 따릉이를 이용해보세요',
        icon: '🚴',
        reward: 100,
        progress: 3,
        total: 5,
        daysLeft: 3,
        completed: false,
    },
    {
        id: 2,
        title: '재활용 10회 달성',
        description: '재활용 센터 자주 방문하기',
        icon: '♻️',
        reward: 80,
        progress: 10,
        total: 10,
        daysLeft: 0,
        completed: true,
    },
];

export default function ChallengeScreen() {
    return (
        <div className='p-4'>
            <h2 className='text-lg font-bold'>이번 주 챌린지</h2>
            <div className='mt-3 space-y-3'>
                {sampleChallenges.map((c) => (
                    <div
                        key={c.id}
                        className={`bg-white rounded-2xl p-4 shadow ${
                            c.completed ? 'opacity-70' : ''
                        }`}
                    >
                        <div className='flex items-start justify-between gap-3'>
                            <div className='text-3xl'>{c.icon}</div>
                            <div className='flex-1'>
                                <div className='font-medium'>{c.title}</div>
                                <div className='text-xs text-gray-500'>
                                    {c.description}
                                </div>
                                <div className='mt-2'>
                                    <div className='w-full bg-gray-200 rounded-full h-2'>
                                        <div
                                            className='bg-[#4CAF50] h-2 rounded-full'
                                            style={{
                                                width: `${
                                                    (c.progress / c.total) * 100
                                                }%`,
                                            }}
                                        />
                                    </div>
                                    <div className='text-xs text-gray-600 mt-1'>
                                        {c.progress}/{c.total} · 보상 {c.reward}
                                        P · D-{c.daysLeft}
                                    </div>
                                </div>
                            </div>
                            <div className='text-sm font-semibold text-[#4CAF50]'>
                                {c.completed ? '완료' : ''}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
