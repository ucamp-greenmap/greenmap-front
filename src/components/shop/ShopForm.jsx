import React, { useState } from 'react';
import { addShopVoucher } from '../../util/pointApi';

const ShopForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [price, setPrice] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [popular, setPopular] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 필수 필드 검사
        if (!name || !price) {
            setError('상품 이름과 가격은 필수 입력 항목입니다.');
            return;
        }

        // 가격 검증 (정수로 변환)
        const priceNum = parseInt(price, 10);
        if (isNaN(priceNum) || priceNum < 0) {
            setError('가격은 0 이상의 정수여야 합니다.');
            return;
        }

        const shopData = {
            imageUrl: imageUrl.trim() || undefined,
            price: priceNum,
            name: name.trim(),
            category: category.trim() || undefined,
            brand: brand.trim() || undefined,
            popular: popular,
        };

        setIsLoading(true);

        try {
            const res = await addShopVoucher(shopData);
            console.log('상품 추가 응답:', res);

            alert('✅ 상품이 성공적으로 등록되었습니다!');
            // 폼 초기화
            setImageUrl('');
            setPrice('');
            setName('');
            setCategory('');
            setBrand('');
            setPopular(false);
        } catch (err) {
            console.error('상품 추가 실패', err);

            if (err.message) {
                setError(`❌ ${err.message}`);
            } else if (err.response?.status === 401) {
                setError('❌ 인증이 필요합니다. 다시 로그인해주세요.');
            } else if (err.response?.status === 400) {
                setError('❌ 입력 형식이 올바르지 않습니다.');
            } else if (err.response?.data?.message) {
                setError(`❌ ${err.response.data.message}`);
            } else {
                setError('❌ 상품 추가 중 오류가 발생했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='bg-white shadow-md rounded-lg p-6 space-y-4'>
            <h2 className='text-xl font-semibold text-gray-700 mb-4'>
                상품 작성
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
                        상품 이름 <span className='text-red-500'>*</span>
                    </label>
                    <input
                        type='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                        placeholder='예: 에코 텀블러'
                    />
                </div>

                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        가격 (포인트) <span className='text-red-500'>*</span>
                    </label>
                    <input
                        type='number'
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min='0'
                        step='1'
                        required
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                        placeholder='1000'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                        상품의 포인트 가격을 입력하세요.
                    </p>
                </div>

                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        이미지 URL
                    </label>
                    <input
                        type='url'
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                        placeholder='https://example.com/image.png'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                        상품 이미지의 URL을 입력하세요. (선택사항)
                    </p>
                </div>

                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        카테고리
                    </label>
                    <input
                        type='text'
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                        placeholder='예: lifestyle, food, etc.'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                        상품 카테고리를 입력하세요. (선택사항)
                    </p>
                </div>

                <div>
                    <label className='block font-medium text-gray-700 mb-1'>
                        브랜드
                    </label>
                    <input
                        type='text'
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        disabled={isLoading}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed'
                        placeholder='예: GreenBrand'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                        상품 브랜드를 입력하세요. (선택사항)
                    </p>
                </div>

                <div>
                    <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                            type='checkbox'
                            checked={popular}
                            onChange={(e) => setPopular(e.target.checked)}
                            disabled={isLoading}
                            className='w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
                        />
                        <span className='font-medium text-gray-700'>
                            인기 상품으로 설정
                        </span>
                    </label>
                    <p className='text-xs text-gray-500 mt-1 ml-6'>
                        인기 상품으로 표시할지 선택하세요. (선택사항)
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
        </div>
    );
};

export default ShopForm;
