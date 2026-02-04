"use client";

import { useState } from 'react';
import { useFinance } from '../components/SupabaseFinanceContext';
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
    const { transactions, addTransaction, loading } = useFinance();
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

    const handleLogIncome = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !employer) return;

        await addTransaction({
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

    if (loading) {
        return (
            <div className="main-content" style={{ padding: '40px 60px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading your salary data...</div>
                </div>
            </div>
        );
    }

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
                        { label: `${activeTab} Revenue`, value: `₹${totalIncome.toLocaleString()}`, icon: <TrendingUp size={22} />, color: '#6366f1', sub: '+12% from last period', gradient: 'linear-gradient(135deg, #6366f120 0%, #4f46e510 100%)' },
                        { label: 'Avg Monthly Yield', value: `₹${(totalIncome / (activeTab === 'Yearly' ? new Date().getMonth() + 1 : salaryItems.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: <Calendar size={22} />, color: '#34d399', sub: 'Projected steady', gradient: 'linear-gradient(135deg, #34d39920 0%, #10b98110 100%)' },
                        { label: 'Capital Sources', value: companies.length, icon: <Briefcase size={22} />, color: '#f59e0b', sub: 'Diversification optimal', gradient: 'linear-gradient(135deg, #f59e0b20 0%, #d9770610 100%)' }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: `linear-gradient(145deg, #0f172a 0%, #1e293b 100%)`, 
                            padding: '32px', 
                            borderRadius: '28px', 
                            border: '1px solid #1e293b', 
                            position: 'relative', 
                            overflow: 'hidden',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer'
                        }} 
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                            e.currentTarget.style.borderColor = stat.color + '40';
                            e.currentTarget.style.boxShadow = `0 20px 60px -15px ${stat.color}30, 0 0 0 1px ${stat.color}20`;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.borderColor = '#1e293b';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            {/* Enhanced gradient background */}
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', background: stat.gradient, opacity: 0.6 }} />
                            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', background: `${stat.color}15`, borderRadius: '50%', filter: 'blur(40px)' }} />
                            
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ 
                                        background: `${stat.color}15`, 
                                        padding: '10px', 
                                        borderRadius: '14px', 
                                        color: stat.color,
                                        border: `1px solid ${stat.color}20`,
                                        boxShadow: `0 4px 12px ${stat.color}10`
                                    }}>
                                        {stat.icon}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>{stat.label}</span>
                                </div>
                                <div style={{ fontSize: '2.2rem', fontWeight: '950', color: '#fff', marginBottom: '8px', letterSpacing: '-1px' }}>{stat.value}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ fontSize: '0.8rem', color: stat.color, fontWeight: '700' }}>{stat.sub}</div>
                                </div>
                            </div>
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
                                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                                    padding: '24px', 
                                    borderRadius: '24px', 
                                    border: '1px solid #1e293b', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }} 
                                onMouseEnter={e => { 
                                    e.currentTarget.style.transform = 'translateX(12px) scale(1.02)'; 
                                    e.currentTarget.style.borderColor = '#6366f140'; 
                                    e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(99, 102, 241, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1)';
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
                                }} 
                                onMouseLeave={e => { 
                                    e.currentTarget.style.transform = 'translateX(0) scale(1)'; 
                                    e.currentTarget.style.borderColor = '#1e293b'; 
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
                                }}>
                                    {/* Animated gradient accent */}
                                    <div style={{ 
                                        position: 'absolute', 
                                        left: 0, 
                                        top: 0, 
                                        bottom: 0, 
                                        width: '4px', 
                                        background: 'linear-gradient(180deg, #6366f1 0%, #34d399 100%)',
                                        borderRadius: '24px 0 0 24px'
                                    }} />
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
                                        <div style={{ 
                                            width: '56px', 
                                            height: '56px', 
                                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)', 
                                            borderRadius: '16px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            color: '#818cf8', 
                                            border: '1px solid rgba(99, 102, 241, 0.2)',
                                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)'
                                        }}>
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem', marginBottom: '4px' }}>{name}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)' }} />
                                                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700' }}>{stats.count} Dispersions Received</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
                                        <div style={{ 
                                            color: '#34d399', 
                                            fontSize: '1.4rem', 
                                            fontWeight: '900',
                                            textShadow: '0 2px 8px rgba(52, 211, 153, 0.3)'
                                        }}>₹{stats.total.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: '800', textTransform: 'uppercase' }}>Total Influx</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Audit Timeline */}
                    <div style={{ 
                        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', 
                        borderRadius: '32px', 
                        border: '1px solid #1e293b', 
                        padding: '32px',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
                    }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                                padding: '8px', 
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}>
                                <Clock size={20} color="#fff" />
                            </div>
                            <span>Audited Influx Log</span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {salaryItems.slice(0, 10).map((item, idx) => (
                                <div key={item.id} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                                    <div style={{ width: '2px', background: 'linear-gradient(180deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.05) 100%)', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                        <div style={{ 
                                            width: '12px', 
                                            height: '12px', 
                                            borderRadius: '50%', 
                                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', 
                                            position: 'absolute', 
                                            top: '24px', 
                                            zIndex: 1, 
                                            border: '3px solid #0f172a',
                                            boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2), 0 4px 8px rgba(16, 185, 129, 0.3)',
                                            animation: idx === 0 ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                                        }} />
                                    </div>
                                    <div style={{ flex: 1, paddingBottom: idx === salaryItems.length - 1 ? '0' : '24px', paddingTop: '16px' }}>
                                        <div style={{ 
                                            background: 'rgba(255,255,255,0.02)', 
                                            padding: '16px 20px', 
                                            borderRadius: '16px', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            border: '1px solid rgba(52, 211, 153, 0.1)',
                                            transition: 'all 0.3s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'rgba(52, 211, 153, 0.05)';
                                            e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.3)';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                            e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.1)';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#e2e8f0' }}>{item.description}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>{item.date}</div>
                                            </div>
                                            <div style={{ 
                                                color: '#34d399', 
                                                fontWeight: '950', 
                                                fontSize: '1.1rem',
                                                textShadow: '0 2px 8px rgba(52, 211, 153, 0.3)'
                                            }}>+₹{item.amount.toLocaleString()}</div>
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
