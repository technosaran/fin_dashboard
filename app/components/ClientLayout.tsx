'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from './Sidebar';
import { AuthProvider, useAuth } from './AuthContext';
import { FinanceProvider, useFinance } from './FinanceContext';
import { NotificationProvider } from './NotificationContext';
import { ErrorBoundary } from './error-boundaries/ErrorBoundary';

const AddTransactionModal = dynamic(() => import('./AddTransactionModal'), {
  ssr: false,
});

import { Menu, X, Command } from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login';

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <AuthConsumer isAuthPage={isAuthPage}>{children}</AuthConsumer>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AuthConsumer({
  children,
  isAuthPage,
}: {
  children: React.ReactNode;
  isAuthPage: boolean;
}) {
  const { loading: authLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (authLoading && !isAuthPage) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#020617',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(99, 102, 241, 0.1)',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
            Initializing Secure Session...
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <FinanceProvider>
      <TransactionModalWrapper />
      <div
        style={{
          display: 'flex',
          height: '100vh',
          backgroundColor: '#020617',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {!isAuthPage && (
          <header className="mobile-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <Command size={18} />
                </div>
                <span
                  style={{
                    fontWeight: '900',
                    color: '#fff',
                    fontSize: '1.2rem',
                    letterSpacing: '-0.5px'
                  }}
                >
                  FINCORE
                </span>
              </div>
            </div>
          </header>
        )}

        <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
          {!isAuthPage && (
            <>
              <div
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 90,
                  opacity: isSidebarOpen ? 1 : 0,
                  pointerEvents: isSidebarOpen ? 'auto' : 'none',
                  transition: 'opacity 0.3s ease',
                }}
              />
              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </>
          )}
          <main className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </div>
    </FinanceProvider>
  );
}

function TransactionModalWrapper() {
  const { isTransactionModalOpen, setIsTransactionModalOpen } = useFinance();
  return (
    <AddTransactionModal
      isOpen={isTransactionModalOpen}
      onClose={() => setIsTransactionModalOpen(false)}
    />
  );
}
