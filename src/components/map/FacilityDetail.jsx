import React from 'react';
import { getCategoryLabel } from '../../util/mapHelpers';

export default function FacilityDetail({
    facility,
    bookmarkedIds,
    onClose,
    onBookmarkToggle,
}) {
    const isBookmarked = bookmarkedIds.includes(facility.id);

    return (
        <div className='relative'>
            <button
                onClick={onClose}
                className='absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 transition-colors'
                aria-label='닫기'
            >
                <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                    />
                </svg>
            </button>

            <h3 className='text-xl font-bold mb-4 pr-10'>{facility.name}</h3>

            {/* Image placeholder */}
            <div className='w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4'>
                <span className='text-gray-500'>이미지 없음</span>
            </div>

            {/* Category */}
            <div className='mb-4'>
                <span className='inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'>
                    {getCategoryLabel(facility.category)}
                </span>
            </div>

            {/* Address */}
            <div className='mb-4'>
                <h4 className='text-sm font-semibold text-gray-600 mb-1'>
                    주소
                </h4>
                <p className='text-gray-800'>
                    {facility.address || '서울시 중구 을지로 123'}
                </p>
            </div>

            {/* Coordinates */}
            <div className='mb-4'>
                <h4 className='text-sm font-semibold text-gray-600 mb-1'>
                    위치
                </h4>
                <p className='text-gray-800 text-sm'>
                    위도: {facility.lat}, 경도: {facility.lng}
                </p>
            </div>

            {/* Bookmark button */}
            <button
                onClick={() => onBookmarkToggle(facility.id)}
                className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isBookmarked
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
                <svg
                    className='w-5 h-5'
                    fill={isBookmarked ? 'currentColor' : 'none'}
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
                {isBookmarked ? '북마크 해제' : '북마크 추가'}
            </button>
        </div>
    );
}
