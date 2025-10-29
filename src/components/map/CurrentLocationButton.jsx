import React from 'react';

/**
 * Current Location Button Component
 * @param {Object} props
 * @param {Function} props.onClick - 버튼 클릭 핸들러
 * @param {boolean} props.isLoading - 로딩 상태
 */
export default function CurrentLocationButton({ onClick, isLoading }) {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className='absolute top-16 right-4 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            aria-label='현재 위치로 이동'
            title='현재 위치로 이동'
        >
            {isLoading ? (
                // Loading spinner
                <svg
                    className='w-6 h-6 text-gray-600 animate-spin'
                    fill='none'
                    viewBox='0 0 24 24'
                >
                    <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                    />
                    <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                </svg>
            ) : (
                // Location icon
                <svg
                    className='w-6 h-6 text-blue-600'
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
            )}
        </button>
    );
}

/**
 * 위치 조정 가이드:
 * className의 positioning 속성을 수정하여 버튼 위치 변경 가능
 *
 * - top-16: 위에서의 거리 (숫자↓=위로, 숫자↑=아래로)
 *   예: top-4, top-8, top-12, top-16, top-20, top-24 등
 *
 * - right-4: 오른쪽에서의 거리 (숫자↑=왼쪽으로)
 *   예: right-2, right-4, right-6, right-8 등
 *
 * - 왼쪽으로 배치하려면: right-4 → left-4
 * - 아래로 배치하려면: top-16 → bottom-20
 *
 * 예시:
 * - 우측 하단: 'absolute bottom-32 right-4 z-10 ...'
 * - 좌측 상단: 'absolute top-16 left-4 z-10 ...'
 * - 좌측 하단: 'absolute bottom-32 left-4 z-10 ...'
 */
