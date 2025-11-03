import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from './store/slices/appSlice';
import {
    BrowserRouter,
    Routes,
    Route,
    useNavigate,
    useLocation,
    Navigate,
} from 'react-router-dom';
import SplashScreen from './components/screens/SplashScreen';
import BottomNavigation from './components/common/BottomNavigation';
import OnboardingScreen from './components/screens/OnboardingScreen';
import HomeScreen from './components/screens/HomeScreen';
import MapScreen from './components/screens/MapScreen';
import CertificationScreen from './components/screens/CertificationScreen';
import ChallengeScreen from './components/screens/ChallengeScreen';
import MyPageScreen from './components/screens/MyPageScreen';
import PointHistoryScreen from './components/screens/PointHistoryScreen';
import PointExchangeScreen from './components/screens/PointExchangeScreen';
import RankingScreen from './components/screens/RankingScreen';
import LoginScreen from './components/screens/LoginScreen';
import LoginSuccess from './components/screens/LoginSuccess';
import BadgeScreen from './components/screens/BadgeScreen';
import './App.css';
import FaqScreen from './components/screens/FaqScreen';


// Onboarding, Home, Map, Certification components live in src/components/screens


const TAB_TO_PATH = {
    home: '/',
    map: '/map',
    cert: '/verification',
    challenge: '/challenge',
    mypage: '/mypage',
    points: '/points',
    'point-exchange': '/point-exchange',
    ranking: '/ranking',
    login: '/login',
    badge: '/badge',
    FAQ: '/FAQ',
};


export default function App() {
    const appState = useSelector((state) => state.app.appState);
    const activeTab = useSelector((state) => state.app.activeTab);
    const dispatch = useDispatch();
    // removed top-level navigate; navigation is handled inside AppContent via react-router


    if (appState === 'splash') return <SplashScreen />;
    if (appState === 'onboarding') return <OnboardingScreen />;


    function AppContent() {
        const nav = useNavigate();
        const location = useLocation();


        useEffect(() => {
            // when location changes, update redux activeTab
            const pathToTab = Object.fromEntries(
                Object.entries(TAB_TO_PATH).map(([k, v]) => [v, k])
            );
            const tab = pathToTab[location.pathname] || 'home';
            dispatch(setActiveTab(tab));


            // 라우트 변경 시 스크롤을 최상단으로 이동
            window.scrollTo(0, 0);
        }, [location.pathname]);


        const navigate = (tab) => {
            const to = TAB_TO_PATH[tab] || '/';
            nav(to);
            // also keep redux in sync
            dispatch(setActiveTab(tab));
        };


        return (
            <div className='min-h-screen w-full'>
                <Routes>
                    <Route
                        path='/'
                        element={<HomeScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/map'
                        element={<MapScreen onNavigate={navigate} />}
                    />
                    {/* 인증 */}
                    <Route
                        path='/verification'
                        element={<CertificationScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/challenge'
                        element={<ChallengeScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/mypage'
                        element={<MyPageScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/points'
                        element={<PointHistoryScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/point-exchange'
                        element={<PointExchangeScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/ranking'
                        element={<RankingScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/login'
                        element={<LoginScreen onNavigate={navigate} />}
                    />
                    <Route
                        path="/login/success"
                        element={<LoginSuccess />}
                    />
                    <Route
                        path='/badge'
                        element={<BadgeScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/FAQ'
                        element={<FaqScreen onNavigate={navigate} />}
                    />
                    {/* 404: 알 수 없는 경로는 홈으로 리디렉션 */}
                    <Route path='*' element={<Navigate to='/' replace />} />
                </Routes>


                <BottomNavigation
                    active={activeTab}
                    onChange={(tab) => navigate(tab)}
                />
            </div>
        );
    }


    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}



