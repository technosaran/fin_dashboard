"use client";

import { useState, useEffect } from 'react';
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
    ExternalLink,
    Loader2,
    History,
    Calendar,
    Wallet
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function StocksPage() {
    const { accounts, stocks, stockTransactions, addStock, updateStock, deleteStock, addStockTransaction, loading } = useFinance();
    const [activeTab, setActiveTab] = useState<'portfolio' | 'history' | 'lifetime'>('portfolio');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'stock' | 'transaction'>('stock');
    const [editId, setEditId] = useState<number | null>(null);

    // Live Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isFetchingQuote, setIsFetchingQuote] = useState(false);

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
    const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 2) {
                handleSearch(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        try {
            const res = await fetch(`/api/stocks/search?q=${query}`);
            const data = await res.json();
            setSearchResults(data);
            setShowResults(true);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectStock = async (item: any) => {
        setSymbol(item.symbol);
        setCompanyName(item.companyName);
        setShowResults(false);
        setSearchQuery(item.symbol);

        // Fetch real-time quote
        setIsFetchingQuote(true);
        try {
            const res = await fetch(`/api/stocks/quote?symbol=${item.symbol}`);
            const data = await res.json();
            if (!data.error) {
                setCurrentPrice(data.currentPrice.toString());
                setExchange(data.exchange.includes('BSE') ? 'BSE' : 'NSE');
            }
        } catch (error) {
            console.error('Quote fetch failed:', error);
        } finally {
            setIsFetchingQuote(false);
        }
    };

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
            notes: notes || undefined,
            accountId: selectedAccountId ? Number(selectedAccountId) : undefined
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
        setSearchQuery('');
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
        setSelectedAccountId('');
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

    // Lifetime Metrics Calculation
    const totalBuys = stockTransactions.filter(t => t.transactionType === 'BUY').reduce((sum, t) => sum + t.totalAmount, 0);
    const totalSells = stockTransactions.filter(t => t.transactionType === 'SELL').reduce((sum, t) => sum + t.totalAmount, 0);
    const totalCharges = stockTransactions.reduce((sum, t) => sum + (t.brokerage || 0) + (t.taxes || 0), 0);

    // Lifetime Earned = (Total Sells + Current Value) - (Total Buys + Total Charges)
    const lifetimeEarned = (totalSells + totalCurrentValue) - (totalBuys + totalCharges);
    const lifetimeReturnPercentage = totalBuys > 0 ? (lifetimeEarned / totalBuys) * 100 : 0;

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
                        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px' }}>Real-time market insights and lifetime performance tracking</p>
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
                            <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>Inv. Capital</span>
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
                            <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>Unrealized Gain</span>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: totalPnL >= 0 ? '#34d399' : '#f87171' }}>
                            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
                        </div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', padding: '24px', borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'rgba(255,255,255,0.8)' }}>
                            <Zap size={18} />
                            <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>Lifetime Wealth Created</span>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>
                            ₹{lifetimeEarned.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', background: '#0f172a', padding: '6px', borderRadius: '16px', border: '1px solid #1e293b', marginBottom: '32px', width: 'fit-content' }}>
                    {[
                        { id: 'portfolio', label: 'Holdings', icon: <BarChart3 size={18} /> },
                        { id: 'history', label: 'History', icon: <History size={18} /> },
                        { id: 'lifetime', label: 'Lifetime', icon: <Star size={18} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
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
                                            width: `${Math.min(100, Math.max(0, stock.pnlPercentage + 50))}%`,
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
                            <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '20px', border: '1px solid #1e293b' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, marginBottom: '16px' }}>Sector Distribution</h4>
                                <div style={{ height: '200px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={sectorData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="sector">
                                                {sectorData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: '8px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '20px', border: '1px solid #1e293b' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, marginBottom: '16px' }}>Top Performers</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {stocks.sort((a, b) => b.pnlPercentage - a.pnlPercentage).slice(0, 3).map((stock) => (
                                        <div key={stock.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{stock.symbol}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{stock.sector}</div>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: stock.pnl >= 0 ? '#34d399' : '#f87171' }}>
                                                {stock.pnl >= 0 ? '+' : ''}{stock.pnlPercentage.toFixed(2)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Global Transaction History</h3>
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
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{
                                            background: transaction.transactionType === 'BUY' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: transaction.transactionType === 'BUY' ? '#f87171' : '#10b981',
                                            padding: '12px',
                                            borderRadius: '14px'
                                        }}>
                                            {transaction.transactionType === 'BUY' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
                                                {stock?.symbol || 'Unknown'} • {transaction.transactionType}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                                                {transaction.quantity} shares @ ₹{transaction.price.toFixed(2)}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={12} /> {new Date(transaction.transactionDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontSize: '1.2rem',
                                            fontWeight: '900',
                                            color: transaction.transactionType === 'BUY' ? '#f87171' : '#34d399'
                                        }}>
                                            {transaction.transactionType === 'BUY' ? '-' : '+'}₹{transaction.totalAmount.toLocaleString()}
                                        </div>
                                        {(transaction.brokerage || transaction.taxes) && (
                                            <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '4px' }}>
                                                Charges: ₹{((transaction.brokerage || 0) + (transaction.taxes || 0)).toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#475569', border: '2px dashed #1e293b', borderRadius: '20px' }}>
                                <History size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>No transactions recorded</div>
                                <div style={{ fontSize: '0.9rem' }}>Your trading activities will appear here chronologically</div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'lifetime' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                        <div style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '32px', border: '1px solid #1e293b', padding: '40px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Star color="#f59e0b" fill="#f59e0b" size={24} /> Lifetime Wealth Report
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '48px' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Total Money Inflow</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '950', color: '#fff' }}>₹{totalBuys.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '8px' }}>Combined value of all BUY orders</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Total Lifetime Gains</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '950', color: lifetimeEarned >= 0 ? '#10b981' : '#ef4444' }}>
                                        {lifetimeEarned >= 0 ? '+' : ''}₹{lifetimeEarned.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '8px' }}>Absolute profit after all charges</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Total Withdrawals</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{totalSells.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Regulatory Charges</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ef4444' }}>₹{totalCharges.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>XIRR Equivalent</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>{lifetimeReturnPercentage.toFixed(2)}%</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#0f172a', borderRadius: '32px', border: '1px solid #1e293b', padding: '32px' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '24px' }}>Asset Breakdown</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {stocks.slice(0, 5).map(stock => (
                                    <div key={stock.id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                            <span style={{ fontWeight: '700' }}>{stock.symbol}</span>
                                            <span style={{ color: '#94a3b8' }}>₹{stock.currentValue.toLocaleString()}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: '#020617', borderRadius: '100px', overflow: 'hidden' }}>
                                            <div style={{ width: `${(stock.currentValue / totalCurrentValue) * 100}%`, height: '100%', background: '#6366f1', borderRadius: '100px' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#818cf8', marginBottom: '4px' }}>Portfolio Diversity</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '900' }}>High Performance</div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Modals (Keep Existing) */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#0f172a', padding: '32px', borderRadius: '24px', border: '1px solid #334155', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                    {modalType === 'stock' ? <TrendingUp size={20} /> : <Activity size={20} />}
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>
                                    {modalType === 'stock' && (editId ? 'Edit Stock' : 'Add Stock')}
                                    {modalType === 'transaction' && 'Add Transaction'}
                                </h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {modalType === 'stock' && (
                            <form onSubmit={handleStockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ position: 'relative' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Search Stock</label>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or symbol..." style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px 12px 12px 40px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} onFocus={() => setShowResults(true)} />
                                        {isSearching && <Loader2 size={18} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />}
                                    </div>
                                    {showResults && searchResults.length > 0 && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', marginTop: '8px', zIndex: 1100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                                            {searchResults.map((item, idx) => (
                                                <div key={idx} onClick={() => selectStock(item)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #1e293b' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>{item.symbol}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.companyName} ({item.exchange})</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Symbol</label>
                                        <input value={symbol} readOnly style={{ width: '100%', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#94a3b8', fontSize: '0.9rem' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Exchange</label>
                                        <select value={exchange} onChange={e => setExchange(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff' }}>
                                            <option value="NSE">NSE</option>
                                            <option value="BSE">BSE</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Quantity</label>
                                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Avg Price</label>
                                        <input type="number" step="0.01" value={avgPrice} onChange={e => setAvgPrice(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>LTP</label>
                                        <input type="number" step="0.01" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff' }} />
                                    </div>
                                </div>
                                <button type="submit" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#fff', padding: '16px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                                    {editId ? 'Update Stock' : 'Add Stock'}
                                </button>
                            </form>
                        )}

                        {modalType === 'transaction' && (
                            <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Select Security</label>
                                    <select value={selectedStockId} onChange={e => setSelectedStockId(Number(e.target.value))} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff' }}>
                                        <option value="" disabled>Select Stock</option>
                                        {stocks.map(stock => <option key={stock.id} value={stock.id}>{stock.symbol} - {stock.companyName}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Type</label>
                                        <select value={transactionType} onChange={e => setTransactionType(e.target.value as 'BUY' | 'SELL')} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff' }}>
                                            <option value="BUY">BUY</option>
                                            <option value="SELL">SELL</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Quantity</label>
                                        <input type="number" value={transactionQuantity} onChange={e => setTransactionQuantity(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Execution Price</label>
                                        <input type="number" step="0.01" value={transactionPrice} onChange={e => setTransactionPrice(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Date</label>
                                        <input type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Operating Bank Account</label>
                                    <select value={selectedAccountId} onChange={e => setSelectedAccountId(Number(e.target.value))} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', color: '#fff' }}>
                                        <option value="">No Account (Ledger Only)</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name} - ₹{acc.balance.toLocaleString()}</option>
                                        ))}
                                    </select>
                                    <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '6px' }}>Money will be {transactionType === 'BUY' ? 'deducted from' : 'added to'} this account.</p>
                                </div>
                                <button type="submit" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', padding: '16px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                                    Confirm Transaction
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}