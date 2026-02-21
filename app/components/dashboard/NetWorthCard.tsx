'use client';

import { TrendingUp, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AllocationEntry {
  name: string;
  value: number;
  color: string;
}

interface NetWorthCardProps {
  totalNetWorth: number;
  globalLifetimeWealth: number;
  liquidityINR: number;
  investmentsTotal: number;
  allocationData: AllocationEntry[];
}

export function NetWorthCard({
  totalNetWorth,
  globalLifetimeWealth,
  liquidityINR,
  investmentsTotal,
  allocationData,
}: NetWorthCardProps) {
  return (
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
              <div className="stat-value net-worth-value">₹{totalNetWorth.toLocaleString()}</div>
            </div>

            <div className="flex items-center gap-sm mb-xl">
              <div className="lifetime-badge">
                <TrendingUp size={14} /> +₹{globalLifetimeWealth.toLocaleString()} lifetime
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
                <div className="metric-value">₹{liquidityINR.toLocaleString()}</div>
              </div>
              <div className="metric-card">
                <div className="stat-label metric-label">Investments</div>
                <div className="metric-value">₹{investmentsTotal.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Right: Asset Allocation Donut Chart */}
          <div
            style={{
              flex: '1 1 280px',
              minWidth: '0',
              maxWidth: '400px',
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

            {/* Legend */}
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
                    {totalNetWorth > 0 ? ((item.value / totalNetWorth) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
