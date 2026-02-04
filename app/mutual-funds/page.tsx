"use client";

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
    LayoutDashboard,
    Wallet,
    TrendingUp,
    TrendingDown,
    Activity,
    Plus,
    X,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Calendar,
    Star,
    History,
    Zap,
    Briefcase
} from 'lucide-react';
import { useFinance, MutualFund, MutualFundTransaction } from '../components/SupabaseFinanceContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

export default function MutualFundsPage() {
    const {
        accounts,
        mutualFunds,
        mutualFundTransactions,
        addMutualFund,
        updateMutualFund,
        addMutualFundTransaction,
        loading
    } = useFinance();

    const [activeTab, setActiveTab] = useState<'holdings' | 'history' | 'lifetime'>('holdings');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'fund' | 'transaction'>('fund');
    const [editId, setEditId] = useState<number | null>(null);

    // Search & Data Fetching States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isFetchingQuote, setIsFetchingQuote] = useState(false);

    // Fund Form States
    const [fundName, setFundName] = useState('');
    const [schemeCode, setSchemeCode] = useState('');
    const [category, setCategory] = useState('');
    const [units, setUnits] = useState('');
    const [avgNav, setAvgNav] = useState('');
    const [currentNav, setCurrentNav] = useState('');
    const [isin, setIsin] = useState('');
    const [folioNumber, setFolioNumber] = useState('');

    // Transaction Form States
    const [selectedFundId, setSelectedFundId] = useState<number | ''>('');
    const [transactionType, setTransactionType] = useState<'BUY' | 'SELL' | 'SIP'>('BUY');
    const [txUnits, setTxUnits] = useState('');
    const [txNav, setTxNav] = useState('');
    const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');

    // Portfolio Metrics
    const totalInvestment = mutualFunds.reduce((sum, mf) => sum + mf.investmentAmount, 0);
    const totalCurrentValue = mutualFunds.reduce((sum, mf) => sum + mf.currentValue, 0);
    const totalPnL = totalCurrentValue - totalInvestment;

    // Lifetime Metrics Calculation
    const totalBuys = mutualFundTransactions.filter((t: any) => t.transactionType === 'BUY' || t.transactionType === 'SIP').reduce((sum: number, t: any) => sum + t.totalAmount, 0);
    const totalSells = mutualFundTransactions.filter((t: any) => t.transactionType === 'SELL').reduce((sum: number, t: any) => sum + t.totalAmount, 0);

    // Lifetime Earned = (Total Sells + Current Value) - Total Buys
    const lifetimeEarned = (totalSells + totalCurrentValue) - totalBuys;
    const lifetimeReturnPercentage = totalBuys > 0 ? (lifetimeEarned / totalBuys) * 100 : 0;

    // Category allocation
    const categoryData = mutualFunds.reduce((acc, mf) => {
        const cat = mf.category || 'Others';
        const existing = acc.find(item => item.name === cat);
        if (existing) existing.value += mf.currentValue;
        else acc.push({ name: cat, value: mf.currentValue });
        return acc;
    }, [] as any[]);

    // Debounced Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 3) {
                handleMFSearh(searchQuery);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleMFSearh = async (query: string) => {
        setIsSearching(true);
        try {
            const res = await fetch(`/api/mf/search?q=${query}`);
            const data = await res.json();
            setSearchResults(data);
            setShowResults(true);
        } catch (error) {
            console.error('MF Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectFund = async (fund: any) => {
        setFundName(fund.schemeName);
        setSchemeCode(fund.schemeCode);
        setShowResults(false);
        setSearchQuery(fund.schemeName);

        setIsFetchingQuote(true);
        try {
            const res = await fetch(`/api/mf/quote?code=${fund.schemeCode}`);
            const data = await res.json();
            if (data.currentNav) {
                setCurrentNav(data.currentNav.toString());
                setCategory(data.category);
            }
        } catch (error) {
            console.error('MF Quote fetch failed:', error);
        } finally {
            setIsFetchingQuote(false);
        }
    };

    const handleFundSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const unitsVal = parseFloat(units);
        const avgNavVal = parseFloat(avgNav);
        const curNavVal = parseFloat(currentNav);
        const investment = unitsVal * avgNavVal;
        const currentValue = unitsVal * curNavVal;

        const fundData = {
            name: fundName,
            schemeCode,
            category: category || 'Mutual Fund',
            units: unitsVal,
            avgNav: avgNavVal,
            currentNav: curNavVal,
            investmentAmount: investment,
            currentValue,
            pnl: currentValue - investment,
            pnlPercentage: investment > 0 ? ((currentValue - investment) / investment) * 100 : 0,
            isin,
            folioNumber
        };

        if (editId) {
            await updateMutualFund({ ...fundData, id: editId });
        } else {
            await addMutualFund(fundData);
        }
        setIsModalOpen(false);
        resetFundForm();
    };

    const handleTransactionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFundId || !txUnits || !txNav) return;

        const unitsVal = parseFloat(txUnits);
        const navVal = parseFloat(txNav);
        const total = unitsVal * navVal;

        await addMutualFundTransaction({
            mutualFundId: Number(selectedFundId),
            transactionType: transactionType,
            units: unitsVal,
            nav: navVal,
            totalAmount: total,
            transactionDate: txDate,
            accountId: selectedAccountId ? Number(selectedAccountId) : undefined
        });

        setIsModalOpen(false);
        resetTransactionForm();
    };

    const resetTransactionForm = () => {
        setSelectedFundId('');
        setTransactionType('BUY');
        setTxUnits('');
        setTxNav('');
        setTxDate(new Date().toISOString().split('T')[0]);
        setSelectedAccountId('');
    };

    const resetFundForm = () => {
        setEditId(null);
        setFundName('');
        setSchemeCode('');
        setCategory('');
        setUnits('');
        setAvgNav('');
        setCurrentNav('');
        setSearchQuery('');
    };

    if (loading) {
        return (
            <div className="main-content" style={{ padding: '40px 60px', backgroundColor: '#020617', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '1.2rem' }}>Syncing with markets...</div>
            </div>
        );
    }

    return (
        <div className="main-content" style={{ padding: '40px 60px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>Mutual Funds</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px' }}>Global oversight of your fund houses and lifetime returns</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={() => { setModalType('transaction'); setIsModalOpen(true); }} style={{
                            padding: '14px 28px', borderRadius: '16px', background: '#0f172a', color: '#fff', border: '1px solid #1e293b', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s'
                        }}>
                            <Activity size={18} color="#10b981" /> Add Transaction
                        </button>
                        <button onClick={() => { setModalType('fund'); setIsModalOpen(true); }} style={{
                            padding: '14px 28px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: 'white', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
                        }}>
                            <Plus size={18} strokeWidth={3} /> Invest Now
                        </button>
                    </div>
                </div>

                {/* Performance Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b' }}>
                        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>Total Invested</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>₹{totalInvestment.toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b' }}>
                        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>Current Value</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>₹{totalCurrentValue.toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b' }}>
                        <div style={{ color: totalPnL >= 0 ? '#34d399' : '#f87171', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>Total P&L</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: totalPnL >= 0 ? '#34d399' : '#f87171' }}>
                            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
                        </div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', padding: '24px', borderRadius: '24px', boxShadow: '0 15px 30px rgba(99, 102, 241, 0.2)' }}>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>Lifetime Earned</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>₹{lifetimeEarned.toLocaleString()}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', background: '#0f172a', padding: '6px', borderRadius: '18px', border: '1px solid #1e293b', marginBottom: '32px', width: 'fit-content' }}>
                    {[
                        { id: 'holdings', label: 'Holdings', icon: <Briefcase size={18} /> },
                        { id: 'history', label: 'History', icon: <History size={18} /> },
                        { id: 'lifetime', label: 'Lifetime', icon: <Star size={18} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '14px',
                                border: 'none',
                                background: activeTab === tab.id ? '#6366f1' : 'transparent',
                                color: activeTab === tab.id ? '#fff' : '#64748b',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: '0.2s'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'holdings' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {mutualFunds.map(mf => (
                                <div key={mf.id} style={{ background: '#0f172a', padding: '28px', borderRadius: '28px', border: '1px solid #1e293b', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>{mf.name}</div>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>{mf.category}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{mf.units.toFixed(3)} units @ ₹{mf.avgNav.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '900' }}>₹{mf.currentValue.toLocaleString()}</div>
                                            <div style={{ fontSize: '0.9rem', color: mf.pnl >= 0 ? '#34d399' : '#f87171', fontWeight: '800' }}>
                                                {mf.pnl >= 0 ? '+' : ''}₹{mf.pnl.toLocaleString()} ({mf.pnlPercentage.toFixed(2)}%)
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Current NAV: ₹{mf.currentNav.toFixed(4)}</span>
                                        <span>Folio: {mf.folioNumber || '••••'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: '#0f172a', padding: '32px', borderRadius: '32px', border: '1px solid #1e293b', height: 'fit-content' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '24px' }}>Portfolio Distribution</h3>
                            <div style={{ height: '240px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                            {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                {categoryData.map((cat, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Investment History</h3>
                        {mutualFundTransactions.map((t: any) => {
                            const fund = mutualFunds.find(f => f.id === t.mutualFundId);
                            return (
                                <div key={t.id} style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ background: t.transactionType === 'SELL' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: t.transactionType === 'SELL' ? '#f87171' : '#10b981', padding: '12px', borderRadius: '14px' }}>
                                            {t.transactionType === 'SELL' ? <ArrowUpRight size={20} /> : <TrendingUp size={20} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800' }}>{fund?.name} • {t.transactionType}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.units.toFixed(3)} units @ ₹{t.nav.toFixed(4)}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={12} /> {new Date(t.transactionDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: t.transactionType === 'SELL' ? '#34d399' : '#fff' }}>
                                        ₹{t.totalAmount.toLocaleString()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'lifetime' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                        <div style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '32px', border: '1px solid #1e293b', padding: '48px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                <Zap color="#f59e0b" fill="#f59e0b" size={24} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>Lifetime Earnings Engine</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '40px' }}>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>Cumulative Wealth Created</div>
                                    <div style={{ fontSize: '3rem', fontWeight: '950', color: '#10b981' }}>+₹{lifetimeEarned.toLocaleString()}</div>
                                    <div style={{ color: '#475569', fontSize: '0.9rem', marginTop: '12px' }}>The total value added to your net worth through mutual funds since inception.</div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>Lifetime Return Rate</div>
                                    <div style={{ fontSize: '3rem', fontWeight: '950' }}>{lifetimeReturnPercentage.toFixed(2)}%</div>
                                    <div style={{ color: '#475569', fontSize: '0.9rem', marginTop: '12px' }}>Absolute lifetime returns across your entire fund portfolio.</div>
                                </div>
                            </div>

                            <div style={{ height: '200px', width: '100%', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={mutualFunds.slice(0, 6)}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" hide />
                                        <YAxis hide />
                                        <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#020617', border: '1px solid #1e293b' }} />
                                        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                                            {mutualFunds.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div style={{ background: '#0f172a', padding: '32px', borderRadius: '32px', border: '1px solid #1e293b' }}>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '24px' }}>Stats Hub</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Inflow</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{totalBuys.toLocaleString()}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Redemptions</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{totalSells.toLocaleString()}</div>
                                </div>
                                <div style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(52, 211, 153, 0.1)' }}>
                                    <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Performance</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>Outperforming Market</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Modal - Fund (Keep Existing) */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#0f172a', padding: '32px', borderRadius: '32px', border: '1px solid #334155', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '44px', height: '44px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                    {modalType === 'fund' ? <TrendingUp size={24} /> : <Activity size={24} />}
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>
                                    {modalType === 'fund' ? 'Add New Holding' : 'Add MF Transaction'}
                                </h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        {modalType === 'fund' ? (
                            <form onSubmit={handleFundSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ position: 'relative' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Search Scheme</label>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Type name or code (e.g. Parag Parikh)" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '16px 16px 16px 48px', borderRadius: '16px', color: '#fff' }} onFocus={() => setShowResults(true)} />
                                        {isSearching && <Loader2 size={18} className="animate-spin" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />}
                                    </div>
                                    {showResults && searchResults.length > 0 && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', marginTop: '12px', zIndex: 1100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                            {searchResults.map((fund: any) => (
                                                <div key={fund.schemeCode} onClick={() => selectFund(fund)} style={{ padding: '16px', cursor: 'pointer', borderBottom: '1px solid #1e293b' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>{fund.schemeName}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Code: {fund.schemeCode}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Units Held</label>
                                        <input type="number" step="0.001" value={units} onChange={e => setUnits(e.target.value)} placeholder="0.000" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Avg NAV</label>
                                        <input type="number" step="0.0001" value={avgNav} onChange={e => setAvgNav(e.target.value)} placeholder="0.00" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Live NAV</label>
                                    <input type="number" step="0.0001" value={currentNav} onChange={e => setCurrentNav(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#34d399', fontWeight: '900' }} />
                                </div>

                                <button type="submit" style={{ marginTop: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#fff', padding: '18px', borderRadius: '18px', border: 'none', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }}>
                                    Add Portfolio Entry
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Select Fund</label>
                                    <select value={selectedFundId} onChange={e => setSelectedFundId(Number(e.target.value))} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }}>
                                        <option value="" disabled>Choose Scheme</option>
                                        {mutualFunds.map(mf => <option key={mf.id} value={mf.id}>{mf.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Type</label>
                                        <select value={transactionType} onChange={e => setTransactionType(e.target.value as any)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }}>
                                            <option value="BUY">BUY</option>
                                            <option value="SELL">SELL</option>
                                            <option value="SIP">SIP</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Units</label>
                                        <input type="number" step="0.001" value={txUnits} onChange={e => setTxUnits(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>NAV</label>
                                        <input type="number" step="0.0001" value={txNav} onChange={e => setTxNav(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Date</label>
                                        <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Operating Bank Account</label>
                                    <select value={selectedAccountId} onChange={e => setSelectedAccountId(Number(e.target.value))} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }}>
                                        <option value="">No Account (Ledger Only)</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name} - ₹{acc.balance.toLocaleString()}</option>
                                        ))}
                                    </select>
                                    <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '6px' }}>Money will be {transactionType === 'SELL' ? 'added to' : 'deducted from'} this account.</p>
                                </div>
                                <button type="submit" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', padding: '18px', borderRadius: '18px', border: 'none', fontWeight: '900', cursor: 'pointer' }}>
                                    Confirm Transaction
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
