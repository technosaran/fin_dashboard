"use client";

import { useState } from 'react';
import { useNotifications } from '../components/NotificationContext';
import { useFinance, AppSettings } from '../components/FinanceContext';
import {
    Save,
    Undo,
    Calculator,
    Layers,
    Info
} from 'lucide-react';

export default function SettingsPage() {
    const { settings, updateSettings, accounts, loading } = useFinance();
    const { showNotification, confirm: customConfirm } = useNotifications();
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

    const handleSave = async () => {
        try {
            await updateSettings(localSettings);
            showNotification('success', 'Configuration updated successfully');
        } catch {
            showNotification('error', 'Failed to save settings');
        }
    };

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
                autoCalculateCharges: true
            };
            setLocalSettings(defaults);
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
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
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
                        <button
                            onClick={handleSave}
                            aria-label="Save settings"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 20px rgba(99, 102, 241, 0.2)';
                            }}
                            style={{ padding: '12px 32px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                        >
                            <Save size={18} />
                            Commit Changes
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '32px' }}>

                    {/* Calculation Math */}
                    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '32px', padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#818cf8' }}>
                            <Calculator size={22} aria-hidden="true" />
                            <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: '800', margin: 0 }}>Math Engine (Indian Stocks)</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', gap: '16px', flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Auto-calculate Charges</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Apply STT, GST, and SEBI charges automatically</div>
                                </div>
                                <div
                                    onClick={() => setLocalSettings({ ...localSettings, autoCalculateCharges: !localSettings.autoCalculateCharges })}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '0.9';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                    role="switch"
                                    aria-checked={localSettings.autoCalculateCharges}
                                    aria-label="Toggle auto-calculate charges"
                                    style={{ width: '50px', height: '26px', background: localSettings.autoCalculateCharges ? '#6366f1' : '#1e293b', borderRadius: '100px', cursor: 'pointer', position: 'relative', transition: 'background 0.3s, opacity 0.2s', flexShrink: 0 }}
                                >
                                    <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: localSettings.autoCalculateCharges ? '27px' : '3px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Brokerage (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        value={localSettings.brokerageValue}
                                        onChange={e => setLocalSettings({ ...localSettings, brokerageValue: parseFloat(e.target.value) || 0 })}
                                        aria-label="Brokerage percentage"
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#818cf8';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#1e293b';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>STT Rate (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        value={localSettings.sttRate}
                                        onChange={e => setLocalSettings({ ...localSettings, sttRate: parseFloat(e.target.value) || 0 })}
                                        aria-label="STT rate"
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#818cf8';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#1e293b';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Exchange Trx (%)</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        max="1"
                                        value={localSettings.transactionChargeRate}
                                        onChange={e => setLocalSettings({ ...localSettings, transactionChargeRate: parseFloat(e.target.value) || 0 })}
                                        aria-label="Exchange transaction charge rate"
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#818cf8';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#1e293b';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>SEBI Charge (%)</label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        min="0"
                                        max="0.1"
                                        value={localSettings.sebiChargeRate}
                                        onChange={e => setLocalSettings({ ...localSettings, sebiChargeRate: parseFloat(e.target.value) || 0 })}
                                        aria-label="SEBI charge rate"
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#818cf8';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#1e293b';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Stamp Duty (%)</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        max="1"
                                        value={localSettings.stampDutyRate}
                                        onChange={e => setLocalSettings({ ...localSettings, stampDutyRate: parseFloat(e.target.value) || 0 })}
                                        aria-label="Stamp duty rate"
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#818cf8';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#1e293b';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>GST Rate (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="30"
                                        value={localSettings.gstRate}
                                        onChange={e => setLocalSettings({ ...localSettings, gstRate: parseFloat(e.target.value) || 0 })}
                                        aria-label="GST rate"
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#818cf8';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#1e293b';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>DP Charges (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={localSettings.dpCharges}
                                        onChange={e => setLocalSettings({ ...localSettings, dpCharges: parseFloat(e.target.value) || 0 })}
                                        aria-label="DP charges"
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#818cf8';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#1e293b';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '14px', color: '#fff', outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

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
                                        value={localSettings.defaultStockAccountId || ''}
                                        onChange={e => setLocalSettings({ ...localSettings, defaultStockAccountId: e.target.value ? Number(e.target.value) : undefined })}
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
                                        value={localSettings.defaultMfAccountId || ''}
                                        onChange={e => setLocalSettings({ ...localSettings, defaultMfAccountId: e.target.value ? Number(e.target.value) : undefined })}
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
                                        value={localSettings.defaultSalaryAccountId || ''}
                                        onChange={e => setLocalSettings({ ...localSettings, defaultSalaryAccountId: e.target.value ? Number(e.target.value) : undefined })}
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
        </div>
    );
}
