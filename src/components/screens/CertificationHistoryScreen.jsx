import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronLeft, Calendar, TrendingUp, Leaf } from 'lucide-react';
import { fetchCertificationHistory } from '../../util/certApi';
import { fetchPointInfo } from '../../store/slices/userSlice';

export default function CertificationHistoryScreen({ onBack, navigation }) {
    const dispatch = useDispatch();
    const { stats } = useSelector((s) => s.user);

    const [certifications, setCertifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');

    const getCategoryLabel = (category) => {
        const labels = {
            BIKE: '따릉이',
            CAR: '전기차 충전',
            HCAR: '수소차 충전',
            ZERO_WASTE: '제로웨이스트',
            RECYCLING_CENTER: '재활용',
        };
        return labels[category] || category;
    };

    const getCategoryIcon = (category) => {
        const icons = {
            BIKE: '🚴',
            CAR: '⚡',
            HCAR: '💧',
            ZERO_WASTE: '♻️',
            RECYCLING_CENTER: '🔄',
        };
        return icons[category] || '📝';
    };

    const getCategoryColor = (category) => {
        const colors = {
            BIKE: 'from-[#4CAF50] to-[#8BC34A]',
            CAR: 'from-[#2196F3] to-[#1976D2]',
            ZERO_WASTE: 'from-[#8BC34A] to-[#7cb342]',
            RECYCLING_CENTER: 'from-[#FF9800] to-[#F57C00]',
            HCAR: 'from-[#00BCD4] to-[#0097A7]',
        };
        return colors[category] || 'from-gray-400 to-gray-600';
    };

    const formatDate = (dateTime) => {
        if (!dateTime) return '';
        const date = new Date(dateTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    const loadCertifications = async () => {
        setIsLoading(true);
        try {
            // Redux에서 포인트/탄소 정보 갱신
            dispatch(fetchPointInfo());

            // 인증 내역만 별도로 가져오기
            const certResult = await fetchCertificationHistory();

            if (certResult.success) {
                const formattedData = certResult.data.map((item, index) => ({
                    id: index + 1,
                    type: getCategoryLabel(item.category),
                    date: item.createdAt,
                    points: item.point,
                    category: item.category,
                    icon: getCategoryIcon(item.category),
                    color: getCategoryColor(item.category),
                }));
                setCertifications(formattedData);
            } else {
                alert(
                    certResult.message || '인증 내역을 불러오는데 실패했습니다.'
                );
            }
        } catch (error) {
            console.error('내역 조회 오류:', error);
            alert('내역 조회 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCertifications();
    }, []);

    // 필터링된 데이터
    const filteredCertifications =
        filterCategory === 'all'
            ? certifications
            : certifications.filter((cert) => cert.category === filterCategory);

    // 통계 계산
    const totalPoints = certifications.reduce(
        (sum, cert) => sum + cert.points,
        0
    );
    const totalCount = certifications.length;

    // Redux에서 가져온 탄소 감축량 사용
    const totalCarbon = stats.carbonReduction || 0;

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] px-6 py-6 sticky top-0 z-10'>
                <div className='flex items-center gap-3 mb-4'>
                    <button
                        onClick={() => {
                            if (onBack) {
                                onBack();
                            } else if (navigation) {
                                navigation.goBack();
                            } else if (window.history.length > 1) {
                                window.history.back();
                            }
                        }}
                        className='text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition'
                    >
                        <ChevronLeft className='w-6 h-6' />
                    </button>
                    <h1 className='text-2xl font-bold text-white'>인증 기록</h1>
                </div>

                {/* 통계 카드 */}
                <div className='grid grid-cols-3 gap-3'>
                    <div className='bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm'>
                        <div className='flex items-center gap-2 mb-1'>
                            <Calendar className='w-4 h-4 text-white' />
                            <p className='text-white text-opacity-80 text-xs'>
                                총 인증 횟수
                            </p>
                        </div>
                        <p className='text-2xl font-bold text-white'>
                            {totalCount}회
                        </p>
                    </div>
                    <div className='bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm'>
                        <div className='flex items-center gap-2 mb-1'>
                            <TrendingUp className='w-4 h-4 text-white' />
                            <p className='text-white text-opacity-80 text-xs'>
                                획득 포인트
                            </p>
                        </div>
                        <p className='text-2xl font-bold text-white'>
                            {totalPoints}P
                        </p>
                    </div>
                    <div className='bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm'>
                        <div className='flex items-center gap-2 mb-1'>
                            <Leaf className='w-4 h-4 text-white' />
                            <p className='text-white text-opacity-80 text-xs'>
                                탄소 감축량
                            </p>
                        </div>
                        <p className='text-2xl font-bold text-white'>
                            {totalCarbon}kg
                        </p>
                    </div>
                </div>
            </div>

            <div className='px-6 py-6 space-y-4'>
                {/* 필터 버튼 */}
                <div className='flex gap-2 overflow-x-auto pb-2'>
                    <button
                        onClick={() => setFilterCategory('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                            filterCategory === 'all'
                                ? 'bg-[#4CAF50] text-white'
                                : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                    >
                        전체
                    </button>
                    <button
                        onClick={() => setFilterCategory('BIKE')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                            filterCategory === 'BIKE'
                                ? 'bg-[#4CAF50] text-white'
                                : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                    >
                        🚴 따릉이
                    </button>
                    <button
                        onClick={() => setFilterCategory('EVCAR')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                            filterCategory === 'CAR'
                                ? 'bg-[#2196F3] text-white'
                                : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                    >
                        ⚡ 전기차
                    </button>
                    <button
                        onClick={() => setFilterCategory('ZERO_WASTE')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                            filterCategory === 'ZERO_WASTE'
                                ? 'bg-[#8BC34A] text-white'
                                : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                    >
                        ♻️ 제로웨이스트
                    </button>
                    <button
                        onClick={() => setFilterCategory('RECYCLING_CENTER')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                            filterCategory === 'RECYCLING_CENTER'
                                ? 'bg-[#FF9800] text-white'
                                : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                    >
                        🔄 재활용
                    </button>
                    <button
                        onClick={() => setFilterCategory('HCAR')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                            filterCategory === 'HCAR'
                                ? 'bg-[#00BCD4] text-white'
                                : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                    >
                        💧 수소차
                    </button>
                </div>

                {/* 인증 내역 리스트 */}
                {isLoading ? (
                    <div className='bg-white rounded-2xl p-8 text-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CAF50] mx-auto'></div>
                        <p className='text-gray-500 mt-3'>불러오는 중...</p>
                    </div>
                ) : filteredCertifications.length > 0 ? (
                    <div className='space-y-3'>
                        {filteredCertifications.map((cert) => (
                            <div
                                key={cert.id}
                                className='bg-white rounded-2xl p-4 shadow-sm border border-gray-100'
                            >
                                <div className='flex items-center gap-4'>
                                    {/* 아이콘 */}
                                    <div
                                        className={`bg-gradient-to-br ${cert.color} rounded-xl p-3 shadow-md`}
                                    >
                                        <div className='text-2xl'>
                                            {cert.icon}
                                        </div>
                                    </div>

                                    {/* 정보 */}
                                    <div className='flex-1'>
                                        <h3 className='font-semibold text-gray-900'>
                                            {cert.type}
                                        </h3>
                                        <p className='text-gray-500 text-sm mt-1'>
                                            {formatDate(cert.date)}
                                        </p>
                                    </div>

                                    {/* 포인트 */}
                                    <div className='text-right'>
                                        <p className='text-[#4CAF50] font-bold text-lg'>
                                            +{cert.points}P
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='bg-white rounded-2xl p-8 text-center'>
                        <div className='text-4xl mb-3'>📝</div>
                        <p className='text-gray-500'>
                            {filterCategory === 'all'
                                ? '아직 인증 내역이 없어요'
                                : '해당 카테고리의 인증 내역이 없어요'}
                        </p>
                        <p className='text-gray-400 text-sm mt-2'>
                            첫 인증을 시작해보세요!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
