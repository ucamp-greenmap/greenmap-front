import React from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';

const sample = [
    {
        id: 1,
        type: '전기차 충전 인증',
        date: '2024-10-27 14:30',
        points: 50,
        action: 'earn',
    },
    {
        id: 2,
        type: '스타벅스 기프티콘',
        date: '2024-10-25 10:15',
        points: -1000,
        action: 'use',
    },
];

export default function PointHistoryScreen({ onNavigate }) {
    const dispatch = useDispatch();
    const navigate = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTab(tab));
    };

    return (
        <div className='p-4'>
            <div className='flex items-center gap-3 mb-4'>
                <button
                    onClick={() => navigate('home')}
                    className='text-sm text-gray-600 px-2 py-1 rounded hover:bg-gray-100'
                >
                    ← 뒤로
                </button>
                <h2 className='text-lg font-bold'>포인트 적립 내역</h2>
            </div>

            <div className='mt-4 space-y-3'>
                {sample.map((s) => (
                    <div
                        key={s.id}
                        className='bg-white rounded-2xl p-3 shadow flex items-center justify-between'
                    >
                        <div>
                            <div className='font-medium'>{s.type}</div>
                            <div className='text-xs text-gray-500'>
                                {s.date}
                            </div>
                        </div>
                        <div
                            className={`${
                                s.action === 'earn'
                                    ? 'text-green-600'
                                    : 'text-red-500'
                            } font-semibold`}
                        >
                            {s.points > 0 ? `+${s.points}` : s.points}P
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
