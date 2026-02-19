export interface HistoryRecord {
  id: string;
  type: string;
  result: string;
  detail: string;
  timestamp: number;
}

export interface LotteryPool {
  participants: string[];
  drawn: string[];
}

const HISTORY_KEY = "random_history";
const LOTTERY_KEY = "random_lottery_pool";

export function getHistory(): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addHistory(record: Omit<HistoryRecord, "id" | "timestamp">) {
  const history = getHistory();
  const newRecord: HistoryRecord = {
    ...record,
    id: typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
  };
  history.unshift(newRecord);
  if (history.length > 200) history.length = 200;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return newRecord;
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function getLotteryPool(): LotteryPool {
  if (typeof window === "undefined") return { participants: [], drawn: [] };
  try {
    const data = localStorage.getItem(LOTTERY_KEY);
    return data ? JSON.parse(data) : { participants: [], drawn: [] };
  } catch {
    return { participants: [], drawn: [] };
  }
}

export function saveLotteryPool(pool: LotteryPool) {
  localStorage.setItem(LOTTERY_KEY, JSON.stringify(pool));
}

export function clearLotteryPool() {
  localStorage.removeItem(LOTTERY_KEY);
}
