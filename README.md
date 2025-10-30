# Green Map - 친환경 시설 지도 서비스

PWA(Progressive Web App) 기반의 친환경 시설 찾기 서비스입니다.  
사용자의 현재 위치를 기반으로 주변 재활용 센터, 전기차 충전소, 제로웨이스트 매장, 따릉이 스테이션 등을 찾을 수 있습니다.

## 🚀 기술 스택

-   **Frontend**: React 19, Vite 7.1.9
-   **State Management**: Redux Toolkit, Redux Persist
-   **Styling**: Tailwind CSS 3.4.7
-   **Map**: Kakao Map API
-   **PWA**: Vite PWA Plugin, Workbox
-   **Routing**: React Router DOM 7.0.2
-   **Geolocation**: Browser Geolocation API

## ✨ 주요 기능

### 🗺️ 지도 기능

-   **카카오 맵 통합**: 실시간 지도 표시 및 마커 관리
-   **카테고리 필터**: 재활용 센터, 전기차 충전소, 제로웨이스트 매장, 따릉이 등
-   **북마크 기능**: 즐겨찾는 시설 저장 및 관리
-   **시설 상세정보**: 시설 클릭 시 상세 정보 표시
-   **드래그 가능한 BottomSheet**: 시설 목록 및 상세정보 UI

### 📍 위치 기능

-   **현재 위치 추적**: Geolocation API 기반
-   **위치 오버레이**: 실시간 위치를 지도에 표시 (펄스 애니메이션)
-   **위치 이동**: 버튼 클릭으로 현재 위치로 즉시 이동
-   **로딩 상태**: 위치 가져오는 중 로딩 인디케이터 표시

### 📱 PWA 기능

-   **오프라인 지원**: Service Worker 기반
-   **설치 가능**: 홈 화면에 앱 추가
-   **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
-   **빠른 로딩**: 캐싱 전략으로 성능 최적화

### 🎨 UI/UX

-   **그린 테마**: 친환경 컨셉의 디자인
-   **부드러운 애니메이션**: Tailwind 기반 전환 효과
-   **접근성**: ARIA 레이블 및 키보드 네비게이션 지원
-   **로딩 상태**: 맵 로딩 중 스피너 표시

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 환경 변수를 설정합니다.

```bash
cp .env.example .env
```

`.env` 파일에 필요한 API 키들을 추가합니다:

```env
# 카카오 맵 API 키 (필수)
VITE_KAKAO_MAP_KEY=your_kakao_map_api_key_here

# 서울 열린데이터광장 API 키 (따릉이 데이터용, 선택)
VITE_SEOUL_API_KEY=your_seoul_open_api_key_here
```

**API 키 발급 방법**:

-   **카카오 맵 API**: [Kakao Developers](https://developers.kakao.com/)에서 발급
-   **서울 열린데이터광장 API**: [서울 열린데이터광장](https://data.seoul.go.kr/)에서 발급 (따릉이 대여소 정보 조회용)

> 💡 **참고**: 서울 API 키가 없어도 앱은 작동합니다. 다만 실시간 따릉이 대여소 정보는 표시되지 않습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 프로덕션 빌드

```bash
npm run build
```

### 5. 빌드 미리보기

```bash
npm run preview
```

## 🌐 자동 배포 설정 (GitHub Actions + Netlify)

### 필수 준비사항

1. **Netlify 계정 및 사이트 생성**

    - [Netlify](https://netlify.com)에 가입
    - 새 사이트 생성

2. **Netlify 토큰 발급**

    - Netlify → User Settings → Applications → Personal access tokens
    - "New access token" 클릭하여 토큰 생성

3. **Netlify Site ID 확인**
    - 사이트 대시보드 → Site settings → General → Site details
    - "Site ID" 복사

### GitHub Secrets 설정

GitHub 저장소 Settings → Secrets and variables → Actions → New repository secret에서 다음 시크릿을 추가합니다:

-   `NETLIFY_AUTH_TOKEN`: Netlify에서 발급받은 Personal access token
-   `NETLIFY_SITE_ID`: Netlify 사이트의 Site ID
-   `VITE_KAKAO_MAP_KEY`: 카카오 맵 API 키

### 배포 워크플로우

-   `main` 브랜치에 push하면 자동으로 프로덕션 배포
-   `feat/kakao-map` 브랜치에 push하면 자동으로 배포
-   Pull Request 생성 시 미리보기 배포

배포 상태는 GitHub Actions 탭에서 확인할 수 있습니다.

## 📁 프로젝트 구조

```
green-map/
├── .github/
│   ├── workflows/
│   │   └── deploy.yml              # GitHub Actions 배포 워크플로우
│   └── pull_request_template.md    # PR 템플릿
├── docs/
│   ├── CSS_ADJUSTMENT_GUIDE.md     # CSS 조정 가이드
│   └── CURRENT_LOCATION.md         # 현재 위치 기능 문서
├── public/
│   ├── manifest.json               # PWA 매니페스트
│   └── service-worker.js           # Service Worker
├── src/
│   ├── components/
│   │   ├── common/                 # 공통 컴포넌트
│   │   │   ├── BottomNavigation.jsx
│   │   │   ├── OfflineBanner.jsx
│   │   │   └── UpdatePrompt.jsx
│   │   ├── map/                    # 지도 관련 컴포넌트
│   │   │   ├── BottomSheet.jsx     # 드래그 가능한 하단 시트
│   │   │   ├── CurrentLocationButton.jsx
│   │   │   ├── FacilityDetail.jsx  # 시설 상세정보
│   │   │   ├── FacilityList.jsx    # 시설 목록
│   │   │   └── FilterBar.jsx       # 카테고리 필터
│   │   └── screens/                # 화면 컴포넌트
│   │       ├── HomeScreen.jsx
│   │       ├── MapScreen.jsx
│   │       ├── CertificationScreen.jsx
│   │       └── ...
│   ├── hooks/                      # 커스텀 훅
│   │   ├── useKakaoMap.js          # 카카오 맵 초기화
│   │   ├── useMarkers.js           # 마커 관리
│   │   ├── useCurrentLocation.js   # 현재 위치 추적
│   │   └── useOnlineStatus.js      # 온라인 상태 감지
│   ├── store/                      # Redux store
│   │   ├── index.js
│   │   └── slices/
│   │       ├── appSlice.js
│   │       ├── facilitySlice.js
│   │       └── ...
│   ├── util/                       # 유틸리티 함수
│   │   ├── location.js             # 위치 관련 유틸
│   │   └── mapHelpers.js           # 맵 헬퍼 함수
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example                    # 환경 변수 예제
├── netlify.toml                    # Netlify 배포 설정
├── vite.config.js                  # Vite 설정
└── package.json
```

## 🎯 주요 기능

-   🗺️ 카카오 맵 기반 친환경 시설 지도
-   🔍 시설 카테고리별 필터링
-   📍 현재 위치 기반 주변 시설 검색
-   🔖 북마크 기능
-   📱 PWA 지원 (오프라인 사용 가능)
-   🎨 반응형 디자인

## 📝 라이선스

MIT License

---

## 📚 추가 리소스

-   [Kakao Map API 문서](https://apis.map.kakao.com/web/)
-   [Vite 문서](https://vitejs.dev/)
-   [React 문서](https://react.dev/)
-   [Tailwind CSS 문서](https://tailwindcss.com/)
-   [PWA 가이드](https://web.dev/progressive-web-apps/)

## 🏗️ 아키텍처

### 상태 관리 구조

```
Redux Store
├── app: 앱 상태 (splash, onboarding, main)
├── facility: 시설 데이터 및 북마크
├── point: 포인트 시스템
├── user: 사용자 정보
└── ... (기타 슬라이스)
```

### 라우팅 구조

```
/                   → HomeScreen (기본 홈)
/map                → MapScreen (지도)
/verification       → CertificationScreen (인증)
/challenge          → ChallengeScreen (챌린지)
/mypage             → MyPageScreen (마이페이지)
/points             → PointHistoryScreen (포인트 내역)
/ranking            → RankingScreen (랭킹)
/login              → LoginScreen (로그인)
*                   → Redirect to / (404 처리)
```

---

**Made with 💚 by Green Map Team**
