import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useDNAStore } from '../store/useDNAStore';
import { ProteinStructureViewer3D } from '../components/UI/ProteinStructureViewer3D';
import { InteractiveHelix } from '../components/UI/InteractiveHelix';
import { WhatIfPanel } from '../components/UI/WhatIfPanel';
import { RiskAnalysisPanel } from '../components/UI/RiskAnalysisPanel';

/* Web Audio tone on Run click (matches reference sawtooth ramp) */
function playMutationTone() {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(55, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } catch (_) {}
}

/* Caret-preserving contenteditable with per-char highlight */
function getCaretOffset(el: HTMLElement): number {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 0;
    const range = sel.getRangeAt(0);
    const pre = range.cloneRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.endContainer, range.endOffset);
    return pre.toString().length;
}

function setCaretOffset(el: HTMLElement, offset: number) {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    let pos = 0;
    const stack: Node[] = [el];
    let found = false;
    while (stack.length && !found) {
        const node = stack.pop()!;
        if (node.nodeType === 3) {
            const len = (node as Text).length;
            if (offset <= pos + len) {
                range.setStart(node, offset - pos);
                range.collapse(true);
                found = true;
            }
            pos += len;
        } else {
            let i = node.childNodes.length;
            while (i--) stack.push(node.childNodes[i]);
        }
    }
    sel.removeAllRanges();
    sel.addRange(range);
}

function buildColoredHTML(text: string): string {
    let html = '';
    for (const char of text) {
        const lower = char.toLowerCase();
        let cls = '';
        if (lower === 'a') cls = 'nt-a';
        else if (lower === 't') cls = 'nt-t';
        else if (lower === 'g') cls = 'nt-g';
        else if (lower === 'c') cls = 'nt-c';
        html += cls ? `<span class="${cls}">${char}</span>` : char;
    }
    return html;
}

export const SimulatorPage: React.FC = () => {
    const impactData = useDNAStore(s => s.impactData);
    const isSimulating = useDNAStore(s => s.isSimulating);
    const whatIfActive = useDNAStore(s => s.whatIfActive);
    const toggleWhatIf = useDNAStore(s => s.toggleWhatIf);
    const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);
    const [showStructureViewer, setShowStructureViewer] = useState(false);

    const { 
        selectedId, 
        mutationType, 
        setMutationType, 
        includeStructure, 
        setIncludeStructure,
        performMutation,
        helix
    } = useDNAStore();

    const selectedIndex = helix.findIndex(h => h.id === selectedId);

    const editorRef  = useRef<HTMLDivElement>(null);
    const fpPathRef = useRef<SVGPathElement>(null);
    const seqTextRef = useRef<string>('ATGGCC TTG CAG AAA TGC GGT ACT CCC AGC CTG CCC CTG GTC CTG GCC CTG GTC CTG GCC CTG GCC CTG GCC');

    /* ── Helix Canvas Logic (Removed in favor of InteractiveHelix component) ── */

    /* ── Fingerprint SVG updater ── */
    const updateFingerprint = useCallback((text: string) => {
        if (!fpPathRef.current || !text) return;
        
        // Requirement #12: Use actual backend fingerprint if available
        let radii = [40, 45, 38, 42, 50, 44, 39, 41];
        if (impactData?.fingerprint) {
            radii = impactData.fingerprint.map(v => v * 1.0);
        } else {
            const indices = [0, 4, 8, 12, 16, 20, 24, 28];
            radii = indices.map(idx => 20 + ((text.charCodeAt(idx % text.length) || 65) % 30));
        }

        const pts = radii.map((r, i) => ({
            x: 50 + Math.cos((i / 8) * Math.PI * 2) * r,
            y: 50 + Math.sin((i / 8) * Math.PI * 2) * r,
        }));
        let d = `M ${pts[0].x},${pts[0].y}`;
        for (let i = 0; i < pts.length; i++) {
            const p1 = pts[i];
            const p2 = pts[(i + 1) % pts.length];
            d += ` Q ${p1.x},${p1.y} ${(p1.x + p2.x) / 2},${(p1.y + p2.y) / 2}`;
        }
        fpPathRef.current.setAttribute('d', d + 'Z');
    }, [impactData]);

    /* ── Sequence editor: initial render ── */
    useEffect(() => {
        const el = editorRef.current;
        if (!el) return;
        el.innerHTML = buildColoredHTML(seqTextRef.current);
        updateFingerprint(seqTextRef.current);
    }, [updateFingerprint]);

    /* ── Sequence editor: live input handler ── */
    const handleEditorInput = () => {
        const el = editorRef.current;
        if (!el) return;
        
        const offset = getCaretOffset(el);
        let text = el.innerText.toUpperCase().replace(/[^ATGCN]/g, '');
        
        // Limit length
        if (text.length > 10000) text = text.slice(0, 10000);
        
        seqTextRef.current = text;
        el.innerHTML = buildColoredHTML(text);
        updateFingerprint(text);
        setCaretOffset(el, offset);
    };

    const isPathogenic = !impactData || impactData.ai_predictions.functional_risk === 'Pathogenic';
    const pathoPct = impactData ? Math.round(Math.abs(impactData.ai_predictions.stability_score) * 100) : 94;
    const conservPct = impactData ? Math.round(impactData.ai_predictions.aggregation_risk * 20) : 12;

    const handleRun = async () => {
        const seq = seqTextRef.current.replace(/\s/g, '');
        if (seq.length < 10) {
            alert('Sequence must be at least 10 base pairs long.');
            return;
        }
        if (!selectedId) {
            alert('Please click a base pair in the DNA helix to select a mutation position first.');
            return;
        }
        
        playMutationTone();
        const overlay = document.getElementById('glitch-overlay');
        if (overlay) {
            overlay.classList.add('active');
            setTimeout(() => overlay.classList.remove('active'), 200);
        }
        
        // Use the editor sequence directly via the store action that accepts a custom sequence
        await performMutation(selectedId, seq);
    };


    const panelBase: React.CSSProperties = {
        height: '100%', display: 'flex', flexDirection: 'column',
        padding: '2.5rem', overflowY: 'auto', overflowX: 'hidden', gap: '2rem',
    };

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

            {/* ══ LEFT PANEL: SEQUENCE INPUT ══ */}
            <section className="panel-divider" style={{ ...panelBase, width: '32%', background: 'rgba(12,14,23,0.3)' }}>
                <header>
                    <div className="section-label">INPUT_BUFFER // ALPHA_7</div>
                    <h2 className="page-heading" style={{ fontSize: '3rem' }}>Sequence Input</h2>
                </header>

                {/* Editor box */}
                <div style={{ flexGrow: 1, position: 'relative', border: '1px solid var(--border)', background: 'rgba(3,4,12,0.5)', overflow: 'hidden', minHeight: 160 }}>
                    {/* Decorative spectral-line background */}
                    <div style={{
                        position: 'absolute', inset: 0, padding: '0 8px', pointerEvents: 'none',
                        opacity: 0.1, display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
                    }}>
                        {[
                            'rgba(239,68,68,0.4)',
                            'rgba(59,130,246,0.4)',
                            'rgba(34,197,94,0.4)',
                            'rgba(239,68,68,0.4)',
                            'rgba(59,130,246,0.4)',
                        ].map((color, i) => (
                            <div key={i} style={{
                                width: 8, height: '100%',
                                background: `linear-gradient(to bottom, ${color}, transparent)`,
                            }} />
                        ))}
                    </div>
                    {/* contenteditable with caret-safe per-char coloring */}
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                        onInput={handleEditorInput}
                        style={{
                            position: 'relative', zIndex: 10,
                            width: '100%', height: '100%', padding: '1.5rem',
                            fontFamily: 'var(--font-data)', fontSize: 13, color: 'var(--primary)',
                            outline: 'none', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                            lineHeight: 1.75,
                        }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
                    {[
                        { id: 'substitution', label: 'SUB' },
                        { id: 'insertion', label: 'INS' },
                        { id: 'deletion', label: 'DEL' }
                    ].map(t => (
                        <button
                            key={t.id}
                            className="chamfer"
                            onClick={() => setMutationType(t.id as any)}
                            style={{
                                background: mutationType === t.id ? 'rgba(47,126,255,0.2)' : 'rgba(40,41,52,0.5)', 
                                border: mutationType === t.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                                padding: '0.75rem', fontFamily: 'var(--font-data)', fontSize: 10,
                                letterSpacing: '0.3em', color: mutationType === t.id ? 'var(--primary)' : 'rgba(47,126,255,0.8)', cursor: 'none',
                                textTransform: 'uppercase', transition: 'all 0.2s',
                                boxShadow: mutationType === t.id ? '0 0 10px rgba(47,126,255,0.2)' : 'none'
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Structure Toggle */}
                <div 
                    onClick={() => setIncludeStructure(!includeStructure)}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'none',
                        padding: '0.75rem', background: 'rgba(25,27,37,0.3)', border: '1px solid var(--border)',
                    }}
                >
                    <div style={{ 
                        width: 14, height: 14, border: '1px solid var(--secondary)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: includeStructure ? 'var(--secondary)' : 'transparent'
                    }}>
                        {includeStructure && <span className="material-symbols-outlined" style={{ fontSize: 10, color: '#000' }}>check</span>}
                    </div>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        Include 3D Structure Analysis (AI)
                    </span>
                </div>

                {/* What-If Toggle */}
                <button
                    onClick={toggleWhatIf}
                    className="chamfer"
                    style={{
                        background: whatIfActive ? 'rgba(0,212,170,0.1)' : 'rgba(40,41,52,0.3)',
                        border: whatIfActive ? '1px solid rgba(0,212,170,0.3)' : '1px solid rgba(255,255,255,0.05)',
                        padding: '0.75rem', fontFamily: 'var(--font-data)', fontSize: 10,
                        letterSpacing: '0.3em', color: whatIfActive ? 'var(--secondary)' : 'rgba(47,126,255,0.6)',
                        cursor: 'none', textTransform: 'uppercase' as const, transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>science</span>
                    {whatIfActive ? 'CLOSE WHAT-IF' : 'WHAT-IF MODE'}
                </button>

                {/* What-If Panel (conditionally rendered) */}
                <WhatIfPanel />

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(25,27,37,0.4)', border: '1px solid var(--border)', padding: '1rem' }}>
                    <label style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'rgba(47,126,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.4em', whiteSpace: 'nowrap' }}>Position</label>
                    <div
                        style={{
                            background: 'transparent', border: 'none',
                            borderBottom: '1px solid rgba(0,212,170,0.2)',
                            fontFamily: 'var(--font-data)', fontSize: 12,
                            color: 'var(--secondary)', width: '100%', outline: 'none', padding: '2px 0',
                        }}
                    >
                        {selectedIndex !== -1 ? `${selectedIndex.toString().padStart(4, '0')}:CHR19` : 'NOT_SELECTED'}
                    </div>
                </div>

                {/* Run button */}
                <button
                    className="chamfer"
                    onClick={handleRun}
                    style={{
                        width: '100%', padding: '1.5rem',
                        background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                        color: '#002d6c',
                        fontFamily: 'var(--font-headline)', fontSize: '2rem',
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        border: 'none', cursor: 'none',
                        boxShadow: '0 0 20px rgba(47,126,255,0.2)',
                        transition: 'filter 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                    onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
                >
                    {isSimulating ? 'SIMULATING...' : 'Run Mutation Simulator'}
                </button>
            </section>

            {/* ══ MIDDLE PANEL: SEQUENCE DIFF ══ */}
            <section className="panel-divider" style={{ ...panelBase, width: '34%', background: 'var(--bg)' }}>
                <header>
                    <div className="section-label teal">COMPARISON_MATRIX // REALTIME</div>
                    <h2 className="page-heading" style={{ fontSize: '3rem' }}>Sequence Diff</h2>
                </header>

                {/* Original / mutated sequences */}
                <div style={{ background: 'rgba(25,27,37,0.3)', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-data)', fontSize: 8, color: 'rgba(47,126,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                        <span>ORIGINAL_SEQ</span><span>LEN: 120BP</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-data)', fontSize: 13, color: 'rgba(0,212,170,0.5)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', opacity: 0.8 }}>
                        {(impactData?.baseline_translation?.amino_acid_sequence?.slice(0, 15) || 'ATG GCC TTG CAG AAA').split(' ').map((c, i) => <span key={i}>{c}</span>)}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-data)', fontSize: 8, color: 'rgba(255,180,171,0.4)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                        <span>MUTATED_SEQ</span>
                        <span>Δ_VAR: {impactData?.variant_annotation || 'P.GLY42VAL'}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-data)', fontSize: 13, display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {(['ATG', 'GCC', 'TAG', 'CAG', 'AAA'] as const).map((c, i) => (
                            <span key={i} style={{
                                color:          i === 2 ? 'var(--error)' : 'rgba(0,212,170,0.5)',
                                background:     i === 2 ? 'rgba(255,180,171,0.1)' : 'transparent',
                                textDecoration: i === 2 ? 'underline' : 'none',
                                textDecorationColor: 'rgba(255,180,171,0.5)',
                                padding:        i === 2 ? '0 6px' : 0,
                                fontWeight:     i === 2 ? 700 : 400,
                            }}>{c}</span>
                        ))}
                    </div>
                </div>

                {/* Metric cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[
                        { label: 'Pathogenicity', pct: pathoPct,  color: 'var(--error)',   glow: 'rgba(255,180,171,0.5)' },
                        { label: 'Conservation',  pct: conservPct, color: 'var(--primary)', glow: 'rgba(47,126,255,0.5)'  },
                    ].map(m => (
                        <div key={m.label} style={{ background: 'rgba(25,27,37,0.3)', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '3.5rem', color: m.color, opacity: 0.9, lineHeight: 1 }}>{m.pct}%</div>
                            <div style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: m.color, opacity: 0.4, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 8 }}>{m.label}</div>
                            <div style={{ width: '100%', height: 4, background: 'var(--surface-container-highest)', marginTop: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${m.pct}%`, background: m.color, boxShadow: `0 0 10px ${m.glow}` }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mutation fingerprint */}
                <div style={{ border: '1px solid var(--border)', background: 'var(--surface-container-lowest)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div className="section-label" style={{ marginBottom: '1.5rem' }}>Mutation Fingerprint</div>
                    <div style={{ height: 144, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <svg id="fingerprint-svg" viewBox="0 0 100 100" style={{ width: 128, height: 128, opacity: 0.4 }}>
                            <circle cx="50" cy="50" r="48" fill="none" stroke="var(--primary)" strokeDasharray="2 4" strokeWidth="0.5" />
                            <path
                                ref={fpPathRef}
                                fill="none"
                                stroke="var(--secondary)"
                                strokeWidth="1.2"
                                d="M 50,5 Q 55,25 70,20 T 85,40 T 90,60 T 70,85 T 50,95 T 30,85 T 10,60 T 15,40 T 30,20 T 50,5"
                            >
                                <animate attributeName="stroke-dashoffset" dur="10s" from="500" to="0" repeatCount="indefinite" />
                            </path>
                        </svg>
                        {/* Radial fade */}
                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, var(--bg) 90%)', pointerEvents: 'none' }} />
                    </div>
                    <p style={{ fontFamily: 'var(--font-data)', fontSize: 8, textAlign: 'center', color: 'rgba(47,126,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 16 }}>
                        SIGNATURE_ID: 0x9f_ARCHIVE_MATCH
                    </p>
                </div>
            </section>

            {/* ══ RIGHT PANEL: STRUCTURAL VIEW ══ */}
            <section style={{ ...panelBase, width: '34%', background: 'rgba(12,14,23,0.3)' }}>
                <header>
                    <div className="section-label">PROTEIN_FOLDING // UNIT_0</div>
                    <h2 className="page-heading" style={{ fontSize: '3rem' }}>Structural View</h2>
                </header>

                {/* Helix canvas */}
                <div style={{ height: 600, background: 'var(--bg)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                    <InteractiveHelix />
                    {/* Top-left coord label */}
                    <div style={{ position: 'absolute', top: 16, left: 16, fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--secondary)', background: 'rgba(3,4,12,0.8)', border: '1px solid var(--border)', padding: '4px 12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        COORD_Z: 42.001
                    </div>
                    {/* Bottom-right decorative hairlines (from mockup) */}
                    <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', opacity: 0.4 }}>
                        <div style={{ width: 32, height: 2, background: 'rgba(255,255,255,0.2)' }} />
                        <div style={{ width: 16, height: 2, background: 'rgba(255,255,255,0.2)' }} />
                    </div>
                </div>

                {/* Affected codons */}
                <div style={{ background: 'rgba(25,27,37,0.3)', border: '1px solid var(--border)', padding: '1.5rem' }}>
                    <div className="section-label" style={{ marginBottom: '1.25rem' }}>Affected Codons</div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {[
                            { label: 'P.41[HIS]', error: false },
                            { label: 'P.42[VAL]', error: true  },
                            { label: 'P.43[GLN]', error: false },
                        ].map(c => (
                            <div key={c.label} className="chamfer-sm" style={{
                                padding: '6px 20px',
                                background: c.error ? 'rgba(255,180,171,0.1)' : 'rgba(40,41,52,0.4)',
                                border: `1px solid ${c.error ? 'rgba(255,180,171,0.4)' : 'rgba(0,212,170,0.1)'}`,
                                fontFamily: 'var(--font-data)', fontSize: 12,
                                color: c.error ? 'var(--error)' : 'rgba(0,212,170,0.7)',
                            }}>
                                {c.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Requirement #11: Mutation Replay State Series */}
                {impactData?.replay_series && impactData.replay_series.length > 0 && (
                    <div style={{ background: 'rgba(25,27,37,0.3)', border: '1px solid var(--border)', padding: '1rem' }}>
                        <div className="section-label" style={{ marginBottom: 8 }}>MUTATION_REPLAY_SERIES</div>
                        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
                            {impactData.replay_series.map((s, i) => (
                                <div key={i} style={{ 
                                    width: 12, height: 12, borderRadius: '2px',
                                    background: s.verdict === 'Pathogenic' ? 'var(--error)' : 'var(--secondary)',
                                    opacity: 0.8
                                }} title={`Step ${s.step}: ${s.type} - RMSD: ${s.rmsd.toFixed(2)}Å`} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Verdict */}
                <div style={{
                    flex: 1,
                    border: `1px solid ${isPathogenic ? 'rgba(255,180,171,0.3)' : 'rgba(0,212,170,0.3)'}`,
                    background: isPathogenic ? 'rgba(255,180,171,0.05)' : 'rgba(0,212,170,0.05)',
                    padding: '2rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center', gap: '1.5rem',
                    position: 'relative', overflow: 'hidden',
                }}>
                    {/* Corner accents */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: `1px solid ${isPathogenic ? 'var(--error)' : 'var(--secondary)'}`, borderLeft: `1px solid ${isPathogenic ? 'var(--error)' : 'var(--secondary)'}` }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: `1px solid ${isPathogenic ? 'var(--error)' : 'var(--secondary)'}`, borderRight: `1px solid ${isPathogenic ? 'var(--error)' : 'var(--secondary)'}` }} />

                    <span className="material-symbols-outlined" style={{ fontSize: 56, color: isPathogenic ? 'var(--error)' : 'var(--secondary)', opacity: 0.8, fontVariationSettings: "'FILL' 1" }}>
                        {isPathogenic ? 'warning' : 'check_circle'}
                    </span>
                    <div>
                        <div style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: isPathogenic ? 'rgba(255,180,171,0.5)' : 'rgba(0,212,170,0.5)', textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: 10 }}>
                            In Silico Verdict
                        </div>
                        <div style={{ fontFamily: 'var(--font-headline)', fontSize: '2.5rem', color: isPathogenic ? 'var(--error)' : 'var(--secondary)', letterSpacing: '0.05em', lineHeight: 1 }}>
                            {impactData?.ai_predictions.functional_risk || 'PREDICTING...'}
                        </div>
                    </div>
                    {/* Requirement #14: Deterministic Biological Narrative */}
                    <p style={{ 
                        fontFamily: 'var(--font-body)', fontSize: '0.8rem', 
                        color: isPathogenic ? 'rgba(255,180,171,0.7)' : 'rgba(0,212,170,0.7)', 
                        maxWidth: 320, lineHeight: 1.6 
                    }}>
                        {impactData?.ai_predictions.biological_narrative || 'Analyzing sequence dependencies and structural displacement vectors...'}
                    </p>
                </div>

                {/* AI Deep Analysis Drawer */}
                {impactData && (
                    <div>
                        <button
                            onClick={() => setShowDeepAnalysis(!showDeepAnalysis)}
                            style={{
                                width: '100%', background: 'none', border: '1px solid var(--border)',
                                padding: '0.75rem', fontFamily: 'var(--font-data)', fontSize: 9,
                                letterSpacing: '0.3em', color: 'var(--primary)',
                                textTransform: 'uppercase' as const, cursor: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                {showDeepAnalysis ? 'expand_less' : 'expand_more'}
                            </span>
                            {showDeepAnalysis ? 'HIDE' : 'SHOW'} AI DEEP ANALYSIS
                        </button>
                        {showDeepAnalysis && <RiskAnalysisPanel />}
                    </div>
                )}
                
                {impactData && (
                    <button
                        onClick={() => setShowStructureViewer(true)}
                        style={{
                            width: '100%', background: 'var(--secondary)', border: 'none',
                            padding: '0.75rem', fontFamily: 'var(--font-data)', fontSize: 9,
                            letterSpacing: '0.3em', color: '#002d6c', fontWeight: 700,
                            textTransform: 'uppercase' as const, cursor: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            marginTop: '0.75rem', transition: 'all 0.2s',
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                            view_in_ar
                        </span>
                        COMPARE 3D STRUCTURES
                    </button>
                )}

                {/* Footer links strip */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
                    {['TERMINAL_LOGS', 'SYSTEM_BIO'].map(label => (
                        <span key={label} style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(47,126,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3em', cursor: 'none' }}>{label}</span>
                    ))}
                </div>
            </section>
            
            <ProteinStructureViewer3D 
                isOpen={showStructureViewer} 
                onClose={() => setShowStructureViewer(false)} 
            />
        </div>
    );
};

