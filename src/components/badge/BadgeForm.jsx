import React, { useState } from 'react';
import { registerBadge } from '../../api/badgeApi';

// 뱃지 카테고리 키워드 (챌린지와 동일)
const VALID_CATEGORIES = [
    '따릉이',
    '전기차',
    '수소차',
    '재활용센터',
    '제로웨이스트',
];

const BadgeForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [category, setCategory] = useState('');
    const [requirement, setRequirement] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 필수 필드 검사
        if (!name || !icon || !category || !requirement) {
            setError('비어있는 칸이 있습니다. 칸을 모두 채워주세요.');
            return;
        }

        // 숫자 필드 검증
        const requirementNum = parseInt(requirement, 10);

        if (isNaN(requirementNum) || requirementNum <= 0) {
            setError('요구 포인트는 양수여야 합니다.');
            return;
        }

        const badgeData = {
            name: name.trim(),
            requirement: requirementNum,
            description: category.trim(),
            image_url: icon.trim(),
        };

        setIsLoading(true);

        try {
            const res = await registerBadge(badgeData);
            console.log('뱃지 추가 응답:', res);

            alert('✅ 뱃지가 성공적으로 등록되었습니다!');
            // 폼 초기화
            setName('');
            setIcon('');
            setCategory('');
            setRequirement('');
        } catch (err) {
            console.error('뱃지 추가 실패', err.response || err);

            if (err.response?.status === 401) {
                setError('❌ 인증이 필요합니다. 다시 로그인해주세요.');
            } else if (err.response?.status === 400) {
                setError('❌ 입력 형식이 올바르지 않습니다.');
            } else if (err.response?.data?.message) {
                setError(`❌ ${err.response.data.message}`);
            } else {
                setError('❌ 뱃지 추가 중 오류가 발생했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='bg-white shadow-md rounded-lg p-6 space-y-4'>
            <h2 className='text-xl font-semibold text-gray-700 mb-4'>
                뱃지 작성
            </h2>

            {/* 전역 에러 메시지 */}
            {error && (
                <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        카테고리 <span className='text-red-500'>*</span>
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                    >
                        <option value=''>카테고리를 선택하세요</option>
                        {VALID_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                    <p className='text-xs text-gray-500 mt-1'>
                        뱃지의 카테고리를 선택하세요.
                    </p>
                </div>

                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        뱃지 이름
                    </label>
                    <input
                        type='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                        placeholder='예: 초록이 뱃지'
                    />
                </div>

                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        요구 포인트
                    </label>
                    <input
                        type='number'
                        value={requirement}
                        onChange={(e) => setRequirement(e.target.value)}
                        min='1'
                        required
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                        placeholder='1000'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                        이 뱃지를 획득하기 위해 필요한 포인트를 입력하세요.
                    </p>
                </div>

                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        아이콘 URL
                    </label>
                    <input
                        type='text'
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        required
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                        placeholder='https://example.com/badge-icon.png'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                        뱃지 아이콘 이미지의 URL을 입력하세요.
                    </p>
                </div>

                <div className='pt-4'>
                    <button
                        type='submit'
                        disabled={isLoading}
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

            {/* 카테고리 안내 */}
            <div className='bg-blue-50 border border-blue-200 rounded-md p-4 text-sm mt-6'>
                <h3 className='font-semibold text-blue-900 mb-2'>
                    📋 카테고리 안내
                </h3>
                <ul className='space-y-1 text-blue-800'>
                    <li>
                        • <strong>따릉이</strong>: 자전거 이용 관련 뱃지
                    </li>
                    <li>
                        • <strong>전기차</strong>: 전기차 충전 관련 뱃지
                    </li>
                    <li>
                        • <strong>수소차</strong>: 수소차 충전 관련 뱃지
                    </li>
                    <li>
                        • <strong>재활용센터</strong>: 재활용센터 방문 관련 뱃지
                    </li>
                    <li>
                        • <strong>제로웨이스트</strong>: 제로웨이스트 상점 이용
                        관련 뱃지
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default BadgeForm;
