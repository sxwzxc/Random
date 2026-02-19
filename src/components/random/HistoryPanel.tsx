"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clearHistory, type HistoryRecord } from "@/lib/storage";
import { History, Trash2 } from "lucide-react";
import { HISTORY_TYPES, type Locale } from "@/lib/i18n";

const TYPE_COLORS: Record<string, string> = {
  [HISTORY_TYPES.number.zh]: "bg-blue-500/20 text-blue-500 dark:text-blue-400",
  [HISTORY_TYPES.number.en]: "bg-blue-500/20 text-blue-500 dark:text-blue-400",
  [HISTORY_TYPES.decision.zh]: "bg-purple-500/20 text-purple-500 dark:text-purple-400",
  [HISTORY_TYPES.decision.en]: "bg-purple-500/20 text-purple-500 dark:text-purple-400",
  [HISTORY_TYPES.fortune.zh]: "bg-yellow-500/20 text-yellow-500 dark:text-yellow-400",
  [HISTORY_TYPES.fortune.en]: "bg-yellow-500/20 text-yellow-500 dark:text-yellow-400",
  [HISTORY_TYPES.lottery.zh]: "bg-red-500/20 text-red-500 dark:text-red-400",
  [HISTORY_TYPES.lottery.en]: "bg-red-500/20 text-red-500 dark:text-red-400",
  [HISTORY_TYPES.coin.zh]: "bg-amber-500/20 text-amber-500 dark:text-amber-400",
  [HISTORY_TYPES.coin.en]: "bg-amber-500/20 text-amber-500 dark:text-amber-400",
  [HISTORY_TYPES.dice.zh]: "bg-green-500/20 text-green-500 dark:text-green-400",
  [HISTORY_TYPES.dice.en]: "bg-green-500/20 text-green-500 dark:text-green-400",
  [HISTORY_TYPES.team.zh]: "bg-teal-500/20 text-teal-500 dark:text-teal-400",
  [HISTORY_TYPES.team.en]: "bg-teal-500/20 text-teal-500 dark:text-teal-400",
};

function formatTime(ts: number, locale: Locale) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString(locale === "zh" ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) return locale === "zh" ? `今天 ${time}` : `Today ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return locale === "zh" ? `昨天 ${time}` : `Yesterday ${time}`;
  }
  return `${d.getMonth() + 1}/${d.getDate()} ${time}`;
}

export default function HistoryPanel({
  records,
  onClear,
  locale,
}: {
  records: HistoryRecord[];
  onClear: () => void;
  locale: Locale;
}) {
  const text = {
    zh: { title: "历史记录", clear: "清空", empty: "暂无历史记录" },
    en: { title: "History", clear: "Clear", empty: "No history yet" },
  }[locale];

  const handleClear = () => {
    clearHistory();
    onClear();
  };

  return (
    <Card className="bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <History className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          {text.title}
        </CardTitle>
        {records.length > 0 && (
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {text.clear}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-gray-500 text-center py-6">{text.empty}</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {records.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2"
              >
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                    TYPE_COLORS[r.type] || "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {r.type}
                </span>
                <span className="text-gray-900 dark:text-white font-medium truncate">
                  {r.result}
                </span>
                {r.detail && (
                  <span className="text-gray-500 text-xs truncate hidden sm:inline">
                    {r.detail}
                  </span>
                )}
                <span className="text-gray-500 dark:text-gray-600 text-xs ml-auto whitespace-nowrap">
                  {formatTime(r.timestamp, locale)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
