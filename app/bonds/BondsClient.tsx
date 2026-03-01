'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/config/supabase';
import { useAuth } from '@/app/components/AuthContext';
import { useNotifications } from '@/app/components/NotificationContext';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { EmptyPortfolioVisual } from '@/app/components/Visuals';

// Simplified type based on database schema for local use
export interface Bond {
  id: number;
  name: string;
  company_name: string | null;
  avg_price: number | null;
  coupon_rate: number | null;
  quantity: number | null;
  current_value: number | null;
  maturity_date: string | null;
  status: string | null;
  pnl: number | null;
  pnl_percentage: number | null;
  yield_to_maturity: number | null;
}

export default function BondsClient() {
  const { user } = useAuth();
  const { showNotification, confirm: customConfirm } = useNotifications();
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [couponRate, setCouponRate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  const fetchBonds = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bonds')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBonds(data as Bond[]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bonds';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, showNotification]);

  useEffect(() => {
    fetchBonds();
  }, [fetchBonds]);

  const stats = useMemo(() => {
    const totalInvested = bonds.reduce((sum, b) => sum + (b.avg_price || 0) * (b.quantity || 0), 0);
    const totalCurrent = bonds.reduce(
      (sum, b) => sum + (b.current_value || (b.avg_price || 0) * (b.quantity || 0)),
      0
    );
    const totalPnl = totalCurrent - totalInvested;
    const avgYield =
      bonds.length > 0 ? bonds.reduce((sum, b) => sum + (b.coupon_rate || 0), 0) / bonds.length : 0;

    return { totalInvested, totalCurrent, totalPnl, avgYield };
  }, [bonds]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !quantity || !avgPrice) return;

    const qty = parseFloat(quantity);
    const price = parseFloat(avgPrice);
    const invested = qty * price;

    const bondData = {
      user_id: user.id,
      name,
      company_name: companyName,
      quantity: qty,
      avg_price: price,
      coupon_rate: couponRate ? parseFloat(couponRate) : null,
      maturity_date: maturityDate || null,
      status,
      investment_amount: invested,
      current_value: invested, // assumes initial value = invested
      pnl: 0,
      pnl_percentage: 0,
    };

    try {
      if (editId) {
        const { error } = await supabase.from('bonds').update(bondData).eq('id', editId);
        if (error) throw error;
        showNotification('success', 'Bond updated successfully');
      } else {
        const { error } = await supabase.from('bonds').insert([bondData]);
        if (error) throw error;
        showNotification('success', 'Bond added successfully');
      }
      resetForm();
      fetchBonds();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error saving bond';
      showNotification('error', errorMessage);
    }
  };

  const handleEdit = (b: Bond) => {
    setEditId(b.id);
    setName(b.name);
    setCompanyName(b.company_name || '');
    setQuantity(b.quantity?.toString() || '');
    setAvgPrice(b.avg_price?.toString() || '');
    setCouponRate(b.coupon_rate?.toString() || '');
    setMaturityDate(b.maturity_date || '');
    setStatus(b.status || 'ACTIVE');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (await customConfirm({ title: 'Delete Bond', message: 'Are you sure?', type: 'warning' })) {
      try {
        const { error } = await supabase.from('bonds').delete().eq('id', id);
        if (error) throw error;
        showNotification('success', 'Bond removed');
        fetchBonds();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error';
        showNotification('error', errorMessage);
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setCompanyName('');
    setQuantity('');
    setAvgPrice('');
    setCouponRate('');
    setMaturityDate('');
    setStatus('ACTIVE');
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div
        className="page-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <div style={{ color: '#2dd4bf', fontWeight: 'bold' }}>Loading your bonds...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
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
              background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Bonds Terminal
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>
            Manage and track your fixed-income securities securely.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '16px',
            fontWeight: '900',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 16px rgba(45, 212, 191, 0.2)',
            transition: 'all 0.3s',
          }}
        >
          <Plus size={20} /> Add Bond
        </button>
      </div>

      {/* Stats */}
      <div className="grid-responsive-4" style={{ gap: '16px', marginBottom: '32px' }}>
        <div
          className="premium-card"
          style={{
            background: '#0f172a',
            padding: '20px',
            borderRadius: '24px',
            border: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              color: '#64748b',
              fontSize: '0.65rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '10px',
            }}
          >
            Total Invested
          </div>
          <div style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: '950', color: '#fff' }}>
            ₹{stats.totalInvested.toLocaleString()}
          </div>
        </div>
        <div
          className="premium-card"
          style={{
            background: '#0f172a',
            padding: '20px',
            borderRadius: '24px',
            border: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              color: '#64748b',
              fontSize: '0.65rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '10px',
            }}
          >
            Total P&L
          </div>
          <div
            style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              fontWeight: '950',
              color: stats.totalPnl >= 0 ? '#10b981' : '#f43f5e',
            }}
          >
            ₹{stats.totalPnl.toLocaleString()}
          </div>
        </div>
        <div
          className="premium-card"
          style={{
            background: '#0f172a',
            padding: '20px',
            borderRadius: '24px',
            border: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              color: '#64748b',
              fontSize: '0.65rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '10px',
            }}
          >
            Avg Yield
          </div>
          <div
            style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: '950', color: '#2dd4bf' }}
          >
            {stats.avgYield.toFixed(2)}%
          </div>
        </div>
        <div
          className="premium-card"
          style={{
            background: '#0f172a',
            padding: '20px',
            borderRadius: '24px',
            border: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              color: '#64748b',
              fontSize: '0.65rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '10px',
            }}
          >
            Active Bonds
          </div>
          <div style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: '950', color: '#fff' }}>
            {bonds.length}
          </div>
        </div>
      </div>

      {/* Bond List */}
      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        {bonds.length > 0 ? (
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
                style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e293b' }}
              >
                <th
                  style={{
                    padding: '16px',
                    color: '#64748b',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                  }}
                >
                  Bond Name
                </th>
                <th
                  style={{
                    padding: '16px',
                    color: '#64748b',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    textAlign: 'right',
                  }}
                >
                  Qty / Avg Price
                </th>
                <th
                  style={{
                    padding: '16px',
                    color: '#64748b',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    textAlign: 'right',
                  }}
                >
                  Coupon Rate
                </th>
                <th
                  style={{
                    padding: '16px',
                    color: '#64748b',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    textAlign: 'right',
                  }}
                >
                  Current Value
                </th>
                <th
                  style={{
                    padding: '16px',
                    color: '#64748b',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bonds.map((bond) => (
                <tr key={bond.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 800, color: '#fff' }}>{bond.name}</div>
                    {bond.company_name && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {bond.company_name}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', color: '#cbd5e1' }}>
                    {bond.quantity} / ₹{bond.avg_price?.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: '16px',
                      textAlign: 'right',
                      fontWeight: '700',
                      color: '#2dd4bf',
                    }}
                  >
                    {bond.coupon_rate ? `${bond.coupon_rate}%` : 'N/A'}
                  </td>
                  <td
                    style={{
                      padding: '16px',
                      textAlign: 'right',
                      fontWeight: '700',
                      color: '#fff',
                    }}
                  >
                    ₹{bond.current_value?.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(bond)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        marginRight: '12px',
                      }}
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(bond.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#f43f5e',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <EmptyPortfolioVisual />
            <div style={{ fontWeight: '700', marginTop: '20px' }}>
              No bonds found in your portfolio.
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="premium-card fade-in"
            style={{
              width: '100%',
              maxWidth: '500px',
              background: '#0f172a',
              padding: '32px',
              borderRadius: '24px',
            }}
          >
            <h2 style={{ color: '#fff', marginBottom: '24px', fontWeight: '900' }}>
              {editId ? 'Edit Bond' : 'Add New Bond'}
            </h2>
            <form
              onSubmit={handleAction}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    color: '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    marginBottom: '8px',
                  }}
                >
                  Bond Name *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#64748b',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      marginBottom: '8px',
                    }}
                  >
                    Quantity *
                  </label>
                  <input
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    type="number"
                    step="any"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#64748b',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      marginBottom: '8px',
                    }}
                  >
                    Avg Price *
                  </label>
                  <input
                    required
                    value={avgPrice}
                    onChange={(e) => setAvgPrice(e.target.value)}
                    type="number"
                    step="any"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#64748b',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      marginBottom: '8px',
                    }}
                  >
                    Coupon Rate (%)
                  </label>
                  <input
                    value={couponRate}
                    onChange={(e) => setCouponRate(e.target.value)}
                    type="number"
                    step="any"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#64748b',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      marginBottom: '8px',
                    }}
                  >
                    Maturity Date
                  </label>
                  <input
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    type="date"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'transparent',
                    border: '1px solid #1e293b',
                    color: '#94a3b8',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#0d9488',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                  }}
                >
                  {editId ? 'Save Changes' : 'Add Bond'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
