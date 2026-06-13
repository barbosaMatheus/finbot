import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const db = SQLite.openDatabaseSync("finbot-db.sqlite");

export default function HomeScreen() {
  const [status, setStatus] = useState("Initializing database...");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const extension = SQLite.bundledExtensions["sqlite-vec"];
      if (extension) {
        await db.loadExtensionAsync(extension.libPath, extension.entryPoint);
      }

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ledger (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT NOT NULL,
          datetime TEXT NOT NULL,
          content TEXT
        );
        INSERT INTO ledger (action, datetime, content) VALUES ('initialize', datetime('now'), 'Database initialized');
        INSERT INTO ledger (action, datetime, content) VALUES ('run_query', datetime('now'), 'Query run');
        CREATE VIRTUAL TABLE IF NOT EXISTS embeddings USING vec0 (embedding float[768]);
      `);

      setStatus("Database initialized successfully.");
    } catch (error) {
      console.error("Database initialization failed:", error);
      setStatus("Database initialization failed.");
    }
  };

  const handleRunQuery = async () => {
    if (!query.trim()) {
      setResult(["Empty query"]);
      return;
    }

    try {
      setResult(["Running query..."]);
      setError(null);
      const results = await db.getAllAsync(query);
      setResult(results);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred");
      setResult([]);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQLite Query Interface</Text>
      <Text>{status}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="Enter SQL query here..."
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={styles.button} onPress={handleRunQuery}>
          <Text style={styles.buttonText}>Run Query</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultContainer}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : result.length > 0 ? (
          result.map((row, index) => (
            <View key={index} style={styles.row}>
              {Object.entries(row).map(([key, value]) => (
                <Text key={key} style={styles.cell}>
                  {key}: {String(value)}
                </Text>
              ))}
            </View>
          ))
        ) : (
          <Text>No results to display</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    height: 100,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  row: {
    marginBottom: 10,
  },
  cell: {
    marginBottom: 5,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  code: {
    textTransform: "uppercase",
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: "stretch",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
