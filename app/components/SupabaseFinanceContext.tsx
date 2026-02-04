"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';

// Types based on database schema
type AccountRow = Database['public']['Tables']['accounts']['Row'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type GoalRow = Database['public']['Tables']['goals']['Row'];
type FamilyTransferRow = Database['public']['Tables']['family_transfers']['Row'];
type StockRow = Database['public']['Tables']['stocks']['Row'];
type StockTransactionRow = Database['public']['Tables']['stock_transactions']['Row'];
type WatchlistRow = Database['public']['Tables']['watchlist']['Row'];

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
}

export interface WatchlistItem {
    id: number;
    symbol: string;
    companyName: string;
    targetPrice?: number;
    currentPrice?: number;
    notes?: string;
}

interface FinanceContextType {
    accounts: Account[];
    transactions: Transaction[];
    goals: Goal[];
    familyTransfers: FamilyTransfer[];
    stocks: Stock[];
    stockTransactions: StockTransaction[];
    watchlist: WatchlistItem[];
    loading: boolean;
    addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
    updateAccount: (account: Account) => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    addFunds: (accountId: number, amount: number, description: string, category: string) => Promise<void>;
    addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
    updateGoal: (goal: Goal) => Promise<void>;
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
    notes: dbTransfer.notes || undefined
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
    notes: dbTransaction.notes || undefined
});

const dbWatchlistToWatchlistItem = (dbWatchlist: WatchlistRow): WatchlistItem => ({
    id: Number(dbWatchlist.id),
    symbol: dbWatchlist.symbol,
    companyName: dbWatchlist.company_name,
    targetPrice: dbWatchlist.target_price ? Number(dbWatchlist.target_price) : undefined,
    currentPrice: dbWatchlist.current_price ? Number(dbWatchlist.current_price) : undefined,
    notes: dbWatchlist.notes || undefined
});

export function SupabaseFinanceProvider({ children }: { children: React.ReactNode }) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [familyTransfers, setFamilyTransfers] = useState<FamilyTransfer[]>([]);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
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
                loadWatchlist()
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

    const updateGoal = async (updatedGoal: Goal) => {
        const { error } = await supabase
            .from('goals')
            .update({
                name: updatedGoal.name,
                target_amount: updatedGoal.targetAmount,
                current_amount: updatedGoal.currentAmount,
                deadline: updatedGoal.deadline,
                category: updatedGoal.category,
                description: updatedGoal.description || null
            })
            .eq('id', updatedGoal.id);

        if (error) {
            console.error('Error updating goal:', error);
            return;
        }

        setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
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
        const { data, error } = await supabase
            .from('family_transfers')
            .insert({
                date: transferData.date,
                recipient: transferData.recipient,
                relationship: transferData.relationship,
                amount: transferData.amount,
                purpose: transferData.purpose,
                notes: transferData.notes || null
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
                notes: transactionData.notes || null
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

    return (
        <FinanceContext.Provider value={{
            accounts,
            transactions,
            goals,
            familyTransfers,
            stocks,
            stockTransactions,
            watchlist,
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
            removeFromWatchlist
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