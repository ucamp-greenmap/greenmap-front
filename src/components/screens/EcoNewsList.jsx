import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPointInfo } from '../../store/slices/pointSlice';
import news1 from '../../assets/news1.png';
import news2 from '../../assets/news2.png';
import news3 from '../../assets/news3.png';
import news4 from '../../assets/news4.png';
import api from '../../api/axios';

/**
 * @param {object} props
 * @param {string} props.placeholder
 */
export default function EcoNewsList() {
    const dispatch = useDispatch();
    // 현재 로그인한 사용자의 memberId 가져오기
    const memberId = useSelector((s) => s.user.profile?.memberId);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const newsImages = [news1, news2, news3, news4];

    // 사용자별 sessionStorage 키 생성
    const getStorageKey = (userId) => {
        return userId ? `ecoNewsState_${userId}` : 'ecoNewsState_guest';
    };

    // sessionStorage에서 상태 복원 (사용자별로 구분, 비로그인 사용자도 지원)
    const getStoredNewsState = (userId) => {
        try {
            const storageKey = getStorageKey(userId);
            const stored = sessionStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // 1시간 이내의 데이터만 유효 (세션 유지)
                if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
                    return parsed.data;
                } else {
                    // 만료된 데이터 삭제
                    sessionStorage.removeItem(storageKey);
                }
            }
        } catch (e) {
            console.error('뉴스 상태 복원 실패:', e);
        }
        return null;
    };

    const saveNewsState = (newsList, leftTimes, userId) => {
        try {
            const storageKey = getStorageKey(userId);
            sessionStorage.setItem(
                storageKey,
                JSON.stringify({
                    data: { newsList, leftTimes },
                    timestamp: Date.now(),
                    memberId: userId || 'guest', // 사용자 ID 또는 guest 저장
                })
            );
        } catch (e) {
            console.error('뉴스 상태 저장 실패:', e);
        }
    };

    // 초기 상태
    const [newsList, setNewsList] = useState([]);
    const [leftTimes, setLeftTimes] = useState(3);
    const [toast, setToast] = useState(null);

    // 컴포넌트 레벨에서 한 번만 호출되도록 추적
    const hasFetchedNewsRef = useRef(false);

    // 사용자 변경 시 ref 초기화 (다른 사용자로 로그인했을 때)
    const prevMemberIdRef = useRef(memberId);
    useEffect(() => {
        if (prevMemberIdRef.current !== memberId) {
            // 사용자가 변경되었으면 ref 초기화하여 새로 API 호출
            hasFetchedNewsRef.current = false;
            prevMemberIdRef.current = memberId;
            // 상태도 초기화
            setNewsList([]);
            setLeftTimes(3);
        }
    }, [memberId]);

    // 상태가 변경될 때마다 sessionStorage에 저장 (읽은 상태 유지용, 비로그인 사용자도 지원)
    useEffect(() => {
        if (newsList.length > 0) {
            // memberId가 있으면 사용자별로, 없으면 guest로 저장
            saveNewsState(newsList, leftTimes, memberId || 'guest');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newsList, leftTimes, memberId]);

    // ------------------------------------
    // 뉴스 읽기 처리 및 포인트 적립 (POST /news)
    // ------------------------------------
    const handleReadArticle = async (articleTitle) => {
        // 로그인하지 않은 사용자는 포인트를 받을 수 없지만, 뉴스는 읽을 수 있음
        if (!memberId) {
            // 비로그인 사용자: 읽은 상태만 업데이트 (포인트 없음)
            setNewsList((prev) =>
                prev.map((article) => {
                    const articleCleanTitle = article.title.replace(
                        /<[^>]*>/g,
                        ''
                    );
                    if (articleCleanTitle === articleTitle) {
                        return { ...article, isRead: true };
                    }
                    return article;
                })
            );
            return;
        }

        // 로그인한 사용자만 포인트 적립 가능
        if (leftTimes <= 0) {
            setToast('오늘의 뉴스 보상 한도에 도달했습니다');
            setTimeout(() => setToast(null), 5000);
            return;
        }

        try {
            const response = await api.post('/news', {
                title: articleTitle,
            });

            const result = response.data;

            if (result.status === 'FAIL') {
                setToast(result.message);
                setTimeout(() => setToast(null), 2000);
                return;
            }

            if (result.status === 'SUCCESS') {
                // 뉴스 읽기 성공 시 상태 업데이트
                setNewsList((prev) =>
                    prev.map((article) => {
                        const articleCleanTitle = article.title.replace(
                            /<[^>]*>/g,
                            ''
                        );
                        if (articleCleanTitle === articleTitle) {
                            return { ...article, isRead: true };
                        }
                        return article;
                    })
                );

                // leftTimes 감소 (서버와 동기화를 위해 최신 뉴스 데이터를 다시 가져올 수도 있지만,
                // 여기서는 클라이언트에서 감소시키고, 다음 API 호출 시 서버 값으로 업데이트됨)
                setLeftTimes((prev) => Math.max(0, prev - 1));

                dispatch(fetchPointInfo());

                setToast('+5P 획득');
            }
        } catch (err) {
            const message =
                err.response?.data?.message || '처리 실패: 네트워크 오류';
            console.error('뉴스 조회/포인트 처리 오류:', err);
            setToast(message);
        } finally {
            setTimeout(() => setToast(null), 2000);
        }
    };

    // 뉴스 로드 (홈 화면 진입 시마다 API 호출, 비로그인 사용자도 지원)
    useEffect(() => {
        // 이미 호출했으면 스킵 (중복 호출 방지)
        if (hasFetchedNewsRef.current) {
            return;
        }

        hasFetchedNewsRef.current = true;
        setIsLoading(true);
        setError(null);

        const loadNews = async () => {
            try {
                const response = await api.get('/news');
                console.log(
                    'fetchNews response.data',
                    JSON.stringify(response.data, null, 2)
                );
                const result = response.data;

                if (result.status !== 'SUCCESS') {
                    throw new Error(
                        result.message || '서버 내부 오류로 뉴스 로드 실패.'
                    );
                }

                if (result.data) {
                    console.log('📡 서버 응답:', result.data);

                    if (
                        Array.isArray(result.data.items) &&
                        result.data.items.length > 0
                    ) {
                        // 서버에서 받은 최신 leftTimes 사용
                        const serverLeftTimes =
                            typeof result.data.leftTimes === 'number'
                                ? result.data.leftTimes
                                : 3;

                        // 저장된 읽은 상태 가져오기 (sessionStorage에서, 현재 사용자 또는 guest)
                        const currentUserId = memberId || 'guest';
                        const storedState = getStoredNewsState(currentUserId);
                        const storedReadTitles = new Set();
                        if (storedState?.newsList) {
                            storedState.newsList.forEach((article) => {
                                if (article.isRead) {
                                    const cleanTitle = article.title.replace(
                                        /<[^>]*>/g,
                                        ''
                                    );
                                    storedReadTitles.add(cleanTitle);
                                }
                            });
                        }

                        // 서버에서 받은 뉴스에 읽은 상태 적용
                        // 서버의 read 값 또는 저장된 읽은 상태 중 하나라도 true면 읽은 것으로 표시
                        const newsItems = result.data.items.map((article) => {
                            const cleanTitle = article.title.replace(
                                /<[^>]*>/g,
                                ''
                            );
                            // 서버에서 read: true로 오거나, sessionStorage에 읽은 상태가 저장되어 있으면 읽은 것으로 표시
                            const isReadByServer =
                                article.read === true ||
                                article.isRead === true;
                            const isReadByStorage =
                                storedReadTitles.has(cleanTitle);

                            return {
                                ...article,
                                isRead: isReadByServer || isReadByStorage,
                            };
                        });

                        setNewsList(newsItems);

                        // leftTimes는 서버 값 사용 (로그인한 사용자만, 비로그인 사용자는 0)
                        // 비로그인 사용자는 포인트를 받을 수 없으므로 leftTimes는 의미 없음
                        if (memberId) {
                            setLeftTimes(serverLeftTimes);
                        } else {
                            // 비로그인 사용자는 leftTimes를 0으로 설정 (포인트 적립 불가)
                            setLeftTimes(0);
                        }
                    } else {
                        console.log('⚠️ data가 배열이 아니거나 비어있음');
                        setNewsList([]);
                    }
                } else {
                    setNewsList([]);
                }
            } catch (err) {
                const message =
                    err.response?.data?.message ||
                    err.message ||
                    '뉴스 목록을 불러오지 못했습니다.';
                console.error('뉴스 fetch 오류:', err);
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        loadNews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberId]); // memberId가 변경될 때마다 실행 (다른 사용자로 로그인 시)

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
                    {memberId
                        ? leftTimes > 0
                            ? `기사당 +5P (오늘 ${leftTimes}개 남음)`
                            : '오늘 한도 달성'
                        : '로그인하면 포인트를 받을 수 있어요'}
                </div>
            </div>

            {/* 리스트 */}
            <div className='space-y-3'>
                {newsList.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                        불러온 뉴스가 없습니다.
                    </div>
                ) : (
                    newsList.map((article, index) => {
                        const isRead = article.isRead === true;
                        const canEarnPoints = !isRead && leftTimes > 0;
                        const cleanTitle = article.title.replace(
                            /<[^>]*>/g,
                            ''
                        );

                        return (
                            <a
                                key={article.link}
                                href={article.link}
                                target='_blank'
                                rel='noopener noreferrer'
                                onClick={() => {
                                    // 비로그인 사용자도 뉴스를 읽을 수 있음
                                    if (!memberId) {
                                        // 비로그인: 읽은 상태만 업데이트
                                        handleReadArticle(cleanTitle);
                                    } else if (canEarnPoints) {
                                        // 로그인: 포인트 적립 가능
                                        handleReadArticle(cleanTitle);
                                    } else if (
                                        leftTimes <= 0 &&
                                        !isRead &&
                                        memberId
                                    ) {
                                        // 로그인했지만 한도 초과
                                        setToast(
                                            '오늘의 뉴스 보상 한도에 도달했습니다. '
                                        );
                                        setTimeout(() => setToast(null), 2500);
                                    }
                                }}
                                className={`flex items-start w-full bg-white rounded-2xl overflow-hidden p-3 shadow-sm hover:shadow-md transition-all border-2 ${
                                    isRead
                                        ? 'border-[#4CAF50]'
                                        : 'border-gray-100'
                                } cursor-pointer`}
                            >
                                <img
                                    src={newsImages[index % 4]}
                                    alt={cleanTitle}
                                    loading='lazy'
                                    className='w-20 h-20 object-cover rounded-xl flex-shrink-0 mr-3'
                                />
                                <div className='flex-1 text-left'>
                                    <div className='flex items-start justify-between mb-1'>
                                        <span className='bg-[#4CAF50] bg-opacity-10 text-[#4CAF50] px-2 py-0.5 rounded-full text-xs'>
                                            뉴스
                                        </span>
                                        {isRead && memberId && (
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
                    })
                )}
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
