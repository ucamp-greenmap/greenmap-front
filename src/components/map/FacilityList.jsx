import React, { useMemo } from 'react';
import { getCategoryLabel } from '../../util/mapHelpers';
import { formatDistance, sortByDistance } from '../../util/location';

export default function FacilityList({
    facilities,
    bookmarkedIds,
    onFacilityClick,
    onBookmarkToggle,
    isLoading = false,
}) {
    // 북마크 조회 최적화를 위한 Set 생성
    const bookmarkSet = useMemo(() => new Set(bookmarkedIds), [bookmarkedIds]);

    // 거리순으로 정렬된 시설 목록
    const sortedFacilities = useMemo(() => {
        return sortByDistance(facilities);
    }, [facilities]);

    // 로딩 중일 때 로딩 메시지 표시
    if (isLoading) {
        return (
            <div className='flex flex-col items-center justify-center py-8 text-gray-500'>
                <div className='relative'>
                    <div className='w-12 h-12 border-4 border-gray-200 rounded-full'></div>
                    <div className='w-12 h-12 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin absolute top-0 left-0'></div>
                </div>
                <p className='text-sm font-medium mt-4'>
                    시설 정보를 불러오는 중...
                </p>
            </div>
        );
    }

    // 시설이 없을 때 메시지 표시
    if (sortedFacilities.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center py-8 text-gray-500'>
                <svg
                    className='w-16 h-16 mb-4 text-gray-300'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
                    />
                </svg>
                <p className='text-sm font-medium'>
                    이 영역에 표시할 시설이 없습니다
                </p>
                <p className='text-xs mt-1'>지도를 이동하거나 확대해보세요</p>
            </div>
        );
    }

    return (
        <>
            <div className='flex items-center justify-between mb-3 px-1'>
                <h3 className='text-base font-bold'>시설 목록</h3>
                <span className='text-sm text-gray-500'>
                    {sortedFacilities.length}개
                </span>
            </div>
            <ul className='space-y-2' role='list' aria-label='시설 목록'>
                {sortedFacilities.map((facility) => {
                    const isBookmarked = bookmarkSet.has(facility.id);

                    return (
                        <li
                            key={facility.id}
                            role='listitem'
                            onClick={() => onFacilityClick(facility)}
                            className='flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'
                        >
                            <div className='flex-1 min-w-0'>
                                <div className='font-semibold text-gray-800 truncate'>
                                    {facility.name}
                                </div>
                                <div className='flex items-center gap-2 text-sm text-gray-500'>
                                    <span>
                                        {getCategoryLabel(facility.category)}
                                    </span>
                                    {facility.distance && (
                                        <>
                                            <span className='text-gray-300'>
                                                •
                                            </span>
                                            <span className='text-blue-600 font-medium'>
                                                📍{' '}
                                                {formatDistance(
                                                    facility.distance
                                                )}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className='flex items-center gap-2 flex-shrink-0 ml-3'>
                                <button
                                    className={`text-2xl transition-colors ${
                                        isBookmarked
                                            ? 'text-blue-500'
                                            : 'text-gray-400 hover:text-blue-500'
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onBookmarkToggle(facility.id);
                                    }}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter' ||
                                            e.key === ' '
                                        ) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onBookmarkToggle(facility.id);
                                        }
                                    }}
                                    aria-pressed={isBookmarked}
                                    aria-label={
                                        isBookmarked
                                            ? `${facility.name} 북마크 해제`
                                            : `${facility.name} 북마크 추가`
                                    }
                                >
                                    <svg
                                        className='w-6 h-6'
                                        fill={
                                            isBookmarked
                                                ? 'currentColor'
                                                : 'none'
                                        }
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
                                        />
                                    </svg>
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
