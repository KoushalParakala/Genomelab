import React, { useEffect, useRef } from 'react';

export const HelixCursor: React.FC = () => {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.left = e.clientX + 'px';
                cursorRef.current.style.top  = e.clientY + 'px';
            }
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    return (
        <div
            ref={cursorRef}
            style={{
                position: 'fixed',
                width: 12,
                height: 12,
                border: '1px solid var(--secondary)',
                pointerEvents: 'none',
                zIndex: 99999,
                transform: 'translate(-50%, -50%)',
                mixBlendMode: 'difference',
                top: -100,
                left: -100,
            }}
        />
    );
};
