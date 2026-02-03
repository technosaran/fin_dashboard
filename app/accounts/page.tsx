"use client";

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinance, Account } from '../components/FinanceContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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

    return (
        <div className="main-content">
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 className="greeting-text" style={{ marginBottom: 0 }}>Your Accounts</h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setIsTransferModalOpen(true)}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '8px',
                                background: '#1e293b',
                                color: '#3b82f6',
                                border: '1px solid #3b82f6',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                            }}
                        >
                            Transfer Funds
                        </button>
                        <button
                            onClick={openAddModal}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '8px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
                            }}
                        >
                            + Add Account
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    {/* Left Column: List */}
                    <div>
                        <h3 style={{ marginBottom: '15px', color: '#f8fafc' }}>My Wallets & Banks</h3>
                        {accounts.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {accounts.map(account => (
                                    <div key={account.id} style={{
                                        backgroundColor: '#1e293b',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                    }}
                                        onClick={() => handleEditClick(account)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '4px' }}>{account.name}</h3>
                                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{account.bankName}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                                                    {getCurrencySymbol(account.currency)}{account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    color: '#60a5fa',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    display: 'inline-block',
                                                    marginTop: '4px'
                                                }}>
                                                    {account.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                Click to Edit
                                            </div>
                                            <button
                                                onClick={(e) => openAddFundsModal(e, account.id)}
                                                style={{
                                                    background: 'rgba(34, 197, 94, 0.1)',
                                                    color: '#4ade80',
                                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                                    padding: '4px 12px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                + Add Funds
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #334155', borderRadius: '12px' }}>
                                <p>No accounts added yet. Click the button above to get started.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Allocation Chart */}
                    <div>
                        <h3 style={{ marginBottom: '15px', color: '#f8fafc' }}>Asset Allocation</h3>
                        <div style={{ height: '400px', background: '#1e293b', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {accounts.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={accounts}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="balance"
                                        >
                                            {accounts.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any, name: any, props: any) => {
                                                const currency = props.payload.currency || 'USD';
                                                return `${getCurrencySymbol(currency)}${Number(value).toLocaleString()}`;
                                            }}
                                            contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p style={{ color: '#64748b' }}>Add accounts to view allocation</p>
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
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        backgroundColor: '#1e293b',
                        padding: '30px',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>{editId ? 'Edit Account' : 'Add New Account'}</h2>

                        <form onSubmit={handleAddAccount} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Account Name</label>
                                <input
                                    type="text"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    placeholder="e.g. My Savings"
                                    autoFocus
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Bank Name</label>
                                <input
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="e.g. Chase, Bank of America"
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Currency</label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value as 'USD' | 'INR')}
                                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="INR">INR (₹)</option>
                                    </select>
                                </div>
                                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Account Type</label>
                                    <select
                                        value={accountType}
                                        onChange={(e) => setAccountType(e.target.value)}
                                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
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
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Balance</label>
                                <input
                                    type="number"
                                    value={balance}
                                    onChange={(e) => setBalance(e.target.value)}
                                    placeholder="0.00"
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}
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
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        backgroundColor: '#1e293b',
                        padding: '30px',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>Transfer Funds</h2>

                        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>From Account</label>
                                <select
                                    value={sourceAccountId}
                                    onChange={(e) => setSourceAccountId(Number(e.target.value))}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
                                >
                                    <option value="" disabled>Select Source Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>To Account</label>
                                <select
                                    value={targetAccountId}
                                    onChange={(e) => setTargetAccountId(Number(e.target.value))}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
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
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Amount</label>
                                <input
                                    type="number"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsTransferModalOpen(false)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}
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
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1010, backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px',
                        width: '100%', maxWidth: '400px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>Add Funds</h2>
                        <form onSubmit={handleAddFundsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Amount</label>
                                <input
                                    type="number"
                                    value={addFundsAmount}
                                    onChange={(e) => setAddFundsAmount(e.target.value)}
                                    placeholder="0.00"
                                    autoFocus
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Description</label>
                                <input
                                    type="text"
                                    value={addFundsDescription}
                                    onChange={(e) => setAddFundsDescription(e.target.value)}
                                    placeholder="e.g. Dividend, Refund"
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Category</label>
                                <input
                                    type="text"
                                    value={addFundsCategory}
                                    onChange={(e) => setAddFundsCategory(e.target.value)}
                                    placeholder="e.g. Income, Gift"
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsAddFundsModalOpen(false)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#22c55e', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}
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
