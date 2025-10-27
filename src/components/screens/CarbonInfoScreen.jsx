import React from 'react';

export default function CarbonInfoScreen() {
    return (
        <div className='p-4 space-y-4'>
            <h2 className='text-lg font-bold'>탄소 중립</h2>
            <div className='bg-white rounded-2xl p-4 shadow'>
                <div className='text-sm text-gray-500'>이번 달 탄소 감축량</div>
                <div className='text-2xl font-bold'>42.5 kg CO₂</div>
                <div className='w-full bg-gray-200 rounded-full h-2 mt-3'>
                    <div
                        className='bg-[#4CAF50] h-2 rounded-full'
                        style={{ width: '85%' }}
                    />
                </div>
            </div>

            <div className='grid grid-cols-3 gap-3'>
                <div className='bg-white rounded-2xl p-3 shadow text-center'>
                    나무 심기 효과
                    <br />
                    <b>8.5그루</b>
                </div>
                <div className='bg-white rounded-2xl p-3 shadow text-center'>
                    절약 전력
                    <br />
                    <b>212 kWh</b>
                </div>
                <div className='bg-white rounded-2xl p-3 shadow text-center'>
                    재활용 효과
                    <br />
                    <b>15 kg</b>
                </div>
            </div>
        </div>
    );
}
