'use client'

import React, { useRef } from 'react';

interface TouchpadProps {
    id: number;
    onPointerDown: (e: React.MouseEvent | React.TouchEvent, id: number) => void;
    left: number;
    top: number;
}

const Touchpad: React.FC<TouchpadProps> = ({ id, onPointerDown, left, top }) => {
    const touchpadRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={touchpadRef}
            onMouseDown={(e) => onPointerDown(e, id)}
            onTouchStart={(e) => onPointerDown(e, id)}
            className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-lg cursor-pointer relative"
        >
            <div
                style={{
                    position: 'absolute',
                    left: `${left + 50}%`,
                    top: `${50 - top}%`,
                    transform: 'translate(-50%, -50%)',
                }}
                className="w-4 h-4 bg-primary rounded-full"
            />
        </div>
    );
};

export default Touchpad;
