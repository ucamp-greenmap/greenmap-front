import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from './store/slices/appSlice';
import {
    BrowserRouter,
    Routes,
    Route,
    useNavigate,
    useLocation,
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
import RankingScreen from './components/screens/RankingScreen';
import LoginScreen from './components/screens/LoginScreen';
import './App.css';

// Onboarding, Home, Map, Certification components live in src/components/screens

const TAB_TO_PATH = {
    home: '/',
    map: '/map',
    cert: '/verification',
    challenge: '/challenge',
    mypage: '/mypage',
    points: '/points',
    ranking: '/ranking',
    login: '/login',
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
        }, [location.pathname]);

        const navigate = (tab) => {
            const to = TAB_TO_PATH[tab] || '/';
            nav(to);
            // also keep redux in sync
            dispatch(setActiveTab(tab));
        };

        return (
            <div className='min-h-screen'>
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
                        path='/ranking'
                        element={<RankingScreen onNavigate={navigate} />}
                    />
                    <Route
                        path='/login'
                        element={<LoginScreen onNavigate={navigate} />}
                    />
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
