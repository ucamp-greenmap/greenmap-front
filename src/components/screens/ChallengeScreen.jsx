import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Plus, Award, Target, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import CertModal from '../cert/CertModal';
import { certTypes } from '../../util/certConfig';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';

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

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const [attendRes, availableRes, endRes] = await Promise.all([
                api.get('/chal/attend', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                api.get('/chal/available', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                api.get('/chal/end', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            setAttend(attendRes.data.data.challenges || []);
            setAvailable(availableRes.data.data.availableChallenges || []);
            setEnd(endRes.data.data.challenges || []);
        } catch (err) {
            console.error('챌린지 정보 조회 실패', err.response || err);
            setError('챌린지 정보를 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 관리자 권한 확인

    const handleChallengeParticipated = (challengeId) => {
        const challenge = available.find((c) => c.challengeId === challengeId);
        if (challenge) {
            setAttend((prev) => [...prev, challenge]);
            setAvailable((prev) =>
                prev.filter((c) => c.challengeId !== challengeId)
            );
        }
    };

    // 필터별 챌린지 목록
    const currentChallenges = useMemo(() => {
        switch (filter) {
            case 'available':
                return available;
            case 'ongoing':
                return attend;
            case 'completed':
                return end;
            default:
                return [];
        }
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
                <div className='max-w-3xl mx-auto px-4 py-4'>
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
                        {currentChallenges.map((challenge) => (
                            <ChallengeCard
                                key={challenge.challengeId}
                                filter={filter}
                                {...challenge}
                                onChall={handleChallengeParticipated}
                                onRefresh={fetchData}
                            />
                        ))}
                    </div>
                )}
            </div>
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
    image_url,
    filter,
    onChall,
    onRefresh,
}) {
    const [showModal, setShowModal] = useState(false);
    const [selectedType, setSelectedType] = useState(null);

    const handleChallenge = async () => {
        const token = localStorage.getItem('token');

        try {
            await api.post(
                '/chal',
                { challengeId: challengeId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onChall(challengeId);
        } catch (err) {
            console.error('챌린지 참여 실패', err.response || err);
            alert('챌린지 참여에 실패했습니다.');
        }
    };

    // 목표 단위 결정 함수
    function getGoalUnit(challengeName) {
        const sanitizedChallengeName = challengeName
            .toLowerCase()
            .replace(/\s+/g, '');

        // 따릉이: Km
        if (
            sanitizedChallengeName.includes('따릉이') ||
            sanitizedChallengeName.includes('bike')
        ) {
            return 'Km';
        }
        // 전기차/수소차/제로웨이스트/재활용: WON
        else if (
            sanitizedChallengeName.includes('전기차') ||
            sanitizedChallengeName.includes('수소차') ||
            sanitizedChallengeName.includes('electric') ||
            sanitizedChallengeName.includes('hydrogen') ||
            sanitizedChallengeName.includes('제로') ||
            sanitizedChallengeName.includes('zero') ||
            sanitizedChallengeName.includes('재활용') ||
            sanitizedChallengeName.includes('recycle')
        ) {
            return 'WON';
        }
        // 그 외: TIMES
        else {
            return 'TIMES';
        }
    }

    function determineType(challengeName) {
        const sanitizedChallengeName = challengeName
            .toLowerCase()
            .replace(/\s+/g, '');

        let type = null;

        if (
            sanitizedChallengeName.includes('따릉이') ||
            sanitizedChallengeName.includes('bike')
        ) {
            type = certTypes.find((type) => type.label === '따릉이 이용 인증');
        } else if (
            sanitizedChallengeName.includes('전기차') ||
            sanitizedChallengeName.includes('수소차') ||
            sanitizedChallengeName.includes('electric') ||
            sanitizedChallengeName.includes('hydrogen')
        ) {
            type = certTypes.find(
                (type) => type.label === '전기차/수소차 충전 영수증'
            );
        } else if (
            sanitizedChallengeName.includes('제로') ||
            sanitizedChallengeName.includes('zero')
        ) {
            type = certTypes.find(
                (type) =>
                    type.label === '제로웨이스트 스토어 / 재활용센터 영수증'
            );
        } else if (
            sanitizedChallengeName.includes('재활용') ||
            sanitizedChallengeName.includes('recycle')
        ) {
            type = certTypes.find(
                (type) =>
                    type.label === '제로웨이스트 스토어 / 재활용센터 영수증'
            );
        }

        if (!type) {
            return null;
        }

        // 전체 타입 객체를 반환하되, 챌린지 이름에 따라 필요한 키워드 정보를 포함
        const result = {
            ...type,
            keywords: type.keywords || [],
            zeroKeywords: type.zeroKeywords || [],
            recycleKeywords: type.recycleKeywords || [],
        };

        // 수소차 여부 확인 (챌린지 이름에 '수소' 또는 'hydrogen'이 포함된 경우)
        if (
            sanitizedChallengeName.includes('수소') ||
            sanitizedChallengeName.includes('hydrogen')
        ) {
            result.carType = 'H';
        }

        return result;
    }

    function openCertModal() {
        const type = determineType(challengeName);
        if (type) {
            setSelectedType(type);
            setShowModal(true);
        } else {
            alert('해당하는 인증 타입을 찾을 수 없습니다.');
        }
    }

    function closeModal() {
        setShowModal(false);
        setSelectedType(null);
    }

    function handleCertSuccess() {
        if (onRefresh) {
            onRefresh();
        }
    }

    // 진행률 계산
    const progressPercent =
        filter === 'ongoing' && progress && success
            ? Math.min((progress / success) * 100, 100)
            : 0;

    return (
        <>
            <div
                onClick={
                    filter === 'available'
                        ? handleChallenge
                        : filter === 'ongoing'
                        ? openCertModal
                        : undefined
                }
                className={`group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 ${
                    filter !== 'completed'
                        ? 'cursor-pointer hover:scale-[1.02]'
                        : ''
                }`}
            >
                {/* 메인 콘텐츠 영역 */}
                <div className='flex-1 flex flex-col'>
                    {/* 이미지 섹션 */}
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

                            {/* 완료 스탬프 */}
                            {filter === 'completed' && (
                                <div className='absolute top-3 right-3 bg-gradient-to-br from-red-500 to-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl transform rotate-12 border-2 border-white'>
                                    ✓ 완료
                                </div>
                            )}

                            {/* 카테고리 배지 */}
                            <div className='absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full'>
                                <span className='text-xs font-semibold bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] bg-clip-text text-transparent'>
                                    ECO CHALLENGE
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className='relative h-40 bg-gradient-to-br from-[#4CAF50]/20 to-[#8BC34A]/20 flex-shrink-0 flex items-center justify-center'>
                            <Award className='w-16 h-16 text-[#4CAF50]/30' />
                        </div>
                    )}

                    {/* 콘텐츠 섹션 */}
                    <div className='p-4 flex-1 flex flex-col'>
                        <h3 className='text-lg font-bold text-gray-800 mb-1.5 leading-tight group-hover:text-[#4CAF50] transition-colors'>
                            {challengeName}
                        </h3>
                        <p className='text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed'>
                            {description}
                        </p>

                        {/* 진행 상태 바 (진행중일 때만) */}
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

                        {/* 정보 그리드 */}
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
                                        {getGoalUnit(challengeName)}
                                    </div>
                                </div>
                            </div>
                            <div className='relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-2.5 text-center border border-orange-200/50 overflow-hidden group/card'>
                                <div className='absolute inset-0 bg-gradient-to-br from-orange-400/0 to-orange-400/10 opacity-0 group-hover/card:opacity-100 transition-opacity'></div>
                                <div className='relative'>
                                    <div className='text-[10px] text-orange-600 font-semibold mb-0.5 flex items-center justify-center gap-1'>
                                        <Calendar className='w-3 h-3' />
                                        기한
                                    </div>
                                    <div className='text-base font-bold text-orange-700'>
                                        {deadline}
                                    </div>
                                    <div className='text-[9px] text-orange-500 font-medium'>
                                        DAYS
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 완료 날짜 (완료된 챌린지일 때) */}
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
            {showModal && selectedType && (
                <CertModal
                    type={selectedType}
                    onClose={closeModal}
                    memberChallengeId={memberChallengeId}
                    onSuccess={handleCertSuccess}
                />
            )}
        </>
    );
}
