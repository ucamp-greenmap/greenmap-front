import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
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
});
// import { VitePWA } from 'vite-plugin-pwa';
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// const REAL_API_TARGET = 'http://localhost:8080';

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
//                 skipWaiting: true,
//                 runtimeCaching: [{
//                     urlPattern: ({ url }) => url.pathname.startsWith('/news') ||
//                                               url.pathname.startsWith('/point') ||
//                                               url.pathname.startsWith('/verification') ||
//                                               url.pathname.startsWith('/members'),
//                     handler: 'NetworkOnly',
//                 }],
//             },
//             devOptions: {
//                 enabled: false,
//                 navigateFallback: 'index.html',
//                 suppressWarnings: true,
//                 type: 'module',
//             },
//         }),
//     ],

//     server: {
//         proxy: {
//             '/news': { target: REAL_API_TARGET, changeOrigin: true, secure: false },
//             '/point': { target: REAL_API_TARGET, changeOrigin: true, secure: false },
//             '/verification': { target: REAL_API_TARGET, changeOrigin: true, secure: false },
//             '/members': { target: REAL_API_TARGET, changeOrigin: true, secure: false },
//         },
//         hmr: {
//             host: 'localhost',
//             port: 5173,
//             protocol: 'ws',
//         },
//     }
// });
