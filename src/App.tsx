import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { MutationLibraryPage } from './pages/MutationLibraryPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ReportPage } from './pages/ReportPage';
import { AuthModal } from './components/UI/AuthModal';
import { useAuthStore } from './store/useAuthStore';

const NAV_ITEMS = [
    { label: 'SEQUENCE', path: '/' },
    { label: 'MUTATE',   path: '/mutate' },
    { label: 'ARCHIVE',  path: '/archive' },
    { label: 'LAB',      path: '/lab' },
    { label: 'REPORT',   path: '/report' },
];

const SIDE_ITEMS = [
    { icon: 'grid_view',      label: 'LIB',    path: '/archive' },
    { icon: 'biotech',        label: 'SIM',    path: '/mutate' },
    { icon: 'compare_arrows', label: 'COMP',   path: '/lab' },
    { icon: 'query_stats',    label: 'ANAL',   path: '/lab' },
    { icon: 'description',    label: 'REPORT', path: '/report' },
];

/* Glitch-cut page transition */
function useGlitchNavigate() {
    const navigate = useNavigate();
    const overlayRef = useRef<HTMLDivElement | null>(null);

    const glitchNavigate = (to: string) => {
        const overlay = document.getElementById('glitch-overlay');
        if (overlay) {
            overlay.classList.add('active');
            setTimeout(() => {
                navigate(to);
                setTimeout(() => overlay.classList.remove('active'), 100);
            }, 350);
        } else {
            navigate(to);
        }
    };
    return { glitchNavigate, overlayRef };
}

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { pathname } = useLocation();
    const { glitchNavigate } = useGlitchNavigate();
    const cursorRef = useRef<HTMLDivElement>(null);
    const initializeAuth = useAuthStore(s => s.initializeAuth);
    const toggleAuthModal = useAuthStore(s => s.toggleAuthModal);
    const user = useAuthStore(s => s.user);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    /* Custom cursor */
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.left = e.clientX + 'px';
                cursorRef.current.style.top  = e.clientY + 'px';
            }
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    return (
        <div className="page-shell">
            {/* Cursor */}
            <div ref={cursorRef} className="app-cursor" />

            {/* Glitch overlay */}
            <div id="glitch-overlay" className="glitch-overlay" />


            {/* ── Top Nav ── */}
            <nav className="topnav">
                <div className="topnav-brand">GENOMELAB</div>

                <div className="topnav-links">
                    {NAV_ITEMS.map(n => (
                        <button
                            key={n.label}
                            className={`topnav-link ${pathname === n.path ? 'active' : ''}`}
                            onClick={() => glitchNavigate(n.path)}
                        >
                            {n.label}
                        </button>
                    ))}
                </div>

                <div className="topnav-icons">
                    <span className="material-symbols-outlined">settings</span>
                    <button 
                        onClick={toggleAuthModal}
                        style={{ background: 'none', border: 'none', color: user ? 'var(--secondary)' : 'inherit', cursor: 'none' }}
                        title={user ? `Logged in as ${user.email}` : "Login"}
                    >
                        <span className="material-symbols-outlined">account_circle</span>
                    </button>
                </div>
            </nav>

            {/* ── Side Nav ── */}
            <aside className="sidenav">
                {SIDE_ITEMS.map(s => (
                    <button
                        key={s.label}
                        className={`sidenav-item ${pathname === s.path ? 'active' : ''}`}
                        onClick={() => glitchNavigate(s.path)}
                        style={{ background: 'none', border: 'none' }}
                    >
                        <span className="material-symbols-outlined">{s.icon}</span>
                        <span className="sidenav-label">{s.label}</span>
                    </button>
                ))}
            </aside>

            {/* ── Page content ── */}
            <div className="page-content" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {children}
            </div>

            {/* ── Status Footer ── */}
            <div className="statusbar">
                <div className="statusbar-dot">
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'var(--secondary)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                        SYSTEM_STATUS: NOMINAL
                    </span>
                </div>
                <span style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'rgba(47,126,255,0.3)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                    GENOMELAB ARTIFACT v2.4.1_STABLE
                </span>
            </div>
            
            <AuthModal />
        </div>
    );
};

const App: React.FC = () => (
    <BrowserRouter>
        <Shell>
            <Routes>
                <Route path="/"        element={<LandingPage />} />
                <Route path="/mutate"  element={<SimulatorPage />} />
                <Route path="/archive" element={<MutationLibraryPage />} />
                <Route path="/lab"     element={<AnalysisPage />} />
                <Route path="/report"  element={<ReportPage />} />
            </Routes>
        </Shell>
    </BrowserRouter>
);

export default App;
