# FINCORE | Digital Wealth Hub

An enterprise-grade financial tracking and portfolio management dashboard built with Next.js, React, TypeScript, and Supabase.

<!-- ![Dashboard Screenshot](./public/screenshot.png) -->

## Features

- **Account Management** — Track multiple bank accounts, wallets, and investment accounts with real-time balances
- **Transaction Ledger** — Log income and expenses with categorization, filtering, search, and CSV export
- **Investment Portfolio** — Stocks, Mutual Funds, Bonds, F&O, and Forex tracking with live market data
- **Goal Tracking** — Set and monitor financial goals with progress visualization
- **Family Transfers** — Track money sent to and received from family members
- **Live Price Updates** — Automatic portfolio refresh every 5 minutes via Yahoo Finance and MFAPI
- **Charge Calculator** — Accurate brokerage, STT, GST, stamp duty calculations (Zerodha rates)
- **Dark Theme UI** — Clean, responsive interface optimized for desktop and mobile
- **Supabase Auth** — Secure authentication with Row Level Security

## Tech Stack

| Layer        | Technology                                |
| ------------ | ----------------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack)        |
| Language     | TypeScript (strict mode)                  |
| UI Library   | React 19                                  |
| Database     | Supabase (PostgreSQL + Auth)              |
| Charts       | Recharts                                  |
| Icons        | Lucide React                              |
| Styling      | Vanilla CSS with CSS variables            |
| Market APIs  | Yahoo Finance, MFAPI.in, Google Finance   |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/technosaran/fin_dashboard.git
   cd fin_dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable                              | Required | Description                     |
| ------------------------------------- | -------- | ------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`            | Yes      | Supabase project URL            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`| Yes      | Supabase anonymous/public key   |
| `NEXT_PUBLIC_APP_URL`                 | No       | Application URL (default: `http://localhost:3000`) |

## Project Architecture

```
app/                          # Next.js App Router
├── components/               # Shared React components
│   ├── AuthContext.tsx        # Authentication provider
│   ├── FinanceContext.tsx     # Core financial data context
│   ├── NotificationContext.tsx# Toast notification system
│   ├── ClientLayout.tsx      # Authenticated layout wrapper
│   ├── Dashboard.tsx         # Main dashboard view
│   └── Sidebar.tsx           # Navigation sidebar
├── api/                      # API route handlers
│   ├── stocks/               # Stock quote/search/batch endpoints
│   ├── mf/                   # Mutual fund endpoints
│   ├── bonds/                # Bond endpoints
│   ├── forex/                # Forex rate endpoints
│   └── fno/                  # F&O batch endpoint
├── [feature]/                # Feature pages (accounts, stocks, etc.)
│
lib/                          # Shared libraries
├── config/                   # Environment validation
├── hooks/                    # Custom React hooks (useFetch, useDebounce, useLocalStorage)
├── services/                 # API utilities and external integrations
├── types/                    # TypeScript type definitions
├── utils/                    # Utility functions (date, number, string, charges, logger)
└── validators/               # Input validation functions
```

## Available Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start development server           |
| `npm run build`   | Create production build            |
| `npm run start`   | Start production server            |
| `npm run lint`    | Run ESLint checks                  |
| `npm test`        | Run test suite                     |
| `npm run format`  | Format code with Prettier          |

## Database Schema

The application uses the following Supabase tables:

- `accounts`, `transactions`, `goals`, `family_transfers`
- `stocks`, `stock_transactions`, `watchlist`
- `mutual_funds`, `mutual_fund_transactions`
- `bonds`, `bond_transactions`
- `fno_trades`, `forex_transactions`
- `app_settings`

## Deployment

### Vercel (Recommended)

1. Push your repository to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Deploy

### Cloudflare Pages

A `wrangler.toml` configuration is included for Cloudflare deployment.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and contribution workflow.

## License

This project is private. All rights reserved.