import React from 'react';
import { Home, MapPin, CheckCircle, Target, User } from 'lucide-react';

export function BottomNavigation({ active = 'home', onChange = () => {} }) {
    const tabs = [
        { id: 'home', label: '홈', icon: Home },
        { id: 'map', label: '지도', icon: MapPin },
        { id: 'cert', label: '인증', icon: CheckCircle },
        { id: 'challenge', label: '챌린지', icon: Target },
        { id: 'mypage', label: '내정보', icon: User },
    ];

    return (
        <nav
            aria-label='하단 네비게이션'
            role='navigation'
            className='fixed bottom-4 left-4 right-4 bg-white rounded-3xl shadow-lg p-2 flex justify-between items-center'
        >
            {tabs.map((t) => {
                const Icon = t.icon;
                const isActive = t.id === active;
                return (
                    <button
                        key={t.id}
                        onClick={() => onChange(t.id)}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={t.label}
                        className={`flex-1 flex flex-col items-center gap-1 py-2 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] ${
                            isActive ? 'text-[#4CAF50]' : 'text-gray-400'
                        }`}
                    >
                        <Icon className='w-6 h-6' aria-hidden='true' />
                        <span className='text-xs'>{t.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}

export default BottomNavigation;
