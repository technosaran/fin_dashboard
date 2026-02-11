"use client";

import { useState } from 'react';
import { useNotifications } from '../components/NotificationContext';
import { useFinance } from '../components/FinanceContext';
import { AppSettings } from '@/lib/types';
import {
    Save,
    Undo,
    Layers,
    Info,
    LayoutPanelLeft,
    Eye,
    EyeOff
} from 'lucide-react';

export default function SettingsPage() {
    const { settings, updateSettings, accounts, loading } = useFinance();
    const { showNotification, confirm: customConfirm } = useNotifications();

    const resetToDefaults = async () => {
        const isConfirmed = await customConfirm({
            title: 'Reset Configuration',
            message: 'Are you sure you want to reset all math engine and workflow defaults to their original states? This action cannot be undone.',
            type: 'warning',
            confirmLabel: 'Reset'
        });

        if (isConfirmed) {
            const defaults: AppSettings = {
                brokerageType: 'percentage',
                brokerageValue: 0,
                sttRate: 0.1,
                transactionChargeRate: 0.00345,
                sebiChargeRate: 0.0001,
                stampDutyRate: 0.015,
                gstRate: 18,
                dpCharges: 15.93,
                autoCalculateCharges: true,
                bondsEnabled: true,
                forexEnabled: true,
                stocksVisible: true,
                mutualFundsVisible: true,
                fnoVisible: true,
                ledgerVisible: true,
                incomeVisible: true,
                expensesVisible: true,
                goalsVisible: true,
                familyVisible: true,
            };
            await updateSettings(defaults);
            showNotification('info', 'Settings reset to factory defaults');
        }
    };

    if (loading) return null;

    return (
        <div className="main-content" style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>Engine Configuration</h1>
                        <p style={{ color: '#94a3b8', fontSize: 'clamp(0.875rem, 2vw, 1rem)', marginTop: '8px' }}>Calibrate your financial math and operational defaults</p>
                    </div>
                    <button
                        onClick={resetToDefaults}
                        aria-label="Reset to default settings"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.borderColor = '#334155';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.borderColor = '#1e293b';
                        }}
                        style={{ padding: '12px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', border: '1px solid #1e293b', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', transition: 'background 0.2s, border-color 0.2s' }}
                    >
                        <Undo size={18} /> Reset Defaults
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '32px' }}>

                {/* Calculation Math */}
                {/* Calculation Math Removed */}

                {/* Operational Defaults */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '32px', padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#10b981' }}>
                            <Layers size={22} aria-hidden="true" />
                            <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: '800', margin: 0 }}>Workflow Defaults</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Default Stock Funding Account</label>
                                <select
                                    value={settings.defaultStockAccountId || ''}
                                    onChange={e => updateSettings({ defaultStockAccountId: e.target.value ? Number(e.target.value) : undefined })}
                                    aria-label="Default stock funding account"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#10b981';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#1e293b';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none', cursor: 'pointer', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                                >
                                    <option value="">None / Manual Selection</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Default Mutual Fund Account</label>
                                <select
                                    value={settings.defaultMfAccountId || ''}
                                    onChange={e => updateSettings({ defaultMfAccountId: e.target.value ? Number(e.target.value) : undefined })}
                                    aria-label="Default mutual fund account"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#10b981';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#1e293b';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none', cursor: 'pointer', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                                >
                                    <option value="">None / Manual Selection</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Default Salary Credit Account</label>
                                <select
                                    value={settings.defaultSalaryAccountId || ''}
                                    onChange={e => updateSettings({ defaultSalaryAccountId: e.target.value ? Number(e.target.value) : undefined })}
                                    aria-label="Default salary credit account"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#10b981';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#1e293b';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none', cursor: 'pointer', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                                >
                                    <option value="">None / Manual Selection</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Enable Bonds Tracking</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Track Indian NCDs and Corporate Bonds</div>
                                </div>
                                <div
                                    onClick={() => updateSettings({ bondsEnabled: !settings.bondsEnabled })}
                                    role="switch"
                                    aria-checked={settings.bondsEnabled}
                                    style={{ width: '50px', height: '26px', background: settings.bondsEnabled ? '#10b981' : '#1e293b', borderRadius: '100px', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}
                                >
                                    <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: settings.bondsEnabled ? '27px' : '3px', transition: 'left 0.3s' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Enable Forex Trading</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Track Forex deposits, trades, and withdrawals</div>
                                </div>
                                <div
                                    onClick={() => updateSettings({ forexEnabled: !settings.forexEnabled })}
                                    role="switch"
                                    aria-checked={settings.forexEnabled}
                                    style={{ width: '50px', height: '26px', background: settings.forexEnabled ? '#10b981' : '#1e293b', borderRadius: '100px', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}
                                >
                                    <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: settings.forexEnabled ? '27px' : '3px', transition: 'left 0.3s' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '32px', padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', color: '#f59e0b' }}>
                            <LayoutPanelLeft size={22} aria-hidden="true" />
                            <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: '800', margin: 0 }}>Sidebar Sections</h3>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '24px', marginTop: 0 }}>
                            Toggle sections on/off in the sidebar. Disabling a section only hides it from navigation — your data is never erased.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { key: 'stocksVisible', label: 'Stocks', desc: 'Equity portfolio tracking', color: '#10b981' },
                                { key: 'mutualFundsVisible', label: 'Mutual Funds', desc: 'SIP & lumpsum investments', color: '#f59e0b' },
                                { key: 'fnoVisible', label: 'FnO', desc: 'Futures & options trading log', color: '#a78bfa' },
                                { key: 'ledgerVisible', label: 'Ledger', desc: 'Transaction history & records', color: '#60a5fa' },
                                { key: 'incomeVisible', label: 'Income', desc: 'Salary & income tracking', color: '#34d399' },
                                { key: 'expensesVisible', label: 'Expenses', desc: 'Expense categorization', color: '#fb923c' },
                                { key: 'goalsVisible', label: 'Goals', desc: 'Financial goal planner', color: '#f472b6' },
                                { key: 'familyVisible', label: 'Family', desc: 'Family fund transfers', color: '#c084fc' },
                            ].map(item => {
                                const isOn = settings[item.key as keyof AppSettings] !== false;
                                return (
                                    <div key={item.key} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '14px',
                                        border: `1px solid ${isOn ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)'}`,
                                        transition: 'all 0.2s',
                                        opacity: isOn ? 1 : 0.5,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '8px',
                                                background: isOn ? `${item.color}15` : 'rgba(255,255,255,0.03)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'background 0.2s'
                                            }}>
                                                {isOn
                                                    ? <Eye size={14} style={{ color: item.color }} />
                                                    : <EyeOff size={14} style={{ color: '#475569' }} />
                                                }
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: isOn ? '#e2e8f0' : '#64748b' }}>{item.label}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#475569' }}>{item.desc}</div>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => updateSettings({ [item.key]: !isOn })}
                                            role="switch"
                                            aria-checked={isOn}
                                            aria-label={`Toggle ${item.label} visibility`}
                                            style={{
                                                width: '44px',
                                                height: '24px',
                                                background: isOn ? item.color : '#1e293b',
                                                borderRadius: '100px',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'background 0.3s',
                                                flexShrink: 0
                                            }}
                                        >
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                background: '#fff',
                                                borderRadius: '50%',
                                                position: 'absolute',
                                                top: '3px',
                                                left: isOn ? '23px' : '3px',
                                                transition: 'left 0.3s',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}

                            <div style={{
                                marginTop: '8px',
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '14px',
                                fontSize: '0.75rem',
                                color: '#475569',
                                lineHeight: 1.5,
                                borderLeft: '2px solid #334155'
                            }}>
                                <strong style={{ color: '#64748b' }}>Note:</strong> Bonds and Forex visibility is controlled by the &quot;Enable Bonds Tracking&quot; and &quot;Enable Forex Trading&quot; toggles above. Dashboard and Accounts are always visible.
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px dashed rgba(99, 102, 241, 0.2)', borderRadius: '24px', padding: '24px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Info size={20} color="#818cf8" style={{ marginTop: '2px' }} />
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                                    These settings are stored locally in your browser. If you transition to the full production database, your config will be synced to the cloud engine automatically.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
