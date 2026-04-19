import React from 'react';
import { useDNAStore } from '../../store/useDNAStore';

export const ProteinSequenceViewer: React.FC<{ compact?: boolean }> = (_props) => {
    const impactData = useDNAStore(state => state.impactData);

    if (!impactData || !impactData.baseline_translation || !impactData.mutated_translation) {
        return null;
    }

    const { baseline_translation, mutated_translation, variant_annotation } = impactData;
    const wt_aa = baseline_translation.amino_acid_sequence || "";
    const mut_aa = mutated_translation.amino_acid_sequence || "";

    // Calculate length to map over
    const length = Math.max(wt_aa.length, mut_aa.length);

    return (
        <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #333',
            padding: '1.5rem',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '90vw',
            overflowX: 'auto',
            pointerEvents: 'auto',
            zIndex: 10
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', color: '#888' }}>PROTEIN TRANSLATION (AMINO ACIDS)</span>
                {baseline_translation.has_stop_codon && <span style={{ color: '#eab308', fontSize: '0.8rem' }}>⚠️ TERMINATION CODON DETECTED</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {/* Wild-Type Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '100px', color: '#666', fontSize: '0.8rem' }}>WILD-TYPE</span>
                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                        {Array.from({ length }).map((_, i) => (
                            <div key={`wt-${i}`} style={getBlockStyle(wt_aa[i], false, false)}>
                                {wt_aa[i] || '-'}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mutated Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '100px', color: variant_annotation === 'Silent' ? '#22c55e' : '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>MUTATED</span>
                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                        {Array.from({ length }).map((_, i) => {
                            const isChanged = wt_aa[i] !== mut_aa[i];
                            const isEmpty = !mut_aa[i];
                            return (
                                <div key={`mut-${i}`} style={getBlockStyle(mut_aa[i] || '-', isChanged, isEmpty)}>
                                    {mut_aa[i] || '-'}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {(baseline_translation.structural_warnings.length > 0) && (
                <div style={{ marginTop: '0.5rem', color: '#888', fontSize: '0.7rem' }}>
                    {baseline_translation.structural_warnings.join(' | ')}
                </div>
            )}
        </div>
    );
};

const getBlockStyle = (char: string | undefined, isChanged: boolean, isEmpty: boolean): React.CSSProperties => {
    let background = '#1a1a1a';
    let color = '#888';
    let border = '1px solid #333';

    if (char === '*') {
        background = '#ef444433';
        color = '#ef4444';
        border = '1px solid #ef4444';
    } else if (isChanged) {
        background = '#eab30833';
        color = '#eab308';
        border = '1px solid #eab308';
    } else if (char && char !== '-') {
        background = '#22c55e22';
        color = '#22c55e';
    }

    if (isEmpty) {
        background = 'transparent';
        border = '1px dashed #333';
    }

    return {
        width: '30px',
        height: '35px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        color,
        border,
        borderRadius: '3px',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        transition: 'all 0.3s ease'
    };
};
