import React from 'react';
import { getCategoryLabel } from '../../util/mapHelpers';

export default function FacilityList({
    facilities,
    bookmarkedIds,
    onFacilityClick,
    onBookmarkToggle,
}) {
    return (
        <>
            <h3 className='text-base font-bold mb-3 px-1'>시설 목록</h3>
            <ul className='space-y-2' role='list' aria-label='시설 목록'>
                {facilities.map((facility) => (
                    <li
                        key={facility.id}
                        role='listitem'
                        onClick={() => onFacilityClick(facility)}
                        className='flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'
                    >
                        <div>
                            <div className='font-semibold text-gray-800'>
                                {facility.name}
                            </div>
                            <div className='text-sm text-gray-500'>
                                {getCategoryLabel(facility.category)}
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <button
                                className='text-2xl text-gray-400 hover:text-blue-500 transition-colors'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onBookmarkToggle(facility.id);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onBookmarkToggle(facility.id);
                                    }
                                }}
                                aria-pressed={bookmarkedIds.includes(
                                    facility.id
                                )}
                                aria-label={
                                    bookmarkedIds.includes(facility.id)
                                        ? `${facility.name} 북마크 해제`
                                        : `${facility.name} 북마크 추가`
                                }
                            >
                                <svg
                                    className='w-6 h-6'
                                    fill={
                                        bookmarkedIds.includes(facility.id)
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
                ))}
            </ul>
        </>
    );
}
