const mockedDb: any = {
  execAsync: jest.fn(async (sql: string) => {
    return;
  }),
  getAllAsync: jest.fn(async (sql: string) => []),
};

jest.mock("expo-sqlite", () => ({
  openDatabaseSync: () => mockedDb,
  bundledExtensions: {},
}));

const {
  insertChunk,
  insertContext,
  insertVector,
  removeContext,
} = require("../src/database/db-utils");

beforeEach(() => {
  mockedDb.execAsync.mockClear();
  mockedDb.getAllAsync.mockClear();
});

test("insertContext inserts and logs to ledger", async () => {
  // Simulate last_insert_rowid
  mockedDb.getAllAsync.mockImplementationOnce(async () => [{ id: 42 }]);

  const id = await insertContext(mockedDb, "hello's world");

  expect(id).toBe(42);
  // First execAsync should be the insert into context
  expect(mockedDb.execAsync).toHaveBeenCalled();
  // There should be at least two execAsync calls (insert context + ledger)
  expect(mockedDb.execAsync.mock.calls.length).toBeGreaterThanOrEqual(2);
});

test("insertChunk inserts chunk and returns id", async () => {
  mockedDb.getAllAsync.mockImplementationOnce(async () => [{ id: 7 }]);
  const id = await insertChunk(mockedDb, "chunk text", 1, 2);
  expect(id).toBe(7);
  expect(mockedDb.execAsync).toHaveBeenCalled();
});

test("insertVector validates length and inserts", async () => {
  const vec = new Array(768).fill(0).map((_, i) => i * 0.001);
  mockedDb.getAllAsync.mockImplementationOnce(async () => [{ id: 99 }]);
  const id = await insertVector(mockedDb, vec as number[]);
  expect(id).toBe(99);
  expect(mockedDb.execAsync).toHaveBeenCalled();
});

test("removeContext deletes related rows and logs", async () => {
  // Simulate chunks referencing embedding ids 5 and 6
  mockedDb.getAllAsync.mockImplementationOnce(async () => [
    { embedding_id: 5 },
    { embedding_id: 6 },
  ]);

  mockedDb.execAsync.mockImplementation(async (sql: string) => {
    // noop
  });

  const ok = await removeContext(mockedDb, 3);
  expect(ok).toBe(true);
  // Expect BEGIN and COMMIT among calls
  const calls = mockedDb.execAsync.mock.calls.map((c: any[]) => String(c[0]));
  expect(calls.some((s: string) => s.includes("BEGIN"))).toBe(true);
  expect(calls.some((s: string) => s.includes("COMMIT"))).toBe(true);
});
