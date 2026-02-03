"use client";

import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useFinance } from '../components/FinanceContext';

export default function Ledger() {
    const { transactions, addTransaction } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'Income' | 'Expense'>('Expense');

    const handleAddTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !category) return;

        addTransaction({
            date,
            description,
            category,
            type,
            amount: parseFloat(amount),
        });

        // Reset Form
        setDescription('');
        setCategory('');
        setAmount('');
        setType('Expense');
        setDate(new Date().toISOString().split('T')[0]);
        setIsModalOpen(false);
    };

    // Filter transactions for the selected date
    const filteredTransactions = transactions.filter(t => t.date === selectedDate.toISOString().split('T')[0]);

    return (
        <div className="main-content">
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 className="greeting-text" style={{ marginBottom: 0 }}>Ledger</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
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
                        + Add Transaction
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
                    {/* Calendar Sidebar */}
                    <div>
                        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <div className="calendar-container">
                                <Calendar
                                    onChange={(value: any) => setSelectedDate(value)}
                                    value={selectedDate}
                                    className="custom-calendar"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ledger Table */}
                    <div style={{
                        backgroundColor: '#1e293b',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        alignSelf: 'start'
                    }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: '#f8fafc' }}>Transactions for {selectedDate.toDateString()}</h3>
                            <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{filteredTransactions.length} records</span>
                        </div>

                        {filteredTransactions.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #334155', background: '#0f172a' }}>
                                        {/* Removed Date column as it's redundant when filtering by single date */}
                                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#94a3b8' }}>Description</th>
                                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#94a3b8' }}>Category</th>
                                        <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#94a3b8' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map((transaction) => (
                                        <tr key={transaction.id} style={{ borderBottom: '1px solid #334155' }}>
                                            <td style={{ padding: '16px' }}>{transaction.description}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    backgroundColor: '#334155',
                                                    color: '#e2e8f0'
                                                }}>
                                                    {transaction.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: transaction.type === 'Income' ? '#4ade80' : '#f87171' }}>
                                                {transaction.type === 'Income' ? '+' : '-'}${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                <p>No transactions found for this date.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Transaction Modal */}
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
                        <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>Add Transaction</h2>

                        <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Type</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setType('Expense')}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid',
                                            borderColor: type === 'Expense' ? '#ef4444' : '#475569',
                                            background: type === 'Expense' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                                            color: type === 'Expense' ? '#f87171' : '#94a3b8',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Expense
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('Income')}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid',
                                            borderColor: type === 'Income' ? '#22c55e' : '#475569',
                                            background: type === 'Income' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                                            color: type === 'Income' ? '#4ade80' : '#94a3b8',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Income
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Grocery Shopping"
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Category</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g. Food, Rent, Salary"
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
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
                                    Add Transaction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
