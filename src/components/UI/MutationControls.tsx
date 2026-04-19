import React from 'react';
import { useDNAStore } from '../../store/useDNAStore';
import { Trash2, Plus, RefreshCw, AlertTriangle, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';

export const MutationControls: React.FC = () => {
    const selectedId = useDNAStore(state => state.selectedId);
    const performMutation = useDNAStore(state => state.performMutation);
    const helix = useDNAStore(state => state.helix);
    const impactData = useDNAStore(state => state.impactData);
    const isSimulating = useDNAStore(state => state.isSimulating);

    if (!selectedId) {
        return (
            <div style={{
                position: 'absolute',
                bottom: '2rem',
                left: '2rem',
                color: '#666',
                fontFamily: 'monospace',
                pointerEvents: 'none'
            }}>
                SELECT A BASE PAIR TO EDIT
            </div>
        );
    }

    const selectedNode = helix.find(h => h.id === selectedId);

    const getRiskSettings = (risk: string) => {
        switch (risk) {
            case 'Pathogenic': return { color: '#ef4444', icon: <AlertTriangle size={14} /> };
            case 'Benign': return { color: '#22c55e', icon: <CheckCircle size={14} /> };
            default: return { color: '#eab308', icon: <HelpCircle size={14} /> };
        }
    };

    const riskSettings = impactData ? getRiskSettings(impactData.ai_predictions.functional_risk) : null;

    const embedding = impactData?.ai_predictions?.embedding_analysis;
    const classifier = impactData?.ai_predictions?.classifier_result;

    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            right: '2rem',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'flex-end',
            pointerEvents: 'auto'
        }}>
            <div style={{
                marginBottom: '1rem',
                textAlign: 'right',
                color: '#fff',
                fontFamily: 'monospace'
            }}>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>ID: {selectedId.slice(0, 8)}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {selectedNode?.type[0]} - {selectedNode?.type[1]}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>INDEX: {selectedNode?.index}</div>
            </div>

            <button
                onClick={() => performMutation('substitution', selectedId)}
                style={buttonStyle}
                disabled={isSimulating}
            >
                {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} SUBSTITUTION
            </button>

            <button
                onClick={() => performMutation('insertion', selectedId)}
                style={buttonStyle}
                disabled={isSimulating}
            >
                {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} INSERTION
            </button>

            <button
                onClick={() => performMutation('deletion', selectedId)}
                style={buttonStyle}
                disabled={isSimulating}
            >
                {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} DELETION
            </button>

            {/* AI Interpretability HUD */}
            {impactData && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    border: `1px solid ${riskSettings?.color}`,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    maxWidth: '280px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    color: '#fff'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem', color: riskSettings?.color, fontWeight: 'bold' }}>
                        {riskSettings?.icon} AI IMPACT ASSESSMENT
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.2rem' }}>VARIANT ANNOTATION</div>
                    <div style={{ fontSize: '1rem', marginBottom: '1rem' }}>{impactData.variant_annotation}</div>

                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.2rem' }}>FUNCTIONAL RISK</div>
                    <div style={{ fontSize: '1.2rem', color: riskSettings?.color, fontWeight: 'bold', marginBottom: '1rem' }}>
                        {impactData.ai_predictions.functional_risk.toUpperCase()}
                    </div>

                    {/* Confidence Score */}
                    {classifier && (
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.3rem' }}>ML CONFIDENCE</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <div style={{
                                    flex: 1, height: 4, background: '#222', borderRadius: 2, overflow: 'hidden',
                                }}>
                                    <div style={{
                                        height: '100%', width: `${classifier.confidence * 100}%`,
                                        background: `linear-gradient(90deg, var(--primary), var(--secondary))`,
                                        borderRadius: 2,
                                        transition: 'width 0.5s ease',
                                    }} />
                                </div>
                                <span style={{ fontSize: '0.9rem', color: riskSettings?.color, fontWeight: 'bold' }}>
                                    {Math.round(classifier.confidence * 100)}%
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ESM Embedding Distance */}
                    {embedding && embedding.cosine_distance > 0 && (
                        <div style={{
                            borderTop: '1px solid #333', paddingTop: '0.5rem', marginTop: '0.5rem',
                            marginBottom: '0.5rem',
                        }}>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.2rem' }}>ESM-2 EMBEDDING</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: '0.65rem', color: '#555' }}>COSINE DIST</div>
                                    <div style={{ fontSize: '0.85rem', color: embedding.cosine_distance > 0.1 ? '#ef4444' : '#22c55e' }}>
                                        {embedding.cosine_distance.toFixed(4)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#555' }}>RISK SCORE</div>
                                    <div style={{ fontSize: '0.85rem', color: embedding.embedding_risk_score > 0.5 ? '#ef4444' : '#eab308' }}>
                                        {embedding.embedding_risk_score.toFixed(3)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Existing metrics */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666' }}>ΔΔG STABILITY</div>
                            <div style={{ fontSize: '0.9rem', color: impactData.ai_predictions.stability_score < 0 ? '#ef4444' : '#22c55e' }}>
                                {impactData.ai_predictions.stability_score > 0 ? '+' : ''}{impactData.ai_predictions.stability_score.toFixed(2)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666' }}>SEVERITY INDEX</div>
                            <div style={{ fontSize: '0.9rem' }}>{impactData.ai_predictions.aggregation_risk.toFixed(2)}</div>
                        </div>
                    </div>

                    {/* Biological narrative (condensed) */}
                    {impactData.ai_predictions.biological_narrative && (
                        <div style={{
                            borderTop: '1px solid #333', paddingTop: '0.5rem', marginTop: '0.5rem',
                            fontSize: '0.65rem', color: '#888', lineHeight: 1.6,
                            textAlign: 'left',
                        }}>
                            {impactData.ai_predictions.biological_narrative.slice(0, 160)}
                            {impactData.ai_predictions.biological_narrative.length > 160 ? '...' : ''}
                        </div>
                    )}
                </div>
            )}

            {/* Loading Skeleton */}
            {!impactData && isSimulating && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    border: '1px solid #333',
                    background: '#000',
                    maxWidth: '250px',
                    textAlign: 'right',
                    fontFamily: 'monospace'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', color: '#444' }}>
                        <Loader2 size={14} className="animate-spin" /> RUNNING AI PIPELINE...
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.6rem', color: '#333' }}>
                        ESM-2 → CLASSIFIER → EXPLAINABILITY
                    </div>
                </div>
            )}
        </div>
    );
};

const buttonStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid #fff',
    color: '#fff',
    padding: '0.8rem 1.2rem',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    justifyContent: 'flex-end',
    transition: 'all 0.2s ease',
};
