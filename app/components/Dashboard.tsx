"use client";

import { useMemo } from 'react';
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Activity,
    ChevronRight,
    Zap,
    Award,
    ShoppingBag
} from 'lucide-react';
import { useFinance } from './FinanceContext';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MutualFundTransaction } from '@/lib/types';
import { SkeletonCard, SkeletonTable } from './SkeletonLoader';

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
        transactions,
        goals,
        stocks,
        mutualFunds,
        stockTransactions,
        mutualFundTransactions,
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
        const totalNetWorth = liquidityINR + stocksValue + mfValue;

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
            .filter((t: MutualFundTransaction) =>
                t.transactionType === 'BUY' || t.transactionType === 'SIP'
            )
            .reduce((sum: number, t: MutualFundTransaction) => sum + t.totalAmount, 0);

        const mfSells = mutualFundTransactions
            .filter((t: MutualFundTransaction) => t.transactionType === 'SELL')
            .reduce((sum: number, t: MutualFundTransaction) => sum + t.totalAmount, 0);

        const mfLifetime = (mfSells + mfValue) - mfBuys;
        const globalLifetimeWealth = stockLifetime + mfLifetime;

        return {
            liquidityINR,
            stocksValue,
            mfValue,
            totalNetWorth,
            globalLifetimeWealth,
        };
    }, [accounts, stocks, mutualFunds, stockTransactions, mutualFundTransactions]);

    const allocationData = useMemo(() => {
        return [
            { name: 'Cash', value: financialMetrics.liquidityINR, color: '#6366f1' },
            { name: 'Stocks', value: financialMetrics.stocksValue, color: '#10b981' },
            { name: 'Mutual Funds', value: financialMetrics.mfValue, color: '#f59e0b' }
        ].filter(a => a.value > 0);
    }, [financialMetrics]);

    const recentTx = useMemo(() => transactions.slice(0, 5), [transactions]);

    // Calculate expense metrics
    const expenseMetrics = useMemo(() => {
        const expenseItems = transactions.filter(t => t.type === 'Expense');
        const thisMonthExpenses = expenseItems.filter(t => {
            const txDate = new Date(t.date);
            const now = new Date();
            return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        });
        
        const totalExpenses = thisMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
        
        const topCategory = thisMonthExpenses.reduce((acc, item) => {
            const category = item.category || 'Other';
            if (!acc[category]) acc[category] = 0;
            acc[category] += item.amount;
            return acc;
        }, {} as Record<string, number>);
        
        const topCategoryEntries = Object.entries(topCategory).sort((a, b) => b[1] - a[1]);
        const topCategoryName = topCategoryEntries.length > 0 ? topCategoryEntries[0][0] : 'None';
        
        return {
            totalExpenses,
            count: thisMonthExpenses.length,
            topCategory: topCategoryName
        };
    }, [transactions]);

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
                <div className="dashboard-grid">
                    <div style={{ gridColumn: 'span 12' }}><SkeletonTable /></div>
                    <div style={{ gridColumn: 'span 12' }}><SkeletonCard /></div>
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
                                    <div className="metric-value">₹{(financialMetrics.stocksValue + financialMetrics.mfValue).toLocaleString()}</div>
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
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Diversity</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-primary)' }}>{allocationData.length} Paths</div>
                                </div>
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

            {/* Bottom Grid */}
            <div className="dashboard-grid">

                {/* Recent Activity */}
                <div style={{ gridColumn: 'span 12' }} className="fade-in recent-activity-section">
                    <div className="premium-card" style={{ padding: '32px', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px', color: '#818cf8' }}>
                                    <Activity size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0 }}>Recent Global Activity</h3>
                            </div>
                            <Link href="/ledger" className="glass-button" style={{ padding: '8px 16px', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                View Full Ledger <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentTx.length > 0 ? recentTx.map((tx, idx) => (
                                <div key={tx.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '18px',
                                    border: '1px solid rgba(255,255,255,0.03)',
                                    gap: '16px',
                                    transition: 'all 0.2s',
                                    animation: `fadeIn 0.5s ease-out ${idx * 0.1}s forwards`,
                                    opacity: 0
                                }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                                    <div style={{
                                        background: tx.type === 'Income' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                        color: tx.type === 'Income' ? '#34d399' : '#f87171',
                                        padding: '12px',
                                        borderRadius: '14px',
                                        flexShrink: 0
                                    }}>
                                        {tx.type === 'Income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#fff', marginBottom: '2px' }}>{tx.description}</div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tx.category}</span>
                                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#334155' }} />
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>{tx.date}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '950', fontSize: '1.2rem', color: tx.type === 'Income' ? '#34d399' : '#f87171' }}>
                                            {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Completed</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="premium-card" style={{ padding: '40px', textAlign: 'center', background: 'transparent' }}>
                                    <div style={{ color: '#334155', marginBottom: '12px' }}><Activity size={48} /></div>
                                    <div style={{ color: '#64748b', fontWeight: '700' }}>No recent activity detected in the ledger.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Goal & Health */}
                <div className="slide-in-right goals-section" style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Top Goal */}
                    <div className="premium-card" style={{ padding: '32px', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px', color: '#818cf8' }}>
                                    <Target size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0 }}>Primary Goal</h3>
                            </div>
                        </div>

                        {goals.length > 0 ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '10px' }}>
                                        <Award size={24} color="#f59e0b" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#fff' }}>{goals[0].name}</div>
                                        <div className="stat-label" style={{ fontSize: '0.65rem' }}>Target Achievement</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff' }}>{((goals[0].currentAmount / goals[0].targetAmount) * 100).toFixed(1)}%</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>₹{goals[0].targetAmount.toLocaleString()}</span>
                                    </div>
                                    <div style={{ width: '100%', height: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '100px', padding: '2px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{
                                            width: `${Math.min((goals[0].currentAmount / goals[0].targetAmount) * 100, 100)}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                                            borderRadius: '100px',
                                            boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)'
                                        }} />
                                    </div>
                                </div>

                                <Link href="/goals" className="glass-button" style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: '16px', fontSize: '0.9rem', textDecoration: 'none' }}>
                                    Manage Objectives
                                </Link>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
                                <div style={{ opacity: 0.2, marginBottom: '16px' }}><Target size={48} /></div>
                                <div style={{ fontWeight: '700' }}>Establish your first target</div>
                            </div>
                        )}
                    </div>

                    {/* Expenses Summary Card */}
                    <div className="premium-card" style={{ padding: '32px', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '12px', color: '#f87171' }}>
                                    <ShoppingBag size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0 }}>This Month&apos;s Expenses</h3>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '10px' }}>
                                    <ArrowDownRight size={24} color="#ef4444" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#fff' }}>₹{expenseMetrics.totalExpenses.toLocaleString()}</div>
                                    <div className="stat-label" style={{ fontSize: '0.65rem' }}>Total Spent</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff' }}>{expenseMetrics.count} Transactions</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Top: {expenseMetrics.topCategory}</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '100px', padding: '2px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
                                        borderRadius: '100px',
                                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
                                    }} />
                                </div>
                            </div>

                            <Link href="/expenses" className="glass-button" style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: '16px', fontSize: '0.9rem', textDecoration: 'none' }}>
                                Manage Expenses
                            </Link>
                        </div>
                    </div>



                </div>
            </div>

            <style jsx>{`
                .premium-card:hover .stat-value {
                    filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3));
                }
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 24px;
                }
                .recent-activity-section {
                    grid-column: span 12;
                }
                .goals-section {
                    grid-column: span 12;
                }
                @media (min-width: 1024px) {
                    .recent-activity-section {
                        grid-column: span 8;
                    }
                    .goals-section {
                        grid-column: span 4;
                    }
                }
                @media (max-width: 767px) {
                    .dashboard-grid {
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }
                    .premium-card {
                        padding: 20px !important;
                    }
                }
            `}</style>
        </div>
    );
}
