import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';


export default function LoginScreen({ onNavigate }) {
    const dispatch = useDispatch();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showSetting, setShowSetting] = useState(false);

    const navigate = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTab(tab));
    };


    function logoutUser() {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
    }


    // 카카오 로그인 버튼 클릭
    const kakaoLogin = () => {
        window.location.href = 'http://34.50.38.218/oauth2/authorization/kakao';
    }; 
    // http://localhost:8080/oauth2/authorization/kakao'; 배포용 링크로 교체
    // https://greenmap-api-1096735261131.asia-northeast3.run.app/oauth2/authorization/kakao';
    // http://34.50.38.218:8080/oauth2/authorization/kakao
   
    useEffect(() => {
    console.log("LoginScreen useEffect 실행됨");

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        setIsLoggedIn(true);
        console.log("저장된 토큰으로 로그인 상태 유지:", storedToken);
    }
    }, []);

   
    return (
        <>
        <div className='bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] rounded-2xl p-4 text-white'>
                계정 관리
        </div>
        <div className='m-5'>
            <button
                onClick={() => navigate('mypage')}
                aria-label='뒤로가기'
                title='뒤로'
                className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm text-sm text-gray-700 hover:bg-gray-50'
            >
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth='2'
                    aria-hidden
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M15 19l-7-7 7-7'
                    />
                </svg>
                <span className='p-4 text-center focus:outline-none'>마이페이지 돌아가기</span>
            </button>
        </div>
        <div id='loginBox' className='p-4 space-y-4'>
               
            <div className="flex justify-center">
            <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
                {!isLoggedIn ? (
                <>
                    <section className="mb-10 text-center">
                    <h2 className="text-2xl font-bold text-green-600 text-center">간편 로그인</h2>
                    <p className="text-gray-500 p-2 text-sm mb-3">비회원일 시 회원가입이 자동으로 진행됩니다.</p>
                    <div className="flex flex-col space-y-3">
                        {/* <button
                        className="bg-white border border-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-100 transition"
                        onClick={() => console.log('구글 로그인')}
                        >
                        구글 로그인
                        </button> */}
                        <button
                        className="bg-[#F7D94C] text-black py-2 rounded-md hover:bg-yellow-400 transition"
                        onClick={kakaoLogin}
                        >
                        카카오 로그인
                        </button>
                    </div>
                    </section>


                    <section className="mb-10">
                    <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">로그인</h2>
                    <div className="space-y-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                            아이디
                        </label>
                        <input
                            type="email"
                            maxLength="50"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            maxLength="25"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        </div>
                        <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
                        로그인 하기
                        </button>
                    </div>
                    </section>

                    <section className="mb-10 text-center">
                    <h2 className="text-2xl font-bold text-green-600 text-center mb-3">비밀번호 찾기</h2>
                    <div className="flex flex-col space-y-3">
                        <button
                        className="bg-white border border-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-100 transition"
                        onClick={() => console.log('비밀번호 찾기')}
                        >
                        이메일 전송
                        </button>
                    </div>
                    </section>


                    <section>
                    <h2 onClick={() => setShowSetting((prev) => !prev)} className="text-2xl font-bold text-green-600 mb-6 text-center">회원가입</h2>
                    <form id="register" method="post" action="/register" className={`${showSetting ? '' : 'hidden'} space-y-5`}>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">이메일</label>
                        <div className="flex space-x-2 items-center">
                            <input
                            type="email"
                            maxLength="50"
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                            <button
                            type="button"
                            id="emailCheck"
                            className="bg-green-500 text-white px-4 rounded-md hover:bg-green-600 transition ml-auto"
                            >
                            확인
                            </button>
                        </div>
                        </div>


                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">비밀번호</label>
                        <input
                            type="password"
                            maxLength="25"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none mb-3"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                            비밀번호 재확인
                        </label>
                        <input
                            type="password"
                            maxLength="25"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        </div>


                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">닉네임</label>
                        <div className="flex space-x-2 items-center">
                            <input
                            type="text"
                            maxLength="10"
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                            <button
                            type="button"
                            id="nicknameCheck"
                            className="bg-green-500 text-white px-4 rounded-md hover:bg-green-600 transition ml-auto"
                            >
                            확인
                            </button>
                        </div>
                        </div>


                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">전화번호</label>
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex items-center space-x-2 flex-1">
                            <select className="border border-gray-300 rounded-md px-2 py-2 focus:ring-2 focus:ring-green-500 outline-none">
                                <option value="010" selected>
                                010
                                </option>
                            </select>
                            <span>-</span>
                            <input
                                type="number"
                                maxLength="4"
                                className="w-16 border border-gray-300 rounded-md px-2 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                maxLength="4"
                                className="w-16 border border-gray-300 rounded-md px-2 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                            </div>
                            <button
                            type="button"
                            id="phoneNumberCheck"
                            className="bg-green-500 text-white px-4 rounded-md hover:bg-green-600 transition"
                            >
                            확인
                            </button>
                        </div>
                        </div>






                        <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
                        계정 생성
                        </button>
                    </form>
                    </section>
                </>
                ) : (
                <>
                    <section className="mb-10">
                    <h2 className="text-2xl font-bold text-green-600 mb-4 text-center">닉네임 변경</h2>
                    <div className="space-y-3">
                        <div className="flex space-x-2 items-center">
                        <input
                            type="text"
                            maxLength="10"
                            placeholder="user001"
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <button className="bg-green-500 text-white px-4 rounded-md hover:bg-green-600 transition ml-auto">
                            확인
                        </button>
                        </div>
                        <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
                        닉네임 변경
                        </button>
                    </div>
                    </section>


                    <section className="mb-10 text-center">
                    <h3 className="text-xl font-semibold text-green-600 mb-3">로그아웃</h3>
                    <button
                        className="w-full bg-white text-gray-800 py-2 border-2 border-gray-300 rounded-md hover:bg-gray-100 transition font-medium"
                        onClick={logoutUser}
                    >
                        로그아웃하기
                    </button>
                    </section>




                    <section>
                    <h3 className="text-xl font-semibold text-green-600 mb-3 text-center">회원 탈퇴</h3>
                    <div className="space-y-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">이메일</label>
                        <input
                            type="email"
                            maxLength="50"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">비밀번호</label>
                        <input
                            type="password"
                            maxLength="25"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        </div>
                        <button className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition">
                        탈퇴하기
                        </button>
                    </div>
                    </section>


                    <button
                    className="mt-6 w-full bg-[#F7D94C] text-black py-2 rounded-md hover:bg-yellow-400 transition"
                    onClick={() => console.log(isLoggedIn)}
                    >
                    이메일 확인
                    </button>
                </>
                )}
            </div>
            </div>


            <br /><br />
            <div className=' text-sm text-gray-500 pb-32 text-center'>그린맵 v1.0.0</div>
        </div>
        </>
    );
}





