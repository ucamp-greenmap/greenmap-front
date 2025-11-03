import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';
import axios from 'axios';


const badgesList = [
    {
    "name" : "친환경 한걸음",
    "wholePoint" : 1800, // 누적 포인트
    "currentPoint" : 0, // 다음 단계 포인트 기준 X >>>!! 현재단계 포인트 기준
    "description" : "GreenMap을 통한 친환경 활동의 시작을 기념하는 뱃지",
    "image_url" : String,
    "created_at" : "2025-10-22", // null 가능
    "badge_count" : 1,
    "total_badge" : 5,
    },
    {
    "name" : "친환경 활동가",
    "wholePoint" : 1800,
    "currentPoint" : 1000,
    "description" : "포인트를 1000 모은 친환경 활동가를 기념하는 뱃지",
    "image_url" : String,
    "created_at" : "2025-11-01",
    "badge_count" : 2,
    "total_badge" : 5,
    },
    {
    "name" : "환경 전사",
    "wholePoint" : 1800,
    "currentPoint" : 2000,
    "description" : "포인트를 2000 모은 친환경 전사를 기념하는 뱃지",
    "image_url" : String,
    "created_at" : null,
    "badge_count" : 3,
    "total_badge" : 5,
    },
]


export default function BadgeScreen({onNavigate}) {
    const dispatch = useDispatch();
    const [filter, setFilter] = useState('all');

    
    
    // 뱃지 정보 가져오기. 
    const [badges, setBadges] = useState([]); // badgesList 말고 badges 넣어서 돌리기.

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const response = await axios.get('/badge');
                setBadges(response.data);

                console.log("회원의 뱃지 리스트 - ", badges); // 이후 삭제
            } catch (error) {
                console.log('Error fetching data: ', error);
            }
        };
        fetchBadges();
    }, []);
    // --뱃지 정보


    const navigate = (tab) => {
      if (typeof onNavigate === 'function') return onNavigate(tab);
      dispatch(setActiveTab(tab));
    };


    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        <div className="w-full bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] py-10 text-center text-white mb-8 shadow-md">
          <h1 className="text-3xl font-bold mb-2">뱃지 컬렉션</h1>
          <p className="text-white text-opacity-90 text-sm">
            GreenMap을 이용하고 뱃지를 수집해 보세요 🌱
          </p>
        </div>
        <div className="w-full max-w-3xl  rounded-2xl p-6">
          <div className="bg-white rounded-xl shadow p-5 mb-6 flex items-center justify-between">
           
          {(() => {
              const latestBadge = badgesList
                .filter(b => b.created_at)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];


              return latestBadge ? (
                <div className="flex justify-center">
                  <div className=" rounded-2xl flex items-center space-x-4 w-auto">
                    <img
                      src={latestBadge.image_url || '/default_badge.png'}
                      alt={latestBadge.name}
                      className="w-16 h-16 rounded-full border-2 border-green-400 object-cover"
                    />
                    <div className="text-left">
                      <span className="block text-lg font-semibold text-gray-800">
                        {latestBadge.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {latestBadge.description}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
           
            <button onClick={() => navigate('mypage')}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition shadow-sm">
              마이페이지로
            </button>
          </div>


          <div className="bg-gray-200 rounded-2xl p-3 mb-4  flex justify-center space-x-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('acquired')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === 'acquired'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              획득
            </button>
            <button
              onClick={() => setFilter('notAcquired')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === 'notAcquired'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              미획득
            </button>
          </div>


          <div className="grid grid-cols-4 gap-4 mt-4">
            {badgesList
              .filter(badge => {
                if (filter === 'all') return true;
                if (filter === 'acquired') return badge.created_at !== null;
                if (filter === 'notAcquired') return badge.created_at === null;
                return true;
              })
              .map(badge => (
                <BadgeCard key={badge.name} filter={filter} {...badge} />
              ))}
          </div>


          {(() => {
              const latestBadge = badgesList
                .filter(b => b.created_at)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

              return latestBadge ? (
                <div className="flex justify-center p-3">
                  <div className=" rounded-2xl flex items-center space-x-4 w-auto">
                    <div className="text-left">
                      <span className="block text-lg font-semibold text-gray-800">
                        {latestBadge.badge_count} / {latestBadge.total_badge}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}


        </div>
        <div className=' text-sm text-gray-500 pb-32 text-center'>그린맵 v1.0.0</div>
      </div>




    );
}



function BadgeCard({ name, wholePoint, currentPoint, description, image_url, created_at }) {
  // 프론트에서 보여줄 '완료' 상태 — 실제로는 created_at이 생기면 진짜 완료로 간주됨
  const isCompleted = wholePoint >= currentPoint;

  return (
    <div
      className={`relative bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center text-center ${
        !isCompleted && !created_at ? 'opacity-70' : ''
      }`}
    >
      {isCompleted && (
        <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
          완료
        </span>
      )}

      <img
        src={image_url || '/default-badge.png'}
        alt={name}
        className="w-20 h-20 object-cover rounded-full border-2 border-green-400 mb-2"
      />

      {/* 진행 바 */}
      <div className="w-full bg-gray-200 h-3 rounded-full">
        <div
          className="bg-green-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${Math.min((wholePoint / currentPoint) * 100, 100)}%` }}
        ></div>
      </div>

      <div className="text-sm text-gray-500 mb-2">
        {isCompleted ? currentPoint : `${wholePoint} / ${currentPoint}`}
      </div>

      <div className="font-semibold text-gray-800">{name}</div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>

      {/* created_at은 실제로 백엔드에서 완료 처리될 때 표시됨 */}
      {created_at && (
        <div className="text-xs text-green-600 mt-2">
          {new Date(created_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}


