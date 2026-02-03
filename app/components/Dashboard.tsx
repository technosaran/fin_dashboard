"use client";

import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { useFinance } from './FinanceContext';

export default function Dashboard() {
    const { accounts } = useFinance();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            setGreeting('Good Morning ☀️');
        } else if (hour >= 12 && hour < 17) {
            setGreeting('Good Afternoon 🌤️');
        } else if (hour >= 17 && hour < 21) {
            setGreeting('Good Evening 🌆');
        } else {
            setGreeting('Good Night 🌙');
        }
    }, []);

    // Calculate Totals
    const totalUSD = accounts.filter(a => a.currency === 'USD').reduce((sum, acc) => sum + acc.balance, 0);
    const totalINR = accounts.filter(a => a.currency === 'INR').reduce((sum, acc) => sum + acc.balance, 0);

    return (
        <div className="main-content">
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ marginBottom: '30px' }}>
                    <h1 className="greeting-text">{greeting}, Saran</h1>
                    <p style={{ color: '#94a3b8' }}>Welcome to your financial dashboard.</p>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                    {/* Net Worth Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        padding: '25px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Total Net Worth</span>
                            <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: '#3b82f6' }}>
                                <Wallet size={20} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
                                ${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            {totalINR > 0 && (
                                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#94a3b8' }}>
                                    ₹{totalINR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                            <span style={{ color: '#4ade80', fontWeight: '500' }}>Live</span>
                            <span style={{ color: '#64748b' }}>Updated just now</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
