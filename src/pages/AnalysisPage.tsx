import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDNAStore } from '../store/useDNAStore';
import { ExperimentSaveDialog } from '../components/UI/ExperimentSaveDialog';
import { ProteinStructureViewer3D } from '../components/UI/ProteinStructureViewer3D';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';

export const AnalysisPage: React.FC = () => {
    const navigate = useNavigate();
    const impactData = useDNAStore(s => s.impactData);
    const structurePDBs = useDNAStore(s => s.structurePDBs);
    const [timelinePct, setTimelinePct] = useState(35);
    const [isDragging, setIsDragging] = useState(false);
    const timelineRef = useRef<HTMLDivElement>(null);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showStructureViewer, setShowStructureViewer] = useState(false);

    const isPathogenic = !impactData || impactData.ai_predictions.functional_risk === 'Pathogenic';
    const confidence = impactData ? Math.round(Math.min(Math.abs(impactData.ai_predictions.stability_score) * 100 + 50, 98)) : 90;

    const updateTimeline = (clientX: number) => {
        if (!timelineRef.current) return;
        const r = timelineRef.current.getBoundingClientRect();
        const pad = 24;
        const pct = Math.max(0, Math.min(100, ((clientX - r.left - pad) / (r.width - pad * 2)) * 100));
        setTimelinePct(pct);
    };

    useEffect(() => {
        const onMove = (e: MouseEvent) => { if (isDragging) updateTimeline(e.clientX); };
        const onUp = () => setIsDragging(false);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    }, [isDragging]);

    const frameNum = Math.round((timelinePct / 100) * 120).toString().padStart(3, '0');

    const glitch = (path: string) => {
        const overlay = document.getElementById('glitch-overlay');
        if (overlay) { overlay.classList.add('active'); setTimeout(() => { navigate(path); setTimeout(() => overlay.classList.remove('active'), 100); }, 350); }
        else navigate(path);
    };

    // SVG ring
    const R = 104;
    const circ = 2 * Math.PI * R;
    const strokeOffset = circ * (1 - confidence / 100);

    return (
        <div style={{ height: '100%', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 420px', gap: '4rem', padding: '3rem', paddingBottom: '6rem', alignItems: 'start' }}>

            {/* ── Left Column ── */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

                {/* Header */}
                <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--secondary)', letterSpacing: '0.6em', background: 'rgba(0,212,170,0.1)', padding: '4px 12px', textTransform: 'uppercase' }}>
                            ANALYSIS_L01
                        </span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(60px,8vw,110px)', lineHeight: 0.85, color: 'var(--on-surface)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                        {impactData ? impactData.variant_annotation.toUpperCase() + ' VARIANT' : 'MISSENSE VARIANT'}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 24 }}>
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: '1.8rem', color: 'var(--primary)', fontWeight: 300 }}>c.7A&gt;G</span>
                        <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: '1.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 300, textTransform: 'uppercase' }}>Lys → Glu</span>
                    </div>
                    {/* Badge */}
                    <div className="glass-panel" style={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', border: '1px solid rgba(0,212,170,0.2)' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 15px var(--secondary)', animation: 'pulseSlow 2s infinite', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: 10, letterSpacing: '0.4em', color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                            {isPathogenic ? 'LIKELY PATHOGENIC' : 'LIKELY BENIGN'}
                        </span>
                    </div>
                </div>

                {/* Protein structure panels */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', height: 420 }}>
                    {[
                        { label: 'STRUCTURE_01: WILD-TYPE', tag: 'Baseline', tagColor: 'var(--primary)', pdb: structurePDBs?.wt },
                        { label: 'STRUCTURE_02: MUTATED', tag: 'Mutation_Impact', tagColor: 'var(--secondary)', pdb: structurePDBs?.mut },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(12,14,23,0.5)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '1.5rem', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{s.label}</span>
                                <span style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: s.tagColor, background: `${s.tagColor}15`, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.tag}</span>
                            </div>
                            <div style={{ flex: 1, position: 'relative', background: 'rgba(5,7,12,0.4)', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {s.pdb ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 40, color: s.tagColor, opacity: 0.6, animation: 'pulseSlow 2s infinite' }}>view_in_ar</span>
                                        <div style={{ fontFamily: 'var(--font-data)', fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>3D_PDB_LOADED</div>
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(47,126,255,0.05) 0%, transparent 70%)' }} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button 
                        onClick={() => setShowStructureViewer(true)}
                        className="chamfer-btn"
                        style={{ background: 'var(--secondary)', color: '#00382b', padding: '0.75rem 2.5rem', fontFamily: 'var(--font-data)', fontSize: 10, letterSpacing: '0.2em', fontWeight: 700 }}
                    >
                        LAUNCH 3D_STRUCTURE_COMPARISON_SUITE
                    </button>
                </div>

                {/* Replay timeline */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-data)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 16 }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Mutation Replay Timeline</span>
                        <span style={{ color: 'var(--secondary)' }}>Frame_{frameNum} // {Math.round(timelinePct / 100 * 120)}ms</span>
                    </div>
                    <div
                        ref={timelineRef}
                        onMouseDown={e => { setIsDragging(true); updateTimeline(e.clientX); }}
                        style={{
                            position: 'relative', height: 56, background: 'rgba(25,27,37,0.3)',
                            border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center',
                            padding: '0 24px', cursor: 'none',
                        }}
                    >
                        <div style={{ position: 'absolute', left: 24, right: 24, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ position: 'absolute', left: 24, height: 2, width: `calc(${timelinePct}% - 0px)`, background: 'var(--secondary)', boxShadow: '0 0 15px var(--secondary)' }} />
                        <div style={{ position: 'absolute', left: `calc(${timelinePct}% + 24px * (1 - ${timelinePct}/100))`, top: '50%', transform: 'translate(-50%, -50%)', width: 4, height: 40, background: 'var(--secondary)', boxShadow: '0 0 12px var(--secondary)' }} />
                        <div style={{ position: 'absolute', left: 24, right: 24, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
                            {[0,1,2,3,4,5].map(i => <div key={i} style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />)}
                        </div>
                    </div>
                </div>

                {/* SHAP & Stability Dynamics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                            <h3 style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.4em' }}>SHAP_EXPLAINABILITY</h3>
                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                        </div>
                        <div style={{ height: 280, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={impactData?.ai_predictions.shap_values || [
                                    { feature: 'Position', value: 0.8 }, { feature: 'Entropy', value: 0.6 },
                                    { feature: 'Charge', value: 0.7 }, { feature: 'Phylo', value: 0.5 }
                                ]} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="feature" type="category" stroke="rgba(255,255,255,0.3)" fontSize={9} width={80} />
                                    <Tooltip contentStyle={{ background: '#0c0e17', border: '1px solid var(--border)', fontSize: 10 }} />
                                    <Bar dataKey="value" fill="var(--secondary)" radius={[0, 4, 4, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                            <h3 style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.4em' }}>STABILITY_LANDSCAPE</h3>
                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                        </div>
                        <div style={{ height: 280, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { x: 0, y: 0.2 }, { x: 10, y: 0.5 }, { x: 20, y: 0.8 }, 
                                    { x: 30, y: impactData ? Math.abs(impactData.ai_predictions.stability_score) : 0.9 }, 
                                    { x: 40, y: 0.4 }, { x: 50, y: 0.2 }
                                ]}>
                                    <Area type="monotone" dataKey="y" stroke="var(--primary)" fill="rgba(47,126,255,0.1)" strokeWidth={2} />
                                    <Tooltip />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Right Sidebar ── */}
            <aside className="glass-panel" style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '3rem', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>

                {/* Confidence ring */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' }}>
                    <div style={{ position: 'relative', width: 224, height: 224 }}>
                        <svg width="224" height="224" viewBox="0 0 224 224" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="112" cy="112" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                            <defs>
                                <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="var(--primary)" />
                                    <stop offset="100%" stopColor="var(--secondary)" />
                                </linearGradient>
                            </defs>
                            <circle cx="112" cy="112" r={R} fill="none" stroke="url(#ring-grad)" strokeWidth="6"
                                strokeDasharray={circ} strokeDashoffset={strokeOffset} strokeLinecap="butt" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-headline)', fontSize: '4rem', color: 'var(--on-surface)' }}>{confidence}%</span>
                            <span style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.4em', textTransform: 'uppercase', marginTop: 8 }}>Confidence_Rating</span>
                        </div>
                    </div>
                </div>

                {/* Summary table */}
                <div>
                    <h4 style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: 20 }}>SUMMARY_PARAMETERS</h4>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        {[
                            { label: 'Gene_Ref',     value: 'BRCA1 (Simulated)', color: 'var(--primary)', bold: true },
                            { label: 'Position',     value: impactData ? 'Simulated Region' : 'N/A', color: 'var(--on-surface)' },
                            { label: 'Change',       value: impactData ? impactData.variant_annotation.split(' ')[0] : 'N/A', color: 'var(--on-surface)' },
                            { label: 'Clinsig',      value: impactData ? impactData.ai_predictions.functional_risk : 'N/A', color: isPathogenic ? 'var(--error)' : 'var(--secondary)', bold: true },
                        ].map(r => (
                            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                                <span style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{r.label}</span>
                                <span style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: r.color, fontWeight: (r as any).bold ? 700 : 400 }}>{r.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <button
                        onClick={() => setShowSaveDialog(true)}
                        className="chamfer-sm-rect"
                        style={{ width: '100%', background: 'var(--primary)', padding: '1.25rem 2rem', fontFamily: 'var(--font-data)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#002d6c', border: 'none', cursor: 'none', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(47,126,255,0.2)' }}
                    >
                        <span>SAVE TO LIBRARY</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>bookmark</span>
                    </button>
                    <button
                        onClick={() => glitch('/report')}
                        className="chamfer-sm-rect"
                        style={{ width: '100%', background: 'transparent', padding: '1.25rem 2rem', fontFamily: 'var(--font-data)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--primary)', border: '1px solid rgba(47,126,255,0.3)', cursor: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
                    >
                        <span>VIEW FULL REPORT</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>description</span>
                    </button>
                    <button
                        className="chamfer-sm-rect"
                        style={{ width: '100%', background: 'transparent', padding: '1.25rem 2rem', fontFamily: 'var(--font-data)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--secondary)', border: '1px solid rgba(0,212,170,0.3)', cursor: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
                    >
                        <span>EXPORT REPORT</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>ios_share</span>
                    </button>
                </div>

                {/* System info */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.3 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--secondary)', animation: 'pulseSlow 2s infinite' }}>sensors</span>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase' }}>ENCODING_STREAM: ACTIVE_752kbps</span>
                </div>
            </aside>
            <ExperimentSaveDialog isOpen={showSaveDialog} onClose={() => setShowSaveDialog(false)} />
            <ProteinStructureViewer3D isOpen={showStructureViewer} onClose={() => setShowStructureViewer(false)} />
        </div>
    );
};
