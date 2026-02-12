# FINCORE - Personal Finance Dashboard

## Project Overview
FINCORE is a comprehensive personal finance management application built with Next.js, TypeScript, and Supabase. It allows users to track their net worth across various asset classes including Stocks, Mutual Funds, Bonds, and F&O trades, while managing bank accounts and a central ledger.

## Technology Stack
- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS (Vanilla CSS for custom components)
- **State Management**: React Context API (`FinanceContext`)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Charts**: Recharts
- **API Services**: Yahoo Finance (Stocks), MFAPI (Mutual Funds)

## Key Features

### 1. Unified Dashboard
- **Net Worth Tracking**: Real-time calculation of total wealth across all accounts and investments.
- **Asset Allocation**: Visual breakdown of portfolio into Cash, Stocks, MFs, and Bonds.
- **Daily Performance**: Track daily gain/loss for equity and mutual fund holdings.
- **Goals Progress**: Monitor progress towards financial milestones.

### 2. Stock Portfolio
- **Live Price Integration**: Fetches real-time prices from Yahoo Finance (supporting NSE and BSE).
- **Batch Updates**: Efficiently refreshes the entire portfolio with minimal API calls.
- **Transaction History**: Track BUY/SELL orders with automated brokerage calculation (simulating Zerodha charges).
- **Profit/Loss Analysis**: Detailed unrealized and realized P&L tracking.

### 3. Mutual Funds
- **NAV Integration**: Fetches latest NAVs from `mfapi.in`.
- **SIP Tracking**: Support for Systematic Investment Plan logs.
- **Performance Metrics**: Visualizes P&L and investment growth.

### 4. Bonds & Fixed Income
- **Live Valuation**: Simulated live price tracking for bonds based on deterministic market volatility.
- **Yield Monitoring**: Track coupon rates and maturity dates.
- **ISIN Search**: Integrated bond database search.

### 5. FnO (Futures & Options) Terminal
- **Position Management**: Track open and closed F&O positions.
- **Charge Calculation**: Automated simulation of Zerodha F&O charges including STT, Brokerage, and GST.
- **Equity Curve**: Visualizes trading performance over time.

### 6. Ledger & Bank Accounts
- **Double-Entry Simulation**: Investment actions are balanced with bank account withdrawals/deposits.
- **Transaction History**: Categorized income and expense logging.
- **Multi-Account Support**: Manage multiple bank/brokerage accounts.

## Data Architecture

### FinanceContext
The central brain of the application. It manages:
- **Global State**: All financial entities (stocks, bonds, accounts, etc.) are held in state and synced with Supabase.
- **Automatic Refresh**: Market data (Stocks, MFs, Bonds) is automatically refreshed every 5 minutes and on application mount.
- **Persistence**: Any change in the UI is immediately persisted to the Supabase database.

### API Endpoints
- `/api/stocks/batch`: Fetches quotes for multiple symbols via Yahoo Finance.
- `/api/mf/batch`: Fetches NAVs for multiple scheme codes via MFAPI.
- `/api/bonds/batch`: Provides daily fluctuated prices for bonds.
- `/api/bonds/search`: Searches for bond instruments by ISIN or Name.

## Setup & Development

### Environment Variables
Required variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Running Locally
```bash
npm install
npm run dev
```

## Maintenance & Updates
The system is designed to be modular. New asset classes can be added by:
1. Creating a new table in Supabase.
2. Adding the type definition in `lib/types.ts`.
3. Updating `FinanceContext.tsx` to include the new entity and its CRUD operations.
4. Implementing a client page in `app/`.
