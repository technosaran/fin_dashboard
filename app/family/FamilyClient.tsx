'use client';

import { useState } from 'react';
import { useNotifications } from '../components/NotificationContext';
import { useFinance } from '../components/FinanceContext';
import { FamilyTransfer } from '@/lib/types';
import {
  Users,
  X,
  Heart,
  TrendingDown,
  User,
  Clock,
  Edit3,
  Trash2,
  DollarSign,
  Home,
  Sparkles,
} from 'lucide-react';
import { EmptyFamilyVisual } from '../components/Visuals';

export default function FamilyClient() {
  const {
    accounts,
    familyTransfers,
    addFamilyTransfer,
    updateFamilyTransfer,
    deleteFamilyTransfer,
    loading,
  } = useFinance();
  const { showNotification, confirm: customConfirm } = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');

  // Form State
  const [recipient, setRecipient] = useState('');
  const [relationship, setRelationship] = useState('Parent');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount || parseFloat(amount) <= 0) return;

    const transferData = {
      recipient,
      relationship,
      amount: parseFloat(amount),
      date,
      purpose,
      notes,
      accountId: selectedAccountId ? Number(selectedAccountId) : undefined,
    };

    if (editId) {
      await updateFamilyTransfer(editId, transferData);
      showNotification('success', 'Transfer record updated');
    } else {
      await addFamilyTransfer(transferData);
      showNotification('success', 'Family transfer recorded ❤️');
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setEditId(null);
    setRecipient('');
    setRelationship('Parent');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setPurpose('');
    setNotes('');
    setSelectedAccountId('');
  };

  const handleEdit = (transfer: FamilyTransfer) => {
    setEditId(transfer.id);
    setRecipient(transfer.recipient);
    setRelationship(transfer.relationship);
    setAmount(transfer.amount.toString());
    setDate(transfer.date);
    setPurpose(transfer.purpose || '');
    setNotes(transfer.notes || '');
    setSelectedAccountId(transfer.accountId || '');
    setIsModalOpen(true);
  };

  // Calculate statistics
  const totalSent = familyTransfers.reduce((sum, t) => sum + t.amount, 0);
  const recipientsMap = familyTransfers.reduce(
    (acc, t) => {
      if (!acc[t.recipient])
        acc[t.recipient] = { total: 0, count: 0, relationship: t.relationship };
      acc[t.recipient].total += t.amount;
      acc[t.recipient].count += 1;
      return acc;
    },
    {} as Record<string, { total: number; count: number; relationship: string }>
  );
  const recipients = Object.entries(recipientsMap).sort((a, b) => b[1].total - a[1].total);

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
          <div style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94a3b8' }}>
            Loading family transfers...
          </div>
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
        padding: 'clamp(16px, 4vw, 24px)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '48px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: '900',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Family Support Hub
            </h1>
            <p
              style={{ color: '#94a3b8', fontSize: 'clamp(0.875rem, 2vw, 1rem)', marginTop: '8px' }}
            >
              Track financial support to parents and loved ones
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            aria-label="Log family transfer"
            style={{
              padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
              minHeight: '44px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
              color: 'white',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 20px rgba(236, 72, 153, 0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            <Heart size={18} fill="currentColor" /> Log Transfer
          </button>
        </div>

        {/* Performance Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: '32px',
            marginBottom: '48px',
          }}
        >
          {[
            {
              label: 'Total Support',
              value: `₹${totalSent.toLocaleString()}`,
              icon: <TrendingDown size={22} />,
              color: '#ec4899',
              sub: 'Lifetime contributions',
            },
            {
              label: 'Family Members',
              value: recipients.length,
              icon: <Users size={22} />,
              color: '#8b5cf6',
              sub: 'Recipients supported',
            },
            {
              label: 'Avg Per Transfer',
              value: `₹${familyTransfers.length > 0 ? (totalSent / familyTransfers.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}`,
              icon: <DollarSign size={22} />,
              color: '#06b6d4',
              sub: 'Average amount',
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: '#0f172a',
                padding: '32px',
                borderRadius: '28px',
                border: '1px solid #1e293b',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: `${stat.color}08`,
                  borderRadius: '50%',
                  filter: 'blur(30px)',
                }}
                aria-hidden="true"
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                  color: stat.color,
                }}
              >
                <span aria-hidden="true">{stat.icon}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#94a3b8',
                  }}
                >
                  {stat.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                  fontWeight: '950',
                  color: '#fff',
                  marginBottom: '8px',
                  letterSpacing: '-1px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: stat.color, fontWeight: '700' }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
            gap: '40px',
          }}
        >
          {/* Recipients Section */}
          <div>
            <h3
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                fontWeight: '800',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Home size={20} color="#ec4899" aria-hidden="true" /> Family Members
            </h3>
            {recipients.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recipients.map(([name, stats]) => (
                  <div
                    key={name}
                    style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      padding: '24px',
                      borderRadius: '24px',
                      border: '1px solid #1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.3s',
                      gap: '20px',
                      flexWrap: 'wrap',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(10px)';
                      e.currentTarget.style.borderColor = '#334155';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.borderColor = '#1e293b';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          background: 'rgba(236, 72, 153, 0.1)',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ec4899',
                          border: '1px solid rgba(236, 72, 153, 0.2)',
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      >
                        <User size={24} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            color: '#fff',
                            fontWeight: '800',
                            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {name}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700' }}>
                          {stats.relationship} • {stats.count} Transfers
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          color: '#f472b6',
                          fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
                          fontWeight: '900',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        ₹{stats.total.toLocaleString()}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#64748b',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                        }}
                      >
                        Total Support
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  background: 'rgba(15, 23, 42, 0.2)',
                  borderRadius: '32px',
                  border: '2px dashed #1e293b',
                  color: '#64748b',
                }}
              >
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
                  <EmptyFamilyVisual />
                </div>
                <h3
                  style={{
                    color: '#f8fafc',
                    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                    fontWeight: '800',
                    marginBottom: '8px',
                  }}
                >
                  No Family Transfers Yet
                </h3>
                <p
                  style={{ margin: 0, fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', color: '#94a3b8' }}
                >
                  Start tracking support to your loved ones.
                </p>
              </div>
            )}
          </div>

          {/* Transfer History */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: '32px',
              border: '1px solid #1e293b',
              padding: '32px',
            }}
          >
            <h3
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                fontWeight: '800',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Clock size={20} color="#8b5cf6" aria-hidden="true" /> Recent Transfers
            </h3>
            {familyTransfers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {familyTransfers.slice(0, 10).map((transfer, idx) => (
                  <div
                    key={transfer.id}
                    style={{ display: 'flex', gap: '20px', position: 'relative' }}
                  >
                    <div
                      style={{
                        width: '2px',
                        background: 'rgba(236, 72, 153, 0.1)',
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#ec4899',
                          position: 'absolute',
                          top: '24px',
                          zIndex: 1,
                          border: '3px solid #0f172a',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        paddingBottom:
                          idx === Math.min(familyTransfers.slice(0, 10).length - 1, 9)
                            ? '0'
                            : '24px',
                        paddingTop: '16px',
                      }}
                    >
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          padding: '16px 20px',
                          borderRadius: '16px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '8px',
                            gap: '12px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: '800',
                                fontSize: '0.95rem',
                                color: '#cbd5e1',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {transfer.recipient}
                            </div>
                            <div
                              style={{
                                fontSize: '0.7rem',
                                color: '#64748b',
                                fontWeight: '600',
                                marginTop: '4px',
                              }}
                            >
                              {transfer.relationship} • {transfer.date}
                            </div>
                            {transfer.purpose && (
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#94a3b8',
                                  marginTop: '6px',
                                  fontStyle: 'italic',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {transfer.purpose}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              marginLeft: '12px',
                              flexShrink: 0,
                            }}
                          >
                            <button
                              onClick={() => handleEdit(transfer)}
                              aria-label={`Edit transfer to ${transfer.recipient}`}
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: 'none',
                                color: '#64748b',
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={async () => {
                                const isConfirmed = await customConfirm({
                                  title: 'Delete Transfer',
                                  message: `Are you sure you want to delete the record for ${transfer.recipient}?`,
                                  type: 'error',
                                  confirmLabel: 'Delete',
                                });
                                if (isConfirmed) {
                                  await deleteFamilyTransfer(transfer.id);
                                  showNotification('success', 'Transfer deleted');
                                }
                              }}
                              aria-label={`Delete transfer to ${transfer.recipient}`}
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
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div
                          style={{
                            color: '#f472b6',
                            fontWeight: '950',
                            fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                            marginTop: '8px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          ₹{transfer.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                <Sparkles
                  size={40}
                  strokeWidth={1}
                  style={{ opacity: 0.2, margin: '0 auto 16px' }}
                  aria-hidden="true"
                />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>No transfers recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal - Add/Edit Transfer */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(15px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#0f172a',
              padding: 'clamp(24px, 5vw, 40px)',
              borderRadius: '32px',
              border: '1px solid #334155',
              width: '100%',
              maxWidth: '550px',
              maxHeight: '95vh',
              overflowY: 'auto',
              boxShadow: '0 50px 100px rgba(0,0,0,0.7)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '40px',
                gap: '12px',
              }}
            >
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: '900', margin: 0 }}>
                {editId ? 'Edit Transfer' : 'New Transfer'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: '#94a3b8',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              aria-label="Family transfer form"
              style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                  gap: '24px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Recipient Name
                  </label>
                  <input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. Mother"
                    required
                    aria-label="Recipient name"
                    style={{
                      background: '#020617',
                      border: '1px solid #1e293b',
                      padding: '18px',
                      borderRadius: '18px',
                      color: '#fff',
                      fontSize: '1.1rem',
                      outline: 'none',
                    }}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    aria-label="Relationship type"
                    style={{
                      background: '#020617',
                      border: '1px solid #1e293b',
                      padding: '18px',
                      borderRadius: '18px',
                      color: '#fff',
                      fontSize: '1.1rem',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Parent">Parent</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                  gap: '24px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                    aria-label="Transfer amount"
                    style={{
                      background: '#020617',
                      border: '1px solid #1e293b',
                      padding: '18px',
                      borderRadius: '18px',
                      color: '#fff',
                      fontSize: '1.1rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    aria-label="Transfer date"
                    style={{
                      background: '#020617',
                      border: '1px solid #1e293b',
                      padding: '18px',
                      borderRadius: '18px',
                      color: '#fff',
                      fontSize: '1.1rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Purpose
                </label>
                <input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Monthly support, Medical expenses"
                  aria-label="Transfer purpose"
                  style={{
                    background: '#020617',
                    border: '1px solid #1e293b',
                    padding: '18px',
                    borderRadius: '18px',
                    color: '#fff',
                    fontSize: '1.1rem',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional details..."
                  aria-label="Transfer notes"
                  style={{
                    background: '#020617',
                    border: '1px solid #1e293b',
                    padding: '18px',
                    borderRadius: '18px',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none',
                    minHeight: '80px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Operating Bank Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                  aria-label="Select bank account"
                  style={{
                    background: '#020617',
                    border: '1px solid #1e293b',
                    padding: '18px',
                    borderRadius: '18px',
                    color: '#fff',
                    fontSize: '1.1rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">No Account (Ledger Only)</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} - ₹{acc.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                aria-label={editId ? 'Update transfer' : 'Record transfer'}
                style={{
                  marginTop: '12px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
                  color: '#fff',
                  padding: 'clamp(16px, 3vw, 20px)',
                  minHeight: '44px',
                  borderRadius: '20px',
                  border: 'none',
                  fontWeight: '900',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  boxShadow: '0 15px 30px rgba(236, 72, 153, 0.4)',
                }}
              >
                {editId ? 'Update Transfer' : 'Record Transfer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
