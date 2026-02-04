/**
 * Comprehensive type definitions for the financial dashboard
 * Replaces all 'any' types with proper TypeScript types
 */

// ============================================================================
// Account Types
// ============================================================================

export type Currency = 'USD' | 'INR';
export type AccountType = 'Savings' | 'Current' | 'Wallet' | 'Investment' | 'Credit Card' | 'Other';

export interface Account {
  id: number;
  name: string;
  bankName: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Transaction Types
// ============================================================================

export type TransactionType = 'Income' | 'Expense';
export type TransactionCategory = 
  | 'Salary' 
  | 'Business' 
  | 'Investment' 
  | 'Rent' 
  | 'Food' 
  | 'Transport' 
  | 'Entertainment' 
  | 'Healthcare' 
  | 'Education' 
  | 'Shopping' 
  | 'Utilities' 
  | 'Other';

export interface Transaction {
  id: number;
  date: string;
  description: string;
  category: TransactionCategory | string;
  type: TransactionType;
  amount: number;
  accountId?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Goal Types
// ============================================================================

export type GoalCategory = 
  | 'Retirement' 
  | 'Home' 
  | 'Education' 
  | 'Vacation' 
  | 'Emergency Fund' 
  | 'Investment' 
  | 'Other';

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: GoalCategory | string;
  description?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Family Transfer Types
// ============================================================================

export type RelationshipType = 
  | 'Parent' 
  | 'Spouse' 
  | 'Child' 
  | 'Sibling' 
  | 'Relative' 
  | 'Friend' 
  | 'Other';

export interface FamilyTransfer {
  id: number;
  date: string;
  recipient: string;
  relationship: RelationshipType | string;
  amount: number;
  purpose: string;
  notes?: string;
  accountId?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Stock Types
// ============================================================================

export type StockTransactionType = 'BUY' | 'SELL';
export type StockExchange = 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ' | 'OTHER';

export interface Stock {
  id: number;
  symbol: string;
  companyName: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  sector?: string;
  exchange: StockExchange | string;
  investmentAmount: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockTransaction {
  id: number;
  stockId: number;
  transactionType: StockTransactionType;
  quantity: number;
  price: number;
  totalAmount: number;
  brokerage?: number;
  taxes?: number;
  transactionDate: string;
  notes?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Watchlist {
  id: number;
  symbol: string;
  companyName: string;
  targetPrice?: number;
  notes?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Mutual Fund Types
// ============================================================================

export type MutualFundTransactionType = 'BUY' | 'SELL' | 'SIP';
export type MutualFundCategory = 
  | 'Equity' 
  | 'Debt' 
  | 'Hybrid' 
  | 'Index' 
  | 'ELSS' 
  | 'Liquid' 
  | 'Other';

export interface MutualFund {
  id: number;
  schemeName: string;
  schemeCode: string;
  units: number;
  avgNav: number;
  currentNav: number;
  category?: MutualFundCategory | string;
  investmentAmount: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MutualFundTransaction {
  id: number;
  mutualFundId: number;
  transactionType: MutualFundTransactionType;
  units: number;
  nav: number;
  totalAmount: number;
  transactionDate: string;
  notes?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// F&O Types
// ============================================================================

export type FnoType = 'Future' | 'Call Option' | 'Put Option';
export type FnoStatus = 'Open' | 'Closed';
export type FnoAction = 'Buy' | 'Sell';

export interface FnoTrade {
  id: number;
  symbol: string;
  type: FnoType;
  action: FnoAction;
  quantity: number;
  strikePrice?: number;
  entryPrice: number;
  exitPrice?: number;
  expiryDate: string;
  entryDate: string;
  exitDate?: string;
  status: FnoStatus;
  pnl?: number;
  lotSize: number;
  margin?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Settings Types
// ============================================================================

export type BrokerageType = 'flat' | 'percentage';

export interface AppSettings {
  brokerageType: BrokerageType;
  brokerageValue: number;
  sttRate: number;
  transactionChargeRate: number;
  sebiChargeRate: number;
  stampDutyRate: number;
  gstRate: number;
  dpCharges: number;
  autoCalculateCharges: boolean;
  defaultStockAccountId?: number;
  defaultMfAccountId?: number;
  defaultSalaryAccountId?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// Form State Types
// ============================================================================

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ============================================================================
// Context Types
// ============================================================================

export interface FinanceContextState {
  // Accounts
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (id: number, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: number, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  
  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: number, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
  
  // Stocks
  stocks: Stock[];
  stockTransactions: StockTransaction[];
  watchlist: Watchlist[];
  
  // Mutual Funds
  mutualFunds: MutualFund[];
  mutualFundTransactions: MutualFundTransaction[];
  
  // F&O
  fnoTrades: FnoTrade[];
  
  // Family Transfers
  familyTransfers: FamilyTransfer[];
  
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Loading state
  loading: boolean;
  error: string | null;
}

export interface AuthContextState {
  user: { id: string; email?: string } | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> 
  & {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
