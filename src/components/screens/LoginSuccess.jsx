// src/pages/LoginSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      console.log("JWT 토큰 감지됨:", token);
      localStorage.setItem("token", token);

      setTimeout(() => navigate("/login", { replace: true }), 100);
    } else {
      console.warn("토큰이 없습니다. 로그인 페이지로 이동합니다.");
      navigate("/login", { replace: true });
    }
  }, []);


  return <div>로그인 처리 중입니다...</div>;
}
