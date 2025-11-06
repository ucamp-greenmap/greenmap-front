import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../../store/slices/userSlice';

export default function LoginSuccess() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        console.log(' LoginSuccess 페이지 렌더링됨:', window.location.href);

        const currentUrl = window.location.href;

        // URL에서 토큰을 추출
        if (currentUrl.includes('token=')) {
            const token = currentUrl.split('token=')[1].split(/[&#]/)[0];
            console.log('토큰 감지됨:', token);

            // 로컬 스토리지에 토큰 저장
            localStorage.setItem('token', token);

            // 사용자 정보 가져오기
            api.get('/member/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    // Redux에 사용자 정보 저장
                    dispatch(
                        updateProfile({
                            name: res.data.data.nickname,
                            email: res.data.data.email,
                        })
                    );

                    console.log('카카오 로그인 성공');

                    // 메인 페이지로 이동
                    navigate('/');
                })
                .catch((error) => {
                    console.error('사용자 정보 가져오기 실패:', error);
                    localStorage.removeItem('token');
                    navigate('/login');
                });
        } else {
            console.log('토큰이 없음:', currentUrl);
            navigate('/login');
        }
    }, [navigate, dispatch]);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                fontSize: '18px',
            }}
        >
            로그인 처리 중입니다...
        </div>
    );
}
