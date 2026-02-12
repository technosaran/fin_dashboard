"use client";

import { useNotifications } from '../components/NotificationContext';
import { useFinance } from '../components/FinanceContext';
import { AppSettings } from '@/lib/types';
import {
    Undo,
    Layers,
    Info,
    LayoutPanelLeft,
    Eye
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
        <div className="main-content" style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', padding: '32px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', margin: 0, letterSpacing: '-0.02em', color: '#fff', background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Settings</h1>
                        <p style={{ color: '#94a3b8', fontSize: 'clamp(0.875rem, 2vw, 1rem)', marginTop: '8px' }}>Configure your dashboard preferences and defaults</p>
                    </div>
                    <button
                        onClick={resetToDefaults}
                        aria-label="Reset to default settings"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)';
                            e.currentTarget.style.borderColor = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                        }}
                        style={{ padding: '12px 24px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                    >
                        <Undo size={18} /> Reset All
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', gap: '32px' }}>

                {/* Calculation Math */}
                {/* Calculation Math Removed */}

                {/* Operational Defaults */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Account Defaults */}
                    <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                                <Layers size={20} color="#fff" aria-hidden="true" />
                            </div>
                            <h3 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', fontWeight: '800', margin: 0, color: '#fff' }}>Account Defaults</h3>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.6' }}>
                            Set default accounts for different transaction types to streamline your workflow.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>📈 Stock Trading Account</label>
                                <select
                                    value={settings.defaultStockAccountId || ''}
                                    onChange={e => updateSettings({ defaultStockAccountId: e.target.value ? Number(e.target.value) : undefined })}
                                    aria-label="Default stock funding account"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#6366f1';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#334155';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    style={{ width: '100%', background: '#020617', border: '1px solid #334155', padding: '14px 16px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', fontWeight: '600', outline: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    <option value="">Select manually each time</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>💼 Mutual Fund Account</label>
                                <select
                                    value={settings.defaultMfAccountId || ''}
                                    onChange={e => updateSettings({ defaultMfAccountId: e.target.value ? Number(e.target.value) : undefined })}
                                    aria-label="Default mutual fund account"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#6366f1';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#334155';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    style={{ width: '100%', background: '#020617', border: '1px solid #334155', padding: '14px 16px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', fontWeight: '600', outline: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    <option value="">Select manually each time</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>💰 Salary Credit Account</label>
                                <select
                                    value={settings.defaultSalaryAccountId || ''}
                                    onChange={e => updateSettings({ defaultSalaryAccountId: e.target.value ? Number(e.target.value) : undefined })}
                                    aria-label="Default salary credit account"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#6366f1';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#334155';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    style={{ width: '100%', background: '#020617', border: '1px solid #334155', padding: '14px 16px', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', fontWeight: '600', outline: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    <option value="">Select manually each time</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Module Toggles */}
                    <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(168, 85, 247, 0.15)', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)' }}>
                                <Eye size={20} color="#fff" aria-hidden="true" />
                            </div>
                            <h3 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', fontWeight: '800', margin: 0, color: '#fff' }}>Module Toggles</h3>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.6' }}>
                            Enable or disable tracking modules. Your data is never deleted when you disable a module.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.15)', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.06)'}>
                                <div>
                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>📊 Bonds Tracking</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Track NCDs and Corporate Bonds</div>
                                </div>
                                <div
                                    onClick={() => updateSettings({ bondsEnabled: !settings.bondsEnabled })}
                                    role="switch"
                                    aria-checked={settings.bondsEnabled}
                                    style={{ width: '52px', height: '28px', background: settings.bondsEnabled ? '#10b981' : '#334155', borderRadius: '100px', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', boxShadow: settings.bondsEnabled ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none' }}
                                >
                                    <div style={{ width: '22px', height: '22px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: settings.bondsEnabled ? '27px' : '3px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px', background: 'rgba(45, 212, 191, 0.06)', borderRadius: '16px', border: '1px solid rgba(45, 212, 191, 0.15)', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(45, 212, 191, 0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(45, 212, 191, 0.06)'}>
                                <div>
                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>💱 Forex Trading</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Track forex deposits, trades & withdrawals</div>
                                </div>
                                <div
                                    onClick={() => updateSettings({ forexEnabled: !settings.forexEnabled })}
                                    role="switch"
                                    aria-checked={settings.forexEnabled}
                                    style={{ width: '52px', height: '28px', background: settings.forexEnabled ? '#2dd4bf' : '#334155', borderRadius: '100px', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', boxShadow: settings.forexEnabled ? '0 2px 8px rgba(45, 212, 191, 0.4)' : 'none' }}
                                >
                                    <div style={{ width: '22px', height: '22px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: settings.forexEnabled ? '27px' : '3px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Visibility */}
                    <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
                                <LayoutPanelLeft size={20} color="#fff" aria-hidden="true" />
                            </div>
                            <h3 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', fontWeight: '800', margin: 0, color: '#fff' }}>Sidebar Sections</h3>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.6' }}>
                            Show or hide sections in the sidebar navigation. Your data remains safe when hidden.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { key: 'stocksVisible', label: 'Stocks', desc: 'Equity portfolio tracking', color: '#10b981', icon: '📈' },
                                { key: 'mutualFundsVisible', label: 'Mutual Funds', desc: 'SIP & lumpsum investments', color: '#f59e0b', icon: '💼' },
                                { key: 'fnoVisible', label: 'FnO', desc: 'Futures & options trading log', color: '#a78bfa', icon: '⚡' },
                                { key: 'ledgerVisible', label: 'Ledger', desc: 'Transaction history & records', color: '#60a5fa', icon: '📖' },
                                { key: 'incomeVisible', label: 'Income', desc: 'Salary & income tracking', color: '#34d399', icon: '💰' },
                                { key: 'expensesVisible', label: 'Expenses', desc: 'Expense categorization', color: '#fb923c', icon: '🛍️' },
                                { key: 'goalsVisible', label: 'Goals', desc: 'Financial goal planner', color: '#f472b6', icon: '🎯' },
                                { key: 'familyVisible', label: 'Family', desc: 'Family fund transfers', color: '#c084fc', icon: '👨‍👩‍👧' },
                            ].map(item => {
                                const isOn = settings[item.key as keyof AppSettings] !== false;
                                return (
                                    <div key={item.key} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '16px 20px',
                                        background: isOn ? `${item.color}08` : 'rgba(255,255,255,0.02)',
                                        borderRadius: '14px',
                                        border: `1px solid ${isOn ? `${item.color}20` : 'rgba(255,255,255,0.05)'}`,
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                        onClick={() => updateSettings({ [item.key]: !isOn })}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                                            <div style={{
                                                fontSize: '1.5rem',
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: isOn ? 1 : 0.4
                                            }}>
                                                {item.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: isOn ? '#fff' : '#64748b', marginBottom: '2px' }}>{item.label}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.desc}</div>
                                            </div>
                                        </div>
                                        <div
                                            role="switch"
                                            aria-checked={isOn}
                                            aria-label={`Toggle ${item.label} visibility`}
                                            style={{
                                                width: '48px',
                                                height: '26px',
                                                background: isOn ? item.color : '#334155',
                                                borderRadius: '100px',
                                                position: 'relative',
                                                transition: 'background 0.3s',
                                                flexShrink: 0,
                                                boxShadow: isOn ? `0 2px 8px ${item.color}40` : 'none'
                                            }}
                                        >
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                background: '#fff',
                                                borderRadius: '50%',
                                                position: 'absolute',
                                                top: '3px',
                                                left: isOn ? '25px' : '3px',
                                                transition: 'left 0.3s',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}

                            <div style={{
                                marginTop: '12px',
                                padding: '16px',
                                background: 'rgba(59, 130, 246, 0.05)',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                color: '#64748b',
                                lineHeight: 1.6,
                                borderLeft: '3px solid #3b82f6'
                            }}>
                                <strong style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>💡 Note:</strong>
                                Bonds and Forex visibility is controlled separately via Module Toggles above. Dashboard and Accounts sections are always visible.
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '20px', padding: '24px' }}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'start' }}>
                            <Info size={22} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <div>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                                    Your settings are stored in your browser&apos;s local storage. When transitioning to cloud sync, your preferences will be automatically backed up.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}
