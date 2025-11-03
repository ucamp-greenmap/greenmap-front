/**
 * Category configuration with colors, labels, and Lucide icon paths
 */
const CATEGORY_CONFIG = {
    recycle: {
        color: '#4CAF50',
        label: '재활용 센터',
        // Lucide RefreshCw (순환) icon - 재활용을 더 명확하게 표현
        iconPath:
            'M21 2v6h-6 M3 12a9 9 0 0 1 15-6.7L21 8 M3 22v-6h6 M21 12a9 9 0 0 1-15 6.7L3 16',
    },
    ev: {
        color: '#2196F3',
        label: '전기차 충전소',
        // Lucide Zap icon - 유지
        iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    },
    store: {
        color: '#9C27B0',
        label: '제로웨이스트',
        // Lucide ShoppingBag icon - 더 단순하고 명확한 가게 모양
        iconPath:
            'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
    },
    bike: {
        color: '#FF9800',
        label: '따릉이',
        // Lucide Bike icon (정확한 경로)
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
export const createMarkerImage = (kakao, category) => {
    const config = CATEGORY_CONFIG[category] || {
        color: '#666666',
        iconPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    };

    const svg = `
        <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'>
            <defs>
                <filter id='shadow-${category}' x='-50%' y='-50%' width='200%' height='200%'>
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
            <g filter='url(#shadow-${category})'>
                <circle cx='20' cy='20' r='16' fill='${config.color}' stroke='white' stroke-width='2.5'/>
            </g>
            <g transform='translate(11.5, 11.5) scale(0.7)'>
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
        new kakao.maps.Size(40, 40),
        new kakao.maps.Point(20, 20)
    );
};
