// import { VitePWA } from 'vite-plugin-pwa';
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//     plugins: [
//         react(),
//         VitePWA({
//             registerType: 'prompt',
//             injectRegister: false,

//             pwaAssets: {
//                 disabled: false,
//                 config: true,
//             },

//             manifest: {
//                 name: 'green-map',
//                 short_name: 'green-map',
//                 description: '우리 지구 푸르게 푸르게',
//                 theme_color: '#03c75a',
//             },

//             workbox: {
//                 globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
//                 cleanupOutdatedCaches: true,
//                 clientsClaim: true,
//             },

//             devOptions: {
//                 enabled: false,
//                 navigateFallback: 'index.html',
//                 suppressWarnings: true,
//                 type: 'module',
//             },
//         }),
//     ],
// });
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react(),
        // PWA 설정 (기존 설정 유지)
        VitePWA({
            registerType: 'prompt',
            injectRegister: false,

            pwaAssets: {
                disabled: false,
                config: true,
            },

            manifest: {
                name: 'green-map',
                short_name: 'green-map',
                description: '우리 지구 푸르게 푸르게',
                theme_color: '#03c75a',
            },

            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
                cleanupOutdatedCaches: true,
                clientsClaim: true,
            },

            devOptions: {
                enabled: false,
                navigateFallback: 'index.html',
                suppressWarnings: true,
                type: 'module',
            },
        }),
    ],

    // CORS 및 HMR 오류 해결을 위한 서버 설정
    server: {
        // 1. CORS 우회를 위한 프록시 설정
        proxy: {
            // API 코드에서 사용되는 모든 '/verification/' 요청을 프록시합니다.
            '/verification': {
                target: 'http://34.50.38.218',
                changeOrigin: true,
                secure: false,
            },
            '/news': {
                target: 'http://34.50.38.218',
                changeOrigin: true,
                secure: false,
            },
            '/point': {
                target: 'http://34.50.38.218',
                changeOrigin: true,
                secure: false,
            },
        },

        hmr: {
            host: 'localhost',
            port: 5173,
            protocol: 'ws',
        },
    },
});
