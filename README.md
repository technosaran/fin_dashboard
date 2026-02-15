# FINCORE | Digital Wealth Hub

An enterprise-grade financial tracking and portfolio management dashboard built with Next.js, React, TypeScript, and Supabase.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI](https://github.com/technosaran/fin_dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/technosaran/fin_dashboard/actions/workflows/ci.yml)
[![CodeQL](https://github.com/technosaran/fin_dashboard/actions/workflows/codeql.yml/badge.svg)](https://github.com/technosaran/fin_dashboard/actions/workflows/codeql.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

<!-- ![Dashboard Screenshot](./public/screenshot.png) -->

> **Manage your wealth, track investments, and achieve financial goals with FINCORE - your comprehensive personal finance dashboard.**

## ✨ Features

### 💰 Core Financial Management

- **Account Management** — Track multiple bank accounts, wallets, and investment accounts with real-time balances
- **Transaction Ledger** — Log income and expenses with categorization, filtering, search, and CSV export
- **Net Worth Tracking** — Real-time calculation of total wealth across all asset classes
- **Goal Tracking** — Set and monitor financial goals with progress visualization
- **Family Transfers** — Track money sent to and received from family members

### 📈 Investment Portfolio

- **Stocks** — Real-time price tracking from Yahoo Finance with buy/sell transaction history and P&L analysis
- **Mutual Funds** — NAV integration from MFAPI with SIP tracking and performance metrics
- **Bonds** — Valuation tracking, yield monitoring, and ISIN-based search
- **F&O (Futures & Options)** — Position management with Zerodha charge simulation and equity curve
- **Forex** — Currency exchange tracking with deposits and withdrawals
- **Watchlist** — Monitor instruments without owning them

### 🚀 Advanced Features

- **Live Price Updates** — Automatic portfolio refresh every 5 minutes
- **Charge Calculator** — Accurate brokerage, STT, GST, stamp duty calculations (Zerodha rates)
- **Batch API Calls** — Efficient data fetching for multiple assets
- **CSV Export** — Export transaction history and reports
- **Dark Theme UI** — Clean, responsive interface optimized for all devices
- **Secure Authentication** — Supabase Auth with Row Level Security (RLS)

## Tech Stack

| Layer       | Technology                              |
| ----------- | --------------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack)      |
| Language    | TypeScript (strict mode)                |
| UI Library  | React 19                                |
| Database    | Supabase (PostgreSQL + Auth)            |
| Charts      | Recharts                                |
| Icons       | Lucide React                            |
| Styling     | Vanilla CSS with CSS variables          |
| Market APIs | Yahoo Finance, MFAPI.in, Google Finance |

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

| Variable                               | Required | Description                                        |
| -------------------------------------- | -------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Yes      | Supabase project URL                               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes      | Supabase anonymous/public key                      |
| `NEXT_PUBLIC_APP_URL`                  | No       | Application URL (default: `http://localhost:3000`) |

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

| Command          | Description               |
| ---------------- | ------------------------- |
| `npm run dev`    | Start development server  |
| `npm run build`  | Create production build   |
| `npm run start`  | Start production server   |
| `npm run lint`   | Run ESLint checks         |
| `npm test`       | Run test suite            |
| `npm run format` | Format code with Prettier |

## 📊 Database Schema

The application uses the following Supabase tables:

| Category         | Tables                                                                  |
| ---------------- | ----------------------------------------------------------------------- |
| **Core**         | `accounts`, `transactions`, `goals`, `family_transfers`, `app_settings` |
| **Stocks**       | `stocks`, `stock_transactions`, `watchlist`                             |
| **Mutual Funds** | `mutual_funds`, `mutual_fund_transactions`                              |
| **Bonds**        | `bonds`, `bond_transactions`                                            |
| **Trading**      | `fno_trades`, `forex_transactions`                                      |

For detailed schema documentation, see [DATABASE.md](./DATABASE.md).

## Deployment

### Vercel (Recommended)

1. Push your repository to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Deploy

### Cloudflare Pages

A `wrangler.toml` configuration is included for Cloudflare deployment.

## 📚 Documentation

Comprehensive documentation is available:

- **[API Documentation](./API.md)** — API endpoints, request/response formats, error handling
- **[Architecture](./ARCHITECTURE.md)** — System design, data flow, and architectural decisions
- **[Database](./DATABASE.md)** — Database schema, RLS policies, and query examples
- **[Developer Guide](./DEVELOPER_GUIDE.md)** — Common development tasks and code examples
- **[Testing](./TESTING.md)** — Testing strategy, examples, and best practices
- **[Contributing](./CONTRIBUTING.md)** — Contribution guidelines and workflow
- **[Security](./SECURITY.md)** — Security policy and vulnerability reporting
- **[Changelog](./CHANGELOG.md)** — Version history and release notes

## 🔒 Security & Quality

This project follows industry-standard security and quality practices:

### Security Measures

- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Automated Security Scanning**: CodeQL analysis on every push
- **Dependency Monitoring**: Dependabot for automated dependency updates
- **Vulnerability Reporting**: See [SECURITY.md](./SECURITY.md) for responsible disclosure

### Code Quality Standards

- **Type Safety**: TypeScript strict mode enabled
- **Linting**: ESLint with Next.js recommended rules
- **Formatting**: Prettier for consistent code style
- **Testing**: Jest with 75+ unit tests and growing
- **Pre-commit Hooks**: Automated quality checks before commits
- **Commit Standards**: Conventional Commits specification
- **Continuous Integration**: Automated testing, linting, and building
- **Code Coverage**: Test coverage reporting via Codecov

### Development Workflow

All code changes must:

- Pass ESLint checks
- Pass Prettier formatting checks
- Pass all unit tests
- Build successfully
- Follow conventional commit message format

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Setting up your development environment
- Code standards and best practices
- Commit message conventions
- Pull request process
- Testing requirements

Before contributing, please read our [Code of Conduct](./CODE_OF_CONDUCT.md).

## 🐛 Reporting Issues

Found a bug or have a feature request? Please:

1. Check if the issue already exists in [GitHub Issues](https://github.com/technosaran/fin_dashboard/issues)
2. If not, create a new issue with a clear description
3. Include steps to reproduce for bugs
4. Add screenshots for UI issues

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Yahoo Finance** for stock market data
- **MFAPI.in** for mutual fund NAVs
- **Google Finance** for forex rates
- **Supabase** for backend infrastructure
- All contributors who help improve FINCORE

## 📧 Support

- **Documentation**: Check our comprehensive [docs](./DEVELOPER_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/technosaran/fin_dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/technosaran/fin_dashboard/discussions)

---

**Built with ❤️ by the FINCORE team**
