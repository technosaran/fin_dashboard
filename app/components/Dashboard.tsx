"use client";

import { useMemo } from 'react';
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    PieChart as PieIcon,
    Activity,
    ChevronRight,
    Zap
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

    // Memoize financial calculations to prevent unnecessary recalculations
    const financialMetrics = useMemo(() => {
        const liquidityINR = accounts
            .filter(a => a.currency === 'INR')
            .reduce((sum, acc) => sum + acc.balance, 0);
        
        const stocksValue = stocks.reduce((sum, s) => sum + s.currentValue, 0);
        const mfValue = mutualFunds.reduce((sum, m) => sum + m.currentValue, 0);
        const totalNetWorth = liquidityINR + stocksValue + mfValue;

        // Stock lifetime metrics
        const stockBuys = stockTransactions
            .filter(t => t.transactionType === 'BUY')
            .reduce((sum, t) => sum + t.totalAmount, 0);
        
        const stockSells = stockTransactions
            .filter(t => t.transactionType === 'SELL')
            .reduce((sum, t) => sum + t.totalAmount, 0);
        
        const stockCharges = stockTransactions
            .reduce((sum, t) => sum + (t.brokerage || 0) + (t.taxes || 0), 0);
        
        const stockLifetime = (stockSells + stocksValue) - (stockBuys + stockCharges);

        // MF lifetime metrics
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

    // Memoize allocation data
    const allocationData = useMemo(() => {
        return [
            { name: 'Cash', value: financialMetrics.liquidityINR, color: '#6366f1' },
            { name: 'Stocks', value: financialMetrics.stocksValue, color: '#10b981' },
            { name: 'Mutual Funds', value: financialMetrics.mfValue, color: '#f59e0b' }
        ].filter(a => a.value > 0);
    }, [financialMetrics]);

    // Memoize recent transactions
    const recentTx = useMemo(() => transactions.slice(0, 5), [transactions]);

    // Show loading state
    if (loading) {
        return (
            <div className="page-container">
                <div style={{ marginBottom: '20px' }}>
                    <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '10px' }} />
                    <div className="skeleton" style={{ height: '20px', width: '400px' }} />
                </div>
                
                {/* Skeleton for Wealth Overview */}
                <div style={{ marginBottom: '20px' }}>
                    <SkeletonCard />
                </div>

                {/* Skeleton for Activity & Goals */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
                    <div><SkeletonTable /></div>
                    <div><SkeletonCard /></div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* 1. Top Header Section */}
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '900', margin: 0, letterSpacing: '-0.02em', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="animate-sparkle">✨</span>
                        <span>{greeting.text}, <span style={{ color: '#818cf8' }} className="text-glow">Saran <span className="animate-sparkle" style={{ marginLeft: '4px' }}>{greeting.emoji}</span></span></span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', marginTop: '6px' }}>Your financial empire is expanding.</p>
                </div>
            </div>

            {/* 2. Wealth Overview - Combined Card */}
            <div style={{ marginBottom: '20px' }} className="fade-in">
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    padding: 'clamp(20px, 4vw, 28px)',
                    borderRadius: '20px',
                    border: '1px solid #334155',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }} className="card-hover">
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'linear-gradient(to left, rgba(99, 102, 241, 0.05), transparent)' }} />

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '24px' }}>

                        {/* Left Section: Net Worth Breakdown */}
                        <div style={{ flex: '2 1 400px', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '12px', color: '#818cf8' }}>
                                    <Zap size={20} />
                                </div>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Total Net Worth</span>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '950', color: '#fff', letterSpacing: '-2px', lineHeight: 1 }}>
                                    ₹{financialMetrics.totalNetWorth.toLocaleString()}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '6px' }}>Cash</div>
                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '800' }}>₹{financialMetrics.liquidityINR.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '6px' }}>Equity</div>
                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '800' }}>₹{financialMetrics.stocksValue.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '6px' }}>Mutual Funds</div>
                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '800' }}>₹{financialMetrics.mfValue.toLocaleString()}</div>
                                </div>
                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
                                    <div style={{ color: '#818cf8', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '6px' }}>Lifetime Metrics</div>
                                    <div style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: '900' }}>{financialMetrics.globalLifetimeWealth >= 0 ? '+' : '-'}₹{Math.abs(financialMetrics.globalLifetimeWealth).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Section: Allocation Chart */}
                        <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 'clamp(0px, 2vw, 24px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <PieIcon size={16} color="#818cf8" />
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Asset Allocation</span>
                            </div>
                            <div style={{ height: '220px', position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={allocationData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={75}
                                            paddingAngle={6}
                                            dataKey="value"
                                            stroke="none"
                                            label={({
                                                cx = 0,
                                                cy = 0,
                                                midAngle = 0,
                                                outerRadius = 0,
                                                value = 0,
                                                index = 0
                                            }) => {
                                                const RADIAN = Math.PI / 180;
                                                const radius = outerRadius + 25;
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                const percent = (value / financialMetrics.totalNetWorth) * 100;

                                                if (percent < 5) return null;

                                                return (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        fill="#94a3b8"
                                                        textAnchor={x > cx ? 'start' : 'end'}
                                                        dominantBaseline="central"
                                                        style={{ fontSize: '0.7rem', fontWeight: '900', fontFamily: 'Inter' }}
                                                    >
                                                        {allocationData[index].name}: {percent.toFixed(0)}%
                                                    </text>
                                                );
                                            }}
                                        >
                                            {allocationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                                            formatter={(val: number | string) => [`₹${(Number(val) || 0).toLocaleString()}`, 'Value']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
                                {allocationData.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Secondary Row: Activity & Targets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>

                {/* Recent Transactions */}
                <div style={{ background: '#0f172a', borderRadius: '20px', border: '1px solid #1e293b', padding: 'clamp(16px, 3.5vw, 24px)', gridColumn: 'span 1' }} className="fade-in card-hover">
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={18} color="#818cf8" />
                            <h3 style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', fontWeight: '800', margin: 0 }}>Global Activity</h3>
                        </div>
                        <Link href="/ledger" style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Full Ledger <ChevronRight size={13} />
                        </Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {recentTx.length > 0 ? recentTx.map((tx) => (
                            <div key={tx.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: 'clamp(10px, 2.5vw, 14px)',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '14px',
                                border: '1px solid rgba(255,255,255,0.03)',
                                gap: '10px'
                            }}>
                                <div style={{
                                    background: tx.type === 'Income' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                    color: tx.type === 'Income' ? '#34d399' : '#f87171',
                                    padding: '8px',
                                    borderRadius: '10px',
                                    flexShrink: 0
                                }}>
                                    {tx.type === 'Income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '700', fontSize: 'clamp(0.8rem, 1.8vw, 0.85rem)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>{tx.category} • {tx.date}</div>
                                </div>
                                <div style={{ fontWeight: '900', fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)', color: tx.type === 'Income' ? '#34d399' : '#f87171', flexShrink: 0 }}>
                                    {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', color: '#64748b', padding: '16px' }}>No recent activity</div>
                        )}
                    </div>
                </div>

                {/* Retirement / Goal Target */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 1' }} className="slide-in-right">
                    <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', border: '1px solid #1e293b', padding: 'clamp(16px, 3.5vw, 24px)', flex: 1 }} className="card-hover">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Target size={18} color="#818cf8" />
                                <h3 style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', fontWeight: '800', margin: 0 }}>Top Goal</h3>
                            </div>
                        </div>
                        {goals.length > 0 ? (
                            <div>
                                <div style={{ fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)', fontWeight: '900', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goals[0].name}</div>
                                <div style={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.8rem)', color: '#64748b', marginBottom: '12px' }}>{((goals[0].currentAmount / goals[0].targetAmount) * 100).toFixed(1)}% of ₹{goals[0].targetAmount.toLocaleString()} reached</div>
                                <div style={{ width: '100%', height: '10px', background: '#020617', borderRadius: '100px', overflow: 'hidden', marginBottom: '14px' }}>
                                    <div style={{ width: `${Math.min((goals[0].currentAmount / goals[0].targetAmount) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #34d399 100%)', borderRadius: '100px' }} />
                                </div>
                                <Link href="/goals" style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontWeight: '700', fontSize: '0.8rem', textDecoration: 'none' }}>Optimize Performance</Link>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#64748b', paddingTop: '16px' }}>Set a target to begin</div>
                        )}
                    </div>

                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', borderRadius: '20px', border: '1px dashed rgba(16, 185, 129, 0.2)', padding: 'clamp(14px, 2.5vw, 20px)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '10px', flexShrink: 0 }}>
                            <TrendingUp size={20} color="#10b981" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>Portfolio Health</div>
                            <div style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1rem)', fontWeight: '900', color: '#fff' }}>Excellent</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
