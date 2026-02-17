'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '../components/NotificationContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinance } from '../components/FinanceContext';
import { Stock } from '@/lib/types';
import { calculateStockCharges } from '@/lib/utils/charges';
import { logError } from '@/lib/utils/logger';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Search,
  DollarSign,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Star,
  Loader2,
  History,
  Calendar,
  Edit3,
  Trash2,
  ArrowRight,
  Eye,
  PieChart as PieChartIcon,
  AlertTriangle,
} from 'lucide-react';
import { EmptyPortfolioVisual } from '../components/Visuals';

const COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
];

export default function StocksClient() {
  const {
    accounts,
    stocks,
    stockTransactions,
    addStock,
    updateStock,
    deleteStock,
    addStockTransaction,
    deleteStockTransaction,
    settings,
    loading,
    refreshLivePrices,
  } = useFinance();
  const { showNotification, confirm: customConfirm } = useNotifications();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'history' | 'lifetime' | 'allocation'>(
    'portfolio'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'stock' | 'transaction'>('stock');
  const [editId, setEditId] = useState<number | null>(null);
  type ChargeViewData = Pick<Stock, 'symbol' | 'quantity' | 'currentPrice'>;
  const [viewingCharges, setViewingCharges] = useState<{
    type: 'stock' | 'mf' | 'bond';
    data: ChargeViewData;
  } | null>(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ symbol: string; companyName: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form States
  const [symbol, setSymbol] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
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
      logError('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectStock = async (item: { symbol: string; companyName: string }) => {
    setSymbol(item.symbol);
    setCompanyName(item.companyName);
    setShowResults(false);
    setSearchQuery(item.symbol);

    // Fetch real-time quote
    try {
      const res = await fetch(`/api/stocks/quote?symbol=${item.symbol}`);
      const data = await res.json();
      if (!data.error) {
        setCurrentPrice(data.currentPrice.toString());
        setPreviousPrice(data.previousClose || data.currentPrice);
        setExchange(data.exchange.includes('BSE') ? 'BSE' : 'NSE');
      }
    } catch (error) {
      logError('Quote fetch failed:', error);
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
      symbol: symbol.trim().toUpperCase(),
      companyName,
      quantity: qty,
      avgPrice: avg,
      currentPrice: current,
      previousPrice: previousPrice || current,
      sector: sector || undefined,
      exchange,
      investmentAmount: investment,
      currentValue,
      pnl,
      pnlPercentage,
    };

    try {
      if (editId !== null) {
        await updateStock(editId, stockData);
        showNotification('success', `${symbol} updated successfully`);
      } else {
        // Check for existing stock with same symbol to merge (Cost Averaging)
        const existingStock = stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
        if (existingStock) {
          const totalQty = existingStock.quantity + qty;
          const totalInvestment = existingStock.quantity * existingStock.avgPrice + qty * avg;
          const newAvg = totalInvestment / totalQty;

          // Merge into existing stock
          await updateStock(existingStock.id, {
            quantity: totalQty,
            avgPrice: newAvg,
            investmentAmount: totalInvestment,
            currentPrice: current, // Use latest price from form
            currentValue: totalQty * current,
            pnl: totalQty * current - totalInvestment,
            pnlPercentage: ((totalQty * current - totalInvestment) / totalInvestment) * 100,
            previousPrice: previousPrice || existingStock.previousPrice, // Keep existing if new one is missing
          });
          showNotification(
            'success',
            `Merged with existing ${symbol} holding. New Average: ₹${newAvg.toFixed(2)}`
          );
        } else {
          await addStock(stockData);
          showNotification('success', `${symbol} added to portfolio`);
        }
      }
      resetStockForm();
      setIsModalOpen(false);
    } catch {
      showNotification('error', 'Failed to save stock. Please try again.');
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockId || !transactionQuantity || !transactionPrice) return;

    const qty = parseInt(transactionQuantity);
    const price = parseFloat(transactionPrice);
    const totalAmount = qty * price;

    let finalBrokerage = brokerage ? parseFloat(brokerage) : undefined;
    let finalTaxes = taxes ? parseFloat(taxes) : undefined;

    if (settings.autoCalculateCharges && qty && price) {
      const calculatedCharges = calculateStockCharges(transactionType, qty, price, settings);
      finalBrokerage = calculatedCharges.brokerage;
      finalTaxes = calculatedCharges.taxes;
    }

    try {
      await addStockTransaction({
        stockId: Number(selectedStockId),
        transactionType,
        quantity: qty,
        price,
        totalAmount,
        brokerage: finalBrokerage,
        taxes: finalTaxes,
        transactionDate,
        notes: notes || undefined,
        accountId: selectedAccountId ? Number(selectedAccountId) : undefined,
      });

      showNotification('success', `Transaction recorded: ${transactionType} ${qty} shares`);
      resetTransactionForm();
      setIsModalOpen(false);
    } catch {
      showNotification('error', 'Failed to record transaction. Please try again.');
    }
  };

  const resetStockForm = () => {
    setEditId(null);
    setSymbol('');
    setCompanyName('');
    setQuantity('');
    setAvgPrice('');
    setCurrentPrice('');
    setPreviousPrice(null);
    setSector('');
    setExchange('NSE');
    setSearchQuery('');
  };

  const handleEditStock = (stock: Stock) => {
    setModalType('stock');
    setEditId(stock.id);
    setSymbol(stock.symbol);
    setCompanyName(stock.companyName);
    setQuantity(stock.quantity.toString());
    setAvgPrice(stock.avgPrice.toString());
    setCurrentPrice(stock.currentPrice.toString());
    setPreviousPrice(stock.previousPrice || stock.currentPrice);
    setSector(stock.sector || '');
    setExchange(stock.exchange);
    setIsModalOpen(true);
  };

  const handleExitStock = (stock: Stock) => {
    setModalType('transaction');
    setSelectedStockId(stock.id);
    setTransactionType('SELL');
    setTransactionQuantity(stock.quantity.toString());
    setTransactionPrice(stock.currentPrice.toString());
    setIsModalOpen(true);
  };

  const resetTransactionForm = () => {
    setSelectedStockId('');
    setTransactionType('BUY');
    setTransactionQuantity('');
    setTransactionPrice('');
    setBrokerage('');
    setTaxes('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setSelectedAccountId(settings.defaultStockAccountId || '');
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
  const totalDayPnL = stocks.reduce((sum, stock) => {
    const dayChange =
      (stock.currentPrice - (stock.previousPrice || stock.currentPrice)) * stock.quantity;
    return sum + dayChange;
  }, 0);

  // Lifetime Metrics Calculation
  const totalBuys = stockTransactions
    .filter((t) => t.transactionType === 'BUY')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  const totalSells = stockTransactions
    .filter((t) => t.transactionType === 'SELL')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  const totalCharges = stockTransactions.reduce(
    (sum, t) => sum + (t.brokerage || 0) + (t.taxes || 0),
    0
  );

  // Lifetime Earned = (Total Sells + Current Value) - (Total Buys + Total Charges)
  const lifetimeEarned = totalSells + totalCurrentValue - (totalBuys + totalCharges);
  const lifetimeReturnPercentage = totalBuys > 0 ? (lifetimeEarned / totalBuys) * 100 : 0;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshLivePrices();
    setIsRefreshing(false);
    showNotification('success', 'Market prices refreshed');
  };

  // Sector-wise distribution
  const sectorData = stocks.reduce(
    (acc, stock) => {
      const sector = stock.sector || 'Others';
      const existing = acc.find((item) => item.sector === sector);
      if (existing) {
        existing.value += stock.currentValue;
        existing.investment += stock.investmentAmount;
      } else {
        acc.push({
          sector,
          value: stock.currentValue,
          investment: stock.investmentAmount,
          pnl: stock.currentValue - stock.investmentAmount,
        });
      }
      return acc;
    },
    [] as Array<{ sector: string; value: number; investment: number; pnl: number }>
  );

  if (loading) {
    return (
      <div
        className="main-content"
        style={{
          padding: '40px 60px',
          backgroundColor: '#020617',
          minHeight: '100vh',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading your portfolio...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header Section */}
      <div
        className="flex-col-mobile"
        style={{
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          gap: '20px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: '900',
              margin: 0,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Stock Portfolio
          </h1>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            style={{
              padding: '12px',
              borderRadius: '14px',
              background: '#0f172a',
              color: isRefreshing ? '#64748b' : '#818cf8',
              border: '1px solid #1e293b',
              cursor: isRefreshing ? 'wait' : 'pointer',
              transition: '0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            title="Refresh Markets"
          >
            <Zap
              size={20}
              className={isRefreshing ? 'spin-animation' : ''}
              fill={isRefreshing ? 'none' : 'currentColor'}
            />
          </button>
          <button
            onClick={() => openModal('stock')}
            style={{
              padding: '10px 20px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              color: 'white',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)',
              transition: '0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Plus size={18} strokeWidth={3} /> <span className="hide-sm">Add Stock</span>
            <span className="show-sm-inline hide-sm-none">Add</span>
          </button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid-responsive-4" style={{ marginBottom: '32px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '24px',
            borderRadius: '20px',
            border: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
              color: '#6366f1',
            }}
          >
            <DollarSign size={18} />
            <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Inv. Capital
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>
            ₹{totalInvestment.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '24px',
            borderRadius: '20px',
            border: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
              color: '#10b981',
            }}
          >
            <TrendingUp size={18} />
            <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Current Value
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>
            ₹{totalCurrentValue.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '24px',
            borderRadius: '20px',
            border: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
              color: totalDayPnL >= 0 ? '#34d399' : '#f87171',
            }}
          >
            <Activity size={18} />
            <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Day&apos;s P&L
            </span>
          </div>
          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: '900',
              color: totalDayPnL >= 0 ? '#34d399' : '#f87171',
            }}
          >
            {totalDayPnL >= 0 ? '+' : ''}₹
            {totalDayPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '24px',
            borderRadius: '20px',
            border: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
              color: totalPnL >= 0 ? '#34d399' : '#f87171',
            }}
          >
            {totalPnL >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
            <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Unrealized Gain
            </span>
          </div>
          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: '900',
              color: totalPnL >= 0 ? '#34d399' : '#f87171',
            }}
          >
            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
          </div>
        </div>
        {activeTab === 'lifetime' && (
          <div
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              padding: '24px',
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              <Zap size={18} />
              <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Lifetime Wealth
              </span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>
              ₹{lifetimeEarned.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          background: '#0f172a',
          padding: '6px',
          borderRadius: '16px',
          border: '1px solid #1e293b',
          marginBottom: '32px',
          width: 'fit-content',
        }}
      >
        {[
          { id: 'portfolio', label: 'Holdings', icon: <BarChart3 size={18} /> },
          { id: 'allocation', label: 'Allocation', icon: <PieChartIcon size={18} /> },
          { id: 'history', label: 'History', icon: <History size={18} /> },
          { id: 'lifetime', label: 'Lifetime', icon: <Star size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(tab.id as 'portfolio' | 'allocation' | 'history' | 'lifetime')
            }
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
              transition: 'all 0.2s',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'portfolio' && (
        <div className="fade-in">
          {/* Mobile Card View */}
          <div className="mobile-card-list">
            {stocks.length > 0 ? (
              stocks.map((stock, idx) => (
                <div
                  key={stock.id}
                  className="premium-card"
                  style={{
                    padding: '16px',
                    background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                    borderLeft: `4px solid ${COLORS[idx % COLORS.length]}`,
                  }}
                  onClick={() => handleEditStock(stock)}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#fff' }}>
                        {stock.symbol}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>
                        {stock.exchange}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>
                        Current Value
                      </div>
                      <div style={{ fontWeight: '900', color: '#fff' }}>
                        ₹{stock.currentValue.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginBottom: '16px',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '12px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        Avg. Cost
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                        ₹{stock.avgPrice.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        LTP
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                        ₹{stock.currentPrice.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        Quantity
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{stock.quantity}</div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        Total P&L
                      </div>
                      <div
                        style={{
                          fontWeight: '900',
                          fontSize: '1rem',
                          color: stock.pnl >= 0 ? '#10b981' : '#f43f5e',
                        }}
                      >
                        {stock.pnl >= 0 ? '+' : ''}₹{stock.pnl.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div
                        style={{
                          color:
                            stock.currentPrice - (stock.previousPrice || stock.currentPrice) >= 0
                              ? '#10b981'
                              : '#f43f5e',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        Day:{' '}
                        {stock.currentPrice - (stock.previousPrice || stock.currentPrice) >= 0
                          ? '+'
                          : ''}
                        {(
                          (stock.currentPrice - (stock.previousPrice || stock.currentPrice)) *
                          stock.quantity
                        ).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingCharges({ type: 'stock', data: stock });
                        }}
                        style={{
                          color: '#6366f1',
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                        }}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExitStock(stock);
                        }}
                        style={{
                          color: '#10b981',
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                        }}
                      >
                        <ArrowRight size={18} />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const isConfirmed = await customConfirm({
                            title: 'Delete',
                            message: `Remove ${stock.symbol}?`,
                            type: 'error',
                            confirmLabel: 'Delete',
                          });
                          if (isConfirmed) await deleteStock(stock.id);
                        }}
                        style={{
                          color: '#f43f5e',
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                <EmptyPortfolioVisual />
                <div style={{ fontWeight: '700', marginTop: '20px' }}>No holdings found</div>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="premium-card hide-mobile" style={{ padding: '0', overflow: 'hidden' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.9rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid #1e293b',
                  }}
                >
                  <th
                    style={{
                      padding: '16px 24px',
                      color: '#64748b',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                    }}
                  >
                    Instrument
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      color: '#64748b',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      textAlign: 'right',
                    }}
                  >
                    Qty.
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      color: '#64748b',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      textAlign: 'right',
                    }}
                  >
                    Avg. cost
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      color: '#64748b',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      textAlign: 'right',
                    }}
                  >
                    LTP
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      color: '#64748b',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      textAlign: 'right',
                    }}
                  >
                    Cur. value
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      color: '#64748b',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      textAlign: 'right',
                    }}
                  >
                    Day&apos;s P&L
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      color: '#64748b',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      textAlign: 'right',
                    }}
                  >
                    P&L
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      color: '#64748b',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      textAlign: 'right',
                    }}
                  >
                    Net chg.
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      color: '#64748b',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      textAlign: 'center',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stocks.length > 0 ? (
                  stocks.map((stock) => (
                    <tr
                      key={stock.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.02)',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'rgba(255,255,255,0.01)')
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '800', color: '#fff' }}>{stock.symbol}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {stock.exchange}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '16px 24px',
                          textAlign: 'right',
                          fontWeight: '700',
                          color: '#94a3b8',
                        }}
                      >
                        {stock.quantity}
                      </td>
                      <td
                        style={{
                          padding: '16px 24px',
                          textAlign: 'right',
                          fontWeight: '700',
                          color: '#94a3b8',
                        }}
                      >
                        ₹{stock.avgPrice.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: '16px 24px',
                          textAlign: 'right',
                          fontWeight: '700',
                          color: '#fff',
                        }}
                      >
                        ₹{stock.currentPrice.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: '16px 24px',
                          textAlign: 'right',
                          fontWeight: '700',
                          color: '#fff',
                        }}
                      >
                        ₹{stock.currentValue.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div
                          style={{
                            fontWeight: '800',
                            color:
                              stock.currentPrice - (stock.previousPrice || stock.currentPrice) >= 0
                                ? '#10b981'
                                : '#f43f5e',
                          }}
                        >
                          {stock.currentPrice - (stock.previousPrice || stock.currentPrice) >= 0
                            ? '+'
                            : ''}
                          ₹
                          {(
                            (stock.currentPrice - (stock.previousPrice || stock.currentPrice)) *
                            stock.quantity
                          ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          <div style={{ fontSize: '0.65rem', fontWeight: '600', opacity: 0.8 }}>
                            (
                            {stock.previousPrice
                              ? (
                                  ((stock.currentPrice - stock.previousPrice) /
                                    stock.previousPrice) *
                                  100
                                ).toFixed(2)
                              : '0.00'}
                            %)
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '16px 24px',
                          textAlign: 'right',
                          fontWeight: '800',
                          color: stock.pnl >= 0 ? '#10b981' : '#f43f5e',
                        }}
                      >
                        {stock.pnl >= 0 ? '+' : ''}₹{stock.pnl.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div
                          style={{
                            color: stock.pnl >= 0 ? '#10b981' : '#f43f5e',
                            fontWeight: '900',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '4px',
                          }}
                        >
                          {stock.pnlPercentage.toFixed(2)}%
                          {stock.pnl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingCharges({ type: 'stock', data: stock });
                            }}
                            title="Estimated Exit Charges"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#6366f1',
                              cursor: 'pointer',
                              padding: '4px',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExitStock(stock);
                            }}
                            title="Exit / Sell"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#10b981',
                              cursor: 'pointer',
                              padding: '4px',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                          >
                            <ArrowRight size={16} strokeWidth={3} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStock(stock);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer',
                              padding: '4px',
                              transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const isConfirmed = await customConfirm({
                                title: 'Delete Stock',
                                message: `Remove ${stock.symbol}?`,
                                type: 'error',
                                confirmLabel: 'Delete',
                              });
                              if (isConfirmed) await deleteStock(stock.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer',
                              padding: '4px',
                              transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      style={{ padding: '80px 24px', textAlign: 'center', color: '#64748b' }}
                    >
                      <EmptyPortfolioVisual />
                      <div
                        style={{
                          fontWeight: '800',
                          fontSize: '1.1rem',
                          color: '#fff',
                          marginTop: '24px',
                        }}
                      >
                        No active holdings found
                      </div>
                      <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                        Add your first stock to start tracking your portfolio.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
              {stocks.length > 0 && (
                <tfoot
                  style={{ background: 'rgba(255,255,255,0.03)', borderTop: '2px solid #1e293b' }}
                >
                  <tr>
                    <td style={{ padding: '20px 24px', fontWeight: '800', color: '#64748b' }}>
                      TOTAL
                    </td>
                    <td colSpan={3}></td>
                    <td
                      style={{
                        padding: '20px 24px',
                        textAlign: 'right',
                        fontWeight: '900',
                        color: '#fff',
                        fontSize: '1rem',
                      }}
                    >
                      ₹{totalCurrentValue.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: '20px 24px',
                        textAlign: 'right',
                        fontWeight: '900',
                        color: totalDayPnL >= 0 ? '#10b981' : '#f43f5e',
                        fontSize: '1rem',
                      }}
                    >
                      {totalDayPnL >= 0 ? '+' : ''}₹
                      {totalDayPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td
                      style={{
                        padding: '20px 24px',
                        textAlign: 'right',
                        fontWeight: '900',
                        color: totalPnL >= 0 ? '#10b981' : '#f43f5e',
                        fontSize: '1rem',
                      }}
                    >
                      {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: '20px 24px',
                        textAlign: 'right',
                        fontWeight: '900',
                        color: totalPnL >= 0 ? '#10b981' : '#f43f5e',
                      }}
                    >
                      {totalInvestment > 0
                        ? (((totalCurrentValue - totalInvestment) / totalInvestment) * 100).toFixed(
                            2
                          )
                        : '0.00'}
                      %
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {activeTab === 'allocation' && (
        <div className="grid-responsive-2" style={{ gap: '32px' }}>
          <div
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              padding: '40px',
              borderRadius: '32px',
              border: '1px solid #1e293b',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6366f1',
                }}
              >
                <PieChartIcon size={20} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0 }}>
                Sector Diversification
              </h4>
            </div>
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="sector"
                    stroke="none"
                    label={({
                      cx = 0,
                      cy = 0,
                      midAngle = 0,
                      outerRadius = 0,
                      value = 0,
                      index = 0,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 30;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      const percent = (value / totalCurrentValue) * 100;

                      // Only show if > 2% to avoid overlap
                      if (percent < 2) return null;

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#d3dde7"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          style={{ fontSize: '0.75rem', fontWeight: '800', fontFamily: 'Inter' }}
                        >
                          {sectorData[index].sector}: {percent.toFixed(0)}%
                        </text>
                      );
                    }}
                  >
                    {sectorData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#020617',
                      border: '1px solid #334155',
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                      padding: '12px',
                    }}
                    itemStyle={{ color: '#e4ebf1' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid-responsive-2" style={{ marginTop: '32px', gap: '16px' }}>
              {sectorData.map((sec, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: COLORS[idx % COLORS.length],
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff' }}>
                      {sec.sector}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ₹{sec.value.toLocaleString()} (
                      {((sec.value / totalCurrentValue) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div
              style={{
                background: '#0f172a',
                borderRadius: '32px',
                border: '1px solid #1e293b',
                padding: '40px',
              }}
            >
              <h4 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '24px' }}>
                Equity Weights
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {stocks
                  .sort((a, b) => b.currentValue - a.currentValue)
                  .slice(0, 6)
                  .map((stock) => (
                    <div key={stock.id}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                          fontSize: '0.9rem',
                        }}
                      >
                        <span style={{ fontWeight: '800', color: '#fff' }}>{stock.symbol}</span>
                        <span style={{ color: '#94a3b8', fontWeight: '600' }}>
                          {((stock.currentValue / totalCurrentValue) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '8px',
                          background: '#020617',
                          borderRadius: '100px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${(stock.currentValue / totalCurrentValue) * 100}%`,
                            height: '100%',
                            background: 'linear-gradient(to right, #6366f1, #818cf8)',
                            borderRadius: '100px',
                          }}
                        />
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
            Global Transaction History
          </h3>
          {stockTransactions.length > 0 ? (
            stockTransactions.map((transaction) => {
              const stock = stocks.find((s) => s.id === transaction.stockId);
              return (
                <div
                  key={transaction.id}
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid #1e293b',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div
                      style={{
                        background:
                          transaction.transactionType === 'BUY'
                            ? 'rgba(248, 113, 113, 0.1)'
                            : 'rgba(16, 185, 129, 0.1)',
                        color: transaction.transactionType === 'BUY' ? '#f87171' : '#10b981',
                        padding: '12px',
                        borderRadius: '14px',
                      }}
                    >
                      {transaction.transactionType === 'BUY' ? (
                        <ArrowDownRight size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: '800',
                          color: '#fff',
                          marginBottom: '4px',
                        }}
                      >
                        {stock?.symbol || 'Unknown'} • {transaction.transactionType}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                        {transaction.quantity} shares @ ₹{transaction.price.toFixed(2)}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Calendar size={12} />{' '}
                        {new Date(transaction.transactionDate).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: '900',
                          color: transaction.transactionType === 'BUY' ? '#f87171' : '#34d399',
                        }}
                      >
                        {transaction.transactionType === 'BUY' ? '-' : '+'}₹
                        {transaction.totalAmount.toLocaleString()}
                      </div>
                      {(transaction.brokerage || transaction.taxes) && (
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: '#475569',
                            marginTop: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '4px',
                          }}
                        >
                          Charges: ₹
                          {((transaction.brokerage || 0) + (transaction.taxes || 0)).toFixed(2)}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingCharges({
                                type: 'stock',
                                data: {
                                  symbol:
                                    stocks.find((s) => s.id === transaction.stockId)?.symbol ||
                                    'STOCK',
                                  quantity: transaction.quantity,
                                  currentPrice: transaction.price,
                                },
                              });
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#6366f1',
                              padding: 0,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const isConfirmed = await customConfirm({
                          title: 'Delete Transaction',
                          message: 'Are you sure you want to delete this historical transaction?',
                          type: 'warning',
                          confirmLabel: 'Delete',
                        });
                        if (isConfirmed) {
                          await deleteStockTransaction(transaction.id);
                          showNotification('success', 'Transaction deleted');
                        }
                      }}
                      style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: 'none',
                        color: '#f43f5e',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      aria-label="Delete transaction"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: '60px',
                textAlign: 'center',
                color: '#475569',
                border: '2px dashed #1e293b',
                borderRadius: '20px',
              }}
            >
              <History size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>
                No transactions recorded
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                Your trading activities will appear here chronologically
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'lifetime' && (
        <div className="grid-responsive-3" style={{ gap: '32px' }}>
          <div
            className="lifetime-report-card"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '32px',
              border: '1px solid #1e293b',
              padding: '40px',
            }}
          >
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: '900',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Star color="#f59e0b" fill="#f59e0b" size={24} /> Lifetime Wealth Report
            </h3>

            <div className="grid-responsive-2" style={{ gap: '48px', marginBottom: '48px' }}>
              <div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                  }}
                >
                  Total Money Inflow
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '950', color: '#fff' }}>
                  ₹{totalBuys.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '8px' }}>
                  Combined value of all BUY orders
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                  }}
                >
                  Total Lifetime Gains
                </div>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '950',
                    color: lifetimeEarned >= 0 ? '#10b981' : '#ef4444',
                  }}
                >
                  {lifetimeEarned >= 0 ? '+' : ''}₹{lifetimeEarned.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '8px' }}>
                  Absolute profit after all charges
                </div>
              </div>
            </div>

            <div
              className="grid-responsive-3"
              style={{
                gap: '24px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingTop: '32px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    color: '#475569',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Total Withdrawals
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                  ₹{totalSells.toLocaleString()}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    color: '#475569',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Regulatory Charges
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ef4444' }}>
                  ₹{totalCharges.toLocaleString()}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    color: '#475569',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  XIRR Equivalent
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>
                  {lifetimeReturnPercentage.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#0f172a',
              padding: '32px',
              borderRadius: '24px',
              border: '1px solid #334155',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6366f1',
                  }}
                >
                  {modalType === 'stock' ? <TrendingUp size={20} /> : <Activity size={20} />}
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>
                  {modalType === 'stock' && (editId ? 'Edit Stock' : 'Add Stock')}
                  {modalType === 'transaction' && 'Add Transaction'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: '#94a3b8',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {modalType === 'stock' && (
              <form
                onSubmit={handleStockSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div style={{ position: 'relative' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      color: '#475569',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    Search Stock
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Search
                      size={18}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#475569',
                      }}
                    />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or symbol..."
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid #1e293b',
                        padding: '12px 12px 12px 40px',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                      onFocus={() => setShowResults(true)}
                    />
                    {isSearching && (
                      <Loader2
                        size={18}
                        className="animate-spin"
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#6366f1',
                        }}
                      />
                    )}
                  </div>
                  {showResults && searchResults.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '12px',
                        marginTop: '8px',
                        zIndex: 1100,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                      }}
                    >
                      {searchResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectStock(item)}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #1e293b',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')
                          }
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>
                            {item.symbol}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {item.companyName}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                    gap: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#475569',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      Symbol
                    </label>
                    <input
                      value={symbol}
                      readOnly
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid #1e293b',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#94a3b8',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#475569',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      Exchange
                    </label>
                    <select
                      value={exchange}
                      onChange={(e) => setExchange(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid #1e293b',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    >
                      <option value="NSE">NSE</option>
                      <option value="BSE">BSE</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#475569',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid #1e293b',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#475569',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      Avg Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={avgPrice}
                      onChange={(e) => setAvgPrice(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid #1e293b',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#475569',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      LTP
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid #1e293b',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '16px',
                    border: 'none',
                    fontWeight: '800',
                    cursor: 'pointer',
                  }}
                >
                  {editId ? 'Update Stock' : 'Add Stock'}
                </button>
              </form>
            )}

            {modalType === 'transaction' && (
              <form
                onSubmit={handleTransactionSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      color: '#475569',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    Select Security
                  </label>
                  <select
                    value={selectedStockId}
                    onChange={(e) => setSelectedStockId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: '#020617',
                      border: '1px solid #1e293b',
                      padding: '12px',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  >
                    <option value="" disabled>
                      Select Stock
                    </option>
                    {stocks.map((stock) => (
                      <option key={stock.id} value={stock.id}>
                        {stock.symbol} - {stock.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                    gap: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#475569',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      Type
                    </label>
                    <select
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value as 'BUY' | 'SELL')}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid #1e293b',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    >
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#475569',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={transactionQuantity}
                      onChange={(e) => setTransactionQuantity(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid #1e293b',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                    gap: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#475569',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      Execution Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={transactionPrice}
                      onChange={(e) => setTransactionPrice(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid #1e293b',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#475569',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid #1e293b',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                    gap: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#475569',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      Brokerage (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={brokerage}
                      onChange={(e) => setBrokerage(e.target.value)}
                      placeholder={settings.autoCalculateCharges ? 'Auto-calculating...' : '0.00'}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid #1e293b',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#475569',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      Taxes & Charges (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={taxes}
                      onChange={(e) => setTaxes(e.target.value)}
                      placeholder={settings.autoCalculateCharges ? 'Auto-calculating...' : '0.00'}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid #1e293b',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                  </div>
                </div>

                {settings.autoCalculateCharges && transactionQuantity && transactionPrice && (
                  <div
                    style={{
                      background: 'rgba(99, 102, 241, 0.05)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px dashed rgba(99, 102, 241, 0.2)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Preview Brokerage:
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff' }}>
                        ₹
                        {calculateStockCharges(
                          transactionType,
                          Number(transactionQuantity),
                          Number(transactionPrice),
                          settings
                        ).brokerage.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Preview Gov. Charges:
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff' }}>
                        ₹
                        {calculateStockCharges(
                          transactionType,
                          Number(transactionQuantity),
                          Number(transactionPrice),
                          settings
                        ).taxes.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      color: '#475569',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    Operating Bank Account
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: '#020617',
                      border: '1px solid #1e293b',
                      padding: '12px',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  >
                    <option value="">No Account (Ledger Only)</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} - ₹{acc.balance.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '6px' }}>
                    Money will be {transactionType === 'BUY' ? 'deducted from' : 'added to'} this
                    account.
                  </p>
                </div>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '16px',
                    border: 'none',
                    fontWeight: '800',
                    cursor: 'pointer',
                  }}
                >
                  Confirm Transaction
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {viewingCharges && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
          }}
        >
          <div
            style={{
              background: '#0f172a',
              padding: '32px',
              borderRadius: '24px',
              border: '1px solid #334155',
              width: '100%',
              maxWidth: '450px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6366f1',
                  }}
                >
                  <Eye size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0 }}>
                  Charge Breakdown
                </h2>
              </div>
              <button
                onClick={() => setViewingCharges(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: '#94a3b8',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {viewingCharges.type === 'stock' &&
                (() => {
                  const stock = viewingCharges.data;
                  const charges = calculateStockCharges(
                    'SELL',
                    stock.quantity,
                    stock.currentPrice,
                    settings
                  );
                  return (
                    <>
                      <div
                        style={{
                          padding: '16px',
                          borderRadius: '16px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          marginBottom: '8px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#64748b',
                            marginBottom: '4px',
                            fontWeight: '700',
                          }}
                        >
                          Estimating for Selling
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>
                          {stock.symbol} • {stock.quantity} shares @ ₹
                          {stock.currentPrice.toFixed(2)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          {
                            label: 'Brokerage',
                            value: charges.brokerage,
                            sub:
                              settings.brokerageType === 'flat'
                                ? `₹${settings.brokerageValue} flat`
                                : `${settings.brokerageValue}%`,
                          },
                          {
                            label: 'STT/CTT',
                            value: charges.stt,
                            sub: `${settings.sttRate}% (Delivery)`,
                          },
                          {
                            label: 'Transaction Charges',
                            value: charges.transactionCharges,
                            sub: `${settings.transactionChargeRate}% (NSE)`,
                          },
                          { label: 'SEBI Charges', value: charges.sebiCharges, sub: '₹10/crore' },
                          {
                            label: 'Stamp Duty',
                            value: charges.stampDuty,
                            sub: '0.015% (Buy only)',
                          },
                          { label: 'GST', value: charges.gst, sub: '18% on fees' },
                          { label: 'DP Charges', value: charges.dpCharges, sub: '₹13.5 + GST' },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <div
                                style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}
                              >
                                {item.label}
                              </div>
                              <div style={{ fontSize: '0.65rem', color: '#475569' }}>
                                {item.sub}
                              </div>
                            </div>
                            <div
                              style={{
                                fontWeight: '800',
                                color: item.value > 0 ? '#fff' : '#475569',
                              }}
                            >
                              ₹{item.value.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          marginTop: '20px',
                          paddingTop: '20px',
                          borderTop: '1px solid #1e293b',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ fontWeight: '900', color: '#fff' }}>Total Charges</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '950', color: '#6366f1' }}>
                          ₹{charges.total.toFixed(2)}
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: '0.7rem',
                          color: '#64748b',
                          marginTop: '12px',
                          fontStyle: 'italic',
                        }}
                      >
                        * Estimates based on current market price and your configured tax rates.
                      </p>
                    </>
                  );
                })()}
            </div>

            <button
              onClick={() => setViewingCharges(null)}
              style={{
                width: '100%',
                background: '#1e293b',
                color: '#fff',
                padding: '14px',
                borderRadius: '16px',
                border: 'none',
                fontWeight: '800',
                cursor: 'pointer',
                marginTop: '24px',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
