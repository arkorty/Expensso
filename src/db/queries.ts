import {executeSql, rowsToArray} from './database';
import {
  Category,
  Transaction,
  Asset,
  Liability,
  NetWorthSnapshot,
  TransactionImpact,
  NetWorthTargetType,
  ImpactOperation,
} from '../types';
import {generateId} from '../utils';
import {DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES} from '../constants';

// ═══════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════

export async function seedDefaultCategories(): Promise<void> {
  const result = await executeSql('SELECT COUNT(*) as count FROM categories');
  const count = result.rows.item(0).count;

  if (count > 0) {return;}

  const allCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];

  for (const cat of allCategories) {
    await executeSql(
      'INSERT INTO categories (id, name, icon, color, type, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      [generateId(), cat.name, cat.icon, cat.color, cat.type, cat.isDefault ? 1 : 0],
    );
  }
}

export async function getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
  let sql = 'SELECT id, name, icon, color, type, is_default as isDefault, created_at as createdAt FROM categories';
  const params: any[] = [];

  if (type) {
    sql += ' WHERE type = ?';
    params.push(type);
  }

  sql += ' ORDER BY is_default DESC, name ASC';
  const result = await executeSql(sql, params);
  return rowsToArray<Category>(result);
}

export async function insertCategory(cat: Omit<Category, 'id' | 'createdAt'>): Promise<string> {
  const id = generateId();
  await executeSql(
    'INSERT INTO categories (id, name, icon, color, type, is_default) VALUES (?, ?, ?, ?, ?, ?)',
    [id, cat.name, cat.icon, cat.color, cat.type, cat.isDefault ? 1 : 0],
  );
  return id;
}

// ═══════════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════

export async function getTransactions(options?: {
  type?: 'income' | 'expense';
  fromDate?: string;
  toDate?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}): Promise<Transaction[]> {
  let sql = `
    SELECT
      t.id, t.amount, t.currency, t.type, t.category_id as categoryId,
      t.payment_method as paymentMethod, t.note, t.date,
      t.created_at as createdAt, t.updated_at as updatedAt,
      c.name as categoryName, c.icon as categoryIcon, c.color as categoryColor
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (options?.type) {
    sql += ' AND t.type = ?';
    params.push(options.type);
  }
  if (options?.fromDate) {
    sql += ' AND t.date >= ?';
    params.push(options.fromDate);
  }
  if (options?.toDate) {
    sql += ' AND t.date <= ?';
    params.push(options.toDate);
  }
  if (options?.categoryId) {
    sql += ' AND t.category_id = ?';
    params.push(options.categoryId);
  }

  sql += ' ORDER BY t.date DESC, t.created_at DESC';

  if (options?.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
  }
  if (options?.offset) {
    sql += ' OFFSET ?';
    params.push(options.offset);
  }

  const result = await executeSql(sql, params);
  return rowsToArray<Transaction>(result);
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const result = await executeSql(
    `SELECT
      t.id, t.amount, t.currency, t.type, t.category_id as categoryId,
      t.payment_method as paymentMethod, t.note, t.date,
      t.created_at as createdAt, t.updated_at as updatedAt,
      c.name as categoryName, c.icon as categoryIcon, c.color as categoryColor
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?`,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows.item(0) as Transaction;
}

export async function insertTransaction(
  txn: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'categoryName' | 'categoryIcon' | 'categoryColor'>,
): Promise<string> {
  const id = generateId();
  await executeSql(
    `INSERT INTO transactions (id, amount, currency, type, category_id, payment_method, note, date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, txn.amount, txn.currency, txn.type, txn.categoryId, txn.paymentMethod, txn.note, txn.date],
  );
  return id;
}

export async function updateTransaction(
  id: string,
  txn: Partial<Omit<Transaction, 'id' | 'createdAt'>>,
): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  if (txn.amount !== undefined) { fields.push('amount = ?'); params.push(txn.amount); }
  if (txn.currency) { fields.push('currency = ?'); params.push(txn.currency); }
  if (txn.type) { fields.push('type = ?'); params.push(txn.type); }
  if (txn.categoryId) { fields.push('category_id = ?'); params.push(txn.categoryId); }
  if (txn.paymentMethod) { fields.push('payment_method = ?'); params.push(txn.paymentMethod); }
  if (txn.note !== undefined) { fields.push('note = ?'); params.push(txn.note); }
  if (txn.date) { fields.push('date = ?'); params.push(txn.date); }

  fields.push("updated_at = datetime('now')");
  params.push(id);

  await executeSql(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`, params);
}

export async function deleteTransaction(id: string): Promise<void> {
  await executeSql('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function saveTransactionImpact(input: TransactionImpact): Promise<void> {
  await executeSql(
    `INSERT OR REPLACE INTO transaction_impacts (transaction_id, target_type, target_id, operation)
     VALUES (?, ?, ?, ?)`,
    [input.transactionId, input.targetType, input.targetId, input.operation],
  );
}

export async function getTransactionImpact(transactionId: string): Promise<TransactionImpact | null> {
  const result = await executeSql(
    `SELECT transaction_id as transactionId, target_type as targetType, target_id as targetId, operation
     FROM transaction_impacts
     WHERE transaction_id = ?`,
    [transactionId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows.item(0) as TransactionImpact;
}

export async function deleteTransactionImpact(transactionId: string): Promise<void> {
  await executeSql('DELETE FROM transaction_impacts WHERE transaction_id = ?', [transactionId]);
}

export async function applyTargetImpact(
  targetType: NetWorthTargetType,
  targetId: string,
  operation: ImpactOperation,
  amount: number,
): Promise<void> {
  if (amount <= 0) {
    return;
  }

  if (targetType === 'asset') {
    if (operation === 'add') {
      await executeSql(
        `UPDATE assets
         SET current_value = current_value + ?,
             last_updated = datetime('now')
         WHERE id = ?`,
        [amount, targetId],
      );
      return;
    }

    await executeSql(
      `UPDATE assets
       SET current_value = MAX(current_value - ?, 0),
           last_updated = datetime('now')
       WHERE id = ?`,
      [amount, targetId],
    );
    return;
  }

  if (operation === 'add') {
    await executeSql(
      `UPDATE liabilities
       SET outstanding_amount = outstanding_amount + ?,
           last_updated = datetime('now')
       WHERE id = ?`,
      [amount, targetId],
    );
    return;
  }

  await executeSql(
    `UPDATE liabilities
     SET outstanding_amount = MAX(outstanding_amount - ?, 0),
         last_updated = datetime('now')
     WHERE id = ?`,
    [amount, targetId],
  );
}

export async function reverseTargetImpact(impact: TransactionImpact, amount: number): Promise<void> {
  const reverseOperation: ImpactOperation = impact.operation === 'add' ? 'subtract' : 'add';
  await applyTargetImpact(impact.targetType, impact.targetId, reverseOperation, amount);
}

export async function getMonthlyTotals(
  type: 'income' | 'expense',
  year: number,
  month: number,
): Promise<number> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const result = await executeSql(
    'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = ? AND date >= ? AND date < ?',
    [type, startDate, endDate],
  );
  return result.rows.item(0).total;
}

export async function getSpendingByCategory(
  fromDate: string,
  toDate: string,
): Promise<{categoryName: string; categoryColor: string; categoryIcon: string; total: number}[]> {
  const result = await executeSql(
    `SELECT c.name as categoryName, c.color as categoryColor, c.icon as categoryIcon,
            SUM(t.amount) as total
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.type = 'expense' AND t.date >= ? AND t.date < ?
     GROUP BY t.category_id
     ORDER BY total DESC`,
    [fromDate, toDate],
  );
  return rowsToArray(result);
}

export async function getMonthlySpendingTrend(months: number = 6): Promise<{month: string; total: number}[]> {
  const result = await executeSql(
    `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total
     FROM transactions
     WHERE type = 'expense'
       AND date >= date('now', '-' || ? || ' months')
     GROUP BY strftime('%Y-%m', date)
     ORDER BY month ASC`,
    [months],
  );
  return rowsToArray(result);
}

// ═══════════════════════════════════════════════════════════════════════
// ASSETS
// ═══════════════════════════════════════════════════════════════════════

export async function getAssets(): Promise<Asset[]> {
  const result = await executeSql(
    `SELECT id, name, type, current_value as currentValue, currency,
            note, last_updated as lastUpdated, created_at as createdAt
     FROM assets
     ORDER BY current_value DESC`,
  );
  return rowsToArray<Asset>(result);
}

export async function insertAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'lastUpdated'>): Promise<string> {
  const id = generateId();
  await executeSql(
    'INSERT INTO assets (id, name, type, current_value, currency, note) VALUES (?, ?, ?, ?, ?, ?)',
    [id, asset.name, asset.type, asset.currentValue, asset.currency, asset.note],
  );
  return id;
}

export async function updateAsset(id: string, asset: Partial<Omit<Asset, 'id' | 'createdAt'>>): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  if (asset.name) { fields.push('name = ?'); params.push(asset.name); }
  if (asset.type) { fields.push('type = ?'); params.push(asset.type); }
  if (asset.currentValue !== undefined) { fields.push('current_value = ?'); params.push(asset.currentValue); }
  if (asset.currency) { fields.push('currency = ?'); params.push(asset.currency); }
  if (asset.note !== undefined) { fields.push('note = ?'); params.push(asset.note); }

  fields.push("last_updated = datetime('now')");
  params.push(id);

  await executeSql(`UPDATE assets SET ${fields.join(', ')} WHERE id = ?`, params);
}

export async function deleteAsset(id: string): Promise<void> {
  await executeSql('DELETE FROM assets WHERE id = ?', [id]);
}

export async function getTotalAssets(): Promise<number> {
  const result = await executeSql('SELECT COALESCE(SUM(current_value), 0) as total FROM assets');
  return result.rows.item(0).total;
}

// ═══════════════════════════════════════════════════════════════════════
// LIABILITIES
// ═══════════════════════════════════════════════════════════════════════

export async function getLiabilities(): Promise<Liability[]> {
  const result = await executeSql(
    `SELECT id, name, type, outstanding_amount as outstandingAmount, currency,
            interest_rate as interestRate, emi_amount as emiAmount,
            note, last_updated as lastUpdated, created_at as createdAt
     FROM liabilities
     ORDER BY outstanding_amount DESC`,
  );
  return rowsToArray<Liability>(result);
}

export async function insertLiability(
  liability: Omit<Liability, 'id' | 'createdAt' | 'lastUpdated'>,
): Promise<string> {
  const id = generateId();
  await executeSql(
    `INSERT INTO liabilities (id, name, type, outstanding_amount, currency, interest_rate, emi_amount, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, liability.name, liability.type, liability.outstandingAmount,
      liability.currency, liability.interestRate, liability.emiAmount, liability.note,
    ],
  );
  return id;
}

export async function updateLiability(
  id: string,
  liability: Partial<Omit<Liability, 'id' | 'createdAt'>>,
): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  if (liability.name) { fields.push('name = ?'); params.push(liability.name); }
  if (liability.type) { fields.push('type = ?'); params.push(liability.type); }
  if (liability.outstandingAmount !== undefined) { fields.push('outstanding_amount = ?'); params.push(liability.outstandingAmount); }
  if (liability.currency) { fields.push('currency = ?'); params.push(liability.currency); }
  if (liability.interestRate !== undefined) { fields.push('interest_rate = ?'); params.push(liability.interestRate); }
  if (liability.emiAmount !== undefined) { fields.push('emi_amount = ?'); params.push(liability.emiAmount); }
  if (liability.note !== undefined) { fields.push('note = ?'); params.push(liability.note); }

  fields.push("last_updated = datetime('now')");
  params.push(id);

  await executeSql(`UPDATE liabilities SET ${fields.join(', ')} WHERE id = ?`, params);
}

export async function deleteLiability(id: string): Promise<void> {
  await executeSql('DELETE FROM liabilities WHERE id = ?', [id]);
}

export async function getTotalLiabilities(): Promise<number> {
  const result = await executeSql('SELECT COALESCE(SUM(outstanding_amount), 0) as total FROM liabilities');
  return result.rows.item(0).total;
}

// ═══════════════════════════════════════════════════════════════════════
// NET WORTH SNAPSHOTS
// ═══════════════════════════════════════════════════════════════════════

export async function saveNetWorthSnapshot(
  totalAssets: number,
  totalLiabilities: number,
  currency: string,
): Promise<string> {
  const id = generateId();
  const netWorth = totalAssets - totalLiabilities;
  const today = new Date().toISOString().split('T')[0];

  // Upsert: delete any existing snapshot for today then insert
  await executeSql('DELETE FROM net_worth_snapshots WHERE snapshot_date = ?', [today]);
  await executeSql(
    `INSERT INTO net_worth_snapshots (id, total_assets, total_liabilities, net_worth, currency, snapshot_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, totalAssets, totalLiabilities, netWorth, currency, today],
  );
  return id;
}

export async function getNetWorthHistory(months: number = 12): Promise<NetWorthSnapshot[]> {
  const result = await executeSql(
    `SELECT id, total_assets as totalAssets, total_liabilities as totalLiabilities,
            net_worth as netWorth, currency, snapshot_date as snapshotDate,
            created_at as createdAt
     FROM net_worth_snapshots
     WHERE snapshot_date >= date('now', '-' || ? || ' months')
     ORDER BY snapshot_date ASC`,
    [months],
  );
  return rowsToArray<NetWorthSnapshot>(result);
}
