# 현재 위치 기능 가이드

## 📍 기능 개요

사용자의 현재 위치를 지도에 표시하고, 현재 위치로 빠르게 이동할 수 있는 기능입니다.

## 🎯 주요 기능

### 1. 현재 위치 마커

-   파란색 펄스 애니메이션이 있는 커스텀 오버레이
-   사용자의 실시간 위치를 지도에 표시
-   중심점과 펄스 효과로 시각적으로 명확하게 표시

### 2. 현재 위치 버튼

-   우측 하단에 위치한 플로팅 버튼
-   클릭 시 현재 위치로 이동하고 줌 레벨 3으로 확대
-   로딩 상태 표시 (스피너 애니메이션)

### 3. 위치 추적

-   `useCurrentLocation` 훅을 통한 위치 관리
-   위치 권한 요청 및 에러 핸들링
-   실시간 위치 추적 옵션 (watchPosition)

## 📂 파일 구조

```
src/
├── util/
│   └── location.js                    # 위치 관련 유틸 함수
│       ├── getCurrentLocation()       # 현재 위치 가져오기
│       ├── watchUserLocation()        # 위치 추적 시작
│       ├── clearLocationWatch()       # 위치 추적 중지
│       └── createCurrentLocationOverlay() # 커스텀 오버레이 생성
├── hooks/
│   └── useCurrentLocation.js          # 현재 위치 커스텀 훅
└── components/
    └── screens/
        └── MapScreen.jsx              # 지도 화면 (현재 위치 기능 통합)
```

## 🔧 사용 방법

### 1. 현재 위치 훅 사용

```javascript
import { useCurrentLocation } from '../../hooks/useCurrentLocation';

const {
    currentLocation, // { lat, lng } 객체
    isLoading, // 로딩 상태
    error, // 에러 메시지
    fetchCurrentLocation, // 위치 가져오기 함수
    startWatching, // 위치 추적 시작
    stopWatching, // 위치 추적 중지
} = useCurrentLocation({
    watchPosition: false, // 실시간 추적 여부
    onLocationChange: (location) => {
        // 위치 변경 시 콜백
        console.log('New location:', location);
    },
});
```

### 2. 커스텀 오버레이 생성

```javascript
import { createCurrentLocationOverlay } from '../../util/location';

const overlay = createCurrentLocationOverlay(window.kakao, {
    lat: 37.5665,
    lng: 126.978,
});
overlay.setMap(mapInstance);
```

### 3. 위치 권한 처리

```javascript
try {
    const location = await fetchCurrentLocation();
    // 위치 사용
} catch (error) {
    if (error.code === 1) {
        alert('위치 권한이 거부되었습니다.');
    } else if (error.code === 2) {
        alert('위치를 확인할 수 없습니다.');
    } else if (error.code === 3) {
        alert('위치 요청 시간이 초과되었습니다.');
    }
}
```

## 🎨 커스터마이징

### 오버레이 스타일 변경

`location.js`의 `createCurrentLocationOverlay` 함수에서 스타일을 수정할 수 있습니다:

```javascript
// 색상 변경
background: #3B82F6;  // 파란색 -> 다른 색상으로 변경

// 크기 변경
width: 40px;  // 펄스 원 크기
width: 16px;  // 중심 원 크기

// 애니메이션 속도 변경
animation: pulse 2s ease-out infinite;  // 2초 -> 원하는 시간으로
```

### 버튼 위치 변경

`MapScreen.jsx`에서 버튼 위치를 조정할 수 있습니다:

```javascript
className = 'absolute bottom-32 right-4 z-10 ...';
//              ↑ 하단 여백  ↑ 우측 여백
```

## ⚠️ 주의사항

1. **HTTPS 필수**: Geolocation API는 HTTPS 환경에서만 작동합니다 (localhost 제외)
2. **권한 요청**: 사용자에게 위치 권한을 요청해야 합니다
3. **배터리 소모**: `watchPosition`은 배터리를 많이 소모하므로 필요할 때만 사용
4. **정확도**: `enableHighAccuracy: true` 옵션은 더 정확하지만 배터리를 더 소모합니다

## 🌐 브라우저 호환성

-   Chrome: ✅ 지원
-   Firefox: ✅ 지원
-   Safari: ✅ 지원
-   Edge: ✅ 지원
-   IE11: ❌ 미지원

## 🔍 트러블슈팅

### 위치를 가져올 수 없음

1. 브라우저 위치 권한 확인
2. HTTPS 연결 확인
3. GPS/위치 서비스 활성화 확인

### 오버레이가 표시되지 않음

1. `window.kakao`가 로드되었는지 확인
2. `mapInstance`가 초기화되었는지 확인
3. 브라우저 콘솔에서 에러 확인

### 성능 이슈

1. `watchPosition` 대신 버튼 클릭으로 위치 갱신
2. 펄스 애니메이션 비활성화 고려
3. 디바운싱 적용
