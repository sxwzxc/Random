"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clearHistory, type HistoryRecord } from "@/lib/storage";
import { History, Trash2 } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  随机数: "bg-blue-500/20 text-blue-400",
  选择助手: "bg-purple-500/20 text-purple-400",
  今日运势: "bg-yellow-500/20 text-yellow-400",
  抽奖: "bg-red-500/20 text-red-400",
  抛硬币: "bg-amber-500/20 text-amber-400",
  掷骰子: "bg-green-500/20 text-green-400",
  随机分组: "bg-teal-500/20 text-teal-400",
};

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) return `今天 ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `昨天 ${time}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${time}`;
}

export default function HistoryPanel({
  records,
  onClear,
}: {
  records: HistoryRecord[];
  onClear: () => void;
}) {
  const handleClear = () => {
    clearHistory();
    onClear();
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-white">
          <History className="w-5 h-5 text-gray-400" />
          历史记录
        </CardTitle>
        {records.length > 0 && (
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            清空
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-gray-500 text-center py-6">暂无历史记录</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {records.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2"
              >
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                    TYPE_COLORS[r.type] || "bg-gray-600 text-gray-300"
                  }`}
                >
                  {r.type}
                </span>
                <span className="text-white font-medium truncate">
                  {r.result}
                </span>
                {r.detail && (
                  <span className="text-gray-500 text-xs truncate hidden sm:inline">
                    {r.detail}
                  </span>
                )}
                <span className="text-gray-600 text-xs ml-auto whitespace-nowrap">
                  {formatTime(r.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
