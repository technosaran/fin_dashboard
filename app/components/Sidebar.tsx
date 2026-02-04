"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Wallet,
    Book,
    Banknote,
    Target,
    Settings,
    LogOut,
    Command,
    Users,
    TrendingUp,
    Activity
} from 'lucide-react';

import { useAuth } from './AuthContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { signOut } = useAuth();

    const navItems = [
        { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
        { label: 'Accounts', href: '/accounts', icon: <Wallet size={20} /> },
        { label: 'Stocks', href: '/stocks', icon: <TrendingUp size={20} /> },
        { label: 'Mutual Funds', href: '/mutual-funds', icon: <Activity size={20} /> },
        { label: 'Ledger', href: '/ledger', icon: <Book size={20} /> },
        { label: 'My Paydays', href: '/salary', icon: <Banknote size={20} /> },
        { label: 'Family', href: '/family', icon: <Users size={20} /> },
        { label: 'Goals', href: '/goals', icon: <Target size={20} /> },
    ];

    return (
        <aside style={{
            width: '200px',
            minWidth: '200px',
            backgroundColor: '#020617',
            borderRight: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            height: '100vh',
            zIndex: 100,
            flexShrink: 0
        }}>
            {/* Logo / Brand */}
            <div style={{ padding: '24px 16px', display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{
                    minWidth: '40px', height: '40px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '900', fontSize: '1.2rem',
                    boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
                    flexShrink: 0
                }}>
                    <Command size={22} />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
                    FIN<span style={{ color: '#6366f1' }}>CORE</span>
                </span>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }} role="navigation" aria-label="Main navigation">

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} aria-current={isActive ? 'page' : undefined}>
                            <div style={{
                                padding: '10px 12px',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                color: isActive ? '#fff' : '#94a3b8',
                                transition: 'all 0.2s',
                                position: 'relative',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                        e.currentTarget.style.color = '#cbd5e1';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#94a3b8';
                                    }
                                }}
                            >
                                <div style={{ color: isActive ? '#818cf8' : 'inherit', transition: 'color 0.2s' }} aria-hidden="true">
                                    {item.icon}
                                </div>
                                <span style={{ fontWeight: isActive ? '700' : '600', fontSize: '0.95rem' }}>{item.label}</span>
                                {isActive && (
                                    <div style={{ position: 'absolute', right: '12px', width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 10px #818cf8' }} aria-hidden="true" />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #1e293b' }}>
                <Link href="/settings" style={{ textDecoration: 'none' }}>
                    <div style={{
                        padding: '10px 12px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#64748b',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#cbd5e1'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                    >
                        <Settings size={20} />
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Settings</span>
                    </div>
                </Link>

                <div
                    onClick={signOut}
                    style={{
                        padding: '10px 12px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#f87171',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        marginTop: '8px'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                    <LogOut size={20} />
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Logout</span>
                </div>
            </div>
        </aside>
    );
}
