import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addCertification, addPendingCert } from '../../store/slices/certSlice';
import { addPoints } from '../../store/slices/pointSlice';
import Tesseract from 'tesseract.js';
import {
    Receipt,
    Battery,
    Recycle,
    Bike,
    ChevronRight,
    X,
    Upload,
    CheckCircle,
} from 'lucide-react';

// =================================================================
// ⚙️ 1. 거리 추출 함수 (따릉이용)
// =================================================================
function extractDistance(text) {
    const normalizedText = text.replace(/\s{2,}/g, ' ');

    const patterns = [
        // 기본 패턴들
        /거\s*리\s*[:/\s]*([0-9]+\.[0-9]{1,4})\s*km/i,
        /이\s*동\s*거\s*리\s*[:/\s]*([0-9]+\.[0-9]{1,4})/i,
        /([0-9]+\.[0-9]{1,4})\s*km/i,
        // km이 깨진 경우 (ㅁ, ㅠ, m, 미터 등)
        /거\s*리\s*[:/\s]*([0-9]+\.[0-9]{1,4})\s*[ㅁㅠkm미터]/i,
        /이\s*동\s*거\s*리\s*[:/\s]*([0-9]+\.[0-9]{1,4})\s*[ㅁㅠkm미터]/i,
        /([0-9]+\.[0-9]{1,4})\s*[ㅁㅠ]/i,
    ];

    let maxDistance = 0;

    for (const pattern of patterns) {
        const match = normalizedText.match(pattern);

        if (match) {
            const numStr = match[1];
            const num = parseFloat(numStr);

            if (!isNaN(num) && num > 0) {
                if (num > maxDistance) {
                    maxDistance = num;
                }
            }
        }
    }

    return maxDistance;
}

// =================================================================
// ⚙️ 2. 충전량 및 금액을 동시에 추출하여 객체로 반환하는 함수
// =================================================================
function extractAmounts(text) {
    const flatText = text.replace(/\s/g, '');
    const searchTexts = [text, flatText];

    let maxCharge = 0; // 충전량 (소수점)
    let maxPrice = 0; // 금액 (정수)

    // --- A. 충전량 (kWh) 추출 ---
    const chargePatterns = [
        // 1. 충전량/용량 키워드 뒤의 소수점 숫자
        /충\s*전\s*량?[:\s(빠)]*([0-9]+\.[0-9]{1,4})/i,
        /용\s*량[:\s]*([0-9]+\.[0-9]{1,4})/i,
        // 2. kWh, kW, kwh, KWH, 공, ㅐwh 등 오인식 패턴 앞의 소수점 숫자
        /([0-9]+\.[0-9]{1,4})\s*k[w\s]?[h\s공ㅐ]{1,3}/i,
        // 3. 공백이 제거된 텍스트용 패턴
        /충전량[:\s( 빠)]*([0-9]+\.[0-9]{1,4})/i,
        /([0-9]+\.[0-9]{1,4})kwh/i,
    ];

    for (const searchText of searchTexts) {
        for (const pattern of chargePatterns) {
            const match = searchText.match(pattern);
            if (match) {
                const num = parseFloat(match[1]);
                if (!isNaN(num) && num > maxCharge) {
                    maxCharge = num;
                }
            }
        }
    }

    // --- B. 금액 (원) 추출 ---
    const pricePatterns = [
        /결\s*제\s*금\s*액[:\s(원)]*([0-9,]+)/i,
        /합\s*계[:\s(원)]*([0-9,]+)/i,
        /총\s*금\s*액[:\s(원)]*([0-9,]+)/i,
        /충\s*전\s*금\s*액[:\s(원)]*([0-9,]+)/i,
        // 공백 제거된 텍스트 패턴
        /결제금액[:\s(원)]*([0-9,]+)/i,
        /합계[:\s(원)]*([0-9,]+)/i,
        /총금액[:\s(원)]*([0-9,]+)/i,
        /충전금액[:\s(원)]*([0-9,]+)/i,
    ];

    for (const searchText of searchTexts) {
        for (const pattern of pricePatterns) {
            const match = searchText.match(pattern);
            if (match) {
                const numStr = match[1].replace(/,/g, '');
                const num = parseInt(numStr);
                if (!isNaN(num) && num > maxPrice) {
                    maxPrice = num;
                }
            }
        }
    }

    // 최종 결과 반환
    return { charge: maxCharge, price: maxPrice };
}

// =================================================================
// ⚙️ 3. API 요청에 필요한 추가 데이터 (번호, 시간, 이름) 추출 함수
// =================================================================
function extractApiData(text) {
    const flatText = text.replace(/\s/g, '');

    // 주문,승인,거래 번호 추출 개선
    const approveMatch =
        text.match(/주\s*문\s*번\s*호[:\s#]*(\d+)/i) ||
        text.match(/승인\s*번\s*호?[:\s]*(\d{8,16})/i) ||
        text.match(/거래\s*번\s*호?[:\s]*(\d{8,16})/i);

    // 자전거 번호 추출 개선
    const bikeNumMatch =
        // "0 508-00063783 ( 자 전 거 번호)" 형식 - 자전거번호 앞의 숫자-숫자 패턴
        text.match(/(\d[-\s]?\d{3}[-\s]?\d{8,})\s*\([^)]*자\s*전\s*거/i) ||
        flatText.match(/(\d[-]?\d{3}[-]?\d{8,})\([^)]*자전거/i) ||
        // "SPA-00063783" 형식 (알파벳 3자리 + 하이픈 + 숫자)
        text.match(/([A-Z]{3}[-\s]?\d{8,})/i) ||
        // 공백 제거한 텍스트에서 검색
        flatText.match(/([A-Z]{3}[-]?\d{8,})/i) ||
        // "자전거번호" 뒤의 숫자
        text.match(/자\s*전\s*거\s*번\s*호?[:\s]*(\d{5,})/i) ||
        flatText.match(/자전거번호[:\s]*(\d{5,})/i) ||
        // "D-" 형식 (기존)
        flatText.match(/D-\s*?(\d{5,})/i);

    // 💡 시간 추출 로직: HH:MM 형태를 찾습니다.
    const timeMatches = text.match(/(\d{1,2}:\d{2})/g) || [];

    const nameMatch = text.match(/[가-힣a-zA-Z]{2,}\s*(주|센터|점|소)/);

    return {
        approveNum: approveMatch ? approveMatch[1] : '',
        bike_number: bikeNumMatch
            ? bikeNumMatch[1].replace(/[A-Z\s-]/gi, '').slice(-5)
            : '', // 알파벳/공백/하이픈 제거 후 뒤 5자리
        startTime: timeMatches[0] || '', // 첫 번째 시간
        endTime: timeMatches[1] || '', // 두 번째 시간
        name: nameMatch ? nameMatch[0].trim() : '미확인 상호',
    };
}

// =================================================================
// 🌟 4. 메인 컴포넌트
// =================================================================
export default function CertificationScreen() {
    const isOnline = useSelector((s) => s.app.isOnline);
    const dispatch = useDispatch();

    const [selectedType, setSelectedType] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [ocrResult, setOcrResult] = useState('');
    const [showModal, setShowModal] = useState(false);

    // 💡 추출된 값 상태 분리
    const [extractedPrice, setExtractedPrice] = useState(0); // 금액 (Z카테고리 및 EV chargeFee 사용)
    const [extractedCharge, setExtractedCharge] = useState(0); // 충전량 (EV chargeAmount 사용)
    const [extractedDistance, setExtractedDistance] = useState(0);
    const [detectedCategory, setDetectedCategory] = useState('');
    const [extraData, setExtraData] = useState({
        approveNum: '',
        bike_number: '',
        startTime: '',
        endTime: '',
        name: '',
    });

    const types = [
        {
            id: 'z',
            label: '제로웨이스트 스토어 / 재활용센터 영수증',
            icon: '🛍️',
            description: '영수증 + GPS 위치 인증',
            points: 25,
            color: 'from-[#8BC34A] to-[#7cb342]',
            iconComponent: Receipt,
            Recycle,
            // 제로웨이스트 키워드
            zeroKeywords: [
                '다회용',
                '리필',
                '제로',
                '제 로 웨 이 스 트',
                '제로웨이스트',
            ],
            // 재활용 키워드
            recycleKeywords: [
                '재활용',
                '고물상',
                '분리수거',
                '폐기물',
                '폐 기 물',
                '재 활 용',
                '고철',
                '폐지',
            ],
            keywords: [
                '다회용',
                '리필',
                '제로',
                '제 로 웨 이 스 트',
                '재활용',
                '고물상',
                '분리수거',
                '폐기물',
                '폐 기 물',
                '재 활 용',
            ],
        },
        {
            id: 'ev',
            label: '전기차/수소차 충전 영수증',
            icon: '⚡',
            description: '충전량 기반 포인트 적립',
            points: 50,
            color: 'from-[#2196F3] to-[#1976D2]',
            iconComponent: Battery,
            keywords: [
                '전기',
                '충전',
                'kWh',
                'EV',
                '수소',
                '환경',
                '환 경',
                '충 전 량',
            ],
        },
        {
            id: 'bike',
            label: '따릉이 이용 인증',
            icon: '🚴',
            description: '이용내역 스크린샷 인증',
            points: 20,
            color: 'from-[#4CAF50] to-[#8BC34A]',
            iconComponent: Bike,
            keywords: ['따릉이', '자전거', '대여', '반납', '따 릉 이'],
        },
    ];

    // OCR 실행 및 데이터 추출
    async function processImageWithOCR(file, type) {
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
                // 💡 extractAmounts 호출 및 결과 분리 저장
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
        if (file && selectedType) {
            processImageWithOCR(file, selectedType);
        }
    }

    // ==========================================================
    // ⭐ API 전송 대신 JSON 데이터를 보여주는 로직 (최종 수정됨)
    // ==========================================================
    const handleCertification = async () => {
        let isValid = false;

        if (selectedType.id === 'bike') {
            isValid = extractedDistance > 0;
        } else if (selectedType.id === 'ev') {
            // EV는 충전량 > 0 이거나 금액 > 0 이면 유효
            isValid = extractedCharge > 0 || extractedPrice > 0;
        } else {
            // Z는 금액 > 0 이면 유효
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
        const categoryId = selectedType.id;

        // 1. 카테고리별 Body 데이터 매핑
        try {
            if (categoryId === 'bike') {
                body = {
                    category: 'bike',
                    bike_number: parseInt(extraData.bike_number) || 0,
                    distance: Math.round(extractedDistance * 100) / 100,
                    start_time: extraData.startTime,
                    end_time: extraData.endTime,
                };
            } else if (categoryId === 'ev') {
                let finalChargeAmount = 0.0;
                let finalChargeFee = 0;

                // 💡 로직 적용: 충전량 우선
                if (extractedCharge > 0) {
                    // 1. 충전량 인식 성공 (금액 인식 여부와 무관하게 충전량만 사용)
                    finalChargeAmount = extractedCharge;
                    finalChargeFee = 0; // 금액은 무시하고 0으로 설정
                } else if (extractedPrice > 0) {
                    // 2. 충전량 인식 실패, 금액만 인식 성공
                    finalChargeAmount = 0.0; // 충전량은 0으로 설정
                    finalChargeFee = extractedPrice;
                } else {
                    // 이 경로는 isValid에서 이미 걸러지지만 안전을 위해 추가
                    throw new Error(
                        'EV 인증에 유효한 값(충전량/금액)이 없습니다.'
                    );
                }

                body = {
                    category: 'car',
                    chargeAmount: finalChargeAmount, // 충전량 (kWh, 소수점)
                    chargeFee: finalChargeFee, // 결제 금액 (원, 정수)
                    start_time: extraData.startTime,
                    end_time: extraData.endTime,
                };
            } else if (categoryId === 'z') {
                // Z 카테고리는 금액만 price 필드로 전송
                const finalCategory = detectedCategory || 'zero';
                body = {
                    category: finalCategory,
                    name: extraData.name,
                    price: extractedPrice,
                    approveNum: parseInt(extraData.approveNum) || 0,
                };
            } else {
                throw new Error('유효하지 않은 인증 카테고리입니다.');
            }
            // -----------------------------------------------------
            // ⭐ 실제 API 호출 보류하고 JSON을 보여주는 코드로 대체
            // -----------------------------------------------------
            const jsonBody = JSON.stringify(body, null, 2);

            const header = {
                memberId: 'USER_A001 (임시)',
                authorization: 'Bearer [YOUR_AUTH_TOKEN] (임시)',
            };

            console.log('--- API Request Header ---', header);
            console.log('--- API Request Body ---', jsonBody);

            alert(`✅ API 전송 내용 준비 완료!\n\n[Body - JSON]\n${jsonBody}`);

            // 전송 완료 후 상태 초기화 (실제 전송 성공으로 가정)
            closeModal();
        } catch (error) {
            console.error('데이터 매핑 중 오류 발생:', error);
            alert(`❌ 데이터 매핑 오류: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    function openCertModal(type) {
        setSelectedType(type);
        setShowModal(true);
        resetModal();
    }

    function resetModal() {
        setPreviewImage(null);
        setOcrResult('');
        setExtractedPrice(0);
        setExtractedCharge(0);
        setExtractedDistance(0);
        setDetectedCategory('');
        setExtraData({
            approveNum: '',
            bike_number: '',
            startTime: '',
            endTime: '',
            name: '',
        });
    }

    function closeModal() {
        setShowModal(false);
        setSelectedType(null);
        resetModal();
    }

    const recentCertifications = [
        {
            id: 1,
            type: '전기차 충전',
            date: '2024-10-23',
            points: 50,
            status: 'approved',
        },
        {
            id: 2,
            type: '재활용',
            date: '2024-10-22',
            points: 30,
            status: 'approved',
        },
        {
            id: 3,
            type: '제로웨이스트',
            date: '2024-10-21',
            points: 25,
            status: 'pending',
        },
    ];

    return (
        <>
            <div className='min-h-screen bg-gray-50 pb-24'>
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
                    <div>
                        <h2 className='text-lg font-bold text-gray-900 mb-4'>
                            인증할 활동 선택
                        </h2>
                        <div className='space-y-3'>
                            {types.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => openCertModal(type)}
                                    className='w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100'
                                >
                                    <div className='flex items-center gap-4'>
                                        <div
                                            className={`bg-gradient-to-br ${type.color} rounded-2xl p-4 shadow-md`}
                                        >
                                            <div className='text-3xl'>
                                                {type.icon}
                                            </div>
                                        </div>

                                        <div className='flex-1 text-left'>
                                            <h3 className='font-semibold text-gray-900 mb-1'>
                                                {type.label}
                                            </h3>
                                            <p className='text-gray-600 text-sm mb-1'>
                                                {type.description}
                                            </p>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-[#4CAF50] font-semibold'>
                                                    {type.points}P
                                                </span>
                                                <span className='text-gray-400'>
                                                    •
                                                </span>
                                                <span className='text-gray-500 text-sm'>
                                                    인증당
                                                </span>
                                            </div>
                                        </div>

                                        <ChevronRight className='w-6 h-6 text-gray-400' />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

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
                                    자동 인증을 위해 위치 서비스를
                                    활성화해주세요
                                </span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='text-[#4CAF50] mt-0.5'>✓</span>
                                <span>인증은 바로 승인됩니다</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className='text-lg font-bold text-gray-900 mb-4'>
                            최근 인증 내역
                        </h2>
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
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs mt-1 font-medium ${
                                                cert.status === 'approved'
                                                    ? 'bg-[#4CAF50] bg-opacity-10 text-[#4CAF50]'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                        >
                                            {cert.status === 'approved'
                                                ? '승인됨'
                                                : '대기중'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] rounded-2xl p-6 text-white shadow-lg'>
                        <h3 className='text-white text-opacity-90 mb-4 font-semibold'>
                            이번 달 진행상황
                        </h3>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <p className='text-white text-opacity-80 text-sm mb-1'>
                                    인증 횟수
                                </p>
                                <p className='text-3xl font-bold'>12</p>
                            </div>
                            <div>
                                <p className='text-white text-opacity-80 text-sm mb-1'>
                                    획득 포인트
                                </p>
                                <p className='text-3xl font-bold'>520P</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OCR 모달 */}
            {showModal && selectedType && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
                        {/* 모달 헤더 */}
                        <div
                            className={`bg-gradient-to-br ${selectedType.color} p-6 rounded-t-3xl relative`}
                        >
                            <button
                                onClick={closeModal}
                                disabled={isProcessing}
                                className='absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition'
                            >
                                <X className='w-6 h-6' />
                            </button>
                            <div className='text-5xl mb-3'>
                                {selectedType.icon}
                            </div>
                            <h3 className='text-2xl font-bold text-white mb-1'>
                                {selectedType.label}
                            </h3>
                            <p className='text-white text-opacity-90 text-sm'>
                                {selectedType.description}
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
                                    {isProcessing
                                        ? '분석 중...'
                                        : '📷 사진 선택하기'}
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
                                    {/* 감지된 카테고리 표시 (제로웨이스트/재활용만) */}
                                    {selectedType.id === 'z' &&
                                        detectedCategory && (
                                            <div className='bg-purple-50 rounded-2xl p-4 border-2 border-purple-200'>
                                                <div className='flex items-center justify-between'>
                                                    <span className='text-purple-800 font-semibold'>
                                                        🏷️ 감지된 카테고리
                                                    </span>
                                                    <span className='text-xl font-bold text-purple-600'>
                                                        {detectedCategory ===
                                                        'recycle'
                                                            ? '재활용센터'
                                                            : '제로웨이스트'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                    {/* 추출 값 표시 (수정됨) */}
                                    {(extractedPrice > 0 ||
                                        extractedCharge > 0 ||
                                        extractedDistance > 0) && (
                                        <div className='bg-green-50 rounded-2xl p-4 border-2 border-green-200'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-green-800 font-semibold'>
                                                    {selectedType.id === 'bike'
                                                        ? '🚴 추출된 거리'
                                                        : selectedType.id ===
                                                          'ev'
                                                        ? extractedCharge > 0 &&
                                                          extractedPrice > 0
                                                            ? '⚡ 충전량 / 💰 금액'
                                                            : extractedCharge >
                                                              0
                                                            ? '⚡ 충전량'
                                                            : '💰 금액'
                                                        : '💰 추출된 금액'}
                                                </span>
                                                <span className='text-xl font-bold text-green-600 flex flex-col items-end'>
                                                    {selectedType.id ===
                                                    'bike' ? (
                                                        `${extractedDistance.toFixed(
                                                            2
                                                        )}km`
                                                    ) : selectedType.id ===
                                                      'ev' ? (
                                                        <>
                                                            {extractedCharge >
                                                                0 && (
                                                                <span className='text-2xl font-bold'>
                                                                    {extractedCharge.toFixed(
                                                                        2
                                                                    )}
                                                                    kWh
                                                                </span>
                                                            )}
                                                            {extractedPrice >
                                                                0 && (
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
                                                            {extractedCharge <=
                                                                0 &&
                                                                extractedPrice <=
                                                                    0 &&
                                                                '값 없음'}
                                                        </>
                                                    ) : (
                                                        `${extractedPrice.toLocaleString()}원`
                                                    )}
                                                </span>
                                            </div>
                                            {/* 💡 EV 시간 표시 (추출된 경우에만) */}
                                            {selectedType.id === 'ev' &&
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
                                            {/* 💡 Bike 시간 표시 (추출된 경우에만) */}
                                            {selectedType.id === 'bike' &&
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
                                    (selectedType?.id === 'bike' &&
                                        extractedDistance <= 0) ||
                                    (selectedType?.id !== 'bike' &&
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
                                    💡 <strong>예상 포인트:</strong>{' '}
                                    {selectedType.points}P
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
