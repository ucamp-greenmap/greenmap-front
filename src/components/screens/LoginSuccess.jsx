import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function LoginSuccess() {
  const navigate = useNavigate();


  useEffect(() => {
    console.log(" LoginSuccess 페이지 렌더링됨:", window.location.href);


    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");


    if (token) {
      console.log(" 토큰 감지됨:", token);
      localStorage.setItem("token", token);


      // ✅ localStorage에 저장된 걸 확실히 보장하기 위해 약간 지연 후 이동
      setTimeout(() => {
        if (localStorage.getItem("token")) {
          console.log(" 토큰 저장 확인, /login 으로 이동");
          navigate("/login", { replace: true });
        } else {
          console.warn(" 토큰이 저장되지 않음, 재시도");
        }
      }, 300);
    } else {
      console.log(" URL에 token 없음:", window.location.href);
      navigate("/login", { replace: true });
    }
  }, [navigate]);


  return <div>로그인 처리 중입니다...</div>;
}
