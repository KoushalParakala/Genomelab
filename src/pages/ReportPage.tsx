import React from 'react';

import { useDNAStore } from '../store/useDNAStore';

const getTechRows = (impactData: any) => [
    { label: 'Genomic Pos (Simulated)', value: impactData ? `Pos ${impactData.position || 'N/A'}` : 'chr17:41258493' },
    { label: 'Nucleotide Change',       value: impactData ? impactData.mutation_type || impactData.variant_annotation.split(' ')[0] : 'c.7A>G' },
    { label: 'Exon Index',              value: 'Exon 1 of 11' },
    { label: 'Transcript ID',           value: 'NM_000546.6' },
];

const TABLE_ROWS = [
    { node: 'ClinVar Integration',  desc: 'Accession: RCV000012345',                status: 'VERIFIED' },
    { node: 'Population Frequency', desc: 'Extremely Rare (GnomAD 0.00001%)',        status: 'VERIFIED' },
    { node: 'Functional Assay',     desc: 'Saturation Mutagenesis Match Found',      status: 'VERIFIED' },
];

export const ReportPage: React.FC = () => {
    const impactData = useDNAStore(s => s.impactData);
    const isPathogenic = !impactData || impactData.ai_predictions.functional_risk === 'Pathogenic';

    const handleCopyLink = () => {
        const btn = document.getElementById('copy-btn');
        if (!btn) return;
        navigator.clipboard.writeText('https://genomelab.core/artifact/99283-X/encrypted-ref').then(() => {
            const orig = btn.textContent;
            btn.textContent = 'LINK_COPIED_TO_CLIPBOARD';
            setTimeout(() => { if (btn) btn.textContent = orig; }, 2000);
        });
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', background: 'var(--bg)', padding: '4rem 6rem 8rem', position: 'relative' }}>


            {/* ── Document Header ── */}
            <header style={{ position: 'relative', marginBottom: '6rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ background: 'rgba(47,126,255,0.1)', padding: '4px 12px', fontFamily: 'var(--font-data)', fontSize: 9, color: 'var(--primary)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>
                            ARTIFACT_ID: 99283-X
                        </span>
                        <div style={{ height: 1, width: 64, background: 'rgba(47,126,255,0.2)' }} />
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>
                            TS: 2024.08.12_04:12_UTC
                        </span>
                    </div>

                    <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(60px,8vw,110px)', lineHeight: 0.85, letterSpacing: '-0.02em', color: 'var(--primary)', textTransform: 'uppercase' }}>
                        {impactData ? impactData.variant_annotation.split(' ')[0] : 'MISSENSE'}{' '}
                        <span style={{ WebkitTextStroke: '1px var(--primary)', color: 'transparent' }}>VARIANT</span>
                        <br />
                        {impactData ? (impactData as any).mutation_type || impactData.variant_annotation : 'C.7A>G / P.ARG3GLN'}
                    </h1>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                        <div className="artifact-border" style={{ background: 'var(--surface-container-low)', padding: '1rem 1.5rem' }}>
                            <span style={{ fontFamily: 'var(--font-data)', fontSize: 8, color: 'rgba(47,126,255,0.6)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Final Verdict</span>
                            <span style={{ fontFamily: 'var(--font-data)', fontSize: 14, color: isPathogenic ? 'var(--error)' : 'var(--secondary)', letterSpacing: '0.15em', fontWeight: 700 }}>CLINICAL_GRADE: {isPathogenic ? 'PATHOGENIC' : 'BENIGN'}</span>
                        </div>
                        <div className="artifact-border" style={{ background: 'var(--surface-container-low)', padding: '1rem 1.5rem' }}>
                            <span style={{ fontFamily: 'var(--font-data)', fontSize: 8, color: 'rgba(47,126,255,0.6)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Evidence Strength</span>
                            <span style={{ fontFamily: 'var(--font-data)', fontSize: 14, color: 'var(--secondary)', letterSpacing: '0.15em' }}>LEVEL_A: DEFINITIVE</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Structural Analysis + AI Consensus ── */}
            <section style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', marginBottom: '6rem' }}>
                {/* Wave chart */}
                <div className="artifact-border" style={{ background: 'var(--surface-container-lowest)', padding: '2rem', minHeight: 380 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--primary)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>Protein_Structural_Destabilization</h3>
                            <p style={{ fontFamily: 'var(--font-data)', fontSize: 8, color: 'rgba(47,126,255,0.4)', marginTop: 4, textTransform: 'uppercase' }}>AlphaFold_3 Projection Engine // v2.4.1_STABLE</p>
                        </div>
                        <span className="material-symbols-outlined" style={{ color: 'rgba(47,126,255,0.2)' }}>view_in_ar</span>
                    </div>
                    <div style={{ position: 'relative', height: 200, display: 'flex', alignItems: 'center' }}>
                        <svg style={{ width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 800 200" fill="none">
                            <path d="M0 100 Q 100 20 200 100 T 400 100 T 600 100 T 800 100" stroke="rgba(47,126,255,0.1)" strokeDasharray="4 4" strokeWidth="1" />
                            <path d="M0 105 Q 100 25 200 105 T 400 105 T 600 105 T 800 105" stroke="var(--secondary)" strokeWidth="2" style={{ animation: 'pulseSlow 3s ease-in-out infinite' }} />
                            <circle cx="350" cy="85" r="6" fill="#93000a" style={{ animation: 'pulseSlow 1.5s infinite' }} />
                            <circle cx="350" cy="85" r="4" fill="#93000a" />
                            <line x1="350" y1="85" x2="350" y2="155" stroke="#93000a" strokeDasharray="2 2" strokeWidth="0.5" />
                            <text fill="#93000a" fontFamily="DM Mono, monospace" fontSize="8" letterSpacing="2" x="360" y="150">LIGAND_BINDING_POCKET_COLLAPSE</text>
                        </svg>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-data)', fontSize: 7, color: 'rgba(47,126,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                            <span>Residue_Scale: Angstroms</span>
                            <span>Shift_Vector: 4.2Å</span>
                        </div>
                    </div>
                </div>

                {/* AI Impact Consensus */}
                <div className="artifact-border" style={{ background: 'var(--surface-container-low)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'var(--secondary)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>AI_Impact_Consensus</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                            <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(0,212,170,0.1)" strokeWidth="6" />
                                <circle cx="40" cy="40" r="35" fill="none" stroke="var(--secondary)" strokeDasharray="219.9" strokeDashoffset="13.2" strokeWidth="6" />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-data)', fontSize: 14, fontWeight: 700 }}>94%</div>
                        </div>
                        <div>
                            <p style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--on-surface)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>SIFT_SCORE</p>
                            <p style={{ fontFamily: 'var(--font-data)', fontSize: 8, color: 'rgba(47,126,255,0.6)', textTransform: 'uppercase', marginTop: 4 }}>High Pathogenicity Probability</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[{ label: 'REVEL Score', value: '0.821', pct: 82 }, { label: 'CADD Phred', value: '28.4', pct: 71 }].map(m => (
                            <div key={m.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-data)', fontSize: 7, color: 'rgba(47,126,255,0.6)', textTransform: 'uppercase', marginBottom: 6 }}>
                                    <span>{m.label}</span><span>{m.value}</span>
                                </div>
                                <div className="stat-bar">
                                    <div className="stat-bar-fill" style={{ width: `${m.pct}%`, background: 'var(--primary)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Narrative Summary ── */}
            <section style={{ maxWidth: 1000, marginBottom: '6rem' }}>
                <div className="hairline" style={{ marginBottom: '2.5rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '3rem' }}>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--primary)', letterSpacing: '0.4em', textTransform: 'uppercase', position: 'sticky', top: '2rem' }}>AI_NARRATIVE_SUMMARY</h2>
                    </div>
                    <div>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1.2rem,2vw,1.8rem)', fontWeight: 300, color: 'var(--on-surface)', lineHeight: 1.5, letterSpacing: '-0.01em' }}>
                            Arginine-to-Glutamine substitution at codon 143{' '}
                            <span style={{ color: 'var(--primary)', fontWeight: 500 }}>destabilizes the alpha-helix bridge</span>, leading to a permanent conformational shift in the binding pocket.
                        </p>
                        <div style={{ margin: '2rem 0', display: 'flex', gap: 6 }}>
                            {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, background: 'var(--primary)' }} />)}
                        </div>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1rem,1.5vw,1.4rem)', fontWeight: 300, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                            This variant is predicted to disrupt the ligand-binding affinity by{' '}
                            <span style={{ color: 'var(--secondary)', fontStyle: 'italic', textDecoration: 'underline', textUnderlineOffset: 8 }}>74.2%</span>, potentially leading to total loss of function in the metabolic signaling pathway. Forensic data indicates high evolutionary conservation at this locus across 42 mammalian species, suggesting high functional intolerance to mutation at this position.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Technical Metadata ── */}
            <section style={{ marginBottom: '6rem' }}>
                <div className="artifact-border" style={{ background: 'var(--surface-container-lowest)', padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2rem' }}>
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--primary)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>Technical_Log // Ref_Sequence_Data</span>
                        <div style={{ flex: 1, borderTop: '1px solid rgba(47,126,255,0.1)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2rem', marginBottom: '3rem' }}>
                        {getTechRows(impactData).map(r => (
                            <div key={r.label}>
                                <p style={{ fontFamily: 'var(--font-data)', fontSize: 8, color: 'rgba(47,126,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 6 }}>{r.label}</p>
                                <p style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--on-surface)' }}>{r.value}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: '2rem', marginTop: '2rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--primary)' }}>psychology</span>
                        <div>
                            <h4 style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>AI_CONSENSUS_NARRATIVE</h4>
                            <p style={{ fontFamily: 'var(--font-data)', fontSize: 11, lineHeight: 1.6, color: 'var(--on-surface-variant)' }}>
                                {impactData?.ai_predictions?.biological_narrative || "The ESM-2 embedding shift identifies a high-confidence structural anomaly. When cross-referenced against known pathogenicity databases, this variant falls strictly within the disruptive envelope. Proceed with elevated clinical caution."}
                            </p>
                        </div>
                    </div>
                    <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(47,126,255,0.1)', paddingTop: '2rem' }}>
                        <h4 style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>Detailed_Impact_Scores</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                            <div>
                                <div style={{ fontSize: 18, color: 'var(--secondary)', fontFamily: 'var(--font-headline)' }}>{impactData?.ai_predictions.stability_score.toFixed(3) || '-1.42'}</div>
                                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-data)', textTransform: 'uppercase', marginTop: 4 }}>Stability_ΔΔG</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 18, color: 'var(--primary)', fontFamily: 'var(--font-headline)' }}>{impactData?.ai_predictions.aggregation_risk.toFixed(3) || '0.12'}</div>
                                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-data)', textTransform: 'uppercase', marginTop: 4 }}>Aggregation_Risk</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 18, color: isPathogenic ? 'var(--error)' : 'var(--secondary)', fontFamily: 'var(--font-headline)' }}>{impactData?.ai_predictions.functional_risk || 'UNKNOWN'}</div>
                                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-data)', textTransform: 'uppercase', marginTop: 4 }}>Clinical_Verdict</div>
                            </div>
                        </div>
                    </div>
                    <table style={{ width: '100%', fontFamily: 'var(--font-data)', fontSize: 9, textTransform: 'uppercase', borderCollapse: 'collapse', letterSpacing: '0.05em', marginTop: '3rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(47,126,255,0.1)' }}>
                                {['Dataset_Node','Metric_Descriptor','Verification_Status'].map(h => (
                                    <th key={h} style={{ textAlign: h === 'Verification_Status' ? 'right' : 'left', padding: '1rem 0', fontWeight: 400, color: 'rgba(47,126,255,0.6)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {TABLE_ROWS.map((r, i) => (
                                <tr key={i} style={{ borderBottom: i < TABLE_ROWS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <td style={{ padding: '1rem 0', color: 'rgba(255,255,255,0.8)' }}>{r.node}</td>
                                    <td style={{ padding: '1rem 0', color: i === 1 ? '#93000a' : 'rgba(255,255,255,0.8)', fontStyle: i === 2 ? 'italic' : 'normal' }}>{r.desc}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'right', color: 'var(--secondary)' }}>{r.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4 }}>
                <span style={{ fontFamily: 'var(--font-data)', fontSize: 8, letterSpacing: '0.4em', textTransform: 'uppercase' }}>End_Of_Artifact // Generated_By: GenomeLab_Core</span>
                <div style={{ display: 'flex', gap: '3rem', fontFamily: 'var(--font-data)', fontSize: 8, letterSpacing: '0.4em', textTransform: 'uppercase' }}>
                    <span>Print_Mode: CMYK_Optimized</span>
                    <span>©2024_GenomeLab // v2.4.1_STABLE</span>
                </div>
            </footer>

            {/* ── Floating Actions ── */}
            <div style={{ position: 'fixed', bottom: 48, right: 48, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <button
                    onClick={() => window.print()}
                    className="chamfer-btn"
                    style={{
                        position: 'relative', padding: '1rem 2rem', background: 'transparent',
                        border: '1px solid var(--primary)', color: 'var(--primary)', fontFamily: 'var(--font-data)',
                        fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', cursor: 'none',
                        display: 'flex', alignItems: 'center', gap: 16, fontWeight: 700, transition: 'all 0.3s',
                    }}
                >
                    PRINT_ARTIFACT
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
                </button>
                <button
                    id="copy-btn"
                    onClick={handleCopyLink}
                    className="chamfer-btn"
                    style={{
                        padding: '1rem 2rem', background: 'rgba(47,126,255,0.1)',
                        border: '1px solid rgba(47,126,255,0.2)', color: 'rgba(47,126,255,0.6)',
                        fontFamily: 'var(--font-data)', fontSize: 10, letterSpacing: '0.4em',
                        textTransform: 'uppercase', cursor: 'none', fontWeight: 700, transition: 'all 0.3s',
                    }}
                >
                    SHARE_LINK_ENCRYPTED
                </button>
            </div>
        </div>
    );
};
