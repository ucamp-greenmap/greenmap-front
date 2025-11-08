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
import LoginSignupScreen from './components/screens/LoginSignupScreen';
import LoginSuccess from './components/screens/LoginSuccess';
import EditProfile from './components/screens/EditProfileScreen';
import BadgeScreen from './components/screens/BadgeScreen';
import './App.css';
import FaqScreen from './components/screens/FaqScreen';
import CertificationHistoryScreen from './components/screens/CertificationHistoryScreen';
import CarbonInfoScreen from './components/screens/CarbonInfoScreen';
import AddChallengeScreen from './components/screens/AddChallengeScreen';
import AdminScreen from './components/screens/AdminScreen';
// Onboarding, Home, Map, Certification components live in src/components/screens

const TAB_TO_PATH = {
    home: '/',
    map: '/map',
    cert: '/verification',
    challenge: '/challenge',
    'edit-profile': '/edit-profile',
    mypage: '/mypage',
    points: '/points',
    'point-exchange': '/point-exchange',
    admin: '/admin',
    ranking: '/ranking',
    login: '/login',
    badge: '/badge',
    FAQ: '/FAQ',
    'cert-history': '/cert-history',
    'carbon-info': '/carbon-info',
    addChal: '/addChallenge',
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
                        element={<LoginSignupScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/edit-profile'
                        element={<EditProfile onNavigate={navigate} />}
                    />
                    <Route path='/login/success' element={<LoginSuccess />} />
                    <Route
                        path='/badge'
                        element={<BadgeScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/carbon-info'
                        element={<CarbonInfoScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/cert-history'
                        element={
                            <CertificationHistoryScreen onNavigate={navigate} />
                        }
                    />
                    <Route
                        path='/FAQ'
                        element={<FaqScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/addChallenge'
                        element={<AddChallengeScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/admin'
                        element={<AdminScreen onNavigate={navigate} />}
                    />
                    {/* 404: 알 수 없는 경로는 홈으로 리디렉션 */}
                    <Route path='*' element={<Navigate to='/' replace />} />
                </Routes>

                {/* 하단 네비게이션 바 - addChallenge 페이지에서는 숨김 */}
                {location.pathname !== '/addChallenge' && (
                    <BottomNavigation
                        active={activeTab}
                        onChange={(tab) => navigate(tab)}
                    />
                )}
            </div>
        );
    }

    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}
