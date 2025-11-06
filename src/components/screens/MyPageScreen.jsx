import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';
import { fetchMyPageData } from '../../store/slices/userSlice';
import { logout } from '../../store/slices/userSlice';

export default function MyPageScreen({ onNavigate }) {
    const dispatch = useDispatch();
    const { isLoggedIn, profile, stats, ranking, loading, error } = useSelector(
        (s) => s.user
    );

    const [showSetting, setShowSetting] = React.useState(true);


    useEffect(() => {
        dispatch(fetchMyPageData());
    }, [dispatch]);

    const navigate = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTab(tab));
    };

    const handleLogout = () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            dispatch(logout());
            navigate('home'); 
        }
    };


    if (loading) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='text-5xl mb-4'>⏳</div>
                    <p className='text-gray-600'>정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }


    if (!isLoggedIn) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center px-6'>
                <div className='text-center bg-white rounded-3xl p-8 shadow-xl max-w-md w-full'>
                    <div className='text-6xl mb-4'>🔒</div>
                    <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                        로그인이 필요해요
                    </h2>
                    <p className='text-gray-600 mb-6'>
                        마이페이지를 확인하려면 로그인해주세요
                    </p>
                    {error && (
                        <p className='text-red-500 text-sm mb-4'>{error}</p>
                    )}
                    <button
                        onClick={() => navigate('login')}
                        className='w-full bg-[#4CAF50] text-white py-3 rounded-2xl hover:bg-[#45a049] transition-colors'
                    >
                        로그인하러 가기
                    </button>
                </div>
            </div>
        );
    }

    // 로그인 됨 - 마이페이지 표시
    return (
        <div className='min-h-screen bg-gray-50 pb-24'>
            <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] px-6 pt-8 pb-12'>
                <div className='flex items-center justify-between mb-8'>
                    <h1 className='text-2xl font-bold text-white'>
                        마이페이지
                    </h1>
                    <div className="relative">
  <button
    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
    onClick={() => setShowSetting((prev) => !prev)}
  >
    <img
      src="https://img.icons8.com/ios-filled/50/FFFFFF/settings.png"
      alt="설정"
      className="w-6 h-6"
    />
  </button>

  {showSetting && (
    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg overflow-hidden z-50 animate-fadeIn">
      <button
        onClick={() => {
          navigate('edit-profile');
          setShowSetting(false);
        }}
        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
      >
        회원정보 수정
      </button>
    </div>
  )}
</div>


                </div>
                {/* {showSetting && (
                    <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-2 mb-6'>
                        <button
                            onClick={() => navigate('edit-profile')}
                            className='w-full text-left px-4 py-2.5 rounded-xl hover:bg-white/20 transition-colors text-white'
                        >
                            👤 회원 계정
                        </button>
                    </div>
                )} */}

                <div className='bg-white rounded-3xl p-6 shadow-lg'>
                    <div className='flex items-center gap-4 mb-6'>
                        <div className='w-20 h-20 rounded-full overflow-hidden bg-white border-4 border-[#4CAF50] flex items-center justify-center shadow-md'>
                            {profile.avatar ? (
                                <img
                                    src={profile.avatar}
                                    alt='프로필'
                                    className='w-full h-full object-cover'
                                />
                            ) : (
                                <span className='text-4xl'>👤</span>
                            )}
                        </div>
                        <div className='flex-1'>
                            <h2 className='text-gray-900 font-bold text-xl'>
                                {profile.nickname || profile.name || '사용자'}
                            </h2>
                            <p className='text-gray-600 text-sm'>
                                {profile.email || '이메일 없음'}
                            </p>
                            <button
                                onClick={() => navigate('badge')}
                                className='flex items-center gap-2 mt-2 bg-[#4CAF50] bg-opacity-10 text-[#4CAF50] px-3 py-1 rounded-full text-sm hover:bg-opacity-20 transition-colors'
                            >
                                <span>🌱 첫걸음</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                    <div className='border-t border-gray-200 my-4'></div>

                    {/* 통계 그리드 */}
                    <div className='grid grid-cols-3 gap-3'>
                        <button
                            onClick={() => navigate('points')}
                            className='text-center p-3 rounded-xl hover:bg-gray-50 transition-colors'
                            aria-label='포인트 내역 보기'
                        >
                            <div className='text-xs text-gray-500 mb-1'>
                                포인트
                            </div>
                            <div className='font-bold text-base text-[#4CAF50]'>
                                {stats.point}
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('carbon-info')}
                            className='text-center p-3 rounded-xl hover:bg-gray-50 transition-colors'
                            aria-label='탄소 감축 상세 정보 보기'
                        >
                            <div className='text-xs text-gray-500 mb-1'>
                                탄소 감축
                            </div>
                            <div className='font-bold text-base text-[#4CAF50]'>
                                {stats.carbonReduction} kg
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('ranking')}
                            className='text-center p-3 rounded-xl hover:bg-gray-50 transition-colors'
                            aria-label='랭킹 보기'
                        >
                            <div className='text-xs text-gray-500 mb-1'>
                                랭킹
                            </div>
                            <div className='font-bold text-base text-[#4CAF50]'>
                                #{ranking.rank || '-'}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
            {/* 메뉴 카드 */}
            <div className='px-6 py-6 space-y-6'>
                <div className='bg-white rounded-3xl p-6 shadow-md'>
                    <h3 className='font-bold text-lg text-gray-800 mb-4'>
                        메뉴
                    </h3>
                    <ul className='space-y-10'>
                        <li>
                            <button
                                onClick={() => navigate('point-exchange')}
                                className='w-full text-left px-4 py-4 rounded-xl hover:bg-gray-50 transition-all text-gray-700 flex items-center justify-between'
                                aria-label='포인트 교환소 가기'
                            >
                                <span className='flex items-center gap-3'>
                                    <span className='text-xl'>🎁</span>
                                    <span>포인트 교환소</span>
                                </span>
                                <span className='text-gray-400'>→</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate('cert-history')}
                                className='w-full text-left px-4 py-4 rounded-xl hover:bg-gray-50 transition-all text-gray-700 flex items-center justify-between'
                                aria-label='인증 기록 보기'
                            >
                                <span className='flex items-center gap-3'>
                                    <span className='text-xl'>📜</span>
                                    <span>인증 기록</span>
                                </span>
                                <span className='text-gray-400'>→</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate('FAQ')}
                                className='w-full text-left px-4 py-4 rounded-xl hover:bg-gray-50 transition-all text-gray-700 flex items-center justify-between'
                                aria-label='FAQ & 고객지원 가기'
                            >
                                <span className='flex items-center gap-3'>
                                    <span className='text-xl'>❓</span>
                                    <span>FAQ & 고객지원</span>
                                </span>
                                <span className='text-gray-400'>→</span>
                            </button>
                        </li>
                    </ul>
                </div>

                <button
                    onClick={handleLogout}
                    className='w-full text-center px-4 py-4 rounded-3xl bg-white text-red-600 font-semibold hover:bg-red-50 transition-all shadow-md'
                >
                    로그아웃
                </button>
            </div>

            {/* 버전 정보 */}
            <div className='text-center text-sm text-gray-400 py-6'>
                그린맵 v1.0.0
            </div>
        </div>
    );
}
