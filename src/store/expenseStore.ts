import {create} from 'zustand';
import {
  Transaction,
  Category,
  Currency,
  TransactionType,
  PaymentMethod,
  NetWorthTargetType,
  ImpactOperation,
} from '../types';
import {
  getTransactions,
  getTransactionById,
  insertTransaction,
  updateTransaction as updateTxnDb,
  deleteTransaction as deleteTxnDb,
  getMonthlyTotals,
  getCategories,
  seedDefaultCategories,
  getSpendingByCategory,
  getMonthlySpendingTrend,
  insertAsset,
  insertLiability,
  saveTransactionImpact,
  getTransactionImpact,
  deleteTransactionImpact,
  applyTargetImpact,
  reverseTargetImpact,
} from '../db';

interface TransactionImpactInput {
  targetType: NetWorthTargetType;
  targetId?: string;
  operation: ImpactOperation;
  createNew?: {
    name: string;
    type: string;
    note?: string;
  };
}

interface ExpenseState {
  transactions: Transaction[];
  categories: Category[];
  monthlyExpense: number;
  monthlyIncome: number;
  isLoading: boolean;
  spendingByCategory: {categoryName: string; categoryColor: string; categoryIcon: string; total: number}[];
  monthlyTrend: {month: string; total: number}[];

  // Actions
  initialize: () => Promise<void>;
  loadTransactions: (options?: {
    type?: TransactionType;
    fromDate?: string;
    toDate?: string;
    limit?: number;
  }) => Promise<void>;
  addTransaction: (txn: {
    amount: number;
    currency: Currency;
    type: TransactionType;
    categoryId: string;
    paymentMethod: PaymentMethod;
    note: string;
    date: string;
    impact?: TransactionImpactInput;
  }) => Promise<void>;
  editTransaction: (id: string, txn: Partial<Transaction>, impact?: TransactionImpactInput) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  loadMonthlyStats: () => Promise<void>;
  loadSpendingAnalytics: () => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  transactions: [],
  categories: [],
  monthlyExpense: 0,
  monthlyIncome: 0,
  isLoading: false,
  spendingByCategory: [],
  monthlyTrend: [],

  initialize: async () => {
    set({isLoading: true});
    try {
      await seedDefaultCategories();
      const categories = await getCategories();
      set({categories, isLoading: false});
    } catch (error) {
      console.error('Failed to initialize expense store:', error);
      set({isLoading: false});
    }
  },

  loadTransactions: async (options) => {
    set({isLoading: true});
    try {
      const transactions = await getTransactions(options);
      set({transactions, isLoading: false});
    } catch (error) {
      console.error('Failed to load transactions:', error);
      set({isLoading: false});
    }
  },

  addTransaction: async (txn) => {
    const {impact, ...transactionPayload} = txn;
    const transactionId = await insertTransaction(transactionPayload);

    if (impact) {
      let targetId = impact.targetId;

      if (!targetId && impact.createNew) {
        if (impact.targetType === 'asset') {
          targetId = await insertAsset({
            name: impact.createNew.name,
            type: impact.createNew.type as any,
            currentValue: 0,
            currency: txn.currency,
            note: impact.createNew.note || '',
          });
        } else {
          targetId = await insertLiability({
            name: impact.createNew.name,
            type: impact.createNew.type as any,
            outstandingAmount: 0,
            currency: txn.currency,
            interestRate: 0,
            emiAmount: 0,
            note: impact.createNew.note || '',
          });
        }
      }

      if (targetId) {
        await applyTargetImpact(impact.targetType, targetId, impact.operation, txn.amount);
        await saveTransactionImpact({
          transactionId,
          targetType: impact.targetType,
          targetId,
          operation: impact.operation,
        });
      }
    }

    // Reload current transactions and monthly stats
    await get().loadTransactions({limit: 50});
    await get().loadMonthlyStats();
  },

  editTransaction: async (id, txn, impact) => {
    const oldTransaction = await getTransactionById(id);
    const oldImpact = await getTransactionImpact(id);

    if (oldTransaction && oldImpact) {
      await reverseTargetImpact(oldImpact, oldTransaction.amount);
    }

    await updateTxnDb(id, txn);

    const updatedTransaction = await getTransactionById(id);
    if (updatedTransaction) {
      if (impact) {
        let targetId = impact.targetId;

        if (!targetId && impact.createNew) {
          if (impact.targetType === 'asset') {
            targetId = await insertAsset({
              name: impact.createNew.name,
              type: impact.createNew.type as any,
              currentValue: 0,
              currency: updatedTransaction.currency,
              note: impact.createNew.note || '',
            });
          } else {
            targetId = await insertLiability({
              name: impact.createNew.name,
              type: impact.createNew.type as any,
              outstandingAmount: 0,
              currency: updatedTransaction.currency,
              interestRate: 0,
              emiAmount: 0,
              note: impact.createNew.note || '',
            });
          }
        }

        if (targetId) {
          await applyTargetImpact(impact.targetType, targetId, impact.operation, updatedTransaction.amount);
          await saveTransactionImpact({
            transactionId: id,
            targetType: impact.targetType,
            targetId,
            operation: impact.operation,
          });
        }
      } else if (oldImpact) {
        await applyTargetImpact(oldImpact.targetType, oldImpact.targetId, oldImpact.operation, updatedTransaction.amount);
        await saveTransactionImpact({
          transactionId: id,
          targetType: oldImpact.targetType,
          targetId: oldImpact.targetId,
          operation: oldImpact.operation,
        });
      }
    }

    await get().loadTransactions({limit: 50});
    await get().loadMonthlyStats();
  },

  removeTransaction: async (id) => {
    const transaction = await getTransactionById(id);
    const impact = await getTransactionImpact(id);

    if (transaction && impact) {
      await reverseTargetImpact(impact, transaction.amount);
      await deleteTransactionImpact(id);
    }

    await deleteTxnDb(id);
    await get().loadTransactions({limit: 50});
    await get().loadMonthlyStats();
  },

  loadMonthlyStats: async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const [expense, income] = await Promise.all([
      getMonthlyTotals('expense', year, month),
      getMonthlyTotals('income', year, month),
    ]);

    set({monthlyExpense: expense, monthlyIncome: income});
  },

  loadSpendingAnalytics: async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate =
      month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const [byCategory, trend] = await Promise.all([
      getSpendingByCategory(startDate, endDate),
      getMonthlySpendingTrend(6),
    ]);

    set({spendingByCategory: byCategory, monthlyTrend: trend});
  },
}));
