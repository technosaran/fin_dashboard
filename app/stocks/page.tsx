"use client";

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from 'recharts';
import { useFinance, Stock, StockTransaction } from '../components/SupabaseFinanceContext';
import {
    TrendingUp,
    TrendingDown,
    Plus,
    X,
    Search,
    Eye,
    DollarSign,
    BarChart3,
    Activity,
    Target,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Star,
    ExternalLink
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function StocksPage() {
    const { stocks, stockTransactions, addStock, updateStock, deleteStock, addStockTransaction, loading } = useFinance();
    const [activeTab, setActiveTab] = useState<'portfolio' | 'transactions'>('portfolio');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'stock' | 'transaction'>('stock');
    const [editId, setEditId] = useState<number | null>(null);

    // Form States
    const [symbol, setSymbol] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [avgPrice, setAvgPrice] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');
    const [sector, setSector] = useState('');
    const [exchange, setExchange] = useState('NSE');

    // Transaction Form States
    const [selectedStockId, setSelectedStockId] = useState<number | ''>('');
    const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY');
    const [transactionQuantity, setTransactionQuantity] = useState('');
    const [transactionPrice, setTransactionPrice] = useState('');
    const [brokerage, setBrokerage] = useState('');
    const [taxes, setTaxes] = useState('');
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const handleStockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol || !companyName || !quantity || !avgPrice || !currentPrice) return;

        const qty = parseInt(quantity);
        const avg = parseFloat(avgPrice);
        const current = parseFloat(currentPrice);
        const investment = qty * avg;
        const currentValue = qty * current;
        const pnl = currentValue - investment;
        const pnlPercentage = (pnl / investment) * 100;

        const stockData = {
            symbol: symbol.toUpperCase(),
            companyName,
            quantity: qty,
            avgPrice: avg,
            currentPrice: current,
            sector: sector || undefined,
            exchange,
            investmentAmount: investment,
            currentValue,
            pnl,
            pnlPercentage
        };

        if (editId !== null) {
            await updateStock({ ...stockData, id: editId });
        } else {
            await addStock(stockData);
        }
        resetStockForm();
        setIsModalOpen(false);
    };

    const handleTransactionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStockId || !transactionQuantity || !transactionPrice) return;

        const qty = parseInt(transactionQuantity);
        const price = parseFloat(transactionPrice);
        const totalAmount = qty * price;

        await addStockTransaction({
            stockId: Number(selectedStockId),
            transactionType,
            quantity: qty,
            price,
            totalAmount,
            brokerage: brokerage ? parseFloat(brokerage) : undefined,
            taxes: taxes ? parseFloat(taxes) : undefined,
            transactionDate,
            notes: notes || undefined
        });

        resetTransactionForm();
        setIsModalOpen(false);
    };

    const resetStockForm = () => {
        setEditId(null);
        setSymbol('');
        setCompanyName('');
        setQuantity('');
        setAvgPrice('');
        setCurrentPrice('');
        setSector('');
        setExchange('NSE');
    };

    const resetTransactionForm = () => {
        setSelectedStockId('');
        setTransactionType('BUY');
        setTransactionQuantity('');
        setTransactionPrice('');
        setBrokerage('');
        setTaxes('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
        setNotes('');
    };

    const openModal = (type: 'stock' | 'transaction') => {
        setModalType(type);
        setIsModalOpen(true);
    };

    // Calculate portfolio metrics
    const totalInvestment = stocks.reduce((sum, stock) => sum + stock.investmentAmount, 0);
    const totalCurrentValue = stocks.reduce((sum, stock) => sum + stock.currentValue, 0);
    const totalPnL = totalCurrentValue - totalInvestment;
    const totalPnLPercentage = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

    // Sector-wise distribution
    const sectorData = stocks.reduce((acc, stock) => {
        const sector = stock.sector || 'Others';
        const existing = acc.find(item => item.sector === sector);
        if (existing) {
            existing.value += stock.currentValue;
            existing.investment += stock.investmentAmount;
        } else {
            acc.push({ 
                sector, 
                value: stock.currentValue, 
                investment: stock.investmentAmount,
                pnl: stock.currentValue - stock.investmentAmount
            });
        }
        return acc;
    }, [] as any[]);

    if (loading) {
        return (
            <div className="main-content" style={{ padding: '40px 60px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading your portfolio...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content" style={{ padding: '40px 60px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>Stock Portfolio</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px' }}>Track your Zerodha investments and market performance</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={() => openModal('transaction')} style={{
                            padding: '14px 28px', borderRadius: '16px', background: '#0f172a', color: '#fff', border: '1px solid #1e293b', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.background = '#1e293b'} onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}>
                            <Activity size={18} color="#10b981" /> Add Transaction
                        </button>
                        <button onClick={() => openModal('stock')} style={{
                            padding: '14px 28px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: 'white', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)', transition: '0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <Plus size={18} strokeWidth={3} /> Add Stock
                        </button>
                    </div>
                </div>

                {/* Portfolio Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '20px', border: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#6366f1' }}>
                            <DollarSign size={18} />
                            <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Investment</span>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>₹{totalInvestment.toLocaleString()}</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '20px', border: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#10b981' }}>
                            <TrendingUp size={18} />
                            <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>Current Value</span>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>₹{totalCurrentValue.toLocaleString()}</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '20px', border: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: totalPnL >= 0 ? '#34d399' : '#f87171' }}>
                            {totalPnL >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                            <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>P&L</span>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: totalPnL >= 0 ? '#34d399' : '#f87171' }}>
                            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
                        </div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '20px', border: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: totalPnLPercentage >= 0 ? '#34d399' : '#f87171' }}>
                            <Zap size={18} />
                            <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>Returns</span>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: totalPnLPercentage >= 0 ? '#34d399' : '#f87171' }}>
                            {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', background: '#0f172a', padding: '6px', borderRadius: '16px', border: '1px solid #1e293b', marginBottom: '32px', width: 'fit-content' }}>
                    {[
                        { id: 'portfolio', label: 'Portfolio', icon: <BarChart3 size={18} /> },
                        { id: 'transactions', label: 'Transactions', icon: <Activity size={18} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'portfolio' | 'transactions')}
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
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'portfolio' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                        {/* Holdings List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, marginBottom: '16px' }}>Your Holdings</h3>
                            {stocks.length > 0 ? stocks.map((stock, idx) => (
                                <div key={stock.id} style={{
                                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                    padding: '24px',
                                    borderRadius: '20px',
                                    border: '1px solid #1e293b',
                                    transition: 'all 0.3s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{stock.symbol}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>{stock.companyName}</div>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#475569' }}>
                                                <span>Qty: {stock.quantity}</span>
                                                <span>Avg: ₹{stock.avgPrice.toFixed(2)}</span>
                                                <span>LTP: ₹{stock.currentPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>₹{stock.currentValue.toLocaleString()}</div>
                                            <div style={{ 
                                                fontSize: '0.9rem', 
                                                fontWeight: '700', 
                                                color: stock.pnl >= 0 ? '#34d399' : '#f87171',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                justifyContent: 'flex-end'
                                            }}>
                                                {stock.pnl >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                {stock.pnl >= 0 ? '+' : ''}₹{stock.pnl.toFixed(2)} ({stock.pnlPercentage.toFixed(2)}%)
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        width: '100%', 
                                        height: '4px', 
                                        background: '#1e293b', 
                                        borderRadius: '2px', 
                                        overflow: 'hidden' 
                                    }}>
                                        <div style={{ 
                                            width: `${Math.abs(stock.pnlPercentage)}%`, 
                                            height: '100%', 
                                            background: stock.pnl >= 0 ? '#34d399' : '#f87171',
                                            borderRadius: '2px'
                                        }} />
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding: '60px', textAlign: 'center', color: '#475569', border: '2px dashed #1e293b', borderRadius: '20px' }}>
                                    <TrendingUp size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>No stocks in portfolio</div>
                                    <div style={{ fontSize: '0.9rem' }}>Add your first stock to start tracking your investments</div>
                                </div>
                            )}
                        </div>

                        {/* Charts Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Sector Distribution */}
                            <div style={{ 
                                background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', 
                                padding: '24px', 
                                borderRadius: '20px', 
                                border: '1px solid #1e293b'
                            }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, marginBottom: '16px' }}>Sector Distribution</h4>
                                <div style={{ height: '200px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={sectorData} 
                                                cx="50%" 
                                                cy="50%" 
                                                innerRadius={40} 
                                                outerRadius={80} 
                                                paddingAngle={2} 
                                                dataKey="value" 
                                                nameKey="sector"
                                            >
                                                {sectorData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ 
                                                    background: '#020617', 
                                                    border: '1px solid #334155', 
                                                    borderRadius: '8px', 
                                                    padding: '8px'
                                                }}
                                                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Value']}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Top Performers */}
                            <div style={{ 
                                background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', 
                                padding: '24px', 
                                borderRadius: '20px', 
                                border: '1px solid #1e293b'
                            }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, marginBottom: '16px' }}>Top Performers</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {stocks
                                        .sort((a, b) => b.pnlPercentage - a.pnlPercentage)
                                        .slice(0, 3)
                                        .map((stock, idx) => (
                                        <div key={stock.id} style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '8px'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{stock.symbol}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{stock.sector}</div>
                                            </div>
                                            <div style={{ 
                                                fontSize: '0.8rem', 
                                                fontWeight: '700', 
                                                color: stock.pnl >= 0 ? '#34d399' : '#f87171' 
                                            }}>
                                                {stock.pnl >= 0 ? '+' : ''}{stock.pnlPercentage.toFixed(2)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Transaction History</h3>
                        {stockTransactions.length > 0 ? stockTransactions.map((transaction) => {
                            const stock = stocks.find(s => s.id === transaction.stockId);
                            return (
                                <div key={transaction.id} style={{
                                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '1px solid #1e293b',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
                                            {stock?.symbol || 'Unknown'} - {transaction.transactionType}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                                            {transaction.quantity} shares @ ₹{transaction.price.toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#475569' }}>
                                            {new Date(transaction.transactionDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ 
                                            fontSize: '1.1rem', 
                                            fontWeight: '800', 
                                            color: transaction.transactionType === 'BUY' ? '#f87171' : '#34d399' 
                                        }}>
                                            {transaction.transactionType === 'BUY' ? '-' : '+'}₹{transaction.totalAmount.toLocaleString()}
                                        </div>
                                        {(transaction.brokerage || transaction.taxes) && (
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                Charges: ₹{((transaction.brokerage || 0) + (transaction.taxes || 0)).toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#475569', border: '2px dashed #1e293b', borderRadius: '20px' }}>
                                <Activity size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>No transactions yet</div>
                                <div style={{ fontSize: '0.9rem' }}>Your buy/sell transactions will appear here</div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Modals */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#0f172a', padding: '32px', borderRadius: '24px', border: '1px solid #334155', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>
                                {modalType === 'stock' && 'Add Stock'}
                                {modalType === 'transaction' && 'Add Transaction'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {modalType === 'stock' && (
                            <form onSubmit={handleStockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Symbol</label>
                                        <input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="e.g. RELIANCE" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Exchange</label>
                                        <select value={exchange} onChange={e => setExchange(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}>
                                            <option value="NSE">NSE</option>
                                            <option value="BSE">BSE</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Company Name</label>
                                    <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Reliance Industries Ltd" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Sector</label>
                                    <input value={sector} onChange={e => setSector(e.target.value)} placeholder="e.g. Oil & Gas" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Quantity</label>
                                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="10" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Avg Price</label>
                                        <input type="number" step="0.01" value={avgPrice} onChange={e => setAvgPrice(e.target.value)} placeholder="2450.00" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Current Price</label>
                                        <input type="number" step="0.01" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} placeholder="2520.00" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                                    </div>
                                </div>
                                <button type="submit" style={{ marginTop: '8px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#fff', padding: '16px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>
                                    Add Stock
                                </button>
                            </form>
                        )}

                        {modalType === 'transaction' && (
                            <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Stock</label>
                                    <select value={selectedStockId} onChange={e => setSelectedStockId(Number(e.target.value))} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}>
                                        <option value="" disabled>Select Stock</option>
                                        {stocks.map(stock => (
                                            <option key={stock.id} value={stock.id}>{stock.symbol} - {stock.companyName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Type</label>
                                        <select value={transactionType} onChange={e => setTransactionType(e.target.value as 'BUY' | 'SELL')} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}>
                                            <option value="BUY">BUY</option>
                                            <option value="SELL">SELL</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Date</label>
                                        <input type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Quantity</label>
                                        <input type="number" value={transactionQuantity} onChange={e => setTransactionQuantity(e.target.value)} placeholder="10" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Price</label>
                                        <input type="number" step="0.01" value={transactionPrice} onChange={e => setTransactionPrice(e.target.value)} placeholder="2450.00" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Brokerage</label>
                                        <input type="number" step="0.01" value={brokerage} onChange={e => setBrokerage(e.target.value)} placeholder="20.00" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Taxes</label>
                                        <input type="number" step="0.01" value={taxes} onChange={e => setTaxes(e.target.value)} placeholder="15.00" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Notes</label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={3} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }} />
                                </div>
                                <button type="submit" style={{ marginTop: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', padding: '16px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>
                                    Add Transaction
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}