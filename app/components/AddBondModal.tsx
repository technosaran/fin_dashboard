"use client";

import { useState, useEffect } from 'react';
import {
    X,
    Search,
    Landmark,
    Calendar,
    Percent,
    ShieldCheck,
    Check
} from 'lucide-react';
import { useFinance, Bond } from './FinanceContext';
import { useNotifications } from './NotificationContext';

interface AddBondModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface BondSearchResult {
    isin: string;
    name: string;
    company_name: string;
    coupon_rate: number;
    face_value: number;
    maturity_date: string;
    interest_frequency: string;
    rating?: string;
}

export default function AddBondModal({ isOpen, onClose }: AddBondModalProps) {
    const { addBond, accounts, settings } = useFinance();
    const { showNotification } = useNotifications();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BondSearchResult[]>([]);
    const [selectedBond, setSelectedBond] = useState<BondSearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const [quantity, setQuantity] = useState<number>(1);
    const [avgPrice, setAvgPrice] = useState<number>(0);
    const [accountId, setAccountId] = useState<number>(settings.defaultStockAccountId || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isManualMode, setIsManualMode] = useState(false);

    // Form states for manual entry
    const [manualName, setManualName] = useState('');
    const [manualIsin, setManualIsin] = useState('');
    const [manualCompany, setManualCompany] = useState('');
    const [manualCoupon, setManualCoupon] = useState('');
    const [manualMaturity, setManualMaturity] = useState('');
    const [manualFrequency, setManualFrequency] = useState('Yearly');
    const [manualFaceValue, setManualFaceValue] = useState('1000');

    // Search for bonds when query changes
    useEffect(() => {
        const fetchBonds = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(`/api/bonds/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (data.status === 200) {
                    setSearchResults(data.data);
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchBonds, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Update avgPrice when selectedBond changes
    useEffect(() => {
        if (selectedBond) {
            setAvgPrice(selectedBond.face_value);
        }
    }, [selectedBond]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBond) return;

        setIsSubmitting(true);
        try {
            const investmentAmount = quantity * avgPrice;

            const bondData: Omit<Bond, 'id'> = {
                name: selectedBond.name,
                isin: selectedBond.isin,
                companyName: selectedBond.company_name,
                faceValue: selectedBond.face_value,
                couponRate: selectedBond.coupon_rate,
                maturityDate: selectedBond.maturity_date,
                quantity: quantity,
                avgPrice: avgPrice,
                currentPrice: avgPrice,
                investmentAmount: investmentAmount,
                currentValue: investmentAmount,
                pnl: 0,
                pnlPercentage: 0,
                interestFrequency: selectedBond.interest_frequency,
                status: 'ACTIVE'
            };

            await addBond(bondData);
            showNotification('success', 'Bond added to your portfolio');
            onClose();
            // Reset state
            setSelectedBond(null);
            setSearchQuery('');
            setIsManualMode(false);
        } catch (error) {
            console.error('Failed to add bond:', error);
            showNotification('error', 'Failed to add bond');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
                onClick={onClose}
            />

            <div className="premium-card shadow-glow fade-in" style={{
                width: '100%', maxWidth: '600px',
                maxHeight: '90vh', overflow: 'hidden',
                position: 'relative', zIndex: 1,
                backgroundColor: '#0f172a', border: '1px solid #1e293b',
                borderRadius: '32px',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{ padding: '32px 32px 16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.50rem', fontWeight: '950', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Landmark size={24} style={{ color: 'var(--accent)' }} /> {isManualMode ? 'Manual Bond Entry' : 'Add Bond Investment'}
                        </h2>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '4px' }}>
                            {isManualMode ? 'Enter details of your off-market or custom bond' : 'Search by ISIN or name'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => {
                                setIsManualMode(!isManualMode);
                                setSelectedBond(null);
                                setSearchQuery('');
                            }}
                            style={{
                                background: 'rgba(255,158,11,0.05)',
                                border: '1px solid rgba(255,158,11,0.2)',
                                color: '#f59e0b',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            {isManualMode ? 'Back to Search' : 'Manual Entry'}
                        </button>
                        <button onClick={onClose} className="glass-button p-sm" style={{ borderRadius: '50%', width: '40px', height: '40px' }}><X size={20} /></button>
                    </div>
                </div>

                <div style={{ padding: '0 32px 32px 32px', overflowY: 'auto', flex: 1 }}>
                    {/* Search Field */}
                    {!isManualMode && !selectedBond && (
                        <div style={{ position: 'relative', marginBottom: '24px' }}>
                            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} size={18} />
                            <input
                                type="text"
                                placeholder="Type 'SBI', 'Tata', or an ISIN..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '16px 12px 16px 48px',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--surface-border)',
                                    borderRadius: '16px',
                                    color: '#fff',
                                    outline: 'none',
                                    fontSize: '1rem'
                                }}
                            />
                            {isSearching && (
                                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }}>
                                    <div className="loader" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Search Results */}
                    {searchResults.length > 0 && !selectedBond && !isManualMode && (
                        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {searchResults.map(result => (
                                <div
                                    key={result.isin}
                                    onClick={() => setSelectedBond(result)}
                                    style={{
                                        padding: '16px', background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '16px', border: '1px solid #1e293b',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    className="hover-card"
                                >
                                    <div className="flex justify-between items-center">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '800', fontSize: '1.05rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {result.name}
                                                {result.rating && (
                                                    <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{result.rating}</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <ShieldCheck size={12} /> {result.isin} • {result.company_name}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#f59e0b', fontWeight: '900', fontSize: '1.1rem' }}>{result.coupon_rate}%</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{result.interest_frequency}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Manual Entry Form */}
                    {isManualMode && (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const manualBond: BondSearchResult = {
                                name: manualName,
                                isin: manualIsin,
                                company_name: manualCompany,
                                coupon_rate: parseFloat(manualCoupon),
                                face_value: parseFloat(manualFaceValue),
                                maturity_date: manualMaturity || new Date().toISOString().split('T')[0],
                                interest_frequency: manualFrequency,
                                rating: 'Manual'
                            };
                            setSelectedBond(manualBond);
                            setIsManualMode(false);
                        }} className="fade-in">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Bond Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Navi Technologies Oct 2026"
                                        value={manualName}
                                        onChange={e => setManualName(e.target.value)}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>ISIN (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="INE..."
                                        value={manualIsin}
                                        onChange={e => setManualIsin(e.target.value)}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Company Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Navi Technologies"
                                        value={manualCompany}
                                        onChange={e => setManualCompany(e.target.value)}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Coupon Rate (%)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="9.5"
                                        value={manualCoupon}
                                        onChange={e => setManualCoupon(e.target.value)}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Maturity Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={manualMaturity}
                                        onChange={e => setManualMaturity(e.target.value)}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Interest Frequency</label>
                                    <select
                                        value={manualFrequency}
                                        onChange={e => setManualFrequency(e.target.value)}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none' }}
                                    >
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Yearly">Yearly</option>
                                        <option value="At Maturity">At Maturity</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Face Value</label>
                                    <input
                                        required
                                        type="number"
                                        value={manualFaceValue}
                                        onChange={e => setManualFaceValue(e.target.value)}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="glass-button glow-primary"
                                style={{
                                    width: '100%', padding: '16px',
                                    background: 'var(--accent)', border: 'none',
                                    borderRadius: '16px', fontWeight: '800', fontSize: '1rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                }}
                            >
                                Continue to Investment Info
                            </button>
                        </form>
                    )}

                    {/* Form for selected bond */}
                    {selectedBond && (
                        <form onSubmit={handleSubmit} className="fade-in">
                            <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '32px' }}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Selected Instrument</div>
                                        <div style={{ fontWeight: '900', fontSize: '1.2rem' }}>{selectedBond.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>{selectedBond.isin}</div>
                                    </div>
                                    <button onClick={() => setSelectedBond(null)} type="button" style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>Change</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                                    <div className="flex items-center gap-sm" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        <Calendar size={14} /> Matures {new Date(selectedBond.maturity_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-sm" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        <Percent size={14} style={{ color: '#f59e0b' }} /> {selectedBond.coupon_rate}% {selectedBond.interest_frequency}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Avg. Buy Price (per unit)</label>
                                    <input
                                        type="number"
                                        value={avgPrice}
                                        onChange={e => setAvgPrice(parseFloat(e.target.value) || 0)}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Funding Account</label>
                                <select
                                    value={accountId}
                                    onChange={e => setAccountId(parseInt(e.target.value))}
                                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none' }}
                                >
                                    <option value={0}>Manual (No Balance Sync)</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ background: 'rgba(255,158,11,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,158,11,0.1)', marginBottom: '24px' }}>
                                <div className="flex justify-between items-center">
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Estimated Total Outflow</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '950' }}>₹{(quantity * avgPrice).toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || quantity <= 0 || avgPrice <= 0}
                                className="glass-button glow-primary"
                                style={{
                                    width: '100%', padding: '16px',
                                    background: 'var(--accent)', border: 'none',
                                    borderRadius: '16px', fontWeight: '800', fontSize: '1rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                }}
                            >
                                {isSubmitting ? 'Syncing with Ledger...' : <><Check size={20} /> Add to Portfolio</>}
                            </button>
                        </form>
                    )}

                    {searchQuery.length > 0 && searchResults.length === 0 && !isSearching && !selectedBond && !isManualMode && (
                        <div style={{ textAlign: 'center', padding: '48px 0' }}>
                            <Search size={48} style={{ color: '#1e293b', marginBottom: '16px', margin: '0 auto' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 8px 0' }}>No Bonds Found</h3>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>We couldn&apos;t find any bonds matching &quot;{searchQuery}&quot;</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
