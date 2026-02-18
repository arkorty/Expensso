import SQLite, {
  SQLiteDatabase,
  Transaction as SQLTransaction,
  ResultSet,
} from 'react-native-sqlite-storage';

// Enable promise-based API
SQLite.enablePromise(true);

const DATABASE_NAME = 'expensso.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAY_NAME = 'Expensso Database';
const DATABASE_SIZE = 200000;

let db: SQLiteDatabase | null = null;

// ─── Open / Get Database ─────────────────────────────────────────────

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabase({
    name: DATABASE_NAME,
    location: 'default',
  });

  await createTables(db);
  return db;
}

// ─── Schema Creation ─────────────────────────────────────────────────

async function createTables(database: SQLiteDatabase): Promise<void> {
  await database.transaction(async (tx: SQLTransaction) => {
    // Categories table
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT 'dots-horizontal',
        color TEXT NOT NULL DEFAULT '#95A5A6',
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Transactions table (the ledger)
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        category_id TEXT NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'UPI',
        note TEXT DEFAULT '',
        date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
    `);

    // Transaction impacts table (links transactions to net-worth entries)
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS transaction_impacts (
        transaction_id TEXT PRIMARY KEY,
        target_type TEXT NOT NULL CHECK(target_type IN ('asset', 'liability')),
        target_id TEXT NOT NULL,
        operation TEXT NOT NULL CHECK(operation IN ('add', 'subtract')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
      );
    `);

    // Assets table
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        current_value REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'INR',
        note TEXT DEFAULT '',
        last_updated TEXT NOT NULL DEFAULT (datetime('now')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Liabilities table
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS liabilities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        outstanding_amount REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'INR',
        interest_rate REAL NOT NULL DEFAULT 0,
        emi_amount REAL NOT NULL DEFAULT 0,
        note TEXT DEFAULT '',
        last_updated TEXT NOT NULL DEFAULT (datetime('now')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Net-worth snapshots for historical tracking
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS net_worth_snapshots (
        id TEXT PRIMARY KEY,
        total_assets REAL NOT NULL DEFAULT 0,
        total_liabilities REAL NOT NULL DEFAULT 0,
        net_worth REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'INR',
        snapshot_date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Indexes for performance
    tx.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    `);
    tx.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    `);
    tx.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    `);
    tx.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_transaction_impacts_target ON transaction_impacts(target_type, target_id);
    `);
    tx.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_snapshots_date ON net_worth_snapshots(snapshot_date);
    `);
  });
}

// ─── Generic Helpers ─────────────────────────────────────────────────

export async function executeSql(
  sql: string,
  params: any[] = [],
): Promise<ResultSet> {
  const database = await getDatabase();
  const [result] = await database.executeSql(sql, params);
  return result;
}

export function rowsToArray<T>(result: ResultSet): T[] {
  const rows: T[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    rows.push(result.rows.item(i) as T);
  }
  return rows;
}

// ─── Close Database ──────────────────────────────────────────────────

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}
