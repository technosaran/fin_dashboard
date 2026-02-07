"use client";

import { useState } from 'react';
import { useNotifications } from '../components/NotificationContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useFinance } from '../components/FinanceContext';
import { exportTransactionsToCSV } from '../../lib/exportUtils';
import {
    Book,
    Plus,
    X,
    Search,
    Calendar as CalendarIcon,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Edit3,
    Trash2
} from 'lucide-react';

export default function LedgerClient() {
    const { transactions, addTransaction, updateTransaction, deleteTransaction, loading } = useFinance();
    const { showNotification, confirm: customConfirm } = useNotifications();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'Income' | 'Expense'>('Expense');

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !category) return;

        const transactionData = {
            date,
            description,
            category,
            type,
            amount: parseFloat(amount),
        };

        if (editId) {
            await updateTransaction({ ...transactionData, id: editId });
            showNotification('success', 'Transaction updated successfully');
        } else {
            await addTransaction(transactionData);
            showNotification('success', 'Transaction recorded successfully');
        }

        resetForm();
        setIsModalOpen(false);
    };

    const resetForm = () => {
        setDescription('');
        setCategory('');
        setAmount('');
        setType('Expense');
        setDate(new Date().toISOString().split('T')[0]);
        setEditId(null);
    };

    const handleEdit = (tx: Transaction) => {
        setEditId(tx.id);
        setDescription(tx.description);
        setCategory(tx.category);
        setAmount(tx.amount.toString());
        setType(tx.type);
        setDate(tx.date);
        setIsModalOpen(true);
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesDate = t.date === selectedDate.toISOString().split('T')[0];
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDate && matchesSearch;
    });

    const dayTotalIncome = filteredTransactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
    const dayTotalExpense = filteredTransactions.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);

    if (loading) {
        return (
            <div className="main-content" style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94a3b8' }}>Loading your transactions...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content" style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header Area */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>Financial Ledger</h1>
                        <p style={{ color: '#94a3b8', fontSize: 'clamp(0.875rem, 2vw, 1rem)', marginTop: '8px' }}>Iterative audit trail of all movements</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => {
                                exportTransactionsToCSV(transactions);
                                showNotification('success', 'Transactions exported successfully!');
                            }}
                            aria-label="Export transactions to CSV" 
                            style={{
                                padding: '12px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', border: '1px solid #1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', transition: '0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.color = '#10b981'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                            <Download size={18} /> <span style={{ whiteSpace: 'nowrap' }}>Export CSV</span>
                        </button>
                        <button onClick={() => setIsModalOpen(true)} aria-label="Add new transaction record" style={{
                            padding: '12px 24px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
                        }}>
                            <Plus size={18} strokeWidth={3} /> <span style={{ whiteSpace: 'nowrap' }}>Add Record</span>
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Top Section: Calendar and Summary Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px', marginBottom: '16px' }}>
                        {/* Small Square Minimalist Calendar */}
                        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', width: 'fit-content' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#818cf8' }}>
                                <CalendarIcon size={14} strokeWidth={3} />
                                <span style={{ fontWeight: '900', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Date Filter</span>
                            </div>
                            <style>{`
                                .compact-calendar {
                                    width: 240px !important;
                                    background: transparent !important;
                                    border: none !important;
                                    color: #cbd5e1 !important;
                                    font-family: inherit !important;
                                }
                                .compact-calendar .react-calendar__tile { 
                                    color: #94a3b8 !important; 
                                    padding: 10px 0 !important; 
                                    aspect-ratio: 1 / 1 !important;
                                    display: flex !important;
                                    align-items: center !important;
                                    justify-content: center !important;
                                    border-radius: 4px !important; 
                                    font-size: 0.75rem !important;
                                    font-weight: 600 !important;
                                }
                                .compact-calendar .react-calendar__tile--now { 
                                    background: rgba(99, 102, 241, 0.05) !important; 
                                    color: #818cf8 !important; 
                                    border: 1px solid rgba(99, 102, 241, 0.2) !important;
                                }
                                .compact-calendar .react-calendar__tile--active { 
                                    background: #6366f1 !important; 
                                    color: white !important; 
                                    font-weight: 900 !important; 
                                    border: none !important;
                                }
                                .compact-calendar .react-calendar__navigation {
                                    margin-bottom: 10px !important;
                                    height: auto !important;
                                }
                                .compact-calendar .react-calendar__navigation button { 
                                    color: #f8fafc !important; 
                                    font-weight: 900 !important; 
                                    font-size: 0.85rem !important;
                                    min-width: 30px !important;
                                    background: transparent !important;
                                }
                                .compact-calendar .react-calendar__month-view__weekdays { 
                                    font-size: 0.6rem !important; 
                                    text-transform: uppercase !important; 
                                    color: #475569 !important; 
                                    font-weight: 900 !important;
                                    text-decoration: none !important;
                                }
                                .compact-calendar .react-calendar__month-view__weekdays__weekday abbr {
                                    text-decoration: none !important;
                                }
                                .compact-calendar .react-calendar__month-view__days__day--neighboringMonth {
                                    color: #1e293b !important;
                                }
                                .compact-calendar button:enabled:hover {
                                    background-color: rgba(255,255,255,0.05) !important;
                                }
                            `}</style>
                            <Calendar
                                onChange={(value: Date | null) => setSelectedDate(value)}
                                value={selectedDate}
                                className="compact-calendar"
                            />
                        </div>

                        {/* Summary Stats */}
                        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '20px', border: '1px solid #1e293b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#34d399' }}>
                                <ArrowUpRight size={18} aria-hidden="true" />
                                <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>Daily Inflow</span>
                            </div>
                            <div style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: '900', color: '#34d399' }}>₹{dayTotalIncome.toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '20px', border: '1px solid #1e293b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#f87171' }}>
                                <ArrowDownRight size={18} aria-hidden="true" />
                                <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>Daily Outflow</span>
                            </div>
                            <div style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: '900', color: '#f87171' }}>₹{dayTotalExpense.toLocaleString()}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Interactive Toolbar */}
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} aria-hidden="true" />
                                <input
                                    placeholder="Search records by description or category..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    aria-label="Search transactions"
                                    style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', padding: '14px 16px 14px 48px', borderRadius: '16px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        {/* Timeline Wrapper */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.3)', borderRadius: '32px', border: '1px solid #1e293b', padding: '32px', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                                <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)', fontWeight: '800', margin: 0 }}>{selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>{filteredTransactions.length} RECORD(S) FOUND</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {filteredTransactions.length > 0 ? filteredTransactions.map((tx, idx) => (
                                    <div key={tx.id} style={{ display: 'flex', gap: '24px', position: 'relative' }}>
                                        {/* Vertical Timeline Line */}
                                        <div style={{ width: '2px', background: 'rgba(99, 102, 241, 0.1)', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: tx.type === 'Income' ? '#10b981' : '#f43f5e', position: 'absolute', top: '24px', border: '4px solid #020617', zIndex: 1 }} />
                                            {idx === filteredTransactions.length - 1 && <div style={{ position: 'absolute', bottom: 0, top: '24px', width: '2px', background: '#020617' }} />}
                                        </div>

                                        {/* Content Card */}
                                        <div style={{ flex: 1, paddingBottom: '32px', paddingTop: '8px' }}>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                                padding: '20px 24px',
                                                borderRadius: '20px',
                                                border: '1px solid #1e293b',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.background = '#1e293b'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'; }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>{tx.description}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>{tx.category}</span>
                                                        <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>Logged at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: '950', color: tx.type === 'Income' ? '#34d399' : '#f87171' }}>
                                                        {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(tx); }}
                                                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            aria-label="Edit transaction"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                const isConfirmed = await customConfirm({
                                                                    title: 'Delete Record',
                                                                    message: 'Are you sure you want to delete this transaction? This cannot be undone.',
                                                                    type: 'error',
                                                                    confirmLabel: 'Delete'
                                                                });
                                                                if (isConfirmed) {
                                                                    await deleteTransaction(tx.id);
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
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: '80px 40px', textAlign: 'center', color: '#475569' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                            <Book size={32} opacity={0.2} />
                                        </div>
                                        <h4 style={{ color: '#f8fafc', margin: '0 0 8px 0' }}>No Audit Records</h4>
                                        <p style={{ fontSize: '0.9rem', margin: 0 }}>This timeline is clean. Select another date or add a new record.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Modal - Unified Design */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: '#0f172a', padding: 'clamp(24px, 5vw, 40px)', borderRadius: '32px', border: '1px solid #334155', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: '900', margin: 0 }}>{editId ? 'Modify Record' : 'Manual Entry'}</h2>
                            <button onClick={() => setIsModalOpen(false)} aria-label="Close modal" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddTransaction} aria-label="Add transaction form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Entry Type</label>
                                    <div style={{ display: 'flex', gap: '8px', background: '#020617', padding: '4px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                                        <button type="button" onClick={() => setType('Expense')} aria-pressed={type === 'Expense'} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: type === 'Expense' ? '#f43f5e' : 'transparent', color: type === 'Expense' ? '#fff' : '#64748b', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', transition: '0.2s' }}>EXPENSE</button>
                                        <button type="button" onClick={() => setType('Income')} aria-pressed={type === 'Income'} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: type === 'Income' ? '#10b981' : 'transparent', color: type === 'Income' ? '#fff' : '#64748b', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', transition: '0.2s' }}>INCOME</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Date</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} aria-label="Transaction date" style={{ background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Description</label>
                                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What was this for?" aria-label="Transaction description" required style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Category</label>
                                    <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Food" aria-label="Transaction category" required style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Amount (₹)</label>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" aria-label="Transaction amount" required style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                </div>
                            </div>
                            <button type="submit" aria-label="Submit transaction" style={{ marginTop: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#fff', padding: '18px', borderRadius: '18px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1rem' }}>{editId ? 'Update Record' : 'Commit Transaction'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
