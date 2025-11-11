import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useDispatch } from 'react-redux';
import {
    updateProfile,
    login,
    fetchPointInfo,
} from '../../store/slices/userSlice';

export default function LoginSuccess() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        console.log('🔵 LoginSuccess 페이지 렌더링됨:', window.location.href);

        const currentUrl = window.location.href;

        // URL에서 토큰을 추출
        if (currentUrl.includes('token=')) {
            const token = currentUrl.split('token=')[1].split(/[&#]/)[0];
            console.log(
                '🔑 토큰 추출 완료:',
                token ? `${token.substring(0, 20)}...` : '없음'
            );

            if (!token || token.trim() === '') {
                console.error('❌ 토큰이 비어있음');
                navigate('/login', { replace: true });
                return;
            }

            // 로컬 스토리지에 토큰 저장
            localStorage.setItem('token', token);
            console.log('💾 토큰 저장 완료');

            // 사용자 정보 가져오기
            api.get('/member/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    console.log('사용자 정보 응답:', res.data);
                    const userData = res.data.data || res.data;

                    // Redux 상태 업데이트 (로그인 상태 먼저 설정)
                    dispatch(login({ token }));

                    // 프로필 업데이트 (다양한 응답 형식 지원)
                    dispatch(
                        updateProfile({
                            name: userData.nickname || '',
                            email: userData.email || '',
                            nickname: userData.nickname || '',
                            avatar:
                                userData.image?.imageUrl ||
                                userData.imageUrl ||
                                userData.image ||
                                null,
                            memberId: userData.memberId,
                            badgeUrl: userData.badgeUrl || null,
                        })
                    );

                    console.log('카카오 로그인 성공 - 프로필 업데이트 완료');

                    // 포인트 정보 가져오기 (실패해도 로그인 상태 유지)
                    dispatch(fetchPointInfo()).catch((error) => {
                        console.warn(
                            '포인트 정보 가져오기 실패 (로그인 상태는 유지):',
                            error
                        );
                        // 포인트 정보 실패해도 로그인은 유지
                    });

                    // 메인 페이지로 이동 (약간의 지연을 두어 Redux 상태 업데이트 완료 대기)
                    setTimeout(() => {
                        navigate('/', { replace: true });
                    }, 100);
                })
                .catch((error) => {
                    console.error('사용자 정보 가져오기 실패:', error);
                    console.error('에러 상세:', error.response?.data);
                    localStorage.removeItem('token');
                    navigate('/login', { replace: true });
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
