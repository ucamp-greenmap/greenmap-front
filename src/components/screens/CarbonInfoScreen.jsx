import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Leaf,
    TrendingDown,
    TreePine,
    Zap,
    Recycle,
} from 'lucide-react';
import { fetchCarbonData } from '../../util/carbonApi';

const Card = ({ children, className }) => {
    return <div className={className}>{children}</div>;
};

const Progress = ({ value, className }) => {
    return (
        <div
            className={`bg-gray-200 rounded-full overflow-hidden ${className}`}
        >
            <div
                className='bg-[#4CAF50] h-full transition-all'
                style={{ width: `${value}%` }}
            />
        </div>
    );
};

export default function CarbonInfoScreen({ onBack }) {
    const [carbonData, setCarbonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCarbonData = async () => {
            try {
                const result = await fetchCarbonData();

                if (result.success) {
                    setCarbonData(result.data);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                console.error('탄소 데이터 로드 오류:', err);
                setError('데이터를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadCarbonData();
    }, []);

    // 로딩중
    if (loading) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <div className='text-gray-600'>로딩중...</div>
            </div>
        );
    }

    // 에러
    if (error || !carbonData) {
        return (
            <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6'>
                <div className='text-red-600 text-center mb-4'>
                    {error || '데이터를 찾을 수 없습니다.'}
                </div>
                <button
                    onClick={onBack}
                    className='px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors'
                >
                    <ArrowLeft className='w-4 h-4 inline mr-2' /> 뒤로 돌아가기
                </button>
            </div>
        );
    }

    // 데이터에서 값 가져오기
    const totalCarbon = carbonData.carbonSave || 0;
    const treeEffect = (totalCarbon / 6.6).toFixed(1);
    const powerSaved = (totalCarbon * 2.096).toFixed(0);
    const recycleEffect = (totalCarbon * 10).toFixed(0);

    const impactData = [
        {
            icon: TreePine,
            label: '나무 심기 효과',
            value: treeEffect,
            unit: '그루',
            description: `약 ${treeEffect}그루의 나무를 심은 효과`,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            icon: Zap,
            label: '절약한 전력',
            value: powerSaved,
            unit: 'kWh',
            description: `일반 가정 약 ${(powerSaved / 9).toFixed(
                0
            )}일치 전력 소비량`,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
        {
            icon: Recycle,
            label: '재활용 효과',
            value: recycleEffect,
            unit: 'kg',
            description: '재활용을 통한 탄소 절감',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
    ];

    const activitiesContribution = [
        {
            activity: '전기차 충전',
            reduction: carbonData.car || 0,
            percentage:
                totalCarbon > 0
                    ? Math.round((carbonData.car / totalCarbon) * 100)
                    : 0,
        },
        {
            activity: '재활용 센터 이용',
            reduction: carbonData.recycle || 0,
            percentage:
                totalCarbon > 0
                    ? Math.round((carbonData.recycle / totalCarbon) * 100)
                    : 0,
        },
        {
            activity: '따릉이 이용',
            reduction: carbonData.bike || 0,
            percentage:
                totalCarbon > 0
                    ? Math.round((carbonData.bike / totalCarbon) * 100)
                    : 0,
        },
        {
            activity: '제로웨이스트 쇼핑',
            reduction: carbonData.zero || 0,
            percentage:
                totalCarbon > 0
                    ? Math.round((carbonData.zero / totalCarbon) * 100)
                    : 0,
        },
    ];

    return (
        <div className='min-h-screen bg-gray-50 pb-24'>
            {/* Header */}
            <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] px-6 py-8'>
                <div className='flex items-center gap-3 mb-6'>
                    <button
                        onClick={onBack}
                        className='p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors'
                    >
                        <ArrowLeft className='w-5 h-5 text-white' />
                    </button>
                    <h1 className='text-white text-xl font-bold'>탄소 중립</h1>
                </div>

                {/* Main Carbon Card */}
                <Card className='bg-white rounded-3xl p-6 shadow-lg'>
                    <div className='text-center mb-6'>
                        <div className='bg-[#4CAF50] bg-opacity-10 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center'>
                            <TrendingDown className='w-12 h-12 text-[#4CAF50]' />
                        </div>
                        <p className='text-gray-600 mb-2'>
                            이번 달 탄소 감축량
                        </p>
                        <div className='flex items-baseline justify-center gap-2'>
                            <span className='text-5xl font-bold text-[#4CAF50]'>
                                {totalCarbon}
                            </span>
                            <span className='text-2xl text-gray-600'>
                                kg CO₂
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Content */}
            <div className='px-6 py-6 space-y-6'>
                {/* Impact Equivalents */}
                <div>
                    <h3 className='text-lg font-bold text-gray-900 mb-4'>
                        🌍 환경 영향
                    </h3>
                    <div className='space-y-3'>
                        {impactData.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Card
                                    key={item.label}
                                    className={`${item.bgColor} rounded-2xl p-5 shadow`}
                                >
                                    <div className='flex items-center gap-4'>
                                        <div className='bg-white rounded-xl p-3'>
                                            <Icon
                                                className={`w-6 h-6 ${item.color}`}
                                            />
                                        </div>
                                        <div className='flex-1'>
                                            <p className='text-gray-600 text-sm mb-1'>
                                                {item.label}
                                            </p>
                                            <div className='flex items-baseline gap-2'>
                                                <span
                                                    className={`text-2xl font-bold ${item.color}`}
                                                >
                                                    {item.value}
                                                </span>
                                                <span className='text-gray-600'>
                                                    {item.unit}
                                                </span>
                                            </div>
                                            <p className='text-gray-500 text-xs mt-1'>
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Activity Breakdown */}
                <div>
                    <h3 className='text-lg font-bold text-gray-900 mb-4'>
                        📊 활동별 기여도
                    </h3>
                    <Card className='bg-white rounded-2xl p-5 shadow'>
                        <div className='space-y-4'>
                            {activitiesContribution.map((item, index) => (
                                <div key={index}>
                                    <div className='flex items-center justify-between mb-2'>
                                        <span className='text-gray-900'>
                                            {item.activity}
                                        </span>
                                        <span className='text-[#4CAF50] font-semibold'>
                                            {item.reduction}kg CO₂
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <Progress
                                            value={item.percentage}
                                            className='flex-1 h-2'
                                        />
                                        <span className='text-sm text-gray-500 w-12 text-right'>
                                            {item.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* What is Carbon Neutral */}
                <Card className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] rounded-2xl p-6 text-white shadow-lg'>
                    <Leaf className='w-8 h-8 flex-shrink-0' />
                    <div className='flex flex-col items-center justify-center gap-3 mb-4 text-center'>
                        <div>
                            <h3 className='text-white text-lg font-bold mb-2 text-center'>
                                탄소 중립이란? 탄소 중립(Carbon Neutral)은
                                온실가스 배출량과 흡수량이 균형을 이루어
                                순배출량이 '0'이 되는 상태를 의미합니다.
                            </h3>
                        </div>
                    </div>

                    <div className='bg-white/20 rounded-xl p-4 backdrop-blur-sm space-y-2 **text-center**'>
                        <h4 className='text-white text-lg font-bold text-center'>
                            💡 탄소 감축 실천 방법
                        </h4>
                        <ul className='space-y-1 text-white/90 text-base **list-none p-0** '>
                            <li> 대중교통 및 친환경 이동수단 이용 </li>
                            <li> 전기차 충전 및 에너지 효율적 사용 </li>
                            <li> 재활용 및 분리배출 실천 </li>
                            <li> 제로웨이스트 생활 습관 </li>
                        </ul>
                    </div>
                </Card>

                {/* Monthly Comparison */}
                <div>
                    <h3 className='text-lg font-bold text-gray-900 mb-4'>
                        📈 월별 비교
                    </h3>
                    <Card className='bg-white rounded-2xl p-5 shadow'>
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between p-3 bg-[#4CAF50] bg-opacity-10 rounded-xl'>
                                <span className='text-gray-900 font-semibold'>
                                    11월 (현재)
                                </span>
                                <span className='text-[#4CAF50] font-bold'>
                                    {totalCarbon} kg CO₂
                                </span>
                            </div>
                            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-xl'>
                                <span className='text-gray-600'>10월</span>
                                <span className='text-gray-600'>
                                    38.2 kg CO₂
                                </span>
                            </div>
                            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-xl'>
                                <span className='text-gray-600'>9월</span>
                                <span className='text-gray-600'>
                                    35.8 kg CO₂
                                </span>
                            </div>
                        </div>

                        <div className='mt-4 pt-4 border-t border-gray-100 text-center'>
                            <p className='text-sm text-gray-600'>
                                지난 달 대비{' '}
                                <span className='text-[#4CAF50] font-semibold'>
                                    +11.3%
                                </span>{' '}
                                증가
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
