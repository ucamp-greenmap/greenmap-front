// src/pages/LoginSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("✅ LoginSuccess 페이지 렌더링됨:", window.location.href);

    // 1️⃣ URL에서 토큰 추출
    const currentUrl = window.location.href;
    if (currentUrl.includes("token=")) {
      const token = currentUrl.split("token=")[1].split(/[&#]/)[0];
      console.log("✅ 토큰 감지됨:", token);

      // 2️⃣ 로컬스토리지에 저장
      localStorage.setItem("token", token);

      // 3️⃣ URL 정리 후 /main 으로 이동
      window.history.replaceState({}, "", "/main");
      navigate("/main");
    } else {
      console.log("❌ 토큰이 없음:", currentUrl);
      navigate("/login");
    }
  }, [navigate]);

  return <div>로그인 처리 중입니다...</div>;
}
