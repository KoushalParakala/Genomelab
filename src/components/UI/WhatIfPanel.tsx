import React, { useMemo } from 'react';
import { useDNAStore } from '../../store/useDNAStore';
import type { WhatIfScanCell } from '../../store/useDNAStore';

const BASES = ['A', 'T', 'G', 'C'];

const getRiskColor = (risk: string): string => {
    switch (risk) {
        case 'Pathogenic': return 'var(--error)';
        case 'Benign': return 'var(--secondary)';
        case 'VUS': return 'var(--primary)';
        default: return 'rgba(255,255,255,0.1)';
    }
};

const getRiskBg = (risk: string, score: number): string => {
    if (risk === 'Pathogenic') return `rgba(255,180,171,${0.1 + score * 0.4})`;
    if (risk === 'Benign') return `rgba(0,212,170,${0.05 + score * 0.15})`;
    return `rgba(47,126,255,${0.05 + score * 0.2})`;
};

export const WhatIfPanel: React.FC = () => {
    const whatIfResults = useDNAStore(s => s.whatIfResults);
    const isScanning = useDNAStore(s => s.isWhatIfScanning);
    const whatIfActive = useDNAStore(s => s.whatIfActive);
    const runScan = useDNAStore(s => s.runWhatIfScan);
    const toggleWhatIf = useDNAStore(s => s.toggleWhatIf);

    // Group results by position
    const grouped = useMemo(() => {
        const map = new Map<number, WhatIfScanCell[]>();
        whatIfResults.forEach(r => {
            const arr = map.get(r.position) || [];
            arr.push(r);
            map.set(r.position, arr);
        });
        return map;
    }, [whatIfResults]);

    const positions = useMemo(() => Array.from(grouped.keys()).sort((a, b) => a - b), [grouped]);

    if (!whatIfActive) return null;

    return (
        <div style={{
            background: 'rgba(12,14,23,0.6)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--secondary)' }}>science</span>
                    <span style={{
                        fontFamily: 'var(--font-data)', fontSize: 10, letterSpacing: '0.3em',
                        color: 'var(--secondary)', textTransform: 'uppercase' as const,
                    }}>
                        WHAT-IF POSITIONAL SCAN
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {!isScanning && whatIfResults.length === 0 && (
                        <button
                            onClick={() => runScan()}
                            className="chamfer-sm"
                            style={{
                                background: 'var(--secondary)', border: 'none',
                                padding: '6px 16px', fontFamily: 'var(--font-data)',
                                fontSize: 9, letterSpacing: '0.2em', color: '#002d6c',
                                cursor: 'none', textTransform: 'uppercase' as const,
                                fontWeight: 700,
                            }}
                        >
                            RUN SCAN
                        </button>
                    )}
                    <button
                        onClick={toggleWhatIf}
                        style={{
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                            cursor: 'none', fontSize: 14, lineHeight: 1,
                        }}
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Scanning indicator */}
            {isScanning && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    fontFamily: 'var(--font-data)', fontSize: 10,
                    color: 'var(--secondary)', letterSpacing: '0.2em',
                }}>
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--secondary)', animation: 'pulseSlow 1s infinite',
                    }} />
                    SCANNING MUTATIONS ACROSS ALL POSITIONS...
                </div>
            )}

            {/* Heatmap */}
            {positions.length > 0 && (
                <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                    {/* Column headers */}
                    <div style={{ display: 'flex', marginBottom: 4 }}>
                        <div style={{ width: 40, flexShrink: 0 }} />
                        {positions.slice(0, 40).map(pos => (
                            <div key={pos} style={{
                                width: 28, flexShrink: 0, textAlign: 'center',
                                fontFamily: 'var(--font-data)', fontSize: 7,
                                color: 'rgba(47,126,255,0.4)',
                            }}>
                                {pos}
                            </div>
                        ))}
                    </div>

                    {/* Rows per target base */}
                    {BASES.map(base => (
                        <div key={base} style={{ display: 'flex', marginBottom: 2 }}>
                            <div style={{
                                width: 40, flexShrink: 0, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-data)', fontSize: 10,
                                color: 'var(--primary)', fontWeight: 700,
                            }}>
                                →{base}
                            </div>
                            {positions.slice(0, 40).map(pos => {
                                const cells = grouped.get(pos) || [];
                                const cell = cells.find(c => c.mutated_base === base);
                                
                                if (!cell) {
                                    // This is the original base — show as dash
                                    return (
                                        <div key={`${pos}-${base}`} style={{
                                            width: 28, height: 22, flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.03)',
                                            fontSize: 8, color: 'rgba(255,255,255,0.1)',
                                        }}>
                                            ·
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div
                                        key={`${pos}-${base}`}
                                        title={`Pos ${pos}: ${cell.original_base}→${base} | ${cell.variant_annotation} | ${cell.functional_risk}`}
                                        style={{
                                            width: 28, height: 22, flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: getRiskBg(cell.functional_risk, Math.abs(cell.stability_score) / 5),
                                            border: `1px solid ${getRiskColor(cell.functional_risk)}33`,
                                            fontSize: 7, fontFamily: 'var(--font-data)',
                                            color: getRiskColor(cell.functional_risk),
                                            cursor: 'none',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {cell.variant_annotation === 'Silent' ? 'S' :
                                         cell.variant_annotation === 'Nonsense' ? '✕' :
                                         cell.functional_risk === 'Pathogenic' ? '!' :
                                         cell.functional_risk === 'Benign' ? '·' : '?'}
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {/* Legend */}
                    <div style={{
                        display: 'flex', gap: '1.5rem', marginTop: '1rem',
                        fontFamily: 'var(--font-data)', fontSize: 8,
                        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const,
                        letterSpacing: '0.15em',
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 8, height: 8, background: 'rgba(0,212,170,0.3)', display: 'inline-block' }} />
                            Benign
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 8, height: 8, background: 'rgba(47,126,255,0.3)', display: 'inline-block' }} />
                            VUS
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 8, height: 8, background: 'rgba(255,180,171,0.3)', display: 'inline-block' }} />
                            Pathogenic
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 8, height: 8, background: 'rgba(255,255,255,0.05)', display: 'inline-block' }} />
                            Original Base
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
