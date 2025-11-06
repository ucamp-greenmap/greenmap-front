/**
 * Category configuration with colors, labels, Lucide icon paths, and dummy images
 */
const CATEGORY_CONFIG = {
    recycle: {
        color: '#4CAF50',
        label: '재활용 센터',
        // Lucide Recycle icon
        iconPath:
            'M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5 M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12 M14 16l-3 3 3 3 M8.293 13.596 7.196 9.5 3.1 10.598 M9.344 5.811l1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843 M13.378 9.633l4.096 1.098 1.097-4.096',
        dummyImages: [
            'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80', // 재활용 쓰레기통
            'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&q=80', // 재활용 센터
            'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&q=80', // 재활용 박스
            'https://images.unsplash.com/photo-1607062145718-fa1c8e7cc0ea?w=800&q=80', // 재활용 소재
        ],
    },
    ev: {
        color: '#2196F3',
        label: '전기차 충전소',
        // Lucide Zap icon
        iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
        dummyImages: [
            'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80', // EV 충전기
            'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80', // 전기차 충전 중
            'https://images.unsplash.com/photo-1635274540951-b7f86f6821df?w=800&q=80', // EV 충전소
            'https://images.unsplash.com/photo-1609557927087-f9cf8e88de18?w=800&q=80', // 테슬라 충전
        ],
    },
    hcar: {
        color: '#00BCD4',
        label: '수소차 충전소',
        // Lucide Fuel icon
        iconPath:
            'M3 22h12 M4 9h10 M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18 M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5',
        dummyImages: [
            'https://images.unsplash.com/photo-1628519906461-c1dd8da29e3f?w=800&q=80', // 수소 충전소
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', // 수소 탱크
            'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80', // 현대 수소차
            'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80', // 친환경 차량
        ],
    },
    store: {
        color: '#9C27B0',
        label: '제로웨이스트',
        // Lucide ShoppingBag icon
        iconPath:
            'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
        dummyImages: [
            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80', // 제로웨이스트 매장
            'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80', // 친환경 제품
            'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=800&q=80', // 재사용 가능한 가방
            'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80', // 벌크 상품
        ],
    },
    bike: {
        color: '#FF9800',
        label: '따릉이',
        // Lucide Bike icon
        iconPath:
            'M18.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M5.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M12 17.5V14l-3-3 4-3 2 3h2',
        dummyImages: [
            'https://images.unsplash.com/photo-1559295288-da899c6b7e7c?w=800&q=80', // 공유 자전거
            'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80', // 자전거 주차
            'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80', // 도시 자전거
            'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80', // 자전거 거치대
        ],
    },
};

/**
 * Get color for each facility category
 */
export const getCategoryColor = (category) => {
    return CATEGORY_CONFIG[category]?.color || '#666666';
};

/**
 * Get Korean label for category
 */
export const getCategoryLabel = (category) => {
    return CATEGORY_CONFIG[category]?.label || category;
};

/**
 * Get dummy image URL for a facility
 * @param {string} category - Facility category
 * @param {string} facilityId - Facility ID for consistent image selection
 * @returns {string} Image URL
 */
export const getDummyImage = (category, facilityId) => {
    const config = CATEGORY_CONFIG[category];
    if (!config || !config.dummyImages || config.dummyImages.length === 0) {
        // 기본 이미지 (친환경 일반)
        return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80';
    }

    // facilityId를 기반으로 일관된 이미지 선택 (같은 시설은 항상 같은 이미지)
    const hash = facilityId
        ? facilityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        : 0;
    const index = hash % config.dummyImages.length;

    return config.dummyImages[index];
};

/**
 * Create a custom marker image for Kakao Map with Lucide React icon
 */
export const createMarkerImage = (kakao, category, isSelected = false) => {
    const config = CATEGORY_CONFIG[category] || {
        color: '#666666',
        iconPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    };

    // 선택된 마커는 더 크고 반짝이는 효과
    const size = isSelected ? 48 : 40;
    const radius = isSelected ? 20 : 16;
    const strokeWidth = isSelected ? 3 : 2.5;
    const animation = isSelected
        ? `<animate attributeName='opacity' values='1;0.6;1' dur='1s' repeatCount='indefinite'/>`
        : '';

    const svg = `
        <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
            <defs>
                <filter id='shadow-${category}-${
        isSelected ? 'selected' : 'normal'
    }' x='-50%' y='-50%' width='200%' height='200%'>
                    <feGaussianBlur in='SourceAlpha' stdDeviation='2'/>
                    <feOffset dx='0' dy='2' result='offsetblur'/>
                    <feComponentTransfer>
                        <feFuncA type='linear' slope='0.3'/>
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode/>
                        <feMergeNode in='SourceGraphic'/>
                    </feMerge>
                </filter>
            </defs>
            ${
                isSelected
                    ? `
            <!-- 반짝이는 외부 링 -->
            <circle cx='${size / 2}' cy='${size / 2}' r='${radius + 4}' 
                fill='none' stroke='${
                    config.color
                }' stroke-width='2' opacity='0.6'>
                <animate attributeName='r' values='${radius + 4};${
                          radius + 8
                      };${radius + 4}' dur='1.5s' repeatCount='indefinite'/>
                <animate attributeName='opacity' values='0.6;0.2;0.6' dur='1.5s' repeatCount='indefinite'/>
            </circle>
            `
                    : ''
            }
            <g filter='url(#shadow-${category}-${
        isSelected ? 'selected' : 'normal'
    })'>
                <circle cx='${size / 2}' cy='${size / 2}' r='${radius}' 
                    fill='${
                        config.color
                    }' stroke='white' stroke-width='${strokeWidth}'>
                    ${animation}
                </circle>
            </g>
            <g transform='translate(${size / 2 - 8.5}, ${
        size / 2 - 8.5
    }) scale(0.7)'>
                <path 
                    d='${config.iconPath}' 
                    stroke='white' 
                    stroke-width='2.2' 
                    fill='none' 
                    stroke-linecap='round' 
                    stroke-linejoin='round'
                />
            </g>
        </svg>
    `.trim();

    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

    return new kakao.maps.MarkerImage(
        url,
        new kakao.maps.Size(size, size),
        new kakao.maps.Point(size / 2, size / 2)
    );
};
