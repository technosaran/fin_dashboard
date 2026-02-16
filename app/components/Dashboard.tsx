'use client';

import { useMemo } from 'react';
import {
  TrendingUp,
  Zap,
  Wallet,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Target,
  Calendar,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from './FinanceContext';
import { MutualFundTransaction } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SkeletonCard } from './SkeletonLoader';

/**
 * Get dynamic, time-based greeting with inspiring messages
 */
function getGreeting(): { text: string; subtext: string; emoji: string; color: string } {
  const hour = new Date().getHours();
  const greetings = {
    morning: {
      text: 'Good Morning',
      subtext: 'Time to conquer your financial goals!',
      emoji: '✨',
      color: '#fbbf24',
    },
    afternoon: {
      text: 'Good Afternoon',
      subtext: "Let's check in on your empire.",
      emoji: '☀️',
      color: '#f59e0b',
    },
    evening: {
      text: 'Good Evening',
      subtext: "Reviewing today's progress...",
      emoji: '🌇',
      color: '#818cf8',
    },
    night: {
      text: 'Good Night',
      subtext: 'Rest easy, your wealth is working.',
      emoji: '🌙',
      color: '#6366f1',
    },
  };

  if (hour >= 5 && hour < 12) return { ...greetings.morning };
  if (hour >= 12 && hour < 17) return { ...greetings.afternoon };
  if (hour >= 17 && hour < 21) return { ...greetings.evening };
  return { ...greetings.night };
}

export default function Dashboard() {
  const {
    accounts,
    stocks,
    mutualFunds,
    bonds,
    goals,
    stockTransactions,
    mutualFundTransactions,
    bondTransactions,
    fnoTrades,
    transactions,
    loading,
    error,
    settings,
  } = useFinance();

  const greeting = useMemo(() => getGreeting(), []);

  // ... (financialMetrics calculations remain the same)
  const financialMetrics = useMemo(() => {
    const liquidityINR = accounts
      .filter((a) => a.currency === 'INR')
      .reduce((sum, acc) => sum + acc.balance, 0);

    const stocksValue = stocks.reduce((sum, s) => sum + s.currentValue, 0);
    const mfValue = mutualFunds.reduce((sum, m) => sum + m.currentValue, 0);

    const bondsValue = settings.bondsEnabled
      ? bonds.reduce((sum, b) => sum + b.currentValue, 0)
      : 0;

    const totalNetWorth = liquidityINR + stocksValue + mfValue + bondsValue;

    const stockInvestment = stocks.reduce((sum, s) => sum + s.investmentAmount, 0);
    const mfInvestment = mutualFunds.reduce((sum, m) => sum + m.investmentAmount, 0);
    const totalInvestment = stockInvestment + mfInvestment;

    const stockBuys = stockTransactions
      .filter((t) => t.transactionType === 'BUY')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const stockSells = stockTransactions
      .filter((t) => t.transactionType === 'SELL')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const stockCharges = stockTransactions.reduce(
      (sum, t) => sum + (t.brokerage || 0) + (t.taxes || 0),
      0
    );

    const stockLifetime = stockSells + stocksValue - (stockBuys + stockCharges);

    const mfBuys = mutualFundTransactions
      .filter(
        (t: MutualFundTransaction) => t.transactionType === 'BUY' || t.transactionType === 'SIP'
      )
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const mfSells = mutualFundTransactions
      .filter((t: MutualFundTransaction) => t.transactionType === 'SELL')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const mfCharges = mutualFundTransactions
      .filter(
        (t: MutualFundTransaction) => t.transactionType === 'BUY' || t.transactionType === 'SIP'
      )
      .reduce((sum, t) => sum + t.totalAmount * 0.00005, 0);

    const mfLifetime = mfSells + mfValue - (mfBuys + mfCharges);

    let bondLifetime = 0;
    if (settings.bondsEnabled) {
      const bondBuys = bondTransactions
        .filter((t) => t.transactionType === 'BUY')
        .reduce((sum, t) => sum + t.totalAmount, 0);

      const bondReturns = bondTransactions
        .filter(
          (t) =>
            t.transactionType === 'SELL' ||
            t.transactionType === 'MATURITY' ||
            t.transactionType === 'INTEREST'
        )
        .reduce((sum, t) => sum + t.totalAmount, 0);

      bondLifetime = bondReturns + bondsValue - bondBuys;
    }

    const fnoLifetime = fnoTrades
      .filter((t) => t.status === 'CLOSED')
      .reduce((sum, t) => sum + t.pnl, 0);

    const globalLifetimeWealth = stockLifetime + mfLifetime + bondLifetime + fnoLifetime;

    const stockPnl = stocks.reduce((sum, s) => sum + s.pnl, 0);
    const mfPnl = mfValue - mfInvestment;
    const totalUnrealizedPnl = stockPnl + mfPnl;

    const stockDayChange = stocks.reduce((sum, stock) => {
      const dayChange =
        (stock.currentPrice - (stock.previousPrice || stock.currentPrice)) * stock.quantity;
      return sum + dayChange;
    }, 0);

    const mfDayChange = mutualFunds.reduce((sum, mf) => {
      const dayChange = (mf.currentNav - (mf.previousNav || mf.currentNav)) * mf.units;
      return sum + dayChange;
    }, 0);

    const totalDayChange = stockDayChange + mfDayChange;

    return {
      liquidityINR,
      stocksValue,
      mfValue,
      bondsValue,
      totalNetWorth,
      totalInvestment,
      globalLifetimeWealth,
      totalUnrealizedPnl,
      stockDayChange: totalDayChange,
      fnoLifetime,
    };
  }, [
    accounts,
    stocks,
    mutualFunds,
    bonds,
    stockTransactions,
    mutualFundTransactions,
    bondTransactions,
    fnoTrades,
    settings.bondsEnabled,
  ]);

  // ... (rest of the useMemos remain the same)
  const allocationData = useMemo(() => {
    return [
      { name: 'Cash', value: financialMetrics.liquidityINR, color: '#818cf8' },
      { name: 'Stocks', value: financialMetrics.stocksValue, color: '#10b981' },
      { name: 'Mutual Funds', value: financialMetrics.mfValue, color: '#f59e0b' },
      { name: 'Bonds', value: financialMetrics.bondsValue, color: '#ec4899' },
    ].filter((a) => a.value > 0);
  }, [financialMetrics]);

  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const goalsProgress = useMemo(() => {
    return goals
      .map((g) => ({
        name: g.name,
        target: g.targetAmount,
        current: g.currentAmount,
        percentage:
          g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0,
      }))
      .slice(0, 3);
  }, [goals]);

  const topHoldings = useMemo(() => {
    return [...stocks].sort((a, b) => b.currentValue - a.currentValue).slice(0, 5);
  }, [stocks]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="bg-mesh" />
        <div style={{ marginBottom: '32px' }}>
          <div
            className="skeleton"
            style={{ height: '48px', width: '350px', marginBottom: '12px' }}
          />
          <div className="skeleton" style={{ height: '24px', width: '450px' }} />
        </div>
        <div style={{ marginBottom: '32px' }}>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="bg-mesh" />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            textAlign: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={32} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', margin: 0 }}>
            Unable to Load Dashboard
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '400px', lineHeight: '1.6' }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="bg-mesh" />

      {/* Header Section */}
      <header className="dashboard-header" style={{ marginBottom: '32px' }}>
        <div
          className="fade-in"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '1.5rem',
                  animation: 'bounce 2s infinite',
                  display: 'inline-block',
                }}
              >
                {greeting.emoji}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  color: greeting.color,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                {greeting.text}
              </span>
            </div>
            <h1 className="dashboard-title" style={{ margin: 0, lineHeight: 1.1 }}>
              <span style={{ color: '#fff' }}>Welcome back, </span>
              <span
                className="title-accent text-glow"
                style={{
                  background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.1em',
                }}
              >
                Saran
              </span>
            </h1>
            <p
              style={{
                color: '#475569',
                fontSize: '1rem',
                fontWeight: '500',
                marginTop: '8px',
                maxWidth: '400px',
                lineHeight: 1.4,
              }}
            >
              {greeting.subtext}
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '12px 20px',
              borderRadius: '20px',
              border: '1px solid rgba(132, 140, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)',
              }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Today&apos;s Overview
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Row */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {[
          {
            label: 'Liquid Cash',
            value: `₹${financialMetrics.liquidityINR.toLocaleString()}`,
            icon: <Wallet size={18} />,
            color: '#818cf8',
            bgGrad: 'linear-gradient(135deg, rgba(129, 140, 248, 0.08), rgba(129, 140, 248, 0.02))',
          },
          {
            label: 'Investments',
            value: `₹${financialMetrics.totalInvestment.toLocaleString()}`,
            icon: <BarChart3 size={18} />,
            color: '#10b981',
            bgGrad: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))',
          },
          {
            label: 'Unrealized P&L',
            value: `${financialMetrics.totalUnrealizedPnl >= 0 ? '+' : ''}₹${financialMetrics.totalUnrealizedPnl.toLocaleString()}`,
            icon:
              financialMetrics.totalUnrealizedPnl >= 0 ? (
                <ArrowUpRight size={18} />
              ) : (
                <ArrowDownRight size={18} />
              ),
            color: financialMetrics.totalUnrealizedPnl >= 0 ? '#34d399' : '#f87171',
            bgGrad:
              financialMetrics.totalUnrealizedPnl >= 0
                ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.08), rgba(52, 211, 153, 0.02))'
                : 'linear-gradient(135deg, rgba(248, 113, 113, 0.08), rgba(248, 113, 113, 0.02))',
          },
          {
            label: "Day's Change",
            value: `${financialMetrics.stockDayChange >= 0 ? '+' : ''}₹${financialMetrics.stockDayChange.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            icon: <Activity size={18} />,
            color: financialMetrics.stockDayChange >= 0 ? '#10b981' : '#ef4444',
            bgGrad:
              financialMetrics.stockDayChange >= 0
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.02))',
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="fade-in"
            style={{
              background: stat.bgGrad,
              borderRadius: '18px',
              border: `1px solid ${stat.color}15`,
              padding: '18px 20px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = `${stat.color}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = `${stat.color}15`;
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: `radial-gradient(circle, ${stat.color}10 0%, transparent 70%)`,
                filter: 'blur(20px)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}
            >
              <div style={{ color: stat.color }}>{stat.icon}</div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {stat.label}
              </span>
            </div>
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: '900',
                color:
                  stat.label === 'Unrealized P&L' || stat.label === "Day's Change"
                    ? stat.color
                    : '#fff',
                letterSpacing: '-0.5px',
                position: 'relative',
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </section>

      {/* Main Wealth Card: Unified Net Worth & Allocation */}
      <section className="wealth-card fade-in" style={{ marginBottom: '24px' }}>
        <div className="premium-card wealth-card-content">
          {/* Decorative glow */}
          <div className="wealth-card-glow" />

          <div className="wealth-card-inner">
            {/* Left: Net Worth Summary */}
            <div className="wealth-section">
              <div className="badge-wrapper">
                <div className="icon-badge">
                  <Zap size={20} />
                </div>
                <span className="stat-label">Total Net Worth</span>
              </div>

              <div className="mb-md">
                <div className="stat-value net-worth-value">
                  ₹{financialMetrics.totalNetWorth.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-sm mb-xl">
                <div className="lifetime-badge">
                  <TrendingUp size={14} /> +₹
                  {financialMetrics.globalLifetimeWealth.toLocaleString()} lifetime
                </div>
                <span
                  style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: '600' }}
                >
                  Portfolio Analysis
                </span>
              </div>

              <div className="metric-grid">
                <div className="metric-card">
                  <div className="stat-label metric-label">Liquid Cash</div>
                  <div className="metric-value">
                    ₹{financialMetrics.liquidityINR.toLocaleString()}
                  </div>
                </div>
                <div className="metric-card">
                  <div className="stat-label metric-label">Investments</div>
                  <div className="metric-value">
                    ₹
                    {(
                      financialMetrics.stocksValue +
                      financialMetrics.mfValue +
                      financialMetrics.bondsValue
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Asset Allocation integrated */}
            <div
              style={{
                flex: '0 1 350px',
                minWidth: '280px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '220px',
                  position: 'relative',
                  marginBottom: '16px',
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          style={{ filter: `drop-shadow(0 0 8px ${entry.color}33)` }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(2, 6, 23, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(10px)',
                      }}
                      itemStyle={{ color: '#fff', fontWeight: '700' }}
                      labelStyle={{ display: 'none' }}
                      formatter={(val) => [`₹${(Number(val) || 0).toLocaleString()}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}
              >
                {allocationData.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--glass)',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--glass-border)',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: item.color,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '900',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {((item.value / financialMetrics.totalNetWorth) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Row: Top Holdings + Recent Activity + Goals */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '20px',
        }}
      >
        {/* Top Holdings */}
        {topHoldings.length > 0 && (
          <div
            className="fade-in"
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #0a0f1e 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.04)',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '120px',
                height: '120px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08), transparent)',
                filter: 'blur(30px)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}
              >
                <TrendingUp size={16} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, color: '#e2e8f0' }}>
                Top Holdings
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topHoldings.map((stock) => (
                <div
                  key={stock.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff' }}>
                      {stock.symbol}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: '600' }}>
                      {stock.exchange} • {stock.quantity} shares
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff' }}>
                      ₹{stock.currentValue.toLocaleString()}
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        color: stock.pnl >= 0 ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        justifyContent: 'flex-end',
                      }}
                    >
                      {stock.pnl >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {stock.pnlPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentTransactions.length > 0 && (
          <div
            className="fade-in"
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #0a0f1e 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.04)',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-30px',
                left: '-30px',
                width: '120px',
                height: '120px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent)',
                filter: 'blur(30px)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6366f1',
                }}
              >
                <Sparkles size={16} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, color: '#e2e8f0' }}>
                Recent Activity
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.03)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background:
                        tx.type === 'Income'
                          ? 'rgba(52, 211, 153, 0.1)'
                          : 'rgba(248, 113, 113, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tx.type === 'Income' ? '#34d399' : '#f87171',
                      flexShrink: 0,
                    }}
                  >
                    {tx.type === 'Income' ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: '#e2e8f0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tx.description}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#475569', fontWeight: '500' }}>
                      {tx.category} •{' '}
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      color: tx.type === 'Income' ? '#34d399' : '#f87171',
                      flexShrink: 0,
                    }}
                  >
                    {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals Progress */}
        {goalsProgress.length > 0 && (
          <div
            className="fade-in"
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #0a0f1e 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.04)',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-30px',
                right: '-30px',
                width: '120px',
                height: '120px',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08), transparent)',
                filter: 'blur(30px)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b',
                }}
              >
                <Target size={16} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, color: '#e2e8f0' }}>
                Goals Tracker
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {goalsProgress.map((goal, idx) => (
                <div key={idx}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#e2e8f0' }}>
                      {goal.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: goal.percentage >= 100 ? '#10b981' : '#f59e0b',
                      }}
                    >
                      {goal.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '100px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${goal.percentage}%`,
                        height: '100%',
                        background:
                          goal.percentage >= 100
                            ? 'linear-gradient(to right, #10b981, #34d399)'
                            : 'linear-gradient(to right, #f59e0b, #fbbf24)',
                        borderRadius: '100px',
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: `0 0 8px ${goal.percentage >= 100 ? '#10b98140' : '#f59e0b40'}`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '4px',
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', color: '#475569' }}>
                      ₹{goal.current.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#475569' }}>
                      ₹{goal.target.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Summary - If no other panels show */}
        {topHoldings.length === 0 &&
          recentTransactions.length === 0 &&
          goalsProgress.length === 0 && (
            <div
              className="fade-in"
              style={{
                background: 'linear-gradient(145deg, #0f172a 0%, #0a0f1e 100%)',
                borderRadius: '24px',
                border: '1px dashed rgba(255,255,255,0.08)',
                padding: '48px',
                textAlign: 'center',
                gridColumn: '1 / -1',
              }}
            >
              <Sparkles size={40} style={{ color: '#334155', marginBottom: '16px' }} />
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#64748b',
                  marginBottom: '8px',
                }}
              >
                Your portfolio is getting started
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                Add accounts, stocks, and goals to see detailed insights here.
              </div>
            </div>
          )}
      </section>
    </div>
  );
}
