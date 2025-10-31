import React from 'react';

const badgesList = [
    {
        "badge_count" : 3,
		"total_badge" : 24,
		"success_rate" : "",
		"badge_list" : [
			{
				"name" : "따릉이 인증 lv2",
				"description" : "따릉이를 타고 인증 5번 하기",
				"image_url" : String,
				"created_at" : '2025-10-22', // 얻은날
				"isFinish" : true, // 획득여부
				"progress" : 5, // 달성률
				"total_progress" : 5, // 달성조건
			}
		]
    },
    {
        "badge_count" : 10,
		"total_badge" : 24,
		"success_rate" : "",
		"badge_list" : [
			{
				"name" : "재활용 인증 lv3",
				"description" : "제로웨이스트 이용 후 영수증 10회 인증",
				"image_url" : String,
				"created_at" : '',
				"isFinish" : false,
				"progress" : 7,
				"total_progress" : 10,
			}
		]
    },
    {
        "badge_count" : 18,
		"total_badge" : 24,
		"success_rate" : "",
		"badge_list" : [
			{
				"name" : "전기차 인증 lv6",
				"description" : "전기차 충전 후 영수증 인증 30회",
				"image_url" : String,
				"created_at" : '2025',
				"isFinish" : false,
				"progress" : 16,
				"total_progress" : 30, 
			}
		]
    },
]

export default function BadgeScreen() {
    const [filter, setFilter] = React.useState('all');


    return (
        <div className='p-4'>
            <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] px-6 py-8'>
                <h1 className='text-3xl font-bold text-white mb-2'>
                    뱃지 컬렉션
                </h1>
                <p className='text-white text-opacity-90 text-sm'>
                    GreenMap을 이용하고 뱃지를 수집해 보세요
                </p>
            </div>

            <div>
                <div>
                    <img src='' alt='대표  뱃지'></img>
                    <span>뱃지 이름</span>
                </div>
                <div>
                    획득한 뱃지 / 전체 뱃지 [달성률]
                </div>
                <button>마이페이지로</button>
            </div>

            <div className='bg-white rounded-2xl p-3 m-2 shadow text-center focus:outline-none'>
                <button onClick={() => setFilter('all')} className='text-gray-500 p-5'>전체</button>
                <button onClick={() => setFilter('acquired')} className='text-gray-500 p-5'>획득</button>
                <button onClick={() => setFilter('notAcquired')} className='text-gray-500 p-5'>미획득</button>
           
            </div>

            <div>
                {/** 그리드 4줄로 */}
                {badgesList.flatMap(b => 
                    b.badge_list.map(badge => ({
                        ...badge,
                        badge_count: b.badge_count,
                        total_badge: b.total_badge
                    }))
                ).filter(badge => {
                    if (filter === 'all') return true;
                    if (filter === 'acquired') return badge.isFinish === true;
                    if (filter === 'notAcquired') return badge.isFinish === false;
                })
                .map(badge => (
                    <BadgeCard key={badge.name} filter={filter} {...badge} />
                ))
                }
            </div>

        </div>
    );
}


function BadgeCard({badge_count, total_badge, name, description, image_url, created_at, isFinish, progress, total_progress}) {

    return (
        <div className={`m-1 bg-white ${isFinish === false ? 'opacity-70' : ''}`}>
            <div>
                <div>
                    <span>{badge_count} / {total_badge}</span>
                </div>
                <div>
                    <img src={image_url} alt='뱃지 이미지'></img>
                    <span>
                        {isFinish === true ? created_at : ''}
                        {isFinish === false ? progress + ' / ' + total_progress : ''}   
                    </span>
                </div>
            </div>
            <div>
                <span>{name}</span>
                <span>{description}</span>
            </div>
        </div>
    )

}