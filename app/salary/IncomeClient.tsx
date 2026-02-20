'use client';

import { useState, useMemo } from 'react';
import { useNotifications } from '../components/NotificationContext';
import { useFinance } from '../components/FinanceContext';
import { Transaction } from '@/lib/types';
import {
  TrendingUp,
  Calendar as CalendarIcon,
  Plus,
  X,
  Briefcase,
  DollarSign,
  Edit3,
  Trash2,
  TrendingDown,
  BarChart3,
  PieChart,
} from 'lucide-react';

export default function IncomeClient() {
  const {
    accounts,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    settings,
    loading,
  } = useFinance();
  const { showNotification, confirm: customConfirm } = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year' | 'all'>(
    'year'
  );
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>(
    settings.defaultSalaryAccountId || ''
  );

  // Salary Data Filtering
  const salaryItems = transactions.filter((t) => t.category === 'Salary');

  // Calculate stats based on selected period
  const stats = useMemo(() => {
    const now = new Date();
    let filteredItems = salaryItems;

    switch (selectedPeriod) {
      case 'month':
        filteredItems = salaryItems.filter((item) => {
          const itemDate = new Date(item.date);
          return (
            itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
          );
        });
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        filteredItems = salaryItems.filter((item) => {
          const itemDate = new Date(item.date);
          const itemQuarter = Math.floor(itemDate.getMonth() / 3);
          return itemQuarter === currentQuarter && itemDate.getFullYear() === now.getFullYear();
        });
        break;
      case 'year':
        filteredItems = salaryItems.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate.getFullYear() === now.getFullYear();
        });
        break;
      default:
        filteredItems = salaryItems;
    }

    const total = filteredItems.reduce((sum, item) => sum + item.amount, 0);
    const count = filteredItems.length;
    const average = count > 0 ? total / count : 0;

    // Get unique employers
    const employersSet = new Set(filteredItems.map((item) => item.description || 'Unknown'));
    const employersCount = employersSet.size;

    // Calculate trend (comparing to previous period)
    let previousTotal = 0;
    if (selectedPeriod === 'month') {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthItems = salaryItems.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getMonth() === prevMonth.getMonth() &&
          itemDate.getFullYear() === prevMonth.getFullYear()
        );
      });
      previousTotal = prevMonthItems.reduce((sum, item) => sum + item.amount, 0);
    }

    const trend = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

    return { total, count, average, employersCount, trend, filteredItems };
  }, [salaryItems, selectedPeriod]);

  // Process Employers/Sources
  const employersData = useMemo(() => {
    const employersMap = stats.filteredItems.reduce(
      (acc, item) => {
        const name = item.description || 'Unknown Employer';
        if (!acc[name]) acc[name] = { total: 0, count: 0, lastPayment: item.date };
        acc[name].total += item.amount;
        acc[name].count += 1;
        if (new Date(item.date) > new Date(acc[name].lastPayment)) {
          acc[name].lastPayment = item.date;
        }
        return acc;
      },
      {} as Record<string, { total: number; count: number; lastPayment: string }>
    );

    return Object.entries(employersMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [stats.filteredItems]);

  // Form State
  const [amount, setAmount] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleLogIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !employerName) return;

    const txData = {
      date,
      description: employerName,
      category: 'Salary',
      type: 'Income' as const,
      amount: parseFloat(amount),
      accountId: selectedAccountId ? Number(selectedAccountId) : undefined,
    };

    if (editId) {
      await updateTransaction(editId, txData);
      showNotification('success', 'Income updated successfully');
    } else {
      await addTransaction(txData);
      showNotification('success', 'Income added! 🎉');
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setAmount('');
    setEmployerName('');
    setDate(new Date().toISOString().split('T')[0]);
    setEditId(null);
  };

  const handleEdit = (item: Transaction) => {
    setEditId(item.id);
    setAmount(item.amount.toString());
    setEmployerName(item.description);
    setDate(item.date);
    setIsModalOpen(true);
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'month':
        return 'This Month';
      case 'quarter':
        return 'This Quarter';
      case 'year':
        return 'This Year';
      default:
        return 'All Time';
    }
  };

  if (loading) {
    return (
      <div
        className="main-content"
        style={{
          backgroundColor: '#020617',
          minHeight: '100vh',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: '#94a3b8' }}>Loading income data...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="main-content"
      style={{
        backgroundColor: '#020617',
        minHeight: '100vh',
        color: '#f8fafc',
        padding: '24px 20px',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <div className="page-header">
          <div>
            <h1
              className="page-title"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Income Tracker
            </h1>
            <p className="page-subtitle">Monitor your earnings and income sources</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="header-add-btn header-add-btn--green"
          >
            <Plus size={20} strokeWidth={3} /> Add Income
          </button>
        </div>

        {/* Period Selector */}
        <div
          style={{
            marginBottom: '32px',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#94a3b8', fontWeight: '700', fontSize: '0.9rem' }}>Period:</span>
          {(['month', 'quarter', 'year', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? 'period-btn period-btn--active' : 'period-btn'}
            >
              {period === 'month'
                ? 'This Month'
                : period === 'quarter'
                  ? 'This Quarter'
                  : period === 'year'
                    ? 'This Year'
                    : 'All Time'}
            </button>
          ))}
        </div>

        {/* Stats Cards Grid */}
        <div
          className="section-fade-in"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {/* Total Income Card */}
          <div className="stat-card stat-card--green">
            <div className="stat-card__glow" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <DollarSign size={24} color="#fff" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Total Earned
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>
                    {getPeriodLabel()}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                  fontWeight: '900',
                  color: '#10b981',
                  marginBottom: '8px',
                }}
              >
                ₹{stats.total.toLocaleString()}
              </div>
              {selectedPeriod === 'month' && stats.trend !== 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    color: stats.trend > 0 ? '#10b981' : '#ef4444',
                    fontWeight: '700',
                  }}
                >
                  {stats.trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(stats.trend).toFixed(1)}% vs last month
                </div>
              )}
            </div>
          </div>

          {/* Average Income Card */}
          <div className="stat-card stat-card--indigo">
            <div className="stat-card__glow" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  <BarChart3 size={24} color="#fff" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Average Income
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>
                    Per Entry
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                  fontWeight: '900',
                  color: '#6366f1',
                  marginBottom: '8px',
                }}
              >
                ₹{stats.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                {stats.count} payment{stats.count !== 1 ? 's' : ''} recorded
              </div>
            </div>
          </div>

          {/* Income Sources Card */}
          <div className="stat-card stat-card--amber">
            <div className="stat-card__glow" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  <Briefcase size={24} color="#fff" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Income Sources
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>
                    Active Employers
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                  fontWeight: '900',
                  color: '#f59e0b',
                  marginBottom: '8px',
                }}
              >
                {stats.employersCount}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                {stats.employersCount === 1 ? 'Single source' : 'Multiple sources'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div
          className="section-fade-in"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
            gap: '32px',
          }}
        >
          {/* Employers Breakdown */}
          <div className="content-panel">
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}
            >
              <div
                className="content-panel__icon"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                }}
              >
                <PieChart size={20} color="#fff" />
              </div>
              <h3 className="content-panel__title">Income Sources</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {employersData.length > 0 ? (
                employersData.map((employer, index) => {
                  const percentage = stats.total > 0 ? (employer.total / stats.total) * 100 : 0;
                  const colors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
                  const color = colors[index % colors.length];

                  return (
                    <div key={employer.name} className="source-row">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '12px',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: '800',
                              fontSize: '1rem',
                              color: '#fff',
                              marginBottom: '6px',
                            }}
                          >
                            {employer.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                            {employer.count} payment{employer.count !== 1 ? 's' : ''} • Last:{' '}
                            {new Date(employer.lastPayment).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '900', fontSize: '1.2rem', color: color }}>
                            ₹{employer.total.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800' }}>
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div
                        style={{
                          width: '100%',
                          height: '6px',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '10px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
                            borderRadius: '10px',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#64748b',
                  }}
                >
                  <Briefcase size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ fontWeight: '600' }}>No income sources yet</p>
                  <p style={{ fontSize: '0.85rem' }}>Add your first income entry to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments Timeline */}
          <div className="content-panel">
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}
            >
              <div
                className="content-panel__icon"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
                }}
              >
                <CalendarIcon size={20} color="#fff" />
              </div>
              <h3 className="content-panel__title">Recent Payments</h3>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '600px',
                overflowY: 'auto',
              }}
            >
              {stats.filteredItems.length > 0 ? (
                stats.filteredItems.slice(0, 10).map((item) => (
                  <div key={item.id} className="tx-row tx-row--income">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: '800',
                          fontSize: '0.95rem',
                          color: '#fff',
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.description}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                        {new Date(item.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          fontWeight: '900',
                          fontSize: '1.1rem',
                          color: '#10b981',
                          textAlign: 'right',
                        }}
                      >
                        +₹{item.amount.toLocaleString()}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleEdit(item)}
                          className="action-btn action-btn--edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={async () => {
                            const isConfirmed = await customConfirm({
                              title: 'Delete Income',
                              message: 'Are you sure you want to delete this income record?',
                              type: 'error',
                              confirmLabel: 'Delete',
                            });
                            if (isConfirmed) {
                              await deleteTransaction(item.id);
                              showNotification('success', 'Income deleted');
                            }
                          }}
                          className="action-btn action-btn--delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#64748b',
                  }}
                >
                  <TrendingUp size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px' }}>
                    No income recorded
                  </p>
                  <p style={{ fontSize: '0.9rem' }}>
                    Start tracking your earnings by adding your first income entry
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      marginTop: '20px',
                      padding: 'clamp(12px, 2.5vw, 14px) clamp(20px, 3vw, 24px)',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      minHeight: '44px',
                    }}
                  >
                    <Plus size={18} /> Add First Income
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <button
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="modal-close"
            >
              <X size={20} />
            </button>

            <h2 className="modal-title">{editId ? 'Edit Income' : 'Add New Income'}</h2>
            <p className="modal-subtitle">
              {editId ? 'Update your income record' : 'Record a new income payment'}
            </p>

            <form
              onSubmit={handleLogIncome}
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <div>
                <label className="form-label">Income Source / Employer</label>
                <input
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="e.g. Acme Corp, Freelance Project"
                  required
                  className="form-input form-input--green"
                  autoFocus
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                  gap: '20px',
                }}
              >
                <div>
                  <label className="form-label">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="form-input form-input--green"
                  />
                </div>

                <div>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-input form-input--green"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Credit to Account (Optional)</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) =>
                    setSelectedAccountId(e.target.value ? Number(e.target.value) : '')
                  }
                  className="form-input form-input--green"
                >
                  <option value="">Just record, don&apos;t add to account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} - ₹{acc.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary btn-primary--green">
                {editId ? 'Update Income' : 'Save Income'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
