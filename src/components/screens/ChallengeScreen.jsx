import React from 'react';


// 챌린지 데이터 받는거 필요한거 얘기 하기.
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


 // 참여하는 챌린지 목록
const followedChallenges = [
    {
        member_id: 1001,
        challenge_id: 1,
        process: 3,
        updated_at: '2023-10-10',
    },
    {
        member_id: 1001,
        challenge_id: 2,
        process: 10,
        updated_at: '2023-10-11',
    },
    {
        member_id: 1001,
        challenge_id: 4,
        process: 4,
        updated_at: '2023-10-12',
    },
];




export default function ChallengeScreen() {
    const [filter, setFilter] = React.useState('ongoing');
   




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
    <>
    <div className="w-full bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] py-10 text-center text-white mb-8 shadow-md">
      <h1 className="text-3xl font-bold text-white mb-2">챌린지</h1>
      <p className="text-white text-opacity-90 text-sm">
        친환경 활동을 인증하고 포인트를 받으세요 🌱
      </p>
    </div>


    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-gray-100 rounded-2xl p-3 mb-6 flex justify-center space-x-4 shadow">
        {['available','ongoing','completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              filter === f ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:text-green-600'
            }`}
          >
            {f === 'available' ? '참여가능' : f === 'ongoing' ? '진행중' : '완료'}
          </button>
        ))}
      </div>


      <div className="w-full max-w-3xl space-y-4">
        {mergedChallenges
          .filter(c => {
            if (filter === 'available') return c.is_active && !followedChallenges.map(fc => fc.challenge_id).includes(c.challenge_id);
            if (filter === 'ongoing') return !c.completed && followedChallenges.map(fc => fc.challenge_id).includes(c.challenge_id)
              && !followedChallenges.map(fc => {if(fc.challenge_id===c.challenge_id){if(c.progress===c.success){return fc.challenge_id}} return null}).includes(c.challenge_id);
            if (filter === 'completed') return followedChallenges.map(fc => {if(fc.challenge_id===c.challenge_id){if(c.progress===c.success){return fc.challenge_id}} return null}).includes(c.challenge_id);
          })
          .map(c => (
            <ChallengeCard key={c.challenge_id} filter={filter} {...c} />
          ))
        }
      </div>
    </div>


    </>


    );
}






function ChallengeCard({ challenge_id, challenge_name, description, point_amount, progress, success, created_at, deadline, image_url, filter }) {
  const ticketHeight = 160; //


  return (
<div className="flex items-center mb-6">
      <div
        className="flex bg-white rounded-2xl shadow overflow-hidden flex-1 relative"
        style={{ height: `${ticketHeight}px` }}
      >
        <div className="w-1/3 relative h-full">
          <img
            src={image_url || "https://th.bing.com/th/id/OIP.SG7Qb8nwstq9qogVhNt7KAHaE8?w=230&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3"}
            alt={challenge_name}
            className="h-full w-full object-cover rounded-l-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white rounded-l-2xl"></div>
        </div>


        <div className="flex-1 p-4 flex flex-col justify-between h-full">
          <h3 className="text-2xl font-bold text-gray-800 text-center">{challenge_name}</h3>
          <p className="text-sm text-gray-500 mt-1 text-right">{description}</p>


          {filter === 'ongoing' && (
            <div className="w-full mt-2 flex flex-col items-center">
              <div className="w-full bg-gray-200 h-3 rounded-full">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${Math.min((progress / success) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center w-full">
                {progress} / {success}
              </div>
            </div>
          )}


          <div className="flex justify-center gap-4 mt-3 text-sm text-gray-600">
            <span>포인트: {point_amount}</span>
            <span>달성: {success}번</span>
            <span>기한: {deadline}일</span>
          </div>
        </div>
      </div>


      <div className="ml-0 relative flex flex-col items-center justify-center" style={{ height: `${ticketHeight}px`, width: '6rem' }}>
       
        {filter === 'completed' && (
          <div className="relative w-full h-full flex items-center justify-center mb-2">
            <img
              src="src/assets/stamp.png"
              alt="도장"
              className="w-full h-full object-contain rotate-90"
              style={{ filter: 'brightness(0) saturate(100%) invert(14%) sepia(56%) saturate(4000%) hue-rotate(345deg) brightness(95%) contrast(100%)' }}
            />
            <span
              className="absolute text-xs font-bold"
              style={{ color: '#7B1113' }}
            >
              {created_at}
            </span>
          </div>
        )}


        {filter !== 'completed' && (
          <button className="relative flex flex-col items-center justify-center bg-green-600 text-white rounded-l-2xl h-full w-full px-0">
            <div hidden id={challenge_id}></div>
            <span className="text-sm font-medium">
              {filter === 'available' ? '참여' : '인증'}
            </span>
          </button>
        )}
      </div>

    </div>
  );
}







