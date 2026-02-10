"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Wallet,
    TrendingUp,
    Activity,
    Book,
    Banknote,
    Users,
    Target,
    Zap,
    Settings,
    LogOut,
    Command,
    ShoppingBag,
    Landmark
} from 'lucide-react';

import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { useFinance } from './FinanceContext';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { signOut } = useAuth();
    const { confirm: customConfirm } = useNotifications(); const { settings } = useFinance();


    const navItems = [
        { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
        { label: 'Accounts', href: '/accounts', icon: <Wallet size={20} /> },
        { label: 'Stocks', href: '/stocks', icon: <TrendingUp size={20} /> },
        { label: 'Mutual Funds', href: '/mutual-funds', icon: <Activity size={20} /> },
        { label: 'Bonds', href: '/bonds', icon: <Landmark size={20} />, enabled: settings.bondsEnabled },
        { label: 'FnO', href: '/fno', icon: <Zap size={20} /> },
        { label: 'Ledger', href: '/ledger', icon: <Book size={20} /> },
        { label: 'Income', href: '/salary', icon: <Banknote size={20} /> },
        { label: 'Expenses', href: '/expenses', icon: <ShoppingBag size={20} /> },
        { label: 'Goals', href: '/goals', icon: <Target size={20} /> },
        { label: 'Family', href: '/family', icon: <Users size={20} /> },
    ].filter(item => item.enabled === undefined || item.enabled === true);

    return (
        <>
            <style jsx>{`
                aside {
                    width: 200px;
                    min-width: 200px;
                    background-color: #020617;
                    border-right: 1px solid #1e293b;
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: ${isOpen ? '0' : '-200px'};
                    top: 0;
                    bottom: 0;
                    height: 100vh;
                    z-index: 100;
                    transition: left 0.3s ease-in-out;
                }
                @media (min-width: 768px) {
                    aside {
                        position: sticky;
                        left: 0 !important;
                    }
                }
            `}</style>
            <aside>
                {/* Logo / Brand */}
                <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden', flexShrink: 0 }}>
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
                <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }} role="navigation" aria-label="Main navigation">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                                aria-current={isActive ? 'page' : undefined}
                                onClick={onClose}
                            >
                                <div className="nav-item-icon" aria-hidden="true">
                                    {item.icon}
                                </div>
                                <span className="nav-item-text">{item.label}</span>

                                {isActive && (
                                    <div className="nav-item-indicator" aria-hidden="true" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #1e293b' }}>



                    <Link href="/settings" style={{ textDecoration: 'none' }} onClick={onClose}>
                        <div style={{
                            padding: '8px 12px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: '#64748b',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#cbd5e1'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                        >
                            <Settings size={20} />
                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Settings</span>
                        </div>
                    </Link>

                    <div
                        onClick={async () => {
                            const isConfirmed = await customConfirm({
                                title: 'Leaving FINCORE?',
                                message: 'Are you sure you want to log out of your secure session?',
                                type: 'warning',
                                confirmLabel: 'Logout',
                                cancelLabel: 'Stay'
                            });
                            if (isConfirmed) {
                                signOut();
                                onClose?.();
                            }
                        }}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: '#f87171',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            marginTop: '4px'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                        <LogOut size={20} />
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Logout</span>
                    </div>
                </div>


            </aside>
        </>
    );
}

