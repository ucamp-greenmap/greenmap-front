import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchUserBadgeStatus,
    calculateEarnedBadges,
} from '../../store/slices/badgeSlice';
import { fetchMyPageData } from '../../store/slices/userSlice';
import { ArrowLeft } from 'lucide-react';

export default function BadgeScreen({ onBack, navigation }) {
    const dispatch = useDispatch();
    const [filter, setFilter] = useState('all');

    const { allBadges, earnedIds, loading } = useSelector(
        (state) => state.badge
    );
    const totalPoint = useSelector((state) => state.user.stats.totalPoint);

    // 현재 획득한 뱃지 중 가장 높은 레벨의 뱃지 찾기
    const myBadge = useMemo(() => {
        const earnedBadges = allBadges.filter((badge) =>
            earnedIds.includes(badge.id)
        );

        if (earnedBadges.length === 0) {
            // 획득한 뱃지가 없으면 첫 번째 뱃지 (기본 뱃지)
            return allBadges[0] || {};
        }

        // 가장 높은 requiredPoint를 가진 뱃지 찾기
        return earnedBadges.reduce((highest, current) => {
            return current.requiredPoint > highest.requiredPoint
                ? current
                : highest;
        }, earnedBadges[0]);
    }, [allBadges, earnedIds]);

    const handleGoBack = () => {
        if (onBack) {
            onBack();
        } else if (navigation) {
            navigation.goBack();
        } else if (window.history.length > 1) {
            window.history.back();
        }
    };

    useEffect(() => {
        // 1. 마이페이지 데이터 (누적 포인트) 호출
        dispatch(fetchMyPageData());
        // 2. 대표 배지 상태 호출 (단일 객체)
        dispatch(fetchUserBadgeStatus());
    }, [dispatch]);

    useEffect(() => {
        if (totalPoint !== undefined && totalPoint !== null) {
            dispatch(calculateEarnedBadges(totalPoint));
        }
    }, [dispatch, totalPoint]);

    const filteredBadges = useMemo(() => {
        return allBadges.filter((badge) => {
            const isAcquired = earnedIds.includes(badge.id);

            if (filter === 'all') return true;
            if (filter === 'acquired') return isAcquired;
            if (filter === 'notAcquired') return !isAcquired;
            return true;
        });
    }, [filter, allBadges, earnedIds]);

    return (
        <div className='min-h-screen bg-gray-50 flex flex-col items-center'>
            <div className='w-full bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] px-6 py-8 text-white shadow-md'>
                <div className='flex items-center gap-3 mb-6'>
                    <button
                        onClick={handleGoBack}
                        className='p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors'
                    >
                        <ArrowLeft className='w-5 h-5 text-white' />
                    </button>
                    <h1 className='text-xl font-bold'>뱃지 컬렉션</h1>
                </div>
                <p className='text-white text-opacity-90 text-sm text-center relative -top-2'>
                    GreenMap을 이용하고 뱃지를 수집해 보세요 🌱
                </p>
            </div>
            <div className='w-full max-w-3xl rounded-2xl p-6'>
                {/* 대표 뱃지 영역 */}
                <div className='bg-white rounded-xl shadow p-5 mb-6 flex items-center justify-between'>
                    <div className='flex justify-center'>
                        <div className='rounded-2xl flex items-center space-x-4 w-auto'>
                            <img
                                src={myBadge.image_url || '/default_badge.png'}
                                alt={myBadge.name || '대표 뱃지'}
                                className='w-16 h-16 rounded-full border-2 border-green-400 object-cover'
                            />
                            <div className='text-left'>
                                <span className='block text-lg font-semibold text-gray-800'>
                                    {myBadge.name || '대표 뱃지'}
                                </span>
                                <span className='text-sm text-gray-500'>
                                    {myBadge.description ||
                                        `현재 ${
                                            totalPoint?.toLocaleString() || 0
                                        } P 보유 중`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 필터링 버튼 영역 */}
                <div className='bg-gray-200 rounded-2xl p-3 mb-4 flex justify-center space-x-6'>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                            filter === 'all'
                                ? 'bg-green-600 text-white shadow'
                                : 'text-gray-600 hover:text-green-600'
                        }`}
                    >
                        전체
                    </button>
                    <button
                        onClick={() => setFilter('acquired')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                            filter === 'acquired'
                                ? 'bg-green-600 text-white shadow'
                                : 'text-gray-600 hover:text-green-600'
                        }`}
                    >
                        획득
                    </button>
                    <button
                        onClick={() => setFilter('notAcquired')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                            filter === 'notAcquired'
                                ? 'bg-green-600 text-white shadow'
                                : 'text-gray-600 hover:text-green-600'
                        }`}
                    >
                        미획득
                    </button>
                </div>

                {/* 뱃지 목록 영역 */}
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4'>
                    {loading ? (
                        <div className='col-span-4 text-center py-10 text-gray-500'>
                            뱃지 정보를 불러오는 중...
                        </div>
                    ) : filteredBadges.length > 0 ? (
                        filteredBadges.map((badge) => (
                            <BadgeCard
                                key={badge.id}
                                name={badge.name}
                                wholePoint={badge.requiredPoint || 0}
                                currentPoint={totalPoint || 0}
                                description={badge.description}
                                image_url={badge.image_url}
                                created_at={
                                    earnedIds.includes(badge.id)
                                        ? '획득 완료'
                                        : null
                                }
                            />
                        ))
                    ) : (
                        <div className='col-span-4 text-center py-10 text-gray-500'>
                            선택된 필터에 해당하는 뱃지가 없습니다.
                        </div>
                    )}
                </div>

                {/* 획득 현황 요약 */}
                <div className='flex justify-center p-3'>
                    <div className=' rounded-2xl flex items-center space-x-4 w-auto'>
                        <div className='text-left'>
                            <span className='block text-lg font-semibold text-gray-800'>
                                {earnedIds.length} / {allBadges.length} 뱃지
                                보유
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className=' text-sm text-gray-500 pb-32 text-center'>
                그린맵 v1.0.0
            </div>
        </div>
    );
}

function BadgeCard({
    name,
    wholePoint,
    currentPoint,
    description,
    image_url,
    created_at,
}) {
    const isCompleted = currentPoint >= wholePoint;
    let progress = 0;

    if (wholePoint > 0) {
        progress = Math.min((currentPoint / wholePoint) * 100, 100);
    } else {
        progress = 100;
    }

    return (
        <div
            className={`relative bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center text-center ${
                !isCompleted ? 'opacity-70' : ''
            }`}
        >
            {isCompleted && (
                <span className='absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full'>
                    완료
                </span>
            )}
            <img
                src={image_url || '/default-badge.png'}
                alt={name}
                className={`w-20 h-20 object-cover rounded-full border-2 ${
                    isCompleted ? 'border-green-400' : 'border-gray-400'
                } mb-2`}
            />

            {/* 진행 바 */}
            <div className='w-full bg-gray-200 h-3 rounded-full'>
                <div
                    className='bg-green-600 h-3 rounded-full transition-all duration-300'
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className='text-sm text-gray-500 mb-2'>
                {isCompleted
                    ? '획득 완료'
                    : `${currentPoint.toLocaleString()} / ${wholePoint.toLocaleString()} P`}
            </div>

            <div className='font-semibold text-gray-800'>{name}</div>
            <div className='text-xs text-gray-500 mt-1'>{description}</div>

            {created_at && isCompleted && (
                <div className='text-xs text-green-600 mt-2'>{created_at}</div>
            )}
        </div>
    );
}
