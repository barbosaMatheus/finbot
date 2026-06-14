const mockDb: any = {
  loadExtensionAsync: jest.fn(async () => {}),
  execAsync: jest.fn(async () => {}),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: () => mockDb,
  bundledExtensions: { 'sqlite-vec': { libPath: 'p', entryPoint: 'e' } },
}));

const initializeLocalDatabase = require('../src/database/init-database').default;

beforeEach(() => {
  mockDb.loadExtensionAsync.mockClear();
  mockDb.execAsync.mockClear();
});

test('initializeLocalDatabase loads extension and executes schema', async () => {
  const db = await initializeLocalDatabase(':memory:');
  expect(db).toBeTruthy();
  expect(mockDb.loadExtensionAsync).toHaveBeenCalled();
  expect(mockDb.execAsync).toHaveBeenCalled();
});
