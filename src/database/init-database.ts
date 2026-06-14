import * as SQLite from "expo-sqlite";

export async function initializeLocalDatabase(
  dbFileName: string = "finbot-db.sqlite",
): Promise<SQLite.SQLiteDatabase | null> {
  try {
    const db = SQLite.openDatabaseSync(dbFileName);
    const extension = SQLite.bundledExtensions["sqlite-vec"];
    if (extension) {
      await db.loadExtensionAsync(extension.libPath, extension.entryPoint);
    }

    await db.execAsync(`
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS ledger (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL,
          action TEXT NOT NULL,
          context_id INTEGER,
          FOREIGN KEY (context_id) REFERENCES context(id) ON DELETE SET NULL
        );
        CREATE TABLE IF NOT EXISTS bank_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          amount REAL NOT NULL,
          description TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS financial_summaries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date_start TEXT NOT NULL,
          date_end TEXT NOT NULL,
          created_at TEXT NOT NULL,
          summary TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS context (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS chunks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          context_id INTEGER,
          embedding_id INTEGER,
          FOREIGN KEY (context_id) REFERENCES context(id) ON DELETE CASCADE,
          FOREIGN KEY (embedding_id) REFERENCES embeddings(id) ON DELETE CASCADE
        );
        CREATE VIRTUAL TABLE IF NOT EXISTS embeddings USING vec0 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          embedding float[768]
        );
      `);
    return db;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return null;
  }
}

export default initializeLocalDatabase;
