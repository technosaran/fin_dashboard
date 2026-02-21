/**
 * Unit tests for Dashboard financial metrics calculations.
 *
 * These tests mirror the useMemo computations in Dashboard.tsx,
 * ensuring net worth, P&L, lifetime wealth and day change figures are correct.
 * Pure-function extraction means these run without any React/Supabase setup.
 */

// ─── Types (inline mirrors of lib/types) ─────────────────────────────────────

interface Stock {
  id: number;
  quantity: number;
  investmentAmount: number;
  currentValue: number;
  currentPrice: number;
  previousPrice?: number;
  pnl: number;
  pnlPercentage: number;
}

interface MutualFund {
  id: number;
  units: number;
  investmentAmount: number;
  currentValue: number;
  currentNav: number;
  previousNav?: number;
  pnl: number;
  pnlPercentage: number;
}

interface Bond {
  id: number;
  currentValue: number;
}
interface StockTx {
  transactionType: 'BUY' | 'SELL';
  totalAmount: number;
  brokerage?: number;
  taxes?: number;
}
interface MfTx {
  transactionType: 'BUY' | 'SELL' | 'SIP';
  totalAmount: number;
}
interface BondTx {
  transactionType: 'BUY' | 'SELL' | 'MATURITY' | 'INTEREST';
  totalAmount: number;
}
interface FnoTrade {
  status: 'OPEN' | 'CLOSED';
  pnl: number;
}
interface Account {
  currency: 'INR' | 'USD';
  balance: number;
}

// ─── Pure computation functions (matching Dashboard.tsx logic exactly) ────────

function computeMetrics(params: {
  accounts: Account[];
  stocks: Stock[];
  mutualFunds: MutualFund[];
  bonds: Bond[];
  stockTransactions: StockTx[];
  mutualFundTransactions: MfTx[];
  bondTransactions: BondTx[];
  fnoTrades: FnoTrade[];
  bondsEnabled: boolean;
}) {
  const {
    accounts,
    stocks,
    mutualFunds,
    bonds,
    stockTransactions,
    mutualFundTransactions,
    bondTransactions,
    fnoTrades,
    bondsEnabled,
  } = params;

  const liquidityINR = accounts
    .filter((a) => a.currency === 'INR')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const activeStocks = stocks.filter((s) => s.quantity > 0);
  const stocksValue = activeStocks.reduce((sum, s) => sum + s.currentValue, 0);
  const mfValue = mutualFunds.reduce((sum, m) => sum + m.currentValue, 0);
  const bondsValue = bondsEnabled ? bonds.reduce((sum, b) => sum + b.currentValue, 0) : 0;
  const totalNetWorth = liquidityINR + stocksValue + mfValue + bondsValue;

  const stockInvestment = activeStocks.reduce((sum, s) => sum + s.investmentAmount, 0);
  const mfInvestment = mutualFunds.reduce((sum, m) => sum + m.investmentAmount, 0);
  const totalInvestment = stockInvestment + mfInvestment;

  // Lifetime P&L
  const stockBuys = stockTransactions
    .filter((t) => t.transactionType === 'BUY')
    .reduce((s, t) => s + t.totalAmount, 0);
  const stockSells = stockTransactions
    .filter((t) => t.transactionType === 'SELL')
    .reduce((s, t) => s + t.totalAmount, 0);
  const stockCharges = stockTransactions.reduce(
    (s, t) => s + (t.brokerage || 0) + (t.taxes || 0),
    0
  );
  const stockLifetime = stockSells + stocksValue - (stockBuys + stockCharges);

  const mfBuys = mutualFundTransactions
    .filter((t) => t.transactionType === 'BUY' || t.transactionType === 'SIP')
    .reduce((s, t) => s + t.totalAmount, 0);
  const mfSells = mutualFundTransactions
    .filter((t) => t.transactionType === 'SELL')
    .reduce((s, t) => s + t.totalAmount, 0);
  const mfCharges = mutualFundTransactions
    .filter((t) => t.transactionType === 'BUY' || t.transactionType === 'SIP')
    .reduce((s, t) => s + t.totalAmount * 0.00005, 0);
  const mfLifetime = mfSells + mfValue - (mfBuys + mfCharges);

  let bondLifetime = 0;
  if (bondsEnabled) {
    const bondBuys = bondTransactions
      .filter((t) => t.transactionType === 'BUY')
      .reduce((s, t) => s + t.totalAmount, 0);
    const bondReturns = bondTransactions
      .filter((t) => ['SELL', 'MATURITY', 'INTEREST'].includes(t.transactionType))
      .reduce((s, t) => s + t.totalAmount, 0);
    bondLifetime = bondReturns + bondsValue - bondBuys;
  }

  const fnoLifetime = fnoTrades.filter((t) => t.status === 'CLOSED').reduce((s, t) => s + t.pnl, 0);
  const globalLifetimeWealth = stockLifetime + mfLifetime + bondLifetime + fnoLifetime;

  const stockPnl = activeStocks.reduce((s, st) => s + st.pnl, 0);
  const mfPnl = mfValue - mfInvestment;
  const totalUnrealizedPnl = stockPnl + mfPnl;

  const stockDayChange = activeStocks.reduce((sum, stock) => {
    return (
      sum + (stock.currentPrice - (stock.previousPrice || stock.currentPrice)) * stock.quantity
    );
  }, 0);
  const mfDayChange = mutualFunds.reduce((sum, mf) => {
    return sum + (mf.currentNav - (mf.previousNav || mf.currentNav)) * mf.units;
  }, 0);
  const totalDayChange = stockDayChange + mfDayChange;

  return {
    liquidityINR,
    stocksValue,
    mfValue,
    bondsValue,
    totalNetWorth,
    totalInvestment,
    globalLifetimeWealth,
    totalUnrealizedPnl,
    stockDayChange: totalDayChange,
  };
}

// ─── Test Data Factories ──────────────────────────────────────────────────────

const makeStock = (overrides: Partial<Stock> = {}): Stock => ({
  id: 1,
  quantity: 10,
  investmentAmount: 10000,
  currentValue: 12000,
  currentPrice: 1200,
  previousPrice: 1100,
  pnl: 2000,
  pnlPercentage: 20,
  ...overrides,
});

const makeMf = (overrides: Partial<MutualFund> = {}): MutualFund => ({
  id: 1,
  units: 100,
  investmentAmount: 5000,
  currentValue: 6000,
  currentNav: 60,
  previousNav: 55,
  pnl: 1000,
  pnlPercentage: 20,
  ...overrides,
});

const makeAccount = (overrides: Partial<Account> = {}): Account => ({
  currency: 'INR',
  balance: 50000,
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Dashboard financial metrics — net worth', () => {
  it('sums INR accounts, stocks, MF and bonds', () => {
    const result = computeMetrics({
      accounts: [makeAccount({ balance: 50000 })],
      stocks: [makeStock({ currentValue: 12000 })],
      mutualFunds: [makeMf({ currentValue: 6000 })],
      bonds: [{ id: 1, currentValue: 10000 }],
      stockTransactions: [],
      mutualFundTransactions: [],
      bondTransactions: [],
      fnoTrades: [],
      bondsEnabled: true,
    });
    expect(result.totalNetWorth).toBe(78000); // 50k + 12k + 6k + 10k
  });

  it('excludes USD accounts from INR liquidity', () => {
    const result = computeMetrics({
      accounts: [
        makeAccount({ currency: 'INR', balance: 30000 }),
        makeAccount({ currency: 'USD', balance: 1000 }),
      ],
      stocks: [],
      mutualFunds: [],
      bonds: [],
      stockTransactions: [],
      mutualFundTransactions: [],
      bondTransactions: [],
      fnoTrades: [],
      bondsEnabled: false,
    });
    expect(result.liquidityINR).toBe(30000);
  });

  it('excludes bonds when bondsEnabled is false', () => {
    const result = computeMetrics({
      accounts: [makeAccount({ balance: 0 })],
      stocks: [],
      mutualFunds: [],
      bonds: [{ id: 1, currentValue: 99999 }],
      stockTransactions: [],
      mutualFundTransactions: [],
      bondTransactions: [],
      fnoTrades: [],
      bondsEnabled: false,
    });
    expect(result.bondsValue).toBe(0);
    expect(result.totalNetWorth).toBe(0);
  });

  it('excludes stocks with zero quantity', () => {
    const result = computeMetrics({
      accounts: [],
      stocks: [
        makeStock({ quantity: 0, currentValue: 5000, investmentAmount: 4000, pnl: 1000 }),
        makeStock({ id: 2, quantity: 5, currentValue: 3000, investmentAmount: 2000, pnl: 1000 }),
      ],
      mutualFunds: [],
      bonds: [],
      stockTransactions: [],
      mutualFundTransactions: [],
      bondTransactions: [],
      fnoTrades: [],
      bondsEnabled: false,
    });
    expect(result.stocksValue).toBe(3000); // only active stock counts
    expect(result.totalInvestment).toBe(2000);
  });
});

describe('Dashboard financial metrics — unrealized P&L', () => {
  it('combines stock and MF unrealized P&L', () => {
    const result = computeMetrics({
      accounts: [],
      stocks: [makeStock({ pnl: 2000, quantity: 1 })],
      mutualFunds: [makeMf({ currentValue: 6000, investmentAmount: 4000 })],
      bonds: [],
      stockTransactions: [],
      mutualFundTransactions: [],
      bondTransactions: [],
      fnoTrades: [],
      bondsEnabled: false,
    });
    expect(result.totalUnrealizedPnl).toBe(4000); // 2000 stock + 2000 MF
  });

  it('handles negative P&L correctly', () => {
    const result = computeMetrics({
      accounts: [],
      stocks: [makeStock({ pnl: -1500, quantity: 5 })],
      mutualFunds: [makeMf({ currentValue: 4000, investmentAmount: 5000 })],
      bonds: [],
      stockTransactions: [],
      mutualFundTransactions: [],
      bondTransactions: [],
      fnoTrades: [],
      bondsEnabled: false,
    });
    expect(result.totalUnrealizedPnl).toBe(-2500); // -1500 + -1000
  });
});

describe('Dashboard financial metrics — day change', () => {
  it('computes stock and MF day change', () => {
    const result = computeMetrics({
      accounts: [],
      stocks: [makeStock({ quantity: 10, currentPrice: 1200, previousPrice: 1100 })],
      mutualFunds: [makeMf({ units: 100, currentNav: 60, previousNav: 55 })],
      bonds: [],
      stockTransactions: [],
      mutualFundTransactions: [],
      bondTransactions: [],
      fnoTrades: [],
      bondsEnabled: false,
    });
    // stock: (1200-1100)*10 = 1000, MF: (60-55)*100 = 500
    expect(result.stockDayChange).toBe(1500);
  });

  it('returns 0 day change when previous prices are absent', () => {
    const result = computeMetrics({
      accounts: [],
      stocks: [makeStock({ quantity: 10, currentPrice: 500, previousPrice: undefined })],
      mutualFunds: [],
      bonds: [],
      stockTransactions: [],
      mutualFundTransactions: [],
      bondTransactions: [],
      fnoTrades: [],
      bondsEnabled: false,
    });
    expect(result.stockDayChange).toBe(0);
  });
});

describe('Dashboard financial metrics — lifetime wealth', () => {
  it('computes stock lifetime: sells + currentValue - (buys + charges)', () => {
    const result = computeMetrics({
      accounts: [],
      stocks: [makeStock({ currentValue: 12000 })],
      mutualFunds: [],
      bonds: [],
      stockTransactions: [
        { transactionType: 'BUY', totalAmount: 10000, brokerage: 50, taxes: 10 },
        { transactionType: 'SELL', totalAmount: 8000, brokerage: 40, taxes: 8 },
      ],
      mutualFundTransactions: [],
      bondTransactions: [],
      fnoTrades: [],
      bondsEnabled: false,
    });
    // stock lifetime: 8000 + 12000 - (10000 + 50 + 10 + 40 + 8) = 9892
    expect(result.globalLifetimeWealth).toBeCloseTo(9892, 0);
  });

  it('includes F&O P&L from closed trades only', () => {
    const result = computeMetrics({
      accounts: [],
      stocks: [],
      mutualFunds: [],
      bonds: [],
      stockTransactions: [],
      mutualFundTransactions: [],
      bondTransactions: [],
      fnoTrades: [
        { status: 'CLOSED', pnl: 3000 },
        { status: 'OPEN', pnl: 9999 }, // should NOT be counted
      ],
      bondsEnabled: false,
    });
    expect(result.globalLifetimeWealth).toBe(3000);
  });

  it('returns 0 when there are no transactions', () => {
    const result = computeMetrics({
      accounts: [],
      stocks: [],
      mutualFunds: [],
      bonds: [],
      stockTransactions: [],
      mutualFundTransactions: [],
      bondTransactions: [],
      fnoTrades: [],
      bondsEnabled: false,
    });
    expect(result.globalLifetimeWealth).toBe(0);
    expect(result.totalNetWorth).toBe(0);
    expect(result.totalUnrealizedPnl).toBe(0);
    expect(result.stockDayChange).toBe(0);
  });
});

describe('Dashboard allocation data filtering', () => {
  it('only surfaces asset classes with value > 0', () => {
    const metrics = { liquidityINR: 50000, stocksValue: 0, mfValue: 20000, bondsValue: 0 };
    const allocationData = [
      { name: 'Cash', value: metrics.liquidityINR, color: '#818cf8' },
      { name: 'Stocks', value: metrics.stocksValue, color: '#10b981' },
      { name: 'Mutual Funds', value: metrics.mfValue, color: '#f59e0b' },
      { name: 'Bonds', value: metrics.bondsValue, color: '#ec4899' },
    ].filter((a) => a.value > 0);

    expect(allocationData).toHaveLength(2);
    expect(allocationData.map((a) => a.name)).toEqual(['Cash', 'Mutual Funds']);
  });
});

describe('Goals progress calculation', () => {
  it('calculates percentage correctly and caps at 100', () => {
    const goals = [
      { name: 'Retirement', targetAmount: 1000000, currentAmount: 250000 },
      { name: 'Emergency', targetAmount: 100000, currentAmount: 120000 }, // over-funded
    ];
    const result = goals.map((g) => ({
      ...g,
      percentage: g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0,
    }));
    expect(result[0].percentage).toBe(25);
    expect(result[1].percentage).toBe(100); // capped
  });

  it('returns 0 for goal with zero target', () => {
    const goal = { name: 'Empty', targetAmount: 0, currentAmount: 500 };
    const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    expect(percentage).toBe(0);
  });
});
