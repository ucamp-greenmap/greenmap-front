import React from 'react';

const badges = [
    {
        badge_id: 1,
        image_id: '🌱',
        badge_name: '첫걸음',
        requirement: '첫 로그인시 지급',
        description: '첫 걸음을 내딛은 환경전사에게 주어지는 뱃지',
        is_active: true,
    },
    {
        badge_id: 5,
        image_id: '🛍️',
        badge_name: '제로웨이스트 영웅',
        requirement: '제로웨이스트 상점 영수증 인증 15회 달성',
        description: '당신은 제로웨이스트 상점을 이용하여 환경오염을 조금 늦췄습니다. 15번이나요!',
    },
];

const getBadges = [
    {
        member_badge_id: 1001,
        member_id: 'user001',
        badge_id: 1,
        created_at: '2024-12-25',
    },
    {
        member_badge_id: 1001,
        member_id: 'user001',
        badge_id: 11,
        created_at: '2025-2-3',
    },
    {
        member_badge_id: 1001,
        member_id: 'user001',
        badge_id: 12,
        created_at: '2025-5-16',
    },
]; // 회원이 얻은 뱃지

export default function BadgeScreen() {
    return (
        <div className='p-4'>
            <h2 className='text-lg font-bold'>뱃지 컬렉션</h2>
            <div>대표 뱃지 설정 / 대표뱃지 이름+습득조건 /  (획득한뱃지/전체뱃지) / 달성률 / 마이페이지로</div>
            <div>전체 / 획득 / 미획득 리스트(옅은색)</div>
            <p>리스트 돌리기</p>
            <div>뱃지 아이콘 / 이름 / 설명 / 조건 </div>

            <div className='mt-3 grid grid-cols-2 gap-3'>
                {badges.map((b) => (
                    <div
                        key={b.badge_id}
                        className={`bg-white rounded-2xl p-4 shadow text-center ${
                            b.badge_id === 1 ? '' : 'opacity-60'
                        }`}
                    >
                        <div className='text-3xl mb-2'>{b.image_id} {b.badge_name}</div>
                        <div>
                             {b.description}
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                            조건: {b.requirement}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
