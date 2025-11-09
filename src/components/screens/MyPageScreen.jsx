import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';
import { fetchMyPageData, logout } from '../../store/slices/userSlice';
import { getBadges } from '../../api/badgeApi';
import api from '../../api/axios';

const themeColor = '#96cb6f';

/* 로그아웃 모달 컴포넌트 */
function LogoutModal({ onConfirm, onClose }) {
    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black/40 z-50'>
            <div className='bg-white rounded-2xl shadow-xl w-80 p-6 text-center'>
                <div className='text-4xl mb-3 text-green-500'>🌳</div>
                <p className='text-gray-800 font-semibold mb-4'>
                    로그아웃 하시겠습니까?
                </p>
                <div className='flex gap-3'>
                    <button
                        onClick={onClose}
                        className='flex-1 py-2 rounded-xl font-bold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all'
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        className='flex-1 py-2 rounded-xl font-bold text-white'
                        style={{ background: themeColor }}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MyPageScreen({ onNavigate }) {
    const dispatch = useDispatch();
    const { isLoggedIn, profile, stats, ranking, loading, error } = useSelector(
        (s) => s.user
    );
    const [isAdmin, setIsAdmin] = useState(false);
    const [myBadge, setMyBadge] = useState(null); // 초기값을 null로 변경

    const [showSetting, setShowSetting] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // 중복 호출 방지를 위한 ref
    const hasFetchedDataRef = useRef(false);
    const hasFetchedBadgeRef = useRef(false);
    const hasCheckedAdminRef = useRef(false);

    // 관리자 권한 확인
    const checkAdminStatus = async () => {
        // 이미 확인했으면 스킵
        if (hasCheckedAdminRef.current) {
            return;
        }

        const token = localStorage.getItem('token');
        const memberId = localStorage.getItem('memberId');

        if (!token || memberId !== '1') {
            setIsAdmin(false);
            hasCheckedAdminRef.current = true;
            return;
        }

        try {
            hasCheckedAdminRef.current = true;
            const response = await api.get('/admin', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (
                response.data.status === 'SUCCESS' &&
                response.data.data.result
            ) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        } catch (err) {
            console.error('관리자 권한 확인 실패', err.response || err);
            setIsAdmin(false);
            hasCheckedAdminRef.current = true;
        }
    };

    // 선택된 뱃지 가져오기
    const fetchSelectedBadge = async () => {
        // 이미 가져왔으면 스킵
        if (hasFetchedBadgeRef.current) {
            return;
        }

        try {
            hasFetchedBadgeRef.current = true;
            const badges = await getBadges();
            const selected = badges.find((badge) => badge.isSelected);
            // 선택된 뱃지가 있을 때만 설정
            if (selected) {
                setMyBadge(selected);
            } else {
                setMyBadge(null); // 선택된 뱃지가 없으면 null
            }
        } catch (err) {
            console.error('선택된 뱃지 조회 실패', err);
            setMyBadge(null);
            hasFetchedBadgeRef.current = true;
        }
    };

    // 마이페이지 데이터 로드 (컴포넌트 마운트 시 한 번만)
    // App.jsx에서 이미 초기 로드를 했지만, 마이페이지 진입 시 최신 데이터로 업데이트
    useEffect(() => {
        // 이미 이 컴포넌트에서 호출했으면 스킵 (중복 방지)
        if (hasFetchedDataRef.current) {
            return;
        }

        hasFetchedDataRef.current = true;
        // 마이페이지 진입 시 최신 데이터로 새로고침
        dispatch(fetchMyPageData());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 마운트 시 한 번만 실행

    // 뱃지와 관리자 상태는 마운트 시 한 번만
    useEffect(() => {
        fetchSelectedBadge();
        checkAdminStatus();
    }, []);

    const navigate = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTab(tab));
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        dispatch(logout());
        navigate('home');
        setShowLogoutModal(false);
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

    return (
        <div className='min-h-screen bg-gray-50 pb-24'>
            {/* 상단 영역 */}
            <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] px-6 pt-8 pb-12'>
                <div className='flex items-center justify-between mb-8'>
                    <h1 className='text-2xl font-bold text-white'>
                        마이페이지
                    </h1>
                    <div className='relative'>
                        <button
                            className='p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors'
                            onClick={() => setShowSetting((prev) => !prev)}
                        >
                            <img
                                src='https://img.icons8.com/ios-filled/50/FFFFFF/settings.png'
                                alt='설정'
                                className='w-6 h-6'
                            />
                        </button>

                        {showSetting && (
                            <div className='absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg overflow-hidden z-50 animate-fadeIn'>
                                <button
                                    onClick={() => {
                                        navigate('edit-profile');
                                        setShowSetting(false);
                                    }}
                                    className='w-full text-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors'
                                >
                                    회원정보수정
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 프로필 영역 */}
                <div className='bg-white rounded-3xl p-6 shadow-lg'>
                    <div className='flex items-center gap-7 mb-6'>
                        <div className='relative'>
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
                            {/* 뱃지 이미지 - 프로필 이미지 오른쪽 하단 */}
                            {(profile.badgeUrl ||
                                (myBadge && myBadge.imageUrl)) && (
                                <div className='absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-[#4CAF50] flex items-center justify-center shadow-lg'>
                                    <img
                                        src={
                                            profile.badgeUrl || myBadge.imageUrl
                                        }
                                        alt='뱃지'
                                        className='w-6 h-6 object-contain'
                                    />
                                </div>
                            )}
                        </div>
                        <div className='flex-1'>
                            <h2 className='text-gray-900 font-bold text-xl text-left'>
                                {profile.nickname || profile.name || '사용자'}
                            </h2>
                            <p className='text-gray-600 text-sm text-left'>
                                {profile.email || '이메일 없음'}
                            </p>
                            {/* 선택된 뱃지 이름이 있을 때만 표시 (뱃지 이미지는 프로필에 표시됨) */}
                            {myBadge && (
                                <button
                                    onClick={() => navigate('badge')}
                                    className='flex items-center gap-2 mt-2 bg-[#4CAF50] bg-opacity-10 text-[#4CAF50] px-3 py-1 rounded-full text-sm hover:bg-opacity-20 transition-colors'
                                >
                                    <span>🌱 {myBadge.name}</span>
                                    <span>→</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className='border-t border-gray-200 my-4'></div>

                    {/* 통계 */}
                    <div className='grid grid-cols-3 gap-3'>
                        <button
                            onClick={() => navigate('points')}
                            className='text-center p-3 rounded-xl hover:bg-gray-50 transition-colors'
                        >
                            <div className='text-xs text-gray-500 mb-1'>
                                포인트
                            </div>
                            <div className='font-bold text-base text-[#4CAF50]'>
                                {stats.point?.toLocaleString() || '0'}
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('carbon-info')}
                            className='text-center p-3 rounded-xl hover:bg-gray-50 transition-colors'
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
                        {isAdmin && (
                            <li>
                                <button
                                    onClick={() => navigate('admin')}
                                    className='w-full text-left px-4 py-4 rounded-xl hover:bg-green-50 transition-all text-green-700 flex items-center justify-between border border-green-200'
                                >
                                    <span className='flex items-center gap-3'>
                                        <span className='text-xl'>🛡️</span>
                                        <span>관리자</span>
                                    </span>
                                    <span className='text-green-400'>→</span>
                                </button>
                            </li>
                        )}
                        <li>
                            <button
                                onClick={() => navigate('point-exchange')}
                                className='w-full text-left px-4 py-4 rounded-xl hover:bg-gray-50 transition-all text-gray-700 flex items-center justify-between'
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

                {/*  로그아웃 버튼 */}
                <button
                    onClick={handleLogout}
                    className='w-full text-center px-4 py-4 rounded-3xl bg-white text-red-600 font-semibold hover:bg-red-50 transition-all shadow-md'
                >
                    로그아웃
                </button>
            </div>

            {/* 하단 버전 */}
            <div className='text-center text-sm text-gray-400 py-6'>
                그린맵 v1.0.0
            </div>

            {/*  로그아웃 모달 */}
            {showLogoutModal && (
                <LogoutModal
                    onConfirm={confirmLogout}
                    onClose={() => setShowLogoutModal(false)}
                />
            )}
        </div>
    );
}
