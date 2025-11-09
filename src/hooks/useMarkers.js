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
    bookmarkedIds,
    onMarkerClick // 마커 클릭 콜백 추가
) => {
    const markersRef = useRef([]);
    const markerImageCacheRef = useRef({}); // MarkerImage 캐시
    const selectedMarkerIdRef = useRef(null); // 선택된 마커 ID 추적
    const _isMountedRef = useRef(true); // 마운트 상태 추적 (언더스코어로 unused 허용)
    const _abortControllerRef = useRef(null); // 마커 생성 중단용 (언더스코어로 unused 허용)
    const isCreatingMarkersRef = useRef(false); // 마커 생성 중인지 추적

    // 현재 화면에 표시되는 시설 목록 (BottomSheet용)
    const [visibleFacilities, setVisibleFacilities] = useState([]);

    // 현재 지도 영역에 마커가 포함되는지 확인
    const isMarkerInBounds = useCallback((marker, bounds) => {
        if (!bounds || !marker) return false;
        const position = marker.getPosition();
        return bounds.contain(position);
    }, []);

    // MarkerImage 캐싱 - 카테고리별로 한 번만 생성
    const getMarkerImage = useCallback((category, isSelected = false) => {
        if (!window.kakao) return null;

        const cacheKey = `${category}-${isSelected ? 'selected' : 'normal'}`;

        if (!markerImageCacheRef.current[cacheKey]) {
            markerImageCacheRef.current[cacheKey] = createMarkerImage(
                window.kakao,
                category,
                isSelected
            );
        }

        return markerImageCacheRef.current[cacheKey];
    }, []);

    // 선택된 마커 업데이트 (애니메이션 효과)
    const updateSelectedMarker = useCallback(
        (facilityId) => {
            if (!window.kakao) return;

            // 이전 선택된 마커를 일반 상태로 되돌림
            if (selectedMarkerIdRef.current) {
                const prevSelected = markersRef.current.find(
                    (m) => m.id === selectedMarkerIdRef.current
                );
                if (prevSelected) {
                    const normalImage = getMarkerImage(
                        prevSelected.category,
                        false
                    );
                    prevSelected.marker.setImage(normalImage);
                    prevSelected.marker.setZIndex(1);
                }
            }

            // 새로 선택된 마커를 선택 상태로 변경
            const newSelected = markersRef.current.find(
                (m) => m.id === facilityId
            );
            if (newSelected) {
                const selectedImage = getMarkerImage(
                    newSelected.category,
                    true
                );
                newSelected.marker.setImage(selectedImage);
                newSelected.marker.setZIndex(100); // 맨 앞에 표시
            }

            selectedMarkerIdRef.current = facilityId;
        },
        [getMarkerImage]
    );

    // 마커의 현재 표시 상태 추적 (깜빡임 방지)
    const markerVisibilityRef = useRef(new Map());

    // 업데이트 배치 처리 (깜빡임 방지)
    const updateScheduleRef = useRef(null);

    // bookmarkedIds를 ref로 관리하여 함수 재생성 방지
    const bookmarkedIdsRef = useRef(bookmarkedIds || []);
    useEffect(() => {
        bookmarkedIdsRef.current = bookmarkedIds || [];
    }, [bookmarkedIds]);

    // 지도 이동/줌 이벤트 시 마커 표시 업데이트 - 필터 적용
    const updateVisibleMarkers = useCallback(
        (immediate = false) => {
            if (!mapInstance || !window.kakao) return;

            const performUpdate = () => {
                const bounds = mapInstance.getBounds();
                const currentLevel = mapInstance.getLevel();
                // ref에서 최신 bookmarkedIds 가져오기 (함수 재생성 방지)
                const bookmarkSet = new Set(bookmarkedIdsRef.current || []);

                // 줌 레벨 6 이하(더 확대)일 때만 마커 표시
                const shouldShowMarkers = currentLevel <= 6;

                // 현재 화면에 표시되는 시설들을 추적
                const currentlyVisible = [];

                // 변경할 마커들을 수집 (배치 처리)
                const markersToShow = [];
                const markersToHide = [];

                // 각 마커의 표시 여부를 결정
                markersRef.current.forEach(({ id, category, marker, data }) => {
                    const isVisible = isMarkerInBounds(marker, bounds);

                    // 필터 조건 확인
                    const shouldShow =
                        selectedFilter === 'all'
                            ? true
                            : selectedFilter === 'bookmark'
                            ? bookmarkSet.has(id)
                            : category === selectedFilter;

                    // 최종 표시 여부 결정
                    const shouldDisplay =
                        shouldShowMarkers && isVisible && shouldShow;

                    // 이전 표시 상태와 비교
                    const prevVisibility = markerVisibilityRef.current.get(id);
                    const markerCurrentMap = marker.getMap();

                    // 상태가 변경된 경우에만 마커 업데이트 (깜빡임 방지)
                    if (prevVisibility !== shouldDisplay) {
                        if (shouldDisplay) {
                            // 표시해야 하는 경우
                            if (!markerCurrentMap) {
                                markersToShow.push(marker);
                            }
                        } else {
                            // 숨겨야 하는 경우
                            if (markerCurrentMap) {
                                markersToHide.push(marker);
                            }
                        }
                        // 상태 업데이트
                        markerVisibilityRef.current.set(id, shouldDisplay);
                    } else if (shouldDisplay && !markerCurrentMap) {
                        // 상태는 같지만 실제로 지도에 없는 경우 (초기 로드 등)
                        markersToShow.push(marker);
                        markerVisibilityRef.current.set(id, true);
                    }

                    // BottomSheet용 시설 목록에 추가
                    if (shouldDisplay && isVisible) {
                        currentlyVisible.push(data);
                    }
                });

                // 배치로 마커 업데이트 (한 번에 처리하여 깜빡임 최소화)
                markersToHide.forEach((marker) => marker.setMap(null));
                markersToShow.forEach((marker) => marker.setMap(mapInstance));

                // BottomSheet에 표시할 시설 목록 업데이트
                setVisibleFacilities(currentlyVisible);
            };

            // 즉시 실행이거나 requestAnimationFrame이 없으면 바로 실행
            if (
                immediate ||
                typeof window.requestAnimationFrame === 'undefined'
            ) {
                performUpdate();
            } else {
                // 다음 프레임에 실행하여 깜빡임 최소화
                if (updateScheduleRef.current) {
                    cancelAnimationFrame(updateScheduleRef.current);
                }
                updateScheduleRef.current =
                    requestAnimationFrame(performUpdate);
            }
        },
        [mapInstance, isMarkerInBounds, selectedFilter]
        // bookmarkedIds는 ref로 관리하므로 의존성에서 제외 (함수 재생성 방지)
    );

    // Create/update markers based on facilities
    useEffect(() => {
        if (!mapInstance || !window.kakao || !window.kakao.maps) return;

        isCreatingMarkersRef.current = true;

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
                });

                // 마커 재생성 시 visibility 상태 초기화
                markerVisibilityRef.current.clear();

                const newMarkers = [];
                const chunkSize = 200;

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
                        const markerImage = getMarkerImage(f.category);
                        const marker = new window.kakao.maps.Marker({
                            position,
                            image: markerImage,
                        });

                        // 마커 클릭 이벤트: InfoWindow 대신 콜백 호출
                        window.kakao.maps.event.addListener(
                            marker,
                            'click',
                            () => {
                                if (onMarkerClick) {
                                    updateSelectedMarker(f.id);
                                    onMarkerClick(f);
                                }
                            }
                        );

                        return {
                            id: f.id,
                            category: f.category,
                            marker,
                            infowindow: null, // InfoWindow 더 이상 사용 안 함
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
                    isCreatingMarkersRef.current = false;
                    // 마커 생성 후 즉시 업데이트 (다음 프레임에)
                    updateVisibleMarkers(false);
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('[useMarkers] 마커 생성 오류:', error);
                }
                isCreatingMarkersRef.current = false;
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
        onMarkerClick,
        updateSelectedMarker,
    ]);

    // 지도 이동/줌 이벤트 리스너 등록
    useEffect(() => {
        if (!mapInstance || !window.kakao || !window.kakao.maps) return;

        // 지도가 움직일 때마다 마커 업데이트 (즉시 실행)
        const handleIdle = () => updateVisibleMarkers(true);
        const idleListener = window.kakao.maps.event.addListener(
            mapInstance,
            'idle',
            handleIdle
        );

        return () => {
            // 스케줄된 업데이트 취소
            if (updateScheduleRef.current) {
                cancelAnimationFrame(updateScheduleRef.current);
                updateScheduleRef.current = null;
            }

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

    // 필터 변경 시 마커 업데이트 (즉시 실행)
    useEffect(() => {
        // 마커가 생성 중이거나 아직 생성되지 않았으면 스킵
        if (
            isCreatingMarkersRef.current ||
            !mapInstance ||
            markersRef.current.length === 0
        ) {
            return;
        }
        // 필터 변경은 즉시 반영
        updateVisibleMarkers(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFilter]);

    // 북마크 변경 시 마커 업데이트 (북마크 필터일 때만, 그리고 실제 변경이 있을 때만)
    const prevBookmarkedIdsRef = useRef(bookmarkedIds || []);
    useEffect(() => {
        // 마커가 생성 중이거나 아직 생성되지 않았으면 스킵
        if (
            isCreatingMarkersRef.current ||
            !mapInstance ||
            markersRef.current.length === 0
        ) {
            prevBookmarkedIdsRef.current = bookmarkedIds || [];
            return;
        }

        // 북마크 필터가 활성화된 경우에만 업데이트
        if (selectedFilter === 'bookmark') {
            // 이전 북마크 목록과 비교하여 실제로 변경된 마커만 업데이트
            const prevSet = new Set(prevBookmarkedIdsRef.current);
            const currentSet = new Set(bookmarkedIds || []);

            // 변경 사항이 있는지 확인
            const hasChanges =
                prevBookmarkedIdsRef.current.length !==
                    (bookmarkedIds || []).length ||
                [...prevSet].some((id) => !currentSet.has(id)) ||
                [...currentSet].some((id) => !prevSet.has(id));

            if (hasChanges) {
                // 배치 처리로 깜빡임 최소화 (약간의 지연으로 DOM 업데이트와 분리)
                setTimeout(() => {
                    updateVisibleMarkers(false);
                }, 0);
            }
        }

        // 이전 상태 업데이트
        prevBookmarkedIdsRef.current = bookmarkedIds || [];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookmarkedIds, selectedFilter]);

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
                    });
                });
            } else if (markers.length > 0) {
                // requestIdleCallback이 없으면 setTimeout으로 지연
                setTimeout(() => {
                    markers.forEach((m) => {
                        if (m.marker) m.marker.setMap(null);
                    });
                }, 0);
            }
        };
    }, []);

    return {
        markersRef,
        updateVisibleMarkers,
        visibleFacilities,
        updateSelectedMarker,
    };
};
