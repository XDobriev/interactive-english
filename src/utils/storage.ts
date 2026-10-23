/** Safe localStorage JSON helpers: storage can be unavailable (private mode, quota) or hold corrupt data. */

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved) as T;
  } catch (err) {
    console.warn(`Failed to read "${key}" from localStorage:`, err);
  }
  return fallback;
}

export function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to write "${key}" to localStorage:`, err);
  }
}
