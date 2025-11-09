// 카테고리 정의
export const CATEGORIES = [
    { id: 'all', label: '전체', icon: '🎁' },
    { id: 'electronics', label: 'LG전자', icon: '⚡' },
    { id: 'beauty', label: '뷰티/생활', icon: '💄' },
    { id: 'cafe', label: '카페/음료', icon: '☕' },
    { id: 'restaurant', label: '외식', icon: '🍔' },
    { id: 'convenience', label: '편의점', icon: '🏪' },
    { id: 'culture', label: '문화', icon: '🎬' },
    { id: 'fashion', label: '패션', icon: '👕' },
    { id: 'shopping', label: '쇼핑', icon: '🛒' },
];

// 정렬 옵션
export const SORT_OPTIONS = [
    { id: 'popular', label: '인기순' },
    { id: 'low', label: '낮은 포인트순' },
    { id: 'high', label: '높은 포인트순' },
];

// 교환 내역 샘플 데이터 (API 연동 전까지 임시)
export const EXCHANGE_HISTORY = [
    {
        id: 1,
        type: 'gifticon',
        name: '아메리카노 (Tall)',
        brand: '스타벅스',
        points: 4500,
        date: '2025-11-03',
    },
    {
        id: 2,
        type: 'transfer',
        name: '포인트전환',
        brand: '포인트전환',
        points: 10000,
        date: '2025-11-02',
    },
    {
        id: 3,
        type: 'gifticon',
        name: '삼각김밥 2개 + 음료',
        brand: 'GS25',
        points: 4500,
        date: '2025-11-01',
    },
    {
        id: 4,
        type: 'gifticon',
        name: '영화 관람권 (1인)',
        brand: 'CGV',
        points: 13000,
        date: '2025-10-30',
    },
    {
        id: 5,
        type: 'transfer',
        name: '포인트전환',
        brand: '포인트전환',
        points: 5000,
        date: '2025-10-28',
    },
    {
        id: 6,
        type: 'gifticon',
        name: '쿠팡 로켓배송 쿠폰',
        brand: '쿠팡',
        points: 5000,
        date: '2025-10-25',
    },
    {
        id: 7,
        type: 'gifticon',
        name: '빅맥 세트',
        brand: '맥도날드',
        points: 6500,
        date: '2025-10-20',
    },
];
