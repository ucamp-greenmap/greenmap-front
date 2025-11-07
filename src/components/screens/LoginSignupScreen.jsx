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
  .button.focus{ outline : none ,box-shadow:none }
  .field{ margin:14px 0; }
  .label{ display:block; font-weight:600; color:#333; margin-bottom:6px; transition:color .2s ease; }
  .input{ width:100%; padding:12px 14px; border-radius:12px; border:2px solid #e5e7eb; outline:none;
          transition:border-color .15s ease, box-shadow .15s ease, background .15s ease; }
  .input:focus{ border-color:var(--brand); box-shadow:0 0 0 4px rgba(133,193,75,.15); }
  .input.filled{ background:#f9fff2; border-color:#cfe8ae; }
  .input.valid{ border-color:var(--brand); }
  .input.invalid{ border-color:#e11d48; box-shadow:0 0 0 4px rgba(225,29,72,.10); }
  .hint{ font-size:.85rem; color:#6b7280; margin-top:6px; }
  .error{ font-size:.85rem; color:#e11d48; margin-top:6px; }
  .btn{ width:100%; padding:12px 14px; border-radius:12px; border:0; background:var(--brand); color:#fff; font-weight:800; cursor:pointer; margin-top:6px;}
  button:focus{ outline:none; box-shadow:none; }
  .btn:disabled{ opacity:.5; cursor:not-allowed; }
  .kakao{ width:100%; margin-top:12px; padding:12px 14px; border-radius:12px; border:0;
          background:#FEE500; color:#3C1E1E; font-weight:700; cursor:pointer; }
  .valid-text {
      display: block;
      margin-top: 6px;
      margin-left: 4px;
      font-size: 0.88rem;
      color: #3fa14a;  
      transition: color 0.2s ease;
  }
  .invalid-text {
      display: block;
      margin-top: 6px;
      margin-left: 4px;
      font-size: 0.88rem;
      color: #d33b3b; 
      transition: color 0.2s ease;
  }
`;

function Modal({ message, type = 'info', onClose }) {
  const handleClick = () => {
    if (type === 'success') {
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-80 p-6 text-center animate-fadeIn">
        <div
          className={`text-4xl mb-3 ${
            type === 'success' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {type === 'success' ? '🌳' : '🍂'}
        </div>
        <p className="text-gray-800 font-semibold mb-4 mt-4">{message}</p>
        <button
          onClick={handleClick}
          className="w-full py-2 rounded-xl font-bold text-white"
          style={{
            background: type === 'success' ? '#96cb6f' : '#e63e3e',
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
}

/* ------------------ 로그인 / 회원가입 통합 ------------------ */
export default function LoginSignupScreen() {
  const [page, setPage] = useState('login');
  const [userInfo, setUserInfo] = useState(null);
  const [modal, setModal] = useState(null); 
  const dispatch = useDispatch(); // redux없는 사람은 제거 가능

  //  로그인 유지
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    api
      .get('/member/me', {
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
      <div className="auth-wrap">
        <style>{styles}</style>

        <div className="card">
          <div className="title">GreenMap</div>
          <div className="subtitle">그린맵</div>

          {!userInfo && (
            <div className="tabs">
              {['login', 'signup'].map((tab) => (
                <button
                  key={tab}
                  className={`tab ${page === tab ? 'active' : ''}`}
                  onClick={() => setPage(tab)}
                >
                  {tab === 'login' ? '로그인' : '회원가입'}
                </button>
              ))}
            </div>
          )}

          {!userInfo ? (
            page === 'login' ? (
              <LoginForm setUserInfo={setUserInfo} setModal={setModal} />
            ) : (
              <SignupForm setPage={setPage} setModal={setModal} />
            )
          ) : (
            <HomeScreen />
          )}

          
{!userInfo && page === 'login' && (
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
      alt="카카오 로그인"
      style={{ width: '100%', display: 'block' }}
    />
  </button>
)}

        </div>


        {modal && (
          <Modal
            message={modal.message}
            type={modal.type}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </>
  );
}

/* ------------------ 로그인 ------------------ */
function LoginForm({ setUserInfo, setModal }) {
  const [email, setEmail] = useState('');
  const [tEmail, setTEmail] = useState(false);
  const [password, setPassword] = useState('');
  const [tPw, setTPw] = useState(false);

  const emailValid = validateEmail(email);
  const pwValid = validatePassword(password);
  const formValid = emailValid && pwValid;

  const submitLogin = async () => {
    try {
      const res = await api.post('/member/login', { email, password });
      localStorage.setItem('token', res.data.data.accessToken);
       localStorage.setItem('memberId', res.data.data.memberId);

      const info = await api.get('/member/me', {
        headers: { Authorization: `Bearer ${res.data.data.accessToken}` },
      });
      setUserInfo(info.data.data);
      setModal({ message: '로그인 성공!', type: 'success' });
      setTimeout(() => (window.location.href = '/'), 800);
    } catch {
      setModal({
        message: '이메일 또는 비밀번호를 확인해주세요.',
        type: 'error',
      });
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <InputField
        label="이메일"
        type="email"
        value={email}
        onChange={setEmail}
        onBlur={() => setTEmail(true)}
        isValid={emailValid}
        touched={tEmail}
      />

      <InputField
        label="비밀번호"
        type="password"
        value={password}
        onChange={setPassword}
        onBlur={() => setTPw(true)}
        isValid={pwValid}
        touched={tPw}
      />

      <button
        style={{ padding: 15, marginTop: 10, fontSize: 19 }}
        className="btn"
        type="submit"
        disabled={!formValid}
        onClick={submitLogin}
      >
        로그인
      </button>
    </form>
  );
}

/* ------------------ 회원가입 ------------------ */
function SignupForm({ setPage, setModal }) {
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

  // 이메일 중복 검사
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

  // 닉네임 중복 검사
  useEffect(() => {
    if (!nicknameValid) {
      setNickAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/member/check-nickname', {
          params: { nickname },
        });
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
      setModal({
        message: '회원가입 성공 로그인해주세요',
        type: 'success',
      });
      setTimeout(() => setPage('login'), 1000);
    } catch {
      setModal({
        message: '다시 시도해주세요',
        type: 'error',
      });
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <InputField
        label="이메일"
        type="email"
        value={email}
        onChange={setEmail}
        isValid={emailValid}
        touched={email.length > 0}
      />
      {emailValid && emailAvailable === true && (
        <span className="valid-text">사용 가능한 이메일입니다</span>
      )}
      {emailValid && emailAvailable === false && (
        <span className="invalid-text">이미 등록된 이메일입니다</span>
      )}

      <InputField
        label="비밀번호"
        type="password"
        value={password}
        onChange={setPassword}
        isValid={pwValid}
        touched={password.length > 0}
      />

      <InputField
        label="비밀번호 확인"
        type="password"
        value={confirm}
        onChange={setConfirm}
        isValid={confirmValid}
        touched={confirm.length > 0}
      />

      <InputField
        label="닉네임"
        type="text"
        value={nickname}
        onChange={setNickname}
        isValid={nicknameValid}
        touched={nickname.length > 0}
      />
      {nicknameValid && nickAvailable === true && (
        <span className="valid-text">사용 가능한 닉네임입니다</span>
      )}
      {nicknameValid && nickAvailable === false && (
        <span className="invalid-text">이미 존재하는 닉네임입니다</span>
      )}

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

/* ------------------ 재사용 Input ------------------ */
function InputField({ label, type, value, onChange, onBlur, isValid, touched }) {
  const filled = value?.length > 0;
  const showInvalid = touched && !isValid && filled;

  const inputClass =
    'input ' +
    (filled ? 'filled ' : '') +
    (isValid && filled ? 'valid ' : '') +
    (showInvalid ? 'invalid' : '');

  return (
    <div className="field">
      <label className={`label ${filled ? 'filled' : ''}`}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={inputClass}
        placeholder={label}
      />
    </div>
  );
}
