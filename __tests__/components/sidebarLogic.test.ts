/**
 * Unit tests for Sidebar navigation logic.
 *
 * The Sidebar has two key behaviours we want to lock down:
 *   1. isVisible(key) — returns false only when settings[key] is explicitly false
 *   2. nav-item filtering — items with enabled:false OR isVisible(settingsKey)==false are hidden
 *   3. Empty sections are removed entirely
 *
 * All logic is extracted as pure functions to avoid mounting React/Next.js.
 */

// ─── Pure mirrors of Sidebar logic ───────────────────────────────────────────

type Settings = Record<string, boolean | number | string | undefined | null>;

function isVisible(settings: Settings, key?: string): boolean {
  if (!key) return true;
  const value = settings[key as keyof typeof settings];
  return value !== false;
}

interface NavItem {
  label: string;
  href: string;
  enabled?: boolean;
  settingsKey?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function buildNavSections(settings: Settings): NavSection[] {
  const investmentItems: NavItem[] = [
    { label: 'Stocks', href: '/stocks', settingsKey: 'stocksVisible' },
    { label: 'Mutual Funds', href: '/mutual-funds', settingsKey: 'mutualFundsVisible' },
    {
      label: 'Bonds',
      href: '/bonds',
      enabled: settings.bondsEnabled as boolean,
      settingsKey: 'bondsEnabled',
    },
    { label: 'FnO', href: '/fno', settingsKey: 'fnoVisible' },
    {
      label: 'Forex',
      href: '/forex',
      enabled: settings.forexEnabled as boolean,
      settingsKey: 'forexEnabled',
    },
  ].filter((item) => {
    if (item.enabled === false) return false;
    return isVisible(settings, item.settingsKey);
  });

  const trackingItems: NavItem[] = [
    { label: 'Ledger', href: '/ledger', settingsKey: 'ledgerVisible' },
    { label: 'Income', href: '/salary', settingsKey: 'incomeVisible' },
    { label: 'Expenses', href: '/expenses', settingsKey: 'expensesVisible' },
  ].filter((item) => isVisible(settings, item.settingsKey));

  const planningItems: NavItem[] = [
    { label: 'Goals', href: '/goals', settingsKey: 'goalsVisible' },
    { label: 'Family', href: '/family', settingsKey: 'familyVisible' },
  ].filter((item) => isVisible(settings, item.settingsKey));

  return [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', href: '/' },
        { label: 'Accounts', href: '/accounts' },
      ],
    },
    { title: 'INVESTMENTS', items: investmentItems },
    { title: 'TRACKING', items: trackingItems },
    { title: 'PLANNING', items: planningItems },
  ].filter((section) => section.items.length > 0);
}

// ─── isVisible tests ──────────────────────────────────────────────────────────

describe('Sidebar.isVisible', () => {
  it('returns true when key is undefined', () => {
    expect(isVisible({}, undefined)).toBe(true);
  });

  it('returns true when setting value is true', () => {
    expect(isVisible({ stocksVisible: true }, 'stocksVisible')).toBe(true);
  });

  it('returns false when setting value is explicitly false', () => {
    expect(isVisible({ stocksVisible: false }, 'stocksVisible')).toBe(false);
  });

  it('returns true when setting key is absent (undefined)', () => {
    // undefined should NOT hide the item — only explicit false does
    expect(isVisible({}, 'mutualFundsVisible')).toBe(true);
  });

  it('returns true when setting value is null', () => {
    expect(isVisible({ goalsVisible: null }, 'goalsVisible')).toBe(true);
  });

  it('returns true for numeric values (non-false truthy)', () => {
    expect(isVisible({ dpCharges: 0 }, 'dpCharges')).toBe(true); // 0 !== false
  });
});

// ─── Nav section filtering tests ──────────────────────────────────────────────

describe('Sidebar nav section filtering', () => {
  const fullSettings: Settings = {
    stocksVisible: true,
    mutualFundsVisible: true,
    bondsEnabled: true,
    fnoVisible: true,
    forexEnabled: true,
    ledgerVisible: true,
    incomeVisible: true,
    expensesVisible: true,
    goalsVisible: true,
    familyVisible: true,
  };

  it('shows all investment items when all enabled', () => {
    const sections = buildNavSections(fullSettings);
    const investments = sections.find((s) => s.title === 'INVESTMENTS')!;
    expect(investments.items).toHaveLength(5);
  });

  it('hides Bonds when bondsEnabled is false', () => {
    const sections = buildNavSections({ ...fullSettings, bondsEnabled: false });
    const investments = sections.find((s) => s.title === 'INVESTMENTS')!;
    const labels = investments.items.map((i) => i.label);
    expect(labels).not.toContain('Bonds');
    expect(labels).toContain('Stocks');
  });

  it('hides Forex when forexEnabled is false', () => {
    const sections = buildNavSections({ ...fullSettings, forexEnabled: false });
    const investments = sections.find((s) => s.title === 'INVESTMENTS')!;
    const labels = investments.items.map((i) => i.label);
    expect(labels).not.toContain('Forex');
  });

  it('hides Stocks when stocksVisible is false', () => {
    const sections = buildNavSections({ ...fullSettings, stocksVisible: false });
    const investments = sections.find((s) => s.title === 'INVESTMENTS')!;
    const labels = investments.items.map((i) => i.label);
    expect(labels).not.toContain('Stocks');
  });

  it('removes TRACKING section when all tracking items are hidden', () => {
    const sections = buildNavSections({
      ...fullSettings,
      ledgerVisible: false,
      incomeVisible: false,
      expensesVisible: false,
    });
    const tracking = sections.find((s) => s.title === 'TRACKING');
    expect(tracking).toBeUndefined();
  });

  it('removes PLANNING section when goals and family are hidden', () => {
    const sections = buildNavSections({
      ...fullSettings,
      goalsVisible: false,
      familyVisible: false,
    });
    const planning = sections.find((s) => s.title === 'PLANNING');
    expect(planning).toBeUndefined();
  });

  it('always shows OVERVIEW section (Dashboard + Accounts have no settingsKey)', () => {
    const sections = buildNavSections({});
    const overview = sections.find((s) => s.title === 'OVERVIEW');
    expect(overview).toBeDefined();
    expect(overview!.items).toHaveLength(2);
  });

  it('removes INVESTMENTS section when all investment items are hidden', () => {
    const hiddenSettings: Settings = {
      stocksVisible: false,
      mutualFundsVisible: false,
      bondsEnabled: false,
      fnoVisible: false,
      forexEnabled: false,
    };
    const sections = buildNavSections(hiddenSettings);
    const investments = sections.find((s) => s.title === 'INVESTMENTS');
    expect(investments).toBeUndefined();
  });
});
