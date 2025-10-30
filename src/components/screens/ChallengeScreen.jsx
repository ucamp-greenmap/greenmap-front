import React from 'react';

const sampleChallenges = [
    {
        challenge_id: 1,
        challenge_name: '일주일 동안 따릉이 5회 이용하기',
        description: '대중교통 대신 따릉이를 이용해보세요',
        member_count: 150,
        point_amount: 100,
        success: 5,
        deadline: 3,
        created_at: '2023-10-01',
        is_active: true,
    },
    {
        challenge_id: 2,
        challenge_name: '재활용 10회 달성',
        description: '재활용 센터 자주 방문하기',
        member_count: 30,
        point_amount: 80,
        success: 10,
        deadline: 0,
        created_at: '2023-9-12',
        is_active: false, 
    },
    {
        challenge_id: 3,
        challenge_name: '재활용 5회 달성',
        descriptio: '전기차 12,000원 충전',
        description: '재활용 센터 자주 방문하기',
        member_count: 53,
        point_amount: 1000,
        success: 5,
        deadline: 10,
        created_at: '2023-9-30',
        is_active: true,
    },
    {
        challenge_id: 4,
        challenge_name: '전기차 12,000원 충전',
        description: '전기차 충전하면서 포인트도 적립하세요',
        member_count: 74,
        point_amount: 1000,
        success: 10,
        deadline: 10,
        created_at: '2023-10-05',
        is_active: true,
    },
];

const followedChallenges = [
    {
        member_challenge_id: 1,
        member_id: 1001,
        challenge_id: 1,
        process: 3,
        updated_at: '2023-10-10',
    },
    {
        member_challenge_id: 1,
        member_id: 1001,
        challenge_id: 2,
        process: 10,
        updated_at: '2023-10-11',
    },
    {
        member_challenge_id: 1,
        member_id: 1001,
        challenge_id: 4,
        process: 4,
        updated_at: '2023-10-12',
    },
]; // 참여하는 챌린지 목록


export default function ChallengeScreen() {
    const [filter, setFilter] = React.useState('ongoing');
    const [type, setType] = React.useState('ongoing');
    
    console.log('setFilter', setFilter);


    // sampleChallenges, followedChallenges 에 챌린지 대체.

    const mergedChallenges = React.useMemo(() => {
        return sampleChallenges.map(c => {
            const fc = followedChallenges.find(fc => fc.challenge_id === c.challenge_id);
            return {
                ...c,
                progress: fc ? fc.process : 0,
                updated_at: fc ? fc.updated_at : ''
            };
        });
    }, []);


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
                {mergedChallenges
                    .filter(c => {
                    if (filter === 'available') return c.is_active && !followedChallenges.map(fc => fc.challenge_id).includes(c.challenge_id);
 
                    if (filter === 'ongoing') return !c.completed && followedChallenges.map(fc => fc.challenge_id).includes(c.challenge_id) 
                        && !followedChallenges.map(fc => {
                        if (fc.challenge_id === c.challenge_id) {
                            if (c.progress === c.success) {
                                return fc.challenge_id;
                            }
                        }
                        return null;
                    }).includes(c.challenge_id);;
                    if (filter === 'completed') return followedChallenges.map(fc => {
                        if (fc.challenge_id === c.challenge_id) {
                            if (c.progress === c.success) {
                                return fc.challenge_id;
                            }
                        }
                        return null;
                    }).includes(c.challenge_id);
                    })
                    .map(c => (
                    <ChallengeCard key={c.challenge_id} filter={filter} {...c} />
                    ))
                }

            </div>
        </div>
    );
}




function ChallengeCard({filter, member_count, challenge_name, description, progress, success, point_amount, deadline, updated_at }) {
    
    return (
        <div className={`bg-white rounded-2xl p-4 shadow ${progress === success ? 'opacity-70' : ''}`}>
            <div className='flex items-start justify-between gap-3'>
                <div className='text-3xl'>
                    {challenge_name.includes('따릉이') ? '🚴' : ''}
                    {challenge_name.includes('전기차') ? '⚡' : ''}
                    {challenge_name.includes('재활용') ? '♻️' : ''}
                </div>
                
                
                <div className='flex-1'>
                    <div className='font-medium'>{challenge_name}</div>
                    <div className='text-xs text-gray-500'>{description}</div>
                    <div className='mt-2'>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                                className='bg-[#4CAF50] h-2 rounded-full'
                                style={{ width: `${(progress / success) * 100}%` }}
                            />
                        </div>
                        <div className='text-xs text-gray-600 mt-1'>
                             {filter === 'ongoing' ? `${progress}/${success} · ` : ''}
                            보상 {point_amount} P · D-{deadline}
                            {filter === 'available' ? ` · 참여인원 ${member_count}명` : ''}
                            {filter === 'completed' ? ` · 달성날자 ${updated_at}` : ''}
                        </div>
                    </div>
                </div>
                <div className='text-sm font-semibold text-[#4CAF50]'>
                    {progress === success ? '완료' : ''}
                </div>
            </div>
        </div>
    );
}

