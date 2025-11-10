import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';
import { fetchPointInfo, fetchMyPageData } from '../../store/slices/userSlice';
import EcoNewsList from '../screens/EcoNewsList';
import { TrophyIcon } from '@heroicons/react/24/solid';
import { useMemo } from 'react';
import {
    searchCachedPlaces,
    convertPlaceToFacility,
} from '../../util/placeApi';
import { formatDistance, calculateDistance } from '../../util/location';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';

const DEFAULT_BADGE_IMAGE =
    'https://em-content.zobj.net/thumbs/120/apple/325/leaf-fluttering-in-wind_1f343.png';

const ECO_TIPS = [
    {
        icon: '🛍️',
        title: '제로웨이스트 쇼핑 팁',
        content:
            '제로웨이스트 스토어에서 쇼핑할 때 재사용 가능한 장바구니를 가져가세요. 플라스틱 쓰레기를 줄이고 포인트를 받을 수 있어요',
    },
    {
        icon: '☕',
        title: '텀블러 사용 습관',
        content:
            '일회용 컵 대신 개인 텀블러를 가지고 다니며 커피나 음료를 테이크아웃하세요. 많은 카페에서 할인 혜택을 제공하며, 지구를 위한 작은 실천이 됩니다.',
    },
    {
        icon: '⚡',
        title: '대기 전력 차단',
        content:
            '사용하지 않는 전자제품의 플러그를 뽑거나 멀티탭 스위치를 끄는 습관을 들이세요. 대기 전력 차단으로 전기 요금을 절약하고 탄소 배출을 줄일 수 있습니다.',
    },
    {
        icon: '🚲',
        title: '그린맵 교통 활용',
        content:
            '그린맵에서 따릉이 지도를 활용해 탄소 배출 없는 경로를 찾아보세요. 자동차 대신 대중교통이나 자전거, 걷기를 이용하면 환경과 건강에 모두 이롭습니다.',
    },
];

export default function HomeScreen({ onNavigate }) {
    const dispatch = useDispatch();

    // 검색 상태
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchInputRef = useRef(null);
    const searchResultsRef = useRef(null);

    // 현재 위치 가져오기
    const {
        currentLocation,
        isLoading: isLocationLoading,
        fetchCurrentLocation,
    } = useCurrentLocation();

    // 컴포넌트 마운트 시 현재 위치 가져오기
    useEffect(() => {
        if (!currentLocation && !isLocationLoading) {
            fetchCurrentLocation().catch(() => {
                // 위치 가져오기 실패 시 기본 위치 사용 (handleSearchChange에서 처리)
            });
        }
    }, [currentLocation, isLocationLoading, fetchCurrentLocation]);

    const { isLoggedIn, profile, stats, loading } = useSelector((s) => s.user);

    // 회원탈퇴 플래그 확인 및 삭제 (회원탈퇴 직후 홈 화면 표시 유지)
    useEffect(() => {
        const accountDeactivated = localStorage.getItem('accountDeactivated');
        if (accountDeactivated === 'true') {
            // 회원탈퇴 직후임을 확인했으므로 플래그 삭제
            // (다음 번 방문 시에는 정상적인 로그인 안 된 상태로 처리)
            localStorage.removeItem('accountDeactivated');
        }
    }, []);

    // 토큰 확인 및 초기 데이터 로드
    const [isInitializing, setIsInitializing] = useState(true);
    const hasLoadedMyPageDataRef = useRef(false);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            // 토큰이 있으면 데이터 로드 시도
            if (!hasLoadedMyPageDataRef.current) {
                hasLoadedMyPageDataRef.current = true;
                dispatch(fetchMyPageData())
                    .then(() => {
                        // 성공 시 초기화 완료
                        setIsInitializing(false);
                    })
                    .catch(() => {
                        // 실패 시에도 초기화 완료 (토큰이 유효하지 않을 수 있음)
                        setIsInitializing(false);
                    });
            } else {
                // 이미 로드 시도했으면, 로그인 상태 확인 후 초기화 완료
                // 짧은 지연 후 초기화 완료 (Redux 상태 업데이트 대기)
                const timer = setTimeout(() => {
                    setIsInitializing(false);
                }, 100);
                return () => clearTimeout(timer);
            }
        } else {
            // 토큰이 없으면 즉시 초기화 완료
            setIsInitializing(false);
        }
    }, [dispatch]);

    // isLoggedIn이 변경되면 초기화 상태 업데이트 (데이터 로드 완료 신호)
    useEffect(() => {
        if (isLoggedIn) {
            setIsInitializing(false);
        }
    }, [isLoggedIn]);

    // 로딩이 완료되면 초기화 완료
    useEffect(() => {
        if (!loading && hasLoadedMyPageDataRef.current) {
            // 로딩이 완료되고 데이터 로드를 시도했으면 초기화 완료
            const timer = setTimeout(() => {
                setIsInitializing(false);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    // 윈도우 포커스 시 포인트 정보 새로고침 (로그인 상태일 때만)
    useEffect(() => {
        if (!isLoggedIn) return;

        const onFocus = () => {
            // 윈도우 포커스 시 포인트 정보만 새로고침
            dispatch(fetchPointInfo());
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [dispatch, isLoggedIn]);

    const randomTip = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * ECO_TIPS.length);
        return ECO_TIPS[randomIndex];
    }, []);

    const placeholderSvg = encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'>" +
        "<rect fill='%23e5e7eb' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23939' font-size='12'>이미지</text></svg>"
    );
    const placeholder = `data:image/svg+xml;charset=UTF-8,${placeholderSvg}`;

    const navigate = (tab) => {
        if (typeof onNavigate === 'function') {
            onNavigate(tab);
            return;
        }
        dispatch(setActiveTab(tab));
    };

    // 검색어 변경 핸들러
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim().length >= 1) {
            // 최소 1글자 이상 입력 시 검색
            const results = searchCachedPlaces(query);

            // 기본 위치 (마곡 - LG사이언스파크 근처)
            const defaultLocation = {
                lat: 37.56182106449056,
                lng: 126.83556624636658,
            };

            // 현재 위치 또는 기본 위치 사용
            const locationToUse = currentLocation || defaultLocation;

            // 항상 위치 기반으로 거리 재계산 (백엔드 distance는 km 단위라서 무시)
            const resultsWithDistance = results.map((place) => {
                const distance = calculateDistance(
                    locationToUse.lat,
                    locationToUse.lng,
                    place.latitude,
                    place.longitude
                );

                return { ...place, distance };
            });

            setSearchResults(resultsWithDistance);
            setShowSearchResults(true);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    // 검색 결과 클릭 핸들러
    const handleResultClick = (place) => {
        // Redux에 선택된 장소 저장 (MapScreen에서 사용)
        const facility = convertPlaceToFacility(place);

        // MapScreen으로 이동하면서 선택된 시설 정보 전달
        // MapScreen이 마운트되면 해당 시설로 포커스
        sessionStorage.setItem('selectedFacility', JSON.stringify(facility));

        // 검색 상태 초기화
        setSearchQuery('');
        setShowSearchResults(false);

        navigate('map');
    };

    // 검색창 외부 클릭 시 결과 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchResultsRef.current &&
                !searchResultsRef.current.contains(event.target) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target)
            ) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div style={{ paddingBottom: 'var(--bottom-nav-inset)' }}>
            {/* Header - gradient */}
            <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] px-6 pt-12 pb-6 rounded-b-3xl text-white'>
                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-white rounded-full p-5 shadow-xl mb-4'>
                        <div className='w-12 h-12 flex items-center justify-center text-[#4CAF50] text-3xl'>
                            🌿
                        </div>
                    </div>
                    <h1 className='text-white text-2xl font-bold mb-1'>
                        그린맵
                    </h1>
                    <p className='text-white/90 text-sm'>
                        지속가능한 생활 지도
                    </p>
                </div>

                <div className='relative w-full'>
                    <input
                        ref={searchInputRef}
                        type='text'
                        placeholder='지도 검색... (예: LG사이언스파크 E13, 서울식물원 )'
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() =>
                            searchQuery.trim().length >= 2 &&
                            setShowSearchResults(true)
                        }
                        className='w-full pl-12 pr-4 py-4 rounded-[30px] text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-lg'
                        aria-label='지도 검색'
                    />
                    <div className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                        🔍
                    </div>

                    {/* 검색 결과 드롭다운 */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div
                            ref={searchResultsRef}
                            className='absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50 border border-gray-100'
                        >
                            <div className='p-2'>
                                <div className='text-xs text-gray-500 px-3 py-2 flex items-center justify-between'>
                                    <span>
                                        검색 결과 {searchResults.length}개
                                    </span>
                                </div>
                                {searchResults.map((place, index) => (
                                    <button
                                        key={`${place.placeId}-${index}`}
                                        onClick={() => handleResultClick(place)}
                                        className='w-full text-left px-3 py-3 hover:bg-gray-50 rounded-xl transition-colors flex items-start gap-3'
                                    >
                                        <div className='text-2xl mt-1'>
                                            {place.categoryId === 1
                                                ? '🚲'
                                                : place.categoryId === 2
                                                    ? '🛍️'
                                                    : place.categoryId === 3
                                                        ? '⚡'
                                                        : place.categoryId === 5
                                                            ? '♻️'
                                                            : '📍'}
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <div className='font-medium text-gray-900 truncate'>
                                                {place.placeName}
                                            </div>
                                            <div className='text-sm text-gray-500 truncate'>
                                                {place.address}
                                            </div>
                                            {place.distance && (
                                                <div className='text-xs text-[#4CAF50] mt-1'>
                                                    📍{' '}
                                                    {formatDistance(
                                                        place.distance
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 검색 결과 없음 */}
                    {showSearchResults &&
                        searchQuery.trim().length >= 2 &&
                        searchResults.length === 0 && (
                            <div
                                ref={searchResultsRef}
                                className='absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl p-6 z-50 border border-gray-100 text-center'
                            >
                                <div className='text-4xl mb-2'>🔍</div>
                                <p className='text-gray-600 text-sm'>
                                    "{searchQuery}"에 대한 검색 결과가 없습니다
                                </p>
                                <p className='text-xs text-gray-400 mt-2'>
                                    지도에서 장소를 탐색하면 검색할 수 있어요
                                </p>
                            </div>
                        )}
                </div>
            </div>

            {/* Page content */}
            <div className='px-4'>
                {/*  로딩 중 (초기화 중이거나 데이터 로딩 중) */}
                {(loading || isInitializing) && (
                    <div className='mt-4 bg-white rounded-3xl p-6 text-center shadow-xl'>
                        <p className='text-gray-600'>정보를 불러오는 중...</p>
                    </div>
                )}

                {/* 로그인 안 됨 (초기화 완료 후에만 표시) */}
                {!loading && !isInitializing && !isLoggedIn && (
                    <div className='mt-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-6 text-center shadow-xl'>
                        <div className='text-5xl mb-4'>🔒</div>
                        <h3 className='text-gray-900 text-xl font-bold mb-2'>
                            로그인이 필요해요
                        </h3>
                        <p className='text-gray-600 mb-4'>
                            그린 포인트와 활동 내역을 확인하려면 로그인해주세요
                        </p>
                        <button
                            onClick={() => navigate('login')}
                            className='bg-[#4CAF50] text-white px-6 py-3 rounded-[20px] hover:bg-[#45a049]'
                        >
                            로그인하러 가기
                        </button>
                    </div>
                )}

                {/* 로그인 됨 - 포인트 카드 */}
                {!loading && isLoggedIn && (
                    <div className='mt-4'>
                        <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] rounded-3xl p-6 text-white shadow-xl border-0'>
                            {/* 사용자 이름 + 프로필 */}
                            <div className='flex items-center gap-4 mb-4'>
                                {/* 프로필 이미지 영역 */}
                                <div className='relative'>
                                    <div className='w-16 h-16 rounded-full overflow-hidden bg-white border-4 border-[#4CAF50] flex items-center justify-center shadow-md'>
                                        <img
                                            src={profile.avatar}
                                            alt='프로필'
                                            className='w-full h-full object-cover'
                                        />
                                    </div>
                                    {/* 뱃지 이미지 - 프로필 이미지 오른쪽 하단 */}
                                    {(profile.badgeUrl ||
                                        profile.image?.imageUrl) && (
                                            <div className='absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-[#4CAF50] flex items-center justify-center shadow-lg overflow-hidden'>
                                                <img
                                                    src={
                                                        profile.badgeUrl ||
                                                        profile.image?.imageUrl ||
                                                        DEFAULT_BADGE_IMAGE
                                                    }
                                                    alt='뱃지'
                                                    className='w-full h-full object-cover rounded-full'
                                                    onError={(e) => {
                                                        // 이미지 로드 실패 시 기본 이미지로 설정
                                                        if (
                                                            e.target.src !==
                                                            DEFAULT_BADGE_IMAGE
                                                        ) {
                                                            e.target.src =
                                                                DEFAULT_BADGE_IMAGE;
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                </div>

                                {/* 닉네임 */}
                                <p className='text-white font-semibold text-lg sm:text-xl tracking-wide'>
                                    {profile.nickname || profile.name}님의 그린
                                    활동
                                </p>
                            </div>

                            {/* 포인트 영역 */}
                            <div className='flex items-center justify-between mb-4'>
                                <div>
                                    <p className='text-white/90 mb-1'>
                                        나의 그린 포인트
                                    </p>
                                    <div className='flex items-baseline gap-2'>
                                        <span className='text-4xl font-bold'>
                                            {Number(
                                                stats.point
                                            ).toLocaleString()}
                                        </span>
                                        <span className='text-lg'>P</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('badge')}
                                    className='bg-white/20 p-3 rounded-2xl backdrop-blur-sm hover:bg-white/30 transition-colors'
                                >
                                    <TrophyIcon className='w-6 h-6 text-white' />
                                </button>
                            </div>

                            {/* 탄소 감축량 */}
                            <div className='bg-white/20 rounded-2xl p-3 backdrop-blur-sm mb-4'>
                                <div className='flex items-center justify-between mb-2'>
                                    <span className='text-white/90'>
                                        탄소 감축량
                                    </span>
                                    {stats.rank && (
                                        <span className='text-white/90 text-sm'>
                                            🏆 {stats.rank}위
                                        </span>
                                    )}
                                </div>
                                <div className='flex items-baseline gap-2'>
                                    <span className='text-2xl font-semibold'>
                                        {stats.carbonReduction}
                                    </span>
                                    <span className='text-sm'>kg CO₂</span>
                                </div>
                            </div>

                            {/* 활동 인증 버튼 */}
                            <button
                                onClick={() => navigate('cert')}
                                className='w-full bg-white text-[#4CAF50] py-3 rounded-[20px] text-center font-semibold 
                   shadow-md border border-[#4CAF50]/20 transition-transform duration-200 
                   hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]'
                            >
                                활동 인증하고 포인트 받기
                            </button>
                        </div>
                    </div>
                )}

                {/* Sections */}
                <div className='mt-6 space-y-6'>
                    <EcoNewsList placeholder={placeholder} />

                    {/* Quick actions */}
                    <div>
                        <h2 className='text-gray-900 mb-4 font-semibold'>
                            빠른 실행
                        </h2>
                        <div className='grid grid-cols-2 gap-3'>
                            <button
                                onClick={() => navigate('map')}
                                className='bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100'
                            >
                                <div className='text-4xl mb-3'>🗺️</div>
                                <p className='text-gray-900'>시설 찾기</p>
                            </button>

                            <button
                                onClick={() => navigate('challenge')}
                                className='bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100'
                            >
                                <div className='text-4xl mb-3'>🎯</div>
                                <p className='text-gray-900'>챌린지 참여</p>
                            </button>

                            <button
                                onClick={() => navigate('cert')}
                                className='bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100'
                            >
                                <div className='text-4xl mb-3'>📸</div>
                                <p className='text-gray-900'>활동 인증</p>
                            </button>

                            <button
                                onClick={() => navigate('mypage')}
                                className='bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100'
                            >
                                <div className='text-4xl mb-3'>👤</div>
                                <p className='text-gray-900'>내 프로필</p>
                            </button>
                        </div>
                    </div>

                    {/* Eco tip */}
                    <div>
                        <div className='bg-[#8BC34A] bg-opacity-10 rounded-2xl p-4 border-2 border-[#8BC34A] border-opacity-30'>
                            <div className='items-center gap-3'>
                                <div>
                                    <h3 className='text-gray-900 mb-2 font-semibold'>
                                        오늘의 에코 팁
                                    </h3>
                                    <p className='text-gray-600 text-sm'>
                                        {randomTip.title}: {randomTip.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
