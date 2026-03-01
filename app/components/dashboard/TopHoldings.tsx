'use client';

import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Stock } from '@/lib/types';

interface TopHoldingsProps {
  holdings: Stock[];
}

export function TopHoldings({ holdings }: TopHoldingsProps) {
  if (holdings.length === 0) return null;

  return (
    <div
      className="fade-in glass-panel"
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1), transparent)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)',
          }}
        >
          <TrendingUp size={16} />
        </div>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: '800',
            margin: 0,
            color: '#f8fafc',
            letterSpacing: '0.01em',
          }}
        >
          Top Holdings
        </h3>
      </div>

      {/* Holdings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {holdings.map((stock) => {
          const dayChange =
            (stock.currentPrice - (stock.previousPrice ?? stock.currentPrice)) * stock.quantity;
          return (
            <div
              key={stock.id}
              className="glow-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    color: '#fff',
                    letterSpacing: '0.01em',
                  }}
                >
                  {stock.symbol}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                  {stock.exchange} • {stock.quantity} shares
                </div>
              </div>
              <div style={{ textAlign: 'right', marginRight: '16px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff' }}>
                  ₹{stock.currentValue.toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
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
              {/* Day change mini badge */}
              <div
                style={{
                  padding: '6px 10px',
                  borderRadius: '10px',
                  background: dayChange >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${dayChange >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  color: dayChange >= 0 ? '#10b981' : '#ef4444',
                  whiteSpace: 'nowrap',
                  minWidth: '65px',
                  textAlign: 'center',
                }}
              >
                {dayChange >= 0 ? '+' : '-'}₹
                {Math.abs(dayChange).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
