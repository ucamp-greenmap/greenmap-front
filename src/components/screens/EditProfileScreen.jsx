import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../../api/axios";

const themeColor = "#96cb6f";
function Modal({ message, type = 'info', onClose, redirectPath = '/mypage' }) {
  const handleClick = () => {
    if (type === 'success') {
      window.location.href = redirectPath; // ✅ 저장 성공 시 /mypage로 이동
    } else {
      onClose();
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-80 h-100 p-6 text-center">
        <div className={`text-4xl mb-3 ${type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          {type === 'success' ? '🌳' : '🍂'}
        </div>

        <p className="text-gray-800 font-semibold mb-4 mt-4">{message}</p>

        <button
          onClick={handleClick}
          className="w-full py-2 rounded-xl font-bold text-white"
          style={{ background: type === 'success' ? '#96cb6f' : '#e63e3eff' }}
        >
          확인
        </button>
      </div>
    </div>
  );
}


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
  .label.filled{ color:var(--brand); }
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

export default function EditProfileScreen({ onBack }) {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [nickAvailable, setNickAvailable] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ 추가: 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('info'); // 'success' | 'error' | 'info'
  const [modalMsg, setModalMsg] = useState('');

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const res = await api.get("/member/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data;
        setNickname(data.nickname);
        setEmail(data.email);
        setAvatar(data.image?.imageUrl || data.avatarUrl || null);
      } catch {
        // alert("로그인이 필요합니다.");
        setModalType('error');
        setModalMsg('로그인이 필요합니다.');
        setModalOpen(true);
      }
    };
    fetchMyInfo();
  }, []);

  useEffect(() => {
    if (!nickname || nickname.length < 2) {
      setNickAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/member/check-nickname", { params: { nickname } });
        const isDuplicate = res.data.data.state;
        setNickAvailable(!isDuplicate);
      } catch {
        setNickAvailable(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [nickname]);

  // ✅ 저장 시 모달로 성공/실패 표시
  const handleSubmit = async () => {
    if (!nickname || nickname.length < 2) {
      setModalType('error');
      setModalMsg('닉네임을 입력해주세요.');
      setModalOpen(true);
      return;
    }
    if (nickAvailable === false) {
      setModalType('error');
      setModalMsg('이미 사용 중인 닉네임입니다.');
      setModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      await api.put(
        "/member",
        { nickname },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ 성공 모달 오픈 (확인 누르면 /mypage로 이동)
      setModalType('success');
      setModalMsg('닉네임이 변경되었습니다.');
      setModalOpen(true);

      // ❌ navigate('/mypage');  // 모달에서 이동 처리
      // onBack?.();              // 모달 UX 유지 위해 주석
    } catch {
      setModalType('error');
      setModalMsg('수정 실패. 다시 시도해주세요.');
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const nicknameValid = nickname.length >= 2;

  return (
    <div className="auth-wrap">
      <style>{styles}</style>

      {/* ✅ 모달 렌더 */}
      {modalOpen && (
        <Modal
          type={modalType}
          message={modalMsg}
          onClose={() => setModalOpen(false)}
          redirectPath="/mypage"   // ✅ 성공 시 이동 경로
        />
      )}

      <div className="card">
        <h2 className="title">프로필 수정</h2>
        <p className="subtitle">이메일은 변경할 수 없습니다.</p>

        {avatar ? (
          <img src={avatar} alt="프로필" className="profile-image" />
        ) : (
          <div
            className="profile-image"
            style={{ fontSize: 36, color: "#777", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            👤
          </div>
        )}

        <div className="field">
          <label className="label">이메일</label>
          <input className="input filled" value={email} disabled />
        </div>

        <div className="field">
          <label className={`label ${nickname ? "filled" : ""}`}>닉네임</label>
          <input
            className={`input ${nicknameValid ? (nickAvailable === false ? "invalid" : "valid") : ""}`}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 입력"
          />
        </div>

        {nicknameValid && nickAvailable === true && (
          <span style={{ color: "green" }}>사용 가능한 닉네임입니다 </span>
        )}
        {nicknameValid && nickAvailable === false && (
          <span style={{ color: "red" }}>이미 존재하는 닉네임입니다 </span>
        )}

        <div style={{ fontSize: 12, color: "#666", marginTop: 10 }}>
          프로필 사진 및 비밀번호 변경은 추후 지원 예정입니다.
        </div>

        <button
          className="btn"
          style={{ marginTop: 16 }}
          disabled={!nicknameValid || nickAvailable === false || loading}
          onClick={handleSubmit}
        >
          {loading ? "저장 중..." : "저장"}
        </button>

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
    </div>
  );
}
