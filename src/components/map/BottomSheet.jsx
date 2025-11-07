import React, {
    useRef,
    useState,
    useImperativeHandle,
    forwardRef,
} from 'react';
import { motion } from 'framer-motion';

const BottomSheet = forwardRef(({ children }, ref) => {
    const sheetRef = useRef(null);
    const [sheetHeight, setSheetHeight] = useState(80);
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);

    // 부모 컴포넌트에서 높이를 제어할 수 있도록 함수 노출
    useImperativeHandle(ref, () => ({
        expand: () => {
            setSheetHeight(window.innerHeight * 0.6);
        },
        collapse: () => {
            setSheetHeight(80);
        },
        setHeight: (height) => {
            setSheetHeight(height);
        },
    }));

    const startDrag = (e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        startYRef.current = e.clientY;
        startHeightRef.current = sheetRef.current.clientHeight;

        const onPointerMove = (moveEvent) => {
            if (!isDraggingRef.current) return;
            const dy = startYRef.current - moveEvent.clientY;
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
        <motion.div
            ref={sheetRef}
            className='absolute left-0 right-0 bg-white rounded-t-2xl shadow-2xl overflow-hidden z-20'
            initial={{ y: 0 }}
            animate={{ height: sheetHeight }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
            }}
            style={{
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
        </motion.div>
    );
});

BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;
