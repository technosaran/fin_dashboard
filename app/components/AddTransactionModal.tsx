"use client";

import { useState, useEffect } from 'react';
import { X, Search, Loader2, TrendingUp, Activity, Zap, Banknote, Calendar, Info } from 'lucide-react';
import { useFinance, Stock, MutualFund } from './FinanceContext';
import { useNotifications } from './NotificationContext';
import { calculateStockCharges } from './FinanceContext';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TransactionType = 'STOCK' | 'MUTUAL_FUND' | 'FNO';

interface StockSearchResult {
    symbol: string;
    companyName: string;
}

interface MutualFundSearchResult {
    schemeName: string;
    schemeCode: string;
    shortName?: string;
}

type SearchResult = StockSearchResult | MutualFundSearchResult;

export default function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
    const {
        stocks,
        mutualFunds,
        accounts,
        settings,
        addStockTransaction,
        addMutualFundTransaction,
        addFnoTrade,
        addStock,
        addMutualFund
    } = useFinance();
    const { showNotification } = useNotifications();

    const [type, setType] = useState<TransactionType>('STOCK');
    const [subType, setSubType] = useState<'BUY' | 'SELL' | 'SIP'>('BUY');

    // Common Fields
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [accountId, setAccountId] = useState<number | ''>('');
    const [notes, setNotes] = useState('');

    // Search / Selection
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isFetchingQuote, setIsFetchingQuote] = useState(false);

    // Selected Item Info
    const [selectedItem, setSelectedItem] = useState<Stock | MutualFund | null>(null);
    const [isNewItem, setIsNewItem] = useState(false);

    // Specific Fields
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [previousPrice, setPreviousPrice] = useState<number | null>(null); // For "Day's Change" fix
    const [brokerage, setBrokerage] = useState('');
    const [taxes, setTaxes] = useState('');

    // FnO Specific
    const [fnoProduct, setFnoProduct] = useState<'NRML' | 'MIS'>('NRML');
    const [fnoStatus, setFnoStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');
    const [exitPrice, setExitPrice] = useState('');
    const [exitDate, setExitDate] = useState('');

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setSearchQuery('');
        setSelectedItem(null);
        setIsNewItem(false);
        setQuantity('');
        setPrice('');
        setPreviousPrice(null);
        setBrokerage('');
        setTaxes('');
        setNotes('');
        setAccountId(settings.defaultMfAccountId || '');
    };

    const handleSearch = async (query: string) => {
        if (query.length < 2) return;
        setIsSearching(true);
        try {
            const endpoint = type === 'STOCK' ? `/api/stocks/search?q=${query}` : `/api/mf/search?q=${query}`;
            const res = await fetch(endpoint);
            const data = await res.json();
            setSearchResults(data);
            setShowResults(true);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2 && !selectedItem) {
                handleSearch(searchQuery);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, type]);

    const selectItem = async (item: SearchResult) => {
        setIsNewItem(false);
        setSearchQuery('symbol' in item ? item.symbol : item.schemeName);
        setShowResults(false);
        setIsFetchingQuote(true);

        try {
            if (type === 'STOCK' && 'symbol' in item) {
                const res = await fetch(`/api/stocks/quote?symbol=${item.symbol}`);
                const data = await res.json();
                setSelectedItem({ ...item, ...data });
                setPrice(data.currentPrice.toString());
                setPreviousPrice(data.previousClose || data.currentPrice);
            } else if (type === 'MUTUAL_FUND' && 'schemeCode' in item) {
                const res = await fetch(`/api/mf/quote?code=${item.schemeCode}`);
                const data = await res.json();
                setSelectedItem({ ...item, ...data });
                setPrice(data.currentNav.toString());
                setPreviousPrice(data.previousNav || data.currentNav);
            }
        } catch (error) {
            console.error('Quote fetch failed:', error);
        } finally {
            setIsFetchingQuote(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (type === 'STOCK') {
            await handleStockSubmit();
        } else if (type === 'MUTUAL_FUND') {
            await handleMfSubmit();
        } else {
            await handleFnoSubmit();
        }
    };

    const handleStockSubmit = async () => {
        if (!selectedItem || !quantity || !price) return;

        const qty = parseFloat(quantity);
        const p = parseFloat(price);
        const total = qty * p;

        // Check if stock already exists in portfolio
        const existingStock = stocks.find(s => s.symbol === selectedItem.symbol);

        if (!existingStock) {
            // Add to portfolio first
            await addStock({
                symbol: selectedItem.symbol,
                companyName: selectedItem.companyName || selectedItem.shortName,
                quantity: qty,
                avgPrice: p,
                currentPrice: p,
                previousPrice: previousPrice || p,
                exchange: selectedItem.exchange?.includes('BSE') ? 'BSE' : 'NSE',
                investmentAmount: total,
                currentValue: total,
                pnl: 0,
                pnlPercentage: 0
            });

            // Note: We'd ideally wait for the response to get the ID, 
            // but addStock returns void in our current context. 
            // The FinanceContext update will happen.
            // For transactions, we should probably find it by symbol after it's added.
            showNotification('success', `${selectedItem.symbol} added to portfolio`);
            onClose();
            return;
        }

        let finalBrokerage = brokerage ? parseFloat(brokerage) : undefined;
        let finalTaxes = taxes ? parseFloat(taxes) : undefined;

        if (settings.autoCalculateCharges && qty && p) {
            const calculated = calculateStockCharges(subType as 'BUY' | 'SELL', qty, p, settings);
            finalBrokerage = calculated.brokerage;
            finalTaxes = calculated.taxes;
        }

        await addStockTransaction({
            stockId: existingStock.id,
            transactionType: subType as 'BUY' | 'SELL',
            quantity: qty,
            price: p,
            totalAmount: total,
            brokerage: finalBrokerage,
            taxes: finalTaxes,
            transactionDate: date,
            notes: notes || undefined,
            accountId: accountId ? Number(accountId) : undefined
        });

        showNotification('success', `Transaction recorded: ${subType} ${qty} shares`);
        onClose();
    };

    const handleMfSubmit = async () => {
        if (!selectedItem || !quantity || !price) return;

        const qty = parseFloat(quantity);
        const p = parseFloat(price);
        const total = qty * p;

        const existingMf = mutualFunds.find(m => m.schemeCode === selectedItem.schemeCode);

        if (!existingMf) {
            await addMutualFund({
                name: selectedItem.schemeName || selectedItem.name,
                schemeCode: selectedItem.schemeCode,
                category: selectedItem.category,
                units: qty,
                avgNav: p,
                currentNav: p,
                previousNav: previousPrice || p,
                investmentAmount: total,
                currentValue: total,
                pnl: 0,
                pnlPercentage: 0,
                isin: selectedItem.isin
            });
            showNotification('success', `New fund added to portfolio`);
            onClose();
            return;
        }

        await addMutualFundTransaction({
            mutualFundId: existingMf.id,
            transactionType: subType as 'BUY' | 'SELL' | 'SIP',
            units: qty,
            nav: p,
            totalAmount: total,
            transactionDate: date,
            accountId: accountId ? Number(accountId) : undefined,
            notes: notes || undefined
        });

        showNotification('success', `Investment of ₹${total.toLocaleString()} recorded`);
        onClose();
    };

    const handleFnoSubmit = async () => {
        if (!searchQuery || !quantity || !price) return;

        const qty = parseFloat(quantity);
        const entryP = parseFloat(price);
        const exitP = exitPrice ? parseFloat(exitPrice) : 0;

        let pnl = 0;
        if (fnoStatus === 'CLOSED') {
            pnl = subType === 'BUY' ? (exitP - entryP) * qty : (entryP - exitP) * qty;
        }

        await addFnoTrade({
            instrument: searchQuery,
            tradeType: subType as 'BUY' | 'SELL',
            product: fnoProduct,
            quantity: qty,
            avgPrice: entryP,
            exitPrice: fnoStatus === 'CLOSED' ? exitP : undefined,
            entryDate: date,
            exitDate: fnoStatus === 'CLOSED' ? (exitDate || date) : undefined,
            status: fnoStatus,
            pnl,
            notes,
            accountId: accountId ? Number(accountId) : undefined
        });

        showNotification('success', 'F&O trade logged successfully');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
            <div style={{ background: '#0f172a', padding: '32px', borderRadius: '32px', border: '1px solid #334155', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: '#6366f1' }}>
                            <Banknote size={24} />
                        </div>
                        Add Transaction
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}><X size={24} /></button>
                </div>

                {/* Instrument Type Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '4px', background: '#020617', borderRadius: '16px', border: '1px solid #1e293b', marginBottom: '24px' }}>
                    {[
                        { id: 'STOCK', label: 'Stocks', icon: <TrendingUp size={16} /> },
                        { id: 'MUTUAL_FUND', label: 'Mutual Funds', icon: <Activity size={16} /> },
                        { id: 'FNO', label: 'F&O', icon: <Zap size={16} /> }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => { setType(t.id as TransactionType); resetForm(); }}
                            style={{
                                padding: '10px',
                                borderRadius: '12px',
                                border: 'none',
                                background: type === t.id ? '#6366f1' : 'transparent',
                                color: type === t.id ? '#fff' : '#64748b',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: '0.2s'
                            }}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Search Field */}
                    <div style={{ position: 'relative' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                            {type === 'FNO' ? 'Instrument Name' : `Search ${type === 'STOCK' ? 'Ticker' : 'Scheme'}`}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                            <input
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); if (selectedItem) setSelectedItem(null); }}
                                placeholder={type === 'STOCK' ? "e.g. RELIANCE, HDFCBANK" : type === 'MUTUAL_FUND' ? "e.g. Parag Parikh, Quant" : "e.g. NIFTY 22FEB 21500 CE"}
                                style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px 14px 14px 48px', borderRadius: '14px', color: '#fff' }}
                                onFocus={() => type !== 'FNO' && setShowResults(true)}
                            />
                            {isSearching && <Loader2 size={18} className="spin-animation" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />}
                        </div>

                        {showResults && searchResults.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', marginTop: '8px', zIndex: 2100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                {searchResults.map((item: SearchResult) => (
                                    <div
                                        key={'symbol' in item ? item.symbol : item.schemeCode}
                                        onClick={() => selectItem(item)}
                                        style={{ padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #1e293b' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>{'symbol' in item ? item.symbol : item.schemeName}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{'companyName' in item ? item.companyName : item.shortName || `Code: ${item.schemeCode}`}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedItem && (
                        <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>{selectedItem.symbol || selectedItem.schemeName}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{selectedItem.companyName || selectedItem.shortName || selectedItem.category}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1rem', fontWeight: '900', color: '#10b981' }}>₹{price}</div>
                                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Live Market Price</div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Transaction Type</label>
                            <select value={subType} onChange={e => setSubType(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }}>
                                <option value="BUY">BUY</option>
                                <option value="SELL">SELL</option>
                                {type === 'MUTUAL_FUND' && <option value="SIP">SIP</option>}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>{type === 'MUTUAL_FUND' ? 'Units' : 'Quantity'}</label>
                            <input type="number" step={type === 'MUTUAL_FUND' ? '0.001' : '1'} value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>{type === 'MUTUAL_FUND' ? 'NAV' : 'Avg. Price'}</label>
                            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }} />
                        </div>
                    </div>

                    {type === 'FNO' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Product</label>
                                    <select value={fnoProduct} onChange={e => setFnoProduct(e.target.value as 'NRML' | 'MIS')} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }}>
                                        <option value="NRML">NRML</option>
                                        <option value="MIS">MIS</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Status</label>
                                    <select value={fnoStatus} onChange={e => setFnoStatus(e.target.value as 'OPEN' | 'CLOSED')} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }}>
                                        <option value="OPEN">OPEN POSITION</option>
                                        <option value="CLOSED">CLOSED TRADE</option>
                                    </select>
                                </div>
                            </div>
                            {fnoStatus === 'CLOSED' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Exit Price</label>
                                        <input type="number" step="0.01" value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="0.00" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Exit Date</label>
                                        <input type="date" value={exitDate} onChange={e => setExitDate(e.target.value)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }} />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Operating Bank Account</label>
                        <select value={accountId} onChange={e => setAccountId(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff' }}>
                            <option value="">No Account (Ledger Only)</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} - ₹{acc.balance.toLocaleString()}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" disabled={isFetchingQuote || (!selectedItem && type !== 'FNO')} style={{ marginTop: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', padding: '16px', borderRadius: '16px', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: (isFetchingQuote || (!selectedItem && type !== 'FNO')) ? 'not-allowed' : 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)' }}>
                        {isFetchingQuote ? <><Loader2 size={18} className="spin-animation" /> Syncing...</> : 'Confirm Transaction'}
                    </button>
                    {!selectedItem && type !== 'FNO' && (
                        <p style={{ fontSize: '0.75rem', color: '#f87171', textAlign: 'center', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Info size={14} /> Please select an instrument to continue
                        </p>
                    )}
                </form>
            </div>

            <style jsx>{`
                .spin-animation {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
