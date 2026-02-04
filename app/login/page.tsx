"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import {
    Command,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#020617',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif",
            color: '#f8fafc'
        }}>
            {/* Background Decorative Elements */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '40%',
                height: '40%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                filter: 'blur(80px)',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '50%',
                height: '50%',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
                filter: 'blur(100px)',
                zIndex: 0
            }} />

            {/* Main Content Container */}
            <div style={{
                width: '100%',
                maxWidth: '480px',
                padding: '40px 24px',
                zIndex: 10,
                position: 'relative'
            }}>
                {/* Brand Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginBottom: '48px',
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
                    }}>
                        <Command size={28} />
                    </div>
                    <span style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>
                        FIN<span style={{ color: '#6366f1' }}>CORE</span>
                    </span>
                </div>

                {/* Login Card */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '32px',
                    padding: '40px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 8px 0' }}>Welcome back</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>Enter your credentials to access your dashboard</p>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            color: '#f87171',
                            fontSize: '0.85rem',
                            marginBottom: '24px',
                            fontWeight: '600'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Email Field */}
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid rgba(51, 65, 85, 0.5)',
                                        borderRadius: '16px',
                                        padding: '14px 14px 14px 48px',
                                        color: '#fff',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: '0.2s'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                                <a href="#" style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: '600', textDecoration: 'none' }}>Forgot password?</a>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid rgba(51, 65, 85, 0.5)',
                                        borderRadius: '16px',
                                        padding: '14px 44px 14px 48px',
                                        color: '#fff',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: '0.2s'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                marginTop: '12px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                color: '#fff',
                                padding: '16px',
                                borderRadius: '16px',
                                border: 'none',
                                fontWeight: '800',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 10px 20px rgba(99, 102, 241, 0.25)',
                                transition: '0.3s',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Link */}
                <p style={{ textAlign: 'center', marginTop: '32px', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Don&apos;t have an account? <Link href="/signup" style={{ color: '#6366f1', fontWeight: '700', textDecoration: 'none' }}>Create an account</Link>
                </p>

                {/* Security Badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '48px',
                    color: '#475569'
                }}>
                    <ShieldCheck size={16} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Protected by 256-bit AES encryption</span>
                </div>
            </div>

            <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
