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
        is_active: true,
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
        is_active: false, 
    },
    {
        id: 3,
        title: '재활용 5회 달성',
        descriptio: '전기차 12,000원 충전',
        description: '전기차 충전하는 김에 포인트도 받자',
        icon: '♻️',
        reward: 1000,
        progress: 0,
        total: 5,
        daysLeft: 10,
        completed: false,
        is_active: true,
    },
    {
        id: 4,
        title: '전기차 12,000원 충전',
        description: '전기차 충전하는 김에 포인트도 받자',
        icon: '⚡',
        reward: 1000,
        progress: 4,
        total: 10,
        daysLeft: 10,
        completed: false,
        is_active: true,
    },
];

const followedChallenges = [
    {
        member_challenge_id: 1,
        member_id: 1001,
        challenge_id: 1,
        process: 3,
    },
    {
        member_challenge_id: 1,
        member_id: 1001,
        challenge_id: 2,
        process: 10,
    },
    {
        member_challenge_id: 1,
        member_id: 1001,
        challenge_id: 4,
        process: 4,
    },
]; // 참여하는 챌린지 목록


export default function ChallengeScreen() {
    const [filter, setFilter] = React.useState('ongoing');

    // 모든 챌린지 목록 (sampleChallenges) 로 리애트 만들기
    // 참여중인 챌린지 목록 (followedChallenges)

    return (
        <div className='p-4'>
            {/* Header */}
            <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] px-6 py-8'>
                <h1 className='text-3xl font-bold text-white mb-2'>
                    챌린지
                </h1>
                <p className='text-white text-opacity-90 text-sm'>
                    친환경 활동을 인증하고 포인트를 받으세요
                </p>
            </div>


            <div className='bg-white rounded-2xl p-3 m-2 shadow text-center focus:outline-none'>
                <button onClick={() => setFilter('available')} className='text-gray-500 p-5'>참여가능</button>
                <button onClick={() => setFilter('ongoing')} className='text-gray-500 p-5'>진행중</button>
                <button onClick={() => setFilter('completed')} className='text-gray-500 p-5'>완료</button>
           
            </div>


            <div className='mt-3 space-y-3'>
                {sampleChallenges
                    .filter(c => {
                    if (filter === 'available') return c.is_active && !followedChallenges.map(fc => fc.challenge_id).includes(c.id);
 
                    //^^ 얘는 챌린지리스트에서 내가 신청한 리스트 제외하고 보이기
                    if (filter === 'ongoing') return !c.completed && followedChallenges.map(fc => fc.challenge_id).includes(c.id);
                    if (filter === 'completed') return c.completed;
                    })
                    .map(c => (
                    <ChallengeCard key={c.id} {...c} />
                    ))
                }


            </div>
        </div>
    );
}




function ChallengeCard({ icon, title, description, progress, total, reward, daysLeft, completed }) {
    return (
        <div className={`bg-white rounded-2xl p-4 shadow ${completed ? 'opacity-70' : ''}`}>
            <div className='flex items-start justify-between gap-3'>
                <div className='text-3xl'>{icon}</div>
                <div className='flex-1'>
                    <div className='font-medium'>{title}</div>
                    <div className='text-xs text-gray-500'>{description}</div>
                    <div className='mt-2'>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                                className='bg-[#4CAF50] h-2 rounded-full'
                                style={{ width: `${(progress / total) * 100}%` }}
                            />
                        </div>
                        <div className='text-xs text-gray-600 mt-1'>
                            {progress}/{total} · 보상 {reward} P · D-{daysLeft}
                        </div>
                    </div>
                </div>
                <div className='text-sm font-semibold text-[#4CAF50]'>
                    {completed ? '완료' : ''}
                </div>
            </div>
        </div>
    );
}

