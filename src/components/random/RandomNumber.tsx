"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/storage";
import { Dices } from "lucide-react";

export default function RandomNumber({ onUpdate }: { onUpdate: () => void }) {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [result, setResult] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

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
          type: "随机数",
          result: String(final),
          detail: `范围: ${low} - ${high}`,
        });
        onUpdate();
      }
    }, 50);
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Dices className="w-5 h-5 text-blue-400" />
          随机数生成器
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-sm text-gray-400 mb-1 block">最小值</label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-gray-400 mt-5">—</span>
          <div className="flex-1">
            <label className="text-sm text-gray-400 mb-1 block">最大值</label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <Button
          onClick={generate}
          disabled={animating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        >
          {animating ? "生成中..." : "生成随机数"}
        </Button>
        {result !== null && (
          <div className="text-center py-4">
            <span
              className={`text-5xl font-bold text-blue-400 transition-all ${
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
