"use client";

import { useState, useEffect } from 'react';
import { useNotifications } from '../components/NotificationContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
    TrendingUp,
    Activity,
    Plus,
    X,
    Search,
    ArrowUpRight,
    Loader2,
    Calendar,
    Star,
    History,
    Zap,
    Briefcase,
    Edit3,
    Trash2,
    ArrowRight,
    Eye,
    PieChart as PieChartIcon
} from 'lucide-react';
import { useFinance } from '../components/FinanceContext';
import { MutualFund, MutualFundTransaction } from '@/lib/types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

export default function MutualFundsClient() {
    const {
        accounts,
        mutualFunds,
        mutualFundTransactions,
        addMutualFund,
        updateMutualFund,
        deleteMutualFund,
        addMutualFundTransaction,
        deleteMutualFundTransaction,
        settings,
        loading,
        refreshPortfolio,
        refreshLivePrices
    } = useFinance();
    const { showNotification, confirm: customConfirm } = useNotifications();

    const [activeTab, setActiveTab] = useState<'holdings' | 'history' | 'lifetime' | 'allocation'>('holdings');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'fund' | 'transaction'>('fund');
    const [editId, setEditId] = useState<number | null>(null);
    const [viewingCharges, setViewingCharges] = useState<MutualFund | null>(null);

    // Search & Data Fetching States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ schemeName: string; schemeCode: string }>>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fund Form States
    const [fundName, setFundName] = useState('');
    const [schemeCode, setSchemeCode] = useState('');
    const [category, setCategory] = useState('');
    const [units, setUnits] = useState('');
    const [avgNav, setAvgNav] = useState('');
    const [currentNav, setCurrentNav] = useState('');
    const [previousNav, setPreviousNav] = useState<number | null>(null);
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
    const totalDayPnL = mutualFunds.reduce((sum, mf) => {
        const dayChange = (mf.currentNav - (mf.previousNav || mf.currentNav)) * mf.units;
        return sum + dayChange;
    }, 0);

    // Lifetime Metrics Calculation
    const totalBuys = mutualFundTransactions.filter((t: MutualFundTransaction) => t.transactionType === 'BUY' || t.transactionType === 'SIP').reduce((sum: number, t: MutualFundTransaction) => sum + t.totalAmount, 0);
    const totalSells = mutualFundTransactions.filter((t: MutualFundTransaction) => t.transactionType === 'SELL').reduce((sum: number, t: MutualFundTransaction) => sum + t.totalAmount, 0);

    // Lifetime Earned = (Total Sells + Current Value) - Total Buys
    const lifetimeEarned = (totalSells + totalCurrentValue) - totalBuys;
    const lifetimeReturnPercentage = totalBuys > 0 ? (lifetimeEarned / totalBuys) * 100 : 0;

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        await refreshLivePrices();
        setIsRefreshing(false);
        showNotification('success', 'Mutual fund NAVs refreshed');
    };

    // Category allocation
    const categoryData = mutualFunds.reduce((acc, mf) => {
        const cat = mf.category || 'Others';
        const existing = acc.find(item => item.name === cat);
        if (existing) existing.value += mf.currentValue;
        else acc.push({ name: cat, value: mf.currentValue });
        return acc;
    }, [] as Array<{ name: string; value: number }>);

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

    const selectFund = async (fund: { schemeName: string; schemeCode: string }) => {
        setFundName(fund.schemeName);
        setSchemeCode(fund.schemeCode);
        setShowResults(false);
        setSearchQuery(fund.schemeName);

        try {
            const res = await fetch(`/api/mf/quote?code=${fund.schemeCode}`);
            const data = await res.json();
            if (data.currentNav) {
                setCurrentNav(data.currentNav.toString());
                setPreviousNav(data.previousNav || data.currentNav);
                setCategory(data.category);
            }
        } catch (error) {
            console.error('MF Quote fetch failed:', error);
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
            schemeName: fundName,
            schemeCode,
            category: category || 'Mutual Fund',
            units: unitsVal,
            avgNav: avgNavVal,
            currentNav: curNavVal,
            previousNav: previousNav || curNavVal,
            investmentAmount: investment,
            currentValue,
            pnl: currentValue - investment,
            pnlPercentage: investment > 0 ? ((currentValue - investment) / investment) * 100 : 0,
            isin,
            folioNumber
        };

        if (editId) {
            await updateMutualFund(editId, fundData);
            showNotification('success', 'Fund details updated');
        } else {
            await addMutualFund(fundData);
            showNotification('success', 'New fund added to portfolio');
        }
        setIsModalOpen(false);
        resetFundForm();
    };

    const handleEditFund = (mf: MutualFund) => {
        setModalType('fund');
        setEditId(mf.id);
        setFundName(mf.schemeName || '');
        setSchemeCode(mf.schemeCode || '');
        setCategory(mf.category || '');
        setUnits(mf.units.toString());
        setAvgNav(mf.avgNav.toString());
        setCurrentNav(mf.currentNav.toString());
        setPreviousNav(mf.previousNav || mf.currentNav);
        setIsin(mf.isin || '');
        setFolioNumber(mf.folioNumber || '');
        setIsModalOpen(true);
    };

    const handleExitFund = (mf: MutualFund) => {
        setModalType('transaction');
        setSelectedFundId(mf.id);
        setTransactionType('SELL');
        setTxUnits(mf.units.toString());
        setTxNav(mf.currentNav.toString());
        setIsModalOpen(true);
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

        showNotification('success', `Investment of ₹${total.toLocaleString()} recorded`);

        setIsModalOpen(false);
        resetTransactionForm();
    };

    const resetTransactionForm = () => {
        setSelectedFundId('');
        setTransactionType('BUY');
        setTxUnits('');
        setTxNav('');
        setTxDate(new Date().toISOString().split('T')[0]);
        setSelectedAccountId(settings.defaultMfAccountId || '');
    };

    const resetFundForm = () => {
        setEditId(null);
        setFundName('');
        setSchemeCode('');
        setCategory('');
        setUnits('');
        setAvgNav('');
        setCurrentNav('');
        setPreviousNav(null);
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
        <div className="page-container">

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>Mutual Funds</h1>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button
                        onClick={handleManualRefresh}
                        disabled={isRefreshing}
                        style={{
                            padding: '12px',
                            borderRadius: '14px',
                            background: '#0f172a',
                            color: isRefreshing ? '#64748b' : '#818cf8',
                            border: '1px solid #1e293b',
                            cursor: isRefreshing ? 'wait' : 'pointer',
                            transition: '0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Refresh NAVs"
                    >
                        <Zap size={20} className={isRefreshing ? 'spin-animation' : ''} fill={isRefreshing ? 'none' : 'currentColor'} />
                    </button>
                    <button onClick={() => { setModalType('fund'); setIsModalOpen(true); }} style={{
                        padding: '14px 28px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: 'white', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
                    }}>
                        <Plus size={18} strokeWidth={3} /> Invest Now
                    </button>
                </div>
            </div>

            {/* Performance Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeTab === 'lifetime' ? 4 : 3}, 1fr)`, gap: '24px', marginBottom: '32px' }}>
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
                {activeTab === 'lifetime' && (
                    <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', padding: '24px', borderRadius: '24px', boxShadow: '0 15px 30px rgba(99, 102, 241, 0.2)' }}>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>Lifetime Earned</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>₹{lifetimeEarned.toLocaleString()}</div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', background: '#0f172a', padding: '6px', borderRadius: '18px', border: '1px solid #1e293b', marginBottom: '32px', width: 'fit-content' }}>
                {[
                    { id: 'holdings', label: 'Holdings', icon: <Briefcase size={18} /> },
                    { id: 'allocation', label: 'Allocation', icon: <PieChartIcon size={18} /> },
                    { id: 'history', label: 'History', icon: <History size={18} /> },
                    { id: 'lifetime', label: 'Lifetime', icon: <Star size={18} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'holdings' | 'allocation' | 'history' | 'lifetime')}
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
            {
                activeTab === 'holdings' && (
                    <div className="fade-in">
                        <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e293b' }}>
                                        <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>Scheme Name</th>
                                        <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem', textAlign: 'right' }}>Units</th>
                                        <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem', textAlign: 'right' }}>Avg. NAV</th>
                                        <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem', textAlign: 'right' }}>Curr. NAV</th>
                                        <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem', textAlign: 'right' }}>Day&apos;s P&L</th>
                                        <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem', textAlign: 'right' }}>Amount</th>
                                        <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem', textAlign: 'right' }}>Returns</th>
                                        <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mutualFunds.length > 0 ? mutualFunds.map(mf => (
                                        <tr key={mf.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: '800', color: '#fff' }}>{mf.schemeName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{mf.category}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700', color: '#94a3b8' }}>{mf.units.toFixed(3)}</td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700', color: '#94a3b8' }}>₹{mf.avgNav.toFixed(2)}</td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700', color: '#fff' }}>₹{mf.currentNav.toFixed(2)}</td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <div style={{ fontWeight: '800', color: (mf.currentNav - (mf.previousNav || mf.currentNav)) >= 0 ? '#10b981' : '#f87171' }}>
                                                    {(mf.currentNav - (mf.previousNav || mf.currentNav)) >= 0 ? '+' : ''}₹{((mf.currentNav - (mf.previousNav || mf.currentNav)) * mf.units).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                    <div style={{ fontSize: '0.65rem', fontWeight: '600', opacity: 0.8 }}>
                                                        ({mf.previousNav ? (((mf.currentNav - mf.previousNav) / mf.previousNav) * 100).toFixed(2) : '0.00'}%)
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700', color: '#fff' }}>₹{mf.currentValue.toLocaleString()}</td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <div style={{ fontWeight: '800', color: mf.pnl >= 0 ? '#10b981' : '#f87171' }}>
                                                    {mf.pnl >= 0 ? '+' : ''}₹{mf.pnl.toLocaleString()}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: mf.pnl >= 0 ? '#10b981' : '#f87171', fontWeight: '700' }}>
                                                    {mf.pnlPercentage.toFixed(2)}%
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button onClick={(e) => { e.stopPropagation(); setViewingCharges(mf); }} title="Estimated Sell Charges" style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '4px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                                        <Eye size={16} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleExitFund(mf); }} title="Exit / Sell" style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                                        <ArrowRight size={16} strokeWidth={3} />
                                                    </button>
                                                    <button onClick={() => handleEditFund(mf)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }} title="Edit">
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button onClick={async () => {
                                                        const isConfirmed = await customConfirm({ title: 'Delete Fund', message: `Remove ${mf.schemeName}?`, type: 'error', confirmLabel: 'Remove' });
                                                        if (isConfirmed) await deleteMutualFund(mf.id);
                                                    }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }} title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                                                <div style={{ marginBottom: '12px' }}><Briefcase size={40} opacity={0.3} /></div>
                                                <div style={{ fontWeight: '700' }}>No mutual fund investments found.</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {mutualFunds.length > 0 && (
                                    <tfoot style={{ background: 'rgba(255,255,255,0.03)', borderTop: '2px solid #1e293b' }}>
                                        <tr>
                                            <td style={{ padding: '20px 24px', fontWeight: '800', color: '#64748b' }}>TOTAL</td>
                                            <td colSpan={3}></td>
                                            <td style={{ padding: '20px 24px', textAlign: 'right', fontWeight: '900', color: totalDayPnL >= 0 ? '#10b981' : '#f87171', fontSize: '1rem' }}>
                                                {totalDayPnL >= 0 ? '+' : ''}₹{totalDayPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ padding: '20px 24px', textAlign: 'right', fontWeight: '900', color: '#fff', fontSize: '1rem' }}>₹{totalCurrentValue.toLocaleString()}</td>
                                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                <div style={{ fontWeight: '900', color: totalPnL >= 0 ? '#10b981' : '#f87171', fontSize: '1rem' }}>
                                                    {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: totalPnL >= 0 ? '#10b981' : '#f87171', fontWeight: '700' }}>
                                                    {totalInvestment > 0 ? ((totalCurrentValue - totalInvestment) / totalInvestment * 100).toFixed(2) : '0.00'}%
                                                </div>
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'allocation' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div style={{ background: '#0f172a', padding: '48px', borderRadius: '40px', border: '1px solid #1e293b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                    <PieChartIcon size={24} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>Category Allocation</h3>
                            </div>
                            <div style={{ height: '400px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={100}
                                            outerRadius={140}
                                            paddingAngle={8}
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
                                                const radius = outerRadius + 30;
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                const percent = (value / totalCurrentValue) * 100;

                                                // Only show if > 2% to avoid overlap
                                                if (percent < 2) return null;

                                                return (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        fill="#d8e2ec"
                                                        textAnchor={x > cx ? 'start' : 'end'}
                                                        dominantBaseline="central"
                                                        style={{ fontSize: '0.75rem', fontWeight: '800', fontFamily: 'Inter' }}
                                                    >
                                                        {categoryData[index].name}: {percent.toFixed(0)}%
                                                    </text>
                                                );
                                            }}
                                        >
                                            {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: '20px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', padding: '16px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {categoryData.map((cat, idx) => (
                                    <div key={idx} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff' }}>{cat.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>₹{cat.value.toLocaleString()} ({((cat.value / totalCurrentValue) * 100).toFixed(1)}%)</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ background: '#0f172a', padding: '40px', borderRadius: '40px', border: '1px solid #1e293b' }}>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '24px' }}>Scheme Weightage</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                    {mutualFunds.sort((a, b) => b.currentValue - a.currentValue).slice(0, 5).map(mf => (
                                        <div key={mf.id}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>{mf.schemeName}</span>
                                                <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#818cf8' }}>{((mf.currentValue / totalCurrentValue) * 100).toFixed(1)}%</span>
                                            </div>
                                            <div style={{ width: '100%', height: '10px', background: '#020617', borderRadius: '100px', overflow: 'hidden', border: '1px solid #1e293b' }}>
                                                <div style={{ width: `${(mf.currentValue / totalCurrentValue) * 100}%`, height: '100%', background: 'linear-gradient(to right, #6366f1, #a855f7)', borderRadius: '100px' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)', padding: '32px', borderRadius: '40px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <TrendingUp size={20} color="#10b981" />
                                    <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>Portfolio Health</span>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', marginBottom: '8px' }}>Optimized Allocation</div>
                                <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>Your top three funds command {((mutualFunds.sort((a, b) => b.currentValue - a.currentValue).slice(0, 3).reduce((s, tx) => s + tx.currentValue, 0) / totalCurrentValue) * 100).toFixed(0)}% of your capital, maintaining strong structural balance.</p>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'history' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Investment History</h3>
                        {mutualFundTransactions.map((t: MutualFundTransaction) => {
                            const fund = mutualFunds.find(f => f.id === t.mutualFundId);
                            return (
                                <div key={t.id} style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ background: t.transactionType === 'SELL' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: t.transactionType === 'SELL' ? '#f87171' : '#10b981', padding: '12px', borderRadius: '14px' }}>
                                            {t.transactionType === 'SELL' ? <ArrowUpRight size={20} /> : <TrendingUp size={20} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800' }}>{fund?.schemeName} • {t.transactionType}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.units.toFixed(3)} units @ ₹{t.nav.toFixed(4)}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={12} /> {new Date(t.transactionDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: t.transactionType === 'SELL' ? '#34d399' : '#fff' }}>
                                                ₹{t.totalAmount.toLocaleString()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                const isConfirmed = await customConfirm({
                                                    title: 'Delete Transaction',
                                                    message: 'Are you sure you want to delete this historical transaction?',
                                                    type: 'warning',
                                                    confirmLabel: 'Delete'
                                                });
                                                if (isConfirmed) {
                                                    await deleteMutualFundTransaction(t.id);
                                                    showNotification('success', 'Transaction deleted');
                                                }
                                            }}
                                            style={{ background: 'rgba(244, 63, 94, 0.1)', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            aria-label="Delete transaction"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            }

            {
                activeTab === 'lifetime' && (
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
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.13)" />
                                        <XAxis dataKey="schemeName" hide />
                                        <YAxis hide />
                                        <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#020617', border: '1px solid #1e293b' }} itemStyle={{ color: '#e8eef4' }} />
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
                )
            }


            {
                isModalOpen && (
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
                                                {searchResults.map((fund: { schemeName: string; schemeCode: string }) => (
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
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Current NAV</label>
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
                                            {mutualFunds.map(mf => <option key={mf.id} value={mf.id}>{mf.schemeName}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Type</label>
                                            <select value={transactionType} onChange={e => setTransactionType(e.target.value as 'BUY' | 'SELL' | 'SIP')} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }}>
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
                )
            }
            {viewingCharges && (() => {
                return (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
                        <div style={{ background: '#0f172a', padding: '32px', borderRadius: '24px', border: '1px solid #334155', width: '100%', maxWidth: '400px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                                        <Eye size={20} />
                                    </div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0 }}>MF Charge Estimator</h2>
                                </div>
                                <button onClick={() => setViewingCharges(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px', fontWeight: '700' }}>{viewingCharges.category}</div>
                                <div style={{ fontSize: '1rem', fontWeight: '900', color: '#fff' }}>{viewingCharges.schemeName}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Entry/Exit Load</span>
                                        <span style={{ color: '#475569', fontSize: '0.7rem' }}>Varies (Fixed ₹0 for Direct)</span>
                                    </div>
                                    <span style={{ color: '#fff', fontWeight: '700' }}>₹0.00</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Stamp Duty</span>
                                        <span style={{ color: '#475569', fontSize: '0.7rem' }}>0.005% (Applicable on Buy Only)</span>
                                    </div>
                                    <span style={{ color: '#475569', fontWeight: '700' }}>N/A (Selling)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Expense Ratio</span>
                                        <span style={{ color: '#475569', fontSize: '0.7rem' }}>Already adjusted in NAV</span>
                                    </div>
                                    <span style={{ color: '#10b981', fontWeight: '700' }}>Included</span>
                                </div>
                                <div style={{ height: '1px', background: '#1e293b', margin: '8px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#fff', fontWeight: '800' }}>Estimated Total Charges</span>
                                    <span style={{ color: '#f59e0b', fontSize: '1.25rem', fontWeight: '950' }}>₹0.00</span>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '20px', fontStyle: 'italic', lineHeight: '1.4' }}>
                                * For Direct Mutual Funds, there are typically no transaction charges. Stamp duty is only levied on purchase. Exit loads may apply if redeemed within the lock-in period.
                            </p>

                            <button onClick={() => setViewingCharges(null)} style={{ width: '100%', background: '#f59e0b', color: '#000', padding: '14px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer', marginTop: '24px' }}>
                                Close
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
