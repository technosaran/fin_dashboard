'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Command, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#020617',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        color: '#f8fafc',
      }}
    >
      {/* Background Decorative Elements */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          filter: 'blur(120px)',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-20%',
          width: '70%',
          height: '70%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          filter: 'blur(150px)',
          zIndex: 0,
        }}
      />

      {/* Main Content Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '40px 24px',
          zIndex: 10,
          position: 'relative',
        }}
      >
        {/* Brand Logo */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '56px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 15px 35px rgba(99, 102, 241, 0.5)',
              transform: 'rotate(-5deg)',
            }}
          >
            <Command size={36} />
          </div>
          <span
            style={{ fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-2px', color: '#fff' }}
          >
            FIN<span style={{ color: '#6366f1' }}>CORE</span>
          </span>
        </div>

        {/* Login Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '40px',
            padding: '48px',
            boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 8px 0' }}>
              Welcome back
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
              Enter your credentials to access your dashboard
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '12px 16px',
                borderRadius: '12px',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '24px',
                fontWeight: '600',
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleEmailLogin}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Email Field */}
            <div>
              <label
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    transition: 'color 0.3s',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  aria-label="Email Address"
                  aria-describedby="email-hint"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                    const icon = e.target.previousSibling as HTMLElement;
                    if (icon) icon.style.color = '#6366f1';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)';
                    e.target.style.boxShadow = 'none';
                    const icon = e.target.previousSibling as HTMLElement;
                    if (icon) icon.style.color = '#64748b';
                  }}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    borderRadius: '16px',
                    padding: '14px 14px 14px 48px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
              >
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Password
                </label>
                <a
                  href="#"
                  style={{
                    color: '#6366f1',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#818cf8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#6366f1')}
                >
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    transition: 'color 0.3s',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  aria-label="Password"
                  aria-describedby="password-hint"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                    const icon = e.target.previousSibling as HTMLElement;
                    if (icon) icon.style.color = '#6366f1';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)';
                    e.target.style.boxShadow = 'none';
                    const icon = e.target.previousSibling as HTMLElement;
                    if (icon) icon.style.color = '#64748b';
                  }}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    borderRadius: '16px',
                    padding: '14px 44px 14px 48px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#6366f1')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '8px',
                    transition: 'color 0.2s',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Device Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <input
                type="checkbox"
                id="rememberDevice"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                aria-label="Remember this device"
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#6366f1',
                }}
              />
              <label
                htmlFor="rememberDevice"
                style={{
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                Remember this device for 30 days
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              aria-label="Sign in to your account"
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(99, 102, 241, 0.25)';
              }}
              style={{
                marginTop: '12px',
                background: isLoading
                  ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                color: '#fff',
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                fontWeight: '800',
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 10px 20px rgba(99, 102, 241, 0.25)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.3s',
                opacity: isLoading ? 0.7 : 1,
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
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            style={{ color: '#6366f1', fontWeight: '700', textDecoration: 'none' }}
          >
            Create an account
          </Link>
        </p>
      </div>

      <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
