import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
// ↓ redux 안 쓰면 이 부분 제거해도됨
import { useDispatch } from 'react-redux';
import { updateProfile } from '../../store/slices/userSlice';
import kakaoBtn from '../../assets/kakao_login_medium_wide.png';
import HomeScreen from './HomeScreen';

// 테마 컬러
const themeColor = '#96cb6f';

//  검증 함수
const validateEmail = (email) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
const validatePassword = (password) => password.length >= 6;

//  카카오 로그인 버튼 클릭 시 이동
const kakaoLogin = () => {
    window.location.href = `${
        import.meta.env.VITE_APP_SERVER_URL
    }/oauth2/authorization/kakao`;
};

//  전역 스타일 그대로 유지
const styles = `
  :root { --brand: ${themeColor}; }
  *{ box-sizing: border-box; }
  body{ background:#f6f9f2; }
  .auth-wrap{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:16px; }
  .card{ width:100%; max-width:480px; background:#fff; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.08); padding:28px; }
  .title{ font-size:20px; font-weight:800; margin-bottom:6px; color:#1f2937; }
  .subtitle{ color:#6b7280; margin-bottom:14px; }
  .tabs{ display:flex; gap:8px; border-bottom:1px solid #eaeaea; margin-bottom:18px; }
  .tab{ flex:1; padding:12px 8px; text-align:center; font-weight:700; border:0; background:transparent; cursor:pointer; border-bottom:3px solid transparent; transition:all .2s ease; }
  .tab.active{ color:var(--brand); border-bottom-color:var(--brand); }
  .field{ margin:14px 0; }
  .label{ display:block; font-weight:600; color:#333; margin-bottom:6px; transition:color .2s ease; }
  .label.filled{  }
  .input{ width:100%; padding:12px 14px; border-radius:12px; border:2px solid #e5e7eb; outline:none;
          transition:border-color .15s ease, box-shadow .15s ease, background .15s ease; }
  .input:focus{ border-color:var(--brand); box-shadow:0 0 0 4px rgba(133,193,75,.15); }
  .input.filled{ background:#f9fff2; border-color:#cfe8ae; }
  .input.valid{ border-color:var(--brand); }
  .input.invalid{ border-color:#e11d48; box-shadow:0 0 0 4px rgba(225,29,72,.10); }
  .hint{ font-size:.85rem; color:#6b7280; margin-top:6px; }
  .error{ font-size:.85rem; color:#e11d48; margin-top:6px; }
  .btn{ width:100%; padding:12px 14px; border-radius:12px; border:0; background:var(--brand); color:#fff; font-weight:800; cursor:pointer; margin-top:6px;}
  .btn:disabled{ opacity:.5; cursor:not-allowed; }
  .kakao{ width:100%; margin-top:12px; padding:12px 14px; border-radius:12px; border:0;
          background:#FEE500; color:#3C1E1E; font-weight:700; cursor:pointer; }

          .tab.active{ color:var(--brand); border-bottom-color:var(--brand); }
.tab:focus{ outline:none; box-shadow:none; } 

`;

export default function LoginSignupScreen() {
    const [page, setPage] = useState('login');
    const [userInfo, setUserInfo] = useState(null);
    const dispatch = useDispatch(); // redux없는 사람은 제거 가능

    //  로그인 유지
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        api.get('/member/me', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                setUserInfo(res.data.data);
                dispatch(
                    updateProfile?.({
                        name: res.data.data.nickname,
                        email: res.data.data.email,
                    })
                );
            })
            .catch(() => localStorage.removeItem('token'));
    }, [dispatch]);

    return (
        <>
            <div className='auth-wrap'>
                <style>{styles}</style>

                <div className='card'>
                    <div className='title'>GreenMap</div>
                    <div className='subtitle'>그린맵</div>

                    {!userInfo && (
                        <div className='tabs'>
                            {['login', 'signup'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`tab ${
                                        page === tab ? 'active' : ''
                                    }`}
                                    onClick={() => setPage(tab)}
                                >
                                    {tab === 'login' ? '로그인' : '회원가입'}
                                </button>
                            ))}
                        </div>
                    )}

                    {!userInfo ? (
                        page === 'login' ? (
                            <LoginForm setUserInfo={setUserInfo} />
                        ) : (
                            <SignupForm setPage={setPage} />
                        )
                    ) : (
                        setPage('HomeScreen')
                    )}

                    {!userInfo && (
                        <button
                            onClick={kakaoLogin}
                            style={{
                                width: '100%',
                                marginTop: '12px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                padding: 0,
                            }}
                        >
                            <img
                                src={kakaoBtn}
                                alt='카카오 로그인'
                                style={{ width: '100%', display: 'block' }}
                            />
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

/* ------------------ 로그인 ------------------ */
function LoginForm({ setUserInfo }) {
    const [email, setEmail] = useState('');
    const [tEmail, setTEmail] = useState(false);
    const [password, setPassword] = useState('');
    const [tPw, setTPw] = useState(false);

    const emailValid = validateEmail(email);
    const pwValid = validatePassword(password);
    const formValid = emailValid && pwValid;

    const submitLogin = async () => {
        try {
            const res = await api.post('/member/login', {
                email,
                password,
            });
            console.log("login response: ", res.data.data);
            localStorage.setItem('token', res.data.data.accessToken);
            localStorage.setItem('memberId', res.data.data.memberId);
            const info = await api.get('/member/me', {
                headers: {
                    Authorization: `Bearer ${res.data.data.accessToken}`,
                },
            });

            setUserInfo(info.data.data);
            alert('로그인 성공');

            // 로그인 성공 시 메인으로 이동
            window.location.href = '/';
        } catch (e) {
            alert('로그인 실패');
        }
    };

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <InputField
                label='이메일'
                type='email'
                value={email}
                onChange={setEmail}
                onBlur={() => setTEmail(true)}
                isValid={emailValid}
                touched={tEmail}
            />

            <InputField
                label='비밀번호'
                type='password'
                value={password}
                onChange={setPassword}
                onBlur={() => setTPw(true)}
                isValid={pwValid}
                touched={tPw}
            />

            <button
                style={{ padding: 19, marginTop: 10, fontSize: 19 }}
                className='btn'
                type='submit'
                disabled={!formValid}
                onClick={submitLogin}
            >
                로그인
            </button>
        </form>
    );
}

/* ------------------ 회원가입 ------------------ */
function SignupForm({ setPage }) {
  const [email, setEmail] = useState('');
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [nickAvailable, setNickAvailable] = useState(null);

  const emailValid = validateEmail(email);
  const pwValid = validatePassword(password);
  const confirmValid = confirm === password && confirm.length > 0;
  const nicknameValid = nickname.length >= 2;

  const formValid =
    emailValid &&
    pwValid &&
    confirmValid &&
    nicknameValid &&
    emailAvailable === true &&
    nickAvailable === true;

  // 이메일 중복검사
  useEffect(() => {
    if (!emailValid) {
      setEmailAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/member/check-email', { params: { email } });
        const state = res.data.data.state;
        setEmailAvailable(!state);
      } catch {
        setEmailAvailable(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [email]);

  // 닉네임 중복검사
  useEffect(() => {
    if (!nicknameValid) {
      setNickAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/member/check-nickname', { params: { nickname } });
        const state = res.data.data.state;
        setNickAvailable(!state);
      } catch {
        setNickAvailable(true);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [nickname]);

  const submitSignup = async () => {
    try {
      await api.post('/member', { email, password, nickname });
      alert('회원가입 완료. 로그인 해주세요');
      setPage('login');
    } catch {
      alert('회원가입 실패');
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {/* 이메일 */}
      <div className="field">
        <label className="label filled">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`input ${email.length > 0 ? 'filled' : ''}`}
          placeholder="이메일"
        />
        {email.length > 0 && !emailValid && (
          <div className="error">이메일 형식이 아닙니다.</div>
        )}
        {emailValid && emailAvailable === true && (
          <span style={{ color: 'green' }}>사용 가능한 이메일입니다</span>
        )}
        {emailValid && emailAvailable === false && (
          <span style={{ color: 'red' }}>이미 등록된 이메일입니다</span>
        )}
      </div>

      {/* 비밀번호 */}
      <div className="field">
        <label className="label filled">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`input ${password.length > 0 ? 'filled' : ''}`}
          placeholder="비밀번호"
        />
        {password.length > 0 && !pwValid && (
          <div className="error">비밀번호는 6자 이상 입력해주세요.</div>
        )}
      </div>

      {/* 비밀번호 확인 */}
      <div className="field">
        <label className="label filled">비밀번호 확인</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={`input ${confirm.length > 0 ? 'filled' : ''}`}
          placeholder="비밀번호 확인"
        />
        {confirm.length > 0 && !confirmValid && (
          <div className="error">입력한 비밀번호와 일치하지 않습니다.</div>
        )}
      </div>

      {/* 닉네임 */}
      <div className="field">
        <label className="label filled">닉네임</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className={`input ${nickname.length > 0 ? 'filled' : ''}`}
          placeholder="닉네임"
        />
        {nicknameValid && nickAvailable === true && (
          <span style={{ color: 'green' }}>사용 가능한 닉네임입니다</span>
        )}
        {nicknameValid && nickAvailable === false && (
          <span style={{ color: 'red' }}>이미 존재하는 닉네임입니다</span>
        )}
      </div>

      <button
        style={{ padding: 19, marginTop: 10, fontSize: 19 }}
        className="btn"
        disabled={!formValid}
        onClick={submitSignup}
      >
        회원가입
      </button>
    </form>
  );
}


/* ------------------ 재사용 input ------------------ */
function InputField({
    label,
    type,
    value,
    onChange,
    onBlur,
    isValid,
    touched,
}) {
    const filled = value?.length > 0;
    const showInvalid = touched && !isValid && filled;

    const inputClass =
        'input ' +
        (filled ? 'filled ' : '') +
        (isValid && filled ? 'valid ' : '') +
        (showInvalid ? 'invalid' : '');

    return (
        <div className='field'>
            <label className={`label ${filled ? 'filled' : ''}`}>{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                className={inputClass}
                placeholder={label}
            />
            {showInvalid ? (
                <div className='error'>입력값을 확인해주세요.</div>
            ) : (
                <div className='hint'>
                    {type === 'password' ? <p> </p> : <p> </p>}
                </div>
            )}
        </div>
    );
}
