"use client";

import { useState } from 'react';
import { useFinance } from '../components/FinanceContext';
import {
    Banknote,
    TrendingUp,
    Calendar,
    Building2,
    Plus,
    X,
    ArrowUpRight,
    Clock,
    Zap,
    Briefcase,
    Globe,
    Award,
    ChevronDown,
    ArrowRight
} from 'lucide-react';

export default function SalaryPage() {
    const { transactions, addTransaction } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'Yearly' | 'Lifetime'>('Yearly');

    // Salary Data Filtering
    const salaryItems = transactions.filter(t => t.category === 'Salary');

    // Process Companies/Sources
    const companiesMap = salaryItems.reduce((acc, item) => {
        const name = item.description || 'Unknown Employer';
        if (!acc[name]) acc[name] = { total: 0, count: 0 };
        acc[name].total += item.amount;
        acc[name].count += 1;
        return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const companies = Object.entries(companiesMap).sort((a, b) => b[1].total - a[1].total);
    const totalIncome = salaryItems.reduce((sum, item) => sum + item.amount, 0);

    // Form State
    const [amount, setAmount] = useState('');
    const [employer, setEmployer] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleLogIncome = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !employer) return;

        addTransaction({
            date,
            description: employer,
            category: 'Salary',
            type: 'Income',
            amount: parseFloat(amount)
        });

        setAmount('');
        setEmployer('');
        setIsModalOpen(false);
    };

    return (
        <div className="main-content" style={{ padding: '40px 60px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header Hub */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginBottom: '12px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#34d399', borderRadius: '50%', boxShadow: '0 0 10px rgba(52, 211, 153, 0.4)' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Income Engine Active</span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>Sovereign Income Hub</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px' }}>Centralized monitoring of career-based capital flow</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ display: 'flex', background: '#0f172a', padding: '6px', borderRadius: '14px', border: '1px solid #1e293b' }}>
                            {['Yearly', 'Lifetime'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab as any)} style={{
                                    padding: '10px 20px', borderRadius: '10px', border: 'none', background: activeTab === tab ? '#1e293b' : 'transparent', color: activeTab === tab ? '#fff' : '#64748b', fontWeight: '700', cursor: 'pointer', transition: '0.3s'
                                }}>{tab}</button>
                            ))}
                        </div>
                        <button onClick={() => setIsModalOpen(true)} style={{
                            padding: '12px 24px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'
                        }}>
                            <Zap size={18} fill="currentColor" /> Log Influx
                        </button>
                    </div>
                </div>

                {/* Performance Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginBottom: '48px' }}>
                    {[
                        { label: `${activeTab} Revenue`, value: `₹${totalIncome.toLocaleString()}`, icon: <TrendingUp size={22} />, color: '#6366f1', sub: '+12% from last period' },
                        { label: 'Avg Monthly Yield', value: `₹${(totalIncome / (activeTab === 'Yearly' ? new Date().getMonth() + 1 : salaryItems.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: <Calendar size={22} />, color: '#34d399', sub: 'Projected steady' },
                        { label: 'Capital Sources', value: companies.length, icon: <Briefcase size={22} />, color: '#f59e0b', sub: 'Diversification optimal' }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: '#0f172a', padding: '32px', borderRadius: '28px', border: '1px solid #1e293b', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: `${stat.color}08`, borderRadius: '50%', filter: 'blur(30px)' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: stat.color }}>
                                {stat.icon}
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#475569' }}>{stat.label}</span>
                            </div>
                            <div style={{ fontSize: '2.2rem', fontWeight: '950', color: '#fff', marginBottom: '8px', letterSpacing: '-1px' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.8rem', color: stat.color, fontWeight: '700' }}>{stat.sub}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>

                    {/* Source Entities */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Globe size={20} color="#6366f1" /> Institutional Partners
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {companies.map(([name, stats], i) => (
                                <div key={name} style={{
                                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.3s'
                                }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(10px)'; e.currentTarget.style.borderColor = '#334155'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = '#1e293b'; }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem' }}>{name}</div>
                                            <div style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '700' }}>{stats.count} Dispersions Received</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#34d399', fontSize: '1.3rem', fontWeight: '900' }}>₹{stats.total.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: '800', textTransform: 'uppercase' }}>Total Influx</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Audit Timeline */}
                    <div style={{ background: '#0f172a', borderRadius: '32px', border: '1px solid #1e293b', padding: '32px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Clock size={20} color="#10b981" /> Audited Influx Log
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {salaryItems.slice(0, 10).map((item, idx) => (
                                <div key={item.id} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                                    <div style={{ width: '2px', background: 'rgba(52, 211, 153, 0.1)', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', position: 'absolute', top: '24px', zIndex: 1, border: '3px solid #0f172a' }} />
                                    </div>
                                    <div style={{ flex: 1, paddingBottom: idx === salaryItems.length - 1 ? '0' : '24px', paddingTop: '16px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#cbd5e1' }}>{item.description}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>{item.date}</div>
                                            </div>
                                            <div style={{ color: '#34d399', fontWeight: '950', fontSize: '1.1rem' }}>+₹{item.amount.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal - Log Influx */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#0f172a', padding: '40px', borderRadius: '32px', border: '1px solid #334155', width: '100%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '950', margin: 0 }}>Register Influx</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleLogIncome} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Employer / Source</label>
                                <input value={employer} onChange={e => setEmployer(e.target.value)} placeholder="e.g. Google Cloud" style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} autoFocus />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Influx Amount (₹)</label>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Influx Date</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                </div>
                            </div>
                            <button type="submit" style={{ marginTop: '12px', background: '#34d399', color: '#020617', padding: '18px', borderRadius: '18px', border: 'none', fontWeight: '950', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 10px 20px rgba(52, 211, 153, 0.2)' }}>Confirm Revenue Entry</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
