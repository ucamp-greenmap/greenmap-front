
//전달해야하는 거
// {
//     "challengeName": "대중교통이용하기",
//     "description":"주3회 대중교통 이용하기",
//     "memberCount": 0,
//     "success":3,
//     "pointAmount": 30,
//     "deadline" : 7
// }
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';

export default function AddCallengScreen({ onNavigate }) {
    const dispatch = useDispatch();

    const navigate = (tab) => {
      if (typeof onNavigate === 'function') return onNavigate(tab);
      dispatch(setActiveTab(tab));
    };

    // 버튼 클릭시 post 보내기

    return (
        <>
        <div className="w-full bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] py-10 text-center text-white mb-8 shadow-md">
            <h1 className="text-3xl font-bold text-white mb-2">챌린지 추가</h1>
            <p className="text-white text-opacity-90 text-sm">
                환영합니다 관리자님. 추가할 챌린지를 작성해 주세요.
            </p>
        </div>
        
        <div>
            <div>챌린지 작성</div>
            <div>
                <label>
                    <span>챌린리명 </span>
                    <input type='text' maxLength="16" id='challengeName' placeholder='따릉이 5km 타기'></input>
                </label>
                <label>
                    <span>설명 </span>
                    <input type='text' maxLength="32" id='description' placeholder='따릉이를 타고 인증을 통해 누적 5km를 채워보세요'></input>
                </label>
                <label>
                    <span>시작인원수 </span>
                    <input type='number' id='memberCount' defaultValue='0'></input>
                </label>
                <label>
                    <span>성공조건 </span>
                    <input type='number' minLength="1" id='success' placeholder='10'></input>
                    <span>번 / km / 원</span>
                </label>
                <label>
                    <span>지급포인트 </span>
                    <input type='number' minLength="2" id='pointAmount' defaultValue='100'></input>
                </label>
                <label>
                    <span>기한 </span>
                    <input type='number' minLength="1" id='deadline' defaultValue='7'></input>
                    <span>일</span>
                </label>
            </div>

            <button onClick={() => console.log("추가하기")}>추가하기</button>
        </div>
        </>
    )

}