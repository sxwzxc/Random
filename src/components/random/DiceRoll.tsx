"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/storage";
import { Dice1 } from "lucide-react";
import { HISTORY_TYPES, type Locale } from "@/lib/i18n";

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function DiceRoll({ onUpdate, locale }: { onUpdate: () => void; locale: Locale }) {
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);

  const text = {
    zh: { title: "掷骰子", count: "骰子数量", running: "投掷中...", action: "🎲 掷骰子", sum: "总和", detailDice: "个骰子" },
    en: { title: "Dice Roll", count: "Dice Count", running: "Rolling...", action: "🎲 Roll Dice", sum: "Total", detailDice: "dice" },
  }[locale];

  const roll = () => {
    setAnimating(true);
    let tick = 0;
    const interval = setInterval(() => {
      setResults(
        Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1)
      );
      tick++;
      if (tick > 12) {
        clearInterval(interval);
        const final = Array.from(
          { length: count },
          () => Math.floor(Math.random() * 6) + 1
        );
        setResults(final);
        setAnimating(false);
        addHistory({
          type: HISTORY_TYPES.dice[locale],
          result: final.join(", "),
          detail: `${count} ${text.detailDice}, ${text.sum}: ${final.reduce((a, b) => a + b, 0)}`,
        });
        onUpdate();
      }
    }, 70);
  };

  return (
    <Card className="bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Dice1 className="w-5 h-5 text-green-500 dark:text-green-400" />
          {text.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{text.count}</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`w-9 h-9 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                  count === n
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <Button
          onClick={roll}
          disabled={animating}
          className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer"
        >
          {animating ? text.running : text.action}
        </Button>
        {results.length > 0 && (
          <div className="text-center py-4">
            <div className="flex justify-center gap-3 mb-3">
              {results.map((r, i) => (
                <span
                  key={i}
                  className={`text-5xl transition-all ${
                    animating ? "opacity-50" : "opacity-100"
                  }`}
                >
                  {DICE_FACES[r - 1]}
                </span>
              ))}
            </div>
            {!animating && results.length > 1 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {text.sum}:{" "}
                <span className="text-green-500 dark:text-green-400 font-bold">
                  {results.reduce((a, b) => a + b, 0)}
                </span>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
