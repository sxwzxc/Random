"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/storage";
import { HelpCircle, Plus, X } from "lucide-react";

export default function DecisionHelper({
  onUpdate,
}: {
  onUpdate: () => void;
}) {
  const [options, setOptions] = useState([
    { text: "", weight: 1 },
    { text: "", weight: 1 },
  ]);
  const [result, setResult] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [initialSpeed, setInitialSpeed] = useState(24);

  const addOption = () => setOptions([...options, { text: "", weight: 1 }]);

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const next = [...options];
    next[index] = { ...next[index], text: value };
    setOptions(next);
  };

  const updateWeight = (index: number, value: string) => {
    const next = [...options];
    const parsed = Number(value);
    next[index] = {
      ...next[index],
      weight: Number.isFinite(parsed) ? Math.max(0, parsed) : 0,
    };
    setOptions(next);
  };

  const valid = useMemo(
    () =>
      options.filter(
        (o) => o.text.trim() && Number.isFinite(o.weight) && o.weight > 0
      ),
    [options]
  );

  const pickByRotation = (angle: number) => {
    if (!valid.length) return null;
    const totalWeight = valid.reduce((sum, item) => sum + item.weight, 0);
    if (!totalWeight) return null;
    const normalized = ((360 - (angle % 360)) + 360) % 360;
    let accumulated = 0;
    for (const item of valid) {
      accumulated += (item.weight / totalWeight) * 360;
      if (normalized < accumulated) return item.text;
    }
    return valid[valid.length - 1]?.text ?? null;
  };

  const decide = (speed = initialSpeed) => {
    if (valid.length < 2) return;
    setAnimating(true);
    const totalWeight = valid.reduce((sum, item) => sum + item.weight, 0);
    let current = rotation;
    let velocity = Math.max(4, speed);

    const tick = () => {
      current += velocity;
      velocity *= 0.985;
      setRotation(current);
      const currentResult = pickByRotation(current);
      if (currentResult) setResult(currentResult);

      if (velocity > 0.15) {
        requestAnimationFrame(tick);
        return;
      }

      const final = pickByRotation(current);
      if (!final) {
        setAnimating(false);
        return;
      }
      setResult(final);
      setAnimating(false);
      addHistory({
        type: "选择助手",
        result: final,
        detail: `选项: ${valid
          .map((item) => `${item.text}(${item.weight}/${totalWeight})`)
          .join(", ")}`,
      });
      onUpdate();
    };

    requestAnimationFrame(tick);
  };

  const validCount = valid.length;
  const wheelBackground = useMemo(() => {
    if (!valid.length) return "conic-gradient(#4b5563 0deg 360deg)";
    const colors = [
      "#a855f7",
      "#3b82f6",
      "#ec4899",
      "#14b8a6",
      "#f59e0b",
      "#ef4444",
      "#22c55e",
      "#8b5cf6",
    ];
    const totalWeight = valid.reduce((sum, item) => sum + item.weight, 0);
    let current = 0;
    const stops = valid.map((item, i) => {
      const start = current;
      current += (item.weight / totalWeight) * 360;
      return `${colors[i % colors.length]} ${start}deg ${current}deg`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [valid]);

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <HelpCircle className="w-5 h-5 text-purple-400" />
          选择困难助手
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-400">
          输入选项，让命运帮你做出选择！
        </p>
        <div className="relative mx-auto w-56 h-56">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-l-transparent border-r-transparent border-b-purple-300" />
          <div
            className={`w-full h-full rounded-full border-4 border-gray-700 shadow-lg transition-transform ${
              animating ? "" : "cursor-pointer"
            }`}
            style={{
              background: wheelBackground,
              transform: `rotate(${rotation}deg)`,
            }}
            onClick={() => !animating && decide(initialSpeed)}
          />
        </div>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={opt.text}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`选项 ${i + 1}`}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="number"
              min="0"
              step="0.1"
              value={opt.weight}
              onChange={(e) => updateWeight(i, e.target.value)}
              className="w-20 bg-gray-800 border border-gray-600 rounded-md px-2 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label={`选项 ${i + 1} 比重`}
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(i)}
                className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addOption}
          className="w-full border-dashed border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" />
          添加选项
        </Button>
        <Button
          onClick={() => decide(initialSpeed)}
          disabled={animating || validCount < 2}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
        >
          {animating ? "转盘旋转中..." : "转动转盘"}
        </Button>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>初速度</span>
            <span>{initialSpeed}</span>
          </div>
          <input
            type="range"
            min="8"
            max="40"
            value={initialSpeed}
            onChange={(e) => setInitialSpeed(Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
            disabled={animating}
          />
        </div>
        {result && (
          <div className="text-center py-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">命运之选</p>
            <p
              className={`text-3xl font-bold text-purple-400 transition-all ${
                animating ? "opacity-50" : "opacity-100"
              }`}
            >
              {result}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
