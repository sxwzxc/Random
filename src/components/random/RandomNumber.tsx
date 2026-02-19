"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/storage";
import { Dices } from "lucide-react";
import { HISTORY_TYPES, type Locale } from "@/lib/i18n";

export default function RandomNumber({ onUpdate, locale }: { onUpdate: () => void; locale: Locale }) {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [result, setResult] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  const text = {
    zh: { title: "随机数生成器", min: "最小值", max: "最大值", running: "生成中...", action: "生成随机数", range: "范围" },
    en: { title: "Random Number Generator", min: "Min", max: "Max", running: "Generating...", action: "Generate", range: "Range" },
  }[locale];

  const generate = () => {
    const lo = parseInt(min) || 0;
    const hi = parseInt(max) || 100;
    const low = Math.min(lo, hi);
    const high = Math.max(lo, hi);
    setAnimating(true);
    let count = 0;
    const interval = setInterval(() => {
      setResult(Math.floor(Math.random() * (high - low + 1)) + low);
      count++;
      if (count > 10) {
        clearInterval(interval);
        const final = Math.floor(Math.random() * (high - low + 1)) + low;
        setResult(final);
        setAnimating(false);
        addHistory({
          type: HISTORY_TYPES.number[locale],
          result: String(final),
          detail: `${text.range}: ${low} - ${high}`,
        });
        onUpdate();
      }
    }, 50);
  };

  return (
    <Card className="bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Dices className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          {text.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{text.min}</label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-gray-500 dark:text-gray-400 mt-5">—</span>
          <div className="flex-1">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{text.max}</label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <Button
          onClick={generate}
          disabled={animating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        >
          {animating ? text.running : text.action}
        </Button>
        {result !== null && (
          <div className="text-center py-4">
            <span
              className={`text-5xl font-bold text-blue-500 dark:text-blue-400 transition-all ${
                animating ? "opacity-50" : "opacity-100"
              }`}
            >
              {result}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
