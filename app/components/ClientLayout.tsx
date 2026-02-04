"use client";

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { AuthProvider, useAuth } from './AuthContext';
import { FinanceProvider } from './FinanceContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    return (
        <AuthProvider>
            <AuthConsumer isAuthPage={isAuthPage}>
                {children}
            </AuthConsumer>
        </AuthProvider>
    );
}

function AuthConsumer({ children, isAuthPage }: { children: React.ReactNode, isAuthPage: boolean }) {
    const { loading: authLoading } = useAuth();

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
            <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#020617' }}>
                {!isAuthPage && <Sidebar />}
                <main style={{
                    flex: 1,
                    overflowY: 'auto',
                    height: '100vh',
                    position: 'relative',
                    width: isAuthPage ? '100%' : 'calc(100% - 200px)'
                }}>
                    {children}
                </main>
            </div>
        </FinanceProvider>
    );
}
