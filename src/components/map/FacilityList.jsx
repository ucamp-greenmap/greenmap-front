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
            <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                <div className='relative'>
                    <div className='w-14 h-14 border-4 border-gray-100 rounded-full'></div>
                    <div className='w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0'></div>
                </div>
                <p className='text-sm font-semibold mt-5 text-gray-700'>
                    시설 정보를 불러오는 중...
                </p>
            </div>
        );
    }

    // 시설이 없을 때 메시지 표시
    if (sortedFacilities.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center py-12 px-4'>
                <div className='w-20 h-20 mb-5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center'>
                    <svg
                        className='w-10 h-10 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                        />
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                    </svg>
                </div>
                <p className='text-base font-bold text-gray-800 mb-1'>
                    이 영역에 시설이 없어요
                </p>
                <p className='text-sm text-gray-500'>
                    지도를 이동하거나 확대해보세요
                </p>
            </div>
        );
    }

    return (
        <div className='px-1'>
            {/* 헤더 */}
            <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-bold text-gray-900'>주변 시설</h3>
                <span className='px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full'>
                    {sortedFacilities.length}
                </span>
            </div>

            {/* 시설 카드 리스트 */}
            <ul className='space-y-3' role='list' aria-label='시설 목록'>
                {sortedFacilities.map((facility) => {
                    const isBookmarked = bookmarkSet.has(facility.id);

                    return (
                        <li
                            key={facility.id}
                            role='listitem'
                            onClick={() => onFacilityClick(facility)}
                            className='group relative bg-white hover:bg-gray-50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-primary/20'
                        >
                            <div className='flex items-center gap-4'>
                                {/* 시설 이미지 썸네일 */}
                                {facility.imageUrl && (
                                    <div className='relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm'>
                                        <img
                                            src={facility.imageUrl}
                                            alt={facility.name}
                                            className='w-full h-full object-cover'
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                {/* 시설 정보 */}
                                <div className='flex-1 min-w-0'>
                                    <h4 className='font-bold text-gray-900 truncate text-[15px] mb-1'>
                                        <span className='text-left block'>{facility.name}</span>
                                    </h4>

                                    <div className='flex items-center gap-2 flex-wrap'>
                                        {/* 카테고리 배지 */}
                                        <span className='inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md'>
                                            {getCategoryLabel(
                                                facility.category
                                            )}
                                        </span>

                                        {/* 거리 정보 */}
                                        {facility.distance && (
                                            <span className='inline-flex items-center gap-1 text-xs font-semibold text-primary'>
                                                <svg
                                                    className='w-3.5 h-3.5'
                                                    fill='currentColor'
                                                    viewBox='0 0 20 20'
                                                >
                                                    <path
                                                        fillRule='evenodd'
                                                        d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                                                        clipRule='evenodd'
                                                    />
                                                </svg>
                                                {formatDistance(
                                                    facility.distance
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* 북마크 버튼 */}
                                <button
                                    className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
                                        isBookmarked
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-primary'
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
                                        className='w-5 h-5'
                                        fill={
                                            isBookmarked
                                                ? 'currentColor'
                                                : 'none'
                                        }
                                        stroke='currentColor'
                                        strokeWidth={2}
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
                                        />
                                    </svg>
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
