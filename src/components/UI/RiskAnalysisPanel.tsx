import React from 'react';
import { useDNAStore } from '../../store/useDNAStore';

/**
 * RiskAnalysisPanel
 * Detailed AI risk breakdown with evidence sources, molecular consequences,
 * and confidence scoring. Slides in below the verdict on SimulatorPage.
 */
export const RiskAnalysisPanel: React.FC = () => {
    const impactData = useDNAStore(s => s.impactData);

    if (!impactData?.ai_predictions) return null;

    const { ai_predictions } = impactData;
    const explain = ai_predictions.explainability;
    const classifier = ai_predictions.classifier_result;

    if (!explain && !classifier) return null;

    const getVerdictColor = (verdict: string) => {
        if (verdict.includes('Pathogenic')) return 'var(--error)';
        if (verdict.includes('Benign')) return 'var(--secondary)';
        return 'var(--primary)';
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            border: '1px solid var(--border)',
            background: 'rgba(12,14,23,0.4)',
            padding: '1.5rem',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                borderBottom: '1px solid var(--border)', paddingBottom: '1rem',
            }}>
                <span className="material-symbols-outlined" style={{
                    fontSize: 18, color: 'var(--primary)'
                }}>insights</span>
                <span style={{
                    fontFamily: 'var(--font-data)', fontSize: 10,
                    letterSpacing: '0.3em', color: 'var(--primary)',
                    textTransform: 'uppercase' as const,
                }}>
                    AI DEEP ANALYSIS
                </span>
                {explain && (
                    <span className="pill pill-blue" style={{ marginLeft: 'auto', fontSize: 8 }}>
                        {explain.confidence_level} CONFIDENCE
                    </span>
                )}
            </div>

            {/* Biological Narrative */}
            {ai_predictions.biological_narrative && (
                <div>
                    <div className="section-label" style={{ marginBottom: 8 }}>BIOLOGICAL SUMMARY</div>
                    <p style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
                    }}>
                        {ai_predictions.biological_narrative}
                    </p>
                </div>
            )}

            {/* Molecular Consequences */}
            {explain?.molecular_consequences && explain.molecular_consequences.length > 0 && (
                <div>
                    <div className="section-label" style={{ marginBottom: 8 }}>MOLECULAR CONSEQUENCES</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {explain.molecular_consequences.map((c, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 8,
                                fontFamily: 'var(--font-data)', fontSize: 10,
                                color: 'rgba(255,255,255,0.5)',
                            }}>
                                <span style={{
                                    width: 4, height: 4, background: 'var(--primary)',
                                    flexShrink: 0, marginTop: 5,
                                }} />
                                {c}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Evidence Sources */}
            {explain?.evidence_sources && explain.evidence_sources.length > 0 && (
                <div>
                    <div className="section-label" style={{ marginBottom: 8 }}>EVIDENCE SOURCES</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {explain.evidence_sources.map((e, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '0.75rem',
                                background: 'rgba(25,27,37,0.3)',
                                border: '1px solid rgba(255,255,255,0.03)',
                            }}>
                                {/* Weight bar */}
                                <div style={{
                                    width: 4, height: 32, background: 'var(--surface-container-highest)',
                                    position: 'relative', flexShrink: 0,
                                }}>
                                    <div style={{
                                        position: 'absolute', bottom: 0, left: 0,
                                        width: '100%', height: `${e.weight * 100}%`,
                                        background: getVerdictColor(e.verdict),
                                    }} />
                                </div>
                                
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', marginBottom: 4,
                                    }}>
                                        <span style={{
                                            fontFamily: 'var(--font-data)', fontSize: 9,
                                            color: 'rgba(255,255,255,0.7)',
                                            textTransform: 'uppercase' as const,
                                            letterSpacing: '0.15em',
                                        }}>
                                            {e.source}
                                        </span>
                                        <span style={{
                                            fontFamily: 'var(--font-data)', fontSize: 9,
                                            color: getVerdictColor(e.verdict),
                                            fontWeight: 700,
                                        }}>
                                            {e.verdict}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontFamily: 'var(--font-data)', fontSize: 8,
                                        color: 'rgba(255,255,255,0.3)',
                                    }}>
                                        {e.detail}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ESM-2 650M Metrics (Requirement #5, #9) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(25,27,37,0.3)', border: '1px solid var(--border)', padding: '0.75rem' }}>
                    <div className="section-label" style={{ marginBottom: 4 }}>ESM-2 LLR SCORE</div>
                    <div style={{ fontFamily: 'var(--font-headline)', fontSize: '1.4rem', color: 'var(--secondary)' }}>
                        {ai_predictions.llr_score?.toFixed(2) || '0.00'}
                    </div>
                </div>
                <div style={{ background: 'rgba(25,27,37,0.3)', border: '1px solid var(--border)', padding: '0.75rem' }}>
                    <div className="section-label" style={{ marginBottom: 4 }}>STABILITY (ΔΔG)</div>
                    <div style={{ fontFamily: 'var(--font-headline)', fontSize: '1.4rem', color: 'var(--error)' }}>
                        {ai_predictions.stability_score?.toFixed(2) || '0.00'}
                    </div>
                </div>
            </div>

            {/* SHAP Explainability (Requirement #8) */}
            {ai_predictions.shap_values && ai_predictions.shap_values.length > 0 && (
                <div>
                    <div className="section-label" style={{ marginBottom: 8 }}>FEATURE IMPORTANCE (SHAP)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {ai_predictions.shap_values.slice(0, 5).map((sv, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ 
                                    fontFamily: 'var(--font-data)', fontSize: 8, color: 'rgba(255,255,255,0.4)', 
                                    width: 100, textTransform: 'uppercase', letterSpacing: '0.1em' 
                                }}>
                                    {sv.feature}
                                </div>
                                <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                                    <div style={{ 
                                        position: 'absolute', top: 0, 
                                        left: sv.value >= 0 ? '50%' : `${50 + (sv.value * 100)}%`,
                                        width: `${Math.abs(sv.value * 100)}%`, 
                                        height: '100%', 
                                        background: sv.value >= 0 ? 'var(--primary)' : 'var(--error)'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Residue Importance / Attention Map (Requirement #9) */}
            {ai_predictions.attention_map && ai_predictions.attention_map.length > 0 && (
                <div>
                    <div className="section-label" style={{ marginBottom: 8 }}>RESIDUE SENSITIVITY GRADIENT</div>
                    <div style={{ 
                        display: 'flex', gap: 1, height: 24, padding: 4, 
                        background: 'rgba(3,4,12,0.5)', border: '1px solid rgba(255,255,255,0.05)' 
                    }}>
                        {ai_predictions.attention_map.slice(0, 50).map((row, i) => {
                            // Sum across the row to get residue attention score
                            const imp = row.reduce((a, b) => a + b, 0) / (row.length || 1);
                            return (
                                <div key={i} style={{
                                    flex: 1,
                                    background: imp > 0.1 ? 'var(--error)' : 'var(--primary)',
                                    opacity: 0.2 + Math.min(1, imp * 2),
                                    height: '100%'
                                }} />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Classifier Confidence */}
            {classifier && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    borderTop: '1px solid var(--border)', paddingTop: '1rem',
                }}>
                    {/* Mini ring */}
                    <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                        <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                            <defs>
                                <linearGradient id="cls-ring" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="var(--primary)" />
                                    <stop offset="100%" stopColor="var(--secondary)" />
                                </linearGradient>
                            </defs>
                            <circle
                                cx="24" cy="24" r="20" fill="none" stroke="url(#cls-ring)" strokeWidth="3"
                                strokeDasharray={2 * Math.PI * 20}
                                strokeDashoffset={(2 * Math.PI * 20) * (1 - classifier.confidence)}
                                strokeLinecap="butt"
                            />
                        </svg>
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-data)', fontSize: 10, fontWeight: 700,
                        }}>
                            {Math.round(classifier.confidence * 100)}%
                        </div>
                    </div>
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-data)', fontSize: 10,
                            color: getVerdictColor(classifier.classification),
                            fontWeight: 700, textTransform: 'uppercase' as const,
                            letterSpacing: '0.2em',
                        }}>
                            {classifier.classification}
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-data)', fontSize: 8,
                            color: 'rgba(255,255,255,0.3)', marginTop: 4,
                            textTransform: 'uppercase' as const,
                        }}>
                            ML CLASSIFIER // ENSEMBLE PREDICTION
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
