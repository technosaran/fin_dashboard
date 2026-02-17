'use client';

import { useState, useEffect } from 'react';
import { X, Search, Calendar, ShieldCheck } from 'lucide-react';
import { useFinance } from './FinanceContext';
import { Bond } from '@/lib/types';
import { useNotifications } from './NotificationContext';
import { logError } from '@/lib/utils/logger';

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

  const [activeTab, setActiveTab] = useState<'search' | 'manual'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BondSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBond, setSelectedBond] = useState<BondSearchResult | null>(null);

  // Investment Details
  const [quantity, setQuantity] = useState<number>(1);
  const [avgPrice, setAvgPrice] = useState<number>(0);
  const [accountId, setAccountId] = useState<number>(settings.defaultStockAccountId || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    name: '',
    isin: '',
    company: '',
    coupon: '',
    maturity: '',
    frequency: 'Yearly',
    faceValue: '1000',
  });

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab('search');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedBond(null);
      setQuantity(1);
      setAvgPrice(0);
      setManualForm({
        name: '',
        isin: '',
        company: '',
        coupon: '',
        maturity: '',
        frequency: 'Yearly',
        faceValue: '1000',
      });
    }
  }, [isOpen]);

  // Search Effect
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
        logError('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchBonds, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleBondSelect = (bond: BondSearchResult) => {
    setManualForm({
      name: bond.name,
      isin: bond.isin,
      company: bond.company_name,
      coupon: bond.coupon_rate.toString(),
      maturity: bond.maturity_date,
      frequency: bond.interest_frequency,
      faceValue: bond.face_value.toString(),
    });
    setAvgPrice(bond.face_value);
    setActiveTab('manual');
    setSearchResults([]);
    setSearchQuery('');
  };

  const submitBond = async () => {
    setIsSubmitting(true);
    try {
      const faceVal = parseFloat(manualForm.faceValue);
      const couponVal = parseFloat(manualForm.coupon);
      const investmentAmount = quantity * avgPrice;

      const bondData: Omit<Bond, 'id'> = {
        name: manualForm.name,
        isin: manualForm.isin || `MANUAL-${Date.now()}`,
        companyName: manualForm.company,
        faceValue: faceVal,
        couponRate: couponVal,
        maturityDate: manualForm.maturity,
        quantity: quantity,
        avgPrice: avgPrice,
        currentPrice: avgPrice,
        investmentAmount: investmentAmount,
        currentValue: investmentAmount,
        pnl: 0,
        pnlPercentage: 0,
        interestFrequency: manualForm.frequency,
        status: 'ACTIVE',
      };

      await addBond(bondData);
      showNotification('success', 'Bond added to your portfolio');
      onClose();
    } catch (error) {
      logError('Failed to add bond:', error);
      showNotification('error', 'Failed to add bond');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(2, 6, 23, 0.8)',
          backdropFilter: 'blur(16px)',
        }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: '650px',
          height: 'auto',
          maxHeight: '90vh',
          position: 'relative',
          zIndex: 10,
          background: '#0f172a',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                margin: 0,
                background: 'linear-gradient(to right, #fff, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Add Investment
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
              Add a bond or fixed-income instrument
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '12px',
              padding: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        {!selectedBond && (
          <div
            style={{
              display: 'flex',
              padding: '4px',
              margin: '24px 24px 0 24px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <button
              onClick={() => setActiveTab('search')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                background: activeTab === 'search' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'search' ? '#fff' : '#64748b',
                transition: 'all 0.2s',
              }}
            >
              Search Database
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                background: activeTab === 'manual' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'manual' ? '#fff' : '#64748b',
                transition: 'all 0.2s',
              }}
            >
              Manual Entry
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* SEARCH TAB */}
          {activeTab === 'search' && !selectedBond && (
            <div className="fade-in">
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by name or ISIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 48px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {searchResults.map((bond, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleBondSelect(bond)}
                    className="hover-card-premium"
                    style={{
                      padding: '16px',
                      background:
                        'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '1rem',
                          marginBottom: '4px',
                        }}
                      >
                        {bond.name}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '12px',
                          fontSize: '0.8rem',
                          color: '#94a3b8',
                        }}
                      >
                        <span className="flex items-center gap-1">
                          <ShieldCheck size={12} /> {bond.isin}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {bond.maturity_date}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#f59e0b', fontWeight: '800', fontSize: '1.1rem' }}>
                        {bond.coupon_rate}%
                      </div>
                      <div
                        style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}
                      >
                        {bond.interest_frequency}
                      </div>
                    </div>
                  </div>
                ))}
                {searchQuery && searchResults.length === 0 && !isSearching && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No bonds found. Try manual entry.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MANUAL TAB */}
          {activeTab === 'manual' && !selectedBond && (
            <div
              className="fade-in"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}
            >
              <div style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Bond Name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. RBI Floating Rate Bond 2030"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">ISIN (Optional)</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="INE..."
                  value={manualForm.isin}
                  onChange={(e) => setManualForm({ ...manualForm, isin: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Maturity Date</label>
                <input
                  className="input-field"
                  type="date"
                  value={manualForm.maturity}
                  onChange={(e) => setManualForm({ ...manualForm, maturity: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Coupon Rate (%)</label>
                <input
                  className="input-field"
                  type="number"
                  step="0.01"
                  placeholder="7.5"
                  value={manualForm.coupon}
                  onChange={(e) => setManualForm({ ...manualForm, coupon: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Interest Frequency</label>
                <select
                  className="input-field"
                  value={manualForm.frequency}
                  onChange={(e) => setManualForm({ ...manualForm, frequency: e.target.value })}
                >
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Half-Yearly</option>
                  <option>Yearly</option>
                  <option>At Maturity</option>
                </select>
              </div>
              <div
                style={{
                  gridColumn: 'span 2',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                }}
              >
                <div>
                  <label className="input-label">Quantity</label>
                  <input
                    className="input-field"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="input-label">Purchase Price (Per Unit)</label>
                  <input
                    className="input-field"
                    type="number"
                    step="0.01"
                    value={avgPrice}
                    onChange={(e) => setAvgPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Funding Account</label>
                <select
                  className="input-field"
                  value={accountId}
                  onChange={(e) => setAccountId(Number(e.target.value))}
                >
                  <option value={0}>Manual (No Deduction)</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (₹{acc.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  if (manualForm.name && manualForm.coupon) {
                    submitBond();
                  } else {
                    showNotification('error', 'Please fill required fields');
                  }
                }}
                disabled={isSubmitting}
                className="glass-button glow-primary"
                style={{
                  gridColumn: 'span 2',
                  padding: '16px',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: '16px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  marginTop: '16px',
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Adding...' : 'Add Bond'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .input-label {
          margin-bottom: 8px;
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .input-field {
          width: 100%;
          background: #020617;
          border: 1px solid #1e293b;
          color: #fff;
          padding: 14px;
          border-radius: 12px;
          outline: none;
          transition: all 0.2s;
          font-size: 0.95rem;
        }
        .input-field:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .label-xs {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .value-sm {
          font-size: 0.95rem;
          color: #fff;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
