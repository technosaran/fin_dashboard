"use client";

import { useState, useMemo } from 'react';
import {
    Plus,
    DollarSign,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Edit,
    Trash2,
    Calendar
} from 'lucide-react';
import { useFinance } from '../components/FinanceContext';
import { ForexTransaction } from '@/lib/types';
import { SkeletonCard } from '../components/SkeletonLoader';
import { useNotifications } from '../components/NotificationContext';

export default function ForexClient() {
    const { forexTransactions, loading, addForexTransaction, updateForexTransaction, deleteForexTransaction, accounts, settings } = useFinance();
    const { showNotification, confirm } = useNotifications();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<ForexTransaction | null>(null);

    // Calculate stats
    const stats = useMemo(() => {
        const deposits = forexTransactions
            .filter(t => t.transactionType === 'DEPOSIT')
            .reduce((sum, t) => sum + t.amount, 0);

        const withdrawals = forexTransactions
            .filter(t => t.transactionType === 'WITHDRAWAL')
            .reduce((sum, t) => sum + t.amount, 0);

        const profits = forexTransactions
            .filter(t => t.transactionType === 'PROFIT')
            .reduce((sum, t) => sum + t.amount, 0);

        const losses = forexTransactions
            .filter(t => t.transactionType === 'LOSS')
            .reduce((sum, t) => sum + t.amount, 0);

        const netPnL = profits - losses;
        const currentBalance = deposits + profits - losses - withdrawals;

        return { deposits, withdrawals, profits, losses, netPnL, currentBalance };
    }, [forexTransactions]);

    if (loading) {
        return (
            <div className="page-container">
                <div className="bg-mesh" />
                <div className="dashboard-header">
                    <div className="skeleton" style={{ height: '40px', width: '250px' }} />
                </div>
                <div className="grid-responsive-3 mb-xl">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        );
    }

    if (!settings.forexEnabled) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                <div className="bg-mesh" />
                <div className="premium-card p-2xl text-center" style={{ maxWidth: '500px', padding: '48px' }}>
                    <DollarSign size={48} className="mb-md" style={{ color: '#64748b', opacity: 0.5, margin: '0 auto 24px auto' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '12px' }}>Forex Section Disabled</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        You have disabled the forex trading section in your settings.
                        Enable it to track your forex deposits, trades, and withdrawals.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="bg-mesh" />

            <header className="dashboard-header">
                <div className="fade-in">
                    <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <DollarSign className="text-glow" style={{ color: 'var(--accent)' }} size={32} />
                        <span>Forex <span className="title-accent">Trading</span></span>
                    </h1>
                </div>

                <div className="flex gap-sm">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="glass-button glow-primary"
                        style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', borderColor: 'transparent' }}
                    >
                        <Plus size={18} /> Add Transaction
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid-responsive-4 mb-xl fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="premium-card p-lg" style={{ padding: '24px' }}>
                    <div className="flex justify-between items-start mb-sm" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div className="stat-label" style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Current Balance</div>
                        <Wallet size={16} style={{ color: '#6366f1' }} />
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: '900', color: stats.currentBalance >= 0 ? '#10b981' : '#ef4444' }}>
                        ₹{Math.abs(stats.currentBalance).toLocaleString()}
                    </div>
                </div>

                <div className="premium-card p-lg" style={{ padding: '24px' }}>
                    <div className="flex justify-between items-start mb-sm" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div className="stat-label" style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Total Deposits</div>
                        <ArrowDownRight size={16} style={{ color: '#3b82f6' }} />
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: '900' }}>₹{stats.deposits.toLocaleString()}</div>
                </div>

                <div className="premium-card p-lg" style={{ padding: '24px' }}>
                    <div className="flex justify-between items-start mb-sm" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div className="stat-label" style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Total Withdrawals</div>
                        <ArrowUpRight size={16} style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: '900' }}>₹{stats.withdrawals.toLocaleString()}</div>
                </div>

                <div className="premium-card p-lg" style={{ padding: '24px' }}>
                    <div className="flex justify-between items-start mb-sm" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div className="stat-label" style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Net P&L</div>
                        <div style={{ color: stats.netPnL >= 0 ? '#10b981' : '#ef4444' }}>
                            {stats.netPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: '900', color: stats.netPnL >= 0 ? '#10b981' : '#ef4444' }}>
                        {stats.netPnL >= 0 ? '+' : ''}₹{stats.netPnL.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        Profit: ₹{stats.profits.toLocaleString()} | Loss: ₹{stats.losses.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="premium-card p-lg fade-in" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '24px' }}>Transaction History</h2>

                {forexTransactions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {forexTransactions.map((transaction) => {
                            const account = accounts.find(a => a.id === transaction.accountId);
                            const isPositive = transaction.transactionType === 'DEPOSIT' || transaction.transactionType === 'PROFIT';

                            return (
                                <div
                                    key={transaction.id}
                                    className="premium-card p-md"
                                    style={{
                                        padding: '16px',
                                        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.3) 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '16px',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 200px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isPositive ? '#10b981' : '#ef4444'
                                        }}>
                                            {isPositive ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>
                                                {transaction.transactionType}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                <Calendar size={12} /> {new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                {account && <span>• {account.name}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            fontSize: '1.25rem',
                                            fontWeight: '900',
                                            color: isPositive ? '#10b981' : '#ef4444'
                                        }}>
                                            {isPositive ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => setEditingTransaction(transaction)}
                                                className="glass-button p-sm"
                                                style={{ color: 'var(--accent-hover)', padding: '8px', borderRadius: '8px' }}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const isConfirmed = await confirm({
                                                        title: 'Delete Transaction?',
                                                        message: 'Are you sure you want to delete this forex transaction?',
                                                        type: 'error'
                                                    });
                                                    if (isConfirmed) {
                                                        await deleteForexTransaction(transaction.id);
                                                        showNotification('success', 'Transaction deleted successfully');
                                                    }
                                                }}
                                                className="glass-button p-sm"
                                                style={{ color: '#f87171', padding: '8px', borderRadius: '8px' }}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {transaction.notes && (
                                        <div style={{ flex: '1 1 100%', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', paddingLeft: '56px' }}>
                                            Note: {transaction.notes}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-tertiary)' }}>
                        <DollarSign size={64} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>No Transactions Yet</h3>
                        <p style={{ marginBottom: '24px' }}>Start tracking your forex trading by adding your first transaction.</p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="glass-button glow-primary"
                            style={{ padding: '12px 24px', background: 'var(--accent)', borderColor: 'transparent', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={18} /> Add Transaction
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {(isAddModalOpen || editingTransaction) && (
                <ForexTransactionModal
                    transaction={editingTransaction}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditingTransaction(null);
                    }}
                    onSave={async (data) => {
                        try {
                            if (editingTransaction) {
                                await updateForexTransaction(editingTransaction.id, data);
                                showNotification('success', 'Transaction updated successfully');
                            } else {
                                await addForexTransaction(data);
                                showNotification('success', 'Transaction added successfully');
                            }
                            setIsAddModalOpen(false);
                            setEditingTransaction(null);
                        } catch (error) {
                            showNotification('error', error instanceof Error ? error.message : 'Failed to save transaction');
                        }
                    }}
                    accounts={accounts}
                />
            )}
        </div>
    );
}

interface ForexTransactionModalProps {
    transaction: ForexTransaction | null;
    onClose: () => void;
    onSave: (data: Omit<ForexTransaction, 'id'>) => Promise<void>;
    accounts: Array<{ id: number; name: string; balance: number }>;
}

function ForexTransactionModal({ transaction, onClose, onSave, accounts }: ForexTransactionModalProps) {
    const [transactionType, setTransactionType] = useState<ForexTransaction['transactionType']>(transaction?.transactionType || 'DEPOSIT');
    const [amount, setAmount] = useState(transaction?.amount.toString() || '');
    const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState(transaction?.notes || '');
    const [accountId, setAccountId] = useState<number>(transaction?.accountId || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave({
                transactionType,
                amount: parseFloat(amount),
                date,
                notes: notes || undefined,
                accountId: accountId || undefined
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }} onClick={onClose} />

            <div className="premium-card fade-in" style={{
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                zIndex: 1,
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '32px',
                padding: '32px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>
                        {transaction ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={18} style={{ transform: 'rotate(45deg)' }} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Transaction Type</label>
                        <select
                            value={transactionType}
                            onChange={e => setTransactionType(e.target.value as ForexTransaction['transactionType'])}
                            style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none', cursor: 'pointer' }}
                            required
                        >
                            <option value="DEPOSIT">Deposit</option>
                            <option value="PROFIT">Profit</option>
                            <option value="LOSS">Loss</option>
                            <option value="WITHDRAWAL">Withdrawal</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Amount (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Link to Account (Optional)</label>
                        <select
                            value={accountId}
                            onChange={e => setAccountId(Number(e.target.value))}
                            style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value={0}>None</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none', resize: 'vertical' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            color: '#fff',
                            padding: '14px',
                            borderRadius: '16px',
                            border: 'none',
                            fontWeight: '800',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            opacity: isSubmitting ? 0.6 : 1
                        }}
                    >
                        {isSubmitting ? 'Saving...' : transaction ? 'Update Transaction' : 'Add Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
}
