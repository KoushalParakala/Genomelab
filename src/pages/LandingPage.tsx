import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
    {
        id: '01',
        label: 'ARCHIVAL CORE',
        color: 'var(--primary)',
        desc: 'Access the most extensive library of synthetic and natural genomic markers ever catalogued.',
        cta: 'EXPLORE DATABASE',
        path: '/archive',
    },
    {
        id: '02',
        label: 'REAL-TIME FOLD',
        color: 'var(--secondary)',
        desc: 'Watch protein structures manifest in seconds using our proprietary folding engines.',
        cta: 'LAUNCH RENDER',
        path: '/mutate',
    },
    {
        id: '03',
        label: 'CRISPR-OS',
        color: 'var(--primary)',
        desc: 'A terminal-grade interface for precise enzymatic cutting and sequence insertion.',
        cta: 'INITIALIZE OS',
        path: '/mutate',
    },
];

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);

    /* Mini helix canvas for hero background */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        let t = 0;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            t += 0.008;
            const cx = canvas.width / 2;
            const amp = 55;
            const freq = 0.028;
            const gap = 10;

            const fog = ctx.createLinearGradient(0, 0, 0, canvas.height);
            fog.addColorStop(0, '#03040c');
            fog.addColorStop(0.15, 'transparent');
            fog.addColorStop(0.85, 'transparent');
            fog.addColorStop(1, '#03040c');

            for (let y = -20; y < canvas.height + 20; y += gap) {
                const x1 = cx + Math.sin(y * freq + t) * amp;
                const x2 = cx + Math.sin(y * freq + t + Math.PI) * amp;
                const z1 = Math.cos(y * freq + t);
                const z2 = Math.cos(y * freq + t + Math.PI);
                const depth = (z1 + z2 + 2) / 4;

                ctx.beginPath();
                ctx.moveTo(x1, y);
                ctx.lineTo(x2, y);
                ctx.strokeStyle = `rgba(47,126,255,${0.06 * depth})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                const r1 = 2 + ((z1 + 1) / 2) * 4;
                const r2 = 2 + ((z2 + 1) / 2) * 4;
                const o1 = 0.2 + ((z1 + 1) / 2) * 0.5;
                const o2 = 0.2 + ((z2 + 1) / 2) * 0.5;

                ctx.beginPath();
                ctx.arc(x1, y, r1, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(47,126,255,${o1})`;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x2, y, r2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0,212,170,${o2})`;
                ctx.fill();
            }

            ctx.fillStyle = fog;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            rafRef.current = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const glitch = (path: string) => {
        const overlay = document.getElementById('glitch-overlay');
        if (overlay) {
            overlay.classList.add('active');
            setTimeout(() => { navigate(path); setTimeout(() => overlay.classList.remove('active'), 100); }, 350);
        } else navigate(path);
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', background: 'var(--bg)' }}>

            {/* ── Hero ── */}
            <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {/* DNA canvas bg */}
                <canvas
                    ref={canvasRef}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55, pointerEvents: 'none' }}
                />

                {/* Hero content */}
                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', userSelect: 'none', pointerEvents: 'none' }}>
                    <h1 style={{ lineHeight: 1 }}>
                        <div style={{
                            fontFamily: 'var(--font-headline)',
                            fontSize: 'clamp(80px,12vw,140px)',
                            color: 'var(--primary)',
                            letterSpacing: '-0.02em',
                            textShadow: '0 0 30px rgba(47,126,255,0.3)',
                        }}>
                            GENOME
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-headline)',
                            fontSize: 'clamp(80px,12vw,140px)',
                            letterSpacing: '-0.02em',
                            marginTop: '-0.1em',
                            WebkitTextStroke: '1px var(--primary)',
                            color: 'transparent',
                        }}>
                            LAB
                        </div>
                    </h1>
                    <div style={{
                        marginTop: '2rem',
                        fontFamily: 'var(--font-data)',
                        color: 'var(--secondary)',
                        fontSize: 11,
                        letterSpacing: '0.4em',
                        textTransform: 'uppercase',
                        opacity: 0.8,
                    }}>
                        Biological Synthesis Interface // v2.4.1_STABLE
                    </div>
                </div>

                {/* Scroll indicator */}
                <div style={{
                    position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0.3,
                }}>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--on-surface)' }}>
                        Initialize Scroll
                    </span>
                    <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, var(--secondary), transparent)' }} />
                </div>
            </section>

            {/* ── What happens... ── */}
            <section style={{ padding: '8rem 6rem', background: 'var(--surface-container-lowest)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
                    <div>
                        <div style={{
                            display: 'inline-block',
                            background: 'var(--surface-container-high)',
                            fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--secondary)',
                            letterSpacing: '0.3em', textTransform: 'uppercase', padding: '4px 12px', marginBottom: '2rem',
                        }}>
                            Core Methodology
                        </div>
                        <h2 style={{
                            fontFamily: 'var(--font-headline)',
                            fontSize: 'clamp(48px,6vw,80px)',
                            lineHeight: 0.9,
                            color: 'var(--on-surface)',
                            textTransform: 'uppercase',
                            marginBottom: '2rem',
                        }}>
                            WHAT HAPPENS WHEN YOU CHANGE ONE BASE?
                        </h2>
                        <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.3)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 420, marginBottom: '2.5rem' }}>
                            A single mutation can rewrite an entire biological narrative. Our simulator allows you to perturb genomic sequences in a zero-risk digital twin environment. Observe the ripple effect across phenotypes in real-time.
                        </p>
                        <button
                            className="btn-primary chamfer-btn"
                            style={{ width: 'auto', padding: '1.1rem 2.5rem', fontSize: '1rem', letterSpacing: '0.3em' }}
                            onClick={() => glitch('/mutate')}
                        >
                            ENTER SIMULATOR
                        </button>
                    </div>

                    {/* Data module */}
                    <div style={{ border: '1px solid var(--border)', padding: '2rem', position: 'relative', background: 'rgba(29,31,42,0.5)' }}>
                        <div style={{ position: 'absolute', top: -1, left: -1, width: 24, height: 24, borderTop: '2px solid rgba(0,212,170,0.3)', borderLeft: '2px solid rgba(0,212,170,0.3)' }} />
                        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 24, height: 24, borderBottom: '2px solid rgba(47,126,255,0.3)', borderRight: '2px solid rgba(47,126,255,0.3)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                            <div>
                                <div style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>System Cluster</div>
                                <div style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: 'var(--primary)' }}>OMEGA-7 // ACTIVE</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Stability</div>
                                <div style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: 'var(--secondary)' }}>99.98%</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1.2rem', opacity: 0.3 }}>
                            {['ATGGCC TTG CAG', 'CCC AGC CTG GCC', 'CTG GTC CTG GCC'].map(s => (
                                <div key={s} className="seq-display" style={{ fontSize: 12 }}>{s}</div>
                            ))}
                        </div>
                        <div style={{ height: 1, background: 'var(--border)', margin: '1rem 0' }} />
                        <div className="stat-bar">
                            <div className="stat-bar-fill" style={{ width: '67%', background: 'var(--secondary)', boxShadow: '0 0 10px rgba(0,212,170,0.4)' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                            <span>Processing Fragment...</span>
                            <span>SEQ_092_X1</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Feature cards ── */}
            <section style={{ padding: '8rem 6rem', background: 'var(--bg)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '3rem' }}>
                    {FEATURES.map(f => (
                        <div
                            key={f.id}
                            style={{ background: 'var(--surface-container-low)', padding: '3rem', position: 'relative', overflow: 'hidden', cursor: 'none', transition: 'border-color 0.3s' }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = f.color + '44')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                        >
                            <div style={{
                                position: 'absolute', top: 16, right: 20,
                                fontFamily: 'var(--font-data)', fontSize: 60, color: 'rgba(255,255,255,0.03)', fontWeight: 700, lineHeight: 1,
                            }}>
                                {f.id}
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '2.2rem', color: f.color, marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                                {f.label}
                            </h3>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, marginBottom: '2rem' }}>
                                {f.desc}
                            </p>
                            <button
                                onClick={() => glitch(f.path)}
                                style={{
                                    background: 'none', border: 'none',
                                    fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--secondary)',
                                    letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'none',
                                    display: 'flex', alignItems: 'center', gap: 8, transition: 'gap 0.2s',
                                }}
                            >
                                {f.cta} <span className="material-symbols-outlined" style={{ fontSize: 14 }}>north_east</span>
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
