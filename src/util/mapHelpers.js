/**
 * Category configuration with colors, labels, and Lucide icon paths
 */
const CATEGORY_CONFIG = {
    recycle: {
        color: '#4CAF50',
        label: '재활용 센터',
        // Lucide Recycle icon
        iconPath:
            'M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5 M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12 M14 16l-3 3 3 3 M8.293 13.596 7.196 9.5 3.1 10.598 M9.344 5.811l1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843 M13.378 9.633l4.096 1.098 1.097-4.096',
    },
    ev: {
        color: '#2196F3',
        label: '전기차 충전소',
        // Lucide Zap icon
        iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    },
    hcar: {
        color: '#00BCD4',
        label: '수소차 충전소',
        // Lucide Fuel icon
        iconPath:
            'M3 22h12 M4 9h10 M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18 M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5',
    },
    store: {
        color: '#9C27B0',
        label: '제로웨이스트',
        // Lucide ShoppingBag icon
        iconPath:
            'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
    },
    bike: {
        color: '#FF9800',
        label: '따릉이',
        // Lucide Bike icon
        iconPath:
            'M18.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M5.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M12 17.5V14l-3-3 4-3 2 3h2',
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
                <filter id='shadow-${category}-${isSelected ? 'selected' : 'normal'}' x='-50%' y='-50%' width='200%' height='200%'>
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
                fill='none' stroke='${config.color}' stroke-width='2' opacity='0.6'>
                <animate attributeName='r' values='${radius + 4};${radius + 8};${radius + 4}' dur='1.5s' repeatCount='indefinite'/>
                <animate attributeName='opacity' values='0.6;0.2;0.6' dur='1.5s' repeatCount='indefinite'/>
            </circle>
            `
                    : ''
            }
            <g filter='url(#shadow-${category}-${isSelected ? 'selected' : 'normal'})'>
                <circle cx='${size / 2}' cy='${size / 2}' r='${radius}' 
                    fill='${config.color}' stroke='white' stroke-width='${strokeWidth}'>
                    ${animation}
                </circle>
            </g>
            <g transform='translate(${size / 2 - 8.5}, ${size / 2 - 8.5}) scale(0.7)'>
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
