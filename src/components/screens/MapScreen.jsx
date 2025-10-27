import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleBookmark, setFilter } from '../../store/slices/facilitySlice';

export default function MapScreen() {
    const facilities = useSelector((s) => s.facility.facilities);
    const bookmarked = useSelector((s) => s.facility.bookmarkedIds);
    const filter = useSelector((s) => s.facility.filter);
    const dispatch = useDispatch();

    // simple mock if no facilities
    const list = facilities.length
        ? facilities
        : [
              { id: 'f1', name: '재활용 센터 A', category: 'recycle' },
              { id: 'f2', name: '전기차 충전소 B', category: 'ev' },
              { id: 'f3', name: '제로웨이스트 샵 C', category: 'store' },
          ];

    const filtered =
        filter === 'all' ? list : list.filter((f) => f.category === filter);

    return (
        <div className='p-4'>
            <div className='flex gap-2 overflow-x-auto'>
                {['all', 'recycle', 'ev', 'store'].map((c) => (
                    <button
                        key={c}
                        onClick={() => dispatch(setFilter(c))}
                        className={`px-3 py-1 rounded-full ${
                            filter === c
                                ? 'bg-[#4CAF50] text-white'
                                : 'bg-white'
                        }`}
                    >
                        {c === 'all' ? '전체' : c}
                    </button>
                ))}
            </div>

            <div className='mt-4 bg-gray-100 rounded-lg h-48 flex items-center justify-center'>
                지도 미리보기 영역
            </div>

            <ul className='mt-4 space-y-3'>
                {filtered.map((f) => (
                    <li
                        key={f.id}
                        className='bg-white rounded-2xl p-3 shadow flex items-center justify-between'
                    >
                        <div>
                            <div className='font-medium'>{f.name}</div>
                            <div className='text-xs text-gray-500'>
                                {f.category}
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <button
                                onClick={() => dispatch(toggleBookmark(f.id))}
                                className='px-2 py-1 bg-white rounded'
                            >
                                {bookmarked.includes(f.id) ? '★' : '☆'}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
