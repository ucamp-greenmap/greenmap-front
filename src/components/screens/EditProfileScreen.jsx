import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../../api/axios";

const themeColor = "#96cb6f";

const styles = `
  :root { --brand: ${themeColor}; }
  *{ box-sizing: border-box; }
  body{ background:#f6f9f2; }
  .auth-wrap{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:16px; }
  .card{ width:100%; max-width:480px; background:#fff; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.08); padding:28px; text-align:center; }
  .title{ font-size:20px; font-weight:800; margin-bottom:6px; color:#1f2937; }
  .subtitle{ color:#6b7280; margin-bottom:14px; }
  .field{ margin:14px 0; text-align:left; }
  .label{ display:block; font-weight:600; color:#333; margin-bottom:6px; transition:color .2s ease; }
  .input{ width:100%; padding:12px 14px; border-radius:12px; border:2px solid #e5e7eb; outline:none;
          transition:border-color .15s ease, box-shadow .15s ease, background .15s ease; }
  .input:focus{ border-color:var(--brand); box-shadow:0 0 0 4px rgba(133,193,75,.15); }
  .input.filled{ background:#f9fff2; border-color:#cfe8ae; }
  .input.valid{ border-color:var(--brand); }
  .input.invalid{ border-color:#e11d48; box-shadow:0 0 0 4px rgba(225,29,72,.10); }
  .btn{ width:100%; padding:12px 14px; border-radius:12px; border:0; background:var(--brand); color:#fff; font-weight:800; cursor:pointer; margin-top:6px;}
  .btn:disabled{ opacity:.5; cursor:not-allowed; }
  .profile-image{
    width:130px; height:130px;
    border-radius:50%;
    object-fit:cover;
    border:4px solid var(--brand);
    margin:0 auto 12px;
    display:block;
    background:#f9fff2;
  }
`;

function Modal({ message, type = 'info', onClose, action }) {
   const navigate = useNavigate();
  const handleClick = () => {
    if (action === 'mypage') navigate('/mypage');
  else if (action === 'home') navigate('/');
    
    onClose();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-80 p-6 text-center">
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

export default function EditProfileScreen({ onBack }) {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [originNickname, setOriginNickname] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [nickAvailable, setNickAvailable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); 
  const token = localStorage.getItem("token");

  //  1. 기존 회원정보 불러오기
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const res = await api.get("/member/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data;
        setOriginNickname(data.nickname);
        setNickname(data.nickname);
        setEmail(data.email);
        setAvatar(data.image?.imageUrl || data.avatarUrl || null);
      } catch {
        setModal({ message: "로그인이 필요합니다 ", type: "error" });
        navigate("/login")
      }
    };
    fetchMyInfo();
  }, []);

  //  2. 닉네임 중복 검사 (debounce)
  useEffect(() => {
    if (!nickname || nickname.length < 2) {
      setNickAvailable(null);
      return;
    }

    if (nickname === originNickname) {
      setNickAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/member/check-nickname", {
          params: { nickname },
        });
        const isDuplicate = res.data.data.state;
        setNickAvailable(!isDuplicate);
      } catch {
        setNickAvailable(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [nickname]);

  //  3. 닉네임 변경
  const handleSubmit = async () => {
    if (!nickname || nickname.length < 2)
      return setModal({ message: "닉네임을 입력해주세요", type: "error" });
    if (nickname === originNickname)
      return setModal({ message: "현재 닉네임과 동일합니다", type: "error" });
    if (nickAvailable === false)
      return setModal({ message: "이미 사용 중인 닉네임입니다", type: "error" });

    try {
      setLoading(true);
      await api.put(
        "/member",
        { nickname },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModal({ message: "회원정보 수정이 완료되었습니다 ", type: "success", action : "mypage" });
      setTimeout(() => {
        navigate("/mypage");
        onBack?.();
      }, 50000);
    } catch {
      setModal({ message: "다시 시도해주세요", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // 4. 회원 탈퇴
  const stopbeingmember = async () => {
    try {
      setLoading(true);
      await api.put(
        "/member/deactivate",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModal({ message: "회원 탈퇴가 완료되었습니다 ", type: "success" , action :"home"});
      localStorage.clear();
      setTimeout(() => {
        onBack?.();
      }, 50000);
    } catch {
      setModal({ message: "다시 시도해주세요", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const nicknameValid = nickname.length >= 2;

  return (
    <div className="auth-wrap">
      <style>{styles}</style>

      <div className="card">
        <h2 className="title">프로필 수정</h2>
        <p className="subtitle">이메일은 변경할 수 없습니다.</p>

        {/* 프로필 이미지 */}
        {avatar ? (
          <img src={avatar} alt="프로필" className="profile-image" />
        ) : (
          <div
            className="profile-image"
            style={{
              fontSize: 36,
              color: "#777",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            👤
          </div>
        )}

        {/* 이메일 */}
        <div className="field">
          <label className="label">이메일</label>
          <input className="input filled" value={email} disabled />
        </div>

        {/* 닉네임 */}
        <div className="field">
          <label className={`label ${nickname ? "filled" : ""}`}>닉네임</label>
          <input
            className={`input ${
              nicknameValid
                ? nickAvailable === false
                  ? "invalid"
                  : "valid"
                : ""
            }`}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 입력"
          />
        </div>

        {/* 상태 메시지 */}
        {
        // nicknameValid && nickname === originNickname ? (
        //   <span style={{ color: "#d33b3b" }}>현재 닉네임입니다</span>
        // ) :
         nicknameValid && nickAvailable === true ? (
          <span style={{ color: "#3fa14a" }}>사용 가능한 닉네임입니다</span>
        ) : nicknameValid && nickAvailable === false ? (
          <span style={{ color: "#d33b3b" }}>이미 존재하는 닉네임입니다</span>
        ) : null}

        {/* 저장 */}
        <button
          className="btn"
          style={{ marginTop: 16 }}
          disabled={
            !nicknameValid ||
            nickname === originNickname ||
            nickAvailable === false ||
            loading
          }
          onClick={handleSubmit}
        >
          {loading ? "저장 중..." : "저장"}
        </button>

        {/* 회원 탈퇴 */}
        <button
          className="btn"
          style={{ background: "#f25c5c" }}
          onClick={stopbeingmember}
        >
          회원 탈퇴
        </button>

        {/* 뒤로가기 */}
        <button
          style={{
            marginTop: 10,
            width: "100%",
            border: "1px solid #ddd",
            padding: 12,
            borderRadius: 12,
            background: "#fff",
            cursor: "pointer",
          }}
          onClick={() => {
            if (onBack) onBack(); // 부모에서 전달된 함수가 있으면 실행
            else navigate(-1); // 없으면 브라우저 뒤로가기
          }}
        >
          뒤로가기
        </button>
      </div>
      
      {modal && (
        <Modal
          message={modal.message}
          type={modal.type}
          onClose={() => setModal(null)}
           action={modal.action}
        />
      )}
    </div>
  );
}