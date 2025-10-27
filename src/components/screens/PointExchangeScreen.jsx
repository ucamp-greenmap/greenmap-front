import React from 'react';

export default function PointExchangeScreen() {
    const offers = [
        { id: 1, name: '스타벅스', points: 500, amount: '5,000원' },
        { id: 2, name: '이디야커피', points: 400, amount: '4,000원' },
        { id: 3, name: 'GS25', points: 1000, amount: '10,000원' },
    ];

    return (
        <div className='p-4 space-y-4'>
            <h2 className='text-lg font-bold'>포인트 교환소</h2>
            <div className='bg-white rounded-2xl p-4 shadow'>
                <div className='text-sm text-gray-500'>보유 포인트</div>
                <div className='text-2xl font-bold'>1,500P</div>
            </div>

            <div className='grid grid-cols-1 gap-3'>
                {offers.map((o) => (
                    <div
                        key={o.id}
                        className='bg-white rounded-2xl p-4 shadow flex items-center justify-between'
                    >
                        <div>
                            <div className='font-medium'>{o.name}</div>
                            <div className='text-xs text-gray-500'>
                                {o.amount}
                            </div>
                        </div>
                        <div className='text-right'>
                            <div className='font-semibold'>{o.points}P</div>
                            <button className='mt-2 px-3 py-1 bg-[#4CAF50] text-white rounded'>
                                구매
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
