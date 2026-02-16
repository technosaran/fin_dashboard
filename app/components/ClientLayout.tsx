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
                }}
              >
                <Command size={18} />
              </div>
              <span style={{ fontWeight: '900', color: '#fff', fontSize: '1.1rem' }}>FINCORE</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </header>
        )}

        <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
          {!isAuthPage && (
            <>
              {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
              )}
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
