"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, Book, Banknote, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>F</div>
                FinDashboard
            </div>
            <nav className="flex-1">
                <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link href="/accounts" className={`nav-link ${pathname === '/accounts' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Wallet size={20} />
                    <span>Accounts</span>
                </Link>
                <Link href="/ledger" className={`nav-link ${pathname === '/ledger' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Book size={20} />
                    <span>Ledger</span>
                </Link>
                <Link href="/salary" className={`nav-link ${pathname === '/salary' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Banknote size={20} />
                    <span>Salary</span>
                </Link>
            </nav>

            <div className="sidebar-bottom">
                <Link href="/settings" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Settings size={20} />
                    <span>Settings</span>
                </Link>
                <button className="nav-link logout-btn" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
