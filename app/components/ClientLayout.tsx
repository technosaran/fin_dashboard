"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { AuthProvider, useAuth } from './AuthContext';
import { FinanceProvider } from './FinanceContext';
import { NotificationProvider } from './NotificationContext';

import { Menu, X, Command } from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    return (
        <AuthProvider>
            <NotificationProvider>
                <AuthConsumer isAuthPage={isAuthPage}>
                    {children}
                </AuthConsumer>
            </NotificationProvider>
        </AuthProvider>
    );
}

function AuthConsumer({ children, isAuthPage }: { children: React.ReactNode, isAuthPage: boolean }) {
    const { loading: authLoading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);



    if (authLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#020617',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(99, 102, 241, 0.1)',
                        borderTopColor: '#6366f1',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Initializing Secure Session...</div>
                </div>
                <style jsx>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <FinanceProvider>
            <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#020617', flexDirection: 'column' }}>
                {!isAuthPage && (
                    <header className="mobile-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '32px', height: '32px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white'
                            }}>
                                <Command size={18} />
                            </div>
                            <span style={{ fontWeight: '900', color: '#fff', fontSize: '1.1rem' }}>FINCORE</span>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                        >
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </header>
                )}

                <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                    {!isAuthPage && (
                        <>
                            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
                            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                        </>
                    )}
                    <main className="main-content">
                        {children}
                    </main>
                </div>
            </div>
        </FinanceProvider>
    );
}

