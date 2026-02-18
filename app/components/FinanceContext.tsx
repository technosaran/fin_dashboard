'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from './AuthContext';
import {
  Account,
  Transaction,
  Goal,
  Stock,
  StockTransaction,
  Watchlist,
  MutualFund,
  MutualFundTransaction,
  FnoTrade,
  Bond,
  BondTransaction,
  AppSettings,
  ForexTransaction,
  FamilyTransfer,
  FinanceContextState,
} from '@/lib/types';
import { logError, logInfo } from '../../lib/utils/logger';
import {
  dbAccountToAccount,
  dbTransactionToTransaction,
  dbGoalToGoal,
  dbFamilyTransferToFamilyTransfer,
  dbStockToStock,
  dbStockTransactionToStockTransaction,
  dbMutualFundToMutualFund,
  dbMutualFundTransactionToMutualFundTransaction,
  dbFnoTradeToFnoTrade,
  dbBondToBond,
  dbBondTransactionToBondTransaction,
  dbForexTransactionToForexTransaction,
  dbSettingsToSettings,
  AppSettingsRow,
} from '../../lib/utils/db-converters';

// Extended client type for tables not yet in auto-generated DB types (bonds, fno_trades, forex_transactions, etc.)
// To remove this workaround, regenerate types with `supabase gen types typescript`
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase query builder for unmapped tables requires dynamic return type
type ExtendedSupabaseClient = typeof supabase & { from: (table: string) => any };

const FinanceContext = createContext<FinanceContextState | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [familyTransfers, setFamilyTransfers] = useState<FamilyTransfer[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
  const [watchlist, _setWatchlist] = useState<Watchlist[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [mutualFundTransactions, setMutualFundTransactions] = useState<MutualFundTransaction[]>([]);
  const [fnoTrades, setFnoTrades] = useState<FnoTrade[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [bondTransactions, setBondTransactions] = useState<BondTransaction[]>([]);
  const [forexTransactions, setForexTransactions] = useState<ForexTransaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    brokerageType: 'flat',
    brokerageValue: 0,
    sttRate: 0.1,
    transactionChargeRate: 0.00297,
    sebiChargeRate: 0.0001,
    stampDutyRate: 0.015,
    gstRate: 18,
    dpCharges: 15.93,
    autoCalculateCharges: true,
    bondsEnabled: true,
    forexEnabled: true,
    stocksVisible: true,
    mutualFundsVisible: true,
    fnoVisible: true,
    ledgerVisible: true,
    incomeVisible: true,
    expensesVisible: true,
    goalsVisible: true,
    familyVisible: true,
  });
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Generic delete helper to reduce repetitive CRUD boilerplate
  function deleteFromTable<T extends { id: number }>(
    table: string,
    label: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) {
    return async (id: number) => {
      const { error } = await (supabase as ExtendedSupabaseClient)
        .from(table)
        .delete()
        .eq('id', id);
      if (error) {
        logError(`Error deleting ${label}:`, error);
        throw error;
      }
      setter((prev) => prev.filter((item) => item.id !== id));
    };
  }

  const refreshAccounts = useCallback(async () => {
    const { data, error } = await supabase.from('accounts').select('*');
    if (error) logError('Error refreshing accounts:', error);
    else setAccounts(data.map(dbAccountToAccount));
  }, []);

  // Refresh transactions (ledger) - called after investment ops since DB triggers create ledger entries
  const refreshTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);
    if (error) logError('Error refreshing transactions:', error);
    else setTransactions(data.map(dbTransactionToTransaction));
  }, []);

  const refreshPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      // Reload all portfolio data from Supabase
      const [{ data: stockData }, { data: mfData }, { data: bondData }, { data: fnoData }] =
        await Promise.all([
          supabase.from('stocks').select('*'),
          supabase.from('mutual_funds').select('*'),
          (supabase as ExtendedSupabaseClient).from('bonds').select('*'),
          (supabase as ExtendedSupabaseClient).from('fno_trades').select('*'),
        ]);

      if (stockData) setStocks(stockData.map(dbStockToStock));
      if (mfData) setMutualFunds(mfData.map(dbMutualFundToMutualFund));
      if (bondData) setBonds(bondData.map(dbBondToBond));
      if (fnoData) setFnoTrades(fnoData.map(dbFnoTradeToFnoTrade));

      logInfo('Portfolio refreshed successfully');
    } catch (err) {
      logError('Error refreshing portfolio:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback(
    async (transactionData: Omit<Transaction, 'id'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          date: transactionData.date,
          description: transactionData.description,
          category: transactionData.category,
          type: transactionData.type,
          amount: transactionData.amount,
          account_id: transactionData.accountId || null,
        })
        .select()
        .single();

      if (error) {
        logError('Error adding transaction:', error);
        throw error;
      }

      const newTransaction = dbTransactionToTransaction(data);
      setTransactions((prev) => [newTransaction, ...prev]);
      refreshAccounts();
    },
    [refreshAccounts]
  );

  const updateTransaction = useCallback(
    async (id: number, transaction: Partial<Transaction>) => {
      const { error } = await supabase
        .from('transactions')
        .update({
          date: transaction.date,
          description: transaction.description,
          category: transaction.category,
          type: transaction.type,
          amount: transaction.amount,
          account_id: transaction.accountId || null,
        })
        .eq('id', id);

      if (error) {
        logError('Error updating transaction:', error);
        throw error;
      }

      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...transaction } : t)));
      refreshAccounts();
    },
    [refreshAccounts]
  );

  const deleteTransaction = useCallback(
    async (id: number) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);

      if (error) {
        logError('Error deleting transaction:', error);
        throw error;
      }

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      refreshAccounts();
    },
    [refreshAccounts]
  );

  const addAccount = useCallback(async (account: Omit<Account, 'id'>) => {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        name: account.name,
        bank_name: account.bankName,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
      })
      .select()
      .single();

    if (error) {
      logError('Error adding account:', error);
      throw error;
    }

    setAccounts((prev) => [...prev, dbAccountToAccount(data)]);
  }, []);

  const updateAccount = useCallback(async (id: number, account: Partial<Account>) => {
    const { error } = await supabase
      .from('accounts')
      .update({
        name: account.name,
        bank_name: account.bankName,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
      })
      .eq('id', id);

    if (error) {
      logError('Error updating account:', error);
      throw error;
    }

    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...account } : a)));
  }, []);

  const deleteAccount = useMemo(() => deleteFromTable('accounts', 'account', setAccounts), []);

  const addFunds = useCallback(
    async (
      accountId: number,
      amount: number,
      description: string = 'Add Funds',
      category: string = 'Income'
    ) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          account_id: accountId,
          amount: amount,
          description: description,
          category: category,
          type: 'Income',
          date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) {
        logError('Error adding funds (transaction):', error);
        throw error;
      }

      const newTx = dbTransactionToTransaction(data);
      setTransactions((prev) => [newTx, ...prev]);
      refreshAccounts();
    },
    [refreshAccounts]
  );

  const updateSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      if (user) {
        const { error } = await (supabase as ExtendedSupabaseClient)
          .from('app_settings')
          .update({
            brokerage_type: updatedSettings.brokerageType,
            brokerage_value: updatedSettings.brokerageValue,
            stt_rate: updatedSettings.sttRate,
            transaction_charge_rate: updatedSettings.transactionChargeRate,
            sebi_charge_rate: updatedSettings.sebiChargeRate,
            stamp_duty_rate: updatedSettings.stampDutyRate,
            gst_rate: updatedSettings.gstRate,
            dp_charges: updatedSettings.dpCharges,
            auto_calculate_charges: updatedSettings.autoCalculateCharges,
            bonds_enabled: updatedSettings.bondsEnabled,
            forex_enabled: updatedSettings.forexEnabled,
            default_stock_account_id: updatedSettings.defaultStockAccountId,
            default_mf_account_id: updatedSettings.defaultMfAccountId,
            default_salary_account_id: updatedSettings.defaultSalaryAccountId,
            stocks_visible: updatedSettings.stocksVisible,
            mutual_funds_visible: updatedSettings.mutualFundsVisible,
            fno_visible: updatedSettings.fnoVisible,
            ledger_visible: updatedSettings.ledgerVisible,
            income_visible: updatedSettings.incomeVisible,
            expenses_visible: updatedSettings.expensesVisible,
            goals_visible: updatedSettings.goalsVisible,
            family_visible: updatedSettings.familyVisible,
          })
          .eq('user_id', user.id);

        if (error) logError('Error updating settings:', error);
      }
    },
    [settings, user]
  );

  // --- STOCKS ---

  const addStock = useCallback(
    async (stock: Omit<Stock, 'id'>) => {
      const { data, error } = await (supabase as ExtendedSupabaseClient)
        .from('stocks')
        .insert({
          user_id: user?.id,
          symbol: stock.symbol,
          company_name: stock.companyName,
          quantity: stock.quantity,
          avg_price: stock.avgPrice,
          current_price: stock.currentPrice,
          previous_price: stock.previousPrice || stock.currentPrice,
          exchange: stock.exchange,
          sector: stock.sector,
          investment_amount: stock.investmentAmount,
          current_value: stock.currentValue,
          pnl: stock.pnl,
          pnl_percentage: stock.pnlPercentage,
        })
        .select()
        .single();

      if (error) {
        logError('Error adding stock:', error);
        throw error;
      }

      const newStock = dbStockToStock(data);
      setStocks((prev) => [...prev, newStock]);
      return newStock;
    },
    [user]
  );

  const updateStock = useCallback(async (id: number, stock: Partial<Stock>) => {
    const { error } = await (supabase as ExtendedSupabaseClient)
      .from('stocks')
      .update({
        symbol: stock.symbol,
        company_name: stock.companyName,
        quantity: stock.quantity,
        avg_price: stock.avgPrice,
        current_price: stock.currentPrice,
        previous_price: stock.previousPrice,
        exchange: stock.exchange,
        sector: stock.sector,
        investment_amount: stock.investmentAmount,
        current_value: stock.currentValue,
        pnl: stock.pnl,
        pnl_percentage: stock.pnlPercentage,
      })
      .eq('id', id);

    if (error) {
      logError('Error updating stock:', error);
      throw error;
    }

    setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, ...stock } : s)));
  }, []);

  const deleteStock = useMemo(() => deleteFromTable('stocks', 'stock', setStocks), []);

  const addStockTransaction = useCallback(
    async (tx: Omit<StockTransaction, 'id'>) => {
      const { data, error } = await (supabase as ExtendedSupabaseClient)
        .from('stock_transactions')
        .insert({
          ...(user?.id ? { user_id: user.id } : {}),
          stock_id: tx.stockId,
          transaction_type: tx.transactionType,
          quantity: tx.quantity,
          price: tx.price,
          total_amount: tx.totalAmount,
          brokerage: tx.brokerage,
          taxes: tx.taxes,
          transaction_date: tx.transactionDate,
          notes: tx.notes,
          account_id: tx.accountId,
        })
        .select()
        .single();

      if (error) {
        logError('Error adding stock transaction:', error);
        throw error;
      }

      setStockTransactions((prev) => [dbStockTransactionToStockTransaction(data), ...prev]);
      // DB trigger creates ledger entry + updates account balance + updates stock holdings
      refreshAccounts();
      refreshTransactions();
      refreshPortfolio();
    },
    [user, refreshAccounts, refreshTransactions, refreshPortfolio]
  );

  const deleteStockTransaction = useMemo(
    () => deleteFromTable('stock_transactions', 'stock transaction', setStockTransactions),
    []
  );

  // --- MUTUAL FUNDS ---

  const addMutualFund = useCallback(
    async (mf: Omit<MutualFund, 'id'>) => {
      const { data, error } = await (supabase as ExtendedSupabaseClient)
        .from('mutual_funds')
        .insert({
          user_id: user?.id,
          name: mf.schemeName,
          scheme_code: mf.schemeCode,
          category: mf.category,
          units: mf.units,
          avg_nav: mf.avgNav,
          current_nav: mf.currentNav,
          previous_nav: mf.previousNav || mf.currentNav,
          investment_amount: mf.investmentAmount,
          current_value: mf.currentValue,
          pnl: mf.pnl,
          pnl_percentage: mf.pnlPercentage,
          isin: mf.isin,
          folio_number: mf.folioNumber,
        })
        .select()
        .single();

      if (error) {
        logError('Error adding mutual fund:', error);
        throw error;
      }

      const newMf = dbMutualFundToMutualFund(data);
      setMutualFunds((prev) => [...prev, newMf]);
      return newMf;
    },
    [user]
  );

  const updateMutualFund = useCallback(async (id: number, mf: Partial<MutualFund>) => {
    const { error } = await (supabase as ExtendedSupabaseClient)
      .from('mutual_funds')
      .update({
        name: mf.schemeName,
        scheme_code: mf.schemeCode,
        category: mf.category,
        units: mf.units,
        avg_nav: mf.avgNav,
        current_nav: mf.currentNav,
        previous_nav: mf.previousNav,
        investment_amount: mf.investmentAmount,
        current_value: mf.currentValue,
        pnl: mf.pnl,
        pnl_percentage: mf.pnlPercentage,
        isin: mf.isin,
        folio_number: mf.folioNumber,
      })
      .eq('id', id);

    if (error) {
      logError('Error updating mutual fund:', error);
      throw error;
    }

    setMutualFunds((prev) => prev.map((m) => (m.id === id ? { ...m, ...mf } : m)));
  }, []);

  const deleteMutualFund = useMemo(
    () => deleteFromTable('mutual_funds', 'mutual fund', setMutualFunds),
    []
  );

  const addMutualFundTransaction = useCallback(
    async (tx: Omit<MutualFundTransaction, 'id'>) => {
      const { data, error } = await (supabase as ExtendedSupabaseClient)
        .from('mutual_fund_transactions')
        .insert({
          ...(user?.id ? { user_id: user.id } : {}),
          mutual_fund_id: tx.mutualFundId,
          transaction_type: tx.transactionType,
          units: tx.units,
          nav: tx.nav,
          total_amount: tx.totalAmount,
          transaction_date: tx.transactionDate,
          account_id: tx.accountId,
          notes: tx.notes,
        })
        .select()
        .single();

      if (error) {
        logError('Error adding mutual fund transaction:', error);
        throw error;
      }

      setMutualFundTransactions((prev) => [
        dbMutualFundTransactionToMutualFundTransaction(data),
        ...prev,
      ]);
      // DB trigger creates ledger entry + updates account balance + updates mf holdings
      refreshAccounts();
      refreshTransactions();
      refreshPortfolio();
    },
    [user, refreshAccounts, refreshTransactions, refreshPortfolio]
  );

  const deleteMutualFundTransaction = useMemo(
    () =>
      deleteFromTable(
        'mutual_fund_transactions',
        'mutual fund transaction',
        setMutualFundTransactions
      ),
    []
  );

  // --- F&O ---

  const addFnoTrade = useCallback(
    async (trade: Omit<FnoTrade, 'id'>) => {
      const { data, error } = await (supabase as ExtendedSupabaseClient)
        .from('fno_trades')
        .insert({
          ...(user?.id ? { user_id: user.id } : {}),
          instrument: trade.instrument,
          trade_type: trade.tradeType,
          product: trade.product,
          quantity: trade.quantity,
          avg_price: trade.avgPrice,
          exit_price: trade.exitPrice,
          entry_date: trade.entryDate,
          exit_date: trade.exitDate,
          status: trade.status,
          pnl: trade.pnl,
          notes: trade.notes,
          account_id: trade.accountId,
        })
        .select()
        .single();

      if (error) {
        logError('Error adding fno trade:', error);
        throw error;
      }

      setFnoTrades((prev) => [dbFnoTradeToFnoTrade(data), ...prev]);
      // DB trigger creates ledger entry + updates account balance
      refreshAccounts();
      refreshTransactions();
      refreshPortfolio();
    },
    [user, refreshAccounts, refreshTransactions, refreshPortfolio]
  );

  const updateFnoTrade = useCallback(
    async (id: number, trade: Partial<FnoTrade>) => {
      const { error } = await (supabase as ExtendedSupabaseClient)
        .from('fno_trades')
        .update({
          instrument: trade.instrument,
          trade_type: trade.tradeType,
          product: trade.product,
          quantity: trade.quantity,
          avg_price: trade.avgPrice,
          exit_price: trade.exitPrice,
          entry_date: trade.entryDate,
          exit_date: trade.exitDate,
          status: trade.status,
          pnl: trade.pnl,
          notes: trade.notes,
          account_id: trade.accountId,
        })
        .eq('id', id);

      if (error) {
        logError('Error updating fno trade:', error);
        throw error;
      }

      setFnoTrades((prev) => prev.map((t) => (t.id === id ? { ...t, ...trade } : t)));
      // DB trigger fires on OPEN→CLOSED status change: creates ledger entry + updates balance
      if (trade.status === 'CLOSED') {
        refreshAccounts();
        refreshTransactions();
        refreshPortfolio();
      }
    },
    [refreshAccounts, refreshTransactions, refreshPortfolio]
  );

  const deleteFnoTrade = useMemo(
    () => deleteFromTable('fno_trades', 'fno trade', setFnoTrades),
    []
  );

  // --- BONDS ---

  const addBond = useCallback(
    async (bond: Omit<Bond, 'id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as ExtendedSupabaseClient)
        .from('bonds')
        .insert({
          user_id: user.id,
          name: bond.name,
          isin: bond.isin,
          company_name: bond.companyName,
          face_value: bond.faceValue,
          coupon_rate: bond.couponRate,
          maturity_date: bond.maturityDate,
          quantity: bond.quantity,
          avg_price: bond.avgPrice,
          current_price: bond.currentPrice,
          investment_amount: bond.investmentAmount,
          current_value: bond.currentValue,
          pnl: bond.pnl,
          pnl_percentage: bond.pnlPercentage,
          interest_frequency: bond.interestFrequency,
          status: bond.status,
        })
        .select()
        .single();

      if (error) {
        logError('Error adding bond:', error);
        throw error;
      }

      setBonds((prev) => [...prev, dbBondToBond(data)]);
    },
    [user]
  );

  const updateBond = useCallback(async (id: number, bond: Partial<Bond>) => {
    const { error } = await (supabase as ExtendedSupabaseClient)
      .from('bonds')
      .update({
        name: bond.name,
        isin: bond.isin,
        company_name: bond.companyName,
        face_value: bond.faceValue,
        coupon_rate: bond.couponRate,
        maturity_date: bond.maturityDate,
        quantity: bond.quantity,
        avg_price: bond.avgPrice,
        current_price: bond.currentPrice,
        investment_amount: bond.investmentAmount,
        current_value: bond.currentValue,
        pnl: bond.pnl,
        pnl_percentage: bond.pnlPercentage,
        interest_frequency: bond.interestFrequency,
        status: bond.status,
      })
      .eq('id', id);

    if (error) {
      logError('Error updating bond:', error);
      throw error;
    }

    setBonds((prev) => prev.map((b) => (b.id === id ? { ...b, ...bond } : b)));
  }, []);

  const deleteBond = useMemo(() => deleteFromTable('bonds', 'bond', setBonds), []);

  const addBondTransaction = useCallback(
    async (tx: Omit<BondTransaction, 'id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as ExtendedSupabaseClient)
        .from('bond_transactions')
        .insert({
          user_id: user.id,
          bond_id: tx.bondId,
          transaction_type: tx.transactionType,
          quantity: tx.quantity,
          price: tx.price,
          total_amount: tx.totalAmount,
          transaction_date: tx.transactionDate,
          account_id: tx.accountId,
          notes: tx.notes,
        })
        .select()
        .single();

      if (error) {
        logError('Error adding bond transaction:', error);
        throw error;
      }

      setBondTransactions((prev) => [dbBondTransactionToBondTransaction(data), ...prev]);
      // Refresh accounts for balance sync (bond transactions may have account_id)
      refreshAccounts();
      refreshTransactions();
      refreshPortfolio();
    },
    [user, refreshAccounts, refreshTransactions, refreshPortfolio]
  );

  const deleteBondTransaction = useMemo(
    () => deleteFromTable('bond_transactions', 'bond transaction', setBondTransactions),
    []
  );

  // --- GOALS ---

  const addGoal = useCallback(
    async (goal: Omit<Goal, 'id'>) => {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user?.id,
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          deadline: goal.deadline,
          category: goal.category,
          description: goal.description,
        })
        .select()
        .single();

      if (error) {
        logError('Error adding goal:', error);
        throw error;
      }

      setGoals((prev) => [...prev, dbGoalToGoal(data)]);
    },
    [user]
  );

  const updateGoal = useCallback(async (id: number, goal: Partial<Goal>) => {
    const { error } = await supabase
      .from('goals')
      .update({
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        deadline: goal.deadline,
        category: goal.category,
        description: goal.description,
      })
      .eq('id', id);

    if (error) {
      logError('Error updating goal:', error);
      throw error;
    }

    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...goal } : g)));
  }, []);

  const deleteGoal = useMemo(() => deleteFromTable('goals', 'goal', setGoals), []);

  // --- FAMILY TRANSFERS ---

  const addFamilyTransfer = useCallback(
    async (transfer: Omit<FamilyTransfer, 'id'>) => {
      const { data, error } = await supabase
        .from('family_transfers')
        .insert({
          user_id: user?.id,
          date: transfer.date,
          recipient: transfer.recipient,
          relationship: transfer.relationship,
          amount: transfer.amount,
          purpose: transfer.purpose || '',
          notes: transfer.notes,
          account_id: transfer.accountId,
        })
        .select()
        .single();

      if (error) {
        logError('Error adding family transfer:', error);
        throw error;
      }

      setFamilyTransfers((prev) => [...prev, dbFamilyTransferToFamilyTransfer(data)]);
      refreshAccounts();
    },
    [user, refreshAccounts]
  );

  const updateFamilyTransfer = useCallback(
    async (id: number, transfer: Partial<FamilyTransfer>) => {
      const { error } = await supabase
        .from('family_transfers')
        .update({
          date: transfer.date,
          recipient: transfer.recipient,
          relationship: transfer.relationship,
          amount: transfer.amount,
          purpose: transfer.purpose,
          notes: transfer.notes,
          account_id: transfer.accountId,
        })
        .eq('id', id);

      if (error) {
        logError('Error updating family transfer:', error);
        throw error;
      }

      setFamilyTransfers((prev) => prev.map((t) => (t.id === id ? { ...t, ...transfer } : t)));
      refreshAccounts();
    },
    [refreshAccounts]
  );

  const deleteFamilyTransfer = useCallback(
    async (id: number) => {
      const { error } = await supabase.from('family_transfers').delete().eq('id', id);

      if (error) {
        logError('Error deleting family transfer:', error);
        throw error;
      }

      setFamilyTransfers((prev) => prev.filter((t) => t.id !== id));
      refreshAccounts();
    },
    [refreshAccounts]
  );

  // --- FOREX ---

  const addForexTransaction = useCallback(
    async (tx: Omit<ForexTransaction, 'id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as ExtendedSupabaseClient)
        .from('forex_transactions')
        .insert({
          user_id: user.id,
          transaction_type: tx.transactionType,
          amount: tx.amount,
          date: tx.date,
          notes: tx.notes,
          account_id: tx.accountId,
        })
        .select()
        .single();

      if (error) {
        logError('Error adding forex transaction:', error);
        throw error;
      }

      setForexTransactions((prev) => [...prev, dbForexTransactionToForexTransaction(data)]);
    },
    [user]
  );

  const updateForexTransaction = useCallback(async (id: number, tx: Partial<ForexTransaction>) => {
    const { error } = await (supabase as ExtendedSupabaseClient)
      .from('forex_transactions')
      .update({
        transaction_type: tx.transactionType,
        amount: tx.amount,
        date: tx.date,
        notes: tx.notes,
        account_id: tx.accountId,
      })
      .eq('id', id);

    if (error) {
      logError('Error updating forex transaction:', error);
      throw error;
    }

    setForexTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...tx } : t)));
  }, []);

  const deleteForexTransaction = useMemo(
    () => deleteFromTable('forex_transactions', 'forex transaction', setForexTransactions),
    []
  );

  // --- LIVE PRICE REFRESH ---

  const refreshLivePrices = useCallback(
    async (silent: boolean = false) => {
      if (!silent) setLoading(true);

      // 1. Stocks
      try {
        const stockSymbols = [...new Set(stocks.map((s) => s.symbol))].filter(Boolean);
        if (stockSymbols.length > 0) {
          if (!silent) console.log(`Fetching updates for ${stockSymbols.length} stocks...`);
          const res = await fetch(
            `/api/stocks/batch?symbols=${stockSymbols.join(',')}&t=${Date.now()}`
          );
          const updates = await res.json();
          if (updates && typeof updates === 'object' && !updates.error) {
            let updatedCount = 0;

            setStocks((prev) =>
              prev.map((stock) => {
                const cleanSymbol = stock.symbol.trim().toUpperCase();
                // Try exact match, then base match (without suffix)
                const update = updates[cleanSymbol] || updates[cleanSymbol.split('.')[0]];

                if (!update) {
                  return stock;
                }

                updatedCount++;
                const currentPrice = update.currentPrice;
                const apiPreviousClose = update.previousClose;

                // If API returns previousClose == currentPrice, it's often a placeholder.
                // In that case, we keep our existing previousPrice if available.
                const previousPrice =
                  apiPreviousClose > 0 && Math.abs(apiPreviousClose - currentPrice) > 0.01
                    ? apiPreviousClose
                    : stock.previousPrice || currentPrice;

                const currentValue = stock.quantity * currentPrice;
                const pnl = currentValue - stock.investmentAmount;
                const pnlPercentage =
                  stock.investmentAmount > 0 ? (pnl / stock.investmentAmount) * 100 : 0;

                if (currentPrice > 0) {
                  (supabase as ExtendedSupabaseClient)
                    .from('stocks')
                    .update({
                      current_price: currentPrice,
                      previous_price: previousPrice,
                      current_value: currentValue,
                      pnl,
                      pnl_percentage: pnlPercentage,
                    })
                    .eq('id', stock.id)
                    .then(({ error }: { error: Error | null }) => {
                      if (error) logError(`Failed to persist stock ${stock.symbol}`, error);
                    });
                }

                return {
                  ...stock,
                  currentPrice: currentPrice > 0 ? currentPrice : stock.currentPrice,
                  previousPrice,
                  currentValue,
                  pnl,
                  pnlPercentage,
                };
              })
            );
            if (!silent) console.log(`✓ Updated ${updatedCount} stocks.`);
            if (updatedCount === 0 && !silent)
              console.warn('No stock prices updated. Check symbols.');
          }
        }
      } catch (err) {
        logError('Failed to refresh stock prices:', err);
      }

      // 2. Mutual Funds
      try {
        const mfCodes = [...new Set(mutualFunds.map((m) => m.schemeCode))].filter(Boolean);
        if (mfCodes.length > 0) {
          if (!silent) console.log(`Fetching NAVs for ${mfCodes.length} mutual funds...`);
          const res = await fetch(`/api/mf/batch?codes=${mfCodes.join(',')}&t=${Date.now()}`);
          const updates = await res.json();
          if (updates && typeof updates === 'object' && !updates.error) {
            let updatedCount = 0;

            setMutualFunds((prev) =>
              prev.map((mf) => {
                const update = updates[mf.schemeCode];
                if (!update) {
                  return mf;
                }

                updatedCount++;
                const currentNav = update.currentNav;
                const previousNav = update.previousNav || mf.previousNav || currentNav;
                const currentValue = mf.units * currentNav;
                const pnl = currentValue - mf.investmentAmount;
                const pnlPercentage =
                  mf.investmentAmount > 0 ? (pnl / mf.investmentAmount) * 100 : 0;

                if (currentNav > 0) {
                  (supabase as ExtendedSupabaseClient)
                    .from('mutual_funds')
                    .update({
                      current_nav: currentNav,
                      previous_nav: previousNav,
                      current_value: currentValue,
                      pnl,
                      pnl_percentage: pnlPercentage,
                    })
                    .eq('id', mf.id)
                    .then(({ error }: { error: Error | null }) => {
                      if (error) logError(`Failed to persist MF ${mf.schemeName}`, error);
                    });
                }

                return {
                  ...mf,
                  currentNav,
                  previousNav,
                  currentValue,
                  pnl,
                  pnlPercentage,
                };
              })
            );
            if (!silent) console.log(`✓ Updated ${updatedCount} mutual funds.`);
          }
        }
      } catch (err) {
        logError('Failed to refresh MF NAVs:', err);
      }

      // 3. Bonds
      try {
        const bondIsins = [...new Set(bonds.map((b) => b.isin))].filter(
          (isin): isin is string => !!isin
        );
        if (bondIsins.length > 0) {
          const res = await fetch(`/api/bonds/batch?isins=${bondIsins.join(',')}&t=${Date.now()}`);
          const updates = await res.json();
          if (updates && typeof updates === 'object' && !updates.error) {
            setBonds((prev) =>
              prev.map((bond) => {
                if (!bond.isin) return bond;
                const update = updates[bond.isin];
                if (!update) return bond;
                const currentPrice = bond.faceValue * update.currentPriceMultiplier;
                const currentValue = bond.quantity * currentPrice;
                const pnl = currentValue - bond.investmentAmount;
                const pnlPercentage = (pnl / bond.investmentAmount) * 100;

                (supabase as ExtendedSupabaseClient)
                  .from('bonds')
                  .update({
                    current_price: currentPrice,
                    current_value: currentValue,
                    pnl,
                    pnl_percentage: pnlPercentage,
                  })
                  .eq('id', bond.id)
                  .then(({ error: dbError }: { error: Error | null }) => {
                    if (dbError) logError('Failed to persist bond price', dbError);
                  });

                return { ...bond, currentPrice, currentValue, pnl, pnlPercentage };
              })
            );
          }
        }
      } catch (err) {
        logError('Failed to refresh bond prices:', err);
      }

      if (!silent) setLoading(false);
      logInfo('Live prices refresh completed');
    },
    [stocks, mutualFunds, bonds]
  );

  // --- REFRESH ---

  // Initial Load
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) {
        if (!authLoading) setLoading(false);
        return;
      }

      try {
        const [
          { data: accData },
          { data: txData },
          { data: settingsData },
          { data: stockData },
          { data: mfData },
          { data: bondData },
          { data: goalData },
          { data: familyData },
          { data: fnoData },
          { data: stockTxData },
          { data: mfTxData },
          { data: bondTxData },
          { data: forexTxData },
        ] = await Promise.all([
          supabase.from('accounts').select('*').order('name'),
          supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100),
          (supabase as ExtendedSupabaseClient)
            .from('app_settings')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase.from('stocks').select('*'),
          supabase.from('mutual_funds').select('*'),
          (supabase as ExtendedSupabaseClient).from('bonds').select('*'),
          supabase.from('goals').select('*'),
          supabase.from('family_transfers').select('*'),
          (supabase as ExtendedSupabaseClient).from('fno_trades').select('*'),
          (supabase as ExtendedSupabaseClient)
            .from('stock_transactions')
            .select('*')
            .order('transaction_date', { ascending: false }),
          (supabase as ExtendedSupabaseClient)
            .from('mutual_fund_transactions')
            .select('*')
            .order('transaction_date', { ascending: false }),
          (supabase as ExtendedSupabaseClient)
            .from('bond_transactions')
            .select('*')
            .order('transaction_date', { ascending: false }),
          (supabase as ExtendedSupabaseClient)
            .from('forex_transactions')
            .select('*')
            .order('date', { ascending: false }),
        ]);

        if (accData) setAccounts(accData.map(dbAccountToAccount));
        if (txData) setTransactions(txData.map(dbTransactionToTransaction));
        if (settingsData) setSettings(dbSettingsToSettings(settingsData as AppSettingsRow));
        if (stockData) setStocks(stockData.map(dbStockToStock));
        if (mfData) setMutualFunds(mfData.map(dbMutualFundToMutualFund));
        if (bondData) setBonds(bondData.map(dbBondToBond));
        if (goalData) setGoals(goalData.map(dbGoalToGoal));
        if (familyData) setFamilyTransfers(familyData.map(dbFamilyTransferToFamilyTransfer));
        if (fnoData) setFnoTrades(fnoData.map(dbFnoTradeToFnoTrade));
        if (stockTxData)
          setStockTransactions(stockTxData.map(dbStockTransactionToStockTransaction));
        if (mfTxData)
          setMutualFundTransactions(mfTxData.map(dbMutualFundTransactionToMutualFundTransaction));
        if (bondTxData) setBondTransactions(bondTxData.map(dbBondTransactionToBondTransaction));
        if (forexTxData)
          setForexTransactions(forexTxData.map(dbForexTransactionToForexTransaction));

        setLoading(false);
      } catch (err) {
        logError('Failed to load initial data:', err);
        setError('Failed to load financial data');
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user, authLoading]);

  const value = useMemo(
    () => ({
      accounts,
      addAccount,
      updateAccount,
      deleteAccount,
      addFunds,
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      goals,
      addGoal,
      updateGoal,
      deleteGoal,
      stocks,
      addStock,
      updateStock,
      deleteStock,
      stockTransactions,
      addStockTransaction,
      deleteStockTransaction,
      watchlist,
      mutualFunds,
      addMutualFund,
      updateMutualFund,
      deleteMutualFund,
      mutualFundTransactions,
      addMutualFundTransaction,
      deleteMutualFundTransaction,
      bonds,
      addBond,
      updateBond,
      deleteBond,
      bondTransactions,
      addBondTransaction,
      deleteBondTransaction,
      fnoTrades,
      addFnoTrade,
      updateFnoTrade,
      deleteFnoTrade,
      forexTransactions,
      addForexTransaction,
      updateForexTransaction,
      deleteForexTransaction,
      familyTransfers,
      addFamilyTransfer,
      updateFamilyTransfer,
      deleteFamilyTransfer,
      settings,
      updateSettings,
      loading,
      error,
      refreshPortfolio,
      isTransactionModalOpen,
      setIsTransactionModalOpen,
      refreshLivePrices,
    }),
    [
      accounts,
      addAccount,
      updateAccount,
      deleteAccount,
      addFunds,
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      goals,
      addGoal,
      updateGoal,
      deleteGoal,
      stocks,
      addStock,
      updateStock,
      deleteStock,
      stockTransactions,
      addStockTransaction,
      deleteStockTransaction,
      watchlist,
      mutualFunds,
      addMutualFund,
      updateMutualFund,
      deleteMutualFund,
      mutualFundTransactions,
      addMutualFundTransaction,
      deleteMutualFundTransaction,
      bonds,
      addBond,
      updateBond,
      deleteBond,
      bondTransactions,
      addBondTransaction,
      deleteBondTransaction,
      fnoTrades,
      addFnoTrade,
      updateFnoTrade,
      deleteFnoTrade,
      forexTransactions,
      addForexTransaction,
      updateForexTransaction,
      deleteForexTransaction,
      familyTransfers,
      addFamilyTransfer,
      updateFamilyTransfer,
      deleteFamilyTransfer,
      settings,
      updateSettings,
      loading,
      error,
      refreshPortfolio,
      isTransactionModalOpen,
      setIsTransactionModalOpen,
      refreshLivePrices,
    ]
  );

  // Automatic Live Price Refresh (every 1 minute)
  const dataLoaded = !loading;
  useEffect(() => {
    if (
      dataLoaded &&
      (stocks.length > 0 || mutualFunds.length > 0 || (settings.bondsEnabled && bonds.length > 0))
    ) {
      const timeout = setTimeout(() => {
        refreshLivePrices(true);
      }, 1000);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded, stocks.length, mutualFunds.length]);

  // Periodic refresh - silent background update (every 1 minute)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user && !loading) refreshLivePrices(true);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [user, loading, refreshLivePrices]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
