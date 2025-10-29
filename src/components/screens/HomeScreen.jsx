import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addPoints } from '../../store/slices/pointSlice';
import { setActiveTab } from '../../store/slices/appSlice';

// HomeScreen
// Props: onNavigate?: (tab: string) => void
export default function HomeScreen({ onNavigate }) {
    const dispatch = useDispatch();
    const currentPoints = useSelector((s) => s.point.currentPoints);
    const [readArticles, setReadArticles] = useState([]);
    const [toast, setToast] = useState(null);

    const ecoNews = [
        {
            id: 1,
            title: '서울시, 전기차 충전 네트워크 확대',
            description: '2025년까지 전 자치구에 500개 신규 충전소 설치 예정',
            image: null,
            category: '인프라',
            date: '2024년 10월 24일',
            points: 5,
        },
        {
            id: 2,
            title: '제로웨이스트 매장 200% 성장',
            description: '포장재 없는 쇼핑 트렌드, 도심 지역 중심으로 확산',
            image: null,
            category: '라이프스타일',
            date: '2024년 10월 23일',
            points: 5,
        },
        {
            id: 3,
            title: '자전거 공유, 도시 배출량 감소 효과',
            description: '단거리 자동차 이용 30% 감소 연구 결과 발표',
            image: null,
            category: '환경',
            date: '2024년 10월 22일',
            points: 5,
        },
        {
            id: 4,
            title: '새로운 재활용 분리배출 가이드라인',
            description: '정부, 효율적 폐기물 관리를 위한 분류 기준 업데이트',
            image: null,
            category: '정책',
            date: '2024년 10월 21일',
            points: 5,
        },
    ];

    // SVG data-URL placeholder (avoids external requests)
    const placeholderSvg = encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'>" +
            "<rect fill='%23e5e7eb' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23939' font-size='12'>이미지</text></svg>"
    );
    const placeholder = `data:image/svg+xml;charset=UTF-8,${placeholderSvg}`;

    const todayReadsRemaining = Math.max(0, 3 - readArticles.length);

    const handleReadArticle = (articleId, points) => {
        if (readArticles.includes(articleId)) return;
        if (readArticles.length >= 3) {
            setToast('오늘의 뉴스 보상 한도에 도달했습니다');
            setTimeout(() => setToast(null), 2000);
            return;
        }
        setReadArticles((prev) => [...prev, articleId]);
        dispatch(
            addPoints({
                points,
                type: `뉴스 읽기: ${articleId}`,
                category: '뉴스',
            })
        );
        setToast(`+${points}P 획득!`);
        setTimeout(() => setToast(null), 2000);
    };

    const navigate = (tab) => {
        if (typeof onNavigate === 'function') {
            onNavigate(tab);
            return;
        }
        // fallback: dispatch redux action to change active tab
        dispatch(setActiveTab(tab));
    };

    return (
        /**
         * 📱 HomeScreen 스크롤 영역 설정
         *
         * paddingBottom: var(--bottom-nav-inset)
         * - 하단에 BottomNavigation 높이만큼 padding 추가
         * - 스크롤 시 BottomNavigation이 콘텐츠를 가리지 않도록 함
         * - --bottom-nav-inset는 index.css에서 정의 (기본값: 96px)
         *
         * 조정 방법:
         * - padding을 더 크게: index.css에서 --bottom-nav-inset 값 증가
         * - padding을 더 작게: index.css에서 --bottom-nav-inset 값 감소
         *
         * ⚠️ 주의: className='pb-24' 대신 inline style 사용
         * - pb-24는 고정 padding (96px)
         * - CSS 변수 사용으로 일관된 spacing 유지
         */
        <div style={{ paddingBottom: 'var(--bottom-nav-inset)' }}>
            {/* Header - gradient */}
            <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] px-6 pt-12 pb-6 rounded-b-3xl text-white'>
                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-white rounded-full p-5 shadow-xl mb-4'>
                        <div className='w-12 h-12 flex items-center justify-center text-[#4CAF50] text-3xl'>
                            🌿
                        </div>
                    </div>
                    <h1 className='text-white text-2xl font-bold mb-1'>
                        그린맵
                    </h1>
                    <p className='text-white/90 text-sm'>
                        지속가능한 생활 지도
                    </p>
                </div>

                <div className='relative w-full max-w-md mx-auto'>
                    <input
                        type='text'
                        placeholder='시설, 뉴스, 챌린지 검색...'
                        className='w-full pl-12 pr-4 py-4 rounded-[30px] text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-lg'
                        aria-label='시설, 뉴스, 챌린지 검색'
                    />
                    <div className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                        🔍
                    </div>
                </div>
            </div>

            {/* Page content - keep padded while header stays full width */}
            <div className='px-6'>
                {/* Point card */}
                <div className='mt-4'>
                    <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] rounded-3xl p-6 text-white shadow-xl border-0 max-w-md mx-auto'>
                        <div className='flex items-center justify-between mb-4'>
                            <div>
                                <p className='text-white/90 mb-1'>
                                    나의 그린 포인트
                                </p>
                                <div className='flex items-baseline gap-2'>
                                    <span className='text-4xl font-bold'>
                                        {currentPoints}
                                    </span>
                                    <span className='text-lg'>P</span>
                                </div>
                            </div>
                            <div className='bg-white/20 p-3 rounded-2xl backdrop-blur-sm'>
                                <div className='text-white text-2xl'>🏆</div>
                            </div>
                        </div>

                        <div className='bg-white/20 rounded-2xl p-3 backdrop-blur-sm mb-4'>
                            <div className='flex items-center justify-between mb-2'>
                                <span className='text-white/90'>
                                    탄소 감축량
                                </span>
                                <div className='text-white'>📈</div>
                            </div>
                            <div className='flex items-baseline gap-2'>
                                <span className='text-2xl font-semibold'>
                                    42.5
                                </span>
                                <span className='text-sm'>kg CO₂</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('cert')}
                            className='w-full bg-white text-[#4CAF50] py-3 rounded-[20px] text-center transition-transform hover:scale-105'
                        >
                            활동 인증하고 포인트 받기
                        </button>
                    </div>
                </div>

                {/* Sections */}
                <div className='max-w-md mx-auto mt-6 space-y-6'>
                    {/* News header */}
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <div className='text-[#4CAF50] text-xl'>📰</div>
                            <h2 className='text-gray-900 font-semibold'>
                                환경 뉴스
                            </h2>
                        </div>
                        <div className='text-[#4CAF50] text-sm'>
                            {todayReadsRemaining > 0
                                ? `기사당 +5P (오늘 ${todayReadsRemaining}개 남음)`
                                : '오늘 한도 달성'}
                        </div>
                    </div>

                    <div className='space-y-3'>
                        {ecoNews.map((article) => {
                            const isRead = readArticles.includes(article.id);
                            const canRead = !isRead && readArticles.length < 3;
                            return (
                                <button
                                    key={article.id}
                                    onClick={() =>
                                        handleReadArticle(
                                            article.id,
                                            article.points
                                        )
                                    }
                                    disabled={!canRead}
                                    className={`w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border-2 ${
                                        isRead
                                            ? 'border-[#4CAF50] opacity-90'
                                            : 'border-gray-100'
                                    }`}
                                >
                                    <img
                                        src={article.image || placeholder}
                                        alt={article.title}
                                        loading='lazy'
                                        className='w-20 h-20 object-cover rounded-xl flex-shrink-0 mr-3'
                                    />
                                    <div className='flex-1 text-left'>
                                        <div className='flex items-start justify-between mb-2'>
                                            <span className='bg-[#4CAF50] bg-opacity-10 text-[#4CAF50] px-2 py-1 rounded-full text-xs'>
                                                {article.category}
                                            </span>
                                            {isRead && (
                                                <div className='flex items-center gap-1 text-[#4CAF50] text-sm'>
                                                    <span>
                                                        +{article.points}P
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className='text-gray-900 text-sm mb-1 line-clamp-2'>
                                            {article.title}
                                        </h3>
                                        <p className='text-gray-500 text-xs mb-2 line-clamp-1'>
                                            {article.description}
                                        </p>
                                        <div className='flex items-center justify-between text-gray-400 text-xs'>
                                            <span>{article.date}</span>
                                            <span>›</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick actions */}
                    <div>
                        <h2 className='text-gray-900 mb-4 font-semibold'>
                            빠른 실행
                        </h2>
                        <div className='grid grid-cols-2 gap-3'>
                            <button
                                onClick={() => navigate('map')}
                                className='bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100'
                            >
                                <div className='text-4xl mb-3'>🗺️</div>
                                <p className='text-gray-900'>시설 찾기</p>
                            </button>

                            <button
                                onClick={() => navigate('challenge')}
                                className='bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100'
                            >
                                <div className='text-4xl mb-3'>🎯</div>
                                <p className='text-gray-900'>챌린지 참여</p>
                            </button>

                            <button
                                onClick={() => navigate('cert')}
                                className='bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100'
                            >
                                <div className='text-4xl mb-3'>📸</div>
                                <p className='text-gray-900'>활동 인증</p>
                            </button>

                            <button
                                onClick={() => navigate('mypage')}
                                className='bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100'
                            >
                                <div className='text-4xl mb-3'>👤</div>
                                <p className='text-gray-900'>내 프로필</p>
                            </button>
                        </div>
                    </div>

                    {/* Eco tip */}
                    <div>
                        <div className='bg-[#8BC34A] bg-opacity-10 rounded-2xl p-4 border-2 border-[#8BC34A] border-opacity-30'>
                            <div className='flex items-start gap-3'>
                                <div className='text-3xl'>💡</div>
                                <div>
                                    <h3 className='text-gray-900 mb-2 font-semibold'>
                                        오늘의 에코 팁
                                    </h3>
                                    <p className='text-gray-600 text-sm'>
                                        제로웨이스트 스토어에서 쇼핑할 때 재사용
                                        가능한 장바구니를 가져가세요. 플라스틱
                                        쓰레기를 줄이고 추가 포인트를 받을 수
                                        있어요!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/**
             * 🎉 Toast 알림 위치 설정
             *
             * bottom: var(--bottom-nav-inset)
             * - BottomNavigation 바로 위에 표시
             * - BottomNavigation에 가려지지 않도록 함
             *
             * 조정 방법:
             * - 더 위로 이동: calc(var(--bottom-nav-inset) + 10px)
             * - BottomNavigation과 간격: calc(var(--bottom-nav-inset) + 20px)
             *
             * fixed: 스크롤과 관계없이 화면에 고정
             * left-1/2 transform -translate-x-1/2: 화면 중앙 정렬
             * z-50: 다른 요소들 위에 표시
             */}
            {toast && (
                <div
                    className='fixed left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow z-50'
                    style={{ bottom: 'var(--bottom-nav-inset)' }}
                >
                    {toast}
                </div>
            )}
        </div>
    );
}
