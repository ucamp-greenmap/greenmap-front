import { useEffect, useRef, useCallback, useState } from 'react';
import { createMarkerImage } from '../util/mapHelpers';

/**
 * Custom hook for managing map markers
 */
export const useMarkers = (
    mapInstance,
    mapLoaded,
    facilities,
    currentInfoWindowRef,
    selectedFilter,
    bookmarkedIds
) => {
    const markersRef = useRef([]);
    const markerImageCacheRef = useRef({}); // MarkerImage 캐시
    const _isMountedRef = useRef(true); // 마운트 상태 추적 (언더스코어로 unused 허용)
    const _abortControllerRef = useRef(null); // 마커 생성 중단용 (언더스코어로 unused 허용)

    // 현재 화면에 표시되는 시설 목록 (BottomSheet용)
    const [visibleFacilities, setVisibleFacilities] = useState([]);

    // 현재 지도 영역에 마커가 포함되는지 확인
    const isMarkerInBounds = useCallback((marker, bounds) => {
        if (!bounds || !marker) return false;
        const position = marker.getPosition();
        return bounds.contain(position);
    }, []);

    // MarkerImage 캐싱 - 카테고리별로 한 번만 생성
    const getMarkerImage = useCallback((category) => {
        if (!window.kakao) return null;

        if (!markerImageCacheRef.current[category]) {
            markerImageCacheRef.current[category] = createMarkerImage(
                window.kakao,
                category
            );
        }

        return markerImageCacheRef.current[category];
    }, []);

    // 지도 이동/줌 이벤트 시 마커 표시 업데이트 - 필터 적용
    const updateVisibleMarkers = useCallback(() => {
        if (!mapInstance || !window.kakao) return;

        const bounds = mapInstance.getBounds();
        const currentLevel = mapInstance.getLevel(); // 현재 줌 레벨 가져오기
        const bookmarkSet = new Set(bookmarkedIds || []);

        // 줌 레벨 6 이하(더 확대)일 때만 마커 표시
        const shouldShowMarkers = currentLevel <= 5;

        // 현재 화면에 표시되는 시설들을 추적
        const currentlyVisible = [];

        markersRef.current.forEach(({ id, category, marker, data }) => {
            const isVisible = isMarkerInBounds(marker, bounds);

            // 필터 조건 확인
            const shouldShow =
                selectedFilter === 'all'
                    ? true
                    : selectedFilter === 'bookmark'
                    ? bookmarkSet.has(id)
                    : category === selectedFilter;

            // 줌 레벨, 필터 조건, 영역 모두 만족해야 표시
            if (shouldShowMarkers && isVisible && shouldShow) {
                marker.setMap(mapInstance);
                currentlyVisible.push(data); // 표시되는 시설 데이터 추가
            } else {
                marker.setMap(null);
            }
        });

        // BottomSheet에 표시할 시설 목록 업데이트
        setVisibleFacilities(currentlyVisible);
    }, [mapInstance, isMarkerInBounds, selectedFilter, bookmarkedIds]);

    // Create/update markers based on facilities
    useEffect(() => {
        if (!mapInstance || !window.kakao || !window.kakao.maps) return;

        // 이전 마커 생성 중단
        if (_abortControllerRef.current) {
            _abortControllerRef.current.abort();
        }

        // 새로운 AbortController 생성
        const abortController = new AbortController();
        _abortControllerRef.current = abortController;

        // 대용량 데이터는 비동기로 처리하여 UI 블로킹 방지
        const createMarkers = async () => {
            try {
                // Clear existing markers
                markersRef.current.forEach((m) => {
                    if (m.marker) m.marker.setMap(null);
                    if (m.infowindow) m.infowindow.close();
                });

                const newMarkers = [];
                const chunkSize = 200; // 100개 → 200개로 증가 (초기 로딩 시간 단축, 여전히 빠른 중단 가능)

                for (let i = 0; i < facilities.length; i += chunkSize) {
                    // 중단 신호 확인
                    if (abortController.signal.aborted) {
                        return;
                    }

                    const chunk = facilities.slice(i, i + chunkSize);

                    const chunkMarkers = chunk.map((f) => {
                        const position = new window.kakao.maps.LatLng(
                            f.lat,
                            f.lng
                        );
                        const markerImage = getMarkerImage(f.category); // 캐시된 이미지 사용
                        const marker = new window.kakao.maps.Marker({
                            position,
                            image: markerImage,
                        });

                        const infoContent = `<div style="padding:8px"><strong>${f.name}</strong><div style="font-size:12px;color:#666">${f.category}</div></div>`;
                        const infowindow = new window.kakao.maps.InfoWindow({
                            content: infoContent,
                        });

                        window.kakao.maps.event.addListener(
                            marker,
                            'click',
                            () => {
                                if (currentInfoWindowRef.current) {
                                    currentInfoWindowRef.current.close();
                                }
                                infowindow.open(mapInstance, marker);
                                currentInfoWindowRef.current = infowindow;
                            }
                        );

                        return {
                            id: f.id,
                            category: f.category, // 카테고리 직접 저장
                            marker,
                            infowindow,
                            data: f,
                        };
                    });

                    newMarkers.push(...chunkMarkers);

                    // UI 블로킹 방지를 위한 짧은 대기
                    if (i + chunkSize < facilities.length) {
                        await new Promise((resolve) => setTimeout(resolve, 0));
                    }
                }

                // 중단되지 않았을 때만 마커 업데이트
                if (!abortController.signal.aborted) {
                    markersRef.current = newMarkers;
                    updateVisibleMarkers();
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('❌ [useMarkers] 마커 생성 오류:', error);
                }
            }
        };

        createMarkers();

        // cleanup: 의존성 변경 시 진행 중인 작업 중단
        return () => {
            if (_abortControllerRef.current) {
                _abortControllerRef.current.abort();
            }
        };
    }, [
        mapLoaded,
        facilities,
        mapInstance,
        currentInfoWindowRef,
        updateVisibleMarkers,
        getMarkerImage,
    ]);

    // 지도 이동/줌 이벤트 리스너 등록
    useEffect(() => {
        if (!mapInstance || !window.kakao || !window.kakao.maps) return;

        // 지도가 움직일 때마다 마커 업데이트
        const idleListener = window.kakao.maps.event.addListener(
            mapInstance,
            'idle',
            updateVisibleMarkers
        );

        return () => {
            if (
                idleListener &&
                window.kakao &&
                window.kakao.maps &&
                window.kakao.maps.event
            ) {
                try {
                    window.kakao.maps.event.removeListener(idleListener);
                } catch (error) {
                    console.warn(
                        '[Markers] Failed to remove idle listener:',
                        error
                    );
                }
            }
        };
    }, [mapInstance, updateVisibleMarkers]);

    // Cleanup markers on unmount - 최소한의 작업만 수행
    useEffect(() => {
        _isMountedRef.current = true;

        return () => {
            // 마운트 상태 업데이트
            _isMountedRef.current = false;

            // 진행 중인 마커 생성 즉시 중단
            if (_abortControllerRef.current) {
                _abortControllerRef.current.abort();
                _abortControllerRef.current = null;
            }

            // 마커 제거를 requestIdleCallback으로 지연시켜 페이지 전환 속도 향상
            const markers = markersRef.current;
            markersRef.current = [];

            // 백그라운드에서 정리 (페이지 전환을 블로킹하지 않음)
            if (markers.length > 0 && window.requestIdleCallback) {
                window.requestIdleCallback(() => {
                    markers.forEach((m) => {
                        if (m.marker) m.marker.setMap(null);
                        if (m.infowindow) m.infowindow.close();
                    });
                });
            } else if (markers.length > 0) {
                // requestIdleCallback이 없으면 setTimeout으로 지연
                setTimeout(() => {
                    markers.forEach((m) => {
                        if (m.marker) m.marker.setMap(null);
                        if (m.infowindow) m.infowindow.close();
                    });
                }, 0);
            }
        };
    }, []);

    return { markersRef, updateVisibleMarkers, visibleFacilities };
};
