import React, { useRef, useState } from 'react';

export default function BottomSheet({ children }) {
    const sheetRef = useRef(null);
    
    /**
     * 📏 BottomSheet 높이 상태
     * 
     * 초기값: 80px (접힌 상태)
     * 
     * 🔧 조정 방법:
     * - 접힌 상태 높이 변경: useState(80) → 다른 값
     *   예: useState(100), useState(120)
     * - 이 값을 변경하면 아래 Math.max()와 setSheetHeight()도 같이 수정 필요
     */
    const [sheetHeight, setSheetHeight] = useState(80);
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);

    const startDrag = (e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        startYRef.current = e.clientY;
        startHeightRef.current = sheetRef.current.clientHeight;

        const onPointerMove = (moveEvent) => {
            if (!isDraggingRef.current) return;
            const dy = startYRef.current - moveEvent.clientY;
            
            /**
             * 🎚️ 드래그 중 높이 제한
             * 
             * Math.min(window.innerHeight * 0.9, ...): 최대 높이 (화면의 90%)
             * Math.max(80, ...): 최소 높이 (80px)
             * 
             * 🔧 조정 방법:
             * - 최대 높이 변경: 0.9 → 다른 비율 (예: 0.8, 0.95)
             * - 최소 높이 변경: 80 → 다른 값 (예: 100, 60)
             *   ⚠️ useState 초기값과 일치시켜야 함
             */
            let newHeight = Math.min(
                window.innerHeight * 0.9,
                Math.max(80, startHeightRef.current + dy)
            );
            setSheetHeight(newHeight);
        };

        const onPointerUp = () => {
            isDraggingRef.current = false;
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);

            const currentHeight = sheetRef.current.clientHeight;
            
            /**
             * 📊 스냅 포인트 (Snap Points) 설정
             * 
             * threshold: window.innerHeight * 0.25 (화면의 25%)
             * - 이 높이보다 높으면 펼쳐진 상태(60%)로 스냅
             * - 이 높이보다 낮으면 접힌 상태(80px)로 스냅
             * 
             * 🔧 조정 방법:
             * 
             * 1. threshold 변경:
             *    0.25 → 다른 비율 (예: 0.3, 0.2)
             *    - 값을 높이면: 더 많이 올려야 펼쳐짐
             *    - 값을 낮추면: 조금만 올려도 펼쳐짐
             * 
             * 2. 펼친 상태 높이 변경:
             *    window.innerHeight * 0.6 → 다른 비율
             *    예: 0.5 (화면의 50%), 0.7 (화면의 70%)
             * 
             * 3. 접힌 상태 높이 변경:
             *    80 → 다른 값 (useState 초기값과 일치)
             * 
             * 4. 3단계 스냅 포인트 추가:
             *    if (currentHeight > window.innerHeight * 0.5) {
             *        setSheetHeight(window.innerHeight * 0.8);  // 최대
             *    } else if (currentHeight > window.innerHeight * 0.2) {
             *        setSheetHeight(window.innerHeight * 0.4);  // 중간
             *    } else {
             *        setSheetHeight(80);  // 최소
             *    }
             */
            const threshold = window.innerHeight * 0.25;
            if (currentHeight > threshold) {
                setSheetHeight(window.innerHeight * 0.6);
            } else {
                setSheetHeight(80);
            }
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    return (
        /**
         * 🎭 BottomSheet 위치 및 크기 설정
         * 
         * bottom: 0
         * - MapScreen의 하단(0px)에 배치
         * - MapScreen이 이미 BottomNavigation 공간을 확보했으므로 bottom: 0 사용
         * - 이전에는 bottom: var(--bottom-nav-inset)를 사용했지만,
         *   MapScreen 높이가 조정되면서 더 이상 필요 없음
         * 
         * height: ${sheetHeight}px
         * - 드래그에 따라 동적으로 변경되는 높이
         * - 접힌 상태: 80px (시설 목록 보기)
         * - 펼친 상태: window.innerHeight * 0.6 (화면의 60%)
         * 
         * 조정 방법:
         * - 접힌 높이 변경: setSheetHeight(80) → 다른 값으로 변경 (예: 100, 120)
         * - 펼친 높이 변경: window.innerHeight * 0.6 → 다른 비율로 변경 (예: 0.5, 0.7)
         * 
         * absolute left-0 right-0: 화면 좌우 끝까지 확장
         * rounded-t-2xl: 상단 모서리만 둥글게
         * z-20: FilterBar(z-10)와 지도(z-0) 위에 표시
         */
        <div
            ref={sheetRef}
            className='absolute left-0 right-0 bg-white rounded-t-2xl shadow-2xl overflow-hidden z-20'
            style={{
                height: `${sheetHeight}px`,
                transition: isDraggingRef.current
                    ? 'none'
                    : 'height 200ms ease-out',
                bottom: 0,
            }}
            role='region'
            aria-label='시설 목록 패널'
            aria-expanded={
                typeof window !== 'undefined'
                    ? sheetHeight > window.innerHeight * 0.25
                    : sheetHeight > 200
            }
        >
            <div
                className='h-10 flex items-center justify-center'
                style={{ touchAction: 'none' }}
            >
                <button
                    className='cursor-grab w-full h-full flex items-center justify-center bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500'
                    onPointerDown={startDrag}
                    onKeyDown={(e) => {
                        const expanded =
                            typeof window !== 'undefined'
                                ? sheetHeight > window.innerHeight * 0.25
                                : sheetHeight > 200;
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (expanded) {
                                setSheetHeight(80);
                            } else {
                                setSheetHeight(window.innerHeight * 0.6);
                            }
                        }
                        if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setSheetHeight(window.innerHeight * 0.6);
                        }
                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setSheetHeight(80);
                        }
                    }}
                    aria-label='시설 목록 열기/닫기'
                    aria-expanded={
                        typeof window !== 'undefined'
                            ? sheetHeight > window.innerHeight * 0.25
                            : sheetHeight > 200
                    }
                >
                    <div className='w-12 h-1.5 bg-gray-300 rounded-full' />
                </button>
            </div>
            <div
                className='px-4 overflow-auto'
                style={{ height: `calc(${sheetHeight}px - 40px)` }}
            >
                {children}
            </div>
        </div>
    );
}
