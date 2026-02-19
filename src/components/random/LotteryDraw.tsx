"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  addHistory,
  getLotteryPool,
  saveLotteryPool,
  clearLotteryPool,
} from "@/lib/storage";
import { Gift, Plus, RotateCcw, X } from "lucide-react";

export default function LotteryDraw({ onUpdate }: { onUpdate: () => void }) {
  const [pool, setPool] = useState<{ participants: string[]; drawn: string[] }>({
    participants: [],
    drawn: [],
  });
  const [input, setInput] = useState("");
  const [winner, setWinner] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const loadPool = useCallback(() => {
    setPool(getLotteryPool());
  }, []);

  useEffect(() => {
    loadPool();
  }, [loadPool]);

  const addParticipant = () => {
    const names = input
      .split(/[,，\n]/)
      .map((s) => s.trim())
      .filter((s) => s);
    if (names.length === 0) return;
    const next = {
      ...pool,
      participants: [...new Set([...pool.participants, ...names])],
    };
    setPool(next);
    saveLotteryPool(next);
    setInput("");
  };

  const removeParticipant = (name: string) => {
    const next = {
      participants: pool.participants.filter((p) => p !== name),
      drawn: pool.drawn.filter((d) => d !== name),
    };
    setPool(next);
    saveLotteryPool(next);
  };

  const draw = () => {
    const available = pool.participants.filter(
      (p) => !pool.drawn.includes(p)
    );
    if (available.length === 0) return;
    setAnimating(true);
    let count = 0;
    const interval = setInterval(() => {
      setWinner(available[Math.floor(Math.random() * available.length)]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        const final =
          available[Math.floor(Math.random() * available.length)];
        setWinner(final);
        setAnimating(false);
        const next = {
          ...pool,
          drawn: [...pool.drawn, final],
        };
        setPool(next);
        saveLotteryPool(next);
        addHistory({
          type: "抽奖",
          result: final,
          detail: `参与者: ${pool.participants.length}人, 已抽: ${next.drawn.length}人`,
        });
        onUpdate();
      }
    }, 80);
  };

  const resetDraw = () => {
    const next = { ...pool, drawn: [] };
    setPool(next);
    saveLotteryPool(next);
    setWinner(null);
  };

  const clearAll = () => {
    clearLotteryPool();
    setPool({ participants: [], drawn: [] });
    setWinner(null);
  };

  const available = pool.participants.filter(
    (p) => !pool.drawn.includes(p)
  );

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Gift className="w-5 h-5 text-red-400" />
          抽奖系统
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            添加参与者（逗号分隔）
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addParticipant()}
              placeholder="张三, 李四, 王五..."
              className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Button
              onClick={addParticipant}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {pool.participants.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              参与者 ({available.length}/{pool.participants.length} 可抽)
            </p>
            <div className="flex flex-wrap gap-2">
              {pool.participants.map((p) => {
                const isDrawn = pool.drawn.includes(p);
                return (
                  <span
                    key={p}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${
                      isDrawn
                        ? "bg-gray-700 text-gray-500 line-through"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    {p}
                    {!isDrawn && (
                      <button
                        onClick={() => removeParticipant(p)}
                        className="text-gray-400 hover:text-red-400 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={draw}
            disabled={animating || available.length === 0}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white cursor-pointer"
          >
            {animating
              ? "抽奖中..."
              : available.length === 0
              ? "全部已抽完"
              : "🎉 开始抽奖"}
          </Button>
          {pool.drawn.length > 0 && (
            <Button
              onClick={resetDraw}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          {pool.participants.length > 0 && (
            <Button
              onClick={clearAll}
              variant="outline"
              className="border-gray-600 text-red-400 hover:bg-gray-800 cursor-pointer"
            >
              清空
            </Button>
          )}
        </div>

        {winner && (
          <div className="text-center py-6 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">🎊 恭喜中奖</p>
            <p
              className={`text-4xl font-bold text-red-400 transition-all ${
                animating ? "opacity-50" : "opacity-100"
              }`}
            >
              {winner}
            </p>
          </div>
        )}

        {pool.drawn.length > 0 && (
          <div className="text-xs text-gray-500">
            已抽出: {pool.drawn.join(", ")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
