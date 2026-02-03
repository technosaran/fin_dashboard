"use client";

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinance, Account } from '../components/FinanceContext';
import { Wallet, CreditCard, PiggyBank, TrendingUp, Coins, Building2, ArrowRightLeft, Plus, X, DollarSign } from 'lucide-react';

const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#a78bfa'];

export default function Accounts() {
    const { accounts, addAccount, updateAccount, addFunds } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [accountName, setAccountName] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountType, setAccountType] = useState('Checking');
    const [balance, setBalance] = useState('');
    const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

    const [editId, setEditId] = useState<number | null>(null);

    // Add Funds State
    const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
    const [addFundsAmount, setAddFundsAmount] = useState('');
    const [addFundsDescription, setAddFundsDescription] = useState('');
    const [addFundsCategory, setAddFundsCategory] = useState('Income');

    const handleAddAccount = (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountName || !balance || !bankName) return;

        if (editId !== null) {
            // Edit Mode
            const existingAccount = accounts.find(acc => acc.id === editId);
            if (existingAccount) {
                updateAccount({
                    ...existingAccount,
                    name: accountName,
                    bankName: bankName,
                    type: accountType,
                    balance: parseFloat(balance),
                    currency: currency
                });
            }
            setEditId(null);
        } else {
            // Add Mode
            addAccount({
                name: accountName,
                bankName: bankName,
                type: accountType,
                balance: parseFloat(balance),
                currency: currency,
            });
        }

        // Reset Form
        setAccountName('');
        setBankName('');
        setAccountType('Checking');
        setBalance('');
        setCurrency('USD');
        setIsModalOpen(false);
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

    const openAddModal = () => {
        setEditId(null);
        setAccountName('');
        setBankName('');
        setAccountType('Checking');
        setBalance('');
        setCurrency('USD');
        setIsModalOpen(true);
    };

    const openAddFundsModal = (e: React.MouseEvent, accountId: number) => {
        e.stopPropagation(); // Don't trigger edit
        setSelectedAccountId(accountId);
        setAddFundsAmount('');
        setAddFundsDescription('');
        setAddFundsCategory('Income');
        setIsAddFundsModalOpen(true);
    };

    const handleAddFundsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedAccountId === null || !addFundsAmount) return;

        addFunds(
            selectedAccountId,
            parseFloat(addFundsAmount),
            addFundsDescription,
            addFundsCategory
        );

        setIsAddFundsModalOpen(false);
        setAddFundsAmount('');
        setAddFundsDescription('');
    };

    // Transfer State
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [sourceAccountId, setSourceAccountId] = useState<number | ''>('');
    const [targetAccountId, setTargetAccountId] = useState<number | ''>('');
    const [transferAmount, setTransferAmount] = useState('');

    const handleTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sourceAccountId || !targetAccountId || !transferAmount) return;
        if (sourceAccountId === targetAccountId) return;

        const amount = parseFloat(transferAmount);
        if (isNaN(amount) || amount <= 0) return;

        const sourceAccount = accounts.find(acc => acc.id === Number(sourceAccountId));
        const targetAccount = accounts.find(acc => acc.id === Number(targetAccountId));

        if (sourceAccount && targetAccount) {
            updateAccount({ ...sourceAccount, balance: sourceAccount.balance - amount });
            updateAccount({ ...targetAccount, balance: targetAccount.balance + amount });
        }

        // Reset Transfer Form
        setSourceAccountId('');
        setTargetAccountId('');
        setTransferAmount('');
        setIsTransferModalOpen(false);
    };

    const getCurrencySymbol = (curr: 'USD' | 'INR') => curr === 'USD' ? '$' : '₹';

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

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return (
        <div className="main-content" style={{ padding: '30px 50px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Your Accounts</h1>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Manage your wallets and financial accounts</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setIsTransferModalOpen(true)}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '12px',
                                background: '#0f172a',
                                color: '#818cf8',
                                border: '1px solid #1e293b',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#0f172a'}
                        >
                            <ArrowRightLeft size={18} /> Transfer
                        </button>
                        <button
                            onClick={openAddModal}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 12px rgba(129, 140, 248, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <Plus size={18} strokeWidth={3} /> Add Account
                        </button>
                    </div>
                </div>

                {/* Total Balance Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #34d399 100%)',
                    padding: '32px',
                    borderRadius: '24px',
                    marginBottom: '32px',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '10px' }}>
                                <DollarSign size={20} color="white" />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Net Worth</span>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '900', color: 'white', letterSpacing: '-0.02em' }}>
                            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>
                            Across {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                    {/* Left Column: Account Cards */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>My Accounts</h3>
                            <div style={{ height: '1px', flex: 1, background: '#1e293b', marginLeft: '20px' }} />
                        </div>
                        {accounts.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {accounts.map(account => (
                                    <div key={account.id} style={{
                                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                        padding: '24px',
                                        borderRadius: '20px',
                                        border: '1px solid #1e293b',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                        onClick={() => handleEditClick(account)}
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
                                            width: '200px',
                                            height: '200px',
                                            background: 'radial-gradient(circle, rgba(129, 140, 248, 0.1) 0%, transparent 70%)',
                                            pointerEvents: 'none'
                                        }} />
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                                                    padding: '12px',
                                                    borderRadius: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    boxShadow: '0 4px 12px rgba(129, 140, 248, 0.3)'
                                                }}>
                                                    {getAccountIcon(account.type)}
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px', margin: 0 }}>{account.name}</h3>
                                                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>{account.bankName}</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
                                                    {getCurrencySymbol(account.currency)}{account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    background: 'rgba(129, 140, 248, 0.15)',
                                                    color: '#818cf8',
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    fontWeight: '600',
                                                    border: '1px solid rgba(129, 140, 248, 0.2)'
                                                }}>
                                                    {account.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>
                                                Click to edit details
                                            </div>
                                            <button
                                                onClick={(e) => openAddFundsModal(e, account.id)}
                                                style={{
                                                    background: 'rgba(52, 211, 153, 0.15)',
                                                    color: '#34d399',
                                                    border: '1px solid rgba(52, 211, 153, 0.3)',
                                                    padding: '6px 14px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(52, 211, 153, 0.25)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(52, 211, 153, 0.15)';
                                                }}
                                            >
                                                <Plus size={14} strokeWidth={3} /> Add Funds
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                padding: '60px 40px',
                                textAlign: 'center',
                                color: '#64748b',
                                border: '2px dashed #1e293b',
                                borderRadius: '20px',
                                background: '#0f172a'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }}>💰</div>
                                <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>No accounts yet</p>
                                <p style={{ fontSize: '0.9rem', margin: 0 }}>Click &quot;Add Account&quot; to get started</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Asset Allocation */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Asset Distribution</h3>
                        </div>
                        <div style={{
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                            borderRadius: '20px',
                            padding: '32px 24px',
                            border: '1px solid #1e293b',
                            minHeight: '450px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {accounts.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={accounts}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={110}
                                                fill="#8884d8"
                                                paddingAngle={3}
                                                dataKey="balance"
                                            >
                                                {accounts.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number, _name: string, props: { payload: Account }) => {
                                                    const currency = props.payload.currency || 'USD';
                                                    return `${getCurrencySymbol(currency)}${Number(value).toLocaleString()}`;
                                                }}
                                                contentStyle={{
                                                    backgroundColor: '#1e293b',
                                                    border: '1px solid #334155',
                                                    borderRadius: '12px',
                                                    color: '#fff',
                                                    padding: '12px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ width: '100%', marginTop: '24px' }}>
                                        {accounts.map((account, index) => (
                                            <div key={account.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '10px 12px',
                                                marginBottom: '8px',
                                                background: '#0f172a',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        borderRadius: '3px',
                                                        background: COLORS[index % COLORS.length]
                                                    }} />
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{account.name}</span>
                                                </div>
                                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                                                    {((account.balance / totalBalance) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '16px', opacity: 0.2 }}>📊</div>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Add accounts to view distribution</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Account Modal Overlay */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(8px)'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        padding: '32px',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '520px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                        border: '1px solid #334155'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>{editId ? 'Edit Account' : 'Add New Account'}</h2>
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

                        <form onSubmit={handleAddAccount} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Name</label>
                                <input
                                    type="text"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    placeholder="e.g. My Savings"
                                    autoFocus
                                    style={{
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #334155',
                                        background: '#020617',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#818cf8'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bank Name</label>
                                <input
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="e.g. Chase, Bank of America"
                                    style={{
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #334155',
                                        background: '#020617',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#818cf8'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Currency</label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value as 'USD' | 'INR')}
                                        style={{
                                            padding: '14px 12px',
                                            borderRadius: '12px',
                                            border: '1px solid #334155',
                                            background: '#020617',
                                            color: 'white',
                                            outline: 'none',
                                            fontSize: '0.95rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="INR">INR (₹)</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Type</label>
                                    <select
                                        value={accountType}
                                        onChange={(e) => setAccountType(e.target.value)}
                                        style={{
                                            padding: '14px 12px',
                                            borderRadius: '12px',
                                            border: '1px solid #334155',
                                            background: '#020617',
                                            color: 'white',
                                            outline: 'none',
                                            fontSize: '0.95rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="Checking">Checking</option>
                                        <option value="Savings">Savings</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Investment">Investment</option>
                                        <option value="Cash">Cash</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Balance</label>
                                <input
                                    type="number"
                                    value={balance}
                                    onChange={(e) => setBalance(e.target.value)}
                                    placeholder="0.00"
                                    style={{
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #334155',
                                        background: '#020617',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#818cf8'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        background: 'transparent',
                                        color: '#94a3b8',
                                        border: '1px solid #334155',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        fontSize: '0.95rem',
                                        boxShadow: '0 4px 12px rgba(129, 140, 248, 0.3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {editId ? 'Update Account' : 'Add Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Modal Overlay */}
            {isTransferModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(8px)'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        padding: '32px',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '520px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                        border: '1px solid #334155'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>Transfer Funds</h2>
                            <button
                                onClick={() => setIsTransferModalOpen(false)}
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

                        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>From Account</label>
                                <select
                                    value={sourceAccountId}
                                    onChange={(e) => setSourceAccountId(Number(e.target.value))}
                                    style={{
                                        padding: '14px 12px',
                                        borderRadius: '12px',
                                        border: '1px solid #334155',
                                        background: '#020617',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="" disabled>Select Source Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>To Account</label>
                                <select
                                    value={targetAccountId}
                                    onChange={(e) => setTargetAccountId(Number(e.target.value))}
                                    style={{
                                        padding: '14px 12px',
                                        borderRadius: '12px',
                                        border: '1px solid #334155',
                                        background: '#020617',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="" disabled>Select Target Account</option>
                                    {accounts
                                        .filter(acc => acc.id !== Number(sourceAccountId))
                                        .map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                                        ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</label>
                                <input
                                    type="number"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    style={{
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #334155',
                                        background: '#020617',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#818cf8'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsTransferModalOpen(false)}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        background: 'transparent',
                                        color: '#94a3b8',
                                        border: '1px solid #334155',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        fontSize: '0.95rem',
                                        boxShadow: '0 4px 12px rgba(129, 140, 248, 0.3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Add Funds Modal Overlay */}
            {isAddFundsModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1010, backdropFilter: 'blur(8px)'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        padding: '32px',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '440px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                        border: '1px solid #334155'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>Add Funds</h2>
                            <button
                                onClick={() => setIsAddFundsModalOpen(false)}
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
                        <form onSubmit={handleAddFundsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</label>
                                <input
                                    type="number"
                                    value={addFundsAmount}
                                    onChange={(e) => setAddFundsAmount(e.target.value)}
                                    placeholder="0.00"
                                    autoFocus
                                    style={{
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #334155',
                                        background: '#020617',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#34d399'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                                <input
                                    type="text"
                                    value={addFundsDescription}
                                    onChange={(e) => setAddFundsDescription(e.target.value)}
                                    placeholder="e.g. Dividend, Refund"
                                    style={{
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #334155',
                                        background: '#020617',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#34d399'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
                                <input
                                    type="text"
                                    value={addFundsCategory}
                                    onChange={(e) => setAddFundsCategory(e.target.value)}
                                    placeholder="e.g. Income, Gift"
                                    style={{
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #334155',
                                        background: '#020617',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#34d399'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsAddFundsModalOpen(false)}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        background: 'transparent',
                                        color: '#94a3b8',
                                        border: '1px solid #334155',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        fontSize: '0.95rem',
                                        boxShadow: '0 4px 12px rgba(52, 211, 153, 0.3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    Add Funds
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
