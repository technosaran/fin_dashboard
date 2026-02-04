"use client";

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from 'recharts';
import { useFinance, Account } from '../components/FinanceContext';
import {
    Wallet,
    CreditCard,
    PiggyBank,
    TrendingUp,
    Coins,
    Building2,
    ArrowRightLeft,
    Plus,
    X,
    ShieldCheck,
    ChevronDown,
    MoreVertical,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    IndianRupee,
    DollarSign,
    PieChart as PieChartIcon
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

export default function AccountsPage() {
    const { accounts, addAccount, updateAccount, addFunds, loading } = useFinance();
    const [activeTab, setActiveTab] = useState<'accounts' | 'allocation'>('accounts');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // Form State
    const [accountName, setAccountName] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountType, setAccountType] = useState('Checking');
    const [balance, setBalance] = useState('');
    const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');

    // Add Funds State
    const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
    const [addFundsAmount, setAddFundsAmount] = useState('');
    const [addFundsDescription, setAddFundsDescription] = useState('');
    const [addFundsCategory, setAddFundsCategory] = useState('Income');

    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [sourceAccountId, setSourceAccountId] = useState<number | ''>('');
    const [targetAccountId, setTargetAccountId] = useState<number | ''>('');
    const [transferAmount, setTransferAmount] = useState('');

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountName || !balance || !bankName) return;

        if (editId !== null) {
            const existingAccount = accounts.find(acc => acc.id === editId);
            if (existingAccount) {
                await updateAccount({
                    ...existingAccount,
                    name: accountName,
                    bankName,
                    type: accountType,
                    balance: parseFloat(balance),
                    currency
                });
            }
        } else {
            await addAccount({
                name: accountName,
                bankName,
                type: accountType,
                balance: parseFloat(balance),
                currency,
            });
        }
        resetAccountForm();
        setIsModalOpen(false);
    };

    const resetAccountForm = () => {
        setEditId(null);
        setAccountName('');
        setBankName('');
        setAccountType('Checking');
        setBalance('');
        setCurrency('INR');
    };

    const handleEditClick = (account: Account) => {
        setEditId(account.id);
        setAccountName(account.name);
        setBankName(account.bankName);
        setAccountType(account.type);
        setBalance(account.balance.toString());
        setCurrency(account.currency);
        setIsModalOpen(true);
    };

    const handleAddFundsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedAccountId === null || !addFundsAmount) return;
        await addFunds(selectedAccountId, parseFloat(addFundsAmount), addFundsDescription, addFundsCategory);
        setIsAddFundsModalOpen(false);
        setAddFundsAmount('');
        setAddFundsDescription('');
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sourceAccountId || !targetAccountId || !transferAmount) return;
        const amount = parseFloat(transferAmount);
        const sourceAccount = accounts.find(acc => acc.id === Number(sourceAccountId));
        const targetAccount = accounts.find(acc => acc.id === Number(targetAccountId));
        if (sourceAccount && targetAccount) {
            await updateAccount({ ...sourceAccount, balance: sourceAccount.balance - amount });
            await updateAccount({ ...targetAccount, balance: targetAccount.balance + amount });
        }
        setIsTransferModalOpen(false);
    };

    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'Checking': return <Wallet size={20} />;
            case 'Savings': return <PiggyBank size={20} />;
            case 'Credit Card': return <CreditCard size={20} />;
            case 'Investment': return <TrendingUp size={20} />;
            case 'Cash': return <Coins size={20} />;
            default: return <Building2 size={20} />;
        }
    };

    const totalBalanceINR = accounts.filter(a => a.currency === 'INR').reduce((sum, acc) => sum + acc.balance, 0);

    if (loading) {
        return (
            <div className="main-content" style={{ padding: '40px 60px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading your accounts...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content" style={{ padding: '40px 60px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>Personal Vault</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px' }}>Securely manage your assets and financial entities</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={() => setIsTransferModalOpen(true)} style={{
                            padding: '14px 28px', borderRadius: '16px', background: '#0f172a', color: '#fff', border: '1px solid #1e293b', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.background = '#1e293b'} onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}>
                            <ArrowRightLeft size={18} color="#818cf8" /> Internal Transfer
                        </button>
                        <button onClick={() => { resetAccountForm(); setIsModalOpen(true); }} style={{
                            padding: '14px 28px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: 'white', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)', transition: '0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <Plus size={18} strokeWidth={3} /> New Entity
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', background: '#0f172a', padding: '6px', borderRadius: '16px', border: '1px solid #1e293b', marginBottom: '32px', width: 'fit-content' }}>
                    {[
                        { id: 'accounts', label: 'Accounts', icon: <Wallet size={18} /> },
                        { id: 'allocation', label: 'Allocation', icon: <PieChartIcon size={18} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'accounts' | 'allocation')}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                background: activeTab === tab.id ? '#6366f1' : 'transparent',
                                color: activeTab === tab.id ? '#fff' : '#64748b',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => {
                                if (activeTab !== tab.id) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.color = '#cbd5e1';
                                }
                            }}
                            onMouseLeave={e => {
                                if (activeTab !== tab.id) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#64748b';
                                }
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'accounts' && (
                    <>
                        {/* Main Content Layout - Single Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

                            {/* Summary Bar */}
                            <div style={{
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                padding: '32px',
                                borderRadius: '32px',
                                border: '1px solid #1e293b',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                            }}>
                                {/* Enhanced animated gradient background */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-50%',
                                    right: '-10%',
                                    width: '400px',
                                    height: '400px',
                                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                                    filter: 'blur(60px)',
                                    animation: 'float 6s ease-in-out infinite'
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-50%',
                                    left: '-10%',
                                    width: '350px',
                                    height: '350px',
                                    background: 'radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, transparent 70%)',
                                    filter: 'blur(60px)',
                                    animation: 'float 8s ease-in-out infinite reverse'
                                }} />

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        color: '#64748b',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1.5px',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 12px rgba(52, 211, 153, 0.6)' }} />
                                        Total Vault Liquidity
                                    </div>
                                    <div style={{
                                        fontSize: '2.8rem',
                                        fontWeight: '950',
                                        color: '#fff',
                                        letterSpacing: '-1.5px',
                                        textShadow: '0 4px 16px rgba(255, 255, 255, 0.1)'
                                    }}>₹{totalBalanceINR.toLocaleString()}</div>
                                    <div style={{
                                        marginTop: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: '700'
                                    }}>
                                        <div style={{
                                            background: 'rgba(52, 211, 153, 0.15)',
                                            color: '#34d399',
                                            padding: '4px 12px',
                                            borderRadius: '100px',
                                            border: '1px solid rgba(52, 211, 153, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <TrendingUp size={14} /> +5.2% this month
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Search & Filter Bar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                                    <Search size={18} color="#475569" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input placeholder="Search entities..." style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', padding: '14px 16px 14px 48px', borderRadius: '16px', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>{accounts.length} Active Entities</div>
                            </div>

                            {/* Accounts Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                                {accounts.map((account, idx) => (
                                    <div key={account.id} style={{
                                        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                                        borderRadius: '28px',
                                        border: '1px solid #1e293b',
                                        padding: '24px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer'
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                                            e.currentTarget.style.borderColor = COLORS[idx % COLORS.length] + '60';
                                            e.currentTarget.style.boxShadow = `0 25px 50px -12px ${COLORS[idx % COLORS.length]}30, 0 0 0 1px ${COLORS[idx % COLORS.length]}20`;
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                            e.currentTarget.style.borderColor = '#1e293b';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                        onClick={() => handleEditClick(account)}
                                    >
                                        {/* Enhanced card decoration with gradient overlay */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '200px',
                                            height: '200px',
                                            background: `radial-gradient(circle, ${COLORS[idx % COLORS.length]}15 0%, transparent 70%)`,
                                            filter: 'blur(40px)'
                                        }} />

                                        {/* Accent line */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '3px',
                                            background: `linear-gradient(90deg, ${COLORS[idx % COLORS.length]} 0%, transparent 100%)`,
                                            borderRadius: '28px 28px 0 0'
                                        }} />

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
                                            <div style={{
                                                background: `${COLORS[idx % COLORS.length]}15`,
                                                padding: '12px',
                                                borderRadius: '16px',
                                                color: COLORS[idx % COLORS.length],
                                                border: `1px solid ${COLORS[idx % COLORS.length]}30`,
                                                boxShadow: `0 4px 16px ${COLORS[idx % COLORS.length]}20`
                                            }}>
                                                {getAccountIcon(account.type)}
                                            </div>
                                            <div style={{
                                                padding: '6px 14px',
                                                borderRadius: '100px',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: '#94a3b8',
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                backdropFilter: 'blur(8px)'
                                            }}>
                                                {account.type}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '24px', position: 'relative', zIndex: 1 }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{account.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{account.bankName}</div>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-end',
                                            paddingTop: '24px',
                                            borderTop: '1px solid rgba(255,255,255,0.06)',
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                            <div>
                                                <div style={{
                                                    color: '#64748b',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '800',
                                                    textTransform: 'uppercase',
                                                    marginBottom: '6px',
                                                    letterSpacing: '1px'
                                                }}>Available Balance</div>
                                                <div style={{
                                                    fontSize: '1.9rem',
                                                    fontWeight: '900',
                                                    color: '#fff',
                                                    textShadow: '0 2px 8px rgba(255, 255, 255, 0.1)'
                                                }}>
                                                    {account.currency === 'INR' ? '₹' : '$'}{account.balance.toLocaleString()}
                                                </div>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); setSelectedAccountId(account.id); setIsAddFundsModalOpen(true); }} style={{
                                                background: `linear-gradient(135deg, ${COLORS[idx % COLORS.length]} 0%, ${COLORS[idx % COLORS.length]}dd 100%)`,
                                                color: '#fff',
                                                border: 'none',
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: `0 4px 12px ${COLORS[idx % COLORS.length]}40`
                                            }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.transform = 'scale(1.15)';
                                                    e.currentTarget.style.boxShadow = `0 8px 20px ${COLORS[idx % COLORS.length]}60`;
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = `0 4px 12px ${COLORS[idx % COLORS.length]}40`;
                                                }}>
                                                <Plus size={20} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'allocation' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>

                        {/* Portfolio Distribution Chart */}
                        <div style={{
                            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                            padding: '32px',
                            borderRadius: '32px',
                            border: '1px solid #1e293b',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
                        }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                fontWeight: '800',
                                marginBottom: '24px',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <PieChartIcon size={22} color="#6366f1" />
                                Portfolio Distribution
                            </h3>
                            <div style={{ height: '300px', position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '180px',
                                    height: '180px',
                                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                                    filter: 'blur(40px)',
                                    zIndex: 0
                                }} />
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={accounts}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={120}
                                            paddingAngle={3}
                                            dataKey="balance"
                                            animationBegin={0}
                                            animationDuration={1500}
                                        >
                                            {accounts.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                    stroke="none"
                                                    style={{
                                                        filter: `drop-shadow(0 0 12px ${COLORS[index % COLORS.length]}50)`,
                                                    }}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: '#020617',
                                                border: '1px solid #334155',
                                                borderRadius: '12px',
                                                padding: '16px',
                                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
                                            }}
                                            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Balance']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Account Balance Trends */}
                        <div style={{
                            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                            padding: '32px',
                            borderRadius: '32px',
                            border: '1px solid #1e293b',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
                        }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                fontWeight: '800',
                                marginBottom: '24px',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <TrendingUp size={22} color="#34d399" />
                                Balance Distribution
                            </h3>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={accounts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#64748b"
                                            fontSize={12}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: '#020617',
                                                border: '1px solid #334155',
                                                borderRadius: '12px',
                                                padding: '12px'
                                            }}
                                            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Balance']}
                                        />
                                        <Bar
                                            dataKey="balance"
                                            fill="#6366f1"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Account Type Distribution */}
                        <div style={{
                            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                            padding: '32px',
                            borderRadius: '32px',
                            border: '1px solid #1e293b',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
                        }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                fontWeight: '800',
                                marginBottom: '24px',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <Building2 size={22} color="#f59e0b" />
                                Account Types
                            </h3>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={accounts.reduce((acc, account) => {
                                                const existing = acc.find(item => item.type === account.type);
                                                if (existing) {
                                                    existing.value += account.balance;
                                                    existing.count += 1;
                                                } else {
                                                    acc.push({ type: account.type, value: account.balance, count: 1 });
                                                }
                                                return acc;
                                            }, [] as any[])}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            dataKey="value"
                                            nameKey="type"
                                            animationBegin={0}
                                            animationDuration={1200}
                                        >
                                            {accounts.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: '#020617',
                                                border: '1px solid #334155',
                                                borderRadius: '12px',
                                                padding: '12px'
                                            }}
                                            formatter={(value: any, name: any, props: any) => [
                                                `₹${Number(value).toLocaleString()}`,
                                                `${props.payload.type} (${props.payload.count} accounts)`
                                            ]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Currency Distribution */}
                        <div style={{
                            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                            padding: '32px',
                            borderRadius: '32px',
                            border: '1px solid #1e293b',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
                        }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                fontWeight: '800',
                                marginBottom: '24px',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <DollarSign size={22} color="#10b981" />
                                Currency Allocation
                            </h3>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={[
                                            {
                                                currency: 'INR',
                                                amount: accounts.filter(a => a.currency === 'INR').reduce((sum, acc) => sum + acc.balance, 0),
                                                percentage: (accounts.filter(a => a.currency === 'INR').reduce((sum, acc) => sum + acc.balance, 0) / totalBalanceINR) * 100
                                            },
                                            {
                                                currency: 'USD',
                                                amount: accounts.filter(a => a.currency === 'USD').reduce((sum, acc) => sum + acc.balance, 0),
                                                percentage: (accounts.filter(a => a.currency === 'USD').reduce((sum, acc) => sum + acc.balance, 0) / totalBalanceINR) * 100
                                            }
                                        ]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="currency" stroke="#64748b" />
                                        <YAxis
                                            stroke="#64748b"
                                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: '#020617',
                                                border: '1px solid #334155',
                                                borderRadius: '12px',
                                                padding: '12px'
                                            }}
                                            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#10b981"
                                            fill="url(#colorGradient)"
                                        />
                                        <defs>
                                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Modals - Standard Premium Design */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#0f172a', padding: '40px', borderRadius: '32px', border: '1px solid #334155', width: '100%', maxWidth: '500px', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0 }}>{editId ? 'Modify Entity' : 'New Entity'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddAccount} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Entity Name</label>
                                <input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="e.g. Primary Savings" style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} autoFocus />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Financial Institution</label>
                                <input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Currency</label>
                                    <select value={currency} onChange={e => setCurrency(e.target.value as 'INR' | 'USD')} style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}>
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Type</label>
                                    <select value={accountType} onChange={e => setAccountType(e.target.value)} style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}>
                                        <option value="Checking">Checking</option>
                                        <option value="Savings">Savings</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Investment">Investment</option>
                                        <option value="Cash">Cash</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Initial Liquidity</label>
                                <input value={balance} onChange={e => setBalance(e.target.value)} placeholder="0.00" style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <button type="submit" style={{ marginTop: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#fff', padding: '18px', borderRadius: '18px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }}>{editId ? 'Update Entity' : 'Establish Entity'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {isTransferModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#0f172a', padding: '40px', borderRadius: '32px', border: '1px solid #334155', width: '100%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0 }}>Transfer Liquidity</h2>
                            <button onClick={() => setIsTransferModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Source Account</label>
                                <select value={sourceAccountId} onChange={e => setSourceAccountId(Number(e.target.value))} style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}>
                                    <option value="" disabled>Select Source</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Destination</label>
                                <select value={targetAccountId} onChange={e => setTargetAccountId(Number(e.target.value))} style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}>
                                    <option value="" disabled>Select Destination</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Transfer Amount</label>
                                <input value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="0.00" style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <button type="submit" style={{ marginTop: '12px', background: '#fff', color: '#020617', padding: '18px', borderRadius: '18px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1rem' }}>Execute Transfer</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Funds Modal */}
            {isAddFundsModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#0f172a', padding: '40px', borderRadius: '32px', border: '1px solid #334155', width: '100%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0 }}>Add Liquidity</h2>
                            <button onClick={() => setIsAddFundsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddFundsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Amount</label>
                                <input value={addFundsAmount} onChange={e => setAddFundsAmount(e.target.value)} placeholder="0.00" style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} autoFocus />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Description</label>
                                <input value={addFundsDescription} onChange={e => setAddFundsDescription(e.target.value)} placeholder="e.g. Dividend Payment" style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Category</label>
                                <select value={addFundsCategory} onChange={e => setAddFundsCategory(e.target.value)} style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}>
                                    <option value="Income">Income</option>
                                    <option value="Salary">Salary</option>
                                    <option value="Dividend">Dividend</option>
                                    <option value="Refund">Refund</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <button type="submit" style={{ marginTop: '12px', background: '#34d399', color: '#020617', padding: '18px', borderRadius: '18px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1rem' }}>Confirm Liquidity</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
