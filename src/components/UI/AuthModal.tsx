import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../supabaseClient';

export const AuthModal: React.FC = () => {
    const { authModalOpen, toggleAuthModal } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!authModalOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } }
                });
                if (error) throw error;
                // Since this is a simple setup, allow login immediately usually or prompt email check
            }
            toggleAuthModal();
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication');
        } finally {
            setLoading(false);
        }
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
                width: '100%', maxWidth: 400,
                padding: '2.5rem',
                position: 'relative',
            }}>
                {/* Corner accents */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: '1px solid var(--primary)', borderLeft: '1px solid var(--primary)' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: '1px solid var(--primary)', borderRight: '1px solid var(--primary)' }} />

                <button
                    onClick={toggleAuthModal}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                        cursor: 'none', padding: '0.5rem',
                    }}
                >
                    ✕
                </button>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem',
                }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 24 }}>hub</span>
                    <span style={{
                        fontFamily: 'var(--font-data)', fontSize: 14,
                        letterSpacing: '0.3em', color: 'var(--primary)',
                        textTransform: 'uppercase' as const,
                    }}>
                        {isLogin ? 'SYSTEM LOGIN' : 'INITIALIZE ACCOUNT'}
                    </span>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem', background: 'rgba(255,180,171,0.1)',
                        border: '1px solid var(--error)', color: 'var(--error)',
                        fontFamily: 'var(--font-data)', fontSize: 10,
                        marginBottom: '1.5rem', letterSpacing: '0.05em',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {!isLogin && (
                        <div>
                            <label style={labelStyle}>OPERATOR ASSIGNATION (FULL NAME)</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    )}
                    <div>
                        <label style={labelStyle}>COMMUNICATION RELAY (EMAIL)</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>SECURITY CLEARANCE PATTERN (PASSWORD)</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="chamfer"
                        style={{
                            background: 'var(--primary)', border: 'none',
                            color: '#002d6c', padding: '1rem',
                            fontFamily: 'var(--font-data)', fontSize: 11,
                            fontWeight: 700, letterSpacing: '0.2em',
                            textTransform: 'uppercase' as const,
                            cursor: 'none', marginTop: '1rem',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? 'PROCESSING...' : (isLogin ? 'AUTHENTICATE' : 'ESTABLISH CREDENTIALS')}
                    </button>
                </form>

                <div style={{
                    marginTop: '2rem', textAlign: 'center',
                    fontFamily: 'var(--font-data)', fontSize: 9,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em',
                }}>
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{
                            background: 'none', border: 'none', color: 'var(--secondary)',
                            fontWeight: 700, cursor: 'none', textDecoration: 'underline',
                        }}
                    >
                        {isLogin ? 'REQUEST NEW SECURITY CLEARANCE' : 'RETURN TO SYSTEM LOGIN'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-data)',
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '0.2em',
    marginBottom: '0.5rem',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderBottom: '1px solid var(--primary)',
    padding: '0.75rem 1rem',
    color: 'var(--on-surface)',
    fontFamily: 'monospace',
    outline: 'none',
};
