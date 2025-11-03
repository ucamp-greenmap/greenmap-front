// src/pages/LoginSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("✅ LoginSuccess 페이지 렌더링됨:", window.location.href);

    const currentUrl = window.location.href;
    if (currentUrl.includes("token=")) {
      const token = currentUrl.split("token=")[1].split(/[&#]/)[0];
      console.log("✅ 토큰 감지됨:", token);

      localStorage.setItem("token", token);

      window.history.replaceState({}, "", "/login");
      navigate("/login");
    } else {
      console.log("토큰이 없음:", currentUrl);
      navigate("/login");
    }
  }, [navigate]);

  return <div>로그인 처리 중입니다...</div>;
}
