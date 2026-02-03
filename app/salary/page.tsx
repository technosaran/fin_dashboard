"use client";

import { useState } from 'react';
import { useFinance } from '../components/FinanceContext';
import {
    Banknote,
    TrendingUp,
    Plus,
    X,
    Building2,
    Calendar,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Wallet
} from 'lucide-react';

export default function SalaryPage() {
    const { accounts, transactions, addFunds } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'Yearly' | 'Lifetime'>('Yearly');

    // Form State
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));

    // Processing
    const salaryHistory = transactions.filter(t => t.category === 'Salary');
    const currentYear = new Date().getFullYear();
    const items = activeTab === 'Yearly'
        ? salaryHistory.filter(t => new Date(t.date).getFullYear() === currentYear)
        : salaryHistory;

    const totalIncome = items.reduce((sum, t) => sum + t.amount, 0);

    const companyStats = items.reduce((acc, t) => {
        const name = t.description.split(' | ')[0] || 'Unknown';
        if (!acc[name]) acc[name] = { total: 0, count: 0 };
        acc[name].total += t.amount;
        acc[name].count += 1;
        return acc;
    }, {} as Record<string, { total: number, count: number }>);

    const companies = Object.entries(companyStats).sort((a, b) => b[1].total - a[1].total);

    const handleLogSalary = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !accountId || !companyName) return;
        addFunds(Number(accountId), parseFloat(amount), `${companyName} | ${month} Salary`, 'Salary');
        setAmount('');
        setCompanyName('');
        setIsModalOpen(false);
    };

    return (
        <div className="main-content" style={{ padding: '30px 50px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* 1. Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>Salary Hub</h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: '#0f172a', padding: '4px', borderRadius: '10px', border: '1px solid #1e293b', display: 'flex' }}>
                            {['Yearly', 'Lifetime'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '7px',
                                        background: activeTab === tab ? '#1e293b' : 'transparent',
                                        color: activeTab === tab ? '#fff' : '#64748b',
                                        border: activeTab === tab ? '1px solid #334155' : 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        transition: '0.2s'
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                background: '#818cf8',
                                color: 'white',
                                padding: '8px 18px',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                boxShadow: '0 4px 12px rgba(129, 140, 248, 0.3)'
                            }}
                        >
                            <Plus size={16} strokeWidth={3} /> Log Income
                        </button>
                    </div>
                </div>

                {/* 2. Key Metrics Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                    {[
                        { label: `${activeTab} Earnings`, value: `$${totalIncome.toLocaleString()}`, icon: <TrendingUp size={20} />, color: '#818cf8', gradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)' },
                        { label: 'Avg Monthly', value: `$${(totalIncome / (activeTab === 'Yearly' ? new Date().getMonth() + 1 : items.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: <Calendar size={20} />, color: '#34d399', gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' },
                        { label: 'Active Sources', value: companies.length, icon: <Building2 size={20} />, color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                            padding: '24px',
                            borderRadius: '20px',
                            border: '1px solid #1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';
                            e.currentTarget.style.borderColor = '#334155';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = '#1e293b';
                        }}
                        >
                            {/* Decorative gradient overlay */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '120px',
                                height: '120px',
                                background: `radial-gradient(circle, ${stat.color}15 0%, transparent 70%)`,
                                pointerEvents: 'none'
                            }} />
                            <div style={{ 
                                background: stat.gradient,
                                padding: '14px',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: `0 4px 12px ${stat.color}40`,
                                position: 'relative'
                            }}>{stat.icon}</div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{stat.label}</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. Company Grid (Small & Square) */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Employers</h2>
                        <div style={{ height: '1px', flex: 1, background: '#1e293b', margin: '0 20px' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                        {companies.map(([name, stats]) => (
                            <div key={name} style={{
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid #1e293b',
                                aspectRatio: '1/1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';
                                e.currentTarget.style.borderColor = '#334155';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = '#1e293b';
                            }}
                            >
                                {/* Decorative gradient overlay */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    right: '-20px',
                                    width: '80px',
                                    height: '80px',
                                    background: 'radial-gradient(circle, rgba(129, 140, 248, 0.15) 0%, transparent 70%)',
                                    pointerEvents: 'none'
                                }} />
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '16px',
                                    color: 'white',
                                    boxShadow: '0 4px 12px rgba(129, 140, 248, 0.3)',
                                    position: 'relative'
                                }}>
                                    <Building2 size={22} strokeWidth={2.5} />
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '8px', position: 'relative' }}>{name}</div>
                                <div style={{ color: '#34d399', fontSize: '1.2rem', fontWeight: '800', marginBottom: '4px', position: 'relative' }}>${stats.total.toLocaleString()}</div>
                                <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: '600', position: 'relative' }}>{stats.count} {stats.count === 1 ? 'Log' : 'Logs'}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Compact Activity Stream */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Recent Logs</h2>
                        <div style={{ height: '1px', flex: 1, background: '#1e293b', margin: '0 20px' }} />
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '20px', border: '1px solid #1e293b', padding: '10px', overflow: 'hidden' }}>
                        {items.slice(0, 8).map((item, idx) => (
                            <div key={item.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '16px 20px',
                                borderBottom: idx === items.slice(0, 8).length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s',
                                borderRadius: '12px',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '16px',
                                    color: 'white',
                                    boxShadow: '0 4px 12px rgba(52, 211, 153, 0.3)'
                                }}>
                                    <CheckCircle2 size={20} strokeWidth={2.5} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px' }}>{item.description.split(' | ')[0]}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>{item.description.split(' | ')[1]}</div>
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div>
                                        <div style={{ color: '#f8fafc', fontWeight: '800', fontSize: '1rem', marginBottom: '4px' }}>+${item.amount.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', fontWeight: '600' }}>
                                            <Clock size={12} /> {item.date}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(129, 140, 248, 0.15)',
                                        padding: '8px',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#818cf8'
                                    }}>
                                        <ArrowUpRight size={18} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Glassmorphic Log Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        padding: '32px',
                        borderRadius: '24px',
                        border: '1px solid #334155',
                        width: '100%',
                        maxWidth: '480px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>New Salary Log</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleLogSalary} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</label>
                                <input
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    style={{
                                        background: '#020617',
                                        border: '1px solid #334155',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#818cf8'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    style={{
                                        background: '#020617',
                                        border: '1px solid #334155',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#818cf8'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account</label>
                                    <select
                                        value={accountId}
                                        onChange={e => setAccountId(e.target.value)}
                                        style={{
                                            background: '#020617',
                                            border: '1px solid #334155',
                                            padding: '14px 12px',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="">Select...</option>
                                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Month</label>
                                    <select
                                        value={month}
                                        onChange={e => setMonth(e.target.value)}
                                        style={{
                                            background: '#020617',
                                            border: '1px solid #334155',
                                            padding: '14px 12px',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                style={{
                                    background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                                    color: '#fff',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: '800',
                                    fontSize: '0.95rem',
                                    marginTop: '10px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(129, 140, 248, 0.3)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Confirm Entry
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
