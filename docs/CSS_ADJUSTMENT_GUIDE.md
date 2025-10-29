# 🎨 CSS 조정 가이드

MapScreen과 관련 컴포넌트들의 레이아웃 및 spacing을 조정하는 방법을 정리한 문서입니다.

## 📋 목차

1. [전역 설정 (index.css)](#1-전역-설정-indexcss)
2. [MapScreen 컨테이너](#2-mapscreen-컨테이너)
3. [카카오 지도 영역](#3-카카오-지도-영역)
4. [BottomSheet 높이 조정](#4-bottomsheet-높이-조정)
5. [FilterBar 위치 조정](#5-filterbar-위치-조정)
6. [CurrentLocationButton 위치 조정](#6-currentlocationbutton-위치-조정)
7. [HomeScreen 스크롤 영역](#7-homescreen-스크롤-영역)

---

## 1. 전역 설정 (index.css)

**위치:** `src/index.css`

### BottomNavigation 관련 spacing

```css
:root {
    --bottom-nav-height: 84px;
    --bottom-nav-inset: calc(var(--bottom-nav-height) + 12px);
}
```

### 조정 방법

#### A. BottomNavigation 높이 변경

```css
--bottom-nav-height: 70px; /* 기본값: 84px */
```

⚠️ `src/components/common/BottomNavigation.jsx`의 height도 같이 수정 필요

#### B. 하단 여백 조정

```css
--bottom-nav-inset: calc(var(--bottom-nav-height) + 20px); /* 기본값: 12px */
```

-   값 증가 → 콘텐츠와 BottomNavigation 사이 공간 증가
-   값 감소 → 더 타이트한 레이아웃

#### C. 전체 inset 직접 설정

```css
--bottom-nav-inset: 100px; /* calc 제거하고 고정값 사용 */
```

---

## 2. MapScreen 컨테이너

**위치:** `src/components/screens/MapScreen.jsx`

### 현재 설정

```jsx
<div
    className='relative w-full overflow-hidden'
    style={{ height: 'calc(100vh - var(--bottom-nav-inset))' }}
>
```

### 조정 방법

#### A. 지도 영역을 더 크게 (BottomNavigation 숨김)

```jsx
style={{ height: '100vh' }}
```

#### B. 지도 영역을 더 작게 (상단 헤더 공간 확보)

```jsx
style={{ height: 'calc(100vh - var(--bottom-nav-inset) - 60px)' }}
```

-   마지막 `60px`는 상단 헤더/툴바 높이

#### C. 고정 높이 사용

```jsx
style={{ height: '600px' }}
```

---

## 3. 카카오 지도 영역

**위치:** `src/components/screens/MapScreen.jsx`

### 현재 설정

```jsx
<div ref={mapRef} className='w-full h-full z-0' />
```

### 중요 사항

-   ✅ `w-full h-full` 사용 (좌우 여백 없음)
-   ❌ `absolute inset-0` 사용 금지 (좌측 여백 발생)

### 조정 방법

#### A. 지도에 padding 추가

```jsx
className = 'w-full h-full z-0 p-4';
```

#### B. 지도 크기 제한

```jsx
className = 'max-w-4xl mx-auto h-full z-0';
```

---

## 4. BottomSheet 높이 조정

**위치:** `src/components/map/BottomSheet.jsx`

### 현재 설정

#### 초기 높이 (접힌 상태)

```javascript
const [sheetHeight, setSheetHeight] = useState(80); // 80px
```

#### 드래그 중 높이 제한

```javascript
let newHeight = Math.min(
    window.innerHeight * 0.9, // 최대 높이 (화면의 90%)
    Math.max(80, startHeightRef.current + dy) // 최소 높이 (80px)
);
```

#### 스냅 포인트

```javascript
const threshold = window.innerHeight * 0.25; // 화면의 25%
if (currentHeight > threshold) {
    setSheetHeight(window.innerHeight * 0.6); // 펼친 상태: 60%
} else {
    setSheetHeight(80); // 접힌 상태: 80px
}
```

### 조정 방법

#### A. 접힌 상태 높이 변경

```javascript
const [sheetHeight, setSheetHeight] = useState(120); // 기본값: 80

// 드래그 제한에서도 수정
Math.max(120, startHeightRef.current + dy);

// 스냅 포인트에서도 수정
setSheetHeight(120);
```

#### B. 펼친 상태 높이 변경

```javascript
setSheetHeight(window.innerHeight * 0.7); // 기본값: 0.6 (60%)
```

#### C. 최대 높이 변경

```javascript
Math.min(
    window.innerHeight * 0.95, // 기본값: 0.9 (90%)
    Math.max(80, startHeightRef.current + dy)
);
```

#### D. 3단계 스냅 포인트 추가

```javascript
if (currentHeight > window.innerHeight * 0.5) {
    setSheetHeight(window.innerHeight * 0.8); // 최대
} else if (currentHeight > window.innerHeight * 0.2) {
    setSheetHeight(window.innerHeight * 0.4); // 중간
} else {
    setSheetHeight(80); // 최소
}
```

---

## 5. FilterBar 위치 조정

**위치:** `src/components/map/FilterBar.jsx`

### 현재 설정

```jsx
<div className='absolute top-2 left-0 right-0 z-10 w-full px-4 pointer-events-none'>
```

### 조정 방법

#### A. 상단 여백 조정

```jsx
className = 'absolute top-4 ...'; // 기본값: top-2
```

-   `top-0`: 상단에 딱 붙음
-   `top-2`: 8px 여백
-   `top-4`: 16px 여백
-   `top-6`: 24px 여백

#### B. 좌우 padding 조정

```jsx
className = '... w-full px-6 ...'; // 기본값: px-4
```

#### C. 하단 배치

```jsx
className = 'absolute bottom-24 left-0 right-0 ...';
```

---

## 6. CurrentLocationButton 위치 조정

**위치:** `src/components/map/CurrentLocationButton.jsx`

### 현재 설정

```jsx
className = 'absolute top-16 right-4 z-10 ...';
```

### 조정 방법

#### A. 상단 여백 조정

```jsx
className = 'absolute top-20 right-4 z-10 ...'; // 기본값: top-16
```

-   `top-12`: 48px (FilterBar 바로 아래)
-   `top-16`: 64px (기본값)
-   `top-20`: 80px (더 아래)

#### B. 우측 여백 조정

```jsx
className = 'absolute top-16 right-6 z-10 ...'; // 기본값: right-4
```

#### C. 좌측 배치

```jsx
className = 'absolute top-16 left-4 z-10 ...';
```

#### D. 하단 배치

```jsx
className = 'absolute bottom-32 right-4 z-10 ...';
```

---

## 7. HomeScreen 스크롤 영역

**위치:** `src/components/screens/HomeScreen.jsx`

### 현재 설정

#### 메인 컨테이너

```jsx
<div style={{ paddingBottom: 'var(--bottom-nav-inset)' }}>
```

#### Toast 알림

```jsx
<div
    className='fixed left-1/2 transform -translate-x-1/2 ... z-50'
    style={{ bottom: 'var(--bottom-nav-inset)' }}
>
```

### 조정 방법

#### A. 하단 padding 증가

```jsx
style={{ paddingBottom: 'calc(var(--bottom-nav-inset) + 20px)' }}
```

#### B. Toast 위치 조정

```jsx
// 더 위로
style={{ bottom: 'calc(var(--bottom-nav-inset) + 10px)' }}

// 더 아래로
style={{ bottom: 'calc(var(--bottom-nav-inset) - 10px)' }}
```

#### C. 고정 padding 사용

```jsx
style={{ paddingBottom: '120px' }}  // CSS 변수 대신 고정값
```

---

## 📊 주요 CSS 변수 요약

| 변수                       | 기본값 | 용도                            | 사용 위치                 |
| -------------------------- | ------ | ------------------------------- | ------------------------- |
| `--bottom-nav-height`      | 84px   | BottomNavigation 높이           | index.css                 |
| `--bottom-nav-inset`       | 96px   | BottomNavigation + 여백         | 모든 스크린               |
| `sheetHeight`              | 80px   | BottomSheet 접힌 높이           | BottomSheet.jsx           |
| `window.innerHeight * 0.6` | 60%    | BottomSheet 펼친 높이           | BottomSheet.jsx           |
| `top-2`                    | 8px    | FilterBar 상단 여백             | FilterBar.jsx             |
| `top-16`                   | 64px   | CurrentLocationButton 상단 여백 | CurrentLocationButton.jsx |

---

## 🎯 일반적인 조정 시나리오

### 시나리오 1: BottomNavigation을 더 작게

```css
/* index.css */
--bottom-nav-height: 70px;
```

```jsx
/* BottomNavigation.jsx */
style={{ height: '70px' }}
```

### 시나리오 2: BottomSheet를 더 높게

```javascript
/* BottomSheet.jsx */
const [sheetHeight, setSheetHeight] = useState(120);  // 80 → 120
Math.max(120, ...)  // 최소 높이 변경
setSheetHeight(120);  // 접힌 상태 변경
```

### 시나리오 3: 지도 영역 최대화

```jsx
/* MapScreen.jsx */
style={{ height: '100vh' }}  // BottomNavigation 가림
```

### 시나리오 4: FilterBar와 버튼 간격 조정

```jsx
/* FilterBar.jsx */
className = 'absolute top-2 ...';

/* CurrentLocationButton.jsx */
className = 'absolute top-16 ...'; // FilterBar height + gap
```

---

## ⚠️ 주의사항

1. **일관성 유지**: 같은 값을 여러 곳에서 사용할 때는 CSS 변수 활용
2. **반응형 고려**: `window.innerHeight` 같은 동적 값 사용 권장
3. **z-index 순서**:
    - 지도: `z-0`
    - FilterBar, CurrentLocationButton: `z-10`
    - BottomSheet: `z-20`
    - Toast: `z-50`
4. **Tailwind 클래스**: 숫자는 4px 단위 (`top-4` = 16px, `top-16` = 64px)
5. **드래그 성능**: BottomSheet 높이 변경 시 transition 고려

---

## 🔗 관련 파일

-   `src/index.css` - 전역 CSS 변수
-   `src/components/screens/MapScreen.jsx` - 지도 화면 레이아웃
-   `src/components/map/BottomSheet.jsx` - 드래그 가능한 하단 시트
-   `src/components/map/FilterBar.jsx` - 필터 버튼 그룹
-   `src/components/map/CurrentLocationButton.jsx` - 현재 위치 버튼
-   `src/components/common/BottomNavigation.jsx` - 하단 네비게이션 바
-   `src/components/screens/HomeScreen.jsx` - 홈 화면

---

**마지막 업데이트:** 2025년 10월 29일
