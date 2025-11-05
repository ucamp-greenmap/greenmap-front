// import React, { useState, useEffect, useCallback } from 'react';
// import { useSelector } from 'react-redux';
// import CertTypeCard from '../cert/CertTypeCard';
// import CertModal from '../cert/CertModal';
// import { certTypes } from '../../util/certConfig';
// import {
//     fetchCertificationHistory,
//     fetchMonthlyStats,
// } from '../../util/certApi';

// export default function CertificationScreen() {
//     const memberId = useSelector((s) => s.user?.memberId) || 1;
//     const [selectedType, setSelectedType] = useState(null);
//     const [showModal, setShowModal] = useState(false);
//     const [recentCertifications, setRecentCertifications] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [monthlyStats, setMonthlyStats] = useState({
//         count: 0,
//         totalPoints: 0,
//     });

//     // 카테고리 ENUM → 한글 변환
//     const getCategoryLabel = (category) => {
//         const labels = {
//             BIKE: '따릉이',
//             CAR: '전기차 충전',
//             ZERO_WASTE: '제로웨이스트',
//             RECYCLING_CENTER: '재활용',
//         };
//         return labels[category] || category;
//     };

//     // 날짜 포맷 변환 (2024-10-23T14:30:00 => 2024-10-23)
//     const formatDate = (dateTime) => {
//         if (!dateTime) return '';
//         return dateTime.split('T')[0];
//     };

//     // 최근 인증 내역 불러오기
//     const loadCertificationHistory = useCallback(async () => {
//         console.log('내역 조회 시작, memberId:', memberId);
//         setIsLoading(true);
//         setError(null); // 새로운 로드 시작 시 에러 초기화

//         try {
//             // 1. 인증 내역 불러오기
//             const result = await fetchCertificationHistory(memberId);

//             if (result.success) {
//                 const formattedData = result.data.map((item, index) => ({
//                     id: index + 1,
//                     type: getCategoryLabel(item.category),
//                     date: formatDate(item.createdAt),
//                     points: item.point,
//                     category: item.category,
//                 }));
//                 setRecentCertifications(formattedData);

//                 // 2. 이번 달 통계 API 호출
//                 const statsResult = await fetchMonthlyStats(memberId);
//                 if (statsResult.success) {
//                     setMonthlyStats({
//                         count: statsResult.data.verifyTimes || 0, // 안전한 접근
//                         totalPoints: statsResult.data.pointSum || 0, // 안전한 접근
//                     });
//                 } else {
//                     console.error('❌ 통계 API 실패:', statsResult.message);
//                     setMonthlyStats({ count: 0, totalPoints: 0 });
//                 }
//             } else {
//                 // ❌ API 실패 (success: false) 처리
//                 console.error('❌ API 실패:', result.message);
//                 setError(
//                     result.message || '인증 내역을 불러오는데 실패했습니다.'
//                 );
//             }
//         } catch (err) {
//             // ❌ 네트워크/Axios 오류 처리 (certApi.js 내부에서 처리되므로 여기서는 간결하게)
//             console.error('❌ 내역 조회 오류:', err);
//             setError(
//                 '내역 조회 중 오류가 발생했습니다. 네트워크 상태를 확인하세요.'
//             );
//         } finally {
//             setIsLoading(false);
//         }
//     }, [memberId]);

//     useEffect(() => {
//         loadCertificationHistory();
//     }, [loadCertificationHistory]);

//     function openCertModal(type) {
//         setSelectedType(type);
//         setShowModal(true);
//     }

//     function closeModal() {
//         setShowModal(false);
//         setSelectedType(null);
//         loadCertificationHistory();
//     }

//     return (
//         <>
//             <div
//                 className='min-h-screen bg-gray-50'
//                 style={{ paddingBottom: 'var(--bottom-nav-inset)' }}
//             >
//                 {/* Header */}
//                 <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] px-6 py-8'>
//                     <h1 className='text-3xl font-bold text-white mb-2'>
//                         인증하기
//                     </h1>
//                     <p className='text-white text-opacity-90 text-sm'>
//                         친환경 활동을 인증하고 포인트를 받으세요
//                     </p>
//                 </div>

//                 <div className='px-6 py-6 space-y-6'>
//                     {/* 인증 타입 선택 */}
//                     <div>
//                         <h2 className='text-lg font-bold text-gray-900 mb-4'>
//                             인증할 활동 선택
//                         </h2>
//                         <div className='space-y-3'>
//                             {certTypes.map((type) => (
//                                 <CertTypeCard
//                                     key={type.id}
//                                     type={type}
//                                     onClick={openCertModal}
//                                 />
//                             ))}
//                         </div>
//                     </div>

//                     {/* 인증 팁 */}
//                     <div className='bg-[#8BC34A] bg-opacity-10 rounded-2xl p-5 border border-[#8BC34A] border-opacity-30'>
//                         <h3 className='font-bold text-gray-900 mb-3'>
//                             📌 인증 팁
//                         </h3>
//                         <ul className='space-y-2 text-gray-600 text-sm'>
//                             <li className='flex items-start gap-2'>
//                                 <span className='text-[#4CAF50] mt-0.5'>✓</span>
//                                 <span>
//                                     영수증이 선명하게 보이도록 촬영해주세요
//                                 </span>
//                             </li>
//                             <li className='flex items-start gap-2'>
//                                 <span className='text-[#4CAF50] mt-0.5'>✓</span>
//                                 <span>
//                                     전자 영수증, 따릉이 이용내역 등 결제 증빙
//                                     화면이 선명하게 보이도록 촬영해주세요.
//                                 </span>
//                             </li>
//                             <li className='flex items-start gap-2'>
//                                 <span className='text-[#4CAF50] mt-0.5'>✓</span>
//                                 <span>인증은 바로 승인됩니다</span>
//                             </li>
//                         </ul>
//                     </div>

//                     {/* 최근 인증 내역 */}
//                     <div>
//                         <h2 className='text-lg font-bold text-gray-900 mb-4'>
//                             최근 인증 내역
//                         </h2>
//                         {isLoading ? (
//                             <div className='bg-white rounded-2xl p-8 text-center border border-gray-100'>
//                                 <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CAF50] mx-auto'></div>
//                                 <p className='text-gray-500 mt-3'>
//                                     불러오는 중...
//                                 </p>
//                             </div>
//                         ) : error ? (
//                             <div className='bg-white rounded-2xl p-8 text-center border border-red-500 text-red-500 font-semibold'>
//                                 <p>조회 실패</p>
//                                 <p className='text-sm mt-2 text-gray-700'>
//                                     {error}
//                                 </p>
//                             </div>
//                         ) : recentCertifications.length > 0 ? (
//                             <div className='bg-white rounded-2xl overflow-hidden border border-gray-100'>
//                                 {recentCertifications.map((cert, index) => (
//                                     <div
//                                         key={cert.id}
//                                         className={`p-5 flex items-center justify-between ${
//                                             index !==
//                                             recentCertifications.length - 1
//                                                 ? 'border-b border-gray-100'
//                                                 : ''
//                                         }`}
//                                     >
//                                         <div>
//                                             <p className='font-medium text-gray-900'>
//                                                 {cert.type}
//                                             </p>
//                                             <p className='text-gray-500 text-sm mt-1'>
//                                                 {cert.date}
//                                             </p>
//                                         </div>
//                                         <div className='text-right'>
//                                             <p className='text-[#4CAF50] font-semibold'>
//                                                 +{cert.points}P
//                                             </p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className='bg-white rounded-2xl p-8 text-center border border-gray-100'>
//                                 <p className='text-gray-500'>
//                                     아직 인증 내역이 없어요
//                                 </p>
//                                 <p className='text-gray-400 text-sm mt-2'>
//                                     첫 인증을 시작해보세요!
//                                 </p>
//                             </div>
//                         )}
//                     </div>

//                     {/* 이번 달 진행상황 */}
//                     <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] rounded-2xl p-6 text-white shadow-lg'>
//                         <h3 className='text-white text-opacity-90 mb-4 font-semibold'>
//                             이번 달 진행상황
//                         </h3>
//                         <div className='grid grid-cols-2 gap-6'>
//                             <div>
//                                 <p className='text-white text-opacity-80 text-sm mb-1'>
//                                     인증 횟수
//                                 </p>
//                                 <p className='text-2xl font-bold'>
//                                     {monthlyStats.count}회
//                                 </p>
//                             </div>
//                             <div>
//                                 <p className='text-white text-opacity-80 text-sm mb-1'>
//                                     획득 포인트
//                                 </p>
//                                 <p className='text-2xl font-bold'>
//                                     {monthlyStats.totalPoints}P
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* 모달 */}
//             {showModal && selectedType && (
//                 <CertModal type={selectedType} onClose={closeModal} />
//             )}
//         </>
//     );
// }
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import CertTypeCard from '../cert/CertTypeCard';
import CertModal from '../cert/CertModal';
import { certTypes } from '../../util/certConfig';
import {
    fetchCertificationHistory,
    fetchMonthlyStats,
} from '../../util/certApi';

export default function CertificationScreen() {
    // const memberId = useSelector((s) => s.user?.memberId) || 1;

    const [selectedType, setSelectedType] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [recentCertifications, setRecentCertifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [monthlyStats, setMonthlyStats] = useState({
        count: 0,
        totalPoints: 0,
    });

    // 카테고리 ENUM → 한글 변환
    const getCategoryLabel = (category) => {
        const labels = {
            BIKE: '따릉이',
            CAR: '전기차 충전',
            ZERO_WASTE: '제로웨이스트',
            RECYCLING_CENTER: '재활용',
        };
        return labels[category] || category;
    };

    // 날짜 포맷 변환 (2024-10-23T14:30:00 => 2024-10-23)
    const formatDate = (dateTime) => {
        if (!dateTime) return '';
        return dateTime.split('T')[0];
    };

    // 최근 인증 내역 불러오기
    const loadCertificationHistory = useCallback(async () => {
        console.log('내역 조회 시작');
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchCertificationHistory();

            if (result.success) {
                const formattedData = result.data.map((item, index) => ({
                    id: index + 1,
                    type: getCategoryLabel(item.category),
                    date: formatDate(item.createdAt),
                    points: item.point,
                    category: item.category,
                }));
                setRecentCertifications(formattedData);

                const statsResult = await fetchMonthlyStats();
                if (statsResult.success) {
                    setMonthlyStats({
                        count: statsResult.data.verifyTimes || 0, // 안전한 접근
                        totalPoints: statsResult.data.pointSum || 0, // 안전한 접근
                    });
                } else {
                    console.error('❌ 통계 API 실패:', statsResult.message);
                    setMonthlyStats({ count: 0, totalPoints: 0 });
                }
            } else {
                // ❌ API 실패 (success: false) 처리
                console.error('❌ API 실패:', result.message);
                setError(
                    result.message || '인증 내역을 불러오는데 실패했습니다.'
                );
            }
        } catch (err) {
            console.error('❌ 내역 조회 오류:', err);
            setError(
                '내역 조회 중 오류가 발생했습니다. 네트워크 상태를 확인하세요.'
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCertificationHistory();
    }, [loadCertificationHistory]);

    function openCertModal(type) {
        setSelectedType(type);
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setSelectedType(null);
        loadCertificationHistory();
    }

    return (
        <>
            <div
                className='min-h-screen bg-gray-50'
                style={{ paddingBottom: 'var(--bottom-nav-inset)' }}
            >
                {/* Header */}
                <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] px-6 py-8'>
                    <h1 className='text-3xl font-bold text-white mb-2'>
                        인증하기
                    </h1>
                    <p className='text-white text-opacity-90 text-sm'>
                        친환경 활동을 인증하고 포인트를 받으세요
                    </p>
                </div>

                <div className='px-6 py-6 space-y-6'>
                    {/* 인증 타입 선택 */}
                    <div>
                        <h2 className='text-lg font-bold text-gray-900 mb-4'>
                            인증할 활동 선택
                        </h2>
                        <div className='space-y-3'>
                            {certTypes.map((type) => (
                                <CertTypeCard
                                    key={type.id}
                                    type={type}
                                    onClick={openCertModal}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 인증 팁 */}
                    <div className='bg-[#8BC34A] bg-opacity-10 rounded-2xl p-5 border border-[#8BC34A] border-opacity-30'>
                        <h3 className='font-bold text-gray-900 mb-3'>
                            📌 인증 팁
                        </h3>
                        <ul className='space-y-2 text-gray-600 text-sm'>
                            <li className='flex items-start gap-2'>
                                <span className='text-[#4CAF50] mt-0.5'>✓</span>
                                <span>
                                    영수증이 선명하게 보이도록 촬영해주세요
                                </span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='text-[#4CAF50] mt-0.5'>✓</span>
                                <span>
                                    전자 영수증, 따릉이 이용내역 등 결제 증빙
                                    화면이 선명하게 보이도록 촬영해주세요.
                                </span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='text-[#4CAF50] mt-0.5'>✓</span>
                                <span>인증은 바로 승인됩니다</span>
                            </li>
                        </ul>
                    </div>

                    {/* 최근 인증 내역 */}
                    <div>
                        <h2 className='text-lg font-bold text-gray-900 mb-4'>
                            최근 인증 내역
                        </h2>
                        {isLoading ? (
                            <div className='bg-white rounded-2xl p-8 text-center border border-gray-100'>
                                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CAF50] mx-auto'></div>
                                <p className='text-gray-500 mt-3'>
                                    불러오는 중...
                                </p>
                            </div>
                        ) : error ? (
                            <div className='bg-white rounded-2xl p-8 text-center border border-red-500 text-red-500 font-semibold'>
                                <p>조회 실패</p>
                                <p className='text-sm mt-2 text-gray-700'>
                                    {error}
                                </p>
                            </div>
                        ) : recentCertifications.length > 0 ? (
                            <div className='bg-white rounded-2xl overflow-hidden border border-gray-100'>
                                {recentCertifications.map((cert, index) => (
                                    <div
                                        key={cert.id}
                                        className={`p-5 flex items-center justify-between ${
                                            index !==
                                            recentCertifications.length - 1
                                                ? 'border-b border-gray-100'
                                                : ''
                                        }`}
                                    >
                                        <div>
                                            <p className='font-medium text-gray-900'>
                                                {cert.type}
                                            </p>
                                            <p className='text-gray-500 text-sm mt-1'>
                                                {cert.date}
                                            </p>
                                        </div>
                                        <div className='text-right'>
                                            <p className='text-[#4CAF50] font-semibold'>
                                                +{cert.points}P
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='bg-white rounded-2xl p-8 text-center border border-gray-100'>
                                <p className='text-gray-500'>
                                    아직 인증 내역이 없어요
                                </p>
                                <p className='text-gray-400 text-sm mt-2'>
                                    첫 인증을 시작해보세요!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 이번 달 진행상황 */}
                    <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] rounded-2xl p-6 text-white shadow-lg'>
                        <h3 className='text-white text-opacity-90 mb-4 font-semibold'>
                            이번 달 진행상황
                        </h3>
                        <div className='grid grid-cols-2 gap-6'>
                            <div>
                                <p className='text-white text-opacity-80 text-sm mb-1'>
                                    인증 횟수
                                </p>
                                <p className='text-2xl font-bold'>
                                    {monthlyStats.count}회
                                </p>
                            </div>
                            <div>
                                <p className='text-white text-opacity-80 text-sm mb-1'>
                                    획득 포인트
                                </p>
                                <p className='text-2xl font-bold'>
                                    {monthlyStats.totalPoints}P
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모달 */}
            {showModal && selectedType && (
                <CertModal type={selectedType} onClose={closeModal} />
            )}
        </>
    );
}
