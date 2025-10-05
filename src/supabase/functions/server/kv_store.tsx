// Simple in-memory key-value store for demonstration
// In production, this would be replaced with a proper database

const store = new Map<string, any>();

export async function set(key: string, value: any): Promise<void> {
  store.set(key, {
    value,
    timestamp: Date.now()
  });
}

export async function get(key: string): Promise<any> {
  const item = store.get(key);
  if (!item) return null;
  
  // Optional: Implement TTL (time to live)
  const TTL = 24 * 60 * 60 * 1000; // 24 hours
  if (Date.now() - item.timestamp > TTL) {
    store.delete(key);
    return null;
  }
  
  return item.value;
}

export async function del(key: string): Promise<void> {
  store.delete(key);
}

export async function getByPrefix(prefix: string): Promise<any[]> {
  const results: any[] = [];
  
  for (const [key, item] of store.entries()) {
    if (key.startsWith(prefix)) {
      // Check TTL
      const TTL = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - item.timestamp <= TTL) {
        results.push({
          key,
          value: item.value,
          timestamp: item.timestamp
        });
      } else {
        store.delete(key);
      }
    }
  }
  
  return results;
}

export async function clear(): Promise<void> {
  store.clear();
}

// Utility function to clean up expired entries
export async function cleanup(): Promise<void> {
  const TTL = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();
  
  for (const [key, item] of store.entries()) {
    if (now - item.timestamp > TTL) {
      store.delete(key);
    }
  }
}

// Run cleanup every hour
setInterval(cleanup, 60 * 60 * 1000);