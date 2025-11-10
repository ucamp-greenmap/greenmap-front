import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Gift,
    Wallet,
    Search,
    ChevronDown,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

// 데이터 import
import { CATEGORIES, SORT_OPTIONS } from './PointExchangeScreen.data';

// Redux hooks import
import {
    usePointShop,
    useSpendPoint,
    useUsedPointLogs,
} from '../../hooks/usePointApi';
import {
    fetchPointShop,
    fetchUsedPointLogs,
} from '../../store/slices/pointSlice';
import { convertVoucherToGifticon, formatDate } from '../../util/pointApi';

export default function PointExchangeScreen({ onNavigate }) {
    const dispatch = useDispatch();

    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState(false);

    // Redux로 포인트샵 데이터 가져오기
    const { data: shopData, loading: isLoading, error } = usePointShop();
    const { spendPoint, loading: isSpending } = useSpendPoint();
    const { usedLogs, loading: isLoadingLogs } = useUsedPointLogs(true); // 자동 로드

    const [activeTab, setActiveTab] = useState('gifticon'); // gifticon or transfer
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('popular');
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // 모달 상태
    const [selectedGifticon, setSelectedGifticon] = useState(null);
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // 포인트전환 상태
    const [transferAmount, setTransferAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [savedAccounts, setSavedAccounts] = useState([]);

    const handleGifticonConfirm = () => {
        // 구매 확인 모달 닫고 → 전화번호 입력 모달로 이동
        setShowConfirmModal(false);
        setShowPhoneModal(true);
    };

    const handlePhoneSubmit = async () => {
        if (!phoneNumber.trim()) {
            setPhoneError(true);
            return;
        }
        setPhoneError(false);
        setShowPhoneModal(false);

        try {
            await spendPoint({
                point: selectedGifticon.voucherId, // voucher_id 전달
                type: 'VOUCHER',
            });
            setShowSuccessModal(true);
            dispatch(fetchPointShop());
            dispatch(fetchUsedPointLogs());
        } catch (error) {
            console.error('포인트 사용 실패:', error);
            alert(
                '구매에 실패했습니다: ' + (error.message || '알 수 없는 오류')
            );
        }
    };

    // 컴포넌트 마운트 시 포인트샵 데이터 가져오기
    useEffect(() => {
        dispatch(fetchPointShop());
        dispatch(fetchUsedPointLogs()); // 사용 내역도 가져오기
    }, [dispatch]);

    // 저장된 계좌 불러오기 (localStorage)
    useEffect(() => {
        const saved = localStorage.getItem('savedAccounts');
        if (saved) {
            try {
                setSavedAccounts(JSON.parse(saved));
            } catch (error) {
                console.error('Failed to load saved accounts:', error);
            }
        }
    }, []);

    // 포인트와 기프티콘 목록 추출
    const currentPoints = shopData?.point || 0;
    const gifticons = useMemo(() => {
        return shopData?.voucherList?.map(convertVoucherToGifticon) || [];
    }, [shopData]);

    // 필터링 및 정렬된 기프티콘 목록
    const filteredGifticons = useMemo(() => {
        let result = gifticons;

        console.log('기프티콘들: ', result);

        // 카테고리 필터
        if (selectedCategory !== '전체') {
            result = result.filter((g) => g.category === selectedCategory);
        }

        // 검색 필터 (제품명 또는 브랜드명)
        if (searchQuery) {
            result = result.filter(
                (g) =>
                    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    g.brand.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 정렬
        result = [...result].sort((a, b) => {
            if (sortBy === 'popular') {
                return b.popular - a.popular;
            } else if (sortBy === 'low') {
                return a.price - b.price;
            } else if (sortBy === 'high') {
                return b.price - a.price;
            }
            return 0;
        });

        return result;
    }, [gifticons, selectedCategory, searchQuery, sortBy]);

    // 기프티콘 구매 확인
    const handleGifticonPurchase = (gifticon) => {
        setSelectedGifticon(gifticon);
        setSelectedAmount(gifticon.price);
        setShowConfirmModal(true);
    };

    // 구매 확정
    const confirmPurchase = async () => {
        setShowConfirmModal(false);
        try {
            // VOUCHER 타입일 때는 voucher_id를 전달
            await spendPoint({
                point: selectedGifticon.voucherId, // voucher_id 전달
                type: 'VOUCHER',
            });
            setShowSuccessModal(true);
            // 성공 후 데이터 새로고침
            dispatch(fetchPointShop());
            dispatch(fetchUsedPointLogs());
        } catch (error) {
            console.error('포인트 사용 실패:', error);
            alert(
                '구매에 실패했습니다: ' + (error.message || '알 수 없는 오류')
            );
        }
    };

    // 포인트전환 신청
    const handleTransferSubmit = async () => {
        setShowTransferModal(false);
        try {
            // 입력한 금액에 수수료 5%를 포함한 포인트 차감
            const requestedAmount = parseInt(transferAmount);
            const pointsToDeduct = Math.ceil(requestedAmount * 1.05);

            await spendPoint({
                point: pointsToDeduct,
                type: 'CASH',
            });
            setShowSuccessModal(true);

            // 계좌 정보 저장 (localStorage)
            const newAccount = { bankName, accountNumber, accountHolder };
            const updated = [
                newAccount,
                ...savedAccounts.filter(
                    (acc) => acc.accountNumber !== accountNumber
                ),
            ].slice(0, 3);
            setSavedAccounts(updated);
            localStorage.setItem('savedAccounts', JSON.stringify(updated));

            // 성공 후 데이터 새로고침
            dispatch(fetchPointShop());
            dispatch(fetchUsedPointLogs());
        } catch (error) {
            console.error('포인트전환 실패:', error);
            alert(
                '포인트전환 신청에 실패했습니다: ' +
                    (error.message || '알 수 없는 오류')
            );
        }
    };

    // 저장된 계좌 불러오기
    const loadSavedAccount = (account) => {
        setBankName(account.bankName);
        setAccountNumber(account.accountNumber);
        setAccountHolder(account.accountHolder);
    };

    return (
        <div className='min-h-screen bg-gray-50 pb-20'>
            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-white shadow-sm sticky top-0 z-30'
            >
                <div className='flex items-center p-4'>
                    <button
                        onClick={() => window.history.back()}
                        className='mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors'
                        aria-label='뒤로가기'
                    >
                        <ArrowLeft className='w-5 h-5' />
                    </button>
                    <h1 className='text-xl font-bold'>포인트 교환소</h1>
                </div>
            </motion.div>

            {/* 보유 포인트 카드 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className='m-4 bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] rounded-3xl p-6 text-white shadow-lg'
            >
                <div className='flex items-center justify-between'>
                    <div>
                        <div className='text-sm opacity-90 mb-1'>
                            보유 포인트
                        </div>
                        <div className='text-3xl font-bold'>
                            {currentPoints.toLocaleString()}P
                        </div>
                    </div>
                    <div className='bg-white bg-opacity-20 p-3 rounded-2xl'>
                        <Wallet className='w-8 h-8' />
                    </div>
                </div>
            </motion.div>

            {/* 탭 */}
            <div className='mx-4 mb-4 bg-white rounded-2xl p-1 shadow-sm flex gap-1'>
                <button
                    onClick={() => setActiveTab('gifticon')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        activeTab === 'gifticon'
                            ? 'bg-[#4CAF50] text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Gift className='w-5 h-5 inline-block mr-2' />
                    기프티콘
                </button>
                <button
                    onClick={() => setActiveTab('transfer')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        activeTab === 'transfer'
                            ? 'bg-[#4CAF50] text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Wallet className='w-5 h-5 inline-block mr-2' />
                    포인트전환
                </button>
            </div>

            {/* 로딩 상태 */}
            {isLoading && (
                <div className='flex items-center justify-center py-20'>
                    <div className='text-center'>
                        <div className='w-12 h-12 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                        <p className='text-gray-600'>데이터를 불러오는 중...</p>
                    </div>
                </div>
            )}

            {/* 컨텐츠 */}
            {!isLoading && (
                <AnimatePresence mode='wait'>
                    {activeTab === 'gifticon' ? (
                        <motion.div
                            key='gifticon'
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* 카테고리 필터 */}
                            <div className='mx-4 mb-4'>
                                <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() =>
                                                setSelectedCategory(cat.label)
                                            }
                                            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all flex items-center gap-1 ${
                                                selectedCategory === cat.label
                                                    ? 'bg-[#4CAF50] text-white shadow-md'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span>{cat.icon}</span>
                                            <span>{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 검색 및 정렬 */}
                            <div className='mx-4 mb-4 flex gap-2'>
                                <div className='flex-1 relative'>
                                    <Search className='w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                                    <input
                                        type='text'
                                        placeholder='제품명 또는 브랜드 검색...'
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className='w-full pl-10 pr-4 py-3 rounded-xl bg-white border-none shadow-sm focus:ring-2 focus:ring-[#4CAF50] transition-all'
                                    />
                                </div>
                                <div className='relative'>
                                    <button
                                        onClick={() =>
                                            setShowSortDropdown(
                                                !showSortDropdown
                                            )
                                        }
                                        className='px-4 py-3 rounded-xl bg-white shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors'
                                    >
                                        <span className='font-medium'>
                                            {
                                                SORT_OPTIONS.find(
                                                    (s) => s.id === sortBy
                                                ).label
                                            }
                                        </span>
                                        <ChevronDown className='w-4 h-4' />
                                    </button>
                                    {showSortDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className='absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg overflow-hidden z-10'
                                        >
                                            {SORT_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => {
                                                        setSortBy(opt.id);
                                                        setShowSortDropdown(
                                                            false
                                                        );
                                                    }}
                                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                                                        sortBy === opt.id
                                                            ? 'bg-green-50 text-[#4CAF50] font-medium'
                                                            : ''
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* 기프티콘 그리드 */}
                            <div className='mx-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8'>
                                {filteredGifticons.map((product, index) => {
                                    const canAfford =
                                        product.price <= currentPoints;
                                    return (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{
                                                y: -5,
                                                transition: { duration: 0.2 },
                                            }}
                                            className='bg-white rounded-2xl shadow-md overflow-hidden'
                                        >
                                            <div className='relative'>
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className='w-full h-32 object-cover'
                                                />
                                                {product.popular && (
                                                    <div className='absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1'>
                                                        <TrendingUp className='w-3 h-3' />
                                                        HOT
                                                    </div>
                                                )}
                                            </div>
                                            <div className='p-3'>
                                                <div className='text-xs text-gray-500 mb-1'>
                                                    {product.brand}
                                                </div>
                                                <h3 className='font-bold text-gray-800 mb-3 text-sm line-clamp-2 min-h-[2.5rem]'>
                                                    {product.name}
                                                </h3>
                                                <div className='flex items-center justify-between mb-2'>
                                                    <span className='text-lg font-bold text-[#4CAF50]'>
                                                        {product.price.toLocaleString()}
                                                        P
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        canAfford &&
                                                        handleGifticonPurchase(
                                                            product
                                                        )
                                                    }
                                                    disabled={!canAfford}
                                                    className={`w-full py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
                                                        canAfford
                                                            ? 'bg-[#4CAF50] text-white hover:bg-[#45a049] shadow-sm'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {canAfford
                                                        ? '구매하기'
                                                        : '포인트 부족'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key='transfer'
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className='mx-4'
                        >
                            {/* 저장된 계좌 불러오기 */}
                            {savedAccounts.length > 0 && (
                                <div className='mb-4 bg-white rounded-2xl p-4 shadow-sm'>
                                    <h3 className='font-bold text-gray-800 mb-3'>
                                        최근 사용 계좌
                                    </h3>
                                    <div className='space-y-2'>
                                        {savedAccounts.map((acc, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() =>
                                                    loadSavedAccount(acc)
                                                }
                                                className='w-full p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors'
                                            >
                                                <div className='font-medium'>
                                                    {acc.bankName}
                                                </div>
                                                <div className='text-sm text-gray-600'>
                                                    {acc.accountNumber} (
                                                    {acc.accountHolder})
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 포인트전환 폼 */}
                            <div className='bg-white rounded-2xl p-6 shadow-sm mb-4'>
                                <h3 className='font-bold text-lg mb-4'>
                                    포인트전환 신청
                                </h3>

                                {/* 금액 빠른 선택 */}
                                <div className='mb-4 '>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        금액 선택
                                    </label>
                                    <div className='grid grid-cols-4 gap-2'>
                                        {[1000, 5000, 10000, currentPoints].map(
                                            (amount) => (
                                                <button
                                                    key={amount}
                                                    onClick={() =>
                                                        setTransferAmount(
                                                            amount ===
                                                                currentPoints
                                                                ? currentPoints.toString()
                                                                : amount.toString()
                                                        )
                                                    }
                                                    className='py-2 px-3 bg-gray-50 hover:bg-[#4CAF50] hover:text-white rounded-lg text-sm font-medium transition-all'
                                                >
                                                    {amount === currentPoints
                                                        ? '전액'
                                                        : `${amount.toLocaleString()}P`}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* 금액 입력 */}
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        전환 포인트 (입금받을 금액)
                                    </label>
                                    <input
                                        type='number'
                                        step='1000'
                                        value={transferAmount}
                                        onChange={(e) =>
                                            setTransferAmount(e.target.value)
                                        }
                                        placeholder='포인트 입력'
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent'
                                    />
                                    <div className='mt-2 space-y-1'>
                                        <div className='text-sm text-gray-500'>
                                            실제 입금액:{' '}
                                            <span className='font-semibold text-gray-800'>
                                                {parseInt(
                                                    transferAmount || 0
                                                ).toLocaleString()}
                                                원
                                            </span>
                                        </div>
                                        <div className='text-sm text-red-600'>
                                            차감 포인트:{' '}
                                            <span className='font-semibold'>
                                                {Math.ceil(
                                                    parseInt(
                                                        transferAmount || 0
                                                    ) * 1.05
                                                ).toLocaleString()}
                                                P
                                            </span>
                                            <span className='text-xs ml-2 text-gray-500'>
                                                (수수료 5% 포함)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 은행명 */}
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        은행명
                                    </label>
                                    <input
                                        type='text'
                                        value={bankName}
                                        onChange={(e) =>
                                            setBankName(e.target.value)
                                        }
                                        placeholder='예: 국민은행'
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent'
                                    />
                                </div>

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        계좌번호
                                    </label>
                                    <input
                                        type='text'
                                        inputMode='numeric'
                                        value={accountNumber}
                                        onChange={(e) =>
                                            setAccountNumber(e.target.value)
                                        }
                                        placeholder=" '-' 없이 숫자만 입력"
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent'
                                    />
                                    {/* 숫자만 입력하세요 경고 */}
                                    {accountNumber.length > 0 &&
                                        !/^\d+$/.test(accountNumber) && (
                                            <p className='text-xs text-red-500 mt-1 flex items-center gap-1'>
                                                <AlertCircle className='w-3 h-3 flex-shrink-0' />
                                                계좌번호에는 숫자만 입력해
                                                주세요. (예: 1234567890)
                                            </p>
                                        )}
                                    {/* 최소 자릿수 경고 */}
                                    {accountNumber.length > 0 &&
                                        /^\d+$/.test(accountNumber) &&
                                        accountNumber.length < 7 && (
                                            <p className='text-xs text-red-500 mt-1 flex items-center gap-1'>
                                                <AlertCircle className='w-3 h-3 flex-shrink-0' />
                                                계좌번호는 최소 7자리 이상이어야
                                                합니다. (현재:{' '}
                                                {accountNumber.length}자리)
                                            </p>
                                        )}
                                    {/* 최대 자릿수 경고 */}
                                    {accountNumber.length > 15 && (
                                        <p className='text-xs text-red-500 mt-1 flex items-center gap-1'>
                                            <AlertCircle className='w-3 h-3 flex-shrink-0' />
                                            계좌번호는 최대 15자리입니다. (현재:{' '}
                                            {accountNumber.length}자리)
                                        </p>
                                    )}
                                </div>

                                {/* 예금주 */}
                                <div className='mb-6'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        예금주
                                    </label>
                                    <input
                                        type='text'
                                        value={accountHolder}
                                        onChange={(e) =>
                                            setAccountHolder(e.target.value)
                                        }
                                        placeholder='예금주명 (숫자 입력 불가)'
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent'
                                    />
                                    {/* 숫자 포함 경고 */}
                                    {accountHolder.length > 0 &&
                                        /\d/.test(accountHolder) && (
                                            <p className='text-xs text-red-500 mt-1 flex items-center gap-1'>
                                                <AlertCircle className='w-3 h-3 flex-shrink-0' />
                                                예금주명에는 숫자를 포함할 수
                                                없습니다.
                                            </p>
                                        )}
                                </div>
                                {/* 신청 버튼 */}
                                <button
                                    onClick={() => setShowTransferModal(true)}
                                    disabled={
                                        !transferAmount ||
                                        !bankName ||
                                        !accountNumber ||
                                        !accountHolder ||
                                        Math.ceil(
                                            parseInt(transferAmount || 0) * 1.05
                                        ) > currentPoints ||
                                        parseInt(transferAmount || 0) < 1000
                                    }
                                    className='w-full py-4 bg-[#4CAF50] text-white rounded-xl font-bold text-lg hover:bg-[#45a049] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md'
                                >
                                    포인트전환 신청
                                </button>

                                {/* 안내사항 */}
                                <div className='mt-4 p-4 bg-blue-50 rounded-xl'>
                                    <div className='flex items-start justify-center gap-2'>
                                        <AlertCircle className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                                        <div className='text-sm text-blue-800'>
                                            <p className='font-medium mb-1'>
                                                포인트전환 안내
                                            </p>
                                            <ul className='space-y-1 text-xs '>
                                                <li>
                                                    • 수수료 5%가 포인트에서
                                                    차감됩니다 (입금액은 입력한
                                                    금액 그대로)
                                                </li>
                                                <li>
                                                    • 영업일 기준 1~3일 내 입금
                                                    처리됩니다
                                                </li>
                                                <li>
                                                    • 최소 신청 금액은
                                                    1,000P입니다
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* 교환 내역 */}
            <div className='mx-4 mb-8'>
                <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-lg font-bold'>최근 사용 내역</h2>
                    <button
                        onClick={() => dispatch(fetchUsedPointLogs())}
                        className='text-sm text-[#4CAF50] font-medium hover:underline'
                    >
                        새로고침
                    </button>
                </div>

                {isLoadingLogs ? (
                    <div className='bg-white rounded-xl p-8 text-center'>
                        <div className='w-8 h-8 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mx-auto mb-2'></div>
                        <p className='text-gray-500 text-sm'>
                            내역을 불러오는 중...
                        </p>
                    </div>
                ) : usedLogs &&
                  usedLogs.filter((item) => item.pointAmount < 0).length > 0 ? (
                    <div className='space-y-3'>
                        {usedLogs
                            .filter((item) => item.pointAmount < 0) // 사용(음수)만 필터링
                            .slice(0, 5)
                            .map((item, index) => {
                                // 포인트 사용 타입 판단
                                const isVoucher =
                                    item.description?.includes('기프티콘') ||
                                    item.description?.includes('쿠폰');
                                const isCash =
                                    item.description?.includes('계좌') ||
                                    item.description?.includes('입금');

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className='bg-white rounded-xl p-4 shadow-sm'
                                    >
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-3'>
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                        isVoucher
                                                            ? 'bg-purple-100'
                                                            : isCash
                                                            ? 'bg-blue-100'
                                                            : 'bg-red-100'
                                                    }`}
                                                >
                                                    {isVoucher ? (
                                                        <Gift className='w-5 h-5 text-purple-600' />
                                                    ) : isCash ? (
                                                        <Wallet className='w-5 h-5 text-blue-600' />
                                                    ) : (
                                                        <TrendingUp className='w-5 h-5 text-red-600' />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className='font-semibold text-gray-800'>
                                                        {item.description ||
                                                            '포인트 사용'}
                                                    </div>
                                                    <div className='text-xs text-gray-500 text-left'>
                                                        {formatDate(item.date)}
                                                        {item.category &&
                                                            ` · ${item.category}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <div className='font-bold text-red-600'>
                                                    {Math.abs(
                                                        item.pointAmount || 0
                                                    ).toLocaleString()}
                                                    P
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                    </div>
                ) : (
                    <div className='bg-white rounded-xl p-8 text-center'>
                        <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                            <Gift className='w-6 h-6 text-gray-400' />
                        </div>
                        <p className='text-gray-500'>
                            아직 사용 내역이 없습니다
                        </p>
                        <p className='text-sm text-gray-400 mt-1'>
                            기프티콘을 구매하거나 포인트전환을 신청해보세요
                        </p>
                    </div>
                )}
            </div>

            {/* 기프티콘 구매 확인 모달 */}
            <AnimatePresence>
                {showConfirmModal && selectedGifticon && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
                        onClick={() => setShowConfirmModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className='bg-white rounded-3xl p-6 max-w-sm w-full'
                        >
                            <div className='text-center mb-6'>
                                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                    <Gift className='w-8 h-8 text-[#4CAF50]' />
                                </div>
                                <h3 className='text-xl font-bold mb-2'>
                                    구매 확인
                                </h3>
                                <p className='text-gray-600 text-sm mb-1'>
                                    {selectedGifticon?.brand}
                                </p>
                                <p className='text-gray-800 font-semibold'>
                                    {selectedGifticon?.name}
                                </p>
                            </div>
                            <div className='bg-gray-50 rounded-xl p-4 mb-6'>
                                <div className='flex justify-between mb-2'>
                                    <span className='text-gray-600'>
                                        사용 포인트
                                    </span>
                                    <span className='font-bold'>
                                        {selectedAmount?.toLocaleString()}P
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                        남은 포인트
                                    </span>
                                    <span className='font-bold text-[#4CAF50]'>
                                        {(
                                            currentPoints - selectedAmount
                                        ).toLocaleString()}
                                        P
                                    </span>
                                </div>
                            </div>
                            <div className='flex gap-3'>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className='flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors'
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleGifticonConfirm}
                                    className='flex-1 py-3 bg-[#4CAF50] text-white rounded-xl font-medium hover:bg-[#45a049] transition-colors'
                                >
                                    구매하기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 전화번호 입력 모달 */}
            <AnimatePresence>
                {showPhoneModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
                        onClick={() => setShowPhoneModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className='bg-white rounded-3xl p-6 max-w-sm w-full text-center'
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    delay: 0.1,
                                    type: 'spring',
                                    stiffness: 200,
                                }}
                                className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'
                            >
                                <Gift className='w-8 h-8 text-[#4CAF50]' />
                            </motion.div>

                            <h3 className='text-xl font-bold mb-2'>
                                수령자 정보 입력
                            </h3>
                            <p className='text-gray-600 mb-4 text-sm'>
                                기프티콘을 받을 휴대폰 번호를 입력해주세요 📱
                            </p>

                            <input
                                type='tel'
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder='010-1234-5678'
                                className={`w-full border rounded-xl px-3 py-2 text-center text-gray-700 focus:outline-none focus:ring-2 ${
                                    phoneError
                                        ? 'border-red-400 focus:ring-red-300'
                                        : 'border-gray-300 focus:ring-[#4CAF50]'
                                }`}
                            />
                            {phoneError && (
                                <p className='text-sm text-red-500 mt-2'>
                                    번호를 입력해주세요.
                                </p>
                            )}

                            <p className='text-xs text-gray-400 mt-2'>
                                ※ 입력된 번호는 저장되지 않습니다.
                            </p>

                            <div className='flex gap-3 mt-6'>
                                <button
                                    onClick={() => setShowPhoneModal(false)}
                                    className='flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors'
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handlePhoneSubmit}
                                    className='flex-1 py-3 bg-[#4CAF50] text-white rounded-xl font-medium hover:bg-[#45a049] transition-colors'
                                >
                                    확인
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 포인트전환 확인 모달 */}
            <AnimatePresence>
                {showTransferModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
                        onClick={() => setShowTransferModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className='bg-white rounded-3xl p-6 max-w-sm w-full'
                        >
                            <div className='text-center mb-6'>
                                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                    <Wallet className='w-8 h-8 text-green-600' />
                                </div>
                                <h3 className='text-xl font-bold mb-2'>
                                    포인트전환 신청 확인
                                </h3>
                                <p className='text-gray-600'>
                                    아래 계좌로 입금을 신청하시겠습니까?
                                </p>
                            </div>
                            <div className='bg-gray-50 rounded-xl p-4 mb-6 space-y-2'>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>은행</span>
                                    <span className='font-semibold'>
                                        {bankName}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                        계좌번호
                                    </span>
                                    <span className='font-semibold'>
                                        {accountNumber}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                        예금주
                                    </span>
                                    <span className='font-semibold'>
                                        {accountHolder}
                                    </span>
                                </div>
                                <div className='border-t pt-2 mt-2'>
                                    <div className='flex justify-between mb-1'>
                                        <span className='text-gray-600'>
                                            차감 포인트
                                        </span>
                                        <span className='font-semibold text-red-600'>
                                            {Math.ceil(
                                                parseInt(transferAmount || 0) *
                                                    1.05
                                            ).toLocaleString()}
                                            P
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>
                                            입금 예정액
                                        </span>
                                        <span className='font-bold text-green-600'>
                                            {parseInt(
                                                transferAmount || 0
                                            ).toLocaleString()}
                                            원
                                        </span>
                                    </div>
                                    <div className='text-xs text-gray-500 mt-1'>
                                        (수수료 5% 포함)
                                    </div>
                                </div>
                            </div>
                            <div className='flex gap-3'>
                                <button
                                    onClick={() => setShowTransferModal(false)}
                                    className='flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors'
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleTransferSubmit}
                                    className='flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors'
                                >
                                    신청하기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 성공 모달 */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
                        onClick={() => setShowSuccessModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className='bg-white rounded-3xl p-6 max-w-sm w-full text-center'
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    delay: 0.2,
                                    type: 'spring',
                                    stiffness: 200,
                                }}
                                className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'
                            >
                                <CheckCircle2 className='w-12 h-12 text-[#4CAF50]' />
                            </motion.div>

                            <h3 className='text-2xl font-bold mb-2'>
                                신청 완료!
                            </h3>

                            {/* {activeTab === 'gifticon' && (
                                <div className="mb-4">
                                    <p className="text-gray-600 mb-2 font-medium">
                                        기프티콘을 받을 번호를 입력해주세요 📱
                                    </p>
                                    <input
                                        type="tel"
                                        placeholder="010-1234-5678"
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                                        disabled={false}
                                        onChange={(e) => console.log('입력값:', e.target.value)}
                                    />
                                    <p className="text-sm text-gray-400 mt-1">
                                        ※ 입력한 번호는 저장되지 않습니다.
                                    </p>
                                </div>
                            )} */}

                            <p className='text-gray-600 mb-6'>
                                {activeTab === 'gifticon'
                                    ? '번호 입력 후 해당 번호로 기프티콘이 발송됩니다. ( 영업일 기준 1~3일 내 )'
                                    : '포인트전환 신청이 완료되었습니다. 영업일 기준 1~3일 내 입금됩니다.'}
                            </p>

                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className='w-full py-3 bg-[#4CAF50] text-white rounded-xl font-medium hover:bg-[#45a049] transition-colors'
                            >
                                확인
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
