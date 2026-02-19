"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/storage";
import { Coins } from "lucide-react";

export default function CoinFlip({ onUpdate }: { onUpdate: () => void }) {
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [animating, setAnimating] = useState(false);

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
        const label = final === "heads" ? "正面" : "反面";
        addHistory({ type: "抛硬币", result: label, detail: "" });
        onUpdate();
      }
    }, 80);
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Coins className="w-5 h-5 text-amber-400" />
          抛硬币
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={flip}
          disabled={animating}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
        >
          {animating ? "翻转中..." : "🪙 抛硬币"}
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
            <p className="text-2xl font-bold text-amber-400">
              {result === "heads" ? "正面" : "反面"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
