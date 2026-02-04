"use client";

import React, { useState } from 'react';
import {
    Command,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Github,
    Chrome,
    ShieldCheck,
    Zap,
    ChevronRight
} from 'lucide-react';

/**
 * Premium Nebula Login Page Mockup
 * 
 * DESIGN FEATURES:
 * 1. Glassmorphic Login Card
 * 2. Animated Mesh Gradients
 * 3. Interactive Input Fields
 * 4. Dual-tone Typography
 * 5. Multi-auth Support (Email, Github, Google)
 */

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock loading state
        setTimeout(() => setIsLoading(false), 2000);
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
                    animation: 'fadeInDown 0.8s ease-out'
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
                    animation: 'scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 8px 0' }}>Welcome back</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>Enter your credentials to access your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)'}
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
                                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)'}
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
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '32px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Or continue with</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
                    </div>

                    {/* Social Auth */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <button style={{
                            background: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '12px',
                            color: '#e2e8f0',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            transition: '0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)'}>
                            <Github size={20} /> Github
                        </button>
                        <button style={{
                            background: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '12px',
                            color: '#e2e8f0',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            transition: '0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)'}>
                            <Chrome size={20} /> Google
                        </button>
                    </div>
                </div>

                {/* Footer Link */}
                <p style={{ textAlign: 'center', marginTop: '32px', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Don&apos;t have an account? <a href="#" style={{ color: '#6366f1', fontWeight: '700', textDecoration: 'none' }}>Create an account</a>
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

            {/* Animations */}
            <style jsx global>{`
                @keyframes scaleUp {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
