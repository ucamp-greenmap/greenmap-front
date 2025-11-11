import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Calendar,
    UsersRound,
    Plus,
    Award,
    Target,
    TrendingUp,
    Clock,
} from 'lucide-react';

import CertModal from '../cert/CertModal';
import { certTypes } from '../../util/certConfig';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';
import { getAllChallenges, participateChallenge } from '../../api/challengeApi';

function ConfirmationModal({ challengeName, onConfirm, onClose }) {
    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black/40 z-50'>
            <div className='bg-white rounded-2xl shadow-xl w-80 p-6 text-center'>
                <div className='text-5xl mb-3 text-[#4CAF50]'>🌱</div>

                <h3 className='text-xl font-bold text-gray-800 mb-2'>
                    챌린지 참여 확인
                </h3>

                <p className='text-gray-600 text-sm mb-4'>
                    {challengeName} 챌린지에 참여하시겠습니까?
                </p>
                <p className='text-xs text-gray-500 mb-6'>
                    참여 후에는 즉시 챌린지 기간이 시작됩니다.
                </p>

                <div className='flex gap-3'>
                    <button
                        onClick={onClose}
                        className='flex-1 py-2 rounded-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors'
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        className='flex-1 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] hover:from-[#45a049] hover:to-[#5a9f5d] transition-all shadow-lg shadow-green-500/30'
                    >
                        참여하기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ChallengeScreen({ onNavigate }) {
    const dispatch = useDispatch();
    const { isLoggedIn } = useSelector((state) => state.user);

    const navigate = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTab(tab));
    };

    const [filter, setFilter] = useState('ongoing');
    const [available, setAvailable] = useState([]);
    const [end, setEnd] = useState([]);
    const [attend, setAttend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [toastMessage, setToastMessage] = useState(null);

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            setAvailable([]);
            setAttend([]);
            setEnd([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const {
                available: availableList,
                attend: attendList,
                end: endList,
            } = await getAllChallenges();

            setAvailable(Array.isArray(availableList) ? availableList : []);
            setAttend(Array.isArray(attendList) ? attendList : []);
            setEnd(Array.isArray(endList) ? endList : []);
        } catch (err) {
            console.error('챌린지 정보 조회 실패', err);
            setError(err.message || '챌린지 정보를 가져오는데 실패했습니다.');
            setAvailable([]);
            setAttend([]);
            setEnd([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChallengeParticipated = useCallback(
        async (challengeId) => {
            try {
                await participateChallenge(challengeId);

                await fetchData();

                setToastMessage(
                    '챌린지 참여가 완료되었습니다! 지금 바로 시작하세요.'
                );
                setTimeout(() => setToastMessage(null), 3000);
            } catch (err) {
                console.error('챌린지 참여 실패', err);
                const message = err.message || '챌린지 참여에 실패했습니다.';
                setToastMessage(`⚠️ ${message}`);
                setTimeout(() => setToastMessage(null), 5000);
            }
        },
        [fetchData]
    );

    // 필터별 챌린지 목록 - 명확한 필터링과 정규화
    const currentChallenges = useMemo(() => {
        let challenges = [];

        switch (filter) {
            case 'available':
                challenges = available || [];
                break;
            case 'ongoing':
                challenges = attend || [];
                break;
            case 'completed':
                challenges = end || [];
                break;
            default:
                challenges = [];
        }

        const normalizedChallenges = challenges.map((challenge) => ({
            ...challenge,
            uniqueKey: challenge.memberChallengeId
                ? `${filter}-${challenge.memberChallengeId}`
                : `${filter}-${challenge.challengeId}`,
        }));

        const seen = new Set();
        return normalizedChallenges.filter((challenge) => {
            const key = challenge.memberChallengeId || challenge.challengeId;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }, [filter, available, attend, end]);

    return (
        <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col'>
            {/* 헤더 */}
            <div className='w-full bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] py-10 text-center text-white mb-8 shadow-md'>
                <h1 className='text-3xl font-bold text-white mb-2'>챌린지</h1>
                <p className='text-white text-opacity-90 text-sm'>
                    친환경 활동을 인증하고 포인트를 받으세요 🌱
                </p>
            </div>

            {/* 필터 탭 */}
            <div className='sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'>
                <div className='max-w-3xl mx-auto px-4 py-4 z-100'>
                    <div className='flex gap-2'>
                        {[
                            {
                                key: 'available',
                                label: '참여가능',
                                count: available.length,
                            },
                            {
                                key: 'ongoing',
                                label: '진행중',
                                count: attend.length,
                            },
                            {
                                key: 'completed',
                                label: '완료',
                                count: end.length,
                            },
                        ].map(({ key, label, count }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`flex-1 relative px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                    filter === key
                                        ? 'bg-gradient-to-br from-[#4CAF50] to-[#66BB6A] text-white shadow-lg shadow-green-500/30 scale-105'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-102'
                                }`}
                            >
                                <span className='text-sm'>{label}</span>
                                {count > 0 && (
                                    <span
                                        className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                            filter === key
                                                ? 'bg-white text-[#4CAF50]'
                                                : 'bg-[#4CAF50] text-white'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 콘텐츠 영역 */}
            <div className='flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-32'>
                {!isLoggedIn ? (
                    <div className='flex flex-col items-center justify-center py-20'>
                        <div className='bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center'>
                            <div className='text-6xl mb-4'>🔒</div>
                            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                                로그인이 필요해요
                            </h2>
                            <p className='text-gray-600 mb-6'>
                                챌린지에 참여하고 포인트를 받으려면
                                로그인해주세요
                            </p>
                            <button
                                onClick={() => navigate('login')}
                                className='w-full bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] text-white py-3 rounded-2xl hover:from-[#45a049] hover:to-[#5a9f5d] transition-all shadow-lg font-semibold'
                            >
                                로그인하러 가기
                            </button>
                        </div>
                    </div>
                ) : loading ? (
                    <div className='flex flex-col items-center justify-center py-20'>
                        <div className='relative'>
                            <div className='w-16 h-16 border-4 border-gray-200 rounded-full'></div>
                            <div className='w-16 h-16 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin absolute top-0 left-0'></div>
                        </div>
                        <p className='mt-4 text-gray-600 font-medium'>
                            챌린지를 불러오는 중...
                        </p>
                    </div>
                ) : error ? (
                    <div className='flex flex-col items-center justify-center py-20'>
                        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                            <span className='text-3xl'>😕</span>
                        </div>
                        <p className='text-gray-600 text-center'>{error}</p>
                    </div>
                ) : currentChallenges.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-20'>
                        <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                            <span className='text-4xl'>🏆</span>
                        </div>
                        <p className='text-gray-600 text-center font-medium mb-1'>
                            {filter === 'available'
                                ? '참여 가능한 챌린지가 없습니다'
                                : filter === 'ongoing'
                                ? '진행 중인 챌린지가 없습니다'
                                : '완료한 챌린지가 없습니다'}
                        </p>
                        <p className='text-sm text-gray-400 text-center'>
                            {filter === 'available'
                                ? '새로운 챌린지가 곧 추가될 예정입니다'
                                : '새로운 챌린지에 참여해보세요!'}
                        </p>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {currentChallenges.map((challenge) => {
                            const { uniqueKey, ...challengeProps } = challenge;
                            return (
                                <ChallengeCard
                                    key={uniqueKey}
                                    filter={filter}
                                    {...challengeProps}
                                    onChall={handleChallengeParticipated}
                                    onRefresh={fetchData}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
            {toastMessage && (
                <div className='fixed inset-0 pointer-events-none z-[9999] flex items-end justify-center pb-20'>
                    <div
                        className={`pointer-events-auto ${
                            toastMessage.startsWith('⚠️')
                                ? 'bg-red-600'
                                : 'bg-black/90'
                        } text-white px-6 py-3 rounded-lg shadow-2xl transition-all duration-300 animate-bounce-in`}
                    >
                        {toastMessage}
                    </div>
                </div>
            )}
        </div>
    );
}

function ChallengeCard({
    challengeId,
    memberChallengeId,
    challengeName,
    description,
    pointAmount,
    progress,
    success,
    createdAt,

    deadline,
    updatedAt,
    memberCount,
    // eslint-disable-next-line no-unused-vars
    isActive,
    image_url,
    filter,
    onChall,
    onRefresh,
}) {
    const [showCertModal, setShowCertModal] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [remainingTime, setRemainingTime] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

        const updateRemainingTime = () => {
            const now = new Date();
            let expiryDate = null;

            if (filter === 'ongoing' && createdAt && deadline != null) {
                const start = new Date(createdAt);
                // ✅ ongoing만 KST(+9h) 보정
                const startKST = new Date(start.getTime() + KST_OFFSET_MS);

                const d = Number(deadline);
                if (!Number.isFinite(d)) {
                    setRemainingTime('');
                    return;
                }

                expiryDate = new Date(startKST);
                expiryDate.setDate(expiryDate.getDate() + d);
            } else if (
                filter === 'available' &&
                updatedAt &&
                deadline != null
            ) {
                // available은 보정 없음 (요구사항대로 유지)
                const end = new Date(updatedAt);
                const endKST = new Date(end.getTime()+ KST_OFFSET_MS);

                const d = Number(deadline);
                if (!Number.isFinite(d)) {
                    setRemainingTime('');
                    return;
                }

                expiryDate = new Date(endKST);
                // 정책상 available 도 +deadline 이라면 아래 주석 해제
                // expiryDate.setDate(expiryDate.getDate() + d);
                expiryDate.setDate(expiryDate.getDate());
            }

            if (!expiryDate) {
                setRemainingTime('');
                return;
            }

            const diff = expiryDate - now;
            if (diff <= 0) {
                setRemainingTime('만료됨');
                setIsExpired(true);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setRemainingTime(
                `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`
            );
            setIsExpired(false);
        };

        updateRemainingTime();
        const timer = setInterval(updateRemainingTime, 1000);
        return () => clearInterval(timer);
    }, [filter, createdAt, updatedAt, deadline]);

    const handleChallengeConfirm = async () => {
        setShowConfirmModal(false);
        if (onChall) {
            await onChall(challengeId);
        }
    };

    const handleCardClick = () => {
        if (filter === 'available') {
            setShowConfirmModal(true);
        } else if (filter === 'ongoing') {
            openCertModal();
        }
    };

    function getGoalUnit(description) {
        if (!description) return 'TIMES';

        const firstWord = description.trim().split(' ')[0].toLowerCase();
        if (firstWord === '따릉이' || firstWord.includes('bike')) {
            return 'Km';
        } else if (
            firstWord === '전기차' ||
            firstWord === '수소차' ||
            firstWord === '제로웨이스트' ||
            firstWord === '재활용센터' ||
            firstWord.includes('electric') ||
            firstWord.includes('hydrogen') ||
            firstWord.includes('zero') ||
            firstWord.includes('recycle')
        ) {
            return 'WON';
        } else {
            return 'TIMES';
        }
    }

    function determineType(description) {
        if (!description) return null;

        const firstWord = description.trim().split(' ')[0].toLowerCase();
        let type = null;

        if (firstWord === '따릉이' || firstWord.includes('bike')) {
            type = certTypes.find((type) => type.label === '따릉이 이용 인증');
        } else if (
            firstWord === '전기차' ||
            firstWord === '수소차' ||
            firstWord.includes('electric') ||
            firstWord.includes('hydrogen')
        ) {
            type = certTypes.find(
                (type) => type.label === '전기차/수소차 충전 영수증'
            );
        } else if (
            firstWord === '제로웨이스트' ||
            firstWord === '재활용센터' ||
            firstWord.includes('zero') ||
            firstWord.includes('recycle')
        ) {
            type = certTypes.find(
                (type) =>
                    type.label === '제로웨이스트 스토어 / 재활용센터 영수증'
            );
        }

        if (!type) {
            return null;
        }

        const result = {
            ...type,
            keywords: type.keywords || [],
            zeroKeywords: type.zeroKeywords || [],
            recycleKeywords: type.recycleKeywords || [],
        };

        const sanitizedDescription = description.toLowerCase();
        if (
            sanitizedDescription.includes('수소') ||
            sanitizedDescription.includes('hydrogen')
        ) {
            result.carType = 'H';
        }

        return result;
    }

    function openCertModal() {
        const type = determineType(description);
        if (type) {
            setSelectedType(type);
            setShowCertModal(true);
        } else {
            alert('해당하는 인증 타입을 찾을 수 없습니다.');
        }
    }

    function closeCertModal() {
        setShowCertModal(false);
        setSelectedType(null);
    }

    function handleCertSuccess() {
        if (onRefresh) {
            onRefresh();
        }
    }

    const progressPercent =
        filter === 'ongoing' && progress && success
            ? Math.min((progress / success) * 100, 100)
            : 0;

    const getRemainingDays = (updatedAt, createdAt, deadline, filterType) => {
        const now = new Date();
        let expiryDate = null;

        if (filterType === 'ongoing') {
            if (!createdAt || !deadline) return null;
            const startDate = new Date(createdAt);
            expiryDate = new Date(startDate);
            expiryDate.setDate(startDate.getDate() + deadline);
        } else if (filterType === 'available') {
            if (!deadline) return null;
            expiryDate = new Date(now);
            expiryDate.setDate(now.getDate() + deadline);
        } else return null;

        const diffTime = expiryDate - now;
        if (diffTime <= 0) return '만료됨';

        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffTime / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diffTime / (1000 * 60)) % 60);
        const seconds = Math.floor((diffTime / 1000) % 60);

        return `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
    };

    const getRemainingDaysStyle = (remainingTime) => {
        if (!remainingTime) return null;

        if (remainingTime === '만료됨') {
            return {
                bg: 'bg-gray-500',
                text: 'text-white',
                shadow: 'shadow-gray-500/30',
                label: '만료됨',
            };
        }

        return {
            bg: 'bg-gradient-to-br from-[#4CAF50] to-[#66BB6A]',
            text: 'text-white',
            shadow: 'shadow-green-500/30',
            label: remainingTime,
        };
    };

    const remainingDays =
        filter === 'available' || filter === 'ongoing'
            ? getRemainingDays(updatedAt, createdAt, deadline, filter)
            : null;
    const daysStyle = getRemainingDaysStyle(remainingDays);

    return (
        <>
            <div
                onClick={handleCardClick}
                className={`group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 ${
                    filter !== 'completed'
                        ? 'cursor-pointer hover:scale-[1.02]'
                        : ''
                }`}
            >
                {(filter === 'available' || filter === 'ongoing') &&
                    remainingTime && (
                        <div
                            className={`absolute top-3 right-3 z-10 ${
                                isExpired
                                    ? 'bg-gray-500 text-white'
                                    : 'bg-gradient-to-br from-[#4CAF50] to-[#66BB6A] text-white'
                            } px-4 py-2 rounded-xl text-sm font-bold shadow-xl flex items-center gap-2 border-2 border-white/80 z-10`}
                        >
                            <Clock className='w-4 h-4' />
                            <span>{remainingTime}</span>
                        </div>
                    )}

                <div className='flex-1 flex flex-col'>
                    {image_url ? (
                        <div className='relative h-40 bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0 overflow-hidden'>
                            <img
                                src={image_url}
                                alt={challengeName}
                                className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent'></div>

                            {filter === 'completed' && (
                                <div className='absolute top-3 right-3 bg-gradient-to-br from-red-500 to-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl transform rotate-12 border-2 border-white z-10'>
                                    ✓ 완료
                                </div>
                            )}

                            <div className='absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full z-10'>
                                <span className='text-xs font-semibold bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] bg-clip-text text-transparent'>
                                    ECO CHALLENGE
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className='relative h-40 bg-gradient-to-br from-[#4CAF50]/20 to-[#8BC34A]/20 flex-shrink-0 flex items-center justify-center'>
                            <Award className='w-16 h-16 text-[#4CAF50]/30' />

                            {filter === 'completed' && (
                                <div className='absolute top-3 right-3 bg-gradient-to-br from-red-500 to-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl transform rotate-12 border-2 border-white z-10'>
                                    ✓ 완료
                                </div>
                            )}

                            <div className='absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full z-10'>
                                <span className='text-xs font-semibold bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] bg-clip-text text-transparent'>
                                    ECO CHALLENGE
                                </span>
                            </div>
                        </div>
                    )}

                    <div className='p-4 flex-1 flex flex-col'>
                        <h3 className='text-lg font-bold text-gray-800 mb-1.5 leading-tight group-hover:text-[#4CAF50] transition-colors'>
                            {challengeName}
                        </h3>
                        <p className='text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed'>
                            {description.split(' ').slice(1).join(' ')}
                        </p>

                        {filter === 'ongoing' && (
                            <div className='mb-3 bg-gray-50 rounded-xl p-2.5'>
                                <div className='flex justify-between items-center mb-1.5'>
                                    <div className='flex items-center gap-1.5'>
                                        <Target className='w-3.5 h-3.5 text-[#4CAF50]' />
                                        <span className='text-xs font-semibold text-gray-700'>
                                            진행률
                                        </span>
                                    </div>
                                    <span className='text-xs font-bold text-[#4CAF50]'>
                                        {progress} / {success}
                                    </span>
                                </div>
                                <div className='relative w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
                                    <div
                                        className='absolute top-0 left-0 h-full bg-gradient-to-r from-[#4CAF50] via-[#66BB6A] to-[#8BC34A] rounded-full transition-all duration-700 ease-out shadow-sm'
                                        style={{ width: `${progressPercent}%` }}
                                    >
                                        <div className='absolute inset-0 bg-white/20 animate-pulse'></div>
                                    </div>
                                </div>
                                <div className='mt-1 text-right'>
                                    <span className='text-[10px] text-gray-500 font-medium'>
                                        {Math.round(progressPercent)}% 달성
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className='grid grid-cols-3 gap-2 mt-auto'>
                            <div className='relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-2.5 text-center border border-blue-200/50 overflow-hidden group/card'>
                                <div className='absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-400/10 opacity-0 group-hover/card:opacity-100 transition-opacity'></div>
                                <div className='relative'>
                                    <div className='text-[10px] text-blue-600 font-semibold mb-0.5 flex items-center justify-center gap-1'>
                                        <TrendingUp className='w-3 h-3' />
                                        포인트
                                    </div>
                                    <div className='text-base font-bold text-blue-700'>
                                        {pointAmount}
                                    </div>
                                    <div className='text-[9px] text-blue-500 font-medium'>
                                        POINT
                                    </div>
                                </div>
                            </div>
                            <div className='relative bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-2.5 text-center border border-green-200/50 overflow-hidden group/card'>
                                <div className='absolute inset-0 bg-gradient-to-br from-green-400/0 to-green-400/10 opacity-0 group-hover/card:opacity-100 transition-opacity'></div>
                                <div className='relative'>
                                    <div className='text-[10px] text-green-600 font-semibold mb-0.5 flex items-center justify-center gap-1'>
                                        <Target className='w-3 h-3' />
                                        목표
                                    </div>
                                    <div className='text-base font-bold text-green-700'>
                                        {success}
                                    </div>
                                    <div className='text-[9px] text-green-500 font-medium'>
                                        {getGoalUnit(description)}
                                    </div>
                                </div>
                            </div>
                            <div className='relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-2.5 text-center border border-orange-200/50 overflow-hidden group/card'>
                                <div className='absolute inset-0 bg-gradient-to-br from-orange-400/0 to-orange-400/10 opacity-0 group-hover/card:opacity-100 transition-opacity'></div>
                                <div className='relative'>
                                    <div className='text-[10px] text-orange-600 font-semibold mb-0.5 flex items-center justify-center gap-1'>
                                        <UsersRound className='w-3 h-3' />
                                        참여자
                                    </div>
                                    <div className='text-base font-bold text-orange-700'>
                                        {memberCount || 0}
                                    </div>
                                    <div className='text-[9px] text-orange-500 font-medium'>
                                        명
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(filter === 'available' || filter === 'ongoing') &&
                            (() => {
                                let expiryDateStr = null;

                                if (
                                    filter === 'ongoing' &&
                                    createdAt &&
                                    deadline
                                ) {
                                    // const startDate = new Date(createdAt);
                                    // startDate.setHours(startDate.getHours());

                                    // const expiryDate = new Date(startDate);
                                    // expiryDate.setDate(
                                    //     startDate.getDate() + deadline
                                    // );
                                    // expiryDate.setHours(
                                    //     expiryDate.getHours() + 9
                                    // );
                                    const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
                                    const startDate = new Date(createdAt);
                                    const startKST = new Date(
                                        startDate.getTime() + KST_OFFSET_MS
                                    );
                                    const d = Number(deadline);
                                    const expiryDate = new Date(startKST);
                                    expiryDate.setDate(
                                        startKST.getDate() +
                                            (Number.isFinite(d) ? d : 0)
                                    );

                                    expiryDateStr = expiryDate
                                        .toISOString()
                                        .split('T')[0];
                                } else if (
                                    filter === 'available' &&
                                    deadline &&
                                    updatedAt
                                ) {
                                    // const expiryDate = new Date(updatedAt);
                                    // expiryDate.setHours(expiryDate.getHours());

                                    // expiryDateStr = expiryDate
                                    //     .toISOString()
                                    //     .split('T')[0];
                                    const start = new Date(updatedAt); // 보정 없음
                                    expiryDateStr = start
                                        .toISOString()
                                        .split('T')[0];
                                }

                                // return expiryDateStr ? (
                                //     null;

                                //     // <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                //     //     <Clock className="w-3.5 h-3.5 text-gray-400" />
                                //     //     <span>
                                //     //         <span className="font-medium text-gray-600">만료일:</span>{' '}
                                //     //         <span className="font-semibold text-gray-700">{expiryDateStr}</span>
                                //     //     </span>
                                //     // </p>
                                // ) : null;
                            })()}

                        {filter === 'completed' && createdAt && (
                            <div className='flex items-center gap-2 text-xs text-gray-500 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2.5 mt-3 border border-gray-200'>
                                <Calendar className='w-3.5 h-3.5 text-gray-400' />
                                <span className='font-medium'>완료일:</span>
                                <span className='font-semibold text-gray-700'>
                                    {
                                        new Date(createdAt)
                                            .toISOString()
                                            .split('T')[0]
                                    }
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 인증 모달 */}
            {showCertModal && selectedType && (
                <CertModal
                    type={selectedType}
                    onClose={closeCertModal}
                    memberChallengeId={memberChallengeId}
                    onSuccess={handleCertSuccess}
                />
            )}

            {/* 챌린지 참여 확인 모달 */}
            {showConfirmModal && (
                <ConfirmationModal
                    challengeName={challengeName}
                    onConfirm={handleChallengeConfirm}
                    onClose={() => setShowConfirmModal(false)}
                />
            )}
        </>
    );
}
