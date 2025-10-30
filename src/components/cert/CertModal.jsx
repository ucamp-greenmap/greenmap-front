import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { X, Upload, CheckCircle } from 'lucide-react';
import {
    extractDistance,
    extractAmounts,
    extractApiData,
} from '../../util/ocrUtils';

export default function CertModal({ type, onClose }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [ocrResult, setOcrResult] = useState('');

    // 추출된 값 상태
    const [extractedPrice, setExtractedPrice] = useState(0);
    const [extractedCharge, setExtractedCharge] = useState(0);
    const [extractedDistance, setExtractedDistance] = useState(0);
    const [detectedCategory, setDetectedCategory] = useState('');
    const [extraData, setExtraData] = useState({
        approveNum: '',
        bike_number: '',
        startTime: '',
        endTime: '',
        name: '',
    });

    // OCR 실행 및 데이터 추출
    async function processImageWithOCR(file) {
        setIsProcessing(true);
        setOcrResult('');
        setExtractedPrice(0);
        setExtractedCharge(0);
        setExtractedDistance(0);
        setDetectedCategory('');

        try {
            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result);
            reader.readAsDataURL(file);

            const result = await Tesseract.recognize(file, 'kor+eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        console.log(`진행률: ${Math.round(m.progress * 100)}%`);
                    }
                },
                workerPath:
                    'https://unpkg.com/tesseract.js@v4.0.1/dist/worker.min.js',
                langPath: 'https://tessdata.projectnaptha.com/4.0.0',
                corePath:
                    'https://unpkg.com/tesseract.js-core@v4.0.1/tesseract-core.wasm.js',
            });

            const text = result.data.text;
            setOcrResult(text);

            if (type.id === 'bike') {
                const distance = extractDistance(text);
                setExtractedDistance(distance);
            } else {
                const { charge, price } = extractAmounts(text);
                setExtractedCharge(charge);
                setExtractedPrice(price);
            }

            const extractedExtraData = extractApiData(text);
            setExtraData(extractedExtraData);

            // 제로웨이스트 vs 재활용 자동 구분
            if (type.id === 'z') {
                const hasRecycleKeyword = type.recycleKeywords.some((keyword) =>
                    text.toLowerCase().includes(keyword.toLowerCase())
                );
                const hasZeroKeyword = type.zeroKeywords.some((keyword) =>
                    text.toLowerCase().includes(keyword.toLowerCase())
                );

                if (hasRecycleKeyword) {
                    setDetectedCategory('recycle');
                    alert(`✅ OCR 인식 완료! [재활용센터]로 감지되었습니다.`);
                } else if (hasZeroKeyword) {
                    setDetectedCategory('zero');
                    alert(`✅ OCR 인식 완료! [제로웨이스트]로 감지되었습니다.`);
                } else {
                    alert(
                        `❌ 키워드 인식 실패! 영수증/내역을 다시 확인해주세요.`
                    );
                }
            } else {
                const hasKeyword = type.keywords.some((keyword) =>
                    text.toLowerCase().includes(keyword.toLowerCase())
                );

                if (hasKeyword) {
                    alert(
                        `✅ OCR 인식 완료! 값을 확인 후 인증 요청을 눌러주세요.`
                    );
                } else {
                    alert(
                        `❌ 키워드 인식 실패! 영수증/내역을 다시 확인해주세요.`
                    );
                }
            }
        } catch (error) {
            console.error('OCR 오류:', error);
            alert('이미지 인식에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsProcessing(false);
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            processImageWithOCR(file);
        }
    }

    // API 전송 (JSON 보여주기)
    const handleCertification = async () => {
        let isValid = false;

        if (type.id === 'bike') {
            isValid = extractedDistance > 0;
        } else if (type.id === 'ev') {
            isValid = extractedCharge > 0 || extractedPrice > 0;
        } else {
            isValid = extractedPrice > 0;
        }

        if (!isValid) {
            alert(
                '❌ 인증에 필요한 거리/금액/충전량 값을 인식하지 못했습니다. 더 선명한 이미지로 다시 시도해주세요.'
            );
            return;
        }

        setIsSubmitting(true);

        let body = {};
        let apiUrl = '';
        const categoryId = type.id;

        try {
            if (categoryId === 'bike') {
                apiUrl = '/verification/bike';
                body = {
                    category: 'bike',
                    bike_number: parseInt(extraData.bike_number) || 0,
                    distance: Math.round(extractedDistance * 100) / 100,
                    start_time: extraData.startTime,
                    end_time: extraData.endTime,
                };
            } else if (categoryId === 'ev') {
                apiUrl = '/verification/car';
                let finalChargeAmount = 0.0;
                let finalChargeFee = 0;

                if (extractedCharge > 0) {
                    finalChargeAmount = extractedCharge;
                    finalChargeFee = 0;
                } else if (extractedPrice > 0) {
                    finalChargeAmount = 0.0;
                    finalChargeFee = extractedPrice;
                }

                body = {
                    category: 'car',
                    chargeAmount: finalChargeAmount,
                    chargeFee: finalChargeFee,
                    start_time: extraData.startTime,
                    end_time: extraData.endTime,
                };
            } else if (categoryId === 'z') {
                apiUrl = '/verification/shop';
                const finalCategory = detectedCategory || 'zero';
                body = {
                    category: finalCategory,
                    name: extraData.name,
                    price: extractedPrice,
                    approveNum: parseInt(extraData.approveNum) || 0,
                };
            }

            const jsonBody = JSON.stringify(body, null, 2);
            console.log('URL:', apiUrl);
            console.log('--- API Request Body ---', jsonBody);
            alert(`✅ API 전송 내용 준비 완료!\n\n[Body - JSON]\n${jsonBody}`);

            onClose();
        } catch (error) {
            console.error('데이터 매핑 중 오류 발생:', error);
            alert(`❌ 데이터 매핑 오류: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
                {/* 모달 헤더 */}
                <div
                    className={`bg-gradient-to-br ${type.color} p-6 rounded-t-3xl relative`}
                >
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className='absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition'
                    >
                        <X className='w-6 h-6' />
                    </button>
                    <div className='text-5xl mb-3'>{type.icon}</div>
                    <h3 className='text-2xl font-bold text-white mb-1'>
                        {type.label}
                    </h3>
                    <p className='text-white text-opacity-90 text-sm'>
                        {type.description}
                    </p>
                </div>

                {/* 모달 내용 */}
                <div className='p-6 space-y-4'>
                    {/* 업로드 버튼 */}
                    <label
                        className={`
                            block w-full rounded-2xl p-6 text-center cursor-pointer transition-all
                            ${
                                isProcessing
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] hover:shadow-lg'
                            }
                        `}
                    >
                        <Upload className='w-12 h-12 mx-auto mb-3 text-white' />
                        <div className='text-white font-semibold'>
                            {isProcessing ? '분석 중...' : '📷 사진 선택하기'}
                        </div>
                        <div className='text-white text-opacity-80 text-sm mt-1'>
                            영수증이나 이용내역을 촬영해주세요
                        </div>
                        <input
                            type='file'
                            accept='image/*'
                            onChange={handleFileSelect}
                            disabled={isProcessing}
                            className='hidden'
                        />
                    </label>

                    {/* 미리보기 */}
                    {previewImage && (
                        <div className='rounded-2xl overflow-hidden border-2 border-gray-200'>
                            <img
                                src={previewImage}
                                alt='미리보기'
                                className='w-full'
                            />
                        </div>
                    )}

                    {/* OCR 결과 및 추출 값 표시 */}
                    {ocrResult && (
                        <div className='space-y-3'>
                            {/* 감지된 카테고리 표시 */}
                            {type.id === 'z' && detectedCategory && (
                                <div className='bg-purple-50 rounded-2xl p-4 border-2 border-purple-200'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-purple-800 font-semibold'>
                                            🏷️ 감지된 카테고리
                                        </span>
                                        <span className='text-xl font-bold text-purple-600'>
                                            {detectedCategory === 'recycle'
                                                ? '재활용센터'
                                                : '제로웨이스트'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* 추출 값 표시 */}
                            {(extractedPrice > 0 ||
                                extractedCharge > 0 ||
                                extractedDistance > 0) && (
                                <div className='bg-green-50 rounded-2xl p-4 border-2 border-green-200'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-green-800 font-semibold'>
                                            {type.id === 'bike'
                                                ? '🚴 추출된 거리'
                                                : type.id === 'ev'
                                                ? extractedCharge > 0 &&
                                                  extractedPrice > 0
                                                    ? '⚡ 충전량 / 💰 금액'
                                                    : extractedCharge > 0
                                                    ? '⚡ 충전량'
                                                    : '💰 금액'
                                                : '💰 추출된 금액'}
                                        </span>
                                        <span className='text-xl font-bold text-green-600 flex flex-col items-end'>
                                            {type.id === 'bike' ? (
                                                `${extractedDistance.toFixed(
                                                    2
                                                )}km`
                                            ) : type.id === 'ev' ? (
                                                <>
                                                    {extractedCharge > 0 && (
                                                        <span className='text-2xl font-bold'>
                                                            {extractedCharge.toFixed(
                                                                2
                                                            )}
                                                            kWh
                                                        </span>
                                                    )}
                                                    {extractedPrice > 0 && (
                                                        <span
                                                            className={`${
                                                                extractedCharge >
                                                                0
                                                                    ? 'text-base font-normal text-gray-500'
                                                                    : 'text-2xl font-bold'
                                                            }`}
                                                        >
                                                            {extractedPrice.toLocaleString()}
                                                            원
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                `${extractedPrice.toLocaleString()}원`
                                            )}
                                        </span>
                                    </div>
                                    {/* 시간 표시 */}
                                    {(type.id === 'ev' || type.id === 'bike') &&
                                        (extraData.startTime ||
                                            extraData.endTime) && (
                                            <div className='text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200'>
                                                <p>
                                                    ⏱️ 시간:{' '}
                                                    {extraData.startTime ||
                                                        '??:??'}{' '}
                                                    ~{' '}
                                                    {extraData.endTime ||
                                                        '??:??'}
                                                </p>
                                            </div>
                                        )}
                                </div>
                            )}

                            {/* 인식된 텍스트 */}
                            <div className='bg-gray-50 rounded-2xl p-4 border border-gray-200'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <CheckCircle className='w-5 h-5 text-[#4CAF50]' />
                                    <p className='font-semibold text-gray-900'>
                                        인식된 텍스트
                                    </p>
                                </div>
                                <div className='bg-white rounded-xl p-3 max-h-40 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap'>
                                    {ocrResult}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 인증 요청 버튼 */}
                    <button
                        onClick={handleCertification}
                        disabled={
                            isSubmitting ||
                            isProcessing ||
                            (type.id === 'bike' && extractedDistance <= 0) ||
                            (type.id !== 'bike' &&
                                extractedCharge <= 0 &&
                                extractedPrice <= 0)
                        }
                        className={`w-full py-4 rounded-xl text-white font-bold transition-all 
                            ${
                                isSubmitting || isProcessing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600'
                            }`}
                    >
                        {isSubmitting
                            ? '데이터 준비 중...'
                            : '전송 내용 확인하기'}
                    </button>

                    {/* 정보 박스 */}
                    <div className='bg-blue-50 rounded-2xl p-4 border border-blue-200'>
                        <p className='text-blue-800 text-sm'>
                            💡 <strong>예상 포인트:</strong> {type.points}P
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
