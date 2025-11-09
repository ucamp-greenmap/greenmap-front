import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchPointInfo } from '../../store/slices/pointSlice';
import news1 from '../../assets/news1.png';
import news2 from '../../assets/news2.png';
import news3 from '../../assets/news3.png';
import news4 from '../../assets/news4.png';
import api from '../../api/axios';

export default function EcoNewsList() {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const newsImages = [news1, news2, news3, news4];

    const [newsList, setNewsList] = useState([]);
    const [leftTimes, setLeftTimes] = useState(3);
    const [toast, setToast] = useState(null);

    const fetchNews = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/news');
            const result = response.data;

            if (result.status !== 'SUCCESS') {
                throw new Error(
                    result.message || '서버 내부 오류로 뉴스 로드 실패.'
                );
            }

            if (result.data && Array.isArray(result.data)) {
                console.log('📡 서버 응답:', result.data);

                const newsItems = result.data
                    .filter(item => typeof item === 'object' && item.title)
                    .map(item => ({
                        ...item,
                        isRead: Boolean(item.read),
                    }));

                const leftTimesItem = result.data.find(item => item.leftTimes !== undefined);

                if (leftTimesItem && typeof leftTimesItem.leftTimes === 'number') {
                    setLeftTimes(leftTimesItem.leftTimes);
                }

                console.log('📰 뉴스 목록:', newsItems);
                setNewsList(newsItems);
            } else {
                console.log('⚠️ data가 배열이 아니거나 없음');
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
    }, []);

    const handleReadArticle = async (articleTitle) => {
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
                await fetchNews();
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

    useEffect(() => {
        fetchNews();
        dispatch(fetchPointInfo());
    }, [fetchNews, dispatch]);

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
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <div className='text-[#4CAF50] text-xl'>📰</div>
                    <h2 className='text-gray-900 font-semibold'>환경 뉴스</h2>
                </div>
                <div className='text-[#4CAF50] text-sm'>
                    {leftTimes > 0
                        ? `기사당 +5P (오늘 ${leftTimes}개 남음)`
                        : '오늘 한도 달성'}
                </div>
            </div>

            <div className='space-y-3'>
                {newsList.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                        불러온 뉴스가 없습니다.
                    </div>
                ) : (
                    newsList.map((article, index) => {
                        const isRead = article.isRead === true;
                        const canEarnPoints = !isRead && leftTimes > 0;

                        console.log(`📄 ${article.title.substring(0, 20)}... → isRead: ${isRead}`);

                        return (
                            <a
                                key={article.link}
                                href={article.link}
                                target='_blank'
                                rel='noopener noreferrer'
                                onClick={() => {
                                    if (canEarnPoints) {
                                        handleReadArticle(article.title);
                                    } else if (leftTimes <= 0 && !isRead) {
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
                                    alt={article.title}
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
                                        {article.title}
                                    </h3>
                                    <p className='text-gray-500 text-xs mb-2 line-clamp-1'>
                                        {article.description}
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