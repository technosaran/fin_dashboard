"use client";

import { useState, useMemo } from 'react';
import { useFinance, FnoTrade } from '../components/FinanceContext';
import { useNotifications } from '../components/NotificationContext';
import {
    Activity,
    Plus,
    X,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    History,
    PieChart as PieIcon,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Edit3,
    Trash2,
    Zap,
    Briefcase,
    LayoutGrid,
    Clock,
    Trophy,
    Percent,
    ArrowRight
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    AreaChart,
    Area
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#14b8a6'];

export default function FnOClient() {
    const { fnoTrades, addFnoTrade, updateFnoTrade, deleteFnoTrade, loading, accounts } = useFinance();
    const { showNotification, confirm: customConfirm } = useNotifications();

    const [activeTab, setActiveTab] = useState<'positions' | 'history' | 'lifetime'>('positions');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [instrument, setInstrument] = useState('');
    const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
    const [product, setProduct] = useState<'NRML' | 'MIS'>('NRML');
    const [quantity, setQuantity] = useState('');
    const [avgPrice, setAvgPrice] = useState('');
    const [exitPrice, setExitPrice] = useState('');
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
    const [exitDate, setExitDate] = useState('');
    const [status, setStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');
    const [notes, setNotes] = useState('');
    const [accountId, setAccountId] = useState<string>('');

    // Derived Data
    const openPositions = useMemo(() => fnoTrades.filter(t => t.status === 'OPEN'), [fnoTrades]);
    const tradeHistory = useMemo(() => fnoTrades.filter(t => t.status === 'CLOSED'), [fnoTrades]);

    const stats = useMemo(() => {
        const closedTrades = fnoTrades.filter(t => t.status === 'CLOSED');
        const lifetimePnl = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
        const winTrades = closedTrades.filter(t => t.pnl > 0).length;
        const lossTrades = closedTrades.filter(t => t.pnl <= 0).length;
        const winRate = closedTrades.length > 0 ? (winTrades / closedTrades.length) * 100 : 0;

        return { lifetimePnl, winTrades, lossTrades, winRate, totalClosed: closedTrades.length };
    }, [fnoTrades]);

    // Graph Data
    const pnlTrend = useMemo(() => {
        const closed = [...tradeHistory].sort((a, b) => new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime());
        let runningPnl = 0;
        return closed.map(t => {
            runningPnl += t.pnl;
            return { date: t.exitDate, pnl: runningPnl };
        });
    }, [tradeHistory]);

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!instrument || !quantity || !avgPrice) return;

        const qty = parseFloat(quantity);
        const entryP = parseFloat(avgPrice);
        const exitP = exitPrice ? parseFloat(exitPrice) : 0;

        // Simple P&L: (Exit - Entry) * Qty for BUY, (Entry - Exit) * Qty for SELL
        let pnl = 0;
        if (status === 'CLOSED') {
            pnl = tradeType === 'BUY' ? (exitP - entryP) * qty : (entryP - exitP) * qty;
        }

        const tradeData = {
            instrument,
            tradeType,
            product,
            quantity: qty,
            avgPrice: entryP,
            exitPrice: status === 'CLOSED' ? exitP : undefined,
            entryDate,
            exitDate: status === 'CLOSED' ? (exitDate || new Date().toISOString().split('T')[0]) : undefined,
            status,
            pnl,
            notes,
            accountId: accountId ? parseInt(accountId) : undefined
        };

        if (editId) {
            await updateFnoTrade({ ...tradeData, id: editId });
            showNotification('success', 'Trade record updated');
        } else {
            await addFnoTrade(tradeData);
            showNotification('success', 'Trade logged successfully');
        }

        resetForm();
        setIsModalOpen(false);
    };

    const resetForm = () => {
        setInstrument('');
        setTradeType('BUY');
        setProduct('NRML');
        setQuantity('');
        setAvgPrice('');
        setExitPrice('');
        setEntryDate(new Date().toISOString().split('T')[0]);
        setExitDate('');
        setStatus('OPEN');
        setNotes('');
        setAccountId('');
        setEditId(null);
    };

    const handleEdit = (trade: FnoTrade) => {
        setEditId(trade.id);
        setInstrument(trade.instrument);
        setTradeType(trade.tradeType);
        setProduct(trade.product);
        setQuantity(trade.quantity.toString());
        setAvgPrice(trade.avgPrice.toString());
        setExitPrice(trade.exitPrice?.toString() || '');
        setEntryDate(trade.entryDate);
        setExitDate(trade.exitDate || '');
        setStatus(trade.status);
        setNotes(trade.notes || '');
        setAccountId(trade.accountId?.toString() || '');
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="main-content" style={{ background: '#020617', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', color: '#818cf8', fontWeight: '800' }}>Fetching market positions...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '950', margin: 0, letterSpacing: '-2.5px', color: '#fff' }}>FnO Terminal</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px', fontWeight: '600' }}>Derivatives tracking & lifetime analytics</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 12px 24px rgba(99, 102, 241, 0.3)', transition: 'all 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(99, 102, 241, 0.3)'; }}
                >
                    <Plus size={20} strokeWidth={3} /> Log New Trade
                </button>
            </div>

            {/* Quick Stats Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b' }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Lifetime Realized P&L</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '950', color: stats.lifetimePnl >= 0 ? '#10b981' : '#f43f5e' }}>₹{stats.lifetimePnl.toLocaleString()}</div>
                </div>
                <div style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b' }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Win Rate</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '950', color: '#818cf8' }}>{stats.winRate.toFixed(1)}%</div>
                </div>
                <div style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b' }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Active Positions</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '950', color: '#fff' }}>{openPositions.length}</div>
                </div>
                <div style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', border: '1px solid #1e293b' }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Total Trades</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '950', color: '#fff' }}>{fnoTrades.length}</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
                <button onClick={() => setActiveTab('positions')} style={{ background: 'transparent', border: 'none', color: activeTab === 'positions' ? '#fff' : '#475569', fontSize: '1rem', fontWeight: '900', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 'positions' ? '3px solid #6366f1' : 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}>
                    <Zap size={18} /> Positions
                </button>
                <button onClick={() => setActiveTab('history')} style={{ background: 'transparent', border: 'none', color: activeTab === 'history' ? '#fff' : '#475569', fontSize: '1rem', fontWeight: '900', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 'history' ? '3px solid #6366f1' : 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}>
                    <Clock size={18} /> History
                </button>
                <button onClick={() => setActiveTab('lifetime')} style={{ background: 'transparent', border: 'none', color: activeTab === 'lifetime' ? '#fff' : '#475569', fontSize: '1rem', fontWeight: '900', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 'lifetime' ? '3px solid #6366f1' : 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}>
                    <Trophy size={18} /> Lifetime
                </button>
            </div>

            {/* Content Rendering */}
            {activeTab === 'positions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {openPositions.length > 0 ? openPositions.map(trade => (
                        <div key={trade.id} style={{ background: '#0f172a', borderRadius: '20px', border: '1px solid #1e293b', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '900', padding: '4px 8px', borderRadius: '6px', background: trade.tradeType === 'BUY' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', color: trade.tradeType === 'BUY' ? '#10b981' : '#f43f5e' }}>{trade.tradeType}</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '900', padding: '4px 8px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>{trade.product}</span>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>{trade.instrument}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '24px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>
                                    <span>Qty: <b style={{ color: '#cbd5e1' }}>{trade.quantity}</b></span>
                                    <span>Avg: <b style={{ color: '#cbd5e1' }}>₹{trade.avgPrice.toLocaleString()}</b></span>
                                    <span>Entry: <b style={{ color: '#cbd5e1' }}>{new Date(trade.entryDate).toLocaleDateString()}</b></span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => handleEdit(trade)} style={{ background: 'rgba(99, 102, 241, 0.1)', border: 'none', color: '#818cf8', cursor: 'pointer', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Edit3 size={16} /> Exit / Modify
                                </button>
                                <button onClick={async () => { (await customConfirm({ title: 'Delete Trade', message: 'Remove this position?', type: 'error' })) && deleteFnoTrade(trade.id) }} style={{ background: 'rgba(244, 63, 94, 0.05)', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '80px', background: '#0f172a', borderRadius: '32px', border: '1px dotted #1e293b' }}>
                            <Zap size={48} color="#1e293b" style={{ marginBottom: '16px' }} />
                            <div style={{ color: '#475569', fontWeight: '700' }}>No active positions found in your terminal</div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div style={{ background: '#0f172a', borderRadius: '32px', border: '1px solid #1e293b', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <tr>
                                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '900', color: '#64748b' }}>INSTRUMENT</th>
                                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '900', color: '#64748b' }}>QTY</th>
                                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '900', color: '#64748b' }}>BUY/SELL</th>
                                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '900', color: '#64748b' }}>AVG PRICE</th>
                                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '900', color: '#64748b' }}>EXIT PRICE</th>
                                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '900', color: '#64748b' }}>PNL</th>
                                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '900', color: '#64748b' }}>DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tradeHistory.map(trade => (
                                <tr key={trade.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '20px 24px', fontWeight: '800', color: '#fff' }}>{trade.instrument}</td>
                                    <td style={{ padding: '20px 24px', color: '#94a3b8' }}>{trade.quantity}</td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '900', color: trade.tradeType === 'BUY' ? '#10b981' : '#f43f5e' }}>{trade.tradeType}</span>
                                    </td>
                                    <td style={{ padding: '20px 24px', color: '#94a3b8' }}>₹{trade.avgPrice.toLocaleString()}</td>
                                    <td style={{ padding: '20px 24px', color: '#94a3b8' }}>₹{trade.exitPrice?.toLocaleString()}</td>
                                    <td style={{ padding: '20px 24px', fontWeight: '900', color: trade.pnl >= 0 ? '#10b981' : '#f43f5e' }}>₹{trade.pnl.toLocaleString()}</td>
                                    <td style={{ padding: '20px 24px', color: '#475569', fontSize: '0.8rem' }}>{new Date(trade.exitDate!).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'lifetime' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '32px' }}>
                    <div style={{ background: '#0f172a', borderRadius: '32px', border: '1px solid #1e293b', padding: '32px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <TrendingUp size={20} color="#6366f1" /> Equity Curve
                        </h2>
                        <div style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={pnlTrend}>
                                    <defs>
                                        <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} dy={10} />
                                    <RechartsTooltip contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: '16px' }} />
                                    <Area type="monotone" dataKey="pnl" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorPnl)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div style={{ background: '#0f172a', borderRadius: '32px', border: '1px solid #1e293b', padding: '32px' }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>Win/Loss Ratio</h3>
                            <div style={{ height: '200px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={[{ name: 'Wins', value: stats.winTrades }, { name: 'Losses', value: stats.lossTrades }]} innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                                            <Cell fill="#10b981" />
                                            <Cell fill="#f43f5e" />
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '16px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '950', color: '#10b981' }}>{stats.winTrades}</div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '900', color: '#64748b' }}>WINS</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '950', color: '#f43f5e' }}>{stats.lossTrades}</div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '900', color: '#64748b' }}>LOSSES</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: '#0f172a', width: '100%', maxWidth: '560px', borderRadius: '40px', border: '1px solid #334155', padding: '48px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={() => { setIsModalOpen(false); resetForm(); }} style={{ position: 'absolute', top: '32px', right: '32px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>

                        <h2 style={{ fontSize: '2rem', fontWeight: '950', margin: '0 0 32px 0', letterSpacing: '-1.5px' }}>{editId ? 'Manage Position' : 'Log New Context'}</h2>

                        <form onSubmit={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Trading Instrument</label>
                                <input value={instrument} onChange={e => setInstrument(e.target.value)} placeholder="e.g. NIFTY 22FEB 21500 CE" required style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px 20px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Trade Type</label>
                                    <div style={{ display: 'flex', gap: '8px', padding: '4px', background: '#020617', borderRadius: '12px', border: '1px solid #1e293b' }}>
                                        <button type="button" onClick={() => setTradeType('BUY')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: tradeType === 'BUY' ? '#10b981' : 'transparent', color: tradeType === 'BUY' ? '#fff' : '#64748b', fontWeight: '900', cursor: 'pointer' }}>BUY</button>
                                        <button type="button" onClick={() => setTradeType('SELL')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: tradeType === 'SELL' ? '#f43f5e' : 'transparent', color: tradeType === 'SELL' ? '#fff' : '#64748b', fontWeight: '900', cursor: 'pointer' }}>SELL</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Product</label>
                                    <div style={{ display: 'flex', gap: '8px', padding: '4px', background: '#020617', borderRadius: '12px', border: '1px solid #1e293b' }}>
                                        <button type="button" onClick={() => setProduct('NRML')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: product === 'NRML' ? '#6366f1' : 'transparent', color: product === 'NRML' ? '#fff' : '#64748b', fontWeight: '900', cursor: 'pointer' }}>NRML</button>
                                        <button type="button" onClick={() => setProduct('MIS')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: product === 'MIS' ? '#8b5cf6' : 'transparent', color: product === 'MIS' ? '#fff' : '#64748b', fontWeight: '900', cursor: 'pointer' }}>MIS</button>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Quantity (Lots)</label>
                                    <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" required style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px 20px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg. Entry Price</label>
                                    <input type="number" value={avgPrice} onChange={e => setAvgPrice(e.target.value)} placeholder="0.00" required style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px 20px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Status</label>
                                <div style={{ display: 'flex', gap: '8px', padding: '4px', background: '#020617', borderRadius: '12px', border: '1px solid #1e293b' }}>
                                    <button type="button" onClick={() => setStatus('OPEN')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: status === 'OPEN' ? '#fff' : 'transparent', color: status === 'OPEN' ? '#000' : '#64748b', fontWeight: '900', cursor: 'pointer' }}>OPEN POSITION</button>
                                    <button type="button" onClick={() => setStatus('CLOSED')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: status === 'CLOSED' ? '#fff' : 'transparent', color: status === 'CLOSED' ? '#000' : '#64748b', fontWeight: '900', cursor: 'pointer' }}>CLOSED TRADE</button>
                                </div>
                            </div>

                            {status === 'CLOSED' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Exit Price</label>
                                        <input type="number" value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="0.00" style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px 20px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Exit Date</label>
                                        <input type="date" value={exitDate} onChange={e => setExitDate(e.target.value)} style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px 20px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                    </div>
                                </div>
                            )}

                            <button type="submit" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '950', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 15px 30px rgba(99, 102, 241, 0.4)' }}>{editId ? 'Commit Modifications' : 'Add to Terminal'}</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
