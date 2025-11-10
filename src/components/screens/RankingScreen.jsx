import React from 'react';
import { useDispatch } from 'react-redux';

import { setActiveTab } from '../../store/slices/appSlice';
import { usePointRanking } from '../../hooks/usePointApi';
import { ArrowLeft } from 'lucide-react';
import { RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RankingScreen({ onNavigate, onBack, navigation }) {
    const dispatch = useDispatch();

    // API로부터 랭킹 데이터 가져오기
    const { data, myRank, ranks, loading, error, refetch } =
        usePointRanking(true);

    const handleGoBack = () => {
        if (typeof onBack === 'function') {
            onBack();
            return;
        }
        if (navigation && typeof navigation.goBack === 'function') {
            navigation.goBack();
            return;
        }
        if (typeof onNavigate === 'function') {
            onNavigate('mypage');
            return;
        }
        if (window.history.length > 1) {
            window.history.back();
            return;
        }
        dispatch(setActiveTab('home'));
    };

    return (
        <div className='p-4'>
            <div className='flex items-center gap-3 mb-4'>
                <button
                    onClick={handleGoBack}
                    style={{ backgroundColor: '#f9fafb' }}
                    className='p-2 rounded-full hover:bg-gray-100 transition-colors'
                    aria-label='뒤로가기'
                >
                    <ArrowLeft className='w-5 h-5 text-black' />
                </button>
                <h2 className='text-lg font-bold'>랭킹</h2>
            </div>

            <p className='flex items-center justify-center gap-2 text-sm text-gray-500 mb-4'>
                <RefreshCcw className='w-4 h-4' />
                <span>랭킹은 매월 1일에 초기화됩니다.</span>
            </p>

            {/* 내 랭킹 표시 (Top 10 이내면 상단 고정 카드 숨김)
                - 목적: 상위권에 있을 때 중복 노출을 피하고, 리스트/카드에서 자연스럽게 강조
                - 조건: myRank가 1~10이면 상단 카드 숨김, 11위 이상이면 상단 카드 노출 */}
            {data &&
                myRank !== null &&
                myRank !== undefined &&
                Number(myRank) > 10 && (
                    <div className='mb-4 bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] rounded-2xl p-4 text-white shadow-lg'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                {data?.imageUrl ? (
                                    <div className='relative'>
                                        <img
                                            src={data.imageUrl}
                                            alt='내 프로필'
                                            className='w-10 h-10 rounded-full border-2 border-white/40 shadow'
                                            referrerPolicy='no-referrer'
                                        />
                                    </div>
                                ) : (
                                    <div className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center'>
                                        <span>🙂</span>
                                    </div>
                                )}
                                <div>
                                    <div className='text-sm opacity-90'>
                                        내 순위
                                    </div>
                                    <div className='text-2xl font-bold'>
                                        {myRank}위
                                    </div>
                                </div>
                            </div>
                            <div className='text-right'>
                                <div className='text-sm opacity-90'>
                                    내 포인트
                                </div>
                                <div className='text-xl font-bold'>
                                    {data.memberPoint?.toLocaleString() || 0}P
                                </div>
                            </div>
                        </div>
                        <div className='mt-2 text-xs opacity-90'>
                            탄소 감축 {data.carbonSave?.toFixed(1) || 0}kg
                        </div>
                    </div>
                )}

            {/* 로딩 상태 */}
            {loading && (
                <div className='flex items-center justify-center py-20'>
                    <div className='text-center'>
                        <div className='w-12 h-12 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                        <p className='text-gray-600'>랭킹을 불러오는 중...</p>
                    </div>
                </div>
            )}

            {/* 에러 상태 */}
            {error && !loading && (
                <div className='bg-red-50 rounded-xl p-6 text-center'>
                    <p className='text-red-600 mb-2'>
                        랭킹을 불러오는데 실패했습니다.
                    </p>
                    <button
                        onClick={refetch}
                        className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
                    >
                        다시 시도
                    </button>
                </div>
            )}

            {/* 랭킹 목록 */}
            {!loading && !error && (
                <div className='space-y-6'>
                    {ranks && ranks.length > 0 ? (
                        <>
                            {/* TOP 3 - 미니멀 카드형 디자인
                                - 구조: 3열 카드형, 각 순위 카드에 다른 톤/하이라이트 적용
                                - 강조: 1위는 크기/색조로 미세 강조, 2/3위는 균형 잡힌 중간 톤 */}
                            {ranks.length >= 3 && (
                                <div className='mb-6'>
                                    <div className='grid grid-cols-3 gap-3'>
                                        {/* 2위 */}
                                        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center relative overflow-hidden'>
                                            <div className='mt-4'>
                                                <div className='flex items-center justify-center gap-1 text-gray-600 text-xs font-medium mb-3'>
                                                    <span>2위</span>
                                                </div>
                                                <div className='relative mx-auto mb-2 w-14 h-14'>
                                                    {ranks[1]?.imageUrl ? (
                                                        <img
                                                            src={
                                                                ranks[1]
                                                                    .imageUrl
                                                            }
                                                            alt='2위 프로필'
                                                            className='w-14 h-14 rounded-full ring-2 ring-gray-300 object-cover'
                                                            referrerPolicy='no-referrer'
                                                        />
                                                    ) : (
                                                        <div className='w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500'>
                                                            <span>🙂</span>
                                                        </div>
                                                    )}
                                                    {ranks[1]?.badgeUrl && (
                                                        <img
                                                            src={
                                                                ranks[1]
                                                                    .badgeUrl
                                                            }
                                                            alt='뱃지'
                                                            className='absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-white shadow'
                                                            referrerPolicy='no-referrer'
                                                        />
                                                    )}
                                                </div>
                                                <div className='text-sm font-semibold text-gray-900 truncate mb-1'>
                                                    {ranks[1]?.nickname ||
                                                        '익명'}
                                                </div>
                                                <div className='text-xs text-gray-500'>
                                                    {(
                                                        ranks[1]?.memberPoint ||
                                                        ranks[1]?.point ||
                                                        0
                                                    ).toLocaleString()}
                                                    P
                                                </div>
                                                <div className='mt-1 text-[11px] text-emerald-600 font-medium'>
                                                    탄소{' '}
                                                    {(
                                                        ranks[1]?.carbonSave ||
                                                        0
                                                    ).toFixed(1)}
                                                    kg
                                                </div>
                                            </div>
                                        </div>

                                        {/* 1위 (👑 중심 강조) */}
                                        <motion.div
                                            initial={{
                                                scale: 0.95,
                                                opacity: 0,
                                            }}
                                            animate={{
                                                scale: 1.05,
                                                opacity: 1,
                                            }}
                                            transition={{
                                                duration: 0.6,
                                                ease: 'easeOut',
                                            }}
                                            className='bg-white ml-1 rounded-2xl border border-emerald-200 shadow-lg p-5 text-center relative overflow-hidden w-[95%] ring-2 ring-emerald-200'
                                        >
                                            <div className='flex items-center justify-center gap-1 text-emerald-700 text-xs font-semibold mb-3'>
                                                <span>1위</span>
                                            </div>

                                            <div className='flex justify-center mb-3'>
                                                <div className='relative w-20 h-20'>
                                                    {ranks[0]?.imageUrl ? (
                                                        <img
                                                            src={
                                                                ranks[0]
                                                                    .imageUrl
                                                            }
                                                            alt='1위 프로필'
                                                            className='w-20 h-20 rounded-full ring-2 ring-emerald-400 object-cover shadow-md'
                                                            referrerPolicy='no-referrer'
                                                        />
                                                    ) : (
                                                        <div className='w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600'>
                                                            <span>🙂</span>
                                                        </div>
                                                    )}

                                                    {ranks[0]?.badgeUrl && (
                                                        <img
                                                            src={
                                                                ranks[0]
                                                                    .badgeUrl
                                                            }
                                                            alt='뱃지'
                                                            className='absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-white shadow'
                                                            referrerPolicy='no-referrer'
                                                        />
                                                    )}
                                                    <div className='absolute -top-1 -right-1 text-[11px] bg-amber-300 text-white rounded-full px-1.5 py-0.5 font-semibold'>
                                                        👑
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='text-sm font-bold text-gray-900 truncate mb-1'>
                                                {ranks[0]?.nickname || '익명'}
                                            </div>
                                            <div className='text-lg font-extrabold text-gray-900'>
                                                {(
                                                    ranks[0]?.memberPoint ||
                                                    ranks[0]?.point ||
                                                    0
                                                ).toLocaleString()}
                                                P
                                            </div>
                                            <div className='mt-1 text-[11px] text-emerald-700 font-semibold'>
                                                탄소{' '}
                                                {(
                                                    ranks[0]?.carbonSave || 0
                                                ).toFixed(1)}
                                                kg
                                            </div>
                                        </motion.div>

                                        {/* 3위 */}
                                        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center relative overflow-hidden'>
                                            <div className='mt-4'>
                                                <div className='flex items-center justify-center gap-1 text-amber-700 text-xs font-medium mb-3'>
                                                    <span>3위</span>
                                                </div>
                                                <div className='relative mx-auto mb-2 w-14 h-14'>
                                                    {ranks[2]?.imageUrl ? (
                                                        <img
                                                            src={
                                                                ranks[2]
                                                                    .imageUrl
                                                            }
                                                            alt='3위 프로필'
                                                            className='w-14 h-14 rounded-full ring-2 ring-amber-300 object-cover'
                                                            referrerPolicy='no-referrer'
                                                        />
                                                    ) : (
                                                        <div className='w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600'>
                                                            <span>🙂</span>
                                                        </div>
                                                    )}
                                                    {ranks[2]?.badgeUrl && (
                                                        <img
                                                            src={
                                                                ranks[2]
                                                                    .badgeUrl
                                                            }
                                                            alt='뱃지'
                                                            className='absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-white shadow'
                                                            referrerPolicy='no-referrer'
                                                        />
                                                    )}
                                                </div>
                                                <div className='text-sm font-semibold text-gray-900 truncate mb-1'>
                                                    {ranks[2]?.nickname ||
                                                        '익명'}
                                                </div>
                                                <div className='text-xs text-gray-700 font-semibold'>
                                                    {(
                                                        ranks[2]?.memberPoint ||
                                                        ranks[2]?.point ||
                                                        0
                                                    ).toLocaleString()}
                                                    P
                                                </div>
                                                <div className='mt-1 text-[11px] text-amber-700 font-medium'>
                                                    탄소{' '}
                                                    {(
                                                        ranks[2]?.carbonSave ||
                                                        0
                                                    ).toFixed(1)}
                                                    kg
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 4위 이하 - 리스트 디자인 */}
                            {ranks.length > 3 && (
                                <div className='mt-8'>
                                    <div className='space-y-2'>
                                        {ranks.slice(3, 10).map((t, index) => {
                                            const currentRank =
                                                t.rank || index + 4; // 4위부터 시작
                                            const currentPoint =
                                                t.memberPoint || t.point || 0;
                                            const isTop10 = currentRank <= 10;
                                            const isMe =
                                                data?.memberId &&
                                                t?.memberId === data.memberId;

                                            return (
                                                <motion.div
                                                    key={
                                                        t.memberId ||
                                                        currentRank
                                                    }
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        delay: index * 0.05,
                                                    }}
                                                    className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between border ${
                                                        isMe
                                                            ? 'border-[3px] border-[#4CAF50]/60'
                                                            : 'border-gray-100'
                                                    } hover:border-[#4CAF50]/30 group`}
                                                >
                                                    <div className='flex items-center gap-4 flex-1'>
                                                        {/* 순위 배지 */}
                                                        <div
                                                            className={`flex items-center justify-center min-w-[44px] h-11 rounded-xl font-bold text-sm transition-all ${
                                                                isTop10
                                                                    ? 'bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] text-white shadow-md group-hover:scale-110'
                                                                    : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                        >
                                                            {currentRank}
                                                        </div>

                                                        {/* 아바타 */}
                                                        <div className='relative'>
                                                            {t?.imageUrl ? (
                                                                <img
                                                                    src={
                                                                        t.imageUrl
                                                                    }
                                                                    alt='프로필'
                                                                    className='w-10 h-10 rounded-full border border-gray-200'
                                                                    referrerPolicy='no-referrer'
                                                                />
                                                            ) : (
                                                                <div className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500'>
                                                                    <span>
                                                                        🙂
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {t?.badgeUrl && (
                                                                <img
                                                                    src={
                                                                        t.badgeUrl
                                                                    }
                                                                    alt='뱃지'
                                                                    className='absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-white shadow'
                                                                    referrerPolicy='no-referrer'
                                                                />
                                                            )}
                                                        </div>

                                                        {/* 사용자 정보 */}
                                                        <div className='flex-1 min-w-0 text-left'>
                                                            <div className='font-semibold text-gray-900 mb-1 truncate'>
                                                                {t.nickname ||
                                                                    '익명'}
                                                            </div>
                                                            <div className='flex items-center gap-3 text-xs text-gray-500'>
                                                                <span className='flex items-center gap-1'>
                                                                    <span>
                                                                        🌱
                                                                    </span>
                                                                    <span>
                                                                        탄소
                                                                        감축{' '}
                                                                        {(
                                                                            t.carbonSave ||
                                                                            0
                                                                        ).toFixed(
                                                                            1
                                                                        )}
                                                                        kg
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 포인트
                                                       - 내 항목(isMe)은 경계선 색으로 은은하게 강조 */}
                                                    <div className='text-right ml-4'>
                                                        <div className='font-bold text-gray-900 text-lg'>
                                                            {currentPoint.toLocaleString()}
                                                            P
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className='bg-white rounded-xl p-8 text-center text-gray-500'>
                            <p className='mb-2'>아직 랭킹 데이터가 없습니다.</p>
                            <p className='text-sm'>
                                친환경 활동을 시작해보세요! 🌱
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
