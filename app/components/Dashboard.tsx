"use client";

import { useMemo } from 'react';
import {
    TrendingUp,
    Zap,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useFinance } from './FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SkeletonCard } from './SkeletonLoader';

/**
 * Get time-based greeting
 */
function getGreeting(): { text: string; emoji: string } {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        return { text: 'Good Morning', emoji: '☀️' };
    } else if (hour >= 12 && hour < 17) {
        return { text: 'Good Afternoon', emoji: '☕' };
    } else if (hour >= 17 && hour < 21) {
        return { text: 'Good Evening', emoji: '🌇' };
    } else {
        return { text: 'Good Night', emoji: '🌙' };
    }
}

export default function Dashboard() {
    const {
        accounts,
        stocks,
        mutualFunds,
        bonds,
        stockTransactions,
        mutualFundTransactions,
        bondTransactions,
        loading
    } = useFinance();

    const greeting = useMemo(() => getGreeting(), []);

    // Memoize financial calculations
    const financialMetrics = useMemo(() => {
        const liquidityINR = accounts
            .filter(a => a.currency === 'INR')
            .reduce((sum, acc) => sum + acc.balance, 0);

        const stocksValue = stocks.reduce((sum, s) => sum + s.currentValue, 0);
        const mfValue = mutualFunds.reduce((sum, m) => sum + m.currentValue, 0);
        const bondsValue = bonds.reduce((sum, b) => sum + b.currentValue, 0);
        const totalNetWorth = liquidityINR + stocksValue + mfValue + bondsValue;

        const stockBuys = stockTransactions
            .filter(t => t.transactionType === 'BUY')
            .reduce((sum, t) => sum + t.totalAmount, 0);

        const stockSells = stockTransactions
            .filter(t => t.transactionType === 'SELL')
            .reduce((sum, t) => sum + t.totalAmount, 0);

        const stockCharges = stockTransactions
            .reduce((sum, t) => sum + (t.brokerage || 0) + (t.taxes || 0), 0);

        const stockLifetime = (stockSells + stocksValue) - (stockBuys + stockCharges);

        const mfBuys = mutualFundTransactions
            .filter((t: any) =>
                t.transactionType === 'BUY' || t.transactionType === 'SIP'
            )
            .reduce((sum: number, t: any) => sum + t.totalAmount, 0);

        const mfSells = mutualFundTransactions
            .filter((t: any) => t.transactionType === 'SELL')
            .reduce((sum: number, t: any) => sum + t.totalAmount, 0);

        const mfLifetime = (mfSells + mfValue) - mfBuys;

        const bondBuys = bondTransactions
            .filter(t => t.transactionType === 'BUY')
            .reduce((sum, t) => sum + t.totalAmount, 0);

        const bondReturns = bondTransactions
            .filter(t => t.transactionType === 'SELL' || t.transactionType === 'MATURITY' || t.transactionType === 'INTEREST')
            .reduce((sum, t) => sum + t.totalAmount, 0);

        const bondLifetime = (bondReturns + bondsValue) - bondBuys;

        const globalLifetimeWealth = stockLifetime + mfLifetime + bondLifetime;

        return {
            liquidityINR,
            stocksValue,
            mfValue,
            bondsValue,
            totalNetWorth,
            globalLifetimeWealth,
        };
    }, [accounts, stocks, mutualFunds, bonds, stockTransactions, mutualFundTransactions, bondTransactions]);

    const allocationData = useMemo(() => {
        return [
            { name: 'Cash', value: financialMetrics.liquidityINR, color: '#6366f1' },
            { name: 'Stocks', value: financialMetrics.stocksValue, color: '#10b981' },
            { name: 'Mutual Funds', value: financialMetrics.mfValue, color: '#f59e0b' },
            { name: 'Bonds', value: financialMetrics.bondsValue, color: '#ec4899' }
        ].filter(a => a.value > 0);
    }, [financialMetrics]);

    if (loading) {
        return (
            <div className="page-container">
                <div className="bg-mesh" />
                <div style={{ marginBottom: '32px' }}>
                    <div className="skeleton" style={{ height: '48px', width: '350px', marginBottom: '12px' }} />
                    <div className="skeleton" style={{ height: '24px', width: '450px' }} />
                </div>
                <div style={{ marginBottom: '32px' }}>
                    <SkeletonCard />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="bg-mesh" />

            {/* Header Section */}
            <header className="dashboard-header">
                <div className="fade-in">
                    <h1 className="dashboard-title">
                        <span className="animate-sparkle" style={{ fontSize: '0.8em' }}>✨</span>
                        <span>
                            {greeting.text}, <span className="title-accent text-glow">Saran
                                <span className="title-underline" />
                            </span>
                        </span>
                    </h1>
                </div>
            </header>

            {/* Main Wealth Card: Unified Net Worth & Allocation */}
            <section className="wealth-card fade-in">
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
                                    <TrendingUp size={14} /> +₹{financialMetrics.globalLifetimeWealth.toLocaleString()} lifetime
                                </div>
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: '600' }}>Portfolio Analysis</span>
                            </div>

                            <div className="metric-grid">
                                <div className="metric-card">
                                    <div className="stat-label metric-label">Liquid Cash</div>
                                    <div className="metric-value">₹{financialMetrics.liquidityINR.toLocaleString()}</div>
                                </div>
                                <div className="metric-card">
                                    <div className="stat-label metric-label">Investments</div>
                                    <div className="metric-value">₹{(financialMetrics.stocksValue + financialMetrics.mfValue + financialMetrics.bondsValue).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Asset Allocation integrated */}
                        <div style={{ flex: '0 1 350px', minWidth: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '100%', height: '220px', position: 'relative', marginBottom: '16px' }}>
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
                                                <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color}33)` }} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: 'rgba(2, 6, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                            itemStyle={{ color: '#fff', fontWeight: '700' }}
                                            labelStyle={{ display: 'none' }}
                                            formatter={(val) => [`₹${(Number(val) || 0).toLocaleString()}`, '']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
                                {allocationData.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>{item.name}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-primary)' }}>{((item.value / financialMetrics.totalNetWorth) * 100).toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
