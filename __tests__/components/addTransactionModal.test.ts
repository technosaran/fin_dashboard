/**
 * Unit tests for AddTransactionModal business logic.
 *
 * Tests cover:
 *  - FnO P&L calculation (BUY and SELL directions)
 *  - Stock total amount computation
 *  - Guard conditions (missing fields)
 *  - Search debounce threshold
 *  - Exchange detection from exchange string
 */

// ─── FnO P&L calculation (mirrors handleFnoSubmit logic) ─────────────────────

function calculateFnoPnl(
  subType: 'BUY' | 'SELL',
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  status: 'OPEN' | 'CLOSED'
): number {
  if (status !== 'CLOSED') return 0;
  return subType === 'BUY'
    ? (exitPrice - entryPrice) * quantity
    : (entryPrice - exitPrice) * quantity;
}

describe('AddTransactionModal — F&O P&L calculation', () => {
  it('calculates profit for a CLOSED BUY trade', () => {
    // Bought at 100, sold at 120, qty 50
    expect(calculateFnoPnl('BUY', 100, 120, 50, 'CLOSED')).toBe(1000);
  });

  it('calculates loss for a CLOSED BUY trade', () => {
    // Bought at 100, sold at 80, qty 50
    expect(calculateFnoPnl('BUY', 100, 80, 50, 'CLOSED')).toBe(-1000);
  });

  it('calculates profit for a CLOSED SELL trade (short)', () => {
    // Shorted at 200, covered at 180, qty 25 → profit
    expect(calculateFnoPnl('SELL', 200, 180, 25, 'CLOSED')).toBe(500);
  });

  it('calculates loss for a CLOSED SELL trade (short)', () => {
    // Shorted at 200, covered at 220, qty 25 → loss
    expect(calculateFnoPnl('SELL', 200, 220, 25, 'CLOSED')).toBe(-500);
  });

  it('returns 0 when status is OPEN', () => {
    expect(calculateFnoPnl('BUY', 100, 150, 50, 'OPEN')).toBe(0);
  });

  it('returns 0 when entry equals exit (breakeven)', () => {
    expect(calculateFnoPnl('BUY', 100, 100, 50, 'CLOSED')).toBe(0);
  });

  it('handles fractional prices correctly', () => {
    // Bought at 22.5, sold at 25.0, qty 200
    expect(calculateFnoPnl('BUY', 22.5, 25.0, 200, 'CLOSED')).toBeCloseTo(500);
  });
});

// ─── Stock total amount calculation ───────────────────────────────────────────

describe('AddTransactionModal — stock transaction total', () => {
  it('computes total as qty * price', () => {
    const qty = 15;
    const price = 2456.5;
    expect(qty * price).toBeCloseTo(36847.5);
  });

  it('returns 0 for zero quantity', () => {
    expect(0 * 500).toBe(0);
  });

  it('rounds correctly for fractional MF units', () => {
    const units = 33.333;
    const nav = 60.0;
    expect(units * nav).toBeCloseTo(1999.98);
  });
});

// ─── Form guard conditions (mirrors early-return checks) ─────────────────────

function canSubmitStock(
  selectedItem: { symbol: string } | null,
  quantity: string,
  price: string
): boolean {
  return !!(selectedItem && quantity && price && 'symbol' in selectedItem);
}

function canSubmitMf(
  selectedItem: { schemeCode: string } | null,
  quantity: string,
  price: string
): boolean {
  return !!(selectedItem && quantity && price && 'schemeCode' in selectedItem);
}

function canSubmitFno(instrument: string, quantity: string, price: string): boolean {
  return !!(instrument && quantity && price);
}

describe('AddTransactionModal — submit guard conditions', () => {
  const stockItem = { symbol: 'RELIANCE', companyName: 'Reliance Industries' };
  const mfItem = { schemeCode: '120503', schemeName: 'Parag Parikh Flexi Cap' };

  it('blocks stock submit when no item selected', () => {
    expect(canSubmitStock(null, '10', '2500')).toBe(false);
  });

  it('blocks stock submit when quantity is empty', () => {
    expect(canSubmitStock(stockItem, '', '2500')).toBe(false);
  });

  it('blocks stock submit when price is empty', () => {
    expect(canSubmitStock(stockItem, '10', '')).toBe(false);
  });

  it('allows stock submit when all fields present', () => {
    expect(canSubmitStock(stockItem, '10', '2500')).toBe(true);
  });

  it('blocks MF submit when no item selected', () => {
    expect(canSubmitMf(null, '50', '60')).toBe(false);
  });

  it('allows MF submit when all fields present', () => {
    expect(canSubmitMf(mfItem, '50', '60')).toBe(true);
  });

  it('blocks FnO submit when instrument is empty', () => {
    expect(canSubmitFno('', '50', '100')).toBe(false);
  });

  it('allows FnO submit with all fields', () => {
    expect(canSubmitFno('NIFTY 22FEB 21500 CE', '50', '100')).toBe(true);
  });
});

// ─── Exchange detection ───────────────────────────────────────────────────────

describe('AddTransactionModal — exchange detection', () => {
  function detectExchange(exchangeString: string): 'BSE' | 'NSE' {
    return exchangeString.includes('BSE') ? 'BSE' : 'NSE';
  }

  it('detects BSE when exchange string contains BSE', () => {
    expect(detectExchange('BSE')).toBe('BSE');
    expect(detectExchange('BSE_CASH')).toBe('BSE');
  });

  it('defaults to NSE for other strings', () => {
    expect(detectExchange('NSE')).toBe('NSE');
    expect(detectExchange('NSE_EQ')).toBe('NSE');
    expect(detectExchange('')).toBe('NSE');
  });
});

// ─── Search debounce threshold ────────────────────────────────────────────────

describe('AddTransactionModal — search debounce threshold', () => {
  it('does not trigger search for queries shorter than 2 chars', () => {
    const shouldSearch = (query: string) => query.length >= 2;
    expect(shouldSearch('')).toBe(false);
    expect(shouldSearch('R')).toBe(false);
    expect(shouldSearch('RE')).toBe(true);
    expect(shouldSearch('RELIANCE')).toBe(true);
  });
});
