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
    ArrowRight,
    Heart,
    Star,
    Coffee
} from 'lucide-react';

export default function SalaryPage() {
    const { accounts, transactions, addTransaction, settings, loading } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'This Year' | 'All Time'>('This Year');
    const [selectedAccountId, setSelectedAccountId] = useState<number | ''>(settings.defaultSalaryAccountId || '');

    // Salary Data Filtering
    const salaryItems = transactions.filter(t => t.category === 'Salary');

    // Process Employers/Sources
    const employersMap = salaryItems.reduce((acc, item) => {
        const name = item.description || 'Unknown Employer';
        if (!acc[name]) acc[name] = { total: 0, count: 0 };
        acc[name].total += item.amount;
        acc[name].count += 1;
        return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const employers = Object.entries(employersMap).sort((a, b) => b[1].total - a[1].total);
    const totalIncome = salaryItems.reduce((sum, item) => sum + item.amount, 0);

    // Form State
    const [amount, setAmount] = useState('');
    const [employerName, setEmployerName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleLogPayday = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !employerName) return;

        await addTransaction({
            date,
            description: employerName,
            category: 'Salary',
            type: 'Income',
            amount: parseFloat(amount),
            accountId: selectedAccountId ? Number(selectedAccountId) : undefined
        });

        setAmount('');
        setEmployerName('');
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="main-content" style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94a3b8' }}>Getting your pay history ready...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content" style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '12px' }}>
                            <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }} aria-hidden="true" />
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Earnings Tracker Live</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Payday Hub</h1>
                        <p style={{ color: '#94a3b8', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', marginTop: '8px', fontWeight: '500' }}>Track your hard-earned money and where it comes from</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', background: '#0f172a', padding: '6px', borderRadius: '14px', border: '1px solid #1e293b' }}>
                            {['This Year', 'All Time'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab as any)} aria-pressed={activeTab === tab} style={{
                                    padding: '10px 20px', borderRadius: '10px', border: 'none', background: activeTab === tab ? 'linear-gradient(135deg, #334155 0%, #1e293b 100%)' : 'transparent', color: activeTab === tab ? '#fff' : '#64748b', fontWeight: '700', cursor: 'pointer', transition: '0.3s', fontSize: '0.85rem'
                                }}>{tab}</button>
                            ))}
                        </div>
                        <button onClick={() => setIsModalOpen(true)} aria-label="Add new payday" style={{
                            padding: '12px 28px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)', transition: '0.3s', whiteSpace: 'nowrap'
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <Plus size={18} strokeWidth={3} /> Add New Payday
                        </button>
                    </div>
                </div>

                {/* Key Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '32px', marginBottom: '48px' }}>
                    {[
                        { label: activeTab === 'This Year' ? 'Total Earnings (Year)' : 'Total Earnings (Forever)', value: `₹${totalIncome.toLocaleString()}`, icon: <TrendingUp size={22} />, color: '#6366f1', sub: 'Great job this year!', gradient: 'linear-gradient(135deg, #6366f120 0%, #4f46e510 100%)' },
                        { label: 'Average per Month', value: `₹${(totalIncome / (activeTab === 'This Year' ? new Date().getMonth() + 1 : Math.max(salaryItems.length, 1))).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: <Calendar size={22} />, color: '#10b981', sub: 'Calculated monthly', gradient: 'linear-gradient(135deg, #10b98120 0%, #05966910 100%)' },
                        { label: 'Places I Work', value: employers.length, icon: <Briefcase size={22} />, color: '#f59e0b', sub: 'Income sources', gradient: 'linear-gradient(135deg, #f59e0b20 0%, #d9770610 100%)' }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: `#0f172a`,
                            padding: '32px',
                            borderRadius: '28px',
                            border: '1px solid #1e293b',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', background: stat.gradient, opacity: 0.5 }} aria-hidden="true" />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{
                                        background: `${stat.color}15`,
                                        padding: '10px',
                                        borderRadius: '14px',
                                        color: stat.color,
                                    }} aria-hidden="true">
                                        {stat.icon}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8' }}>{stat.label}</span>
                                </div>
                                <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: '900', color: '#fff', marginBottom: '8px', letterSpacing: '-1px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.value}</div>
                                <div style={{ fontSize: '0.85rem', color: stat.color, fontWeight: '700' }}>{stat.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '40px' }}>

                    {/* Employers List */}
                    <div>
                        <h3 style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', fontWeight: '900', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff' }}>
                            <Globe size={20} color="#6366f1" aria-hidden="true" /> My Employers
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {employers.length > 0 ? employers.map(([name, stats]) => (
                                <div key={name} style={{
                                    background: '#0f172a',
                                    padding: '24px',
                                    borderRadius: '24px',
                                    border: '1px solid #1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: '0.3s ease',
                                    gap: '20px',
                                    flexWrap: 'wrap'
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#334155';
                                        e.currentTarget.style.transform = 'scale(1.01)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = '#1e293b';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            width: '52px',
                                            height: '52px',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#818cf8',
                                            border: '1px solid rgba(99, 102, 241, 0.2)',
                                            flexShrink: 0
                                        }} aria-hidden="true">
                                            <Award size={24} />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ color: '#fff', fontWeight: '800', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>{stats.count} Paychecks Received</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#10b981', fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)', fontWeight: '900', overflow: 'hidden', textOverflow: 'ellipsis' }}>₹{stats.total.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Total Earned</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#0f172a', borderRadius: '24px', border: '1px solid #1e293b', color: '#94a3b8' }}>
                                    <Coffee size={32} style={{ marginBottom: '16px' }} aria-hidden="true" />
                                    <p>No jobs added yet. Start by logging your first payday!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Pay History */}
                    <div>
                        <h3 style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', fontWeight: '900', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                padding: '8px',
                                borderRadius: '12px'
                            }} aria-hidden="true">
                                <Clock size={20} color="#fff" />
                            </div>
                            <span>Recent Pay History</span>
                        </h3>
                        <div style={{
                            background: '#0f172a',
                            borderRadius: '28px',
                            border: '1px solid #1e293b',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {salaryItems.length > 0 ? salaryItems.slice(0, 8).map((item) => (
                                <div key={item.id} style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    padding: '16px 20px',
                                    borderRadius: '18px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid rgba(255,255,255,0.03)',
                                    transition: '0.2s',
                                    gap: '16px',
                                    flexWrap: 'wrap'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                                        <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '10px', flexShrink: 0 }} aria-hidden="true">
                                            <Heart size={16} fill="currentColor" />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: '800', fontSize: '1rem', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>{new Date(item.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                        </div>
                                    </div>
                                    <div style={{ color: '#10b981', fontWeight: '950', fontSize: 'clamp(1rem, 2vw, 1.2rem)', overflow: 'hidden', textOverflow: 'ellipsis' }}>+₹{item.amount.toLocaleString()}</div>
                                </div>
                            )) : (
                                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No payment history found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Modal - Add Paycheck */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: '#0f172a', padding: 'clamp(24px, 5vw, 40px)', borderRadius: '32px', border: '1px solid #334155', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '12px' }}>
                            <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: '900', margin: 0, color: '#fff' }}>I Got Paid! 🥳</h2>
                            <button onClick={() => setIsModalOpen(false)} aria-label="Close modal" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleLogPayday} aria-label="Log payday form" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Who paid you? (Job Name)</label>
                                <input value={employerName} onChange={e => setEmployerName(e.target.value)} placeholder="e.g. Acme Corp or Freelance" required aria-label="Employer name" style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} autoFocus />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>How much? (₹)</label>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required aria-label="Payment amount" style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>When?</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} aria-label="Payment date" style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Which Bank Account? (Optional)</label>
                                <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value ? Number(e.target.value) : '')} aria-label="Select bank account" style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }}>
                                    <option value="">Just log it, don't add to bank</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} - ₹{acc.balance.toLocaleString()}</option>)}
                                </select>
                            </div>
                            <button type="submit" aria-label="Save payday" style={{ marginTop: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', padding: '18px', borderRadius: '18px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)' }}>Save This Payday</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
