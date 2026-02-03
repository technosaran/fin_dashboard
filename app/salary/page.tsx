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
                        { label: `${activeTab} Earnings`, value: `$${totalIncome.toLocaleString()}`, icon: <TrendingUp size={18} />, color: '#818cf8' },
                        { label: 'Avg Monthly', value: `$${(totalIncome / (activeTab === 'Yearly' ? new Date().getMonth() + 1 : items.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: <Calendar size={18} />, color: '#34d399' },
                        { label: 'Active Sources', value: companies.length, icon: <Building2 size={18} />, color: '#fbbf24' }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: '#0f172a',
                            padding: '20px',
                            borderRadius: '20px',
                            border: '1px solid #1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                        }}>
                            <div style={{ background: `${stat.color}15`, color: stat.color, padding: '10px', borderRadius: '12px' }}>{stat.icon}</div>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>{stat.label}</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. Company Grid (Small & Square) */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#64748b' }}>EMPLOYERS</h2>
                        <div style={{ height: '1px', flex: 1, background: '#1e293b', margin: '0 20px' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
                        {companies.map(([name, stats]) => (
                            <div key={name} style={{
                                background: 'rgba(15, 23, 42, 0.5)',
                                padding: '20px',
                                borderRadius: '24px',
                                border: '1px solid #1e293b',
                                aspectRatio: '1/1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                transition: '0.2s transform'
                            }}>
                                <div style={{ width: '35px', height: '35px', borderRadius: '10px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#818cf8' }}>
                                    <Building2 size={18} />
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>{name}</div>
                                <div style={{ color: '#34d399', fontSize: '1rem', fontWeight: '800' }}>${stats.total.toLocaleString()}</div>
                                <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '6px' }}>{stats.count} Logs</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Compact Activity Stream */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#64748b' }}>RECENT LOGS</h2>
                        <div style={{ height: '1px', flex: 1, background: '#1e293b', margin: '0 20px' }} />
                    </div>
                    <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid #1e293b', padding: '10px' }}>
                        {items.slice(0, 8).map((item, idx) => (
                            <div key={item.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                borderBottom: idx === items.slice(0, 8).length - 1 ? 'none' : '1px solid #1e293b'
                            }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', color: '#34d399' }}>
                                    <CheckCircle2 size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.description.split(' | ')[0]}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.description.split(' | ')[1]}</div>
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div>
                                        <div style={{ color: '#f8fafc', fontWeight: '800', fontSize: '0.95rem' }}>+${item.amount.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                            <Clock size={10} /> {item.date}
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} color="#1e293b" />
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
                    background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#020617', padding: '40px', borderRadius: '32px', border: '1px solid #1e293b',
                        width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>New Salary Log</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleLogSalary} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>COMPANY</label>
                                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Acme Corp" style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '12px 16px', borderRadius: '12px', color: '#fff', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>AMOUNT</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '12px 16px', borderRadius: '12px', color: '#fff', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>ACCOUNT</label>
                                    <select value={accountId} onChange={e => setAccountId(e.target.value)} style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff' }}>
                                        <option value="">Select...</option>
                                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>MONTH</label>
                                    <select value={month} onChange={e => setMonth(e.target.value)} style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff' }}>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" style={{ background: '#818cf8', color: '#fff', padding: '14px', borderRadius: '14px', border: 'none', fontWeight: '800', marginTop: '10px' }}>Confirm Entry</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
