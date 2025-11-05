import { useRef, useEffect, useCallback } from 'react';

const PINCH_SENSITIVITY = 3.0;
const SCROLL_SENSITIVITY = 0.2;
const TRACKPAD_SENSITIVITY_MULTIPLIER = 1.0; // Extra sensitivity for touchpad pinches

interface PinchZoomOptions {
  onZoom: (delta: number) => void;
  containerRef: React.RefObject<HTMLElement>;
}

export const usePinchToZoom = (options: PinchZoomOptions) => {
  const { onZoom, containerRef } = options;
  const pointers = useRef<PointerEvent[]>([]).current;
  const lastDistance = useRef<number | null>(null);

  const getDistance = (p1: PointerEvent, p2: PointerEvent) => {
    const dx = p1.clientX - p2.clientX;
    const dy = p1.clientY - p2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handlePointerDown = useCallback((e: PointerEvent) => {
    e.preventDefault();
    pointers.push(e);
  }, [pointers]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    e.preventDefault();
    const index = pointers.findIndex(p => p.pointerId === e.pointerId);
    if (index > -1) {
      pointers[index] = e;
    }

    if (pointers.length === 2) {
      const distance = getDistance(pointers[0], pointers[1]);
      if (lastDistance.current !== null) {
        const delta = distance - lastDistance.current;
        onZoom(delta * PINCH_SENSITIVITY);
      }
      lastDistance.current = distance;
    }
  }, [pointers, onZoom]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    e.preventDefault();
    const index = pointers.findIndex(p => p.pointerId === e.pointerId);
    if (index > -1) {
      pointers.splice(index, 1);
    }

    if (pointers.length < 2) {
      lastDistance.current = null;
    }
  }, [pointers]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    let delta = -e.deltaY * SCROLL_SENSITIVITY;
    // Check for small delta values, typical of trackpad pinch gestures
    if (Math.abs(e.deltaY) < 10) {
      delta *= TRACKPAD_SENSITIVITY_MULTIPLIER;
    }
    onZoom(delta);
  }, [onZoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('pointerdown', handlePointerDown);
      container.addEventListener('pointermove', handlePointerMove);
      container.addEventListener('pointerup', handlePointerUp);
      container.addEventListener('pointercancel', handlePointerUp);
      container.addEventListener('wheel', handleWheel);

      return () => {
        container.removeEventListener('pointerdown', handlePointerDown);
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('pointerup', handlePointerUp);
        container.removeEventListener('pointercancel', handlePointerUp);
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [containerRef, handlePointerDown, handlePointerMove, handlePointerUp, handleWheel]);
};
