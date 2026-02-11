"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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
    Landmark,
    DollarSign,
    ChevronRight,
    Sparkles
} from 'lucide-react';

import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { useFinance } from './FinanceContext';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    enabled?: boolean;
    badge?: string;
    color?: string;
    settingsKey?: string;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { signOut, user } = useAuth();
    const { confirm: customConfirm } = useNotifications();
    const { settings, stocks, mutualFunds } = useFinance();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const isVisible = (key?: string) => {
        if (!key) return true;
        const value = settings[key as keyof typeof settings];
        return value !== false;
    };

    const navSections: NavSection[] = [
        {
            title: 'OVERVIEW',
            items: [
                { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={18} />, color: '#818cf8' },
                { label: 'Accounts', href: '/accounts', icon: <Wallet size={18} />, color: '#34d399' },
            ]
        },
        {
            title: 'INVESTMENTS',
            items: [
                { label: 'Stocks', href: '/stocks', icon: <TrendingUp size={18} />, badge: stocks.length > 0 ? `${stocks.length}` : undefined, color: '#10b981', settingsKey: 'stocksVisible' },
                { label: 'Mutual Funds', href: '/mutual-funds', icon: <Activity size={18} />, badge: mutualFunds.length > 0 ? `${mutualFunds.length}` : undefined, color: '#f59e0b', settingsKey: 'mutualFundsVisible' },
                { label: 'Bonds', href: '/bonds', icon: <Landmark size={18} />, enabled: settings.bondsEnabled, color: '#ec4899', settingsKey: 'bondsEnabled' },
                { label: 'FnO', href: '/fno', icon: <Zap size={18} />, color: '#a78bfa', settingsKey: 'fnoVisible' },
                { label: 'Forex', href: '/forex', icon: <DollarSign size={18} />, enabled: settings.forexEnabled, color: '#2dd4bf', settingsKey: 'forexEnabled' },
            ].filter(item => {
                if (item.enabled === false) return false;
                return isVisible(item.settingsKey);
            })
        },
        {
            title: 'TRACKING',
            items: [
                { label: 'Ledger', href: '/ledger', icon: <Book size={18} />, color: '#60a5fa', settingsKey: 'ledgerVisible' },
                { label: 'Income', href: '/salary', icon: <Banknote size={18} />, color: '#34d399', settingsKey: 'incomeVisible' },
                { label: 'Expenses', href: '/expenses', icon: <ShoppingBag size={18} />, color: '#fb923c', settingsKey: 'expensesVisible' },
            ].filter(item => isVisible(item.settingsKey))
        },
        {
            title: 'PLANNING',
            items: [
                { label: 'Goals', href: '/goals', icon: <Target size={18} />, color: '#f472b6', settingsKey: 'goalsVisible' },
                { label: 'Family', href: '/family', icon: <Users size={18} />, color: '#c084fc', settingsKey: 'familyVisible' },
            ].filter(item => isVisible(item.settingsKey))
        }
    ].filter(section => section.items.length > 0);

    return (
        <>
            <style jsx>{`
                aside {
                    width: 220px;
                    min-width: 220px;
                    background: linear-gradient(180deg, #020617 0%, #0a0f1e 50%, #020617 100%);
                    border-right: 1px solid rgba(99, 102, 241, 0.08);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: ${isOpen ? '0' : '-220px'};
                    top: 0;
                    bottom: 0;
                    height: 100vh;
                    z-index: 100;
                    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }
                aside::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 1px;
                    height: 100%;
                    background: linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.15) 50%, transparent 100%);
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
                <div style={{
                    padding: '20px 16px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        width: '120px',
                        height: '120px',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
                        top: '-20px',
                        left: '-20px',
                        filter: 'blur(20px)',
                        pointerEvents: 'none'
                    }} />
                    <div style={{
                        minWidth: '40px', height: '40px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                        borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: '900', fontSize: '1.2rem',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                        flexShrink: 0,
                        position: 'relative'
                    }}>
                        <Command size={20} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                            FIN<span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CORE</span>
                        </span>
                        <span style={{ fontSize: '0.6rem', color: '#475569', fontWeight: '600', letterSpacing: '0.5px' }}>
                            {currentTime && `${currentTime.toUpperCase()}`}
                        </span>
                    </div>
                </div>

                {/* Navigation Sections */}
                <nav style={{
                    flex: 1,
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }} role="navigation" aria-label="Main navigation">
                    {navSections.map((section, sectionIdx) => (
                        <div key={section.title} style={{ marginBottom: sectionIdx < navSections.length - 1 ? '4px' : '0' }}>
                            <div style={{
                                padding: '8px 12px 4px',
                                fontSize: '0.6rem',
                                fontWeight: '800',
                                color: '#334155',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase' as const,
                                userSelect: 'none' as const
                            }}>
                                {section.title}
                            </div>
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                const isHovered = hoveredItem === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '8px 12px',
                                            borderRadius: '12px',
                                            textDecoration: 'none',
                                            position: 'relative',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            background: isActive
                                                ? `linear-gradient(135deg, ${item.color}15, ${item.color}08)`
                                                : isHovered
                                                    ? 'rgba(255,255,255,0.03)'
                                                    : 'transparent',
                                            color: isActive ? '#fff' : isHovered ? '#cbd5e1' : '#64748b',
                                            borderLeft: isActive ? `2px solid ${item.color}` : '2px solid transparent',
                                            marginLeft: isActive ? '0' : '0',
                                        }}
                                        aria-current={isActive ? 'page' : undefined}
                                        onClick={onClose}
                                        onMouseEnter={() => setHoveredItem(item.href)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                    >
                                        <div style={{
                                            color: isActive ? item.color : 'inherit',
                                            transition: 'color 0.2s, transform 0.2s',
                                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            {item.icon}
                                        </div>
                                        <span style={{
                                            fontWeight: isActive ? '700' : '600',
                                            fontSize: '0.85rem',
                                            flex: 1,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {item.label}
                                        </span>
                                        {item.badge && (
                                            <span style={{
                                                background: isActive ? `${item.color}25` : 'rgba(255,255,255,0.06)',
                                                color: isActive ? item.color : '#64748b',
                                                padding: '1px 6px',
                                                borderRadius: '6px',
                                                fontSize: '0.65rem',
                                                fontWeight: '800',
                                                minWidth: '18px',
                                                textAlign: 'center',
                                                lineHeight: '16px',
                                                border: `1px solid ${isActive ? `${item.color}30` : 'rgba(255,255,255,0.06)'}`,
                                            }}>
                                                {item.badge}
                                            </span>
                                        )}
                                        {isActive && (
                                            <ChevronRight size={14} style={{ color: item.color, opacity: 0.7 }} />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div style={{
                    padding: '12px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '10%',
                        right: '10%',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.15), transparent)'
                    }} />

                    <Link href="/settings" style={{ textDecoration: 'none' }} onClick={onClose}>
                        <div style={{
                            padding: '8px 12px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: hoveredItem === 'settings' ? '#cbd5e1' : '#475569',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            background: hoveredItem === 'settings' ? 'rgba(255,255,255,0.03)' : 'transparent'
                        }}
                            onMouseEnter={() => setHoveredItem('settings')}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <Settings size={18} />
                            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Settings</span>
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
                            color: hoveredItem === 'logout' ? '#fca5a5' : '#ef4444',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            background: hoveredItem === 'logout' ? 'rgba(239, 68, 68, 0.06)' : 'transparent',
                            opacity: 0.8
                        }}
                        onMouseEnter={() => setHoveredItem('logout')}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        <LogOut size={18} />
                        <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Logout</span>
                    </div>

                    {/* User Badge */}
                    {user?.email && (
                        <div style={{
                            padding: '10px 12px',
                            marginTop: '4px',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(168, 85, 247, 0.04) 100%)',
                            borderRadius: '12px',
                            border: '1px solid rgba(99, 102, 241, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: '800',
                                fontSize: '0.7rem',
                                flexShrink: 0,
                                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)'
                            }}>
                                {user.email.charAt(0).toUpperCase()}
                            </div>
                            <div style={{
                                overflow: 'hidden',
                                flex: 1
                            }}>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: '#94a3b8',
                                    fontWeight: '600',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {user.email}
                                </div>
                            </div>
                            <Sparkles size={12} style={{ color: '#818cf8', flexShrink: 0, opacity: 0.5 }} />
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
