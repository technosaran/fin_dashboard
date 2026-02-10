"use client";

import { useState, useMemo } from 'react';
import { useFinance, Transaction } from '../components/FinanceContext';
import { useNotifications } from '../components/NotificationContext';
import {
    Plus,
    X,
    Search,
    TrendingDown,
    PieChart as PieIcon,
    BarChart3,
    Edit3,
    Trash2,
    ShoppingBag,
    Coffee,
    Home,
    Car,
    Utensils,
    Heart,
    Zap,
    Briefcase,
    Calendar,
    Wallet,
    CreditCard,
    ArrowRight
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
    YAxis
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

    const dailyAverage = useMemo(() => {
        const now = new Date();
        const elapsedDays = now.getDate();
        return totalMonthlyExpense / elapsedDays;
    }, [totalMonthlyExpense]);

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
            showNotification('success', 'Expense updated successfully');
        } else {
            await addTransaction(expenseData);
            showNotification('success', 'Expense recorded successfully');
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
            message: 'This will remove the expense from your permanent records.',
            type: 'error',
            confirmLabel: 'Delete'
        });
        if (isConfirmed) {
            await deleteTransaction(id);
            showNotification('success', 'Expense record deleted');
        }
    };

    if (loading) {
        return (
            <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--background)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="animate-sparkle" style={{ fontSize: '2rem', marginBottom: '16px' }}>✨</div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: '800' }}>Re-imagining your cashflow...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="bg-mesh" />

            {/* Premium Header */}
            <header className="dashboard-header fade-in">
                <div>
                    <h1 className="dashboard-title">
                        Expense <span className="title-accent text-glow">Analytics
                            <span className="title-underline" />
                        </span>
                    </h1>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '1rem', marginTop: '8px', fontWeight: '600' }}>Precision tracking for your financial evolution</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="glass-button glow-primary"
                    style={{ padding: '16px 32px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', background: 'linear-gradient(135deg, var(--accent) 0%, #4f46e5 100%)', border: 'none' }}
                >
                    <Plus size={22} strokeWidth={3} /> <span style={{ fontWeight: '900' }}>Record Movement</span>
                </button>
            </header>

            {/* Hero Stats Row */}
            <div className="dashboard-grid mb-xl fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="premium-card p-2xl" style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '32px' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                        <div className="badge-wrapper">
                            <div className="icon-badge" style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', boxShadow: '0 8px 16px rgba(244, 63, 94, 0.2)' }}>
                                <TrendingDown size={24} />
                            </div>
                            <span className="stat-label" style={{ color: '#f43f5e' }}>Monthly Outflow</span>
                        </div>
                        <div className="stat-value" style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 1 }}>
                            ₹{totalMonthlyExpense.toLocaleString()}
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontWeight: '700', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} /> Total Burn for {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div className="stat-label">Daily Average</div>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)' }}>₹{dailyAverage.toFixed(0).toLocaleString()}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '800' }}>Within Threshold</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="stat-label">Most Used Mode</div>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)' }}>UPI / Cash</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: '800' }}>82% of total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visualization Grid */}
            <div className="dashboard-grid mb-xl fade-in" style={{ animationDelay: '0.2s' }}>
                {/* Category Mix */}
                <div className="premium-card p-xl chart-mixed">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--accent)' }}>
                            <PieIcon size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0 }}>Spending Mix</h3>
                    </div>

                    <div style={{ height: '300px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryBreakdown}
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={10}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryBreakdown.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}44)` }} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: 'rgba(2, 6, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                    itemStyle={{ color: '#fff', fontWeight: '700' }}
                                    labelStyle={{ display: 'none' }}
                                    formatter={(v) => [`₹${(v || 0).toLocaleString()}`, 'Spent']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Top Sector</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-primary)' }}>{categoryBreakdown[0]?.name || 'N/A'}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px', justifyContent: 'center' }}>
                        {categoryBreakdown.slice(0, 4).map((cat, idx) => (
                            <div key={idx} style={{ background: 'var(--glass)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                                {cat.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Growth Trend */}
                <div className="premium-card p-xl chart-trend">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--success)' }}>
                                <BarChart3 size={20} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0 }}>Velocity Trend</h3>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Last 6 Periods</span>
                    </div>

                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrend}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={1} />
                                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontWeight: '700' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)', radius: 8 }}
                                    contentStyle={{ background: 'rgba(2, 6, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                                    itemStyle={{ color: '#fff', fontWeight: '700' }}
                                />
                                <Bar
                                    dataKey="amount"
                                    fill="url(#barGradient)"
                                    radius={[10, 10, 10, 10]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Transaction Ledger */}
            <div className="fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="premium-card p-2xl">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '950', margin: 0, letterSpacing: '-1px' }}>Movement Log</h2>

                        <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '300px', maxWidth: '600px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    placeholder="Search by vendor or category..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '14px 16px 14px 48px', borderRadius: '14px', color: '#fff', outline: 'none', fontWeight: '600' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '20px', scrollbarWidth: 'none' }}>
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className="glass-button"
                            style={{ padding: '10px 24px', borderRadius: '14px', background: selectedCategory === 'All' ? 'var(--accent)' : 'var(--glass)', borderColor: selectedCategory === 'All' ? 'var(--accent)' : 'var(--glass-border)', color: '#fff', fontSize: '0.85rem' }}
                        >
                            All
                        </button>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className="glass-button"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '14px', background: selectedCategory === cat.name ? cat.color : 'var(--glass)', borderColor: selectedCategory === cat.name ? cat.color : 'var(--glass-border)', color: '#fff', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredExpenses.length > 0 ? (
                            filteredExpenses.map((ex, idx) => {
                                const catInfo = CATEGORIES.find(c => c.name === ex.category);
                                return (
                                    <div key={ex.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '16px 24px',
                                        background: 'rgba(255,255,255,0.015)',
                                        borderRadius: '24px',
                                        border: '1px solid rgba(255,255,255,0.03)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        animation: `fadeIn 0.5s ease-out ${idx * 0.05}s forwards`,
                                        opacity: 0
                                    }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'scale(1.005)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.015)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flex: 1 }}>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: `${catInfo?.color || '#334155'}15`, color: catInfo?.color || '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `inset 0 0 12px ${catInfo?.color || '#334155'}10` }}>
                                                {catInfo?.icon || <CreditCard size={24} />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>{ex.description}</div>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{ex.category}</span>
                                                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>{new Date(ex.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.75rem', fontWeight: '950', color: '#fff', letterSpacing: '-1px' }}>₹{ex.amount.toLocaleString()}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800' }}>OUTFLOW</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => handleEdit(ex)} className="glass-button" style={{ padding: '10px', borderRadius: '12px', color: 'var(--text-secondary)' }}><Edit3 size={18} /></button>
                                                <button onClick={() => handleDelete(ex.id)} className="glass-button" style={{ padding: '10px', borderRadius: '12px', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.1)' }}><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="premium-card" style={{ padding: '100px', textAlign: 'center', background: 'transparent' }}>
                                <div style={{ color: 'var(--text-tertiary)', marginBottom: '24px', opacity: 0.2 }}><Wallet size={80} /></div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-secondary)' }}>Log clear for these parameters</div>
                                <p style={{ color: 'var(--text-tertiary)', marginTop: '8px' }}>Adjust filters or record a new movement above.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Premium Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="modal-content premium-card shadow-2xl" style={{ width: '100%', maxWidth: '600px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #4f46e5 100%)', padding: '40px', position: 'relative' }}>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={22} /></button>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '950', margin: 0, color: '#fff', letterSpacing: '-2px' }}>{editId ? 'Refine Entry' : 'Manual Entry'}</h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: '8px' }}>Update your fiscal ledger with precision</p>
                        </div>

                        <form onSubmit={handleAction} style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--background)' }}>
                            <div className="flex flex-col gap-xs">
                                <label className="stat-label">Description / Vendor</label>
                                <input
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="e.g. Amazon Fresh, Office Rent"
                                    required
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '18px 24px', borderRadius: '16px', color: '#fff', fontSize: '1.1rem', outline: 'none' }}
                                />
                            </div>

                            <div className="dashboard-grid" style={{ gap: '20px' }}>
                                <div style={{ gridColumn: 'span 6' }} className="flex flex-col gap-xs">
                                    <label className="stat-label">Category</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        required
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '18px 24px', borderRadius: '16px', color: '#fff', fontSize: '1.1rem', outline: 'none', cursor: 'pointer' }}
                                    >
                                        <option value="" style={{ background: '#020617' }}>Select</option>
                                        {CATEGORIES.map(c => <option key={c.name} value={c.name} style={{ background: '#020617' }}>{c.name}</option>)}
                                        <option value="Other" style={{ background: '#020617' }}>Other</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: 'span 6' }} className="flex flex-col gap-xs">
                                    <label className="stat-label">Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '18px 24px', borderRadius: '16px', color: '#fff', fontSize: '1.1rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className="dashboard-grid" style={{ gap: '20px' }}>
                                <div style={{ gridColumn: 'span 6' }} className="flex flex-col gap-xs">
                                    <label className="stat-label">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        required
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '18px 24px', borderRadius: '16px', color: '#fff', fontSize: '1.1rem', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ gridColumn: 'span 6' }} className="flex flex-col gap-xs">
                                    <label className="stat-label">Linked Account</label>
                                    <select
                                        value={accountId}
                                        onChange={e => setAccountId(e.target.value)}
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '18px 24px', borderRadius: '16px', color: '#fff', fontSize: '1.1rem', outline: 'none', cursor: 'pointer' }}
                                    >
                                        <option value="" style={{ background: '#020617' }}>No Account Link</option>
                                        {accounts.map(acc => <option key={acc.id} value={acc.id} style={{ background: '#020617' }}>{acc.name} (₹{acc.balance.toLocaleString()})</option>)}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="glow-primary"
                                style={{ marginTop: '16px', background: 'linear-gradient(135deg, var(--accent) 0%, #4338ca 100%)', color: '#fff', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                            >
                                {editId ? 'Update Record' : 'Commit Movement'} <ArrowRight size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .glass-button:hover {
                    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
                    transform: translateY(-2px);
                }
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 24px;
                }
                .chart-mixed { grid-column: span 5; }
                .chart-trend { grid-column: span 7; }
                @media (max-width: 1024px) {
                    .dashboard-grid > div {
                        grid-column: span 12 !important;
                    }
                }
            `}</style>
        </div>
    );
}
