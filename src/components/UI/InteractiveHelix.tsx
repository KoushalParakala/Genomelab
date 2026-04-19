import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useDNAStore } from '../../store/useDNAStore';

/**
 * Interactive DNA Helix
 * =====================
 * A high-fidelity 2-strand DNA visualization using 2D Canvas.
 * Features:
 * - Z-Sorting for depth realism
 * - LERP-based rotation and tilt physics
 * - Watson-Crick base-pairing visual logic (A-T: 2 bonds, G-C: 3 bonds)
 * - Click-to-Mutate with spatial wave propagation
 * - Scroll-based perspective shifting
 */

const BASE_COLORS: Record<string, string> = {
    'A': '#fbbf24', // Amber
    'T': '#f87171', // Red
    'G': '#3b82f6', // Blue
    'C': '#2563eb'  // Strong Blue
};

interface Node {
    strand: number;
    pairIdx: number;
    x: number;
    y: number;
    z: number;
    angle: number;
    base: string;
    pulse: number;
    isMutated: boolean;
    expansion: number;
}

interface Rung {
    pairIdx: number;
    z: number;
}

export const InteractiveHelix: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { helix, selectBase } = useDNAStore();
    
    // Physics & State refs
    const rotationRef = useRef(0);
    const tiltRef = useRef(0);
    const targetTiltRef = useRef(0);
    const mousePosRef = useRef({ x: 0, y: 0 });
    const scrollRef = useRef(0);
    const lastTimeRef = useRef(0);
    const rafRef = useRef(0);
    
    // Animation states
    const [mutationPropagation, setMutationPropagation] = useState<{ center: number; intensity: number } | null>(null);

    // Sync with sequence
    const nodeSequence = useMemo(() => {
        return helix.map(bp => ({ 
            s1: bp.type[0], 
            s2: bp.type[1], 
            id: bp.id,
            conservation: Math.random() // Placeholder for real conservation
        }));
    }, [helix]);

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && containerRef.current) {
                canvasRef.current.width = containerRef.current.offsetWidth;
                canvasRef.current.height = containerRef.current.offsetHeight;
            }
        };
        
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            
            // Tilt logic: left/right relative to center
            const centerX = rect.width / 2;
            const tiltTarget = ((mousePosRef.current.x - centerX) / centerX) * 12; // max 12 deg
            targetTiltRef.current = tiltTarget * (Math.PI / 180);
        };

        const handleScroll = () => {
            const scrollPercent = window.scrollY / (Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
            scrollRef.current = scrollPercent;
        };

        const handleCanvasClick = (e: MouseEvent) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const h = canvasRef.current.height;
            
            const pairIdx = Math.floor((y / h) * 50);
            const bp = helix[pairIdx % helix.length];
            if (bp) {
                selectBase(bp.id);
                setMutationPropagation({ center: pairIdx, intensity: 1 });
                setTimeout(() => setMutationPropagation(null), 700);
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);
        canvasRef.current?.addEventListener('click', handleCanvasClick);
        handleResize();

        const render = (time: number) => {
            const ctx = canvasRef.current?.getContext('2d');
            if (!ctx || !canvasRef.current) return;

            const dt = (time - lastTimeRef.current) / 16.67;
            lastTimeRef.current = time;

            // Physics lerp
            rotationRef.current += 0.004 * dt; // constant spin
            tiltRef.current += (targetTiltRef.current - tiltRef.current) * 0.03 * dt;
            
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;
            const cx = w / 2;
            const cy = h / 2;
            
            // Amplitude scales with scroll (Perspective)
            const baseAmp = 80;
            const scrollAmpOffset = (1 - Math.abs(scrollRef.current - 0.6)) * 40;
            const amplitude = baseAmp - scrollAmpOffset;
            
            ctx.clearRect(0, 0, w, h);

            // Generate Nodes
            const nodes: Node[] = [];
            const rungs: Rung[] = [];
            const rowCount = 50;
            const yGap = h / rowCount;

            for (let i = 0; i < rowCount; i++) {
                const yPos = i * yGap + (yGap/2);
                const angle = rotationRef.current + (i * 0.4);
                
                // Strand 1 (offset 0)
                const z1 = Math.sin(angle);
                const x1 = cx + (amplitude * Math.cos(angle)) + (tiltRef.current * (yPos - cy));
                
                // Strand 2 (offset PI)
                const z2 = Math.sin(angle + Math.PI);
                const x2 = cx + (amplitude * Math.cos(angle + Math.PI)) + (tiltRef.current * (yPos - cy));

                const sequenceIdx = i % nodeSequence.length;
                const baseInfo = nodeSequence[sequenceIdx];

                nodes.push({
                    strand: 1, pairIdx: i, x: x1, y: yPos, z: z1, angle,
                    base: baseInfo.s1, pulse: Math.sin(time * 0.002 + i), isMutated: false,
                    expansion: 0
                });
                nodes.push({
                    strand: 2, pairIdx: i, x: x2, y: yPos, z: z2, angle: angle + Math.PI,
                    base: baseInfo.s2, pulse: Math.sin(time * 0.002 + i + Math.PI), isMutated: false,
                    expansion: 0
                });
                
                rungs.push({ pairIdx: i, z: (z1 + z2) / 2 });
            }

            // Z-Sorting (Non-negotiable)
            const sortedElements = [
                ...nodes.map(n => ({ type: 'node', z: n.z, data: n })),
                ...rungs.map(r => ({ type: 'rung', z: r.z, data: r }))
            ].sort((a, b) => a.z - b.z);

            // Draw Loop
            sortedElements.forEach(el => {
                const fogRatio = (y: number) => {
                    if (y < h * 0.15) return y / (h * 0.15);
                    if (y > h * 0.85) return (h - y) / (h * 0.15);
                    return 1;
                };

                if (el.type === 'rung') {
                    const rung = el.data as Rung;
                    const n1 = nodes.find(n => n.pairIdx === rung.pairIdx && n.strand === 1)!;
                    const n2 = nodes.find(n => n.pairIdx === rung.pairIdx && n.strand === 2)!;
                    const isGCPair = (n1.base === 'G' || n1.base === 'C');
                    
                    const fog = fogRatio(n1.y);
                    const opacity = (0.15 + (rung.z + 1) * 0.15) * fog;

                    ctx.beginPath();
                    // Occlusion logic: draw only from front node to middle if one is clearly behind
                    if (n1.z > n2.z) {
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n1.x + (n2.x - n1.x) * 0.6, n1.y);
                    } else {
                        ctx.moveTo(n2.x, n2.y);
                        ctx.lineTo(n2.x + (n1.x - n2.x) * 0.6, n2.y);
                    }
                    
                    ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
                    ctx.lineWidth = isGCPair ? 3 : 1.5;
                    ctx.stroke();
                } else {
                    const node = el.data as Node;
                    const color = BASE_COLORS[node.base] || '#fff';
                    const fog = fogRatio(node.y);
                    
                    const size = (3 + (node.z + 1) * 3) * (1 + node.pulse * 0.1);
                    const opacity = (0.3 + (node.z + 1) * 0.6) * fog;
                    
                    const dx = node.x - mousePosRef.current.x;
                    const dy = node.y - mousePosRef.current.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const isHovered = dist < 60;

                    if (mutationPropagation) {
                        const distToCenter = Math.abs(node.pairIdx - mutationPropagation.center);
                        if (distToCenter < 6) {
                            ctx.shadowBlur = 15;
                            ctx.shadowColor = 'var(--secondary)';
                        }
                    }

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size * (isHovered ? 1.4 : 1), 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.globalAlpha = opacity;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    
                    if (isHovered) {
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, size * 2.5, 0, Math.PI * 2);
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 1;
                        ctx.globalAlpha = opacity * 0.4;
                        ctx.stroke();
                        
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = '#fff';
                        ctx.font = '9px DM Mono';
                        const labelX = node.x > cx ? node.x - 75 : node.x + 15;
                        ctx.fillText(`${node.base}-${node.base === 'A' ? 'T' : node.base === 'T' ? 'A' : node.base === 'G' ? 'C' : 'G'} (${isGCPair(node.base)?'3':'2'} BONDS)`, labelX, node.y + 3);
                    }
                    ctx.globalAlpha = 1;
                }
            });

            rafRef.current = requestAnimationFrame(render);
        };

        const isGCPair = (b: string) => b === 'G' || b === 'C';

        rafRef.current = requestAnimationFrame(render);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            canvasRef.current?.removeEventListener('click', handleCanvasClick);
            cancelAnimationFrame(rafRef.current);
        };
    }, [nodeSequence, mutationPropagation, helix, selectBase]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            <div style={{ 
                position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', 
                display: 'flex', gap: 32, fontFamily: 'var(--font-data)', fontSize: 8, 
                color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, background: '#fbbf24', borderRadius: '50%' }} /> TOLERANT
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, background: '#f87171', borderRadius: '50%' }} /> CONSERVED
                </div>
            </div>
        </div>
    );
};
