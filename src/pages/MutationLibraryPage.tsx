import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MutationComparisonPanel } from '../components/UI/MutationComparisonPanel';
import { useDNAStore } from '../store/useDNAStore';

const LOG_ENTRIES = [
    'SIM_SEQ [X-902] :: INITIALIZING_ENVIRONMENT...',
    'LOAD_MODULE: GENOMIC_PARSER_CORE_V4',
    'MAPPING_TOPOLOGY: [2.4M BASE_PAIRS / SEGMENT]',
    'ALERT: INSTABILITY DETECTED IN QUADRANT_DELTA_4',
    'RUNNING_STOCHASTIC_CORRECTION... OK',
    'DATA_SYNC_PIPE: SYNCHRONIZED WITH ARCHIVE_MAIN',
    'NEW_ARTIFACT: HEMOGLOBIN_MOD_X :: COMMIT_SUCCESS',
    'CALIBRATING_SPLICER_V2.9... [100%]',
    'ACCESSING_BIOMETRIC_VAULT_04... GRANTED',
    'WARNING: SEQUENCE_OVERLAP_DETECTED [NODE_11]',
    'NEURAL_PATHWAY_MAPPING: ACTIVE',
    'CORE_TEMPERATURE: 34.2C // OPTIMAL',
    'SYNCING_WITH_LAB_RESOURCES... SUCCESS',
];

const TABS = ['ALL_VARIANTS', 'PATHOGENIC', 'BENIGN'];

export const MutationLibraryPage: React.FC = () => {
    const navigate = useNavigate();
    const { history, fetchHistory, loadLog } = useDNAStore();
    const [activeTab, setActiveTab] = useState('ALL_VARIANTS');
    const [showTerminal, setShowTerminal] = useState(true);
    const [logs, setLogs] = useState(LOG_ENTRIES.slice(0, 4));
    const logIdx = useRef(4);
    const [hovered, setHovered] = useState<string | null>(null);
    const [compareMode, setCompareMode] = useState(false);

    useEffect(() => {
        fetchHistory();
        const id = setInterval(() => {
            setLogs(prev => {
                const next = [...prev, LOG_ENTRIES[logIdx.current % LOG_ENTRIES.length]];
                logIdx.current++;
                return next.length > 8 ? next.slice(next.length - 8) : next;
            });
        }, 2800);
        return () => clearInterval(id);
    }, [fetchHistory]);

    const filtered = history.filter(m => {
        if (activeTab === 'ALL_VARIANTS') return true;
        if (activeTab === 'PATHOGENIC')   return m.verdict === 'Pathogenic';
        if (activeTab === 'BENIGN')       return m.verdict === 'Benign';
        return true;
    });

    const glitch = (path: string) => {
        const overlay = document.getElementById('glitch-overlay');
        if (overlay) { overlay.classList.add('active'); setTimeout(() => { navigate(path); setTimeout(() => overlay.classList.remove('active'), 100); }, 350); }
        else navigate(path);
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', background: 'var(--bg)', padding: '4rem 4rem 8rem' }}>

            {/* ── Header ── */}
            <header style={{ position: 'relative', marginBottom: '5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(80px,10vw,140px)', lineHeight: 0.85, letterSpacing: '-0.02em', textTransform: 'uppercase', userSelect: 'none' }}>
                        MUTATION{' '}
                        <span style={{ WebkitTextStroke: '1px var(--primary)', color: 'transparent' }}>LIB</span>RARY
                    </h1>
                    <div style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>
                        <div style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--secondary)', background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.15)', padding: '6px 16px', display: 'inline-block', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            ACCESS_KEY: VALIDATED
                        </div>
                        <div style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                            Index_Ref: 0x992_ARTEFACT
                        </div>
                    </div>
                </div>
                <div style={{ height: 1, background: 'linear-gradient(90deg, var(--primary) 0%, rgba(0,212,170,0.2) 50%, transparent 100%)', marginTop: '2rem' }} />
            </header>

            {/* ── Stats ── */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2rem', marginBottom: '5rem' }}>
                {[
                    { label: 'Aggregate_Data', value: '12,842', pct: 84, color: 'var(--primary)', icon: 'database' },
                    { label: 'Active_Stream',  value: '049',    pct: 32, color: 'var(--secondary)', icon: 'dynamic_feed' },
                    { label: 'Integrity_Check',value: 'NOMINAL',pct: null, color: 'var(--secondary)', icon: 'token' },
                ].map(s => (
                    <div key={s.label} className="stat-card" style={{ transition: 'all 0.2s' }}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                        {s.pct !== null ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
                                    <div className="stat-bar" style={{ flex: 1 }}>
                                        <div className="stat-bar-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: s.color }}>{s.pct}%</span>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-data)', fontSize: 9, color: s.color, textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, boxShadow: `0 0 8px ${s.color}`, animation: 'pulseSlow 2s ease-in-out infinite', flexShrink: 0 }} />
                                ALL_MODULES_STABLE
                            </div>
                        )}
                        <span className="material-symbols-outlined" style={{ position: 'absolute', bottom: 16, right: 16, fontSize: 48, color: 'rgba(255,255,255,0.03)' }}>{s.icon}</span>
                    </div>
                ))}
            </section>

            {/* ── Filter tabs ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '2.5rem', marginBottom: '3rem' }}>
                {TABS.map(t => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={activeTab === t ? 'chamfer-btn' : ''}
                        style={{
                            fontFamily: 'var(--font-data)', fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase',
                            padding: '0.75rem 2rem', cursor: 'none', border: '1px solid',
                            background: activeTab === t ? 'var(--secondary)' : 'transparent',
                            color: activeTab === t ? '#00382b' : 'rgba(255,255,255,0.3)',
                            borderColor: activeTab === t ? 'var(--secondary)' : 'rgba(255,255,255,0.1)',
                            fontWeight: activeTab === t ? 700 : 400,
                            transition: 'all 0.2s',
                        }}
                    >
                        {t}
                    </button>
                ))}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <button onClick={() => setCompareMode(true)} className="chamfer-btn" style={{
                        fontFamily: 'var(--font-data)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                        padding: '0.6rem 1.5rem', cursor: 'none', border: '1px solid var(--primary)', background: 'transparent',
                        color: 'var(--primary)'
                    }}>
                        COMPARE_SELECT
                    </button>
                    <div style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        FILTER: SEQUENCE_WEIGHT [DESC]
                    </div>
                </div>
            </div>

            {/* ── Cards grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2.5rem', marginBottom: '4rem' }}>
                {filtered.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', gap: '2rem', border: '1px solid var(--border)', background: 'rgba(12,14,23,0.2)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'rgba(47,126,255,0.15)' }}>biotech</span>
                        <div style={{ fontFamily: 'var(--font-headline)', fontSize: '3rem', color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NO_VARIANTS_FOUND</div>
                        <div style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'rgba(47,126,255,0.3)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                            {history.length === 0 ? 'Run a mutation simulation to populate the archive' : 'No variants match the active filter'}
                        </div>
                    </div>
                ) : filtered.map(m => {
                    const isHov = hovered === m.id;
                    const isPath = m.verdict === 'Pathogenic';
                    const barColor = isPath ? 'var(--error)' : 'var(--secondary)';
                    const stabilityScore = m.stability_score ?? 0;
                    return (
                        <div
                            key={m.id}
                            onClick={() => {
                                loadLog(m.id);
                                glitch('/lab');
                            }}
                            onMouseEnter={() => setHovered(m.id)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                padding: '2.5rem', cursor: 'none',
                                border: `1px solid ${isHov ? (isPath ? 'rgba(255,180,171,0.3)' : 'rgba(47,126,255,0.3)') : 'rgba(255,255,255,0.05)'}`,
                                transition: 'all 0.5s', background: isHov ? 'rgba(12,14,23,0.4)' : 'rgba(12,14,23,0.2)',
                            } as React.CSSProperties}
                        >
                            {/* Card header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                        Sim_Node: {m.id.slice(0, 8)}
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-data)', fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 4, textTransform: 'uppercase' }}>
                                        {new Date(m.created_at).toLocaleString()}
                                    </div>
                                </div>
                                {/* Decorative icon */}
                                <div style={{ width: 56, height: 56, border: '1px solid rgba(255,255,255,0.05)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                    {isPath ? (
                                        <span className="material-symbols-outlined" style={{ color: 'rgba(255,180,171,0.6)', fontVariationSettings: "'FILL' 1" }}>warning</span>
                                    ) : (
                                        <>
                                            <div style={{ position: 'absolute', inset: 8, border: '1px solid rgba(0,212,170,0.2)', borderRadius: '50%', animation: 'spinSlow 10s linear infinite' }} />
                                            <div style={{ position: 'absolute', inset: 16, border: '1px solid rgba(47,126,255,0.2)', borderRadius: '50%', animation: 'spinReverse 6s linear infinite' }} />
                                            <div style={{ width: 4, height: 4, background: 'var(--secondary)', boxShadow: '0 0 8px var(--secondary)', borderRadius: '50%' }} />
                                        </>
                                    )}
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: '1px solid rgba(47,126,255,0.4)', borderLeft: '1px solid rgba(47,126,255,0.4)' }} />
                                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: '1px solid rgba(47,126,255,0.4)', borderRight: '1px solid rgba(47,126,255,0.4)' }} />
                                </div>
                            </div>

                            <h3 style={{
                                fontFamily: 'var(--font-headline)', fontSize: '2.8rem', letterSpacing: '-0.01em',
                                color: isHov ? (isPath ? 'var(--error)' : 'var(--primary)') : 'var(--on-surface)',
                                marginBottom: '2.5rem', transition: 'color 0.2s',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {m.variant_annotation}
                            </h3>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 12 }}>
                                <span>STABILITY_SCORE</span>
                                <span style={{ color: barColor }}>{stabilityScore.toFixed(2)}</span>
                            </div>
                            <div className="stat-bar">
                                <div className="stat-bar-fill" style={{ width: `${Math.min(100, Math.abs(stabilityScore) * 100)}%`, background: barColor, boxShadow: `0 0 10px ${isPath ? 'rgba(255,180,171,0.4)' : 'rgba(0,212,170,0.4)'}` }} />
                            </div>

                            {/* Hover reveal */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', opacity: isHov ? 1 : 0, transform: isHov ? 'translateY(0)' : 'translateY(8px)', transition: 'all 0.3s' }}>
                                <button
                                    onClick={e => { 
                                        e.stopPropagation(); 
                                        loadLog(m.id);
                                        glitch('/lab'); 
                                    }}
                                    className="chamfer-btn"
                                    style={{ background: 'var(--primary)', color: '#fff', fontFamily: 'var(--font-data)', fontSize: 9, padding: '10px 24px', letterSpacing: '0.3em', border: 'none', cursor: 'none', textTransform: 'uppercase' }}
                                >
                                    LOAD_ARTIFACT
                                </button>
                                <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }}>open_in_full</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Floating Terminal ── */}
            {showTerminal && (
                <div className="glass-panel" style={{ position: 'fixed', bottom: 48, right: 48, width: 384, padding: '2rem', zIndex: 400, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 10px var(--secondary)', animation: 'pulseSlow 2s infinite', flexShrink: 0 }} />
                            LIVE_FEED_TERMINAL
                        </div>
                        <button onClick={() => setShowTerminal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'none', fontSize: 18, lineHeight: 1 }}>✕</button>
                    </div>
                    <div style={{ fontFamily: 'var(--font-data)', fontSize: 9, lineHeight: 2.2, height: 192, overflow: 'hidden', position: 'relative' }}>
                        {logs.map((log, i) => (
                            <div key={i} style={{
                                opacity: (i + 1) / logs.length,
                                color: log.includes('ALERT') || log.includes('WARNING') ? 'var(--primary)' : i % 2 === 0 ? 'rgba(0,212,170,0.8)' : 'rgba(255,255,255,0.3)',
                                textTransform: 'uppercase',
                            }}>
                                {log}
                            </div>
                        ))}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, background: 'linear-gradient(to top, rgba(3,4,12,0.9), transparent)', pointerEvents: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>System_Active // v2.4.1_STABLE</span>
                        <div style={{ display: 'flex', gap: 16 }}>
                            {['LOGS', 'BIOMETRY'].map(t => (
                                <span key={t} style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(0,212,170,0.4)', cursor: 'none', textTransform: 'uppercase' }}>{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            <MutationComparisonPanel isOpen={compareMode} onClose={() => setCompareMode(false)} />
        </div>
    );
};
