import React from 'react';

const FILTER_OPTIONS = [
    { key: 'all', label: '전체' },
    { key: 'recycle', label: '재활용 센터' },
    { key: 'ev', label: '전기차' },
    { key: 'hcar', label: '수소차' },
    { key: 'store', label: '제로웨이스트' },
    { key: 'bike', label: '따릉이' },
    { key: 'bookmark', label: '북마크' },
];

export default function FilterBar({ selectedFilter, onFilterChange }) {
    return (
        <div className='absolute top-2 left-0 right-0 z-10 w-full px-4 pointer-events-none'>
            <div className='max-w-full mx-auto flex justify-center'>
                <div className='inline-flex gap-2 overflow-x-auto pb-2 pointer-events-auto bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-3 py-2'>
                    {FILTER_OPTIONS.map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => onFilterChange(filter.key)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onFilterChange(filter.key);
                                }
                            }}
                            aria-pressed={selectedFilter === filter.key}
                            aria-label={`필터 ${filter.label}`}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                selectedFilter === filter.key
                                    ? 'bg-green-500 text-white shadow'
                                    : 'bg-white/80 text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
