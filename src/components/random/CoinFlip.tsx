"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/storage";
import { Coins } from "lucide-react";
import { HISTORY_TYPES, type Locale } from "@/lib/i18n";

export default function CoinFlip({ onUpdate, locale }: { onUpdate: () => void; locale: Locale }) {
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [animating, setAnimating] = useState(false);

  const text = {
    zh: { title: "抛硬币", running: "翻转中...", action: "🪙 抛硬币", heads: "正面", tails: "反面" },
    en: { title: "Coin Flip", running: "Flipping...", action: "🪙 Flip Coin", heads: "Heads", tails: "Tails" },
  }[locale];

  const flip = () => {
    setAnimating(true);
    let count = 0;
    const interval = setInterval(() => {
      setResult(Math.random() > 0.5 ? "heads" : "tails");
      count++;
      if (count > 12) {
        clearInterval(interval);
        const final: "heads" | "tails" =
          Math.random() > 0.5 ? "heads" : "tails";
        setResult(final);
        setAnimating(false);
        const label = final === "heads" ? text.heads : text.tails;
        addHistory({ type: HISTORY_TYPES.coin[locale], result: label, detail: "" });
        onUpdate();
      }
    }, 80);
  };

  return (
    <Card className="bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Coins className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          {text.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={flip}
          disabled={animating}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
        >
          {animating ? text.running : text.action}
        </Button>
        {result && (
          <div className="text-center py-6">
            <div
              className={`text-7xl mb-3 transition-transform ${
                animating ? "animate-spin" : ""
              }`}
            >
              {result === "heads" ? "👑" : "🌙"}
            </div>
            <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">
              {result === "heads" ? text.heads : text.tails}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
