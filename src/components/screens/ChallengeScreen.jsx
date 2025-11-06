import React, { useState } from 'react';
import api from '../../api/axios';
import CertModal from '../cert/CertModal';
import { certTypes } from '../../util/certConfig';


export default function ChallengeScreen({ onNavigate }) {
  const [filter, setFilter] = React.useState('ongoing');

  const [available, setAvailable] = React.useState([]);
  const [end, setEnd] = React.useState([]);
  const [attend, setAttend] = React.useState([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);




  React.useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const fetchData = async () => {
        api.get("/chal/attend", {
              headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
              console.log("정보 응답:", res.data.data.challenges);
              console.log("정보 응답:", res.data.data.challenges.memberChallengeId);

              setAttend(res.data.data.challenges);


        })
        .catch((err) => {
              console.error("참여중인 챌린지 정보 조회 실패", err.response || err);
              setError("회원 정보를 가져오는데 실패했습니다.");
        });


        api.get("/chal/available", {
              headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
              console.log("정보 응답:", res.data.data.availableChallenges);
              setAvailable(res.data.data.availableChallenges);


        })
        .catch((err) => {
              console.error("참여가능한 챌린지 정보 조회 실패", err.response || err);
              setError("회원 정보를 가져오는데 실패했습니다.");
        });


        api.get("/chal/end", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
            console.log("정보 응답:", res.data.data.challenges);
            setEnd(res.data.data.challenges);
        })
        .catch((err) => {
            console.error("완료한 챌린지 정보 조회 실패", err.response || err);
            setError("회원 정보를 가져오는데 실패했습니다.");
        });
      }

      fetchData();
  }, []);


    // if (loading) return <div className="p-10 text-center m-72 text-gray-500">로딩 중 ...</div>;
    // if (error) return <div className="p-10 text-center m-72 text-gray-500">{error}</div>;
   
  const handleChallengeParticipated = (challengeId) => {
      setAttend((prevAttend) => [
          ...prevAttend,
          available.find(challenge => challenge.challengeId === challengeId)
      ]);
      setAvailable((prevAvailable) =>
          prevAvailable.filter(challenge => challenge.challengeId !== challengeId)
      );
  };




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
     
      {
        filter === 'available' && available.map(c => (
          <ChallengeCard key={c.challengeId} filter={filter} {...c} onChall={handleChallengeParticipated} onNavigate={onNavigate} />
        ))
      }
              {
        filter === 'ongoing' && attend.map(c => (
          <ChallengeCard key={c.challengeId} filter={filter} {...c} onChall={handleChallengeParticipated} onNavigate={onNavigate} />
        ))
      }
              {
        filter === 'completed' && end.map(c => (
          <ChallengeCard key={c.challengeId} filter={filter} {...c} onChall={handleChallengeParticipated} onNavigate={onNavigate} />
        ))
      }
    </div>
  </div>
  </>




  );
}












function ChallengeCard({ challengeId, memberChallengeId, challengeName, description, pointAmount, progress, success, createdAt, deadline, image_url, filter, onChall}) {
  const ticketHeight = 160; //

  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  

  const handleChallenge = () => {
    const token = localStorage.getItem("token");


    api.post("/chal",
      {
        challengeId: challengeId,
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
          console.log("챌린지 참여 응답:", res.data);
          onChall(challengeId);
      })
      .catch((err) => {
          console.error("챌린지 참여 실패", err.response || err);
    });
  };


  function determineType(challengeName) {
    const sanitizedChallengeName = challengeName.toLowerCase().replace(/\s+/g, '');

    let type = null;

    if (sanitizedChallengeName.includes('따릉이') || sanitizedChallengeName.includes('bike')) {
      type = certTypes.find((type) => type.label === '따릉이 이용 인증');
    }
    else if (sanitizedChallengeName.includes('전기차') || sanitizedChallengeName.includes('수소차')
    || sanitizedChallengeName.includes('electric') || sanitizedChallengeName.includes('hydrogen')) {
      type = certTypes.find((type) => type.label === '전기차/수소차 충전 영수증');
    }
    else if (sanitizedChallengeName.includes('제로') || sanitizedChallengeName.includes('zero')) {
      type = certTypes.find((type) => type.label === '제로웨이스트 스토어 / 재활용센터 영수증');
    }
    else if (sanitizedChallengeName.includes('재활용') || sanitizedChallengeName.includes('recycle')) {
      type = certTypes.find((type) => type.label === '제로웨이스트 스토어 / 재활용센터 영수증');
    }

    if (!type) {
      return null;
    }

    // 인증 타입이 정해지면 추가적인 키워드 설정
    const result = {
      id: type.id,
      keywords: type.keywords || [],
      zeroKeywords: type.zeroKeywords || [],
      recycleKeywords: type.recycleKeywords || [],
    };

    if (sanitizedChallengeName.includes("제로")) {
      result.zeroKeywords = type.zeroKeywords;
    }
    else if (sanitizedChallengeName.includes("재활용")) {
      result.recycleKeywords = type.recycleKeywords;
    }

    return result;
  }





    // 인증 모달 열기
  function openCertModal() {
      const type = determineType(challengeName); 
      if (type) {
          setSelectedType(type); 
          setShowModal(true); 
      } else {
          alert("해당하는 인증 타입을 찾을 수 없습니다.");
      }
  }

  function closeModal() {
    setShowModal(false);
    setSelectedType(null);
  }







  return (
    <div className="flex items-center mb-6">
      <div
        className="flex bg-white rounded-2xl shadow overflow-hidden flex-1 relative"
        style={{ height: `${ticketHeight}px` }}
      >
        <div className="w-1/3 relative h-full">
          <img
            src={image_url || "https://th.bing.com/th/id/OIP.SG7Qb8nwstq9qogVhNt7KAHaE8?w=230&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3"}
            alt={challengeName}
            className="h-full w-full object-cover rounded-l-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white rounded-l-2xl"></div>
        </div>




        <div className="flex-1 p-4 flex flex-col justify-between h-full">
          <h3 className="text-2xl font-bold text-gray-800 text-center">{challengeName}</h3>
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
            <span>포인트: {pointAmount}</span>
            <span>달성: {success}번</span>
            <span>기한: {deadline}일</span>
          </div>
        </div>
      </div>




      <div className="ml-0 relative flex flex-col items-center justify-center" style={{ height: `${ticketHeight}px`, width: '6rem' }}>
       
        {filter === 'completed' && (
          <div className="relative w-full h-full flex items-center justify-center mb-2">
            <img
              src="src/assets/Stamp.png"
              alt="도장"
              className="w-full h-full object-contain rotate-90"
              style={{ filter: 'brightness(0) saturate(100%) invert(14%) sepia(56%) saturate(4000%) hue-rotate(345deg) brightness(95%) contrast(100%)' }}
            />
            <span
              className="absolute text-xs font-bold"
              style={{ color: '#7B1113' }}
            >
              {createdAt}
            </span>
          </div>
        )}


        {filter !== 'completed' && (
          <button
            onClick={filter === 'available' ? handleChallenge : () => openCertModal(selectedType)}
            className="relative flex flex-col items-center justify-center bg-gradient-to-br from-[#8BC34A] to-[#4CAF50] text-white rounded-l-2xl h-full w-full px-0"
          >
            <div hidden id={challengeId}></div>
            <span className="text-sm font-medium">
              {filter === 'available' ? '참여' : '인증'}
            </span>
          </button>
        )}
      </div>


      {showModal && selectedType && (
          <CertModal type={selectedType} onClose={closeModal} />
      )}

      
    </div>
  );
}




