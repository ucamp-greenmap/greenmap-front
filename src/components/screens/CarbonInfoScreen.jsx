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

export default function CarbonInfoScreen({ onBack, navigation }) {
    const [carbonData, setCarbonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleGoBack = () => {
        if (onBack) {
            onBack();
        } else if (navigation) {
            navigation.goBack();
        } else if (window.history.length > 1) {
            window.history.back();
        }
    };

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

    if (loading) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <div className='text-gray-600'>로딩중...</div>
            </div>
        );
    }

    if (error || !carbonData) {
        return (
            <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6'>
                <div className='text-red-600 text-center mb-4'>
                    {error || '데이터를 찾을 수 없습니다.'}
                </div>
                <button
                    onClick={handleGoBack}
                    className='px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors'
                >
                    <ArrowLeft className='w-4 h-4 inline mr-2' /> 뒤로 돌아가기
                </button>
            </div>
        );
    }

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
            description: `약 나무 ${treeEffect}그루를 심는 것과 같은 효과`,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            bgGradient: 'from-emerald-50 to-green-100',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-700',
            gradient: 'from-emerald-600 to-green-600',
        },
        {
            icon: Zap,
            label: '절약한 전력',
            value: powerSaved,
            unit: 'kWh',
            description: `약 일반 가정 ${(powerSaved / 9).toFixed(
                0
            )}일분의 전력량`,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            bgGradient: 'from-amber-50 to-yellow-100',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-700',
            gradient: 'from-amber-600 to-yellow-600',
        },
        {
            icon: Recycle,
            label: '재활용 효과',
            value: recycleEffect,
            unit: 'kg',
            description: `약 재활용 ${recycleEffect}kg과 동일한 효과`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            bgGradient: 'from-blue-50 to-cyan-100',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-700',
            gradient: 'from-blue-600 to-cyan-600',
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
                        onClick={handleGoBack}
                        className='p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors'
                    >
                        <ArrowLeft className='w-5 h-5 text-white' />
                    </button>
                    <h1 className='text-white text-xl font-bold'>탄소 중립</h1>
                </div>

                {/* Main Carbon Card */}
                <Card className='bg-white rounded-3xl p-8 shadow-2xl shadow-emerald-500/20 border border-emerald-100'>
                    <div className='text-center'>
                        <div className='bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-6 w-28 h-28 mx-auto mb-6 flex items-center justify-center shadow-inner'>
                            <TrendingDown className='w-14 h-14 text-emerald-600' />
                        </div>
                        <p className='text-gray-500 text-sm font-medium mb-2 uppercase tracking-wider'>
                            이번 달 탄소 감축량
                        </p>
                        <div className='flex items-baseline justify-center gap-2 mb-8'>
                            <span className='text-6xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'>
                                {totalCarbon}
                            </span>
                            <span className='text-2xl text-gray-400 font-semibold'>
                                kg CO₂
                            </span>
                        </div>

                        {/* 탄소 중립 설명 */}
                        <div className='bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 text-left border border-gray-100'>
                            <div className='flex items-center gap-2 mb-3'>
                                <Leaf className='w-5 h-5 text-emerald-600' />
                                <h3 className='text-gray-800 font-bold text-lg'>
                                    탄소 중립이란?
                                </h3>
                            </div>
                            <p className='text-gray-600 leading-relaxed'>
                                온실가스 배출량과 흡수량이 균형을 이루어
                                순배출량이{' '}
                                <span className='font-bold text-emerald-600'>
                                    '0'
                                </span>
                                이 되는 상태를 의미합니다.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Content */}
            <div className='px-6 py-6 space-y-6'>
                {/* Impact Equivalents */}
                <div>
                    <div className='flex items-center gap-3 mb-6'>
                        <h3 className='text-2xl font-bold text-gray-900'>
                            환경 영향
                        </h3>
                    </div>
                    <div className='space-y-4'>
                        {impactData.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <Card
                                    key={item.label}
                                    className={`bg-gradient-to-br ${item.bgGradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white`}
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                    }}
                                >
                                    <div className='flex items-center gap-5'>
                                        <div
                                            className={`${item.iconBg} rounded-2xl p-4 shadow-sm`}
                                        >
                                            <Icon
                                                className={`w-12 h-12 ${item.iconColor}`}
                                            />
                                        </div>
                                        <div className='flex-1'>
                                            <p className='text-gray-700 font-bold text-base mb-3'>
                                                {item.label}
                                            </p>
                                            <div className='flex items-baseline gap-2 mb-2'>
                                                <span
                                                    className={`text-5xl font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}
                                                >
                                                    {item.value}
                                                </span>
                                                <span className='text-xl text-gray-600 font-bold'>
                                                    {item.unit}
                                                </span>
                                            </div>
                                            <p className='text-gray-600 text-sm font-medium'>
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
                    <h3 className='text-xl font-bold text-gray-900 mb-4'>
                        활동별 기여도
                    </h3>
                    <Card className='bg-white rounded-2xl p-6 shadow'>
                        <div className='space-y-5'>
                            {activitiesContribution.map((item, index) => (
                                <div key={index}>
                                    <div className='flex items-center justify-between mb-2'>
                                        <span className='text-gray-900 font-medium'>
                                            {item.activity}
                                        </span>
                                        <span className='text-[#4CAF50] font-bold'>
                                            {item.reduction}kg CO₂
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <Progress
                                            value={item.percentage}
                                            className='flex-1 h-3'
                                        />
                                        <span className='text-sm text-gray-600 font-medium w-12 text-right'>
                                            {item.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
