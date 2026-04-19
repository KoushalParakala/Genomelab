import React from 'react';
import { useDNAStore } from '../../store/useDNAStore';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    // For a real implementation, you'd pass the actual selected mutation IDs
    selectedIds?: string[];
}

export const MutationComparisonPanel: React.FC<Props> = ({ isOpen, onClose }) => {
    const impactData = useDNAStore(s => s.impactData);

    if (!isOpen) return null;

    // We'll mock the comparison based on current impact data if real ones aren't provided
    const comp1 = impactData ? { name: impactData.variant_annotation, risk: impactData.ai_predictions.functional_risk, stab: impactData.ai_predictions.stability_score } : { name: 'CRYPTO-GENE_01', risk: 'Benign', stab: 88.4 };
    const comp2 = { name: 'HEMOGLOBIN_MOD_X', risk: 'Pathogenic', stab: -24.1 };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '4rem',
            animation: 'fadeIn 0.3s ease',
        }}>
            <div style={{
                background: 'rgba(12,14,23,0.95)',
                border: '1px solid var(--primary)',
                width: '100%', maxWidth: 1000,
                position: 'relative',
                display: 'flex', flexDirection: 'column',
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10,
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                        cursor: 'none', padding: '0.5rem', fontSize: 24,
                    }}
                >
                    ✕
                </button>

                <div style={{ padding: '2rem 3rem', borderBottom: '1px solid rgba(47,126,255,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 28, animation: 'pulseSlow 2s infinite' }}>compare_arrows</span>
                        <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2.5rem', color: 'var(--primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            MUTATION_COMPARE_ANALYSIS
                        </h2>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '2rem', padding: '3rem' }}>
                    
                    {/* Variant 1 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <span style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.3em', display: 'block', marginBottom: 8 }}>VARIANT_ALPHA</span>
                            <span style={{ fontFamily: 'var(--font-data)', fontSize: 24, color: comp1.risk === 'Pathogenic' ? 'var(--error)' : 'var(--secondary)' }}>{comp1.name}</span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: '2rem', alignItems: 'start' }}>
                            <div style={{ position: 'relative', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: `1px solid ${comp1.risk === 'Pathogenic' ? 'var(--error)' : 'var(--secondary)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontFamily: 'var(--font-headline)', fontSize: '2.5rem', color: 'var(--on-surface)' }}>{Math.round(Math.abs(comp1.stab) * 100)}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 12 }}>
                                <div>
                                    <span style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>CLINICAL_RISK</span>
                                    <div style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: comp1.risk === 'Pathogenic' ? 'var(--error)' : 'var(--secondary)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{comp1.risk}</div>
                                </div>
                                <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />
                                <div>
                                    <span style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>ESM_COMPATIBILITY</span>
                                    <div style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: 'var(--on-surface)', marginTop: 4 }}>98.2% MATCH</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(47,126,255,0.2)' }} />

                    {/* Variant 2 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <span style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.3em', display: 'block', marginBottom: 8 }}>VARIANT_BETA</span>
                            <span style={{ fontFamily: 'var(--font-data)', fontSize: 24, color: comp2.risk === 'Pathogenic' ? 'var(--error)' : 'var(--secondary)' }}>{comp2.name}</span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: '2rem', alignItems: 'start' }}>
                            <div style={{ position: 'relative', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: `1px solid ${comp2.risk === 'Pathogenic' ? 'var(--error)' : 'var(--secondary)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontFamily: 'var(--font-headline)', fontSize: '2.5rem', color: 'var(--on-surface)' }}>{Math.round(Math.abs(comp2.stab))}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 12 }}>
                                <div>
                                    <span style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>CLINICAL_RISK</span>
                                    <div style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: comp2.risk === 'Pathogenic' ? 'var(--error)' : 'var(--secondary)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{comp2.risk}</div>
                                </div>
                                <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />
                                <div>
                                    <span style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>ESM_COMPATIBILITY</span>
                                    <div style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: 'var(--on-surface)', marginTop: 4 }}>42.1% MATCH</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '2rem 3rem', background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center' }}>
                    <button onClick={onClose} className="chamfer-btn" style={{ padding: '1rem 3rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', fontFamily: 'var(--font-data)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'none' }}>
                        CLOSE_COMPARISON
                    </button>
                </div>
            </div>
        </div>
    );
};
