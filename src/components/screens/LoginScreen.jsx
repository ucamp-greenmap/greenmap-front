import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';
import './loginScreen.css';


export default function LoginScreen({ onNavigate }) {
    const dispatch = useDispatch();


    const [isLoggedIn, setIsLoggedIn] = useState(null);
    // null 바꾸고 setIsLoggedIn() 이메일 받아오기


    const navigate = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTab(tab));
    };


    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_ID_KEY || '';
    const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_URI_KEY || '';
    //간편 로그인(구글) // 변경필요
   function handleGoogleLogin() {
       const scope = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
       const responseType = "token";
       const URL = `https://accounts.google.com/o/oauth2/v2/auth?`+
                `client_id=${GOOGLE_CLIENT_ID}` +
                `&redirect_uri=${GOOGLE_REDIRECT_URI}` +
                `&response_type=${responseType}` +
                `&scope=${scope}`;
       window.location.href = URL
   };


   function handleCallback() {
        const hashedParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashedParams.get('access_token');
        console.log('토큰: ', accessToken );
   }
   
   // 이메일이 확인
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
                                onClick={handleGoogleLogin}>구글 로그인</button>
                            <button className='easyLogin ml-2 bg-green-500 text-white py-2 px-4 my-1 rounded-lg cursor-pointer' 
                                onClick={handleCallback}>토큰 받기</button>
                            <br /><br />
                            <button className='easyLogin bg-yellow-500 text-white py-2 px-4 my-1 rounded-lg cursor-pointer' 
                                onClick={() => kakaoLogin({isLoggedIn, setIsLoggedIn})}>카카오 로그인</button>
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
                                <input type="number" maxLength="3"></input>-
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
                        <button className='easyLogin ml-2 bg-yellow-500 text-white py-2 px-4 my-1 rounded-lg cursor-pointer' 
                                onClick={() => console.log(isLoggedIn)}>계정 받기</button>
                        {/* ^카카오 이메일 확인용*/}

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
                        <button class='easyLogin'>로그아웃하기</button>
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
                </div>
                )}


            </div>
           
            <br /><br />
            <div className=' text-sm text-gray-500 text-center'>그린맵 v1.0.0</div>
        </div>
        </>
    );
}


function loginUser() {
    //이메일 확인
    //비밀번호 확인
    //로그인 처리
}

function kakaoLogin({isLoggedIn, setIsLoggedIn}) {
    // 여기서 
    console.log('카카오 로그인');
}


function changeNickname() {
    //닉네임 중복 확인
    //닉네임 변경 처리
}


function logoutUser() {
    //로그아웃 처리
}


function registerUser() {
    //이메일 확인
    //비밀번호 재확인
    //닉네임 확인
    //전화번호 확인
    //계정 생성 처리
}

function deleteUser() {
    //이메일 확인
    //비밀번호 확인
    //탈퇴 의지 재확인
    //회원 탈퇴 처리
}

