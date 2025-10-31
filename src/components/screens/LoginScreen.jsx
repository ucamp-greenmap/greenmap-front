import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';
import './loginScreen.css';


export default function LoginScreen({ onNavigate }) {
    const dispatch = useDispatch();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);

    const navigation = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTab(tab));
    };

    function logoutUser() {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
    }

    // 카카오 로그인 버튼 클릭
    const kakaoLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
    };
   
useEffect(() => {
  const url = window.location.href;
  if (url.includes("token=")) {
    const token = url.split("token=")[1].split(/[&#]/)[0];
    localStorage.setItem("token", token);
    console.log("✅ 토큰 저장됨:", token);
    setIsLoggedIn(true);
    window.history.replaceState({}, "", "/main");
  } else {
    console.log("❌ 토큰 없음:", url);
  }
}, []);

  //http://localhost:5173/login/success?token=eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhcmlzdWUwMkBuYXZlci5jb20iLCJleHAiOjE3NjE5MDg4Mzl9.Ffd1-n1u52ErZMp_SHSOlqywG32cSlxkNwjFC_39mY8ZuaLFtjeWrzofShrk-8Upq0j64Wx0Z5iM5Bz4ySAJFQ


   
    return (
        <>
        <div className='bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] rounded-2xl p-4 text-white'>
                계정 관리
        </div>
        <div className='m-5'>
            <button
                onClick={() => navigation('mypage')}
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
            <div className='bg-white rounded-2xl p-4 gap-4'>
               
                {!isLoggedIn ? (
                    <div class="emailFalse" >
                    <div id='login' >
                        <label>로그인</label>
                        <div class="">
                            <div>
                                <label>아이디 </label>
                                <input type="email" maxLength="50"></input>
                            </div>
                            <div>
                                <label>비밀번호 </label>
                                <input type="password" maxLength="25"></input>
                            </div>
                            <button class="send">로그인 하기</button>
                        </div>
                    </div> <br />
                    <div id='easyLogin'>
                        <label>간편 로그인</label><br /><br />
                        <div>
                            <button className='easyLogin bg-green-500 text-white py-2 px-4 my-1 rounded-lg cursor-pointer' 
                                onClick={() => console.log("구글로그인")}>구글 로그인</button>
                            <button className='easyLogin ml-2 bg-green-500 text-white py-2 px-4 my-1 rounded-lg cursor-pointer' 
                                onClick={() => console.log("구글 토큰")}>토큰 받기</button>
                            <br /><br />
                            <button className='easyLogin bg-yellow-500 text-white py-2 px-4 my-1 rounded-lg cursor-pointer' 
                                onClick={kakaoLogin}>카카오 로그인</button>
                        </div>
                    </div> <br /><br />
                    <form id='register' method='post' action='/register'>
                        <label>회원가입</label>
                        <div >
                            <div>
                                <label>이메일</label>
                                <input type="email" maxLength="50"></input>
                                <button type='button' id='emailCheck' class="send">이메일확인</button>
                            </div>
                            <div>
                                <label>비밀번호</label>
                                <input type="password" maxLength="25"></input>
                                <br />
                                <label>비밀번호 재확인</label>
                                <input type="password" maxLength="25"></input>
                            </div>
                            <div>
                                <label>닉네임</label>
                                <input type="text" maxLength="10"></input>
                                <button type='button' id='nicknameCheck' class="send">닉네임 중복 확인</button>
                            </div>
                            <div>
                                <label>전화번호</label>
                                <select>
                                    <option value="010" selected>010</option>
                                </select>-
                                <input type="number" maxLength="4"></input>-
                                <input type="number" maxLength="4"></input>
                                <button type='button' id='phoneNumberCheck' class="send">전화번호 확인</button>
                            </div>
                            <button class="send">계정 생성</button>
                        </div>    
                    </form> <br /> <br />
                </div>
                ) : (
                    <div class="emailTrue" >
                    <div id='nicknameChange'>
                        <label>닉네임 변경</label>
                        <div>
                            <div>
                                <label>닉네임</label>
                                <input type="text" maxLength="10" placeholder='user001'></input>
                                <button class="send">닉네임 중복 확인</button>
                            </div>
                            <button class="send">닉네임 변경</button>
                        </div>
                    </div><br />
                    <div id='logout'>
                        <label>로그아웃</label><br />
                        <button class='easyLogin' onClick={logoutUser}>로그아웃하기</button>
                    </div> <br />
                    <div id='deletUser'>
                        <label>회원 탈퇴</label>
                        <div>
                            <div>
                                <label>이메일</label>
                                <input type="email" maxLength="50"></input>
                            </div>
                            <div>
                                <label>비밀번호</label>
                                <input type="password" maxLength="25"></input>
                            </div>
                            <button class="send">탈퇴하기</button>
                        </div>
                    </div>
                    <button className='easyLogin ml-2 bg-yellow-500 text-white py-2 px-4 my-1 rounded-lg cursor-pointer' 
                                onClick={() => console.log(isLoggedIn)}>이메일 확인</button>
                        {/* ^카카오 이메일 확인용*/}
                </div>
                )}


            </div>
           
            <br /><br />
            <div className=' text-sm text-gray-500 text-center'>그린맵 v1.0.0</div>
        </div>
        </>
    );
}

