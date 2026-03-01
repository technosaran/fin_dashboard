'use client';

import { Wallet, Activity, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface QuickStatsRowProps {
  liquidityINR: number;
  totalInvestment: number;
  totalUnrealizedPnl: number;
  stockDayChange: number;
  investmentPnlPercent?: number;
}

interface StatCard {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
  bgGrad: string;
}

export function QuickStatsRow({
  liquidityINR,
  totalInvestment,
  totalUnrealizedPnl,
  stockDayChange,
  investmentPnlPercent = 0,
}: QuickStatsRowProps) {
  const stats: StatCard[] = [
    {
      label: 'Liquid Cash',
      value: `₹${liquidityINR.toLocaleString()}`,
      icon: <Wallet size={18} />,
      color: '#818cf8',
      bgGrad: 'linear-gradient(135deg, rgba(129, 140, 248, 0.08), rgba(129, 140, 248, 0.02))',
    },
    {
      label: 'Investments',
      value: `₹${totalInvestment.toLocaleString()}`,
      icon: <BarChart3 size={18} />,
      color: '#10b981',
      bgGrad: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))',
    },
    {
      label: 'Unrealized P&L',
      value: `${totalUnrealizedPnl >= 0 ? '+' : ''}₹${totalUnrealizedPnl.toLocaleString()}`,
      subValue: `${investmentPnlPercent >= 0 ? '+' : ''}${investmentPnlPercent.toFixed(2)}%`,
      icon: totalUnrealizedPnl >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />,
      color: totalUnrealizedPnl >= 0 ? '#34d399' : '#f87171',
      bgGrad:
        totalUnrealizedPnl >= 0
          ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.08), rgba(52, 211, 153, 0.02))'
          : 'linear-gradient(135deg, rgba(248, 113, 113, 0.08), rgba(248, 113, 113, 0.02))',
    },
    {
      label: "Day's Change",
      value: `${stockDayChange >= 0 ? '+' : ''}₹${stockDayChange.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: <Activity size={18} />,
      color: stockDayChange >= 0 ? '#10b981' : '#ef4444',
      bgGrad:
        stockDayChange >= 0
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.02))',
    },
  ];

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}
    >
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="fade-in"
          style={{
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: `1px solid ${stat.color}20`,
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: `0 4px 20px -5px ${stat.color}05`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = `${stat.color}40`;
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
            e.currentTarget.style.boxShadow = `0 12px 24px -10px ${stat.color}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = `${stat.color}20`;
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)';
            e.currentTarget.style.boxShadow = `0 4px 20px -5px ${stat.color}05`;
          }}
        >
          {/* Decorative radial glow */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: `radial-gradient(circle, ${stat.color}15 0%, transparent 70%)`,
              filter: 'blur(20px)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: `${stat.color}15`,
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {stat.icon}
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {stat.label}
            </span>
          </div>
          <div
            className="stat-value"
            style={{
              fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)',
              fontWeight: '900',
              color:
                stat.label === 'Unrealized P&L' || stat.label === "Day's Change"
                  ? stat.color
                  : '#fff',
              letterSpacing: '-0.02em',
              position: 'relative',
              background:
                stat.label === 'Unrealized P&L' || stat.label === "Day's Change"
                  ? 'none'
                  : undefined,
              WebkitTextFillColor:
                stat.label === 'Unrealized P&L' || stat.label === "Day's Change"
                  ? 'currentColor'
                  : undefined,
            }}
          >
            {stat.value}
          </div>
          {stat.subValue && (
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: '800',
                color: stat.color,
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: stat.color,
                  boxShadow: `0 0 5px ${stat.color}`,
                }}
              />
              {stat.subValue}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
