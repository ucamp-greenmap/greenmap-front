import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';
import { fetchPointDetail } from '../../store/slices/pointSlice';
import { ArrowLeft } from 'lucide-react';

export default function PointHistoryScreen({ onNavigate }) {
    const dispatch = useDispatch();
    const [filter, setFilter] = useState('All'); // 'All', 'Get', 'Used'

    const { logs, getPoint, usedPoint, loading, error } = useSelector(
        (state) => state.point
    );

    const handleGoBack = () => {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }
        if (typeof onNavigate === 'function') {
            onNavigate('home');
            return;
        }
        dispatch(setActiveTab('home'));
    };

    useEffect(() => {
        console.log(
            '🔍 [PointHistoryScreen] Fetching point detail with filter:',
            filter
        );
        dispatch(fetchPointDetail(filter));
    }, [dispatch, filter]);

    useEffect(() => {
        console.log('📊 [PointHistoryScreen] Redux State:', {
            logs,
            getPoint,
            usedPoint,
            loading: loading.detail,
            error: error.detail,
            logsCount: logs?.length || 0,
        });
    }, [logs, getPoint, usedPoint, loading, error]);

    const navigate = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTab(tab));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPointTypeName = (description, category) => {
        // description을 기반으로 타입 결정
        if (category === '교환') {
            if (
                description.includes('기프티콘') ||
                description.includes('쿠폰')
            ) {
                return '기프티콘 구매';
            }
            if (description.includes('계좌') || description.includes('입금')) {
                return '계좌 이체';
            }
            return '포인트 사용';
        }
        if (category === '인증') {
            return description; // '따릉이 이용 인증', '전기차 충전 인증' 등
        }
        return description;
    };

    return (
        <div className='min-h-screen bg-gray-50 p-4'>
            {/* 헤더 */}
            <div className='flex items-center gap-3 mb-6'>
                <button
                    onClick={handleGoBack}
                    style={{ backgroundColor: '#f9fafb' }} // 기본 배경색
                >
                    <ArrowLeft className="w-5 h-5 text-black" />
                </button>
                <h2 className='text-xl font-bold'>포인트 내역</h2>
            </div>

            {/* 포인트 요약 */}
            <div className='bg-white rounded-2xl p-4 shadow-sm mb-6'>
                <div className='flex justify-around'>
                    <div className='text-center'>
                        <div className='text-sm text-gray-500 mb-1'>
                            총 적립
                        </div>
                        <div className='text-lg font-bold text-green-600'>
                            +{getPoint.toLocaleString()}P
                        </div>
                    </div>
                    <div className='w-px bg-gray-200'></div>
                    <div className='text-center'>
                        <div className='text-sm text-gray-500 mb-1'>
                            총 사용
                        </div>
                        <div className='text-lg font-bold text-red-500'>
                            -{usedPoint.toLocaleString()}P
                        </div>
                    </div>
                </div>
            </div>

            {/* 필터 탭 */}
            <div className='flex gap-2 mb-4'>
                <button
                    onClick={() => setFilter('All')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        filter === 'All'
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    전체
                </button>
                <button
                    onClick={() => setFilter('Get')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        filter === 'Get'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    적립
                </button>
                <button
                    onClick={() => setFilter('Used')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        filter === 'Used'
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    사용
                </button>
            </div>

            {/* 내역 리스트 */}
            {loading.detail ? (
                <div className='text-center py-8 text-gray-500'>로딩 중...</div>
            ) : error.detail ? (
                <div className='text-center py-8 text-red-500'>
                    {error.detail}
                </div>
            ) : logs.length === 0 ? (
                <div className='text-center py-12'>
                    <div className='text-4xl mb-2'>📋</div>
                    <div className='text-gray-500'>내역이 없습니다</div>
                </div>
            ) : (
                <div className='space-y-3'>
                    {logs.map((log, index) => {
                        const isEarned = log.pointAmount >= 0;
                        return (
                            <div
                                key={`${log.date}-${index}`}
                                className='bg-white rounded-2xl p-4 shadow-sm'
                            >
                                <div className='flex items-center justify-between'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded ${
                                                    isEarned
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {isEarned ? '적립' : '사용'}
                                            </span>
                                            <span className='font-medium text-gray-800'>
                                                {getPointTypeName(
                                                    log.description,
                                                    log.category
                                                )}
                                            </span>
                                        </div>
                                        <div className='text-xs text-gray-500'>
                                            {formatDate(log.date)}
                                        </div>
                                    </div>
                                    <div
                                        className={`text-lg font-bold ${
                                            isEarned
                                                ? 'text-green-600'
                                                : 'text-red-500'
                                        }`}
                                    >
                                        {isEarned ? '+' : ''}
                                        {log.pointAmount.toLocaleString()}P
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
