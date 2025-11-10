import React, { useState } from 'react';
import { createChallenge } from '../../api/challengeApi';

// 챌린지 타입 키워드 (백엔드 자동 인증 연동용)
const VALID_CHALLENGE_TYPES = [
    '따릉이',
    '전기차',
    '수소차',
    '재활용센터',
    '제로웨이스트',
];

const ChallengeForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [category, setCategory] = useState('');

    const handleAddChallenge = async () => {
        setError('');

        const challengeName = document
            .getElementById('challengeName')
            .value.trim();
        const description = document.getElementById('description').value.trim();
        const success = document.getElementById('success').value;
        const pointAmount = document.getElementById('pointAmount').value;
        const deadline = document.getElementById('deadline').value;
        const updatedAt = document.getElementById('updatedAt').value;

        // 필수 필드 검사
        if (
            !category ||
            !challengeName ||
            !description ||
            !success ||
            !pointAmount ||
            !deadline ||
            !updatedAt
        ) {
            setError('비어있는 칸이 있습니다. 칸을 모두 채워주세요.');
            return;
        }

        // 숫자 필드 검증
        const successNum = parseInt(success, 10);
        const pointAmountNum = parseInt(pointAmount, 10);
        const deadlineNum = parseInt(deadline, 10);

        if (successNum <= 0 || pointAmountNum <= 0 || deadlineNum <= 0) {
            setError('숫자 값을 올바르게 입력해주세요.');
            return;
        }

        // updatedAt: 관리자가 입력한 만료 기한을 ISO 8601 형식으로 변환
        const expirationDate = new Date(updatedAt);
        if (isNaN(expirationDate.getTime())) {
            setError('모집 종료 날짜 형식이 올바르지 않습니다.');
            return;
        }
        const updatedAtISO = expirationDate.toISOString();

        // description: 카테고리 + 설명
        const descriptionWithCategory = `${category} ${description}`;

        const data = {
            updatedAt: updatedAtISO, // (이벤트 종료일)
            challengeName, // 챌린지명은 자유롭게 입력한 그대로 전송
            description: descriptionWithCategory, // 카테고리 + 설명
            success: successNum,
            pointAmount: pointAmountNum,
            deadline: deadlineNum,
        };

        setIsLoading(true);

        try {
            await createChallenge(data);
            alert('✅ 챌린지가 성공적으로 등록되었습니다!');
            // 폼 초기화
            setCategory('');
            document.getElementById('challengeName').value = '';
            document.getElementById('description').value = '';
            document.getElementById('success').value = '50';
            document.getElementById('pointAmount').value = '500';
            document.getElementById('deadline').value = '7';
            document.getElementById('updatedAt').value = '';
        } catch (err) {
            console.error('챌린지 추가 실패', err);
            setError(err.message || '❌ 챌린지 추가 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='bg-white shadow-md rounded-lg p-6 space-y-4'>
            <h2 className='text-xl font-semibold text-gray-700 mb-4'>
                챌린지 작성
            </h2>

            {/* 전역 에러 메시지 */}
            {error && (
                <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
                    {error}
                </div>
            )}

            <form className='space-y-4'>
                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        카테고리 <span className='text-red-500'>*</span>
                    </label>
                    <select
                        id='category'
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                    >
                        <option value=''>카테고리를 선택하세요</option>
                        {VALID_CHALLENGE_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        챌린지명 <span className='text-red-500'>*</span>
                    </label>
                    <input
                        type='text'
                        maxLength='50'
                        required
                        id='challengeName'
                        placeholder='100km 달성하기'
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                        챌린지 이름을 자유롭게 입력하세요.
                    </p>
                </div>

                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        설명 <span className='text-red-500'>*</span>
                    </label>
                    <input
                        type='text'
                        maxLength='100'
                        required
                        id='description'
                        placeholder='50km 이상 이용하기'
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                        챌린지 설명을 입력하세요.
                    </p>
                </div>

                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        성공 조건
                    </label>
                    <div className='flex items-center space-x-2'>
                        <input
                            type='number'
                            id='success'
                            required
                            min='1'
                            defaultValue='50'
                            disabled={isLoading}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                        />
                        {/* <span className='text-gray-600 whitespace-nowrap'>
                            km / 원
                        </span> */}
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                        따릉이는 km, 충전/상점은 원(₩) 단위입니다.
                    </p>
                </div>

                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        지급 포인트
                    </label>
                    <input
                        type='number'
                        id='pointAmount'
                        defaultValue='500'
                        min='1'
                        required
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                    />
                </div>

                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        기한
                    </label>
                    <div className='flex items-center space-x-2'>
                        <input
                            type='number'
                            id='deadline'
                            required
                            min='1'
                            defaultValue='7'
                            disabled={isLoading}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                        />
                        <span className='text-gray-600'>일</span>
                    </div>
                </div>

                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        모집 종료 날짜 <span className='text-red-500'>*</span>
                    </label>
                    <input
                        type='datetime-local'
                        id='updatedAt'
                        required
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                        챌린지 모집 종료 종료일을 선택해주세요.
                    </p>
                </div>

                <div className='pt-4'>
                    <button
                        type='button'
                        onClick={handleAddChallenge}
                        disabled={isLoading || !category}
                        className='w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-md shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed'
                    >
                        {isLoading ? (
                            <span className='flex items-center justify-center'>
                                <svg
                                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                >
                                    <circle
                                        className='opacity-25'
                                        cx='12'
                                        cy='12'
                                        r='10'
                                        stroke='currentColor'
                                        strokeWidth='4'
                                    ></circle>
                                    <path
                                        className='opacity-75'
                                        fill='currentColor'
                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                    ></path>
                                </svg>
                                등록 중...
                            </span>
                        ) : (
                            '추가하기'
                        )}
                    </button>
                </div>
            </form>

            {/* 챌린지 타입 안내 */}
            <div className='bg-blue-50 border border-blue-200 rounded-md p-4 text-sm mt-6'>
                <h3 className='font-semibold text-blue-900 mb-2'>
                    📋 챌린지 타입 안내
                </h3>
                <ul className='space-y-1 text-blue-800'>
                    <li>
                        • <strong>따릉이</strong>: 자전거 이용 챌린지 (거리
                        기준, km 단위)
                    </li>
                    <li>
                        • <strong>전기차</strong>: 전기차 충전 챌린지 (충전비용
                        기준, 원 단위)
                    </li>
                    <li>
                        • <strong>수소차</strong>: 수소차 충전 챌린지 (충전비용
                        기준, 원 단위)
                    </li>
                    <li>
                        • <strong>재활용센터</strong>: 재활용센터 방문 챌린지
                        (구매금액 기준, 원 단위)
                    </li>
                    <li>
                        • <strong>제로웨이스트</strong>: 제로웨이스트 상점 이용
                        챌린지 (구매금액 기준, 원 단위)
                    </li>
                </ul>
                <p className='mt-2 text-xs text-blue-700'>
                    💡 사용자가 인증을 완료하면 백엔드에서 자동으로 챌린지
                    진행률이 업데이트됩니다.
                </p>
            </div>
        </div>
    );
};

export default ChallengeForm;
