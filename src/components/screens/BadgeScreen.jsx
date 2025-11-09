import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Award, Sparkles, Trophy, Target, X } from 'lucide-react';
import { getBadges, selectBadge } from '../../api/badgeApi';

const DEFAULT_BADGE_IMAGE =
    'https://em-content.zobj.net/thumbs/120/apple/325/leaf-fluttering-in-wind_1f343.png';

export default function BadgeScreen({ onBack, navigation, onNavigate }) {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [selectedBadgeForModal, setSelectedBadgeForModal] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);

    const handleGoBack = () => {
        if (onBack) {
            onBack();
        } else if (navigation) {
            navigation.goBack();
        } else if (onNavigate) {
            onNavigate('mypage');
        } else if (window.history.length > 1) {
            window.history.back();
        }
    };

    const fetchBadges = async () => {
        try {
            setLoading(true);
            setError(null);

            const badgesData = await getBadges();
            setBadges(badgesData);
        } catch (err) {
            console.error('뱃지 조회 실패', err);
            setError(err.message || '뱃지 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBadges();
    }, []);

    // 뱃지 선택 핸들러
    const handleBadgeClick = (badge) => {
        // 획득한 뱃지만 선택 가능
        if (badge.isAcquired) {
            setSelectedBadgeForModal(badge);
        }
    };

    // 뱃지 선택 확인
    const handleConfirmSelect = async () => {
        if (!selectedBadgeForModal) return;

        try {
            setIsSelecting(true);
            await selectBadge(selectedBadgeForModal.name);
            // 뱃지 목록 새로고침
            await fetchBadges();
            setSelectedBadgeForModal(null);
        } catch (err) {
            console.error('뱃지 선택 실패', err);
            alert(err.message || '뱃지 선택에 실패했습니다.');
        } finally {
            setIsSelecting(false);
        }
    };

    // 모달 닫기
    const handleCloseModal = () => {
        if (!isSelecting) {
            setSelectedBadgeForModal(null);
        }
    };

    // 대표 뱃지 (isSelected가 true인 뱃지)
    const selectedBadge = useMemo(() => {
        return badges.find((badge) => badge.isSelected) || badges[0] || null;
    }, [badges]);

    // 획득한 뱃지 수
    const acquiredCount = useMemo(() => {
        return badges.filter((badge) => badge.isAcquired).length;
    }, [badges]);

    // 필터링된 뱃지 목록
    const filteredBadges = useMemo(() => {
        return badges.filter((badge) => {
            if (filter === 'all') return true;
            if (filter === 'acquired') return badge.isAcquired;
            if (filter === 'notAcquired') return !badge.isAcquired;
            return true;
        });
    }, [badges, filter]);

    if (loading) {
        return (
            <div className='min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center'>
                <div className='text-center'>
                    <div className='relative w-16 h-16 mx-auto mb-4'>
                        <div className='absolute inset-0 border-4 border-green-200 rounded-full'></div>
                        <div className='absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin'></div>
                    </div>
                    <p className='text-gray-600 font-medium'>
                        뱃지를 불러오는 중...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-6'>
                <div className='text-center bg-white rounded-3xl p-8 shadow-xl max-w-md w-full'>
                    <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <span className='text-3xl'>😕</span>
                    </div>
                    <h2 className='text-xl font-bold text-gray-900 mb-2'>
                        오류가 발생했습니다
                    </h2>
                    <p className='text-gray-600 mb-6'>{error}</p>
                    <button
                        onClick={handleGoBack}
                        className='w-full bg-[#4CAF50] text-white py-3 rounded-2xl hover:bg-[#45a049] transition-colors'
                    >
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50'>
            {/* 헤더 */}
            <div className='w-full bg-gradient-to-br from-[#4CAF50] via-[#66BB6A] to-[#8BC34A] px-6 pt-12 pb-8 text-white shadow-lg relative overflow-hidden'>
                {/* 배경 장식 */}
                <div className='absolute inset-0 opacity-10'>
                    <div className='absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl'></div>
                    <div className='absolute bottom-10 left-10 w-24 h-24 bg-white rounded-full blur-2xl'></div>
                </div>

                <div className='relative z-10'>
                    <div className='flex items-center gap-4 mb-6'>
                        <button
                            onClick={handleGoBack}
                            className='p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all backdrop-blur-sm'
                            aria-label='뒤로가기'
                        >
                            <ArrowLeft className='w-6 h-6 text-white' />
                        </button>
                        <div className='flex-1'>
                            <h1 className='text-2xl font-bold mb-1'>
                                뱃지 컬렉션
                            </h1>
                            <p className='text-white/90 text-sm'>
                                친환경 활동을 통해 뱃지를 수집해보세요 🌱
                            </p>
                        </div>
                    </div>

                    {/* 대표 뱃지 카드 */}
                    {selectedBadge && (
                        <div className='bg-white/20 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/30'>
                            <div className='flex items-center gap-4'>
                                <div className='relative'>
                                    <div className='absolute inset-0 bg-white/30 rounded-full blur-lg'></div>
                                    <img
                                        src={
                                            selectedBadge.image_url ||
                                            DEFAULT_BADGE_IMAGE
                                        }
                                        alt={selectedBadge.name}
                                        className='relative w-20 h-20 rounded-full border-4 border-white/50 object-cover shadow-lg bg-gray-200'
                                        onError={(e) => {
                                            // 이미지 로드 실패 시 기본 이미지로 설정
                                            if (
                                                e.target.src !==
                                                DEFAULT_BADGE_IMAGE
                                            ) {
                                                e.target.src =
                                                    DEFAULT_BADGE_IMAGE;
                                            }
                                        }}
                                    />
                                    {selectedBadge.isSelected && (
                                        <div className='absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white'>
                                            <Sparkles className='w-3 h-3 text-white' />
                                        </div>
                                    )}
                                </div>
                                <div className='flex-1'>
                                    <div className='flex items-center gap-2 mb-1'>
                                        <Trophy className='w-5 h-5 text-yellow-300' />
                                        <h2 className='text-lg font-bold text-white'>
                                            {selectedBadge.name}
                                        </h2>
                                    </div>
                                    <p className='text-white/80 text-sm mb-2'>
                                        {selectedBadge.description}
                                    </p>
                                    {selectedBadge.isAcquired && (
                                        <div className='flex items-center gap-2'>
                                            <div className='bg-green-500/30 px-2 py-1 rounded-full text-xs font-semibold text-white'>
                                                획득 완료
                                            </div>
                                            {selectedBadge.created_at && (
                                                <span className='text-white/70 text-xs'>
                                                    {new Date(
                                                        selectedBadge.created_at
                                                    ).toLocaleDateString(
                                                        'ko-KR'
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 통계 및 필터 */}
            <div className='px-6 -mt-4 relative z-20'>
                {/* 통계 카드 */}
                <div className='bg-white rounded-2xl shadow-lg p-4 mb-4 border border-gray-100'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center'>
                                <Award className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <p className='text-xs text-gray-500 mb-0.5'>
                                    뱃지 수집률
                                </p>
                                <p className='text-xl font-bold text-gray-900'>
                                    {acquiredCount} / {badges.length}
                                </p>
                            </div>
                        </div>
                        <div className='text-right'>
                            <div className='w-16 h-16 relative'>
                                <svg className='w-16 h-16 transform -rotate-90'>
                                    <circle
                                        cx='32'
                                        cy='32'
                                        r='28'
                                        stroke='#e5e7eb'
                                        strokeWidth='4'
                                        fill='none'
                                    />
                                    <circle
                                        cx='32'
                                        cy='32'
                                        r='28'
                                        stroke='#4CAF50'
                                        strokeWidth='4'
                                        fill='none'
                                        strokeDasharray={`${
                                            (acquiredCount / badges.length) *
                                            175.9
                                        } 175.9`}
                                        className='transition-all duration-500'
                                    />
                                </svg>
                                <div className='absolute inset-0 flex items-center justify-center'>
                                    <span className='text-sm font-bold text-gray-900'>
                                        {badges.length > 0
                                            ? Math.round(
                                                  (acquiredCount /
                                                      badges.length) *
                                                      100
                                              )
                                            : 0}
                                        %
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 필터 탭 */}
                <div className='bg-white rounded-2xl shadow-md p-2 mb-6 border border-gray-100'>
                    <div className='flex gap-2'>
                        {[
                            { key: 'all', label: '전체', icon: Target },
                            { key: 'acquired', label: '획득', icon: Trophy },
                            {
                                key: 'notAcquired',
                                label: '미획득',
                                icon: Award,
                            },
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                    filter === key
                                        ? 'bg-gradient-to-br from-[#4CAF50] to-[#66BB6A] text-white shadow-lg shadow-green-500/30 scale-105'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                                }`}
                            >
                                <Icon className='w-4 h-4' />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 뱃지 그리드 */}
            <div className='px-6 pb-32'>
                {filteredBadges.length === 0 ? (
                    <div className='bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100'>
                        <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <Award className='w-10 h-10 text-gray-400' />
                        </div>
                        <p className='text-gray-600 font-medium mb-1'>
                            {filter === 'acquired'
                                ? '획득한 뱃지가 없습니다'
                                : filter === 'notAcquired'
                                ? '모든 뱃지를 획득했습니다!'
                                : '뱃지가 없습니다'}
                        </p>
                        <p className='text-sm text-gray-400'>
                            {filter === 'notAcquired'
                                ? '🎉 축하합니다!'
                                : '친환경 활동을 통해 뱃지를 획득해보세요'}
                        </p>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                        {filteredBadges.map((badge, index) => (
                            <BadgeCard
                                key={badge.name}
                                badge={badge}
                                index={index}
                                onClick={() => handleBadgeClick(badge)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 뱃지 선택 확인 모달 */}
            {selectedBadgeForModal && (
                <div
                    className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
                    onClick={handleCloseModal}
                >
                    <div
                        className='bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl transform transition-all'
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 모달 헤더 */}
                        <div className='flex items-center justify-between mb-4'>
                            <h3 className='text-xl font-bold text-gray-900'>
                                뱃지 선택
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                disabled={isSelecting}
                                className='p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50'
                            >
                                <X className='w-5 h-5 text-gray-500' />
                            </button>
                        </div>

                        {/* 뱃지 정보 */}
                        <div className='text-center mb-6'>
                            <div className='relative inline-block mb-4'>
                                <div className='absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse'></div>
                                <img
                                    src={
                                        selectedBadgeForModal.image_url ||
                                        DEFAULT_BADGE_IMAGE
                                    }
                                    alt={selectedBadgeForModal.name}
                                    className='relative w-24 h-24 rounded-full object-cover border-4 border-green-400 shadow-lg mx-auto'
                                    onError={(e) => {
                                        if (
                                            e.target.src !== DEFAULT_BADGE_IMAGE
                                        ) {
                                            e.target.src = DEFAULT_BADGE_IMAGE;
                                        }
                                    }}
                                />
                            </div>
                            <h4 className='text-lg font-bold text-gray-900 mb-2'>
                                {selectedBadgeForModal.name}
                            </h4>
                            <p className='text-sm text-gray-600 mb-4'>
                                이 뱃지를 대표 뱃지로 선택하시겠습니까?
                            </p>
                            {selectedBadgeForModal.isSelected && (
                                <div className='inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-2'>
                                    <Sparkles className='w-3 h-3' />
                                    현재 대표 뱃지
                                </div>
                            )}
                        </div>

                        {/* 버튼 */}
                        <div className='flex gap-3'>
                            <button
                                onClick={handleCloseModal}
                                disabled={isSelecting}
                                className='flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirmSelect}
                                disabled={
                                    isSelecting ||
                                    selectedBadgeForModal.isSelected
                                }
                                className='flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] hover:from-[#45a049] hover:to-[#5cb85c] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30'
                            >
                                {isSelecting ? (
                                    <span className='flex items-center justify-center gap-2'>
                                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                        선택 중...
                                    </span>
                                ) : selectedBadgeForModal.isSelected ? (
                                    '이미 선택됨'
                                ) : (
                                    '선택하기'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BadgeCard({ badge, index, onClick }) {
    const progress =
        badge.standard > 0
            ? Math.min(((badge.progress || 0) / badge.standard) * 100, 100)
            : badge.isAcquired
            ? 100
            : 0;

    return (
        <div
            className={`group relative bg-white rounded-2xl shadow-md transition-all duration-300 overflow-hidden border-2 ${
                badge.isAcquired
                    ? 'border-green-400 shadow-green-100 hover:shadow-xl cursor-pointer hover:scale-105 active:scale-95'
                    : 'border-gray-200 hover:border-green-300 opacity-75'
            }`}
            style={{
                animationDelay: `${index * 50}ms`,
            }}
            onClick={badge.isAcquired ? onClick : undefined}
        >
            {/* 획득 배지 */}
            {badge.isAcquired && (
                <div className='absolute top-2 right-2 z-10'>
                    <div className='bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1'>
                        <Trophy className='w-3 h-3' />
                        <span>획득</span>
                    </div>
                </div>
            )}

            {/* 선택된 뱃지 표시 */}
            {badge.isSelected && (
                <div className='absolute top-2 left-2 z-10'>
                    <div className='bg-gradient-to-br from-yellow-400 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1'>
                        <Sparkles className='w-3 h-3' />
                        <span>대표</span>
                    </div>
                </div>
            )}

            {/* 이미지 영역 */}
            <div className='relative pt-6 pb-4 px-4 flex flex-col items-center'>
                <div className='relative mb-3'>
                    {/* 글로우 효과 */}
                    {badge.isAcquired && (
                        <div className='absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-pulse'></div>
                    )}
                    <img
                        src={badge.image_url || DEFAULT_BADGE_IMAGE}
                        alt={badge.name}
                        className={`relative w-20 h-20 rounded-full object-cover border-4 transition-all duration-300 bg-gray-200 ${
                            badge.isAcquired
                                ? 'border-green-400 shadow-lg shadow-green-400/50 scale-110'
                                : 'border-gray-300 grayscale'
                        }`}
                        onError={(e) => {
                            // 이미지 로드 실패 시 기본 이미지로 설정
                            if (e.target.src !== DEFAULT_BADGE_IMAGE) {
                                e.target.src = DEFAULT_BADGE_IMAGE;
                            }
                        }}
                    />
                </div>

                {/* 뱃지 이름 */}
                <h3 className='font-bold text-gray-900 text-sm mb-1 text-center line-clamp-2'>
                    {badge.name}
                </h3>

                {/* 설명 */}
                <p className='text-xs text-gray-500 text-center mb-3 line-clamp-2'>
                    {/* description에서 첫 번째 띄어쓰기 이후(=설명)만 표시 */}
                    {badge.description &&
                    badge.description.trim().split(' ').slice(1).join(' ') !==
                        ''
                        ? badge.description.split(' ').slice(1).join(' ')
                        : '\u00A0'}
                </p>

                {/* 진행 바 */}
                {!badge.isAcquired && badge.standard > 0 && (
                    <div className='w-full space-y-1'>
                        <div className='flex justify-between items-center text-xs'>
                            <span className='text-gray-600 font-medium'>
                                {(badge.progress || 0).toLocaleString()} /{' '}
                                {(badge.standard || 0).toLocaleString()}
                            </span>
                            <span className='text-green-600 font-bold'>
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
                            <div
                                className='bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500 ease-out shadow-sm'
                                style={{ width: `${progress}%` }}
                            >
                                <div className='h-full bg-white/30 animate-pulse'></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 획득 완료 표시 */}
                {badge.isAcquired && badge.created_at && (
                    <div className='w-full mt-2 pt-2 border-t border-gray-100'>
                        <p className='text-xs text-green-600 font-semibold text-center'>
                            ✓{' '}
                            {new Date(badge.created_at).toLocaleDateString(
                                'ko-KR'
                            )}
                        </p>
                    </div>
                )}
            </div>

            {/* 호버 효과 */}
            <div className='absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-green-500/10 transition-all duration-300 pointer-events-none'></div>
        </div>
    );
}
