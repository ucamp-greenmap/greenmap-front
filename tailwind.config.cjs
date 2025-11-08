module.exports = {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#4CAF50',
                lightgreen: '#8BC34A',
                brandblue: '#2196F3',
                gold: '#FFD700',
            },
            fontFamily: {
                sans: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'Noto Sans',
                    'Helvetica Neue',
                    'Arial',
                    'Noto Sans KR',
                    'system-ui',
                    'sans-serif',
                ],
            },
            // TOP 3 카드의 광택(Gloss/Sheen) 애니메이션
            // - 카드 상단 대각선으로 얇은 하이라이트가 좌→우로 이동
            // - 가독성을 방해하지 않도록 opacity를 낮게 유지
            keyframes: {
                sheen: {
                    '0%': { left: '-60%', opacity: '0' },
                    '15%': { opacity: '1' },
                    '50%': { opacity: '0.9' },
                    '85%': { opacity: '1' },
                    '100%': { left: '60%', opacity: '0' },
                },
            },
            // 위 keyframes를 Tailwind 유틸리티로 사용하기 위한 단축 이름
            animation: {
                sheen: 'sheen 3.2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};
