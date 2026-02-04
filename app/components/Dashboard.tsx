"use client";

import { useEffect, useState } from 'react';
import {
    Wallet,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    PieChart as PieIcon,
    Briefcase,
    Activity,
    ChevronRight,
    Zap
} from 'lucide-react';
import { useFinance } from './FinanceContext';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

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

    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting('Good Morning');
        else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
        else if (hour >= 17 && hour < 21) setGreeting('Good Evening');
        else setGreeting('Good Night');
    }, []);

    // Financial calculations
    const liquidityINR = accounts.filter(a => a.currency === 'INR').reduce((sum, acc) => sum + acc.balance, 0);
    const stocksValue = stocks.reduce((sum, s) => sum + s.currentValue, 0);
    const mfValue = mutualFunds.reduce((sum, m) => sum + m.currentValue, 0);

    const totalNetWorth = liquidityINR + stocksValue + mfValue;

    // Lifetime Metrics Calculation (Stocks)
    const stockBuys = stockTransactions.filter(t => t.transactionType === 'BUY').reduce((sum, t) => sum + t.totalAmount, 0);
    const stockSells = stockTransactions.filter(t => t.transactionType === 'SELL').reduce((sum, t) => sum + t.totalAmount, 0);
    const stockCharges = stockTransactions.reduce((sum, t) => sum + (t.brokerage || 0) + (t.taxes || 0), 0);
    const stockLifetime = (stockSells + stocksValue) - (stockBuys + stockCharges);

    // Lifetime Metrics Calculation (MF)
    const mfBuys = mutualFundTransactions.filter((t: any) => t.transactionType === 'BUY' || t.transactionType === 'SIP').reduce((sum: number, t: any) => sum + t.totalAmount, 0);
    const mfSells = mutualFundTransactions.filter((t: any) => t.transactionType === 'SELL').reduce((sum: number, t: any) => sum + t.totalAmount, 0);
    const mfLifetime = (mfSells + mfValue) - mfBuys;

    const globalLifetimeWealth = stockLifetime + mfLifetime;

    // Asset Allocation Data
    const allocationData = [
        { name: 'Cash', value: liquidityINR, color: '#6366f1' },
        { name: 'Stocks', value: stocksValue, color: '#10b981' },
        { name: 'Mutual Funds', value: mfValue, color: '#f59e0b' }
    ].filter(a => a.value > 0);

    // Recent Transactions (Unified)
    const recentTx = transactions.slice(0, 5);

    // Show loading state
    if (loading) {
        return (
            <div className="main-content" style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#818cf8', fontWeight: '700' }}>Loading your financial dashboard...</div>
                    <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#64748b' }}>Calculating your net worth and portfolio</div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content" style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
            <div style={{ maxWidth: '1300px', margin: '0 auto' }}>

                {/* 1. Top Header Section */}
                <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: '900', margin: 0, letterSpacing: '-0.02em', color: '#fff' }}>
                            {greeting}, <span style={{ color: '#818cf8' }}>Saran</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: 'clamp(0.875rem, 2vw, 1rem)', marginTop: '8px' }}>Your financial empire is expanding.</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 20px', borderRadius: '16px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '12px', alignSelf: 'flex-start' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Market Access</span>
                    </div>
                </div>

                {/* 2. Primary Wealth Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px', marginBottom: '32px' }}>

                    {/* Total Net Worth Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        padding: 'clamp(24px, 5vw, 48px)',
                        borderRadius: '24px',
                        border: '1px solid #334155',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        gridColumn: 'span 1'
                    }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: 'linear-gradient(to left, rgba(99, 102, 241, 0.05), transparent)' }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '12px', borderRadius: '14px', color: '#818cf8' }}>
                                    <Zap size={24} />
                                </div>
                                <span style={{ color: '#94a3b8', fontSize: 'clamp(0.75rem, 2vw, 1rem)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Total Net Worth</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                                <div style={{ fontSize: 'clamp(2rem, 8vw, 4.5rem)', fontWeight: '950', color: '#fff', letterSpacing: '-3px', lineHeight: 1, wordBreak: 'break-word' }}>
                                    ₹{totalNetWorth.toLocaleString()}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'clamp(16px, 4vw, 40px)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 'clamp(20px, 4vw, 40px)' }}>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px' }}>Liquidity</div>
                                    <div style={{ color: '#fff', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: '800' }}>₹{liquidityINR.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px' }}>Equity</div>
                                    <div style={{ color: '#fff', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: '800' }}>₹{stocksValue.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px' }}>Mutual Funds</div>
                                    <div style={{ color: '#fff', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: '800' }}>₹{mfValue.toLocaleString()}</div>
                                </div>
                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 'clamp(16px, 4vw, 40px)' }}>
                                    <div style={{ color: '#818cf8', fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px' }}>Lifetime Wealth</div>
                                    <div style={{ color: '#10b981', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: '900' }}>+₹{globalLifetimeWealth.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Asset Allocation Chart */}
                    <div style={{
                        background: '#0f172a',
                        borderRadius: '24px',
                        border: '1px solid #1e293b',
                        padding: 'clamp(24px, 4vw, 32px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gridColumn: 'span 1'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <PieIcon size={20} color="#818cf8" />
                            <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)', fontWeight: '800', margin: 0 }}>Allocation</h3>
                        </div>
                        <div style={{ flex: 1, position: 'relative', minHeight: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={allocationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {allocationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                                        formatter={(val: any) => [`₹${(val || 0).toLocaleString()}`, 'Value']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
                            {allocationData.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Secondary Row: Activity & Targets */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>

                    {/* Recent Transactions */}
                    <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid #1e293b', padding: 'clamp(20px, 4vw, 32px)', gridColumn: 'span 1' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Activity size={20} color="#818cf8" />
                                <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)', fontWeight: '800', margin: 0 }}>Global Activity</h3>
                            </div>
                            <Link href="/ledger" style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Full Ledger <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentTx.map((tx, idx) => (
                                <div key={tx.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: 'clamp(12px, 3vw, 16px)',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.03)',
                                    gap: '12px'
                                }}>
                                    <div style={{
                                        background: tx.type === 'Income' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                        color: tx.type === 'Income' ? '#34d399' : '#f87171',
                                        padding: '10px',
                                        borderRadius: '12px',
                                        flexShrink: 0
                                    }}>
                                        {tx.type === 'Income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '700', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>{tx.category} • {tx.date}</div>
                                    </div>
                                    <div style={{ fontWeight: '900', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: tx.type === 'Income' ? '#34d399' : '#f87171', flexShrink: 0 }}>
                                        {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Retirement / Goal Target */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', gridColumn: 'span 1' }}>
                        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '24px', border: '1px solid #1e293b', padding: 'clamp(20px, 4vw, 32px)', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Target size={20} color="#818cf8" />
                                    <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)', fontWeight: '800', margin: 0 }}>Top Goal</h3>
                                </div>
                            </div>
                            {goals.length > 0 ? (
                                <div>
                                    <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: '900', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goals[0].name}</div>
                                    <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.85rem)', color: '#64748b', marginBottom: '16px' }}>{((goals[0].currentAmount / goals[0].targetAmount) * 100).toFixed(1)}% of ₹{goals[0].targetAmount.toLocaleString()} reached</div>
                                    <div style={{ width: '100%', height: '12px', background: '#020617', borderRadius: '100px', overflow: 'hidden', marginBottom: '20px' }}>
                                        <div style={{ width: `${Math.min((goals[0].currentAmount / goals[0].targetAmount) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #34d399 100%)', borderRadius: '100px' }} />
                                    </div>
                                    <Link href="/goals" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none' }}>Optimize Performance</Link>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#64748b', paddingTop: '20px' }}>Set a target to begin</div>
                            )}
                        </div>

                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', borderRadius: '24px', border: '1px dashed rgba(16, 185, 129, 0.2)', padding: 'clamp(16px, 3vw, 24px)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px', flexShrink: 0 }}>
                                <TrendingUp size={24} color="#10b981" />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>Portfolio Health</div>
                                <div style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)', fontWeight: '900', color: '#fff' }}>Excellent</div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
