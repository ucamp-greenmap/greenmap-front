import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Firebase 프로젝트 설정
// Firebase 콘솔에서 프로젝트 설정 → 일반 → 앱에서 웹 앱 설정 정보 복사
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Storage 인스턴스 생성
export const storage = getStorage(app);
export default app;

