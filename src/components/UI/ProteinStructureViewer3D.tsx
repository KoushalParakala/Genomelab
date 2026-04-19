import React, { useEffect, useRef, useState } from 'react';
import { useDNAStore } from '../../store/useDNAStore';

/**
 * ProteinStructureViewer3D
 * ========================
 * 3D protein structure viewer using 3Dmol.js
 * Renders PDB data from ESMFold with split-view: WT (cyan) vs Mutant (amber)
 * Opens as a full-screen modal overlay.
 */

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const ProteinStructureViewer3D: React.FC<Props> = ({ isOpen, onClose }) => {
    const structurePDBs = useDNAStore(s => s.structurePDBs);
    const isLoading = useDNAStore(s => s.isLoadingStructure);
    const requestStructure = useDNAStore(s => s.requestStructurePrediction);
    const impactData = useDNAStore(s => s.impactData);

    const wtViewerRef = useRef<HTMLDivElement>(null);
    const mutViewerRef = useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = useState<'split' | 'overlay'>('split');
    const [style3d, setStyle3d] = useState<'cartoon' | 'stick' | 'sphere'>('cartoon');

    // Initialize 3Dmol viewers when PDB data is available
    useEffect(() => {
        if (!isOpen || !structurePDBs) return;

        const init = async () => {
            const $3Dmol = await import('3dmol');

            // Wild-type viewer
            if (wtViewerRef.current) {
                wtViewerRef.current.innerHTML = '';
                const wtViewer = $3Dmol.createViewer(wtViewerRef.current, {
                    backgroundColor: 'rgba(0,0,0,0)',
                    antialias: true,
                });
                wtViewer.addModel(structurePDBs.wt, 'pdb');
                applyStyle(wtViewer, style3d, 'wt');
                wtViewer.zoomTo();
                wtViewer.render();
                wtViewer.spin('y', 0.5);
            }

            // Mutant viewer (or overlay)
            if (mutViewerRef.current) {
                mutViewerRef.current.innerHTML = '';
                const mutViewer = $3Dmol.createViewer(mutViewerRef.current, {
                    backgroundColor: 'rgba(0,0,0,0)',
                    antialias: true,
                });

                if (viewMode === 'overlay') {
                    // Show both structures in one viewer
                    mutViewer.addModel(structurePDBs.wt, 'pdb');
                    mutViewer.setStyle({ model: 0 }, {
                        cartoon: { color: '#2f7eff', opacity: 0.5 }
                    });
                    mutViewer.addModel(structurePDBs.mut, 'pdb');
                    mutViewer.setStyle({ model: 1 }, {
                        cartoon: { color: '#ff6b4a', opacity: 0.7 }
                    });
                } else {
                    mutViewer.addModel(structurePDBs.mut, 'pdb');
                    applyStyle(mutViewer, style3d, 'mut');
                }
                mutViewer.zoomTo();
                mutViewer.render();
                mutViewer.spin('y', 0.5);
            }
        };

        init().catch(console.error);
    }, [isOpen, structurePDBs, viewMode, style3d]);

    const applyStyle = (viewer: any, style: string, type: 'wt' | 'mut') => {
        const color = type === 'wt' ? '#2f7eff' : '#ff6b4a';
        const colorScheme = type === 'wt' ? 'ssJmol' : undefined;

        switch (style) {
            case 'cartoon':
                if (colorScheme) {
                    viewer.setStyle({}, { cartoon: { colorscheme: colorScheme } });
                } else {
                    viewer.setStyle({}, { cartoon: { color } });
                }
                break;
            case 'stick':
                viewer.setStyle({}, { stick: { colorscheme: 'Jmol' } });
                break;
            case 'sphere':
                viewer.setStyle({}, { sphere: { colorscheme: 'Jmol', scale: 0.3 } });
                break;
        }
    };

    if (!isOpen) return null;

    const structComparison = impactData?.ai_predictions?.structure_comparison;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
            display: 'flex', flexDirection: 'column',
            animation: 'fadeIn 0.3s ease',
        }}>
            {/* Header Bar */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 2rem',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(12,14,23,0.6)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--secondary)' }}>view_in_ar</span>
                    <span style={{
                        fontFamily: 'var(--font-data)', fontSize: 11,
                        letterSpacing: '0.3em', color: 'var(--secondary)',
                        textTransform: 'uppercase' as const,
                    }}>
                        PROTEIN STRUCTURE COMPARISON
                    </span>

                    {/* RMSD badge */}
                    {structComparison && structComparison.rmsd > 0 && (
                        <span style={{
                            fontFamily: 'var(--font-data)', fontSize: 10,
                            padding: '4px 12px', border: '1px solid var(--border)',
                            color: structComparison.rmsd > 2 ? 'var(--error)' : 'var(--primary)',
                        }}>
                            RMSD: {structComparison.rmsd.toFixed(2)}Å
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* View mode toggle */}
                    {['split', 'overlay'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode as any)}
                            style={{
                                background: viewMode === mode ? 'rgba(47,126,255,0.15)' : 'transparent',
                                border: viewMode === mode ? '1px solid var(--primary)' : '1px solid var(--border)',
                                padding: '6px 14px', fontFamily: 'var(--font-data)', fontSize: 9,
                                color: viewMode === mode ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                                letterSpacing: '0.2em', textTransform: 'uppercase' as const,
                                cursor: 'none',
                            }}
                        >
                            {mode}
                        </button>
                    ))}

                    {/* Style toggle */}
                    {['cartoon', 'stick', 'sphere'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStyle3d(s as any)}
                            style={{
                                background: style3d === s ? 'rgba(0,212,170,0.15)' : 'transparent',
                                border: style3d === s ? '1px solid var(--secondary)' : '1px solid var(--border)',
                                padding: '6px 14px', fontFamily: 'var(--font-data)', fontSize: 9,
                                color: style3d === s ? 'var(--secondary)' : 'rgba(255,255,255,0.4)',
                                letterSpacing: '0.2em', textTransform: 'uppercase' as const,
                                cursor: 'none',
                            }}
                        >
                            {s}
                        </button>
                    ))}

                    {/* Close */}
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.4)', padding: '6px 14px',
                            fontFamily: 'var(--font-data)', fontSize: 9,
                            letterSpacing: '0.2em', cursor: 'none',
                        }}
                    >
                        CLOSE ✕
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {!structurePDBs ? (
                    /* Loading / Request State */
                    <div style={{
                        flex: 1, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
                    }}>
                        {isLoading ? (
                            <>
                                <div style={{
                                    width: 48, height: 48, border: '2px solid var(--border)',
                                    borderTop: '2px solid var(--secondary)',
                                    borderRadius: '50%', animation: 'spin 1s linear infinite',
                                }} />
                                <span style={{
                                    fontFamily: 'var(--font-data)', fontSize: 11,
                                    color: 'var(--secondary)', letterSpacing: '0.3em',
                                }}>
                                    PREDICTING STRUCTURES VIA ESMFOLD...
                                </span>
                                <span style={{
                                    fontFamily: 'var(--font-data)', fontSize: 9,
                                    color: 'rgba(255,255,255,0.3)',
                                }}>
                                    This may take 10-30 seconds
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined" style={{
                                    fontSize: 64, color: 'rgba(47,126,255,0.2)',
                                }}>view_in_ar</span>
                                <span style={{
                                    fontFamily: 'var(--font-data)', fontSize: 11,
                                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em',
                                }}>
                                    NO STRUCTURES LOADED
                                </span>
                                <button
                                    onClick={requestStructure}
                                    className="chamfer"
                                    style={{
                                        background: 'var(--secondary)', border: 'none',
                                        padding: '10px 28px', fontFamily: 'var(--font-data)',
                                        fontSize: 10, letterSpacing: '0.2em', color: '#002d6c',
                                        fontWeight: 700, cursor: 'none',
                                        textTransform: 'uppercase' as const,
                                    }}
                                >
                                    REQUEST ESMFOLD PREDICTION
                                </button>
                            </>
                        )}
                    </div>
                ) : viewMode === 'split' ? (
                    /* Split View */
                    <>
                        <div style={{ flex: 1, position: 'relative', borderRight: '1px solid var(--border)' }}>
                            <div style={{
                                position: 'absolute', top: 12, left: 16, zIndex: 1,
                                fontFamily: 'var(--font-data)', fontSize: 9,
                                letterSpacing: '0.3em', color: 'var(--primary)',
                                textTransform: 'uppercase' as const,
                                background: 'rgba(0,0,0,0.5)', padding: '4px 10px',
                            }}>
                                WILD-TYPE
                            </div>
                            <div ref={wtViewerRef} style={{ width: '100%', height: '100%' }} />
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <div style={{
                                position: 'absolute', top: 12, left: 16, zIndex: 1,
                                fontFamily: 'var(--font-data)', fontSize: 9,
                                letterSpacing: '0.3em', color: '#ff6b4a',
                                textTransform: 'uppercase' as const,
                                background: 'rgba(0,0,0,0.5)', padding: '4px 10px',
                            }}>
                                MUTANT
                            </div>
                            <div ref={mutViewerRef} style={{ width: '100%', height: '100%' }} />
                        </div>
                    </>
                ) : (
                    /* Overlay View */
                    <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{
                            position: 'absolute', top: 12, left: 16, zIndex: 1,
                            display: 'flex', gap: '1rem',
                            fontFamily: 'var(--font-data)', fontSize: 9,
                            letterSpacing: '0.2em',
                            background: 'rgba(0,0,0,0.5)', padding: '4px 10px',
                        }}>
                            <span style={{ color: '#2f7eff' }}>● WILD-TYPE</span>
                            <span style={{ color: '#ff6b4a' }}>● MUTANT</span>
                        </div>
                        <div ref={mutViewerRef} style={{ width: '100%', height: '100%' }} />
                    </div>
                )}
            </div>

            {/* Bottom Stats Bar */}
            {structComparison && (
                <div style={{
                    display: 'flex', gap: '2rem', padding: '0.75rem 2rem',
                    borderTop: '1px solid var(--border)',
                    background: 'rgba(12,14,23,0.6)',
                    justifyContent: 'center',
                }}>
                    {[
                        { label: 'CA-RMSD', value: `${structComparison.rmsd.toFixed(3)}Å`, color: structComparison.rmsd > 2 ? 'var(--error)' : 'var(--secondary)' },
                        { label: 'MAX DISPLACEMENT', value: `${structComparison.max_displacement.toFixed(2)}Å`, color: 'var(--primary)' },
                        { label: 'RESIDUE', value: `#${structComparison.max_displacement_residue}`, color: 'var(--on-surface)' },
                        { label: 'pLDDT (WT)', value: structComparison.mean_plddt_wt.toFixed(1), color: structComparison.mean_plddt_wt > 70 ? 'var(--secondary)' : 'var(--error)' },
                        { label: 'pLDDT (MUT)', value: structComparison.mean_plddt_mut.toFixed(1), color: structComparison.mean_plddt_mut > 70 ? 'var(--secondary)' : 'var(--error)' },
                        { label: 'ASSESSMENT', value: structComparison.stability_assessment.split(' ').slice(0, 2).join(' '), color: 'rgba(255,255,255,0.6)' },
                    ].map(m => (
                        <div key={m.label} style={{ textAlign: 'center' }}>
                            <div style={{
                                fontFamily: 'var(--font-headline)', fontSize: '1rem',
                                color: m.color, lineHeight: 1,
                            }}>
                                {m.value}
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-data)', fontSize: 7,
                                color: 'rgba(255,255,255,0.3)', marginTop: 4,
                                textTransform: 'uppercase' as const, letterSpacing: '0.15em',
                            }}>
                                {m.label}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
