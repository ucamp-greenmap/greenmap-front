import React from 'react';
import { ChevronRight } from 'lucide-react';

// 인증 타입 카드 컴포넌트
export default function CertTypeCard({ type, onClick }) {
    return (
        <button
            onClick={() => onClick(type)}
            className='w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100'
        >
            <div className='flex items-center gap-4'>
                <div
                    className={`bg-gradient-to-br ${type.color} rounded-2xl p-4 shadow-md`}
                >
                    <div className='text-3xl'>{type.icon}</div>
                </div>

                <div className='flex-1 text-left'>
                    <h3 className='font-semibold text-gray-900 mb-1'>
                        {type.label}
                    </h3>
                    <p className='text-gray-600 text-sm mb-1'>
                        {type.description}
                    </p>
                </div>

                <ChevronRight className='w-6 h-6 text-gray-400' />
            </div>
        </button>
    );
}
