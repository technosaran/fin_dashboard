"use client";

import { useEffect, useState } from 'react';
import {
    Wallet,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    PieChart as PieChartIcon,
    Clock,
    Zap,
    ChevronRight,
    PlusCircle,
    ArrowRightLeft
} from 'lucide-react';
import { useFinance } from './FinanceContext';
import Link from 'next/link';

export default function Dashboard() {
    const { accounts, transactions, goals } = useFinance();
    const [greeting, setGreeting] = useState('');
    const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 30000);

        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting('Good Morning');
        else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
        else if (hour >= 17 && hour < 21) setGreeting('Good Evening');
        else setGreeting('Good Night');

        return () => clearInterval(timer);
    }, []);

    // Financial calculations
    const totalINR = accounts.filter(a => a.currency === 'INR').reduce((sum, acc) => sum + acc.balance, 0);
    const totalUSD = accounts.filter(a => a.currency === 'USD').reduce((sum, acc) => sum + acc.balance, 0);

    // Recent Transactions
    const recentTx = transactions.slice(0, 5);

    // Goals progress
    const activeGoals = goals.slice(0, 2);

    return (
        <div className="main-content" style={{ padding: '40px 60px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* 1. Top Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
                    <div>

                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em', color: '#fff' }}>
                            {greeting}, <span style={{ color: '#818cf8' }}>Saran</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px' }}>Here&apos;s a look at your financial empire today.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>{time}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>

                {/* 2. Main Stats Hub */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '40px' }}>

                    {/* Primary Net Worth Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        padding: '40px',
                        borderRadius: '32px',
                        border: '1px solid #1e293b',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        {/* Abstract Background Decoration */}
                        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(52, 211, 153, 0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px', color: '#818cf8' }}>
                                    <Wallet size={24} />
                                </div>
                                <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Liquidity</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-baseline', gap: '20px' }}>
                                <div style={{ fontSize: '4rem', fontWeight: '950', color: '#fff', letterSpacing: '-2.5px' }}>
                                    ₹{totalINR.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '1rem', fontWeight: '700', background: 'rgba(52, 211, 153, 0.1)', padding: '6px 12px', borderRadius: '100px' }}>
                                    <TrendingUp size={16} /> +2.4%
                                </div>
                            </div>

                            {totalUSD > 0 && (
                                <div style={{ fontSize: '1.4rem', color: '#475569', fontWeight: '600', marginTop: '12px' }}>
                                    Alternative: <span style={{ color: '#64748b' }}>${totalUSD.toLocaleString()} USD</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '40px', marginTop: '48px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: '#34d399', width: '10px', height: '10px', borderRadius: '50%' }} />
                                    <div>
                                        <div style={{ color: '#475569', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Active Accounts</div>
                                        <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>{accounts.length} Entities</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: '#6366f1', width: '10px', height: '10px', borderRadius: '50%' }} />
                                    <div>
                                        <div style={{ color: '#475569', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Monthly Target</div>
                                        <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>78% Reached</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 4px 0' }}>Quick Hubs</h4>

                        <Link href="/accounts" style={{ textDecoration: 'none' }}>
                            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s', cursor: 'pointer' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.borderColor = '#334155'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = '#1e293b'; }}>
                                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '16px', color: '#38bdf8' }}>
                                    <PlusCircle size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#fff', fontWeight: '700', fontSize: '1rem' }}>Manage Assets</div>
                                    <div style={{ color: '#475569', fontSize: '0.8rem' }}>View accounts & wallets</div>
                                </div>
                                <ChevronRight size={20} color="#334155" />
                            </div>
                        </Link>

                        <Link href="/salary" style={{ textDecoration: 'none' }}>
                            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s', cursor: 'pointer' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.borderColor = '#334155'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = '#1e293b'; }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '12px', borderRadius: '16px', color: '#a855f7' }}>
                                    <Zap size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#fff', fontWeight: '700', fontSize: '1rem' }}>Salary Engine</div>
                                    <div style={{ color: '#475569', fontSize: '0.8rem' }}>Log income & bonuses</div>
                                </div>
                                <ChevronRight size={20} color="#334155" />
                            </div>
                        </Link>

                        <Link href="/ledger" style={{ textDecoration: 'none' }}>
                            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s', cursor: 'pointer' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.borderColor = '#334155'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = '#1e293b'; }}>
                                <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '12px', borderRadius: '16px', color: '#eab308' }}>
                                    <ArrowRightLeft size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#fff', fontWeight: '700', fontSize: '1rem' }}>Timeline</div>
                                    <div style={{ color: '#475569', fontSize: '0.8rem' }}>Transactions history</div>
                                </div>
                                <ChevronRight size={20} color="#334155" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* 3. Secondary Row: Recent Activity & Goals */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>

                    {/* Activity Feed */}
                    <div style={{ background: '#0f172a', borderRadius: '32px', border: '1px solid #1e293b', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Recent Activity</h3>
                            <Link href="/ledger" style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}>View All</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentTx.length > 0 ? recentTx.map((tx, idx) => (
                                <div key={tx.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.03)'
                                }}>
                                    <div style={{
                                        background: tx.type === 'Income' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                        color: tx.type === 'Income' ? '#34d399' : '#f87171',
                                        padding: '10px',
                                        borderRadius: '12px',
                                        marginRight: '16px'
                                    }}>
                                        {tx.type === 'Income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{tx.description}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>{tx.category} • {tx.date}</div>
                                    </div>
                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: tx.type === 'Income' ? '#34d399' : '#f87171' }}>
                                        {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#475569', border: '1px dashed #1e293b', borderRadius: '16px' }}>
                                    No recent transactions
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Goals View */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '32px', border: '1px solid #1e293b', padding: '32px', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Target size={20} color="#818cf8" />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Top Goals</h3>
                                </div>
                                <Link href="/goals" style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}>All Goals</Link>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {activeGoals.length > 0 ? activeGoals.map(goal => (
                                    <div key={goal.id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                            <span style={{ fontWeight: '700' }}>{goal.name}</span>
                                            <span style={{ color: '#34d399', fontWeight: '800' }}>{((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: '#020617', borderRadius: '100px', overflow: 'hidden' }}>
                                            <div style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #34d399 100%)', borderRadius: '100px' }} />
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: '30px', textAlign: 'center', color: '#475569', border: '1px dashed #1e293b', borderRadius: '16px' }}>
                                        Set your first financial goal
                                    </div>
                                )}
                            </div>
                        </div>


                    </div>
                </div>

            </div>
        </div>
    );
}
