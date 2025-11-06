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

  const token = localStorage.getItem("token");

  //  1. 기존 회원정보 불러오기
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const res = await api.get("/member/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data;
        setNickname(data.nickname);
        setEmail(data.email);
        setAvatar(data.image.imageUrl || data.avatarUrl || null); //  이미지 필드명 대응
      } catch {
        alert("로그인이 필요합니다.");
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
    if (!nickname || nickname.length < 2) return alert("닉네임을 입력해주세요.");
    if (nickAvailable === false) return alert("이미 사용 중인 닉네임입니다.");

    try {
      setLoading(true);
      await api.put(
        "/member",
        { nickname },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("닉네임이 변경되었습니다.");
      navigate('/mypage');
      onBack?.();
    } catch {
      alert("수정 실패. 다시 시도해주세요.");
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

        {/*  프로필 이미지 (수정 불가, 표시만) */}
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

        {nicknameValid && nickAvailable === true && (
          <span style={{ color: "green" }}>사용 가능한 닉네임입니다 </span>
        )}
        {nicknameValid && nickAvailable === false && (
          <span style={{ color: "red" }}>이미 존재하는 닉네임입니다 </span>
        )}

        {/* 안내 */}
        <div style={{ fontSize: 12, color: "#666", marginTop: 10 }}>
          프로필 사진 및 비밀번호 변경은 추후 지원 예정입니다.
        </div>

        {/* 저장 */}
        <button
          className="btn"
          style={{ marginTop: 16 }}
          disabled={!nicknameValid || nickAvailable === false || loading}
          onClick={handleSubmit}
        >
          {loading ? "저장 중..." : "저장"}
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
          onClick={onBack}
        >
          뒤로가기
        </button>
      </div>
    </div>
  );
}
