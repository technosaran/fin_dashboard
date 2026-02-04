"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';

// Types based on database schema
type AccountRow = any;
type TransactionRow = any;
type GoalRow = any;
type FamilyTransferRow = any;
type StockRow = any;
type StockTransactionRow = any;
type WatchlistRow = any;
type MutualFundRow = any;
type MutualFundTransactionRow = any;

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
    loading: boolean;
    addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
    updateAccount: (account: Account) => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
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
    addToWatchlist: (item: Omit<WatchlistItem, 'id'>) => Promise<void>;
    removeFromWatchlist: (id: number) => Promise<void>;
    addMutualFund: (mf: Omit<MutualFund, 'id'>) => Promise<void>;
    updateMutualFund: (mf: MutualFund) => Promise<void>;
    deleteMutualFund: (id: number) => Promise<void>;
    addMutualFundTransaction: (transaction: Omit<MutualFundTransaction, 'id'>) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Helper functions to convert between database and app types
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
    pnlPercentage: Number(dbStock.pnl_percentage)
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
    folioNumber: dbMF.folio_number || undefined
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

export function SupabaseFinanceProvider({ children }: { children: React.ReactNode }) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [familyTransfers, setFamilyTransfers] = useState<FamilyTransfer[]>([]);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
    const [mutualFundTransactions, setMutualFundTransactions] = useState<MutualFundTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadAccounts(),
                loadTransactions(),
                loadGoals(),
                loadFamilyTransfers(),
                loadStocks(),
                loadStockTransactions(),
                loadWatchlist(),
                loadMutualFunds(),
                loadMutualFundTransactions()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAccounts = async () => {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading accounts:', error);
            return;
        }

        setAccounts(data.map(dbAccountToAccount));
    };

    const loadTransactions = async () => {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error loading transactions:', error);
            return;
        }

        setTransactions(data.map(dbTransactionToTransaction));
    };

    const loadGoals = async () => {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .order('deadline', { ascending: true });

        if (error) {
            console.error('Error loading goals:', error);
            return;
        }

        setGoals(data.map(dbGoalToGoal));
    };

    const loadFamilyTransfers = async () => {
        const { data, error } = await supabase
            .from('family_transfers')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error loading family transfers:', error);
            return;
        }

        setFamilyTransfers(data.map(dbFamilyTransferToFamilyTransfer));
    };

    const loadStocks = async () => {
        const { data, error } = await supabase
            .from('stocks')
            .select('*')
            .order('symbol', { ascending: true });

        if (error) {
            console.error('Error loading stocks:', error);
            return;
        }

        setStocks(data.map(dbStockToStock));
    };

    const loadStockTransactions = async () => {
        const { data, error } = await supabase
            .from('stock_transactions')
            .select('*')
            .order('transaction_date', { ascending: false });

        if (error) {
            console.error('Error loading stock transactions:', error);
            return;
        }

        setStockTransactions(data.map(dbStockTransactionToStockTransaction));
    };

    const loadWatchlist = async () => {
        const { data, error } = await supabase
            .from('watchlist')
            .select('*')
            .order('symbol', { ascending: true });

        if (error) {
            console.error('Error loading watchlist:', error);
            return;
        }

        setWatchlist(data.map(dbWatchlistToWatchlistItem));
    };

    const loadMutualFunds = async () => {
        const { data, error } = await supabase
            .from('mutual_funds')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error loading mutual funds:', error);
            return;
        }

        setMutualFunds(data.map(dbMutualFundToMutualFund));
    };

    const loadMutualFundTransactions = async () => {
        const { data, error } = await supabase
            .from('mutual_fund_transactions')
            .select('*')
            .order('transaction_date', { ascending: false });

        if (error) {
            console.error('Error loading mutual fund transactions:', error);
            return;
        }

        setMutualFundTransactions(data.map(dbMutualFundTransactionToMutualFundTransaction));
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

    const updateAccount = async (updatedAccount: Account) => {
        const { error } = await supabase
            .from('accounts')
            .update({
                name: updatedAccount.name,
                bank_name: updatedAccount.bankName,
                type: updatedAccount.type,
                balance: updatedAccount.balance,
                currency: updatedAccount.currency
            })
            .eq('id', updatedAccount.id);

        if (error) {
            console.error('Error updating account:', error);
            return;
        }

        setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));

        // Add transaction for balance change
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
    };

    const addFunds = async (accountId: number, amount: number, description: string, category: string) => {
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

            // 1. Balance Update
            if (accountId) {
                const account = accounts.find(acc => acc.id === accountId);
                if (account) {
                    await updateAccount({
                        ...account,
                        balance: account.balance - diff
                    });
                }
            }

            // 2. Ledger Registry
            await addTransaction({
                date: new Date().toISOString().split('T')[0],
                description: `Goal Contribution: ${updatedGoal.name}`,
                category: 'Savings',
                type: 'Expense',
                amount: diff,
                accountId: undefined // Use ledger only if no specific account provided for goals
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
        // 1. Balance Update
        if (transferData.accountId) {
            const account = accounts.find(acc => acc.id === transferData.accountId);
            if (account) {
                await updateAccount({
                    ...account,
                    balance: account.balance - transferData.amount
                });
            }
        }

        // 2. Ledger Registry
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
                pnl_percentage: stockData.pnlPercentage
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
                pnl_percentage: updatedStock.pnlPercentage
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

    const addStockTransaction = async (transactionData: Omit<StockTransaction, 'id'>) => {
        // 1. If linked to an account, check balance and update
        if (transactionData.accountId) {
            const account = accounts.find(acc => acc.id === transactionData.accountId);
            if (!account) {
                console.error('Linked account not found');
                return;
            }

            if (transactionData.transactionType === 'BUY' && account.balance < transactionData.totalAmount) {
                alert(`Insufficient funds in ${account.name}!`);
                return;
            }

            const balanceChange = transactionData.transactionType === 'BUY' ? -transactionData.totalAmount : transactionData.totalAmount;

            await updateAccount({
                ...account,
                balance: account.balance + balanceChange
            });

            // Log to ledger
            const stock = stocks.find(s => s.id === transactionData.stockId);
            await addTransaction({
                date: transactionData.transactionDate,
                description: `${transactionData.transactionType === 'BUY' ? 'Stock Purchase' : 'Stock Sale'}: ${stock?.symbol || 'Unknown'}`,
                category: 'Investments',
                type: transactionData.transactionType === 'BUY' ? 'Expense' : 'Income',
                amount: transactionData.totalAmount,
                accountId: transactionData.accountId
            });
        }

        const { data, error } = await supabase
            .from('stock_transactions')
            .insert({
                stock_id: transactionData.stockId,
                transaction_type: transactionData.transactionType,
                quantity: transactionData.quantity,
                price: transactionData.price,
                total_amount: transactionData.totalAmount,
                brokerage: transactionData.brokerage || null,
                taxes: transactionData.taxes || null,
                transaction_date: transactionData.transactionDate,
                notes: transactionData.notes || null,
                account_id: transactionData.accountId || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding stock transaction:', error);
            return;
        }

        const newTransaction = dbStockTransactionToStockTransaction(data);
        setStockTransactions(prev => [newTransaction, ...prev]);
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
                folio_number: mfData.folioNumber
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
                folio_number: updatedMF.folioNumber
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
        // 1. If linked to an account, check balance and update
        if (transactionData.accountId) {
            const account = accounts.find(acc => acc.id === transactionData.accountId);
            if (!account) {
                console.error('Linked account not found');
                return;
            }

            const isOutflow = transactionData.transactionType === 'BUY' || transactionData.transactionType === 'SIP';

            if (isOutflow && account.balance < transactionData.totalAmount) {
                alert(`Insufficient funds in ${account.name} for this ${transactionData.transactionType}!`);
                return;
            }

            const balanceChange = isOutflow ? -transactionData.totalAmount : transactionData.totalAmount;

            await updateAccount({
                ...account,
                balance: account.balance + balanceChange
            });

            // Log to ledger
            const mf = mutualFunds.find(m => m.id === transactionData.mutualFundId);
            await addTransaction({
                date: transactionData.transactionDate,
                description: `${transactionData.transactionType} execution: ${mf?.name || 'Unknown'}`,
                category: 'Investments',
                type: isOutflow ? 'Expense' : 'Income',
                amount: transactionData.totalAmount,
                accountId: transactionData.accountId
            });
        }

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
            loading,
            addAccount,
            updateAccount,
            addTransaction,
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
            addToWatchlist,
            removeFromWatchlist,
            addMutualFund,
            updateMutualFund,
            deleteMutualFund,
            addMutualFundTransaction
        }}>
            {children}
        </FinanceContext.Provider>
    );
}

export function useFinance() {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a SupabaseFinanceProvider');
    }
    return context;
}