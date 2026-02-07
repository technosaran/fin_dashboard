"use client";

import { useState, useMemo } from 'react';
import { useFinance } from '../components/FinanceContext';
import { useNotifications } from '../components/NotificationContext';
import {
    LayoutDashboard,
    Plus,
    X,
    Search,
    Filter,
    ArrowDownRight,
    ArrowUpRight,
    PieChart as PieIcon,
    BarChart3,
    TrendingDown,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Edit3,
    Trash2,
    DollarSign,
    ShoppingBag,
    Coffee,
    Home,
    Car,
    Smartphone,
    Utensils,
    Heart,
    Zap,
    Briefcase
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#14b8a6'];

const CATEGORIES = [
    { name: 'Food & Dining', icon: <Utensils size={18} />, color: '#f59e0b' },
    { name: 'Shopping', icon: <ShoppingBag size={18} />, color: '#ec4899' },
    { name: 'Housing', icon: <Home size={18} />, color: '#6366f1' },
    { name: 'Transport', icon: <Car size={18} />, color: '#06b6d4' },
    { name: 'Entertainment', icon: <Coffee size={18} />, color: '#8b5cf6' },
    { name: 'Bills & Utilities', icon: <Zap size={18} />, color: '#f43f5e' },
    { name: 'Health', icon: <Heart size={18} />, color: '#10b981' },
    { name: 'Work', icon: <Briefcase size={18} />, color: '#64748b' },
];

export default function ExpensesClient() {
    const { transactions, addTransaction, updateTransaction, deleteTransaction, loading, accounts } = useFinance();
    const { showNotification, confirm: customConfirm } = useNotifications();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState<string>('');

    // Filter only expenses
    const expenses = useMemo(() => {
        return transactions.filter(t => t.type === 'Expense');
    }, [transactions]);

    // Derived Data
    const totalMonthlyExpense = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return expenses
            .filter(e => new Date(e.date) >= startOfMonth)
            .reduce((sum, e) => sum + e.amount, 0);
    }, [expenses]);

    const categoryBreakdown = useMemo(() => {
        const breakdown: Record<string, number> = {};
        expenses.forEach(e => {
            breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
        });
        return Object.entries(breakdown)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [expenses]);

    const monthlyTrend = useMemo(() => {
        const trend: Record<string, number> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize last 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
            trend[key] = 0;
        }

        expenses.forEach(e => {
            const d = new Date(e.date);
            const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
            if (trend[key] !== undefined) {
                trend[key] += e.amount;
            }
        });

        return Object.entries(trend).map(([name, amount]) => ({ name, amount }));
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e => {
            const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
            return matchesSearch && matchesCategory;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, searchQuery, selectedCategory]);

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !category) return;

        const expenseData = {
            date,
            description,
            category,
            type: 'Expense' as const,
            amount: parseFloat(amount),
            accountId: accountId ? parseInt(accountId) : undefined
        };

        if (editId) {
            await updateTransaction({ ...expenseData, id: editId });
            showNotification('success', 'Expense updated');
        } else {
            await addTransaction(expenseData);
            showNotification('success', 'Expense recorded');
        }

        resetForm();
        setIsModalOpen(false);
    };

    const resetForm = () => {
        setDescription('');
        setCategory('');
        setAmount('');
        setAccountId('');
        setDate(new Date().toISOString().split('T')[0]);
        setEditId(null);
    };

    const handleEdit = (ex: Transaction) => {
        setEditId(ex.id);
        setDescription(ex.description);
        setCategory(ex.category);
        setAmount(ex.amount.toString());
        setAccountId(ex.accountId?.toString() || '');
        setDate(ex.date);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        const isConfirmed = await customConfirm({
            title: 'Delete Expense?',
            message: 'This will remove the expense from your records.',
            type: 'error',
            confirmLabel: 'Delete'
        });
        if (isConfirmed) {
            await deleteTransaction(id);
            showNotification('success', 'Expense deleted');
        }
    };

    if (loading) {
        return (
            <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#020617' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', color: '#818cf8', fontWeight: '800' }}>Analyzing your spending habits...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '950', margin: 0, letterSpacing: '-2px', color: '#fff' }}>Expenses Hub</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px', fontWeight: '600' }}>Master your cashflow and optimize spending</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '16px 28px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 12px 24px rgba(99, 102, 241, 0.3)', transition: 'all 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(99, 102, 241, 0.3)'; }}
                >
                    <Plus size={20} strokeWidth={3} /> Record Expense
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '32px', borderRadius: '28px', border: '1px solid #1e293b', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '100%', background: 'linear-gradient(to left, rgba(244, 63, 94, 0.05), transparent)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f43f5e', marginBottom: '16px' }}>
                        <TrendingDown size={24} />
                        <span style={{ fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>This Month</span>
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: '950', color: '#fff', letterSpacing: '-2px' }}>₹{totalMonthlyExpense.toLocaleString()}</div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600', marginTop: '8px' }}>Spent since {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
                </div>

                <div style={{ background: '#0f172a', padding: '32px', borderRadius: '28px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#818cf8', marginBottom: '24px' }}>
                        <PieIcon size={24} />
                        <span style={{ fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Category Burn</span>
                    </div>
                    <div style={{ height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryBreakdown.slice(0, 5)}
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                    label={({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = outerRadius + 20;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        return <text x={x} y={y} fill="#dbe4ed" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text>;
                                    }}
                                >
                                    {categoryBreakdown.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: '16px' }} itemStyle={{ color: '#ebf1f7' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ background: '#0f172a', padding: '32px', borderRadius: '28px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', marginBottom: '24px' }}>
                        <BarChart3 size={24} />
                        <span style={{ fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>6 Month Trend</span>
                    </div>
                    <div style={{ height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrend}>
                                <Bar dataKey="amount" fill="url(#colorBar)" radius={[6, 6, 0, 0]} />
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0.28} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#b3c2d1', fontSize: 10 }} dy={10} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: '16px' }} itemStyle={{ color: '#e9eff5' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Category Quick Filters */}
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '32px', scrollbarWidth: 'none' }}>
                <button
                    onClick={() => setSelectedCategory('All')}
                    style={{ padding: '12px 24px', borderRadius: '14px', background: selectedCategory === 'All' ? '#fff' : 'rgba(255,255,255,0.03)', color: selectedCategory === 'All' ? '#020617' : '#94a3b8', border: '1px solid', borderColor: selectedCategory === 'All' ? '#fff' : '#1e293b', fontWeight: '800', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }}
                >
                    All Expenses
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', borderRadius: '14px', background: selectedCategory === cat.name ? cat.color : 'rgba(255,255,255,0.03)', color: selectedCategory === cat.name ? '#fff' : '#94a3b8', border: '1px solid', borderColor: selectedCategory === cat.name ? cat.color : '#1e293b', fontWeight: '800', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }}
                    >
                        {cat.icon} {cat.name}
                    </button>
                ))}
            </div>

            {/* Expenses List */}
            <div style={{ background: '#0f172a', borderRadius: '32px', border: '1px solid #1e293b', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>Recent Movements</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            placeholder="Find records..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px 16px 12px 48px', borderRadius: '14px', color: '#fff', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredExpenses.length > 0 ? (
                        filteredExpenses.map(ex => (
                            <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ArrowDownRight size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{ex.description}</div>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', color: '#818cf8', background: 'rgba(129, 140, 248, 0.1)', padding: '2px 10px', borderRadius: '8px' }}>{ex.category}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '700' }}>{new Date(ex.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff' }}>₹{ex.amount.toLocaleString()}</div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button onClick={() => handleEdit(ex)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748b', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}><Edit3 size={18} /></button>
                                        <button onClick={() => handleDelete(ex.id)} style={{ background: 'rgba(244, 63, 94, 0.05)', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '80px', color: '#475569' }}>
                            <TrendingDown size={64} style={{ marginBottom: '24px', opacity: 0.1 }} />
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#94a3b8' }}>No expenses matching your criteria</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: '#0f172a', width: '100%', maxWidth: '540px', borderRadius: '40px', border: '1px solid #334155', padding: '48px', position: 'relative' }}>
                        <button onClick={() => { setIsModalOpen(false); resetForm(); }} style={{ position: 'absolute', top: '32px', right: '32px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>

                        <h2 style={{ fontSize: '2rem', fontWeight: '950', margin: '0 0 40px 0', letterSpacing: '-1px' }}>{editId ? 'Edit Record' : 'Log Expense'}</h2>

                        <form onSubmit={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>What was the expense for?</label>
                                <input
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Grocery shopping, Rent, etc."
                                    required
                                    style={{ background: '#020617', border: '1px solid #1e293b', padding: '18px 24px', borderRadius: '20px', color: '#fff', fontSize: '1.1rem', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Category</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        required
                                        style={{ background: '#020617', border: '1px solid #1e293b', padding: '18px 24px', borderRadius: '20px', color: '#fff', fontSize: '1.1rem', outline: 'none', appearance: 'none' }}
                                    >
                                        <option value="">Select Category</option>
                                        {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        style={{ background: '#020617', border: '1px solid #1e293b', padding: '18px 24px', borderRadius: '20px', color: '#fff', fontSize: '1.1rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        required
                                        style={{ background: '#020617', border: '1px solid #1e293b', padding: '18px 24px', borderRadius: '20px', color: '#fff', fontSize: '1.1rem', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment Mode</label>
                                    <select
                                        value={accountId}
                                        onChange={e => setAccountId(e.target.value)}
                                        style={{ background: '#020617', border: '1px solid #1e293b', padding: '18px 24px', borderRadius: '20px', color: '#fff', fontSize: '1.1rem', outline: 'none', appearance: 'none' }}
                                    >
                                        <option value="">Balance Only (No Account)</option>
                                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>)}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                style={{ marginTop: '20px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', padding: '22px', borderRadius: '24px', border: 'none', fontWeight: '950', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 15px 30px rgba(99, 102, 241, 0.4)' }}
                            >
                                {editId ? 'Confirm Changes' : 'Record Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
