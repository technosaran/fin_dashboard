"use client";

import { useState, useMemo } from 'react';
import { useNotifications } from '../components/NotificationContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useFinance } from '../components/FinanceContext';
import { Transaction } from '@/lib/types';
import { exportTransactionsToCSV } from '../../lib/exportUtils';
import {
    Book,
    Plus,
    X,
    Calendar as CalendarIcon,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Edit3,
    Trash2,
    Search,
    Filter,
    ArrowRight,
    Wallet,
    Tag,
    History,
    TrendingUp,
    TrendingDown,
    Layers,
    Clock
} from 'lucide-react';

export default function LedgerClient() {
    const {
        transactions,
        accounts,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        loading
    } = useFinance();
    const { showNotification, confirm: customConfirm } = useNotifications();

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [filterAccount, setFilterAccount] = useState<number | 'All'>('All');
    const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');
    const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'Income' | 'Expense'>('Expense');
    const [accountId, setAccountId] = useState<string>('');

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !category) return;

        const transactionData = {
            date,
            description,
            category,
            type,
            amount: parseFloat(amount),
            accountId: accountId ? parseInt(accountId) : undefined
        };

        try {
            if (editId) {
                await updateTransaction(editId, transactionData);
                showNotification('success', 'Transaction updated successfully');
            } else {
                await addTransaction(transactionData);
                showNotification('success', 'Transaction recorded successfully');
            }
            resetForm();
            setIsModalOpen(false);
        } catch (err) {
            showNotification('error', 'Failed to save transaction');
        }
    };

    const resetForm = () => {
        setDescription('');
        setCategory('');
        setAmount('');
        setType('Expense');
        setDate(new Date().toISOString().split('T')[0]);
        setAccountId('');
        setEditId(null);
    };

    const handleEdit = (tx: Transaction) => {
        setEditId(tx.id);
        setDescription(tx.description);
        setCategory(tx.category as string);
        setAmount(tx.amount.toString());
        setType(tx.type);
        setDate(tx.date);
        setAccountId(tx.accountId ? tx.accountId.toString() : '');
        setIsModalOpen(true);
    };

    const getAccountName = (id?: number) => {
        if (!id) return null;
        const account = accounts.find(a => a.id === id);
        return account ? account.name : null;
    };

    const categories = ['All', ...new Set(transactions.map(t => t.category))].sort() as string[];

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (typeof t.category === 'string' && t.category.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
            const matchesAccount = filterAccount === 'All' || t.accountId === filterAccount;
            const matchesType = filterType === 'All' || t.type === filterType;
            const matchesDate = !selectedDate || t.date === selectedDate.toISOString().split('T')[0];

            return matchesSearch && matchesCategory && matchesAccount && matchesType && matchesDate;
        });
    }, [transactions, searchQuery, filterCategory, filterAccount, filterType, selectedDate]);

    // Grouping by date
    const groupedTransactions = useMemo(() => {
        const groups: { [key: string]: Transaction[] } = {};
        filteredTransactions.forEach(t => {
            if (!groups[t.date]) groups[t.date] = [];
            groups[t.date].push(t);
        });
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [filteredTransactions]);

    const stats = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
        return { income, expense, balance: income - expense };
    }, [filteredTransactions]);

    if (loading) {
        return (
            <div className="main-content" style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                    <div style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '500' }}>Decrypting ledger entries...</div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="main-content" style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', padding: '24px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '24px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px', color: '#6366f1' }}>
                                <Book size={24} strokeWidth={2.5} />
                            </div>
                            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', margin: 0, letterSpacing: '-0.03em', background: 'linear-gradient(to bottom, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vault Ledger</h1>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <History size={16} /> Imperishable trail of all financial movements
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => {
                                exportTransactionsToCSV(transactions);
                                showNotification('success', 'Ledger exported to CSV');
                            }}
                            style={{
                                padding: '12px 20px', borderRadius: '16px', background: 'rgba(15, 23, 42, 0.6)', color: '#94a3b8', border: '1px solid #1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', backdropFilter: 'blur(8px)'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <Download size={18} /> Export
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                padding: '12px 24px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(99, 102, 241, 0.5)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(99, 102, 241, 0.4)'; }}
                        >
                            <Plus size={20} strokeWidth={3} /> Record Entry
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', right: '-20px', top: '-20px', color: 'rgba(16, 185, 129, 0.05)' }}><TrendingUp size={120} /></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ background: '#10b981', padding: '6px', borderRadius: '8px', color: '#fff' }}><ArrowUpRight size={16} strokeWidth={3} /></div>
                            <span style={{ color: '#34d399', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Inflow</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '950', color: '#fff' }}>₹{stats.income.toLocaleString()}</div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(244, 63, 94, 0.02) 100%)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(244, 63, 94, 0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', right: '-20px', top: '-20px', color: 'rgba(244, 63, 94, 0.05)' }}><TrendingDown size={120} /></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ background: '#f43f5e', padding: '6px', borderRadius: '8px', color: '#fff' }}><ArrowDownRight size={16} strokeWidth={3} /></div>
                            <span style={{ color: '#f87171', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Outflow</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '950', color: '#fff' }}>₹{stats.expense.toLocaleString()}</div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(30, 41, 59, 0.4) 100%)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', right: '-20px', top: '-10px', color: 'rgba(99, 102, 241, 0.05)' }}><Wallet size={120} /></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ background: '#6366f1', padding: '6px', borderRadius: '8px', color: '#fff' }}><Layers size={16} /></div>
                            <span style={{ color: '#a5b4fc', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Movement</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '950', color: '#fff' }}>₹{stats.balance.toLocaleString()}</div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 320px) 1fr', gap: '32px', alignItems: 'start' }}>

                    {/* Left Sidebar: Calendar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px' }}>

                        {/* Calendar Component */}
                        <div style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#818cf8' }}>
                                <CalendarIcon size={18} strokeWidth={2.5} />
                                <span style={{ fontWeight: '900', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Temporal Matrix</span>
                            </div>
                            <style>{`
                                .custom-calendar {
                                    width: 100% !important;
                                    background: transparent !important;
                                    border: none !important;
                                    color: #cbd5e1 !important;
                                    font-family: inherit !important;
                                }
                                .custom-calendar .react-calendar__tile { 
                                    padding: 12px 0 !important; 
                                    font-size: 0.85rem !important;
                                    font-weight: 700 !important;
                                    border-radius: 12px !important;
                                    color: #cbd5e1 !important;
                                    transition: all 0.2s;
                                }
                                .custom-calendar .react-calendar__tile:hover {
                                    background: rgba(255, 255, 255, 0.05) !important;
                                }
                                /* Remove red color for weekends */
                                .custom-calendar .react-calendar__month-view__days__day--weekend {
                                    color: #cbd5e1 !important;
                                }
                                .custom-calendar .react-calendar__tile--now { 
                                    background: rgba(99, 102, 241, 0.1) !important; 
                                    color: #818cf8 !important; 
                                    font-weight: 900 !important;
                                }
                                .custom-calendar .react-calendar__tile--active { 
                                    background: #6366f1 !important; 
                                    color: white !important; 
                                    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
                                }
                                .custom-calendar .react-calendar__navigation button { 
                                    color: #f8fafc !important; 
                                    font-weight: 800 !important;
                                    border-radius: 10px;
                                    font-size: 1rem;
                                }
                                .custom-calendar .react-calendar__navigation button:hover {
                                    background: rgba(255, 255, 255, 0.05) !important;
                                }
                                .custom-calendar .react-calendar__month-view__weekdays__weekday abbr {
                                    text-decoration: none !important;
                                    color: #475569 !important;
                                    font-weight: 950 !important;
                                    font-size: 0.7rem;
                                    text-transform: uppercase;
                                }
                            `}</style>
                            <Calendar
                                onChange={(val) => setSelectedDate(val as Date)}
                                value={selectedDate}
                                className="custom-calendar"
                            />
                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    style={{
                                        width: '100%',
                                        marginTop: '20px',
                                        background: 'rgba(244, 63, 94, 0.1)',
                                        color: '#f43f5e',
                                        border: '1px solid rgba(244, 63, 94, 0.2)',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: '0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.15)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
                                >
                                    <X size={14} /> RESET DATE VIEW
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Timeline of Transactions */}
                    <div style={{ minWidth: 0 }}>
                        {groupedTransactions.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                {groupedTransactions.map(([dateString, group]) => {
                                    const dateObj = new Date(dateString);
                                    const isToday = new Date().toISOString().split('T')[0] === dateString;

                                    return (
                                        <div key={dateString}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', position: 'sticky', top: '0', zIndex: 10, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)', padding: '10px 0' }}>
                                                <div style={{ background: isToday ? '#6366f1' : '#1e293b', color: '#fff', padding: '6px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    {isToday ? 'Today' : dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                </div>
                                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, #1e293b, transparent)' }}></div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>
                                                    {group.length} {group.length === 1 ? 'RECORD' : 'RECORDS'}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {group.map((tx) => (
                                                    <div
                                                        key={tx.id}
                                                        onClick={() => handleEdit(tx)}
                                                        style={{
                                                            background: '#0f172a',
                                                            padding: '20px 24px',
                                                            borderRadius: '20px',
                                                            border: '1px solid #1e293b',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            position: 'relative',
                                                            overflow: 'hidden'
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.background = '#131c31'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.background = '#0f172a'; }}
                                                    >
                                                        {/* Color side indicator */}
                                                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: tx.type === 'Income' ? '#10b981' : '#f43f5e' }}></div>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                            <div style={{
                                                                width: '48px', height: '48px', borderRadius: '14px', background: tx.type === 'Income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: tx.type === 'Income' ? '#10b981' : '#f43f5e'
                                                            }}>
                                                                {tx.type === 'Income' ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownRight size={20} strokeWidth={2.5} />}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#fff', marginBottom: '4px' }}>{tx.description}</div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                    <span style={{ fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '6px', letterSpacing: '0.5px' }}>
                                                                        <Tag size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {tx.category}
                                                                    </span>
                                                                    {getAccountName(tx.accountId) && (
                                                                        <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                            <Wallet size={12} /> {getAccountName(tx.accountId)}
                                                                        </span>
                                                                    )}
                                                                    {/* Detect Source (Automated entries usually have keywords) */}
                                                                    {['Stock', 'MF:', 'FnO', 'Bond:', 'Forex'].some(key => tx.description.includes(key)) && (
                                                                        <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>SYSTEM LOG</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '24px' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                                <div style={{ fontSize: '1.25rem', fontWeight: '950', color: tx.type === 'Income' ? '#10b981' : '#f43f5e' }}>
                                                                    {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                                                </div>
                                                                <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: '600', textTransform: 'uppercase', marginTop: '2px' }}>
                                                                    <Clock size={10} style={{ marginRight: '4px', verticalAlign: 'baseline' }} /> Verified
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleEdit(tx); }}
                                                                    style={{ background: 'rgba(51, 65, 85, 0.4)', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', transition: '0.2s' }}
                                                                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#334155'; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(51, 65, 85, 0.4)'; }}
                                                                >
                                                                    <Edit3 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        const isConfirmed = await customConfirm({
                                                                            title: 'Purge Record?',
                                                                            message: 'This ledger entry will be permanently erased. Proceed with caution.',
                                                                            type: 'error',
                                                                            confirmLabel: 'Erase'
                                                                        });
                                                                        if (isConfirmed) {
                                                                            await deleteTransaction(tx.id);
                                                                            showNotification('success', 'Entry purged from ledger');
                                                                        }
                                                                    }}
                                                                    style={{ background: 'rgba(244, 63, 94, 0.1)', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', transition: '0.2s' }}
                                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)'; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'; }}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ padding: '100px 40px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '32px', border: '1px dashed #1e293b' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.05)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#475569' }}>
                                    <Layers size={40} opacity={0.3} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', margin: '0 0 12px 0' }}>Zero Movements Detected</h3>
                                <p style={{ color: '#64748b', maxWidth: '300px', margin: '0 auto 24px', lineHeight: '1.6' }}>No records match your current filter parameters. Try adjusting your search or matrix view.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setFilterCategory('All'); setFilterAccount('All'); setFilterType('All'); setSelectedDate(null); }}
                                    style={{ background: '#1e293b', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                                >
                                    Reset Filters <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Entry Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: '#0f172a', padding: '40px', borderRadius: '32px', border: '1px solid #334155', width: '100%', maxWidth: '540px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '950', margin: 0, letterSpacing: '-0.02em' }}>{editId ? 'Edit Entry' : 'New Ledger Record'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Operation Type</label>
                                    <div style={{ display: 'flex', gap: '4px', background: '#020617', padding: '4px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                                        <button type="button" onClick={() => setType('Expense')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: type === 'Expense' ? '#f43f5e' : 'transparent', color: type === 'Expense' ? '#fff' : '#475569', fontWeight: '950', fontSize: '0.7rem', cursor: 'pointer' }}>EXPENSE</button>
                                        <button type="button" onClick={() => setType('Income')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: type === 'Income' ? '#10b981' : 'transparent', color: type === 'Income' ? '#fff' : '#475569', fontWeight: '950', fontSize: '0.7rem', cursor: 'pointer' }}>INCOME</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</label>
                                <input placeholder="e.g. Monthly Rent Payment" value={description} onChange={e => setDescription(e.target.value)} required style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none', width: '100%' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Category</label>
                                    <input placeholder="Food, Rent, etc." value={category} onChange={e => setCategory(e.target.value)} required style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount (₹)</label>
                                    <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Source Account</label>
                                <select
                                    value={accountId}
                                    onChange={e => setAccountId(e.target.value)}
                                    style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="">No Account Linked</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>)}
                                </select>
                            </div>

                            <button type="submit" style={{ marginTop: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#fff', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                {editId ? 'Commit Changes' : 'Record Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
