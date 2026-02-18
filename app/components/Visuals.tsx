'use client';

import React from 'react';

/**
 * Premium SVG Illustration for Empty Portfolio / Investments
 */
export const EmptyPortfolioVisual = ({ size = 200 }: { size?: number }) => (
  <div
    style={{
      position: 'relative',
      width: `${size}px`,
      height: `${size}px`,
      margin: '0 auto',
    }}
  >
    <div
      className="animate-glow-pulse"
      style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
        filter: 'blur(30px)',
        zIndex: 0,
      }}
    />
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className="animate-floating"
      style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
          <feOffset dx="0" dy="4" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background Shape */}
      <circle cx="100" cy="100" r="70" fill="url(#grad1)" style={{ opacity: 0.1 }} />

      {/* 3D Bar Chart Visual */}
      <rect
        x="60"
        y="110"
        width="20"
        height="40"
        rx="4"
        fill="#10b981"
        filter="url(#shadow)"
        opacity="0.6"
      >
        <animate attributeName="height" values="0;40" dur="1.5s" fill="freeze" />
      </rect>
      <rect
        x="90"
        y="80"
        width="20"
        height="70"
        rx="4"
        fill="#10b981"
        filter="url(#shadow)"
        opacity="0.8"
      >
        <animate attributeName="height" values="0;70" dur="1.7s" fill="freeze" />
      </rect>
      <rect x="120" y="50" width="20" height="100" rx="4" fill="#06b6d4" filter="url(#shadow)">
        <animate attributeName="height" values="0;100" dur="2s" fill="freeze" />
      </rect>

      {/* Sparkle effects */}
      <circle cx="150" cy="60" r="4" fill="#fff" className="animate-sparkle" />
      <circle
        cx="50"
        cy="140"
        r="3"
        fill="#fff"
        className="animate-sparkle"
        style={{ animationDelay: '1s' }}
      />
    </svg>
  </div>
);

/**
 * Premium SVG Illustration for Family Support
 */
export const EmptyFamilyVisual = () => (
  <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto' }}>
    <div
      className="animate-glow-pulse"
      style={{
        position: 'absolute',
        top: '25%',
        left: '25%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
        filter: 'blur(35px)',
        zIndex: 0,
      }}
    />
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className="animate-floating"
      style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Heart House Shape */}
      <path
        d="M100 160c-40-30-60-50-60-80 0-25 10-40 30-40 15 0 25 10 30 20 5-10 15-20 30-20 20 0 30 15 30 40 0 30-20 50-60 80z"
        fill="url(#grad2)"
        style={{ opacity: 0.15 }}
      />

      {/* House Front */}
      <rect
        x="75"
        y="90"
        width="50"
        height="50"
        rx="8"
        fill="#ec4899"
        fillOpacity="0.2"
        stroke="#ec4899"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <path
        d="M70 95 L100 65 L130 95"
        stroke="#ec4899"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Floating Hearts */}
      <path
        d="M150 70c-5-4-8-2-8 3 0 5 3 8 8 12 5-4 8-7 8-12 0-5-3-7-8-3z"
        fill="#ec4899"
        className="animate-sparkle"
      />
      <path
        d="M50 80c-4-3-6-2-6 2 0 4 2 6 6 10 4-4 6-6 6-10 0-4-2-5-6-2z"
        fill="#8b5cf6"
        className="animate-sparkle"
        style={{ animationDelay: '1.5s' }}
      />
    </svg>
  </div>
);

/**
 * Premium SVG Illustration for Empty Goals
 */
export const EmptyGoalsVisual = () => (
  <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
    <div
      className="animate-glow-pulse"
      style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
        filter: 'blur(30px)',
        zIndex: 0,
      }}
    />
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className="animate-floating"
      style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Target Rings */}
      <circle cx="100" cy="100" r="70" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.2" />
      <circle cx="100" cy="100" r="50" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" />
      <circle
        cx="100"
        cy="100"
        r="30"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeOpacity="0.5"
        strokeDasharray="4 2"
      />

      {/* Trophy / Goal Symbol */}
      <path
        d="M85 140 L115 140 M100 140 L100 120"
        stroke="#f59e0b"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M80 70 C70 70 70 90 80 100 L100 120 L120 100 C130 90 130 70 120 70 Z"
        fill="url(#grad3)"
        stroke="#f59e0b"
        strokeWidth="2"
      />

      <circle cx="100" cy="85" r="8" fill="#fff" fillOpacity="0.3" className="animate-sparkle" />
    </svg>
  </div>
);

/**
 * Premium SVG Illustration for Empty Transactions
 */
export const EmptyTransactionsVisual = () => (
  <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto' }}>
    <div
      className="animate-glow-pulse"
      style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
        filter: 'blur(30px)',
        zIndex: 0,
      }}
    />
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className="animate-floating"
      style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}
    >
      <rect
        x="70"
        y="50"
        width="60"
        height="80"
        rx="4"
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(99, 102, 241, 0.4)"
        strokeWidth="1"
      />
      <path
        d="M80 70 L120 70 M80 90 L110 90 M80 110 L115 110"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Floating Elements */}
      <circle
        cx="60"
        cy="150"
        r="8"
        fill="#6366f1"
        fillOpacity="0.3"
        stroke="#6366f1"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <rect
        x="130"
        y="40"
        width="12"
        height="12"
        rx="2"
        fill="#818cf8"
        fillOpacity="0.4"
        transform="rotate(15 136 46)"
      />
    </svg>
  </div>
);
