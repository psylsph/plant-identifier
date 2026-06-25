import { PlantInfo, HistoryEntry } from './types';

const STORAGE_KEY = 'plant-identifier-history-v1';
const MAX_HISTORY = 8;

/** Try to extract a 0-100 number from strings like "85%", "85", "85 percent", "0.85" */
export function parseConfidence(raw: string): number {
  if (!raw) return 0;
  const trimmed = raw.trim();
  // plain percentage
  const percentMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*%?/);
  if (percentMatch) {
    const n = parseFloat(percentMatch[1]);
    if (!isNaN(n)) {
      // if it's clearly a fraction like 0.85 with no %, treat as fraction
      if (!trimmed.includes('%') && n > 0 && n <= 1) return Math.round(n * 100);
      return Math.round(n);
    }
  }
  return 0;
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: HistoryEntry) {
  if (typeof window === 'undefined') return;
  const current = loadHistory();
  const next = [entry, ...current].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota errors
  }
  return next;
}

export function removeEntry(id: string) {
  if (typeof window === 'undefined') return loadHistory();
  const current = loadHistory().filter((e) => e.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
  return current;
}

export function clearHistory() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function formatPlantInfoForCopy(result: PlantInfo): string {
  return [
    `Plant: ${result.name}`,
    `Confidence: ${result.confidence}`,
    ``,
    `Details:`,
    result.details,
    ``,
    `Health:`,
    result.healthy,
    ``,
    `Care:`,
    result.care,
  ].join('\n');
}