import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useDispatch } from 'react-redux';
import {
    updateProfile,
    login,
    fetchPointInfo,
} from '../../store/slices/userSlice';
import kakaoBtn from '../../assets/kakao_login_large_wide.jpeg';
import HomeScreen from './HomeScreen';

const themeColor = '#96cb6f';

//  유효성 검증 함수
const validateEmail = (email) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
const validatePassword = (password) => password.length >= 6;

//  카카오 로그인
const kakaoLogin = () => {
    window.location.href = `${
        import.meta.env.VITE_APP_SERVER_URL
    }/oauth2/authorization/kakao`;
};

//  스타일
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
  .label{ display:block; font-weight:600; color:#333; margin-bottom:6px; }
  .input{ width:100%; padding:12px 14px; border-radius:12px; border:2px solid #e5e7eb; outline:none; transition:border-color .15s ease, box-shadow .15s ease, background .15s ease; }
  .input:focus{ border-color:var(--brand); box-shadow:0 0 0 4px rgba(133,193,75,.15); }
  .input.filled{ background:#f9fff2; border-color:#cfe8ae; }
  .input.valid{ border-color:var(--brand); }
  .input.invalid{ border-color:#e11d48; box-shadow:0 0 0 4px rgba(225,29,72,.10); }
  .btn{ width:100%; padding:12px 14px; border-radius:12px; border:0; background:var(--brand); color:#fff; font-weight:800; cursor:pointer; margin-top:6px;}
  .btn:disabled{ opacity:.5; cursor:not-allowed; }
  .valid-text{ font-size:.88rem; color:#3fa14a; margin-top:6px; margin-left:4px; }
  .invalid-text{ font-size:.88rem; color:#d33b3b; margin-top:6px; margin-left:4px; }
    button:focus{ outline:none; box-shadow:none; }
`;

/*  모달 */
function Modal({ message, type = 'info', onClose, action, setPage, setModal }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (action === 'mypage') navigate('/mypage');
        else if (action === 'home') navigate('/');
        else if (action === 'login') {
            setModal(null);
            setPage('login');
        }
        onClose();
    };

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black/40 z-50'>
            <div className='bg-white rounded-2xl shadow-xl w-80 p-6 text-center animate-fadeIn'>
                <div
                    className={`text-4xl mb-3 ${
                        type === 'success' ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                    {type === 'success' ? '🌳' : '🍂'}
                </div>
                <p className='text-gray-800 font-semibold mb-4 mt-4'>
                    {message}
                </p>
                <button
                    onClick={handleClick}
                    className='w-full py-2 rounded-xl font-bold text-white'
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

/*  로그인 / 회원가입 통합 화면 */
export default function LoginSignupScreen({ onNavigate }) {
    const [page, setPage] = useState('login');
    const [userInfo, setUserInfo] = useState(null);
    const [modal, setModal] = useState(null);
    const dispatch = useDispatch();

    // 로그인 유지
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        api.get('/member/me', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                const userData = res.data.data;
                setUserInfo(userData);
                dispatch(login({ token }));
                dispatch(
                    updateProfile({
                        name: userData.nickname,
                        email: userData.email,
                        nickname: userData.nickname,
                        avatar:
                            userData.image?.imageUrl || // 일반 로그인 (객체로 감싼 경우)
                            userData.image || // 일반 로그인 (직접 문자열)
                            userData.avatarUrl || // 대체 필드
                            userData.imageUrl || // 기본 필드
                            userData.profileImage || // 카카오 로그인 응답
                            null,
                        memberId: userData.memberId,
                        badgeUrl: userData.badgeUrl || null,
                    })
                );
                dispatch(fetchPointInfo());
            })
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('memberId');
            });
    }, [dispatch]);

    return (
        <>
            <div className='auth-wrap'>
                <style>{styles}</style>

                {/* ✅ 모달이 있을 땐 모달만 표시 */}
                {modal ? (
                    <Modal
                        message={modal.message}
                        type={modal.type}
                        onClose={() => setModal(null)}
                        action={modal.action}
                        setPage={setPage}
                        setModal={setModal}
                    />
                ) : (
                    <>
                        <div className='card'>
                            <div className='title'>GreenMap</div>
                            <div className='subtitle'>그린맵</div>

                            {/* ✅ 로그인 안 된 상태 */}
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
                                            {tab === 'login'
                                                ? '로그인'
                                                : '회원가입'}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ✅ 로그인/회원가입/홈 분기 */}
                            {!userInfo ? (
                                page === 'login' ? (
                                    <LoginForm
                                        setUserInfo={setUserInfo}
                                        setModal={setModal}
                                        onNavigate={onNavigate}
                                    />
                                ) : (
                                    <SignupForm
                                        setPage={setPage}
                                        setModal={setModal}
                                    />
                                )
                            ) : (
                                <HomeScreen onNavigate={onNavigate} />
                            )}

                            {/* ✅ 카카오 로그인 버튼 */}
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
                                        alt='카카오 로그인'
                                        style={{
                                            width: '100%',
                                            display: 'block',
                                        }}
                                    />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

function LoginForm({ setUserInfo, setModal, onNavigate }) {
    const dispatch = useDispatch();
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
            const token = res.data.data.accessToken;
            const memberId = res.data.data.memberId;

            localStorage.setItem('token', token);
            localStorage.setItem('memberId', memberId);

            const info = await api.get('/member/me', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const userData = info.data.data;
            dispatch(login({ token }));
            dispatch(
                updateProfile({
                    name: userData.nickname,
                    email: userData.email,
                    nickname: userData.nickname,
                    avatar:
                        userData.image?.imageUrl || // 일반 로그인 (객체로 감싼 경우)
                        userData.image || // 일반 로그인 (직접 문자열)
                        userData.avatarUrl || // 대체 필드
                        userData.imageUrl || // 기본 필드
                        userData.profileImage || // 카카오 로그인 응답
                        null,
                    memberId: userData.memberId,
                    badgeUrl: userData.badgeUrl || null,
                })
            );
            dispatch(fetchPointInfo());

            setUserInfo(info.data.data);
            setModal({
                message: '로그인 성공!',
                type: 'success',
                action: 'home',
            });
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
                style={{ padding: 12, marginTop: 10, fontSize: 19 }}
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

function SignupForm({ setPage, setModal, onBack }) {
    const navigate = useNavigate();
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
                const res = await api.get('/member/check-email', {
                    params: { email },
                });
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
            console.log('아무거나----------------------');
            setModal({
                message: '회원가입 성공',
                type: 'success',
                action: 'login',
            });
            setTimeout(() => {
                setPage('login');
            }, 1000);
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
                label='이메일'
                type='email'
                value={email}
                onChange={setEmail}
                isValid={emailValid}
                touched={email.length > 0}
            />
            {emailValid && emailAvailable === true && (
                <span className='valid-text'>사용 가능한 이메일입니다</span>
            )}
            {emailValid && emailAvailable === false && (
                <span className='invalid-text'>이미 등록된 이메일입니다</span>
            )}

            <InputField
                label='비밀번호'
                type='password'
                value={password}
                onChange={setPassword}
                isValid={pwValid}
                touched={password.length > 0}
            />

            <InputField
                label='비밀번호 확인'
                type='password'
                value={confirm}
                onChange={setConfirm}
                isValid={confirmValid}
                touched={confirm.length > 0}
            />

            <InputField
                label='닉네임'
                type='text'
                value={nickname}
                onChange={setNickname}
                isValid={nicknameValid}
                touched={nickname.length > 0}
            />
            {nicknameValid && nickAvailable === true && (
                <span className='valid-text'>사용 가능한 닉네임입니다</span>
            )}
            {nicknameValid && nickAvailable === false && (
                <span className='invalid-text'>이미 존재하는 닉네임입니다</span>
            )}

            <button
                style={{ padding: 19, marginTop: 10, fontSize: 19 }}
                className='btn'
                disabled={!formValid}
                onClick={submitSignup}
            >
                회원가입
            </button>
        </form>
    );
}

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
        </div>
    );
}
