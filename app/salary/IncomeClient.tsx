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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: '900',
                margin: 0,
                letterSpacing: '-0.03em',
                color: '#10b981',
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
              }}
            >
              Income Tracker
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0, fontWeight: '500' }}>
              Monitor your earnings and income sources
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: 'clamp(12px, 2.5vw, 14px) clamp(24px, 4vw, 28px)',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              fontWeight: '800',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.3)';
            }}
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
              style={{
                padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)',
                borderRadius: '12px',
                border: selectedPeriod === period ? '2px solid #10b981' : '2px solid #1e293b',
                background:
                  selectedPeriod === period
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)'
                    : '#0f172a',
                color: selectedPeriod === period ? '#10b981' : '#64748b',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                minHeight: '44px',
              }}
              onMouseEnter={(e) => {
                if (selectedPeriod !== period) {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPeriod !== period) {
                  e.currentTarget.style.borderColor = '#1e293b';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
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
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {/* Total Income Card */}
          <div
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '24px',
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
              }}
            />
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
          <div
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '24px',
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
              }}
            />
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
          <div
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '24px',
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
              }}
            />
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
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
            gap: '32px',
          }}
        >
          {/* Employers Breakdown */}
          <div
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              border: '1px solid #1e293b',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                }}
              >
                <PieChart size={20} color="#fff" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', margin: 0, color: '#fff' }}>
                Income Sources
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {employersData.length > 0 ? (
                employersData.map((employer, index) => {
                  const percentage = stats.total > 0 ? (employer.total / stats.total) * 100 : 0;
                  const colors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
                  const color = colors[index % colors.length];

                  return (
                    <div
                      key={employer.name}
                      style={{
                        padding: '20px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
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
          <div
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              border: '1px solid #1e293b',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
                }}
              >
                <CalendarIcon size={20} color="#fff" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', margin: 0, color: '#fff' }}>
                Recent Payments
              </h3>
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
                  <div
                    key={item.id}
                    style={{
                      padding: '18px',
                      background: 'rgba(16, 185, 129, 0.05)',
                      borderRadius: '16px',
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.1)';
                    }}
                  >
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
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '10px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                            minWidth: '44px',
                            minHeight: '44px',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                            e.currentTarget.style.color = '#6366f1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.color = '#64748b';
                          }}
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
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '10px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                            minWidth: '44px',
                            minHeight: '44px',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          }}
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              padding: 'clamp(24px, 5vw, 40px)',
              borderRadius: '32px',
              border: '1px solid #334155',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '95vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#94a3b8',
                borderRadius: '50%',
                minWidth: '44px',
                minHeight: '44px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            >
              <X size={20} />
            </button>

            <h2
              style={{
                fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                fontWeight: '900',
                marginBottom: '12px',
                color: '#fff',
              }}
            >
              {editId ? 'Edit Income' : 'Add New Income'}
            </h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '0.95rem' }}>
              {editId ? 'Update your income record' : 'Record a new income payment'}
            </p>

            <form
              onSubmit={handleLogIncome}
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '10px',
                    letterSpacing: '0.5px',
                  }}
                >
                  Income Source / Employer
                </label>
                <input
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="e.g. Acme Corp, Freelance Project"
                  required
                  style={{
                    width: '100%',
                    background: '#020617',
                    border: '2px solid #1e293b',
                    padding: '16px',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#10b981')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#1e293b')}
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
                  <label
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '10px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    style={{
                      width: '100%',
                      background: '#020617',
                      border: '2px solid #1e293b',
                      padding: '16px',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#10b981')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#1e293b')}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '10px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#020617',
                      border: '2px solid #1e293b',
                      padding: '16px',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#10b981')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#1e293b')}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '10px',
                    letterSpacing: '0.5px',
                  }}
                >
                  Credit to Account (Optional)
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) =>
                    setSelectedAccountId(e.target.value ? Number(e.target.value) : '')
                  }
                  style={{
                    width: '100%',
                    background: '#020617',
                    border: '2px solid #1e293b',
                    padding: '16px',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#10b981')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#1e293b')}
                >
                  <option value="">Just record, don&apos;t add to account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} - ₹{acc.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  padding: 'clamp(16px, 3vw, 18px)',
                  borderRadius: '18px',
                  border: 'none',
                  fontWeight: '900',
                  cursor: 'pointer',
                  fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s',
                  minHeight: '44px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)';
                }}
              >
                {editId ? 'Update Income' : 'Save Income'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
