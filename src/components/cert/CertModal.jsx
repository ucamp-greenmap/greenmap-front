import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Tesseract from 'tesseract.js';
import { X, Upload, CheckCircle } from 'lucide-react';
import {
    login,
    updateProfile,
    fetchPointInfo,
} from '../../store/slices/userSlice';
import api from '../../api/axios';
import {
    extractDistance,
    extractAmounts,
    extractApiData,
} from '../../util/ocrUtils';
import {
    verifyBike,
    verifyEVCar,
    verifyHCar,
    verifyShop,
} from '../../util/certApi';

function Modal({ message, type = 'info', onClose, onSuccess }) {
    const handleClick = () => {
        onClose();
        if (type === 'success' && onSuccess) {
            onSuccess();
        }
    };

    const isSuccess = type === 'success' || type === 'info-success';

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black/40 z-[1000]'>
            <div className='bg-white rounded-2xl shadow-xl w-80 p-6 text-center'>
                <div
                    className={`text-4xl mb-3 ${
                        isSuccess ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                    {isSuccess ? '🌳' : '🍂'}
                </div>

                <p className='text-gray-800 font-semibold mb-4 mt-4 whitespace-pre-line'>
                    {message}
                </p>

                <button
                    onClick={handleClick}
                    className='w-full py-2 rounded-xl font-bold text-white'
                    style={{
                        background: isSuccess ? '#96cb6f' : '#e63e3eff',
                    }}
                >
                    확인
                </button>
            </div>
        </div>
    );
}

export default function CertModal({
    type,
    onClose,
    memberChallengeId,
    onSuccess,
}) {
    const dispatch = useDispatch();
    const { isLoggedIn } = useSelector((state) => state.user);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !isLoggedIn) {
            api.get('/member/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    dispatch(login({ token }));
                    dispatch(
                        updateProfile({
                            name: res.data.data.nickname,
                            email: res.data.data.email,
                            nickname: res.data.data.nickname,
                            avatar: res.data.data.imageUrl,
                            memberId: res.data.data.memberId,
                        })
                    );
                    dispatch(fetchPointInfo());
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('memberId');
                });
        }
    }, [dispatch, isLoggedIn]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [ocrResult, setOcrResult] = useState('');
    const [ocrProgress, setOcrProgress] = useState(0);

    const [modal, setModal] = useState({
        isVisible: false,
        message: '',
        type: 'info',
    });

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

    const isHydrogenCar = type.carType === 'H';

    function showModal(message, modalType = 'info') {
        setModal({
            isVisible: true,
            message: message,
            type: modalType,
        });
    }

    async function processImageWithOCR(file) {
        setIsProcessing(true);
        setOcrProgress(0);

        try {
            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result);
            reader.readAsDataURL(file);

            const result = await Tesseract.recognize(file, 'kor+eng', {
                logger: (m) => {
                    if (
                        m.status === 'recognizing text' ||
                        m.status === 'preprocessing'
                    ) {
                        const progressValue = Math.round(m.progress * 100);

                        if (progressValue < 99) {
                            setOcrProgress(progressValue);
                        }
                    }
                },
                workerPath:
                    'https://unpkg.com/tesseract.js@v4.0.1/dist/worker.min.js',
                langPath: 'https://tessdata.projectnaptha.com/4.0.0',
                corePath:
                    'https://unpkg.com/tesseract.js-core@v4.0.1/tesseract-core.wasm.js',
            });

            setOcrProgress(100);

            await new Promise((resolve) => setTimeout(resolve, 300));

            setOcrProgress(0);

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

            if (type.id === 'z') {
                const hasRecycleKeyword = type.recycleKeywords.some((keyword) =>
                    text.toLowerCase().includes(keyword.toLowerCase())
                );
                const hasZeroKeyword = type.zeroKeywords.some((keyword) =>
                    text.toLowerCase().includes(keyword.toLowerCase())
                );

                if (hasRecycleKeyword) {
                    setDetectedCategory('recycle');
                    showModal('재활용센터로 인식되었습니다', 'info-success');
                } else if (hasZeroKeyword) {
                    setDetectedCategory('zero');
                    showModal('제로웨이스트로 인식되었습니다', 'info-success');
                } else {
                    showModal(
                        '키워드를 인식하지 못했습니다. 영수증을 다시 확인해주세요.',
                        'error'
                    );
                }
            } else {
                const hasKeyword = type.keywords.some((keyword) =>
                    text.toLowerCase().includes(keyword.toLowerCase())
                );

                if (hasKeyword) {
                    showModal(
                        '인식 완료! 값을 확인 후 인증 요청을 눌러주세요',
                        'info-success'
                    );
                } else {
                    showModal(
                        '키워드를 인식하지 못했습니다. 영수증을 다시 확인해주세요.',
                        'error'
                    );
                }
            }
        } catch (error) {
            console.error('OCR 오류:', error);
            showModal(
                '이미지 인식에 실패했습니다. 다시 시도해주세요.',
                'error'
            );
            setOcrProgress(0);
        } finally {
            setIsProcessing(false);
        }
    }

    function handleFileSelect(e) {
        if (!isLoggedIn) {
            showModal('로그인 후 이용 가능합니다.', 'error');
            e.target.value = '';
            return;
        }

        const file = e.target.files[0];
        if (file) processImageWithOCR(file);
    }

    const isButtonDisabled = () => {
        if (!type || !type.id) {
            return true;
        }

        if (isSubmitting || isProcessing || !isLoggedIn || !ocrResult) {
            return true;
        }

        if (type.id === 'bike') {
            const disabled =
                extractedDistance <= 0 ||
                !extraData.bike_number ||
                !extraData.startTime ||
                !extraData.endTime;
            return disabled;
        }

        if (type.id === 'ev') {
            const disabled =
                (extractedCharge <= 0 && extractedPrice <= 0) ||
                !extraData.startTime ||
                !extraData.endTime;
            return disabled;
        }

        if (type.id === 'z') {
            const disabled =
                extractedPrice <= 0 || !extraData.name || !extraData.approveNum;
            return disabled;
        }

        return false;
    };

    const handleCertification = async () => {
        if (!isLoggedIn) {
            showModal('로그인 후 이용 가능합니다.', 'error');
            return;
        }

        let missingData = [];
        if (type.id === 'bike') {
            if (extractedDistance <= 0) missingData.push('이동 거리');
            if (!extraData.bike_number) missingData.push('자전거 번호');
            if (!extraData.startTime) missingData.push('시작 시간');
            if (!extraData.endTime) missingData.push('종료 시간');
        } else if (type.id === 'ev') {
            if (extractedCharge <= 0 && extractedPrice <= 0) {
                missingData.push('충전량 또는 금액');
            }
            if (!extraData.startTime) missingData.push('시작 시간');
            if (!extraData.endTime) missingData.push('종료 시간');
        } else if (type.id === 'z') {
            if (extractedPrice <= 0) missingData.push('금액');
            if (!extraData.name) missingData.push('상점명');
            if (!extraData.approveNum) missingData.push('승인번호');
        }

        if (missingData.length > 0) {
            showModal(
                `인증에 필요한 정보를 인식하지 못했습니다.\n\n필요한 정보: ${missingData.join(
                    ', '
                )}\n\n더 선명한 이미지로 다시 시도해주세요.`,
                'error'
            );
            return;
        }

        setIsSubmitting(true);

        try {
            let result;
            if (type.id === 'bike') {
                const body = {
                    bike_number: parseInt(extraData.bike_number) || 0,
                    distance: Math.round(extractedDistance * 100) / 100,
                    start_time: extraData.startTime,
                    end_time: extraData.endTime,
                    ...(memberChallengeId && { memberChallengeId }),
                };
                result = await verifyBike(body);
            } else if (type.id === 'ev') {
                let finalChargeAmount = 0;
                let finalChargeFee = 0;

                if (extractedCharge > 0) {
                    finalChargeAmount = Math.round(extractedCharge * 100) / 100;
                    finalChargeFee = 0;
                } else if (extractedPrice > 0) {
                    finalChargeAmount = 0;
                    finalChargeFee = extractedPrice;
                }

                const carBody = {
                    chargeAmount: finalChargeAmount,
                    chargeFee: finalChargeFee,
                    start_time: extraData.startTime,
                    end_time: extraData.endTime,
                    ...(memberChallengeId && { memberChallengeId }),
                };

                if (isHydrogenCar) {
                    result = await verifyHCar(carBody);
                } else {
                    result = await verifyEVCar(carBody);
                }
            } else if (type.id === 'z') {
                const finalCategory = detectedCategory || 'zero';
                const body = {
                    category: finalCategory,
                    name: extraData.name,
                    price: extractedPrice,
                    approveNum: parseInt(extraData.approveNum) || 0,
                    ...(memberChallengeId && { memberChallengeId }),
                };
                result = await verifyShop(body);
            }
            if (result.success) {
                const carbonAmount =
                    result.data.carbon_save || result.data.carbonSave || 0;

                const successMessage = `인증 성공! ${result.message}\n\n획득 포인트: ${result.data.point}P\n탄소 감소량: ${carbonAmount}kg`;

                showModal(successMessage, 'success');
            } else {
                let userMessage = result.message || '인증에 실패했습니다.';
                if (
                    userMessage.includes('중복') ||
                    userMessage.includes('이미')
                ) {
                    userMessage =
                        '이미 인증된 내역입니다. 다른 영수증으로 시도해주세요.';
                }
                showModal(`인증에 실패했습니다: ${userMessage}`, 'error');
            }
        } catch (error) {
            let errorMessage = '인증 처리 중 오류가 발생했습니다.';
            if (error.message?.includes('중복')) {
                errorMessage = '이미 인증된 내역입니다.';
            }
            showModal(`${errorMessage}.\n\n다시 시도해주세요.`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto'>
            <div
                className='rounded-2xl max-w-md w-full my-8 flex flex-col shadow-2xl overflow-hidden bg-clip-padding'
                style={{
                    backgroundColor: 'transparent',
                    maxHeight: '85vh',
                }}
            >
                {/* 상단 헤더 */}
                <div
                    className={`bg-gradient-to-br ${type.color} p-6 rounded-t-2xl relative flex-shrink-0`}
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

                {/* 내부 내용 */}
                <div className='bg-white flex flex-col flex-1 overflow-hidden'>
                    <div
                        className='overflow-y-auto p-6 space-y-4 flex-1'
                        style={{
                            overscrollBehavior: 'contain',
                        }}
                    >
                        {/* 파일 업로드 */}
                        <label
                            className={`block w-full rounded-xl p-6 text-center cursor-pointer transition-all flex-shrink-0
                            ${
                                isProcessing
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-white border-2 border-green-500 hover:bg-green-50'
                            }`}
                        >
                            <Upload className='w-12 h-12 mx-auto mb-3 text-green-500' />
                            <div className='text-green-600 font-semibold'>
                                {isProcessing ? (
                                    <div className='w-full'>
                                        <div className='text-sm text-gray-700 mb-1 flex justify-between'>
                                            <span>OCR 분석 중...</span>
                                            <span className='font-bold text-green-600'>
                                                {ocrProgress}%
                                            </span>
                                        </div>
                                        <div className='w-full bg-gray-200 rounded-full h-2.5'>
                                            <div
                                                className='bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-out'
                                                style={{
                                                    width: `${ocrProgress}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : isLoggedIn ? (
                                    '📷 사진 선택하기'
                                ) : (
                                    ' '
                                )}
                            </div>

                            {isLoggedIn && !isProcessing && (
                                <div className='text-gray-500 text-sm mt-1'>
                                    영수증이나 이용내역을 촬영해주세요
                                </div>
                            )}
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleFileSelect}
                                disabled={isProcessing || !isLoggedIn}
                                className='hidden'
                            />
                        </label>

                        {/* 이미지 미리보기 */}
                        {previewImage && (
                            <div className='rounded-xl overflow-hidden border-2 border-gray-200'>
                                <img
                                    src={previewImage}
                                    alt='미리보기'
                                    className='w-full max-h-64 object-contain bg-gray-50'
                                />
                            </div>
                        )}

                        {/* OCR 결과 */}
                        {ocrResult && (
                            <div className='space-y-3'>
                                {(extractedPrice > 0 ||
                                    extractedCharge > 0 ||
                                    extractedDistance > 0) && (
                                    <div className='bg-green-50 rounded-xl p-4 border-2 border-green-200'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-green-800 font-semibold'>
                                                {type.id === 'bike'
                                                    ? '🚴 추출된 거리'
                                                    : type.id === 'ev'
                                                    ? '⚡ 충전량 / 💰 금액'
                                                    : '💰 추출된 금액'}
                                            </span>
                                            <span className='text-xl font-bold text-green-600'>
                                                {type.id === 'bike'
                                                    ? `${extractedDistance.toFixed(
                                                          2
                                                      )}km`
                                                    : `${extractedPrice.toLocaleString()}원`}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {type.id === 'bike' &&
                                    extractedDistance <= 0 && (
                                        <div className='bg-orange-50 rounded-xl p-4 border-2 border-orange-200'>
                                            <p className='text-orange-800 text-sm font-medium'>
                                                ⚠️ 거리 정보를 인식하지
                                                못했습니다. 더 선명한 이미지로
                                                다시 시도해주세요.
                                            </p>
                                        </div>
                                    )}

                                <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
                                    <div className='flex items-center gap-2 mb-2'>
                                        <CheckCircle className='w-5 h-5 text-[#4CAF50]' />
                                        <p className='font-semibold text-gray-900'>
                                            인식된 텍스트
                                        </p>
                                    </div>
                                    <div className='bg-white rounded-lg p-3 max-h-20 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap'>
                                        {ocrResult}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 하단 버튼 */}
                    <div className='p-6 pt-4 border-t border-gray-200 flex-shrink-0 rounded-b-2xl bg-white'>
                        <button
                            onClick={handleCertification}
                            disabled={isButtonDisabled()}
                            className={`w-full py-4 rounded-xl font-bold transition-all
                            ${
                                isButtonDisabled()
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] text-white hover:from-[#66BB6A] hover:to-[#8BC34A] shadow-lg'
                            }`}
                        >
                            {!isLoggedIn
                                ? '로그인 후 이용하세요'
                                : isSubmitting
                                ? '인증 처리 중...'
                                : isProcessing
                                ? 'OCR 분석 중...'
                                : !ocrResult
                                ? '사진을 선택해주세요'
                                : '인증 요청하기'}
                        </button>
                    </div>
                </div>
            </div>

            {modal.isVisible && (
                <Modal
                    message={modal.message}
                    type={modal.type}
                    onClose={() => setModal({ ...modal, isVisible: false })}
                    onSuccess={() => {
                        if (onSuccess) {
                            onSuccess();
                        }
                        onClose();
                    }}
                />
            )}
        </div>
    );
}
