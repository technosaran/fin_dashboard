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
    Users
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
        { label: 'Accounts', href: '/accounts', icon: <Wallet size={20} /> },
        { label: 'Ledger', href: '/ledger', icon: <Book size={20} /> },
        { label: 'Salary Hub', href: '/salary', icon: <Banknote size={20} /> },
        { label: 'Family', href: '/family', icon: <Users size={20} /> },
        { label: 'Goals', href: '/goals', icon: <Target size={20} /> },
    ];

    return (
        <aside style={{
            width: '280px',
            backgroundColor: '#020617',
            borderRight: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            height: '100vh',
            zIndex: 100
        }}>
            {/* Logo / Brand */}
            <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden' }}>
                <div style={{
                    minWidth: '40px', height: '40px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '900', fontSize: '1.2rem',
                    boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                }}>
                    <Command size={22} />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>
                    FIN<span style={{ color: '#6366f1' }}>CORE</span>
                </span>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                color: isActive ? '#fff' : '#64748b',
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
                                        e.currentTarget.style.color = '#64748b';
                                    }
                                }}
                            >
                                <div style={{ color: isActive ? '#818cf8' : 'inherit', transition: 'color 0.2s' }}>
                                    {item.icon}
                                </div>
                                <span style={{ fontWeight: isActive ? '700' : '600', fontSize: '0.95rem' }}>{item.label}</span>
                                {isActive && (
                                    <div style={{ position: 'absolute', right: '12px', width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 10px #818cf8' }} />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #1e293b' }}>
                <Link href="/settings" style={{ textDecoration: 'none' }}>
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        color: '#64748b',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#cbd5e1'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                    >
                        <Settings size={20} />
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Preferences</span>
                    </div>
                </Link>

                <div style={{
                    padding: '12px 16px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    color: '#f87171',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    marginTop: '8px'
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                    <LogOut size={20} />
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Terminate Session</span>
                </div>
            </div>
        </aside>
    );
}
