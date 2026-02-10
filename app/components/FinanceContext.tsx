"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from './AuthContext';

// Database row types (flexible for now)
type AccountRow = {
    id: number;
    name: string;
    bank_name: string;
    type: string;
    balance: number;
    currency: string;
    [key: string]: unknown;
};

type AppSettingsRow = {
    user_id: string;
    brokerage_type: string;
    brokerage_value: number;
    stt_rate: number;
    transaction_charge_rate: number;
    sebi_charge_rate: number;
    stamp_duty_rate: number;
    gst_rate: number;
    dp_charges: number;
    auto_calculate_charges: boolean;
    default_stock_account_id?: number | null;
    default_mf_account_id?: number | null;
    default_salary_account_id?: number | null;
    [key: string]: unknown;
};

type TransactionRow = {
    id: number;
    date: string;
    description: string;
    category: string;
    type: string;
    amount: number;
    account_id?: number | null;
    [key: string]: unknown;
};

type GoalRow = {
    id: number;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline: string;
    category: string;
    description?: string | null;
    [key: string]: unknown;
};

type FamilyTransferRow = {
    id: number;
    date: string;
    recipient: string;
    relationship: string;
    amount: number;
    purpose: string;
    notes?: string | null;
    account_id?: number | null;
    [key: string]: unknown;
};

type StockRow = {
    id: number;
    symbol: string;
    company_name: string;
    quantity: number;
    avg_price: number;
    current_price: number;
    sector?: string | null;
    exchange: string;
    investment_amount: number;
    current_value: number;
    pnl: number;
    pnl_percentage: number;
    [key: string]: unknown;
};

type StockTransactionRow = {
    id: number;
    stock_id?: number | null;
    transaction_type: string;
    quantity: number;
    price: number;
    total_amount: number;
    brokerage?: number | null;
    taxes?: number | null;
    transaction_date: string;
    notes?: string | null;
    account_id?: number | null;
    [key: string]: unknown;
};

type WatchlistRow = {
    id: number;
    symbol: string;
    company_name: string;
    target_price?: number | null;
    current_price?: number | null;
    notes?: string | null;
    [key: string]: unknown;
};

type MutualFundRow = {
    id: number;
    name: string;
    isin?: string | null;
    scheme_code?: string | null;
    category?: string | null;
    units: number;
    avg_nav: number;
    current_nav: number;
    investment_amount: number;
    current_value: number;
    pnl: number;
    pnl_percentage: number;
    folio_number?: string | null;
    [key: string]: unknown;
};

type MutualFundTransactionRow = {
    id: number;
    mutual_fund_id?: number | null;
    transaction_type: string;
    units: number;
    nav: number;
    total_amount: number;
    transaction_date: string;
    notes?: string | null;
    account_id?: number | null;
    [key: string]: unknown;
};

type FnoTradeRow = {
    id: number;
    instrument: string;
    trade_type: string;
    product: string;
    quantity: number;
    avg_price: number;
    exit_price?: number | null;
    entry_date: string;
    exit_date?: string | null;
    status: string;
    pnl: number;
    notes?: string | null;
    account_id?: number | null;
    [key: string]: unknown;
};

export interface AppSettings {
    brokerageType: 'flat' | 'percentage';
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

export interface Account {
    id: number;
    name: string;
    bankName: string;
    type: string;
    balance: number;
    currency: 'USD' | 'INR';
}

export interface Transaction {
    id: number;
    date: string;
    description: string;
    category: string;
    type: 'Income' | 'Expense';
    amount: number;
    accountId?: number;
}

export interface Goal {
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    category: string;
    description?: string;
}

export interface FamilyTransfer {
    id: number;
    date: string;
    recipient: string;
    relationship: string;
    amount: number;
    purpose: string;
    notes?: string;
    accountId?: number;
}

export interface Stock {
    id: number;
    symbol: string;
    companyName: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    sector?: string;
    exchange: string;
    investmentAmount: number;
    currentValue: number;
    pnl: number;
    pnlPercentage: number;
    previousPrice?: number;
}

export interface StockTransaction {
    id: number;
    stockId: number;
    transactionType: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    totalAmount: number;
    brokerage?: number;
    taxes?: number;
    transactionDate: string;
    notes?: string;
    accountId?: number;
}

export interface WatchlistItem {
    id: number;
    symbol: string;
    companyName: string;
    targetPrice?: number;
    currentPrice?: number;
    notes?: string;
}

export interface MutualFund {
    id: number;
    name: string;
    isin?: string;
    schemeCode?: string;
    category?: string;
    units: number;
    avgNav: number;
    currentNav: number;
    investmentAmount: number;
    currentValue: number;
    pnl: number;
    pnlPercentage: number;
    folioNumber?: string;
    previousNav?: number;
}

export interface MutualFundTransaction {
    id: number;
    mutualFundId: number;
    transactionType: 'BUY' | 'SELL' | 'SIP';
    units: number;
    nav: number;
    totalAmount: number;
    transactionDate: string;
    notes?: string;
    accountId?: number;
}

export interface FnoTrade {
    id: number;
    instrument: string;
    tradeType: 'BUY' | 'SELL';
    product: 'NRML' | 'MIS';
    quantity: number;
    avgPrice: number;
    exitPrice?: number;
    entryDate: string;
    exitDate?: string;
    status: 'OPEN' | 'CLOSED';
    pnl: number;
    notes?: string;
    accountId?: number;
}

interface FinanceContextType {
    accounts: Account[];
    transactions: Transaction[];
    goals: Goal[];
    familyTransfers: FamilyTransfer[];
    stocks: Stock[];
    stockTransactions: StockTransaction[];
    watchlist: WatchlistItem[];
    mutualFunds: MutualFund[];
    mutualFundTransactions: MutualFundTransaction[];
    fnoTrades: FnoTrade[];
    settings: AppSettings;
    updateSettings: (newSettings: AppSettings) => Promise<void>;
    loading: boolean;
    addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
    updateAccount: (account: Account) => Promise<void>;
    deleteAccount: (id: number) => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (transaction: Transaction) => Promise<void>;
    deleteTransaction: (id: number) => Promise<void>;
    addFunds: (accountId: number, amount: number, description: string, category: string) => Promise<void>;
    addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
    updateGoal: (goal: Goal, accountId?: number) => Promise<void>;
    deleteGoal: (id: number) => Promise<void>;
    addFamilyTransfer: (transfer: Omit<FamilyTransfer, 'id'>) => Promise<void>;
    updateFamilyTransfer: (transfer: FamilyTransfer) => Promise<void>;
    deleteFamilyTransfer: (id: number) => Promise<void>;
    addStock: (stock: Omit<Stock, 'id'>) => Promise<void>;
    updateStock: (stock: Stock) => Promise<void>;
    deleteStock: (id: number) => Promise<void>;
    addStockTransaction: (transaction: Omit<StockTransaction, 'id'>) => Promise<void>;
    deleteStockTransaction: (id: number) => Promise<void>;
    addToWatchlist: (item: Omit<WatchlistItem, 'id'>) => Promise<void>;
    removeFromWatchlist: (id: number) => Promise<void>;
    addMutualFund: (mf: Omit<MutualFund, 'id'>) => Promise<void>;
    updateMutualFund: (mf: MutualFund) => Promise<void>;
    deleteMutualFund: (id: number) => Promise<void>;
    addMutualFundTransaction: (transaction: Omit<MutualFundTransaction, 'id'>) => Promise<void>;
    deleteMutualFundTransaction: (id: number) => Promise<void>;
    addFnoTrade: (trade: Omit<FnoTrade, 'id'>) => Promise<void>;
    updateFnoTrade: (trade: FnoTrade) => Promise<void>;
    deleteFnoTrade: (id: number) => Promise<void>;
    isTransactionModalOpen: boolean;
    setIsTransactionModalOpen: (isOpen: boolean) => void;
    refreshPortfolio: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Real math for Indian Stock Market Charges
export const calculateStockCharges = (
    type: 'BUY' | 'SELL',
    quantity: number,
    price: number,
    settings: AppSettings
) => {
    const turnover = quantity * price;

    // 1. Brokerage
    const brokerage = settings.brokerageType === 'flat'
        ? settings.brokerageValue
        : (turnover * settings.brokerageValue) / 100;

    // 2. STT (0.1% for Delivery)
    const stt = Math.round(turnover * (settings.sttRate / 100));

    // 3. Transaction Charges (NSE: 0.00325%)
    const transCharges = turnover * (settings.transactionChargeRate / 100);

    // 4. SEBI Charges (0.0001%)
    const sebiCharges = turnover * (settings.sebiChargeRate / 100);

    // 5. Stamp Duty (0.015% on Buy only)
    const stampDuty = type === 'BUY' ? turnover * (settings.stampDutyRate / 100) : 0;

    // 6. GST (18% on Brokerage + Trans Charges + SEBI)
    const gst = (brokerage + transCharges + sebiCharges) * (settings.gstRate / 100);

    // 7. DP Charges (Flat ₹13.5 + GST on Sell Scrip - simplified as flat per transaction for this engine)
    const dpCharges = type === 'SELL' ? settings.dpCharges : 0;

    const totalCharges = brokerage + stt + transCharges + sebiCharges + stampDuty + gst + dpCharges;

    return {
        brokerage: Number(brokerage.toFixed(2)),
        taxes: Number((totalCharges - brokerage).toFixed(2)),
        total: Number(totalCharges.toFixed(2))
    };
};

type SupabaseClient = typeof supabase;
type ExtendedSupabaseClient = SupabaseClient & {
    from(table: 'fno_trades'): ReturnType<SupabaseClient['from']>;
    from(table: 'app_settings'): ReturnType<SupabaseClient['from']>;
};

// Helper functions to convert between database and app types
const dbSettingsToSettings = (dbSettings: AppSettingsRow): AppSettings => ({
    brokerageType: dbSettings.brokerage_type as 'flat' | 'percentage',
    brokerageValue: Number(dbSettings.brokerage_value),
    sttRate: Number(dbSettings.stt_rate),
    transactionChargeRate: Number(dbSettings.transaction_charge_rate),
    sebiChargeRate: Number(dbSettings.sebi_charge_rate),
    stampDutyRate: Number(dbSettings.stamp_duty_rate),
    gstRate: Number(dbSettings.gst_rate),
    dpCharges: Number(dbSettings.dp_charges),
    autoCalculateCharges: dbSettings.auto_calculate_charges,
    defaultStockAccountId: dbSettings.default_stock_account_id ? Number(dbSettings.default_stock_account_id) : undefined,
    defaultMfAccountId: dbSettings.default_mf_account_id ? Number(dbSettings.default_mf_account_id) : undefined,
    defaultSalaryAccountId: dbSettings.default_salary_account_id ? Number(dbSettings.default_salary_account_id) : undefined
});

const dbAccountToAccount = (dbAccount: AccountRow): Account => ({
    id: Number(dbAccount.id),
    name: dbAccount.name,
    bankName: dbAccount.bank_name,
    type: dbAccount.type,
    balance: Number(dbAccount.balance),
    currency: dbAccount.currency as 'USD' | 'INR'
});

const dbTransactionToTransaction = (dbTransaction: TransactionRow): Transaction => ({
    id: Number(dbTransaction.id),
    date: dbTransaction.date,
    description: dbTransaction.description,
    category: dbTransaction.category,
    type: dbTransaction.type as 'Income' | 'Expense',
    amount: Number(dbTransaction.amount),
    accountId: dbTransaction.account_id ? Number(dbTransaction.account_id) : undefined
});

const dbGoalToGoal = (dbGoal: GoalRow): Goal => ({
    id: Number(dbGoal.id),
    name: dbGoal.name,
    targetAmount: Number(dbGoal.target_amount),
    currentAmount: Number(dbGoal.current_amount),
    deadline: dbGoal.deadline,
    category: dbGoal.category,
    description: dbGoal.description || undefined
});

const dbFamilyTransferToFamilyTransfer = (dbTransfer: FamilyTransferRow): FamilyTransfer => ({
    id: Number(dbTransfer.id),
    date: dbTransfer.date,
    recipient: dbTransfer.recipient,
    relationship: dbTransfer.relationship,
    amount: Number(dbTransfer.amount),
    purpose: dbTransfer.purpose,
    notes: dbTransfer.notes || undefined,
    accountId: dbTransfer.account_id ? Number(dbTransfer.account_id) : undefined
});

const dbStockToStock = (dbStock: StockRow): Stock => ({
    id: Number(dbStock.id),
    symbol: dbStock.symbol,
    companyName: dbStock.company_name,
    quantity: Number(dbStock.quantity),
    avgPrice: Number(dbStock.avg_price),
    currentPrice: Number(dbStock.current_price),
    sector: dbStock.sector || undefined,
    exchange: dbStock.exchange,
    investmentAmount: Number(dbStock.investment_amount),
    currentValue: Number(dbStock.current_value),
    pnl: Number(dbStock.pnl),
    pnlPercentage: Number(dbStock.pnl_percentage),
    previousPrice: dbStock.previous_price ? Number(dbStock.previous_price) : undefined
});

const dbStockTransactionToStockTransaction = (dbTransaction: StockTransactionRow): StockTransaction => ({
    id: Number(dbTransaction.id),
    stockId: Number(dbTransaction.stock_id),
    transactionType: dbTransaction.transaction_type as 'BUY' | 'SELL',
    quantity: Number(dbTransaction.quantity),
    price: Number(dbTransaction.price),
    totalAmount: Number(dbTransaction.total_amount),
    brokerage: dbTransaction.brokerage ? Number(dbTransaction.brokerage) : undefined,
    taxes: dbTransaction.taxes ? Number(dbTransaction.taxes) : undefined,
    transactionDate: dbTransaction.transaction_date,
    notes: dbTransaction.notes || undefined,
    accountId: dbTransaction.account_id ? Number(dbTransaction.account_id) : undefined
});

const dbWatchlistToWatchlistItem = (dbWatchlist: WatchlistRow): WatchlistItem => ({
    id: Number(dbWatchlist.id),
    symbol: dbWatchlist.symbol,
    companyName: dbWatchlist.company_name,
    targetPrice: dbWatchlist.target_price ? Number(dbWatchlist.target_price) : undefined,
    currentPrice: dbWatchlist.current_price ? Number(dbWatchlist.current_price) : undefined,
    notes: dbWatchlist.notes || undefined
});

const dbMutualFundToMutualFund = (dbMF: MutualFundRow): MutualFund => ({
    id: Number(dbMF.id),
    name: dbMF.name,
    isin: dbMF.isin || undefined,
    schemeCode: dbMF.scheme_code || undefined,
    category: dbMF.category || undefined,
    units: Number(dbMF.units),
    avgNav: Number(dbMF.avg_nav),
    currentNav: Number(dbMF.current_nav),
    investmentAmount: Number(dbMF.investment_amount),
    currentValue: Number(dbMF.current_value),
    pnl: Number(dbMF.pnl),
    pnlPercentage: Number(dbMF.pnl_percentage),
    folioNumber: dbMF.folio_number || undefined,
    previousNav: dbMF.previous_nav ? Number(dbMF.previous_nav) : undefined
});

const dbMutualFundTransactionToMutualFundTransaction = (dbTx: MutualFundTransactionRow): MutualFundTransaction => ({
    id: Number(dbTx.id),
    mutualFundId: Number(dbTx.mutual_fund_id),
    transactionType: dbTx.transaction_type as 'BUY' | 'SELL' | 'SIP',
    units: Number(dbTx.units),
    nav: Number(dbTx.nav),
    totalAmount: Number(dbTx.total_amount),
    transactionDate: dbTx.transaction_date,
    notes: dbTx.notes || undefined,
    accountId: dbTx.account_id ? Number(dbTx.account_id) : undefined
});

const dbFnoTradeToFnoTrade = (dbTx: FnoTradeRow): FnoTrade => ({
    id: Number(dbTx.id),
    instrument: dbTx.instrument,
    tradeType: dbTx.trade_type as 'BUY' | 'SELL',
    product: dbTx.product as 'NRML' | 'MIS',
    quantity: Number(dbTx.quantity),
    avgPrice: Number(dbTx.avg_price),
    exitPrice: dbTx.exit_price ? Number(dbTx.exit_price) : undefined,
    entryDate: dbTx.entry_date,
    exitDate: dbTx.exit_date || undefined,
    status: dbTx.status as 'OPEN' | 'CLOSED',
    pnl: Number(dbTx.pnl),
    notes: dbTx.notes || undefined,
    accountId: dbTx.account_id ? Number(dbTx.account_id) : undefined
});

export function FinanceProvider({ children }: { children: React.ReactNode }) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [familyTransfers, setFamilyTransfers] = useState<FamilyTransfer[]>([]);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
    const [mutualFundTransactions, setMutualFundTransactions] = useState<MutualFundTransaction[]>([]);
    const [fnoTrades, setFnoTrades] = useState<FnoTrade[]>([]);
    const [settings, setSettings] = useState<AppSettings>({
        brokerageType: 'percentage',
        brokerageValue: 0,
        sttRate: 0.1,
        transactionChargeRate: 0.00345,
        sebiChargeRate: 0.0001,
        stampDutyRate: 0.015,
        gstRate: 18,
        dpCharges: 15.93, // 13.5 + 18% GST
        autoCalculateCharges: true
    });
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!user) {
                if (!authLoading) setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Initialize settings from DB (fall back to localStorage if DB fetch fails)
                let currentSettings = settings;
                const savedLocalSettings = localStorage.getItem('fincore_settings');
                if (savedLocalSettings) {
                    currentSettings = JSON.parse(savedLocalSettings);
                }

                const [
                    { data: accountsData, error: accountsError },
                    { data: transactionsData, error: transactionsError },
                    { data: goalsData, error: goalsError },
                    { data: familyTransfersData, error: familyTransfersError },
                    { data: stocksData, error: stocksError },
                    { data: stockTransactionsData, error: stockTransactionsError },
                    { data: watchlistData, error: watchlistError },
                    { data: mutualFundsData, error: mutualFundsError },
                    { data: mutualFundTransactionsData, error: mutualFundTransactionsError },
                    { data: fnoTradesData, error: fnoTradesError },
                    { data: settingsData, error: settingsError }
                ] = await Promise.all([
                    supabase.from('accounts').select('*').order('created_at', { ascending: false }),
                    supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100),
                    supabase.from('goals').select('*').order('deadline', { ascending: true }),
                    supabase.from('family_transfers').select('*').order('date', { ascending: false }),
                    supabase.from('stocks').select('*').order('symbol', { ascending: true }),
                    supabase.from('stock_transactions').select('*').order('transaction_date', { ascending: false }),
                    supabase.from('watchlist').select('*').order('symbol', { ascending: true }),
                    supabase.from('mutual_funds').select('*').order('name', { ascending: true }),
                    supabase.from('mutual_fund_transactions').select('*').order('transaction_date', { ascending: false }),
                    (supabase as ExtendedSupabaseClient).from('fno_trades').select('*').order('entry_date', { ascending: false }),
                    (supabase as ExtendedSupabaseClient).from('app_settings').select('*').eq('user_id', user.id).maybeSingle()
                ]);

                if (accountsError) console.error('Error loading accounts:', accountsError);
                else {
                    const loadedAccounts = accountsData.map(dbAccountToAccount);
                    setAccounts(loadedAccounts);

                    // Check if Physical Cash account exists, if not create it
                    const hasPhysicalCash = loadedAccounts.some(acc =>
                        acc.name.toLowerCase() === 'physical cash'
                    );

                    if (!hasPhysicalCash) {
                        const { data: newAccount, error: insertError } = await supabase
                            .from('accounts')
                            .insert({
                                name: 'Physical Cash',
                                bank_name: 'Cash',
                                type: 'Cash',
                                balance: 0,
                                currency: 'INR'
                            })
                            .select()
                            .single();

                        if (insertError) {
                            console.error('Error creating Physical Cash account:', insertError);
                        } else if (newAccount) {
                            setAccounts(prev => [...prev, dbAccountToAccount(newAccount)]);
                        }
                    }
                }

                if (transactionsError) console.error('Error loading transactions:', transactionsError);
                else setTransactions(transactionsData.map(dbTransactionToTransaction));

                if (goalsError) console.error('Error loading goals:', goalsError);
                else setGoals(goalsData.map(dbGoalToGoal));

                if (familyTransfersError) console.error('Error loading family transfers:', familyTransfersError);
                else setFamilyTransfers(familyTransfersData.map(dbFamilyTransferToFamilyTransfer));

                if (stocksError) console.error('Error loading stocks:', stocksError);
                else setStocks(stocksData.map(dbStockToStock));

                if (stockTransactionsError) console.error('Error loading stock transactions:', stockTransactionsError);
                else setStockTransactions(stockTransactionsData.map(dbStockTransactionToStockTransaction));

                if (watchlistError) console.error('Error loading watchlist:', watchlistError);
                else setWatchlist(watchlistData.map(dbWatchlistToWatchlistItem));

                if (mutualFundsError) console.error('Error loading mutual funds:', mutualFundsError);
                else setMutualFunds(mutualFundsData.map(dbMutualFundToMutualFund));

                if (mutualFundTransactionsError) console.error('Error loading mutual fund transactions:', mutualFundTransactionsError);
                else setMutualFundTransactions(mutualFundTransactionsData.map(dbMutualFundTransactionToMutualFundTransaction));

                if (fnoTradesError) console.error('Error loading FnO trades:', fnoTradesError);
                else setFnoTrades(fnoTradesData.map(dbFnoTradeToFnoTrade));

                if (!settingsError && settingsData) {
                    setSettings(dbSettingsToSettings(settingsData));
                } else if (!settingsData) {
                    // Create settings in DB if they don't exist
                    const { data: newSettingsData, error: insertError } = await (supabase as ExtendedSupabaseClient)
                        .from('app_settings')
                        .insert({
                            user_id: user.id,
                            brokerage_type: currentSettings.brokerageType,
                            brokerage_value: currentSettings.brokerageValue,
                            stt_rate: currentSettings.sttRate,
                            transaction_charge_rate: currentSettings.transactionChargeRate,
                            sebi_charge_rate: currentSettings.sebiChargeRate,
                            stamp_duty_rate: currentSettings.stampDutyRate,
                            gst_rate: currentSettings.gstRate,
                            dp_charges: currentSettings.dpCharges,
                            auto_calculate_charges: currentSettings.autoCalculateCharges,
                            default_stock_account_id: currentSettings.defaultStockAccountId || null,
                            default_mf_account_id: currentSettings.defaultMfAccountId || null,
                            default_salary_account_id: currentSettings.defaultSalaryAccountId || null
                        })
                        .select()
                        .maybeSingle();

                    if (!insertError && newSettingsData) {
                        setSettings(dbSettingsToSettings(newSettingsData));
                    }
                }


            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();

        // 60 second auto-refresh
        const interval = setInterval(() => {
            refreshPortfolio();
        }, 60000);

        return () => clearInterval(interval);
        // refreshPortfolio and settings are intentionally excluded to prevent infinite loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading]);

    const refreshPortfolio = async () => {
        if (!user || stocks.length === 0 && mutualFunds.length === 0) return;

        // Refresh Stocks
        const updatedStocks = await Promise.all(stocks.map(async (stock) => {
            try {
                const res = await fetch(`/api/stocks/quote?symbol=${stock.symbol}`);
                const data = await res.json();
                if (data.currentPrice) {
                    const newPrice = data.currentPrice;
                    const prevPrice = data.previousClose || stock.previousPrice || newPrice;
                    const newValue = stock.quantity * newPrice;
                    const newPnL = newValue - stock.investmentAmount;

                    const updated = {
                        ...stock,
                        currentPrice: newPrice,
                        previousPrice: prevPrice,
                        currentValue: newValue,
                        pnl: newPnL,
                        pnlPercentage: stock.investmentAmount > 0 ? (newPnL / stock.investmentAmount) * 100 : 0
                    };

                    // Update DB in background
                    supabase.from('stocks').update({
                        current_price: newPrice,
                        previous_price: prevPrice,
                        current_value: newValue,
                        pnl: newPnL,
                        pnl_percentage: updated.pnlPercentage
                    }).eq('id', stock.id).then(({ error }) => {
                        if (error) console.error(`Sync error for ${stock.symbol}:`, error);
                    });

                    return updated;
                }
            } catch (e) {
                console.error(`Failed to refresh ${stock.symbol}:`, e);
            }
            return stock;
        }));

        // Refresh Mutual Funds
        const updatedMFs = await Promise.all(mutualFunds.map(async (mf) => {
            try {
                if (mf.schemeCode) {
                    const res = await fetch(`/api/mf/quote?code=${mf.schemeCode}`);
                    const data = await res.json();
                    if (data.currentNav) {
                        const newNav = data.currentNav;
                        const prevNav = data.previousNav || mf.previousNav || newNav;
                        const newValue = mf.units * newNav;
                        const newPnL = newValue - mf.investmentAmount;

                        const updated = {
                            ...mf,
                            currentNav: newNav,
                            previousNav: prevNav,
                            currentValue: newValue,
                            pnl: newPnL,
                            pnlPercentage: mf.investmentAmount > 0 ? (newPnL / mf.investmentAmount) * 100 : 0
                        };

                        // Update DB in background
                        supabase.from('mutual_funds').update({
                            current_nav: newNav,
                            previous_nav: prevNav,
                            current_value: newValue,
                            pnl: newPnL,
                            pnl_percentage: updated.pnlPercentage
                        }).eq('id', mf.id).then(({ error }) => {
                            if (error) console.error(`Sync error for ${mf.name}:`, error);
                        });

                        return updated;
                    }
                }
            } catch (e) {
                console.error(`Failed to refresh ${mf.name}:`, e);
            }
            return mf;
        }));

        setStocks(updatedStocks);
        setMutualFunds(updatedMFs);
    };

    const updateSettings = async (newSettings: AppSettings) => {
        setSettings(newSettings);

        if (!user) {
            localStorage.setItem('fincore_settings', JSON.stringify(newSettings));
            return;
        }

        const { error } = await (supabase as ExtendedSupabaseClient)
            .from('app_settings')
            .update({
                brokerage_type: newSettings.brokerageType,
                brokerage_value: newSettings.brokerageValue,
                stt_rate: newSettings.sttRate,
                transaction_charge_rate: newSettings.transactionChargeRate,
                sebi_charge_rate: newSettings.sebiChargeRate,
                stamp_duty_rate: newSettings.stampDutyRate,
                gst_rate: newSettings.gstRate,
                dp_charges: newSettings.dpCharges,
                auto_calculate_charges: newSettings.autoCalculateCharges,
                default_stock_account_id: newSettings.defaultStockAccountId || null,
                default_mf_account_id: newSettings.defaultMfAccountId || null,
                default_salary_account_id: newSettings.defaultSalaryAccountId || null,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

        if (error) {
            console.error('Error updating settings in DB:', error);
            // Fallback to localStorage just in case
            localStorage.setItem('fincore_settings', JSON.stringify(newSettings));
        }
    };

    const addAccount = async (accountData: Omit<Account, 'id'>) => {
        const { data, error } = await supabase
            .from('accounts')
            .insert({
                name: accountData.name,
                bank_name: accountData.bankName,
                type: accountData.type,
                balance: accountData.balance,
                currency: accountData.currency
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding account:', error);
            return;
        }

        const newAccount = dbAccountToAccount(data);
        setAccounts(prev => [newAccount, ...prev]);

        // Add initial transaction if balance > 0
        if (accountData.balance > 0) {
            await addTransaction({
                date: new Date().toISOString().split('T')[0],
                description: `Initial Balance - ${accountData.name}`,
                category: 'Initial Deposit',
                type: 'Income',
                amount: accountData.balance,
                accountId: newAccount.id
            });
        }
    };

    const updateAccount = async (updatedAccount: Account, skipLedgerEntry: boolean = false) => {
        const { error } = await supabase
            .from('accounts')
            .update({
                name: updatedAccount.name,
                bank_name: updatedAccount.bankName,
                type: updatedAccount.type,
                // balance is now managed by database triggers on transactions
                currency: updatedAccount.currency
            })
            .eq('id', updatedAccount.id);

        if (error) {
            console.error('Error updating account:', error);
            return;
        }

        setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));

        // Add transaction for balance change only if not skipped
        if (!skipLedgerEntry) {
            const oldAccount = accounts.find(acc => acc.id === updatedAccount.id);
            if (oldAccount && oldAccount.balance !== updatedAccount.balance) {
                const diff = updatedAccount.balance - oldAccount.balance;
                const isIncome = diff > 0;

                await addTransaction({
                    date: new Date().toISOString().split('T')[0],
                    description: `Balance Update - ${updatedAccount.name}`,
                    category: 'Adjustment',
                    type: isIncome ? 'Income' : 'Expense',
                    amount: Math.abs(diff),
                    accountId: updatedAccount.id
                });
            }
        }
    };

    const deleteAccount = async (id: number) => {
        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting account:', error);
            return;
        }

        setAccounts(prev => prev.filter(acc => acc.id !== id));
    };

    const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
        const { data, error } = await supabase
            .from('transactions')
            .insert({
                date: transactionData.date,
                description: transactionData.description,
                category: transactionData.category,
                type: transactionData.type,
                amount: transactionData.amount,
                account_id: transactionData.accountId || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding transaction:', error);
            return;
        }

        const newTransaction = dbTransactionToTransaction(data);
        setTransactions(prev => [newTransaction, ...prev]);

        // Refresh accounts to get updated balance from trigger
        setTimeout(() => refreshAccounts(), 500);
    };

    const refreshAccounts = async () => {
        const { data, error } = await supabase.from('accounts').select('*');
        if (!error && data) {
            setAccounts(data.map(dbAccountToAccount));
        }
    };

    const updateTransaction = async (updatedTransaction: Transaction) => {
        const { error } = await supabase
            .from('transactions')
            .update({
                date: updatedTransaction.date,
                description: updatedTransaction.description,
                category: updatedTransaction.category,
                type: updatedTransaction.type,
                amount: updatedTransaction.amount,
                account_id: updatedTransaction.accountId || null
            })
            .eq('id', updatedTransaction.id);

        if (error) {
            console.error('Error updating transaction:', error);
            return;
        }

        setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    };

    const deleteTransaction = async (id: number) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting transaction:', error);
            return;
        }

        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const addFunds = async (accountId: number, amount: number) => {
        // Update account balance
        const account = accounts.find(acc => acc.id === accountId);
        if (!account) return;

        await updateAccount({
            ...account,
            balance: account.balance + amount
        });

        // Transaction will be added automatically by updateAccount
    };

    const addGoal = async (goalData: Omit<Goal, 'id'>) => {
        const { data, error } = await supabase
            .from('goals')
            .insert({
                name: goalData.name,
                target_amount: goalData.targetAmount,
                current_amount: goalData.currentAmount,
                deadline: goalData.deadline,
                category: goalData.category,
                description: goalData.description || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding goal:', error);
            return;
        }

        const newGoal = dbGoalToGoal(data);
        setGoals(prev => [...prev, newGoal]);
    };

    const updateGoal = async (updatedGoal: Goal, accountId?: number) => {
        const { error } = await supabase
            .from('goals')
            .update({
                name: updatedGoal.name,
                target_amount: updatedGoal.targetAmount,
                current_amount: updatedGoal.currentAmount,
                deadline: updatedGoal.deadline || undefined,
                category: updatedGoal.category,
                description: updatedGoal.description || null
            })
            .eq('id', updatedGoal.id);

        if (error) {
            console.error('Error updating goal:', error);
            return;
        }

        setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));

        // Registry for Goal Contribution
        const oldGoal = goals.find(g => g.id === updatedGoal.id);
        if (oldGoal && updatedGoal.currentAmount > oldGoal.currentAmount) {
            const diff = updatedGoal.currentAmount - oldGoal.currentAmount;

            // 1 & 2. Ledger Registry (Centralized Balance Update)
            await addTransaction({
                date: new Date().toISOString().split('T')[0],
                description: `Goal Contribution: ${updatedGoal.name}`,
                category: 'Savings',
                type: 'Expense',
                amount: diff,
                accountId: accountId
            });
        }
    };

    const deleteGoal = async (id: number) => {
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting goal:', error);
            return;
        }

        setGoals(prev => prev.filter(g => g.id !== id));
    };

    const addFamilyTransfer = async (transferData: Omit<FamilyTransfer, 'id'>) => {
        // 1 & 2. Ledger Registry (Centralized Balance Update)
        await addTransaction({
            date: transferData.date,
            description: `Family Transfer: ${transferData.recipient} (${transferData.purpose})`,
            category: 'Family',
            type: 'Expense',
            amount: transferData.amount,
            accountId: transferData.accountId
        });

        const { data, error } = await supabase
            .from('family_transfers')
            .insert({
                date: transferData.date,
                recipient: transferData.recipient,
                relationship: transferData.relationship,
                amount: transferData.amount,
                purpose: transferData.purpose,
                notes: transferData.notes || null,
                account_id: transferData.accountId || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding family transfer:', error);
            return;
        }

        const newTransfer = dbFamilyTransferToFamilyTransfer(data);
        setFamilyTransfers(prev => [newTransfer, ...prev]);
    };

    const updateFamilyTransfer = async (updatedTransfer: FamilyTransfer) => {
        const { error } = await supabase
            .from('family_transfers')
            .update({
                date: updatedTransfer.date,
                recipient: updatedTransfer.recipient,
                relationship: updatedTransfer.relationship,
                amount: updatedTransfer.amount,
                purpose: updatedTransfer.purpose,
                notes: updatedTransfer.notes || null
            })
            .eq('id', updatedTransfer.id);

        if (error) {
            console.error('Error updating family transfer:', error);
            return;
        }

        setFamilyTransfers(prev => prev.map(t => t.id === updatedTransfer.id ? updatedTransfer : t));
    };

    const deleteFamilyTransfer = async (id: number) => {
        const { error } = await supabase
            .from('family_transfers')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting family transfer:', error);
            return;
        }

        setFamilyTransfers(prev => prev.filter(t => t.id !== id));
    };

    const addStock = async (stockData: Omit<Stock, 'id'>) => {
        const { data, error } = await supabase
            .from('stocks')
            .insert({
                symbol: stockData.symbol,
                company_name: stockData.companyName,
                quantity: stockData.quantity,
                avg_price: stockData.avgPrice,
                current_price: stockData.currentPrice,
                sector: stockData.sector || null,
                exchange: stockData.exchange,
                investment_amount: stockData.investmentAmount,
                current_value: stockData.currentValue,
                pnl: stockData.pnl,
                pnl_percentage: stockData.pnlPercentage,
                previous_price: stockData.previousPrice || stockData.currentPrice
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding stock:', error);
            return;
        }

        const newStock = dbStockToStock(data);
        setStocks(prev => [...prev, newStock]);
    };

    const updateStock = async (updatedStock: Stock) => {
        const { error } = await supabase
            .from('stocks')
            .update({
                symbol: updatedStock.symbol,
                company_name: updatedStock.companyName,
                quantity: updatedStock.quantity,
                avg_price: updatedStock.avgPrice,
                current_price: updatedStock.currentPrice,
                sector: updatedStock.sector || null,
                exchange: updatedStock.exchange,
                investment_amount: updatedStock.investmentAmount,
                current_value: updatedStock.currentValue,
                pnl: updatedStock.pnl,
                pnl_percentage: updatedStock.pnlPercentage,
                previous_price: updatedStock.previousPrice
            })
            .eq('id', updatedStock.id);

        if (error) {
            console.error('Error updating stock:', error);
            return;
        }

        setStocks(prev => prev.map(s => s.id === updatedStock.id ? updatedStock : s));
    };

    const deleteStock = async (id: number) => {
        const { error } = await supabase
            .from('stocks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting stock:', error);
            return;
        }

        setStocks(prev => prev.filter(s => s.id !== id));
    };

    const addStockTransaction = async (transaction: Omit<StockTransaction, 'id'>) => {
        let finalBrokerage = transaction.brokerage;
        let finalTaxes = transaction.taxes;

        // Auto-math for charges if enabled
        if (settings.autoCalculateCharges && !transaction.brokerage && !transaction.taxes) {
            const charges = calculateStockCharges(
                transaction.transactionType,
                transaction.quantity,
                transaction.price,
                settings
            );
            finalBrokerage = charges.brokerage;
            finalTaxes = charges.taxes;
        }

        const effectiveTotal = transaction.transactionType === 'BUY'
            ? transaction.totalAmount + (finalBrokerage || 0) + (finalTaxes || 0)
            : transaction.totalAmount - (finalBrokerage || 0) - (finalTaxes || 0);

        // 1. Balance Check
        if (transaction.accountId) {
            const account = accounts.find(acc => acc.id === transaction.accountId);
            if (account && transaction.transactionType === 'BUY' && account.balance < effectiveTotal) {
                alert('Insufficient funds in the selected account.');
                return;
            }
        }

        // Ledger Registry is now handled by backend triggers for atomic precision
        // Every stock trade automatically creates a labeled entry in the transactions table


        const { data, error } = await supabase
            .from('stock_transactions')
            .insert({
                stock_id: transaction.stockId,
                transaction_type: transaction.transactionType,
                quantity: transaction.quantity,
                price: transaction.price,
                total_amount: transaction.totalAmount,
                brokerage: finalBrokerage || null,
                taxes: finalTaxes || null,
                transaction_date: transaction.transactionDate,
                notes: transaction.notes || null,
                account_id: transaction.accountId || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding stock transaction:', error);
            return;
        }

        const newTransaction = dbStockTransactionToStockTransaction(data);
        setStockTransactions(prev => [newTransaction, ...prev]);

        // Refresh accounts and transactions to see the auto-generated ledger entry
        setTimeout(() => {
            refreshAccounts();
            // Re-fetch transactions to show the new ledger entry
            supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100)
                .then(({ data }) => data && setTransactions(data.map(dbTransactionToTransaction)));
        }, 800);
    };

    const addToWatchlist = async (itemData: Omit<WatchlistItem, 'id'>) => {
        const { data, error } = await supabase
            .from('watchlist')
            .insert({
                symbol: itemData.symbol,
                company_name: itemData.companyName,
                target_price: itemData.targetPrice || null,
                current_price: itemData.currentPrice || null,
                notes: itemData.notes || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding to watchlist:', error);
            return;
        }

        const newItem = dbWatchlistToWatchlistItem(data);
        setWatchlist(prev => [...prev, newItem]);
    };

    const removeFromWatchlist = async (id: number) => {
        const { error } = await supabase
            .from('watchlist')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error removing from watchlist:', error);
            return;
        }

        setWatchlist(prev => prev.filter(w => w.id !== id));
    };

    const addMutualFund = async (mfData: Omit<MutualFund, 'id'>) => {
        const { data, error } = await supabase
            .from('mutual_funds')
            .insert({
                name: mfData.name,
                isin: mfData.isin,
                scheme_code: mfData.schemeCode,
                category: mfData.category,
                units: mfData.units,
                avg_nav: mfData.avgNav,
                current_nav: mfData.currentNav,
                investment_amount: mfData.investmentAmount,
                current_value: mfData.currentValue,
                pnl: mfData.pnl,
                pnl_percentage: mfData.pnlPercentage,
                folio_number: mfData.folioNumber,
                previous_nav: mfData.previousNav || mfData.currentNav
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding mutual fund:', error);
            return;
        }

        const newMF = dbMutualFundToMutualFund(data);
        setMutualFunds(prev => [...prev, newMF]);
    };

    const updateMutualFund = async (updatedMF: MutualFund) => {
        const { error } = await supabase
            .from('mutual_funds')
            .update({
                name: updatedMF.name,
                isin: updatedMF.isin,
                scheme_code: updatedMF.schemeCode,
                category: updatedMF.category,
                units: updatedMF.units,
                avg_nav: updatedMF.avgNav,
                current_nav: updatedMF.currentNav,
                investment_amount: updatedMF.investmentAmount,
                current_value: updatedMF.currentValue,
                pnl: updatedMF.pnl,
                pnl_percentage: updatedMF.pnlPercentage,
                folio_number: updatedMF.folioNumber,
                previous_nav: updatedMF.previousNav
            })
            .eq('id', updatedMF.id);

        if (error) {
            console.error('Error updating mutual fund:', error);
            return;
        }

        setMutualFunds(prev => prev.map(mf => mf.id === updatedMF.id ? updatedMF : mf));
    };

    const deleteMutualFund = async (id: number) => {
        const { error } = await supabase
            .from('mutual_funds')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting mutual fund:', error);
            return;
        }

        setMutualFunds(prev => prev.filter(mf => mf.id !== id));
    };

    const addMutualFundTransaction = async (transactionData: Omit<MutualFundTransaction, 'id'>) => {
        const isOutflow = transactionData.transactionType === 'BUY' || transactionData.transactionType === 'SIP';

        // 1. Balance Check
        if (transactionData.accountId) {
            const account = accounts.find(acc => acc.id === transactionData.accountId);
            if (account && isOutflow && account.balance < transactionData.totalAmount) {
                alert(`Insufficient funds in ${account.name} for this ${transactionData.transactionType}!`);
                return;
            }
        }

        // Ledger Registry is now handled by backend triggers


        const { data, error } = await supabase
            .from('mutual_fund_transactions')
            .insert({
                mutual_fund_id: transactionData.mutualFundId,
                transaction_type: transactionData.transactionType,
                units: transactionData.units,
                nav: transactionData.nav,
                total_amount: transactionData.totalAmount,
                transaction_date: transactionData.transactionDate,
                notes: transactionData.notes,
                account_id: transactionData.accountId || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding mutual fund transaction:', error);
            return;
        }

        const newTransaction = dbMutualFundTransactionToMutualFundTransaction(data);
        setMutualFundTransactions(prev => [newTransaction, ...prev]);

        // Refresh accounts and transactions
        setTimeout(() => {
            refreshAccounts();
            supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100)
                .then(({ data }) => data && setTransactions(data.map(dbTransactionToTransaction)));
        }, 800);
    };

    const deleteStockTransaction = async (id: number) => {
        const { error } = await supabase
            .from('stock_transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting stock transaction:', error);
            return;
        }

        setStockTransactions(prev => prev.filter(t => t.id !== id));
    };

    const deleteMutualFundTransaction = async (id: number) => {
        const { error } = await supabase
            .from('mutual_fund_transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting mutual fund transaction:', error);
            return;
        }

        setMutualFundTransactions(prev => prev.filter(t => t.id !== id));
    };

    const addFnoTrade = async (tradeData: Omit<FnoTrade, 'id'>) => {
        const investment = tradeData.avgPrice * tradeData.quantity;

        // 1. Balance Check (for Initial Outflow)
        if (tradeData.accountId) {
            const account = accounts.find(acc => acc.id === tradeData.accountId);
            if (account && account.balance < investment) {
                throw new Error(`Insufficient funds in ${account.name} (Balance: ₹${account.balance.toLocaleString()})`);
            }
        }

        // Ledger Registry is now handled by backend triggers


        const { data, error } = await (supabase as ExtendedSupabaseClient)
            .from('fno_trades')
            .insert({
                instrument: tradeData.instrument,
                trade_type: tradeData.tradeType,
                product: tradeData.product,
                quantity: tradeData.quantity,
                avg_price: tradeData.avgPrice,
                exit_price: tradeData.exitPrice || null,
                entry_date: tradeData.entryDate,
                exit_date: tradeData.exitDate || null,
                status: tradeData.status,
                pnl: tradeData.pnl,
                notes: tradeData.notes || null,
                account_id: tradeData.accountId || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding FnO trade:', error);
            throw new Error(error.message);
        }

        const newTrade = dbFnoTradeToFnoTrade(data);
        setFnoTrades(prev => [newTrade, ...prev]);

        // Refresh accounts and transactions
        setTimeout(() => {
            refreshAccounts();
            supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100)
                .then(({ data }) => data && setTransactions(data.map(dbTransactionToTransaction)));
        }, 800);
    };

    const updateFnoTrade = async (updatedTrade: FnoTrade) => {
        const oldTrade = fnoTrades.find(t => t.id === updatedTrade.id);

        // Ledger Registry is now handled by backend triggers


        const { error } = await (supabase as ExtendedSupabaseClient)
            .from('fno_trades')
            .update({
                instrument: updatedTrade.instrument,
                trade_type: updatedTrade.tradeType,
                product: updatedTrade.product,
                quantity: updatedTrade.quantity,
                avg_price: updatedTrade.avgPrice,
                exit_price: updatedTrade.exitPrice || null,
                entry_date: updatedTrade.entryDate,
                exit_date: updatedTrade.exitDate || null,
                status: updatedTrade.status,
                pnl: updatedTrade.pnl,
                notes: updatedTrade.notes || null
            })
            .eq('id', updatedTrade.id);

        if (error) {
            console.error('Error updating FnO trade:', error);
            return;
        }

        setFnoTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t));

        // Refresh accounts and transactions if status was changed to CLOSED
        if (oldTrade?.status === 'OPEN' && updatedTrade.status === 'CLOSED') {
            setTimeout(() => {
                refreshAccounts();
                supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100)
                    .then(({ data }) => data && setTransactions(data.map(dbTransactionToTransaction)));
            }, 800);
        }
    };

    const deleteFnoTrade = async (id: number) => {
        const { error } = await (supabase as ExtendedSupabaseClient)
            .from('fno_trades')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting FnO trade:', error);
            return;
        }

        setFnoTrades(prev => prev.filter(t => t.id !== id));
    };

    return (
        <FinanceContext.Provider value={{
            accounts,
            transactions,
            goals,
            familyTransfers,
            stocks,
            stockTransactions,
            watchlist,
            mutualFunds,
            mutualFundTransactions,
            fnoTrades,
            settings,
            updateSettings,
            loading,
            addAccount,
            updateAccount,
            deleteAccount,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addFunds,
            addGoal,
            updateGoal,
            deleteGoal,
            addFamilyTransfer,
            updateFamilyTransfer,
            deleteFamilyTransfer,
            addStock,
            updateStock,
            deleteStock,
            addStockTransaction,
            deleteStockTransaction,
            addToWatchlist,
            removeFromWatchlist,
            addMutualFund,
            updateMutualFund,
            deleteMutualFund,
            addMutualFundTransaction,
            deleteMutualFundTransaction,
            addFnoTrade,
            updateFnoTrade,
            deleteFnoTrade,
            refreshPortfolio,
            isTransactionModalOpen,
            setIsTransactionModalOpen
        }}>
            {children}
        </FinanceContext.Provider>
    );
}

export function useFinance() {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
}
