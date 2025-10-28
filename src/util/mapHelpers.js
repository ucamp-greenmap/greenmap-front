/**
 * Get color for each facility category
 */
export const getCategoryColor = (category) => {
    const colorMap = {
        recycle: '#4CAF50',
        ev: '#2196F3',
        store: '#9C27B0',
        bike: '#FF9800',
    };
    return colorMap[category] || '#666';
};

/**
 * Get Korean label for category
 */
export const getCategoryLabel = (category) => {
    const labelMap = {
        recycle: '재활용 센터',
        ev: '전기차 충전소',
        store: '제로웨이스트',
        bike: '따릉이',
    };
    return labelMap[category] || category;
};

/**
 * Create a custom marker image for Kakao Map
 */
export const createMarkerImage = (kakao, color) => {
    const svg =
        `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>` +
        `<circle cx='18' cy='12' r='8' fill='${color}' />` +
        `<path d='M18 20 L13 33 L23 33 Z' fill='${color}' />` +
        `</svg>`;
    const url = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    return new kakao.maps.MarkerImage(
        url,
        new kakao.maps.Size(36, 36),
        new kakao.maps.Point(18, 36)
    );
};
