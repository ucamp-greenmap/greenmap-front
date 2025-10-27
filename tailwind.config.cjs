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
        },
    },
    plugins: [],
};
