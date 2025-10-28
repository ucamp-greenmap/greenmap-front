import React from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';


export default function LoginScreen({ onNavigate }) {
    const dispatch = useDispatch();


    const navigate = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTab(tab));
    };
   


    // 링크 주소 말고 다른 방법으로 토큰 받기
    let parsedHash = '';
    let accessToken = '';
    const handleGoogleLogin = () => {
        const GOOGLE_CLIENT_ID = Google_ID;
        const GOOGLE_REDIRECT_URI = Google_URI;
   
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=token&scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile`;
       
        parsedHash = new URLSearchParams(window.location.hash.substring(1));
       
    };


    const getToken = () => {
       
        accessToken = parsedHash.get('access_token');
        console.log('토큰: ', accessToken );
    }




    const Google_ID = '687003095710-b0ha51rdl3tar230spict165hilm23nr.apps.googleusercontent.com';
    const Google_URI = 'http://localhost:5173';


   




    return (
        <div className='p-4'>
            <div>계정 설정</div>


            <div>
                <div>
                    <label>로그인</label>
                    <div hidden> {/** 다른 활동 시 히든*/}
                        <div>
                            <label>아이디 </label>
                            <input type="email" maxLength="50"></input>
                        </div>
                        <div>
                            <label>비밀번호 </label>
                            <input type="password" maxLength="25"></input>
                        </div>
                       
                    </div>
                </div> <br />






                <div>
                <button onClick={handleGoogleLogin}>구글 로그인</button><br /><br />
                <button onClick={getToken}>구글로그인성공 dialog 확인</button>    
                </div> <br /><br />




                <div>
                    <label>회원가입</label>
                    <div hidden>
                        <div>
                            <label>이메일</label>
                            <input type="email" maxLength="50"></input>
                            <button>이메일확인</button>
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
                            <button>닉네임 중복 확인</button>
                        </div>
                        <button>계정 생성</button>
                    </div>    
                </div>


                <div>탈퇴 - 탈퇴할 계정 입력</div> <br />
            </div>
            <hr></hr><hr></hr>
            <hr></hr><hr></hr>
            <div>
                <h6>로그인 상태일 때 보일 리스트</h6>
                <p>로그아웃</p>
                <p>닉네임 변경</p>
                <p>탈퇴 - 현재 계정 탈퇴</p>
            </div>












            <br /><br />
            <div className='flex items-center gap-3 mb-4'>
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
                    <span className='hidden sm:inline'>마이페이지 <br /> 돌아가기</span>
                </button>
            </div>




   
        </div>
    );
}



