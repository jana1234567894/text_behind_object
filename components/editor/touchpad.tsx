'use client'

import React, { useRef, useState } from 'react';
import { Button } from '../ui/button';

interface TouchpadProps {
    id: number;
    // called continuously during pointer moves with left/top offsets (same units as sliders: -50..50)
    onChangePosition: (left: number, top: number) => void;
    left: number;
    top: number;
    onNudge: (direction: 'up' | 'down' | 'left' | 'right') => void;
    onReset: () => void;
    isGridEnabled?: boolean;
    gridSize?: number;
}

const Touchpad: React.FC<TouchpadProps> = ({ id, onChangePosition, left, top, onNudge, onReset, isGridEnabled = false, gridSize = 20 }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef(false);
    const activePointerRef = useRef<number | null>(null);
    const [knobPos, setKnobPos] = useState({ xPct: left + 50, yPct: 50 - top });

    // sync external position
    React.useEffect(() => {
        setKnobPos({ xPct: left + 50, yPct: 50 - top });
    }, [left, top]);

    const updateFromPointer = (clientX: number, clientY: number) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // compute local pixel position inside pad
        const localX = clientX - rect.left;
        const localY = clientY - rect.top;

        let finalX = localX;
        let finalY = localY;

        if (isGridEnabled && gridSize > 0) {
            // snap to grid pixels
            finalX = Math.round(localX / gridSize) * gridSize;
            finalY = Math.round(localY / gridSize) * gridSize;
        }

        const xPct = (finalX / rect.width) * 100;
        const yPct = (finalY / rect.height) * 100;
        const clampedX = Math.max(0, Math.min(100, xPct));
        const clampedY = Math.max(0, Math.min(100, yPct));
        setKnobPos({ xPct: clampedX, yPct: clampedY });

        // convert to same units as existing sliders/handlers: left in (-50..50), top in (-50..50)
        const leftOffset = (clampedX / 100 - 0.5) * 100;
        const topOffset = (0.5 - clampedY / 100) * 100;
        try { onChangePosition(leftOffset, topOffset); } catch (e) {}
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        const el = ref.current;
        if (!el) return;
        e.preventDefault();
        draggingRef.current = true;
        activePointerRef.current = e.pointerId;
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
        updateFromPointer(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggingRef.current) return;
        if (activePointerRef.current !== null && e.pointerId !== activePointerRef.current) return;
        e.preventDefault();
        const el = ref.current;
        if (!el) return;
        updateFromPointer(e.clientX, e.clientY);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        draggingRef.current = false;
        try { e.currentTarget.releasePointerCapture && e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
        activePointerRef.current = null;
    };

    const knobLeft = `${knobPos.xPct}%`;
    const knobTop = `${knobPos.yPct}%`;

    return (
        <div className="flex flex-col items-center">
            <div
                ref={ref}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-lg cursor-grab relative"
                style={{
                    touchAction: 'none',
                    backgroundImage: isGridEnabled ? `linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)` : undefined,
                    backgroundSize: isGridEnabled ? `${gridSize}px ${gridSize}px` : undefined
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        left: knobLeft,
                        top: knobTop,
                        transform: 'translate(-50%, -50%)',
                        transition: draggingRef.current ? 'none' : 'all 120ms ease-out'
                    }}
                    className="w-5 h-5 bg-primary rounded-full shadow-md shadow-primary/30 pointer-events-auto"
                />
            </div>

            <div className="flex flex-col items-center gap-2 mt-3">
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onNudge('up')} aria-label="Nudge Up">↑</Button>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onNudge('left')} aria-label="Nudge Left">←</Button>
                    <Button size="sm" variant="outline" onClick={() => onReset()} aria-label="Reset Center">Reset</Button>
                    <Button size="sm" variant="outline" onClick={() => onNudge('right')} aria-label="Nudge Right">→</Button>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onNudge('down')} aria-label="Nudge Down">↓</Button>
                </div>
            </div>
        </div>
    );
};

export default Touchpad;
