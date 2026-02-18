'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Landmark,
  TrendingUp,
  ShieldCheck,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Wallet,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { EmptyPortfolioVisual } from '../components/Visuals';
import { useFinance } from '../components/FinanceContext';
import { Bond } from '@/lib/types';
import { calculateBondCharges } from '@/lib/utils/charges';
import { SkeletonCard } from '../components/SkeletonLoader';
import { useNotifications } from '../components/NotificationContext';
import AddBondModal from '../components/AddBondModal';

export default function BondsClient() {
  const { bonds, loading, deleteBond, settings, refreshLivePrices } = useFinance();
  const { showNotification, confirm } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingCharges, setViewingCharges] = useState<Bond | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshLivePrices();
    setIsRefreshing(false);
    showNotification('success', 'Prices refreshed');
  };

  // Filter bonds based on search
  const filteredBonds = useMemo(() => {
    return bonds.filter(
      (b) =>
        b.quantity > 0 &&
        (b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.isin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.companyName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [bonds, searchQuery]);

  // Financial calculations
  const stats = useMemo(() => {
    const activeBonds = bonds.filter((b) => b.quantity > 0);
    const totalInvested = activeBonds.reduce((sum, b) => sum + b.investmentAmount, 0);
    const currentValue = activeBonds.reduce((sum, b) => sum + b.currentValue, 0);
    const totalPnL = currentValue - totalInvested;
    const avgYield =
      activeBonds.length > 0
        ? activeBonds.reduce((sum, b) => sum + b.couponRate, 0) / activeBonds.length
        : 0;

    return { totalInvested, currentValue, totalPnL, avgYield };
  }, [bonds]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="bg-mesh" />
        <div className="dashboard-header">
          <div className="skeleton" style={{ height: '40px', width: 'min(100%, 250px)' }} />
        </div>
        <div className="grid-responsive-3 mb-xl">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="premium-card" style={{ height: '400px' }}>
          <div className="skeleton" style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    );
  }

  if (!settings.bondsEnabled) {
    return (
      <div
        className="page-container"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}
      >
        <div className="bg-mesh" />
        <div
          className="premium-card p-2xl text-center"
          style={{ maxWidth: '500px', padding: '48px' }}
        >
          <Landmark
            size={48}
            className="mb-md"
            style={{ color: '#64748b', opacity: 0.5, margin: '0 auto 24px auto' }}
          />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '12px' }}>
            Bonds Section Disabled
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            You have disabled the bonds tracking section in your settings. Enable it to track your
            Wint Wealth and other fixed-income investments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="bg-mesh" />

      <header className="dashboard-header">
        <div className="fade-in">
          <h1
            className="dashboard-title"
            style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <Landmark className="text-glow" style={{ color: 'var(--accent)' }} size={32} />
            <span>
              Bonds <span className="title-accent">& Fixed Income</span>
            </span>
          </h1>
        </div>

        <div className="flex gap-sm">
          <button
            onClick={handleRefresh}
            className="glass-button"
            style={{
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '14px',
            }}
            title="Refresh Prices"
          >
            <RefreshCw size={18} className={isRefreshing ? 'spin' : ''} />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="glass-button glow-primary"
            style={{
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--accent)',
              borderColor: 'transparent',
            }}
          >
            <Plus size={18} /> Add Bond
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div
        className="grid-responsive-4 mb-xl fade-in"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <div
          className="premium-card p-lg"
          style={{
            padding: '24px',
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
          }}
        >
          <div
            className="flex justify-between items-start mb-sm"
            style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}
          >
            <div
              className="stat-label"
              style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.8rem',
                fontWeight: '800',
                textTransform: 'uppercase',
              }}
            >
              Total Investment
            </div>
            <Wallet size={16} style={{ color: '#6366f1' }} />
          </div>
          <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: '900' }}>
            ₹{stats.totalInvested.toLocaleString()}
          </div>
        </div>

        <div
          className="premium-card p-lg"
          style={{
            padding: '24px',
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
          }}
        >
          <div
            className="flex justify-between items-start mb-sm"
            style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}
          >
            <div
              className="stat-label"
              style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.8rem',
                fontWeight: '800',
                textTransform: 'uppercase',
              }}
            >
              Current Value
            </div>
            <TrendingUp size={16} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: '900' }}>
            ₹{stats.currentValue.toLocaleString()}
          </div>
        </div>

        <div
          className="premium-card p-lg"
          style={{
            padding: '24px',
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
          }}
        >
          <div
            className="flex justify-between items-start mb-sm"
            style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}
          >
            <div
              className="stat-label"
              style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.8rem',
                fontWeight: '800',
                textTransform: 'uppercase',
              }}
            >
              Net Gain/Loss
            </div>
            <div style={{ color: stats.totalPnL >= 0 ? '#10b981' : '#ef4444' }}>
              {stats.totalPnL >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            </div>
          </div>
          <div
            className="stat-value"
            style={{
              fontSize: '1.75rem',
              fontWeight: '900',
              color: stats.totalPnL >= 0 ? '#10b981' : '#ef4444',
            }}
          >
            ₹{Math.abs(stats.totalPnL).toLocaleString()}
          </div>
        </div>

        <div
          className="premium-card p-lg"
          style={{
            padding: '24px',
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
          }}
        >
          <div
            className="flex justify-between items-start mb-sm"
            style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}
          >
            <div
              className="stat-label"
              style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.8rem',
                fontWeight: '800',
                textTransform: 'uppercase',
              }}
            >
              Avg. Coupon Rate
            </div>
            <Percent size={16} style={{ color: '#f59e0b' }} />
          </div>
          <div
            className="stat-value"
            style={{ fontSize: '1.75rem', fontWeight: '900', color: '#f59e0b' }}
          >
            {stats.avgYield.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="flex justify-between items-center mb-lg fade-in"
        style={{ marginBottom: '24px' }}
      >
        <div style={{ position: 'relative', flex: '1 1 auto', maxWidth: '400px', minWidth: '0' }}>
          <Search
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}
            size={18}
          />
          <input
            type="text"
            placeholder="Search by ISIN or bond name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 48px',
              background: 'var(--surface)',
              border: '1px solid var(--surface-border)',
              borderRadius: '16px',
              color: '#fff',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Bonds List */}
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredBonds.length > 0 ? (
          filteredBonds.map((bond, idx) => (
            <div
              key={bond.id}
              className="premium-card p-lg mb-md hover-card-premium"
              style={{
                animationDelay: `${idx * 0.05}s`,
                background:
                  'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                padding: '24px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}
            >
              <div
                className="flex flex-wrap items-center gap-lg"
                style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}
              >
                {/* Bond Name & Info */}
                <div style={{ flex: '1 1 300px' }}>
                  <div
                    className="flex items-center gap-sm mb-xs"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>
                      {bond.name}
                    </h3>
                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: '#818cf8',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                      }}
                    >
                      {bond.isin}
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      color: 'var(--text-tertiary)',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={14} /> {bond.companyName}
                    </span>
                    <span
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: '#334155',
                      }}
                    />
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> Matures{' '}
                      {new Date(bond.maturityDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Yield & Frequency */}
                <div style={{ flex: '1 1 120px', textAlign: 'center' }}>
                  <div
                    className="stat-label mb-xs"
                    style={{
                      color: 'var(--text-tertiary)',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}
                  >
                    Coupon Rate
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '950', color: '#f59e0b' }}>
                    {bond.couponRate.toFixed(2)}%
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-tertiary)',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                    }}
                  >
                    {bond.interestFrequency}
                  </div>
                </div>

                {/* Investment Value */}
                <div style={{ flex: '1 1 140px', textAlign: 'right' }}>
                  <div
                    className="stat-label mb-xs"
                    style={{
                      color: 'var(--text-tertiary)',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}
                  >
                    Current Value
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '950', color: '#fff' }}>
                    ₹{bond.currentValue.toLocaleString()}
                  </div>
                  <div
                    className="flex items-center justify-end gap-xs"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      color: bond.pnl >= 0 ? '#10b981' : '#ef4444',
                    }}
                  >
                    {bond.pnl >= 0 ? '+' : ''}₹{bond.pnl.toLocaleString()} (
                    {bond.pnlPercentage.toFixed(1)}%)
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-sm" style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setViewingCharges(bond)}
                    className="glass-button p-sm"
                    style={{
                      color: '#94a3b8',
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.03)',
                    }}
                    title="Estimated Sell Charges"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={async () => {
                      const isConfirmed = await confirm({
                        title: 'Delete Bond?',
                        message: `Are you sure you want to remove ${bond.name} from your portfolio?`,
                        type: 'error',
                      });
                      if (isConfirmed) {
                        await deleteBond(bond.id);
                        showNotification('success', 'Bond removed successfully');
                      }
                    }}
                    className="glass-button p-sm"
                    style={{
                      color: '#f87171',
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      borderColor: 'rgba(239, 68, 68, 0.2)',
                    }}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="premium-card p-2xl text-center"
            style={{
              padding: '80px 32px',
              textAlign: 'center',
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.2), rgba(15, 23, 42, 0.4))',
              borderRadius: '32px',
              border: '1px dashed rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ marginBottom: '32px' }}>
              <EmptyPortfolioVisual />
            </div>
            <h3
              style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '12px', color: '#fff' }}
            >
              {searchQuery ? 'No Matching Bonds' : 'No Fixed-Income Assets'}
            </h3>
            <p
              style={{
                color: '#64748b',
                marginBottom: '40px',
                maxWidth: '450px',
                margin: '0 auto 40px auto',
                lineHeight: '1.6',
              }}
            >
              {searchQuery
                ? 'Try adjusting your search filters to find what you are looking for.'
                : 'Start tracking your secure fixed-income portfolio. Add your first premium bond or Wint Wealth investment.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="glass-button glow-primary"
                style={{
                  padding: '16px 32px',
                  background: 'var(--accent)',
                  borderColor: 'transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  borderRadius: '16px',
                  fontSize: '1rem',
                  fontWeight: '800',
                  boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
                }}
              >
                <Plus size={20} /> Add Private Bond
              </button>
            )}
          </div>
        )}
      </div>

      {viewingCharges &&
        (() => {
          const charges = calculateBondCharges(
            'SELL',
            viewingCharges.quantity,
            viewingCharges.currentPrice,
            settings
          );
          return (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(10px)',
                }}
                onClick={() => setViewingCharges(null)}
              />

              <div
                className="premium-card fade-in"
                style={{
                  position: 'relative',
                  width: '90%',
                  maxWidth: '400px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '24px',
                  padding: '0',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex justify-between items-center">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0 }}>
                      Exit Simulator
                    </h2>
                    <button
                      onClick={() => setViewingCharges(null)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: '#94a3b8',
                        borderRadius: '12px',
                        padding: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
                    </button>
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      marginBottom: '24px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        marginBottom: '4px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                      }}
                    >
                      Instrument
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>
                      {viewingCharges.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                      {viewingCharges.isin}
                    </div>
                  </div>

                  <div
                    className="space-y-3"
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Brokerage</span>
                      <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem' }}>
                        ₹{charges.brokerage.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Stamp Duty</span>
                      <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem' }}>
                        ₹{charges.stampDuty.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>GST</span>
                      <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem' }}>
                        ₹{charges.gst.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ height: '1px', background: '#334155', margin: '8px 0' }} />
                    <div className="flex justify-between items-center">
                      <span style={{ color: '#fff', fontWeight: '900', fontSize: '1rem' }}>
                        Total Charges
                      </span>
                      <span style={{ color: '#f59e0b', fontSize: '1.25rem', fontWeight: '900' }}>
                        ₹{charges.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '24px',
                    background: 'rgba(0,0,0,0.2)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <button
                    onClick={() => setViewingCharges(null)}
                    className="glass-button glow-primary"
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '16px',
                      border: 'none',
                      fontWeight: '800',
                      fontSize: '1rem',
                      background: 'var(--surface-light)',
                    }}
                  >
                    Close Simulator
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      <AddBondModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
