import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';
import api from '../../api/axios';

export default function AddChallengeScreen({ onNavigate }) {
  const dispatch = useDispatch();

  const navigate = (tab) => {
    if (typeof onNavigate === 'function') return onNavigate(tab);
    dispatch(setActiveTab(tab));
  };



    const handleAddChallenge = async () => {
        console.log("추가 버튼 클릭");
        const token = localStorage.getItem('token'); 

        const challengeName = document.getElementById('challengeName').value;
        const description = document.getElementById('description').value;
        const memberCount = document.getElementById('memberCount').value;
        const success = document.getElementById('success').value;
        const pointAmount = document.getElementById('pointAmount').value;
        const deadline = document.getElementById('deadline').value;

        if (challengeName === '' || description === '' || memberCount === '' ||
             success === '' || pointAmount === '' || deadline === ''
         ) {
            alert('비어있는 칸이 있습니다. 칸을 모두 채워주세요');
            return;
        }
        
        const data = {
            challengeName: challengeName,
            description: description,
            memberCount: memberCount,
            success: success,
            pointAmount: pointAmount,
            deadline: deadline
        };

        try {
            const res = await api.post("/chalregis", data, {
            headers: { Authorization: `Bearer ${token}` }
            });
            console.log("챌린지 추가 응답:", res.data);
            navigate('challenge')
        } catch (err) {
            console.error("챌린지 추가 실패", err.response || err);
            alert('챌린지 추가 실패');
        }

    };




  return (
    <>
      <div className="w-full bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] py-10 text-center text-white mb-10 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">챌린지 추가</h1>
        <p className="text-white text-opacity-90 text-sm">
          환영합니다 관리자님 👋 추가할 챌린지를 작성해 주세요.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-8 space-y-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">챌린지 작성</h2>

        <form className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">챌린지명</label>
            <input
              type="text"
              maxLength="16"
              required
              id="challengeName"
              placeholder="따릉이 5km 타기"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">설명</label>
            <input
              type="text"
              maxLength="32"
              required
              id="description"
              placeholder="따릉이를 타고 인증을 통해 누적 5km를 채워보세요"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">시작 인원수</label>
            <input
              type="number"
              id="memberCount"
              required
              readOnly
              defaultValue="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">성공 조건</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                id="success"
                required
                defaultValue="10"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <span className="text-gray-600">번 / km / 원</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">지급 포인트</label>
            <input
              type="number"
              id="pointAmount"
              defaultValue="100"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">기한</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                id="deadline"
                required
                defaultValue="7"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <span className="text-gray-600">일</span>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={handleAddChallenge}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-md shadow-md transition"
            >
              추가하기
            </button>
          </div>
        </form>
      </div>
    </>
  );
}


