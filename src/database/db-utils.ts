import * as SQLite from "expo-sqlite";

export async function insertContext(
  db: SQLite.SQLiteDatabase,
  content: string,
): Promise<number | null> {
  try {
    const esc = content.replace(/'/g, "''");
    await db.execAsync(
      `INSERT INTO context (content, created_at) VALUES ('${esc}', datetime('now'));`,
    );

    const rows = await db.getAllAsync("SELECT last_insert_rowid() AS id;");
    const id =
      rows && rows[0] && (rows[0] as any).id
        ? Number((rows[0] as any).id)
        : null;

    if (id != null) {
      await db.execAsync(
        `INSERT INTO ledger (created_at, action, context_id) VALUES (datetime('now'), 'create', ${id});`,
      );
    }

    return id;
  } catch (error) {
    console.error("insertContext failed:", error);
    return null;
  }
}

export async function insertChunk(
  db: SQLite.SQLiteDatabase,
  content: string,
  contextId: number | null,
  vectorId: number | null,
): Promise<number | null> {
  try {
    const esc = content.replace(/'/g, "''");
    const ctx = contextId == null ? "NULL" : String(contextId);
    const vec = vectorId == null ? "NULL" : String(vectorId);
    await db.execAsync(
      `INSERT INTO chunks (content, context_id, embedding_id) VALUES ('${esc}', ${ctx}, ${vec});`,
    );

    const rows = await db.getAllAsync("SELECT last_insert_rowid() AS id;");
    const id =
      rows && rows[0] && (rows[0] as any).id
        ? Number((rows[0] as any).id)
        : null;
    return id;
  } catch (error) {
    console.error("insertChunk failed:", error);
    return null;
  }
}

export async function insertVector(
  db: SQLite.SQLiteDatabase,
  vector: number[],
): Promise<number | null> {
  try {
    if (!Array.isArray(vector) || vector.length !== 768) {
      throw new Error("Vector must be an array of 768 numbers");
    }

    const vectorString = JSON.stringify(vector);

    const escVec = vectorString.replace(/'/g, "''");
    await db.execAsync(
      `INSERT INTO embeddings (embedding) VALUES ('${escVec}');`,
    );

    const rows = await db.getAllAsync("SELECT last_insert_rowid() AS id;");
    const id =
      rows && rows[0] && (rows[0] as any).id
        ? Number((rows[0] as any).id)
        : null;
    return id;
  } catch (error) {
    console.error("insertVector failed:", error);
    return null;
  }
}

export async function removeContext(
  db: SQLite.SQLiteDatabase,
  contextId: number,
): Promise<boolean> {
  try {
    const cid = Number(contextId);
    if (Number.isNaN(cid)) throw new Error("Invalid contextId");

    await db.execAsync("BEGIN;");

    // Null out any ledger references to this context
    await db.execAsync(
      `UPDATE ledger SET context_id = NULL WHERE context_id = ${cid};`,
    );

    // Find embedding ids referenced by chunks for this context
    const rows = await db.getAllAsync(
      `SELECT embedding_id FROM chunks WHERE context_id = ${cid} AND embedding_id IS NOT NULL;`,
    );

    const ids: number[] = [];
    if (Array.isArray(rows)) {
      for (const r of rows as any[]) {
        const val = r && (r.embedding_id ?? r.embeddingId ?? r.id);
        if (val != null) {
          const n = Number(val);
          if (!Number.isNaN(n)) ids.push(n);
        }
      }
    }

    const uniqueIds = Array.from(new Set(ids));

    // Delete chunks belonging to the context
    await db.execAsync(`DELETE FROM chunks WHERE context_id = ${cid};`);

    // Delete embeddings that were referenced by those chunks
    if (uniqueIds.length > 0) {
      const inList = uniqueIds.join(",");
      await db.execAsync(`DELETE FROM embeddings WHERE id IN (${inList});`);
    }

    // Finally delete the context itself
    await db.execAsync(`DELETE FROM context WHERE id = ${cid};`);

    // Record the deletion in the ledger (context_id set to NULL to indicate gone)
    await db.execAsync(
      `INSERT INTO ledger (created_at, action, context_id) VALUES (datetime('now'), 'delete', NULL);`,
    );

    await db.execAsync("COMMIT;");
    return true;
  } catch (error) {
    try {
      await db.execAsync("ROLLBACK;");
    } catch (e) {
      // ignore
      console.error("Rollback failed:", e);
    }
    console.error("removeContext failed:", error);
    return false;
  }
}

export default { insertContext, insertChunk, insertVector, removeContext };
