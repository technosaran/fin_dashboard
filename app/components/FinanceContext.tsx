"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
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
}

interface FinanceContextType {
    accounts: Account[];
    transactions: Transaction[];
    addAccount: (account: Omit<Account, 'id'>) => void;
    updateAccount: (account: Account) => void;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    addFunds: (accountId: number, amount: number, description: string, category: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
    // Initial Mock Data
    const [accounts, setAccounts] = useState<Account[]>([
        {
            id: 1,
            name: "Physical Cash",
            bankName: "Wallet",
            type: "Cash",
            balance: 0,
            currency: 'USD'
        }
    ]);

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Helper to calculate Net Worth (helper for internal logic if needed, but we expose raw data)

    const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
        const newTx = { ...transaction, id: Date.now() };
        setTransactions(prev => [newTx, ...prev]);
    };

    const addAccount = (accountData: Omit<Account, 'id'>) => {
        const newAccount = { ...accountData, id: Date.now() };
        setAccounts(prev => [...prev, newAccount]);

        // Automatically log initial balance as Income
        if (newAccount.balance > 0) {
            addTransaction({
                date: new Date().toISOString().split('T')[0],
                description: `Initial Balance - ${newAccount.name}`,
                category: 'Initial Deposit',
                type: 'Income',
                amount: newAccount.balance
            });
        }
    };

    const updateAccount = (updatedAccount: Account) => {
        setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));

        // Find the old account to compare balances
        const oldAccount = accounts.find(acc => acc.id === updatedAccount.id);
        if (oldAccount && oldAccount.balance !== updatedAccount.balance) {
            const diff = updatedAccount.balance - oldAccount.balance;
            const isIncome = diff > 0;

            addTransaction({
                date: new Date().toISOString().split('T')[0],
                description: `Balance Update - ${updatedAccount.name}`,
                category: 'Adjustment',
                type: isIncome ? 'Income' : 'Expense',
                amount: Math.abs(diff)
            });
        }
    };

    const addFunds = (accountId: number, amount: number, description: string, category: string) => {
        setAccounts(prev => prev.map(acc => {
            if (acc.id === accountId) {
                return { ...acc, balance: acc.balance + amount };
            }
            return acc;
        }));

        addTransaction({
            date: new Date().toISOString().split('T')[0],
            description: description || 'Added Funds',
            category: category || 'Income',
            type: 'Income',
            amount: amount
        });
    };

    return (
        <FinanceContext.Provider value={{ accounts, transactions, addAccount, updateAccount, addTransaction, addFunds }}>
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
