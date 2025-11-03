import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addPoints } from '../../store/slices/pointSlice';

/**
 * @param {object} props
 * @param {string} props.placeholder
 */
export default function EcoNewsList({ placeholder }) {
    const dispatch = useDispatch();
    // 1. 서버에서 가져온 뉴스 목록을 저장할 상태
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const newsImages = [
        '/src/assets/news1.png',
        '/src/assets/news2.png',
        '/src/assets/news3.png',
        '/src/assets/news4.png',
    ];

    const [newsList, setNewsList] = useState([]);

    // 기존의 읽은 기사 상태 및 토스트 상태
    const [readArticles, setReadArticles] = useState([]);
    const [toast, setToast] = useState(null);

    // 백엔드 API 기본 URL (프런트엔드 포트 5173과 다름)
    const API_BASE_URL = 'http://localhost:8080';

    // 현재는 memberId를 1로 하드코딩
    const CURRENT_MEMBER_ID = 1;

    // ------------------------------------
    // 서버에서 뉴스 목록을 불러오는 함수 (GET /news)
    // ------------------------------------
    const fetchNews = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/news`);

            // 1. HTTP 상태 코드 체크 (404, 500 등)
            if (!response.ok) {
                throw new Error(
                    `HTTP 요청 실패: ${response.status} ${response.statusText}`
                );
            }

            const result = await response.json();

            // 2. 서버 응답의 status 필드 확인
            if (result.status !== 'SUCCESS') {
                throw new Error(
                    result.message || '서버 내부 오류로 뉴스 로드 실패.'
                );
            }

            // 3. 성공 시 데이터 저장
            if (result.data?.items && Array.isArray(result.data.items)) {
                setNewsList(result.data.items);
            } else {
                setNewsList([]);
            }
        } catch (err) {
            console.error('뉴스 fetch 오류:', err);
            // 어떤 오류가 발생하든 사용자에게는 일관된 실패 메시지를 표시
            setError(
                '뉴스 목록을 불러오지 못했습니다. 서버 상태를 확인하세요.'
            );
        } finally {
            setIsLoading(false);
        }
    }, [API_BASE_URL]);

    // ------------------------------------
    // 뉴스 읽기 처리 및 포인트 적립 (POST /news)
    // ------------------------------------
    // const handleReadArticle = async (articleTitle, points) => {
    //     // 로컬에서 읽음 한도 확인 (3개)
    //     if (readArticles.length >= 3) {
    //         setToast('오늘의 뉴스 보상 한도에 도달했습니다');
    //         setTimeout(() => setToast(null), 2000);
    //         return;
    //     }

    //     try {
    //         // 1. 서버에 뉴스 조회 기록 전송 (POST 요청)
    //         const response = await fetch(`${API_BASE_URL}/news`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 memberId: CURRENT_MEMBER_ID,
    //                 title: articleTitle,
    //             }),
    //         });

    //         const result = await response.json();

    //         if (result.status === 'ERROR') {
    //             // 서버에서 DB 문제 등으로 "실패" 응답이 온 경우
    //             throw new Error(
    //                 result.message || '뉴스 조회 처리 중 서버 오류'
    //             );
    //         }

    //         // 2. 서버에서 성공 응답 시 로컬 상태 업데이트 및 포인트 지급
    //         setReadArticles((prev) => [...prev, articleTitle]);
    //         dispatch(
    //             addPoints({
    //                 points,
    //                 type: `뉴스 읽기: ${articleTitle.substring(0, 10)}...`,
    //                 category: '뉴스',
    //             })
    //         );
    //         setToast(`+${points}P 획득!`);
    //     } catch (err) {
    //         console.error('뉴스 조회/포인트 처리 오류:', err);
    //         setToast(`처리 실패: ${err.message}`);
    //     } finally {
    //         setTimeout(() => setToast(null), 2000);
    //     }
    // };
    const handleReadArticle = async (articleTitle) => {
        if (readArticles.length >= 3) {
            setToast('오늘의 뉴스 보상 한도에 도달했습니다');
            setTimeout(() => setToast(null), 2000);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/news`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    memberId: CURRENT_MEMBER_ID,
                    title: articleTitle,
                    // point 필드 제거 (백엔드가 5로 고정 처리)
                }),
            });

            const result = await response.json();

            if (result.status === 'FAIL') {
                setToast(result.message);
                setTimeout(() => setToast(null), 2000);
                return;
            }

            if (result.status === 'SUCCESS') {
                setReadArticles((prev) => [...prev, articleTitle]);
                dispatch(
                    addPoints({
                        points: 5,
                        type: `뉴스 읽기: ${articleTitle.substring(0, 10)}...`,
                        category: '뉴스',
                    })
                );
                setToast('+5P 획득');
            }
        } catch (err) {
            console.error('뉴스 조회/포인트 처리 오류:', err);
            setToast('처리 실패: 네트워크 오류');
        } finally {
            setTimeout(() => setToast(null), 2000);
        }
    };

    // 컴포넌트 마운트 시 뉴스 목록을 불러옴
    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // ------------------------------------
    // 렌더링 로직
    // ------------------------------------
    const todayReadsRemaining = Math.max(0, 3 - readArticles.length);

    if (isLoading) {
        return (
            <div className='text-center py-8 text-gray-500'>
                뉴스 목록을 불러오는 중...
            </div>
        );
    }

    if (error) {
        return (
            <div className='text-center py-8 text-red-500 font-semibold'>
                {error}
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            {/*헤더 */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <div className='text-[#4CAF50] text-xl'>📰</div>
                    <h2 className='text-gray-900 font-semibold'>환경 뉴스</h2>
                </div>
                <div className='text-[#4CAF50] text-sm'>
                    {todayReadsRemaining > 0
                        ? `기사당 +5P (오늘 ${todayReadsRemaining}개 남음)`
                        : '오늘 한도 달성'}
                </div>
            </div>

            {/* 리스트 */}
            <div className='space-y-3'>
                {newsList.map((article) => {
                    const isRead =
                        article.read || readArticles.includes(article.title);
                    const canRead = !isRead && readArticles.length < 3;
                    const cleanTitle = article.title.replace(/<[^>]*>/g, '');

                    return (
                        <a
                            key={article.link}
                            href={article.link}
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={(e) => {
                                if (!canRead) {
                                    e.preventDefault();
                                    return;
                                }
                                handleReadArticle(cleanTitle, 5);
                            }}
                            className={`flex items-start w-full bg-white rounded-2xl overflow-hidden p-3 shadow-sm hover:shadow-md transition-all border-2 ${
                                isRead
                                    ? 'border-[#4CAF50] opacity-90'
                                    : 'border-gray-100'
                            } ${
                                !canRead
                                    ? 'cursor-not-allowed'
                                    : 'cursor-pointer'
                            }`}
                        >
                            <img
                                src={newsImages[article.id % 4] || placeholder}
                                alt={cleanTitle}
                                loading='lazy'
                                className='w-20 h-20 object-cover rounded-xl flex-shrink-0 mr-3'
                            />
                            <div className='flex-1 text-left'>
                                <div className='flex items-start justify-between mb-1'>
                                    <span className='bg-[#4CAF50] bg-opacity-10 text-[#4CAF50] px-2 py-0.5 rounded-full text-xs'>
                                        뉴스
                                    </span>
                                    {isRead && (
                                        <div className='flex items-center gap-1 text-[#4CAF50] text-sm font-semibold'>
                                            <span>+5P</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className='text-gray-900 text-sm mb-1 line-clamp-2'>
                                    {cleanTitle}
                                </h3>
                                <p className='text-gray-500 text-xs mb-2 line-clamp-1'>
                                    {article.description.replace(
                                        /<[^>]*>/g,
                                        ''
                                    )}
                                </p>
                                <div className='flex items-center justify-between text-gray-400 text-xs'>
                                    <span>출처: 네이버 뉴스</span>
                                    <span>›</span>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>

            {/** Toast 알림 */}
            {toast && (
                <div
                    className='fixed left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow z-50 transition-opacity duration-300'
                    style={{ bottom: 'calc(var(--bottom-nav-inset) + 16px)' }}
                >
                    {toast}
                </div>
            )}
        </div>
    );
}
