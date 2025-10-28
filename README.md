# Green Map - 친환경 시설 지도 서비스

PWA(Progressive Web App) 기반의 친환경 시설 찾기 서비스입니다.

## 🚀 기술 스택

-   **Frontend**: React 19, Vite
-   **State Management**: Redux Toolkit, Redux Persist
-   **Styling**: Tailwind CSS
-   **Map**: Kakao Map API
-   **PWA**: Vite PWA Plugin, Workbox
-   **Routing**: React Router DOM

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

`.env` 파일에 카카오 맵 API 키를 추가합니다:

```
VITE_KAKAO_MAP_KEY=your_kakao_map_api_key_here
```

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
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 워크플로우
├── public/
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── components/
│   │   ├── common/             # 공통 컴포넌트
│   │   ├── map/                # 지도 관련 컴포넌트
│   │   └── screens/            # 화면 컴포넌트
│   ├── hooks/                  # 커스텀 훅
│   │   ├── useKakaoMap.js
│   │   └── useMarkers.js
│   ├── store/                  # Redux store
│   │   └── slices/
│   ├── util/                   # 유틸리티 함수
│   │   ├── location.js
│   │   └── mapHelpers.js
│   └── main.jsx
├── netlify.toml                # Netlify 설정
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

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

-   [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
-   [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
