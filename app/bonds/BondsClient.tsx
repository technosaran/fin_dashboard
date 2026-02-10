"use client";

import { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Landmark,
    TrendingUp,
    ShieldCheck,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Percent,
    Wallet,
    Trash2,
    Eye,
} from 'lucide-react';
import { useFinance, calculateBondCharges, Bond } from '../components/FinanceContext';
import { SkeletonCard } from '../components/SkeletonLoader';
import { useNotifications } from '../components/NotificationContext';
import AddBondModal from '../components/AddBondModal';

export default function BondsClient() {
    const { bonds, loading, deleteBond, settings } = useFinance();
    const { showNotification, confirm } = useNotifications();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewingCharges, setViewingCharges] = useState<Bond | null>(null);

    // Filter bonds based on search
    const filteredBonds = useMemo(() => {
        return bonds.filter(b =>
            b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.isin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [bonds, searchQuery]);

    // Financial calculations
    const stats = useMemo(() => {
        const totalInvested = bonds.reduce((sum, b) => sum + b.investmentAmount, 0);
        const currentValue = bonds.reduce((sum, b) => sum + b.currentValue, 0);
        const totalPnL = currentValue - totalInvested;
        const avgYield = bonds.length > 0
            ? bonds.reduce((sum, b) => sum + b.couponRate, 0) / bonds.length
            : 0;

        return { totalInvested, currentValue, totalPnL, avgYield };
    }, [bonds]);

    if (loading) {
        return (
            <div className="page-container">
                <div className="bg-mesh" />
                <div className="dashboard-header">
                    <div className="skeleton" style={{ height: '40px', width: '250px' }} />
                </div>
                <div className="grid-responsive-3 mb-xl">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
                <div className="premium-card" style={{ height: '400px' }}>
                    <div className="skeleton" style={{ height: '100%', width: '100%' }} />
                </div>
            </div>
        );
    }

    if (!settings.bondsEnabled) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                <div className="bg-mesh" />
                <div className="premium-card p-2xl text-center" style={{ maxWidth: '500px', padding: '48px' }}>
                    <Landmark size={48} className="mb-md" style={{ color: '#64748b', opacity: 0.5, margin: '0 auto 24px auto' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '12px' }}>Bonds Section Disabled</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        You have disabled the bonds tracking section in your settings.
                        Enable it to track your Wint Wealth and other fixed-income investments.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="bg-mesh" />

            <header className="dashboard-header">
                <div className="fade-in">
                    <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Landmark className="text-glow" style={{ color: 'var(--accent)' }} size={32} />
                        <span>Bonds <span className="title-accent">& Fixed Income</span></span>
                    </h1>
                </div>

                <div className="flex gap-sm">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="glass-button glow-primary"
                        style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', borderColor: 'transparent' }}
                    >
                        <Plus size={18} /> Add Bond
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid-responsive-4 mb-xl fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="premium-card p-lg" style={{ padding: '24px' }}>
                    <div className="flex justify-between items-start mb-sm" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div className="stat-label" style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Total Investment</div>
                        <Wallet size={16} style={{ color: '#6366f1' }} />
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: '900' }}>₹{stats.totalInvested.toLocaleString()}</div>
                </div>

                <div className="premium-card p-lg" style={{ padding: '24px' }}>
                    <div className="flex justify-between items-start mb-sm" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div className="stat-label" style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Current Value</div>
                        <TrendingUp size={16} style={{ color: '#10b981' }} />
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: '900' }}>₹{stats.currentValue.toLocaleString()}</div>
                </div>

                <div className="premium-card p-lg" style={{ padding: '24px' }}>
                    <div className="flex justify-between items-start mb-sm" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div className="stat-label" style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Net Gain/Loss</div>
                        <div style={{ color: stats.totalPnL >= 0 ? '#10b981' : '#ef4444' }}>
                            {stats.totalPnL >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: '900', color: stats.totalPnL >= 0 ? '#10b981' : '#ef4444' }}>
                        ₹{Math.abs(stats.totalPnL).toLocaleString()}
                    </div>
                </div>

                <div className="premium-card p-lg" style={{ padding: '24px' }}>
                    <div className="flex justify-between items-start mb-sm" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div className="stat-label" style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Avg. Coupon Rate</div>
                        <Percent size={16} style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: '900', color: '#f59e0b' }}>{stats.avgYield.toFixed(2)}%</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-lg fade-in" style={{ marginBottom: '24px' }}>
                <div style={{ position: 'relative', flex: '0 1 400px' }}>
                    <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search by ISIN or bond name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 48px',
                            background: 'var(--surface)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '16px',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Bonds List */}
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredBonds.length > 0 ? (
                    filteredBonds.map((bond, idx) => (
                        <div
                            key={bond.id}
                            className="premium-card p-lg mb-md"
                            style={{
                                animationDelay: `${idx * 0.1}s`,
                                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.4) 100%)',
                                padding: '24px'
                            }}
                        >
                            <div className="flex flex-wrap items-center gap-lg" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
                                {/* Bond Name & Info */}
                                <div style={{ flex: '1 1 300px' }}>
                                    <div className="flex items-center gap-sm mb-xs" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>{bond.name}</h3>
                                        <div style={{
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            color: 'var(--accent-hover)',
                                            fontSize: '0.65rem',
                                            fontWeight: '800',
                                            textTransform: 'uppercase'
                                        }}>
                                            {bond.isin}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                        <ShieldCheck size={14} /> {bond.companyName}
                                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#334155' }} />
                                        <Calendar size={14} /> Matures {new Date(bond.maturityDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                    </div>
                                </div>

                                {/* Yield & Frequency */}
                                <div style={{ flex: '0 0 160px', textAlign: 'center' }}>
                                    <div className="stat-label mb-xs" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Coupon Rate</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '950', color: '#f59e0b' }}>{bond.couponRate.toFixed(2)}%</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase' }}>{bond.interestFrequency}</div>
                                </div>

                                {/* Investment Value */}
                                <div style={{ flex: '0 0 180px', textAlign: 'right' }}>
                                    <div className="stat-label mb-xs" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Current Value</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '950' }}>₹{bond.currentValue.toLocaleString()}</div>
                                    <div className="flex items-center justify-end gap-xs" style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: '800',
                                        color: bond.pnl >= 0 ? '#10b981' : '#ef4444'
                                    }}>
                                        {bond.pnl >= 0 ? '+' : ''}₹{bond.pnl.toLocaleString()} ({bond.pnlPercentage.toFixed(1)}%)
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-sm" style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setViewingCharges(bond)}
                                        className="glass-button p-sm"
                                        style={{ color: 'var(--accent-hover)', padding: '8px', borderRadius: '8px' }}
                                        title="Estimated Sell Charges"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const isConfirmed = await confirm({
                                                title: 'Delete Bond?',
                                                message: `Are you sure you want to remove ${bond.name} from your portfolio?`,
                                                type: 'error'
                                            });
                                            if (isConfirmed) {
                                                await deleteBond(bond.id);
                                                showNotification('success', 'Bond removed successfully');
                                            }
                                        }}
                                        className="glass-button p-sm"
                                        style={{ color: '#f87171', padding: '8px', borderRadius: '8px' }}
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="premium-card p-2xl text-center" style={{ padding: '64px', textAlign: 'center' }}>
                        <div style={{ opacity: 0.2, marginBottom: '16px' }}><Landmark size={64} style={{ margin: '0 auto' }} /></div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>No Bonds Found</h3>
                        <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>
                            {searchQuery ? 'Try adjusting your search query.' : 'Start tracking your fixed-income portfolio by adding your first bond.'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="glass-button glow-primary"
                                style={{ padding: '12px 24px', background: 'var(--accent)', borderColor: 'transparent', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Plus size={18} /> Add Premium Bonds
                            </button>
                        )}
                    </div>
                )}
            </div>

            {viewingCharges && (() => {
                const charges = calculateBondCharges('SELL', viewingCharges.quantity, viewingCharges.currentPrice, settings);
                return (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
                        <div style={{ background: '#0f172a', padding: '24px', borderRadius: '20px', border: '1px solid #334155', width: '100%', maxWidth: '380px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0 }}>Exit Charges</h2>
                                <button onClick={() => setViewingCharges(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Plus size={16} style={{ transform: 'rotate(45deg)' }} />
                                </button>
                            </div>

                            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px', fontWeight: '700' }}>{viewingCharges.isin}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff' }}>{viewingCharges.name}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Brokerage</span>
                                    <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem' }}>₹{charges.brokerage.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Stamp Duty</span>
                                    <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem' }}>₹{charges.stampDuty.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>GST</span>
                                    <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem' }}>₹{charges.gst.toFixed(2)}</span>
                                </div>
                                <div style={{ height: '1px', background: '#1e293b', margin: '4px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#fff', fontWeight: '800', fontSize: '0.95rem' }}>Total</span>
                                    <span style={{ color: '#38bdf8', fontSize: '1.15rem', fontWeight: '900' }}>₹{charges.total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button onClick={() => setViewingCharges(null)} style={{ width: '100%', background: '#38bdf8', color: '#000', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer', marginTop: '20px', fontSize: '0.9rem' }}>
                                Close
                            </button>
                        </div>
                    </div>
                );
            })()}

            <AddBondModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
}
