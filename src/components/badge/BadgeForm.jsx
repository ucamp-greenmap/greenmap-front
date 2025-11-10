import React, { useState, useRef } from 'react';
import { registerBadge } from '../../api/badgeApi';
import { uploadImageToFirebase } from '../../util/imageUpload';
import { Upload, X } from 'lucide-react';

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
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('');
    const [category, setCategory] = useState('');
    const [requirement, setRequirement] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // 파일 선택 핸들러
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 파일 크기 검증 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('이미지 파일은 5MB 이하여야 합니다.');
            return;
        }

        // 파일 타입 검증
        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드 가능합니다.');
            return;
        }

        setSelectedFile(file);
        setError('');

        // 미리보기 생성
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = async () => {
        if (!selectedFile) {
            setError('이미지 파일을 선택해주세요.');
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            // Firebase Storage에 업로드하고 URL 받기
            const imageUrl = await uploadImageToFirebase(
                selectedFile,
                'badges'
            );

            // 받은 URL을 icon state에 저장 (이 URL이 서버로 전달됨!)
            setIcon(imageUrl);

            alert('✅ 이미지가 성공적으로 업로드되었습니다!');
        } catch (err) {
            console.error('이미지 업로드 실패', err);
            setError('❌ 이미지 업로드 중 오류가 발생했습니다: ' + err.message);
            setSelectedFile(null);
            setPreviewImage('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } finally {
            setIsUploading(false);
        }
    };

    // 이미지 제거 핸들러
    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewImage('');
        setIcon('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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
            setError('획득 기준은 양수여야 합니다.');
            return;
        }

        const badgeData = {
            name: name.trim(),
            requirement: requirementNum,
            description: category.trim() + ' ' + description.trim(),
            image_url: icon.trim(),
        };

        setIsLoading(true);

        try {
            const res = await registerBadge(badgeData);
            console.log('뱃지 추가 응답:', res);

            alert('✅ 뱃지가 성공적으로 등록되었습니다!');
            // 폼 초기화
            setName('');
            setDescription('');
            setIcon('');
            setCategory('');
            setRequirement('');
            setSelectedFile(null);
            setPreviewImage('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
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
                        뱃지 이름 <span className='text-red-500'>*</span>
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
                        뱃지 설명 <span className='text-white'>*</span>
                    </label>
                    <input
                        type='text'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                        placeholder='예: 누적 따릉이 100km  (선택사항)'
                    />
                </div>
                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        획득 기준 <span className='text-red-500'>*</span>
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
                        이 뱃지를 획득하기 위해 필요한 획득 기준을 입력하세요.
                    </p>
                </div>

                {/* 이미지 업로드 섹션 */}
                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        아이콘 이미지 <span className='text-red-500'>*</span>
                    </label>

                    <div className='space-y-3'>
                        {/* 파일 선택 */}
                        <div>
                            <input
                                ref={fileInputRef}
                                type='file'
                                accept='image/*'
                                onChange={handleFileSelect}
                                disabled={isLoading || isUploading}
                                className='hidden'
                                id='image-upload'
                            />
                            <label
                                htmlFor='image-upload'
                                className={`flex items-center justify-center w-full border-2 border-dashed rounded-lg p-4 cursor-pointer transition ${
                                    isUploading || isLoading
                                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                                        : 'border-green-400 hover:border-green-500 hover:bg-green-50'
                                }`}
                            >
                                <Upload className='w-5 h-5 mr-2 text-green-500' />
                                <span className='text-gray-700'>
                                    {isUploading
                                        ? '업로드 중...'
                                        : '이미지 파일 선택'}
                                </span>
                            </label>
                        </div>

                        {/* 업로드 버튼 (파일 선택 후) */}
                        {selectedFile && !icon && (
                            <button
                                type='button'
                                onClick={handleImageUpload}
                                disabled={isUploading || isLoading}
                                className='w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition disabled:bg-gray-400 disabled:cursor-not-allowed'
                            >
                                {isUploading
                                    ? 'Firebase에 업로드 중...'
                                    : '이미지 업로드'}
                            </button>
                        )}

                        {/* 이미지 미리보기 */}
                        {(previewImage || icon) && (
                            <div className='relative inline-block'>
                                <img
                                    src={previewImage || icon}
                                    alt='미리보기'
                                    className='w-32 h-32 object-cover rounded-lg border-2 border-gray-200'
                                />
                                <button
                                    type='button'
                                    onClick={handleRemoveImage}
                                    disabled={isLoading || isUploading}
                                    className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:bg-gray-400'
                                >
                                    <X className='w-4 h-4' />
                                </button>
                            </div>
                        )}

                        {/* 업로드 완료 메시지 */}
                        {icon &&
                            icon.startsWith(
                                'https://firebasestorage.googleapis.com'
                            ) && (
                                <div className='text-sm text-green-600 bg-green-50 p-2 rounded'>
                                    ✅ Firebase Storage에 업로드 완료
                                </div>
                            )}

                        {/* 또는 URL 직접 입력 */}
                        <div className='relative'>
                            <div className='absolute inset-0 flex items-center'>
                                <div className='w-full border-t border-gray-300'></div>
                            </div>
                            <div className='relative flex justify-center text-sm'>
                                <span className='px-2 bg-white text-gray-500'>
                                    또는 URL 직접 입력
                                </span>
                            </div>
                        </div>

                        <input
                            type='text'
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            disabled={isLoading || isUploading}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                            placeholder='https://firebasestorage.googleapis.com/... 또는 다른 URL'
                        />
                    </div>

                    <p className='text-xs text-gray-500 mt-1'>
                        이미지 파일을 업로드하거나 URL을 직접 입력하세요. (최대
                        5MB)
                    </p>
                </div>

                <div className='pt-4'>
                    <button
                        type='submit'
                        disabled={isLoading || isUploading}
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
