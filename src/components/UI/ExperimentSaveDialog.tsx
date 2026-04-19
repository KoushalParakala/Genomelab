import React, { useState } from 'react';
import { useDNAStore } from '../../store/useDNAStore';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const ExperimentSaveDialog: React.FC<Props> = ({ isOpen, onClose }) => {
    const impactData = useDNAStore(s => s.impactData);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Supabase or API call here
        setTimeout(() => {
            setLoading(false);
            onClose();
        }, 800);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease',
        }}>
            <div style={{
                background: 'rgba(12,14,23,0.9)',
                border: '1px solid var(--border)',
                width: '100%', maxWidth: 460,
                padding: '2.5rem',
                position: 'relative',
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: '1px solid var(--primary)', borderLeft: '1px solid var(--primary)' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: '1px solid var(--primary)', borderRight: '1px solid var(--primary)' }} />

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                        cursor: 'none', padding: '0.5rem',
                    }}
                >
                    ✕
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 24 }}>bookmark_add</span>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: 14, letterSpacing: '0.3em', color: 'var(--primary)', textTransform: 'uppercase' }}>
                        SAVE TO MUTATION LIBRARY
                    </span>
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={labelStyle}>EXPERIMENT DESIGNATION</label>
                        <input
                            type="text" required value={name} onChange={e => setName(e.target.value)}
                            placeholder={impactData ? `${impactData.variant_annotation} Analysis` : 'New Experiment'}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>NOTES / CONTEXT</label>
                        <textarea
                            rows={3} value={desc} onChange={e => setDesc(e.target.value)}
                            style={{ ...inputStyle, resize: 'none' }}
                        />
                    </div>

                    {impactData && (
                        <div style={{ background: 'rgba(47,126,255,0.05)', border: '1px solid rgba(47,126,255,0.2)', padding: '1rem', marginTop: '0.5rem' }}>
                            <div style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'var(--primary)', letterSpacing: '0.2em', marginBottom: 4 }}>
                                ATTACHED PAYLOAD
                            </div>
                            <div style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--on-surface)' }}>
                                {impactData.variant_annotation} · {impactData.ai_predictions.functional_risk}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="chamfer" style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '1rem', fontFamily: 'var(--font-data)', fontSize: 10, cursor: 'none' }}>
                            CANCEL
                        </button>
                        <button type="submit" disabled={loading} className="chamfer" style={{ flex: 2, background: 'var(--primary)', border: 'none', color: '#002d6c', padding: '1rem', fontFamily: 'var(--font-data)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', cursor: 'none' }}>
                            {loading ? 'ARCHIVING...' : 'COMMIT TO DATABASE'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', marginBottom: '0.5rem' };
const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid var(--primary)', padding: '0.75rem 1rem', color: 'var(--on-surface)', fontFamily: 'monospace', outline: 'none' };
