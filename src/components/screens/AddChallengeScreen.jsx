// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { setActiveTab } from '../../store/slices/appSlice';
// import api from '../../api/axios';

// // 챌린지 타입 키워드 (백엔드 자동 인증 연동용)
// const VALID_CHALLENGE_TYPES = [
//     '따릉이',
//     '전기차',
//     '수소차',
//     '재활용센터',
//     '제로웨이스트',
// ];

// export default function AddChallengeScreen({ onNavigate }) {
//     const dispatch = useDispatch();
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [descriptionError, setDescriptionError] = useState('');

//     const navigate = (tab) => {
//         if (typeof onNavigate === 'function') return onNavigate(tab);
//         dispatch(setActiveTab(tab));
//     };

//     // Description 유효성 검사 함수
//     const validateDescription = (description) => {
//         if (!description.trim()) {
//             return '설명을 입력해주세요.';
//         }

//         const firstWord = description.trim().split(' ')[0];
//         if (!VALID_CHALLENGE_TYPES.includes(firstWord)) {
//             return `설명은 다음 키워드 중 하나로 시작해야 합니다: ${VALID_CHALLENGE_TYPES.join(
//                 ', '
//             )}`;
//         }

//         return '';
//     };

//     // Description 입력 변경 핸들러
//     const handleDescriptionChange = (e) => {
//         const value = e.target.value;
//         const validationError = validateDescription(value);
//         setDescriptionError(validationError);
//     };

//     const handleAddChallenge = async () => {
//         console.log('추가 버튼 클릭');
//         setError('');

//         const challengeName = document
//             .getElementById('challengeName')
//             .value.trim();
//         const description = document.getElementById('description').value.trim();
//         const success = document.getElementById('success').value;
//         const pointAmount = document.getElementById('pointAmount').value;
//         const deadline = document.getElementById('deadline').value;

//         // 필수 필드 검사
//         if (
//             !challengeName ||
//             !description ||
//             !success ||
//             !pointAmount ||
//             !deadline
//         ) {
//             setError('비어있는 칸이 있습니다. 칸을 모두 채워주세요.');
//             return;
//         }

//         // Description 유효성 검사
//         const descError = validateDescription(description);
//         if (descError) {
//             setDescriptionError(descError);
//             setError('설명 형식을 확인해주세요.');
//             return;
//         }

//         // 숫자 필드 검증
//         const successNum = parseInt(success, 10);
//         const pointAmountNum = parseInt(pointAmount, 10);
//         const deadlineNum = parseInt(deadline, 10);

//         if (successNum <= 0 || pointAmountNum <= 0 || deadlineNum <= 0) {
//             setError('숫자 값을 올바르게 입력해주세요.');
//             return;
//         }

//         // updatedAt 계산: 현재 날짜 + deadline 일수
//         const now = new Date();
//         const updatedAt = new Date(now);
//         updatedAt.setDate(now.getDate() + deadlineNum);
//         const updatedAtISO = updatedAt.toISOString();

//         // challengeName: 카테고리(description 첫 단어) + 설명(challengeName)
//         const category = description.trim().split(' ')[0];
//         const challengeNameWithCategory = `${category} ${challengeName}`;

//         const data = {
//             updatedAt: updatedAtISO,
//             challengeName: challengeNameWithCategory,
//             description,
//             success: successNum,
//             pointAmount: pointAmountNum,
//             deadline: deadlineNum,
//         };

//         setIsLoading(true);

//         try {
//             const res = await api.post('/chalregis', data);
//             console.log('챌린지 추가 응답:', res.data);

//             if (res.data.status === 'SUCCESS') {
//                 alert('✅ 챌린지가 성공적으로 등록되었습니다!');
//                 navigate('challenge');
//             } else {
//                 setError(res.data.message || '챌린지 추가에 실패했습니다.');
//             }
//         } catch (err) {
//             console.error('챌린지 추가 실패', err.response || err);

//             if (err.response?.status === 401) {
//                 setError('❌ 인증이 필요합니다. 다시 로그인해주세요.');
//             } else if (err.response?.status === 400) {
//                 setError('❌ 입력 형식이 올바르지 않습니다.');
//             } else if (err.response?.data?.message) {
//                 setError(`❌ ${err.response.data.message}`);
//             } else {
//                 setError('❌ 챌린지 추가 중 오류가 발생했습니다.');
//             }
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <>
//             {/* 뒤로가기 버튼이 있는 헤더 */}
//             <div className='w-full bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] py-6 text-white shadow-lg relative'>
//                 {/* 뒤로가기 버튼 */}
//                 <button
//                     onClick={() => navigate('challenge')}
//                     className='absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors'
//                     aria-label='뒤로가기'
//                 >
//                     <svg
//                         xmlns='http://www.w3.org/2000/svg'
//                         fill='none'
//                         viewBox='0 0 24 24'
//                         strokeWidth={2.5}
//                         stroke='currentColor'
//                         className='w-6 h-6'
//                     >
//                         <path
//                             strokeLinecap='round'
//                             strokeLinejoin='round'
//                             d='M15.75 19.5L8.25 12l7.5-7.5'
//                         />
//                     </svg>
//                 </button>

//                 {/* 제목 */}
//                 <div className='text-center px-16'>
//                     <h1 className='text-2xl font-bold mb-1'>챌린지 추가</h1>
//                     <p className='text-white text-opacity-90 text-sm'>
//                         환영합니다 관리자님 👋
//                     </p>
//                 </div>
//             </div>

//             <div className='pt-6 pb-4 px-4'>
//                 <p className='text-center text-gray-600 text-sm mb-6'>
//                     추가할 챌린지를 작성해 주세요.
//                 </p>
//             </div>

//             <div className='max-w-2xl mx-auto bg-white shadow-md rounded-lg p-8 space-y-6 mb-10'>
//                 <h2 className='text-xl font-semibold text-gray-700 mb-4'>
//                     챌린지 작성
//                 </h2>

//                 {/* 전역 에러 메시지 */}
//                 {error && (
//                     <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
//                         {error}
//                     </div>
//                 )}

//                 <form className='space-y-4'>
//                     <div>
//                         <label className='block font-medium text-gray-700 mb-1'>
//                             챌린지명
//                         </label>
//                         <input
//                             type='text'
//                             maxLength='16'
//                             required
//                             id='challengeName'
//                             placeholder='일주일 따릉이 타기'
//                             disabled={isLoading}
//                             className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
//                         />
//                     </div>

//                     <div>
//                         <label className='block font-medium text-gray-700 mb-1'>
//                             설명 <span className='text-red-500'>*</span>
//                         </label>
//                         <input
//                             type='text'
//                             maxLength='32'
//                             required
//                             id='description'
//                             placeholder='따릉이 50km 이상 타기'
//                             onChange={handleDescriptionChange}
//                             disabled={isLoading}
//                             className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
//                                 descriptionError
//                                     ? 'border-red-300 focus:ring-red-400'
//                                     : 'border-gray-300 focus:ring-green-400'
//                             }`}
//                         />
//                         {/* Description 규칙 안내 */}
//                         <p className='text-xs text-gray-500 mt-1'>
//                             💡 설명은 <strong>따릉이</strong>,{' '}
//                             <strong>전기차</strong>, <strong>수소차</strong>,{' '}
//                             <strong>재활용센터</strong>,{' '}
//                             <strong>제로웨이스트</strong> 중 하나로 시작해야
//                             합니다.
//                         </p>
//                         {/* Description 에러 메시지 */}
//                         {descriptionError && (
//                             <p className='text-xs text-red-600 mt-1'>
//                                 {descriptionError}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className='block font-medium text-gray-700 mb-1'>
//                             시작 인원수
//                         </label>
//                         <input
//                             type='number'
//                             id='memberCount'
//                             required
//                             readOnly
//                             defaultValue='0'
//                             disabled={isLoading}
//                             className='w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 cursor-not-allowed'
//                         />
//                         <p className='text-xs text-gray-500 mt-1'>
//                             초기 참여 인원수는 0으로 고정됩니다.
//                         </p>
//                     </div>

//                     <div>
//                         <label className='block font-medium text-gray-700 mb-1'>
//                             성공 조건
//                         </label>
//                         <div className='flex items-center space-x-2'>
//                             <input
//                                 type='number'
//                                 id='success'
//                                 required
//                                 min='1'
//                                 defaultValue='50'
//                                 disabled={isLoading}
//                                 className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
//                             />
//                             <span className='text-gray-600 whitespace-nowrap'>
//                                 km / 원
//                             </span>
//                         </div>
//                         <p className='text-xs text-gray-500 mt-1'>
//                             따릉이는 km, 충전/상점은 원(₩) 단위입니다.
//                         </p>
//                     </div>

//                     <div>
//                         <label className='block font-medium text-gray-700 mb-1'>
//                             지급 포인트
//                         </label>
//                         <input
//                             type='number'
//                             id='pointAmount'
//                             defaultValue='500'
//                             min='1'
//                             required
//                             disabled={isLoading}
//                             className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
//                         />
//                     </div>

//                     <div>
//                         <label className='block font-medium text-gray-700 mb-1'>
//                             기한
//                         </label>
//                         <div className='flex items-center space-x-2'>
//                             <input
//                                 type='number'
//                                 id='deadline'
//                                 required
//                                 min='1'
//                                 defaultValue='7'
//                                 disabled={isLoading}
//                                 className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
//                             />
//                             <span className='text-gray-600'>일</span>
//                         </div>
//                     </div>

//                     <div className='pt-6'>
//                         <button
//                             type='button'
//                             onClick={handleAddChallenge}
//                             disabled={isLoading || descriptionError}
//                             className='w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-md shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed'
//                         >
//                             {isLoading ? (
//                                 <span className='flex items-center justify-center'>
//                                     <svg
//                                         className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
//                                         xmlns='http://www.w3.org/2000/svg'
//                                         fill='none'
//                                         viewBox='0 0 24 24'
//                                     >
//                                         <circle
//                                             className='opacity-25'
//                                             cx='12'
//                                             cy='12'
//                                             r='10'
//                                             stroke='currentColor'
//                                             strokeWidth='4'
//                                         ></circle>
//                                         <path
//                                             className='opacity-75'
//                                             fill='currentColor'
//                                             d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
//                                         ></path>
//                                     </svg>
//                                     등록 중...
//                                 </span>
//                             ) : (
//                                 '추가하기'
//                             )}
//                         </button>
//                     </div>
//                 </form>

//                 {/* 챌린지 타입 안내 */}
//                 <div className='bg-blue-50 border border-blue-200 rounded-md p-4 text-sm'>
//                     <h3 className='font-semibold text-blue-900 mb-2'>
//                         📋 챌린지 타입 안내
//                     </h3>
//                     <ul className='space-y-1 text-blue-800'>
//                         <li>
//                             • <strong>따릉이</strong>: 자전거 이용 챌린지 (거리
//                             기준, km 단위)
//                         </li>
//                         <li>
//                             • <strong>전기차</strong>: 전기차 충전 챌린지
//                             (충전비용 기준, 원 단위)
//                         </li>
//                         <li>
//                             • <strong>수소차</strong>: 수소차 충전 챌린지
//                             (충전비용 기준, 원 단위)
//                         </li>
//                         <li>
//                             • <strong>재활용센터</strong>: 재활용센터 방문
//                             챌린지 (구매금액 기준, 원 단위)
//                         </li>
//                         <li>
//                             • <strong>제로웨이스트</strong>: 제로웨이스트 상점
//                             이용 챌린지 (구매금액 기준, 원 단위)
//                         </li>
//                     </ul>
//                     <p className='mt-2 text-xs text-blue-700'>
//                         💡 사용자가 인증을 완료하면 백엔드에서 자동으로 챌린지
//                         진행률이 업데이트됩니다.
//                     </p>
//                 </div>
//             </div>
//         </>
//     );
// }
