"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/storage";
import { Dice1 } from "lucide-react";

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function DiceRoll({ onUpdate }: { onUpdate: () => void }) {
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);

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
          type: "掷骰子",
          result: final.join(", "),
          detail: `${count}个骰子, 总和: ${final.reduce((a, b) => a + b, 0)}`,
        });
        onUpdate();
      }
    }, 70);
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Dice1 className="w-5 h-5 text-green-400" />
          掷骰子
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">骰子数量</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`w-9 h-9 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                  count === n
                    ? "bg-green-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
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
          {animating ? "投掷中..." : "🎲 掷骰子"}
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
              <p className="text-sm text-gray-400">
                总和:{" "}
                <span className="text-green-400 font-bold">
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
