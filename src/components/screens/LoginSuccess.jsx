import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../store/slices/userSlice";

export default function LoginSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("✅ LoginSuccess 페이지 렌더링됨:", window.location.href);

    const currentUrl = window.location.href;

    // URL에서 토큰을 추출하여 로컬 스토리지에 저장
    if (currentUrl.includes("token=")) {
      const token = currentUrl.split("token=")[1].split(/[&#]/)[0];
      console.log("✅ 토큰 감지됨:", token);

      localStorage.setItem("token", token); // 로컬 스토리지에 토큰 저장

      // Redux 상태에 로그인 정보 저장
      dispatch(login({ token }));

      window.history.replaceState({}, "", "/"); // URL 변경 (파라미터 제거)
      navigate("/"); // 홈 화면으로 이동
    } else {
      console.log("토큰이 없음:", currentUrl);
      navigate("/login"); // 토큰이 없으면 로그인 페이지로 이동
    }
  }, [dispatch, navigate]);

  return <div>로그인 처리 중입니다...</div>;
}
