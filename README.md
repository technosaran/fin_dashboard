# Financial Dashboard

A modern financial dashboard built with Next.js and Supabase.

## Features

- **Account Management**: Track multiple bank accounts, wallets, and investment accounts
- **Transaction Tracking**: Log income and expenses with detailed categorization
- **Goal Setting**: Set and track financial goals with progress monitoring
- **Stocks & Mutual Funds**: Real-time market data integration with Yahoo Finance and MFAPI
- **Bonds & F&O**: Fixed income tracking and futures/options trading logs
- **Automatic Refresh**: Live price updates every 5 minutes for investment portfolios
- **Real-time Data**: All data is stored in Supabase and synced in real-time
- **Modern UI**: Clean, professional interface with dark theme

## Documentation

For a detailed deep-dive into the project architecture, features, and API integrations, please refer to:
👉 **[DOCUMENTATION.md](./DOCUMENTATION.md)**

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Vanilla CSS (Premium Aesthetics)
- **Charts**: Recharts
- **Market APIs**: Yahoo Finance, MFAPI.in

## Database Schema

The application uses the following main tables:
- `accounts`, `transactions`, `goals`, `family_transfers`
- `stocks`, `stock_transactions`, `watchlist`
- `mutual_funds`, `mutual_fund_transactions`
- `bonds`, `bond_transactions`
- `fno_trades`, `forex_transactions`
- `app_settings`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup

The project is already configured with Supabase. The database schema includes:
- Proper indexing for performance
- Row Level Security (RLS) ready
- Automatic timestamps with triggers
- Type-safe TypeScript definitions

## Project Structure

```
app/
├── components/
│   ├── Dashboard.tsx          # Main dashboard
│   ├── SupabaseFinanceContext.tsx  # Data context with Supabase
│   └── Sidebar.tsx           # Navigation sidebar
├── accounts/                 # Account management page
├── goals/                    # Goals tracking page
├── ledger/                   # Transaction history page
├── salary/                   # Income tracking page
└── layout.tsx               # Root layout

lib/
├── supabase.ts              # Supabase client configuration
└── database.types.ts        # Generated TypeScript types

supabase/
└── migrations/              # Database migration files
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request