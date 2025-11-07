import React from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';
import { usePointRanking } from '../../hooks/usePointApi';
import { ArrowLeft } from 'lucide-react';

export default function RankingScreen({ onNavigate }) {
    const dispatch = useDispatch();

    // API로부터 랭킹 데이터 가져오기 (autoFetch=true로 자동 로드)
    const { data, myRank, ranks, loading, error, refetch } =
        usePointRanking(true);

    const navigate = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTab(tab));
    };

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

    const medalFor = (rank) => {
        if (rank === 1)
            return {
                bg: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
                icon: '🥇',
            };
        if (rank === 2)
            return {
                bg: 'bg-gradient-to-br from-gray-200 to-gray-300',
                icon: '🥈',
            };
        if (rank === 3)
            return {
                bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
                icon: '🥉',
            };
        return { bg: 'bg-gray-200', icon: null };
    };

    return (
        <div className='p-4'>
            <div className='flex items-center gap-3 mb-4'>
                <button
                    onClick={handleGoBack}
                    style={{ backgroundColor: '#f5f5f5' }} // 기본 배경색
                >
                    <ArrowLeft className="w-5 h-5 text-black" />
                </button>
                <h2 className='text-lg font-bold'>랭킹</h2>
            </div>

            {/* 내 랭킹 표시 */}
            {data && myRank !== null && myRank !== undefined && (
                <div className='mb-4 bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] rounded-2xl p-4 text-white shadow-lg'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='text-sm opacity-90'>내 순위</div>
                            <div className='text-2xl font-bold'>{myRank}위</div>
                        </div>
                        <div className='text-right'>
                            <div className='text-sm opacity-90'>내 포인트</div>
                            <div className='text-xl font-bold'>
                                {data.memberPoint?.toLocaleString() || 0}P
                            </div>
                        </div>
                    </div>
                    <div className='mt-2 text-xs opacity-90'>
                        탄소 감축 {data.carbonSave?.toFixed(1) || 0}kg
                    </div>
                </div>
            )}

            {/* 로딩 상태 */}
            {loading && (
                <div className='flex items-center justify-center py-20'>
                    <div className='text-center'>
                        <div className='w-12 h-12 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                        <p className='text-gray-600'>랭킹을 불러오는 중...</p>
                    </div>
                </div>
            )}

            {/* 에러 상태 */}
            {error && !loading && (
                <div className='bg-red-50 rounded-xl p-6 text-center'>
                    <p className='text-red-600 mb-2'>
                        랭킹을 불러오는데 실패했습니다.
                    </p>
                    <button
                        onClick={refetch}
                        className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
                    >
                        다시 시도
                    </button>
                </div>
            )}

            {/* 랭킹 목록 */}
            {!loading && !error && (
                <div className='space-y-4'>
                    {ranks && ranks.length > 0 ? (
                        <>
                            {/* TOP 3 - 특별 디자인 */}
                            {ranks.slice(0, 3).map((t, index) => {
                                const currentRank = t.rank || index + 1; // rank가 없으면 index+1 사용
                                const medal = medalFor(currentRank);
                                const isFirst = currentRank === 1;
                                const isSecond = currentRank === 2;
                                const currentPoint =
                                    t.memberPoint || t.point || 0; // memberPoint 또는 point 사용

                                return (
                                    <div
                                        key={t.memberId || currentRank}
                                        className={`relative overflow-hidden rounded-3xl p-5 shadow-xl transform transition-all hover:scale-[1.02] ${
                                            isFirst
                                                ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600'
                                                : isSecond
                                                ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500'
                                                : 'bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600'
                                        }`}
                                    >
                                        {/* 배경 장식 */}
                                        <div className='absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16'></div>
                                        <div className='absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12'></div>

                                        <div className='relative flex items-center justify-between'>
                                            <div className='flex items-center gap-4'>
                                                {/* 메달 아이콘 */}
                                                <div className='flex items-center justify-center w-16 h-16 bg-white bg-opacity-30 backdrop-blur-sm rounded-full shadow-lg'>
                                                    <span
                                                        className='text-4xl'
                                                        aria-hidden
                                                    >
                                                        {medal.icon}
                                                    </span>
                                                </div>

                                                {/* 사용자 정보 */}
                                                <div className='text-white'>
                                                    <div className='flex items-center gap-2 mb-1'>
                                                        <span
                                                            className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white ${
                                                                isFirst
                                                                    ? 'text-yellow-600'
                                                                    : isSecond
                                                                    ? 'text-gray-600'
                                                                    : 'text-orange-600'
                                                            }`}
                                                        >
                                                            {currentRank}위
                                                        </span>
                                                    </div>
                                                    <div className='text-xl font-bold mb-1'>
                                                        {t.nickname || '익명'}
                                                    </div>
                                                    <div className='flex items-center gap-3 text-sm opacity-90'>
                                                        <span>
                                                            🌱{' '}
                                                            {(
                                                                t.carbonSave ||
                                                                0
                                                            ).toFixed(1)}
                                                            kg
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 포인트 */}
                                            <div className='text-right'>
                                                <div className='text-2xl font-bold text-white'>
                                                    {currentPoint.toLocaleString()}
                                                </div>
                                                <div className='text-sm text-white opacity-80'>
                                                    POINT
                                                </div>
                                            </div>
                                        </div>

                                        {/* 빛나는 효과 */}
                                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -skew-x-12 animate-pulse'></div>
                                    </div>
                                );
                            })}

                            {/* 4위 이하 - 일반 디자인 */}
                            {ranks.length > 3 && (
                                <div className='mt-6 space-y-2'>
                                    {ranks.slice(3, 10).map((t, index) => {
                                        const currentRank = t.rank || index + 4; // 4위부터 시작
                                        const currentPoint =
                                            t.memberPoint || t.point || 0;

                                        return (
                                            <div
                                                key={t.memberId || currentRank}
                                                className='bg-white rounded-2xl p-4 shadow hover:shadow-md transition-shadow flex items-center justify-between'
                                            >
                                                <div className='flex items-center gap-3'>
                                                    <div className='flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full text-sm font-bold text-gray-700'>
                                                        {currentRank}
                                                    </div>
                                                    <div>
                                                        <div className='font-medium text-gray-900'>
                                                            {t.nickname ||
                                                                '익명'}
                                                        </div>
                                                        <div className='text-xs text-gray-500'>
                                                            탄소 감축{' '}
                                                            {(
                                                                t.carbonSave ||
                                                                0
                                                            ).toFixed(1)}
                                                            kg
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='font-semibold text-gray-900'>
                                                    {currentPoint.toLocaleString()}
                                                    P
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className='bg-white rounded-xl p-8 text-center text-gray-500'>
                            <p className='mb-2'>아직 랭킹 데이터가 없습니다.</p>
                            <p className='text-sm'>
                                친환경 활동을 시작해보세요! 🌱
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
