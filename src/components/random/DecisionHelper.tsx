"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/storage";
import { HelpCircle, Plus, X } from "lucide-react";

export default function DecisionHelper({
  onUpdate,
}: {
  onUpdate: () => void;
}) {
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [result, setResult] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const addOption = () => setOptions([...options, ""]);

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const decide = () => {
    const valid = options.filter((o) => o.trim());
    if (valid.length < 2) return;
    setAnimating(true);
    let count = 0;
    const interval = setInterval(() => {
      setResult(valid[Math.floor(Math.random() * valid.length)]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        const final = valid[Math.floor(Math.random() * valid.length)];
        setResult(final);
        setAnimating(false);
        addHistory({
          type: "选择助手",
          result: final,
          detail: `选项: ${valid.join(", ")}`,
        });
        onUpdate();
      }
    }, 80);
  };

  const validCount = options.filter((o) => o.trim()).length;

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
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`选项 ${i + 1}`}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          onClick={decide}
          disabled={animating || validCount < 2}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
        >
          {animating ? "选择中..." : "帮我选！"}
        </Button>
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
