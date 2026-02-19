"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/storage";
import { Star } from "lucide-react";

const FORTUNES = [
  { level: "大吉", color: "text-yellow-400", emoji: "🌟", advice: "万事顺遂，宜大胆行动！" },
  { level: "吉", color: "text-green-400", emoji: "✨", advice: "运势不错，适合尝试新事物。" },
  { level: "中吉", color: "text-blue-400", emoji: "🌤", advice: "平稳顺利，保持好心态。" },
  { level: "小吉", color: "text-cyan-400", emoji: "🌈", advice: "有小惊喜，注意身边的美好。" },
  { level: "末吉", color: "text-gray-300", emoji: "🌥", advice: "普通的一天，平淡即是福。" },
  { level: "凶", color: "text-orange-400", emoji: "⛅", advice: "小心谨慎，避免冲动决定。" },
  { level: "大凶", color: "text-red-400", emoji: "🌧", advice: "低调行事，今日不宜冒险。" },
];

const ASPECTS = [
  { name: "事业运", icon: "💼" },
  { name: "财运", icon: "💰" },
  { name: "爱情运", icon: "💕" },
  { name: "健康运", icon: "🏃" },
  { name: "学习运", icon: "📚" },
];

function getDailyFortune() {
  const today = new Date().toDateString();
  const key = `fortune_${today}`;
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  }

  const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  const aspects = ASPECTS.map((a) => ({
    ...a,
    score: Math.floor(Math.random() * 5) + 1,
  }));
  const luckyNumber = Math.floor(Math.random() * 100);
  const luckyColors = ["红色", "蓝色", "绿色", "黄色", "紫色", "白色", "黑色", "橙色"];
  const luckyColor = luckyColors[Math.floor(Math.random() * luckyColors.length)];

  const result = { fortune, aspects, luckyNumber, luckyColor, date: today };
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(result));
  }
  return result;
}

export default function DailyFortune({ onUpdate }: { onUpdate: () => void }) {
  const [fortune, setFortune] = useState<ReturnType<typeof getDailyFortune> | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleReveal = useCallback(() => {
    const f = getDailyFortune();
    setFortune(f);
    setRevealed(true);
    addHistory({
      type: "今日运势",
      result: f.fortune.level,
      detail: `幸运数字: ${f.luckyNumber}, 幸运颜色: ${f.luckyColor}`,
    });
    onUpdate();
  }, [onUpdate]);

  useEffect(() => {
    const today = new Date().toDateString();
    const key = `fortune_${today}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      setFortune(JSON.parse(cached));
      setRevealed(true);
    }
  }, []);

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Star className="w-5 h-5 text-yellow-400" />
          今日运势
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!revealed ? (
          <div className="text-center py-6">
            <p className="text-gray-400 mb-4">点击下方按钮揭晓今日运势</p>
            <Button
              onClick={handleReveal}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 cursor-pointer"
            >
              🔮 揭晓运势
            </Button>
          </div>
        ) : fortune ? (
          <div className="space-y-4">
            <div className="text-center py-4 bg-gray-800 rounded-lg">
              <span className="text-4xl mb-2 block">{fortune.fortune.emoji}</span>
              <p className={`text-3xl font-bold ${fortune.fortune.color}`}>
                {fortune.fortune.level}
              </p>
              <p className="text-sm text-gray-400 mt-2">{fortune.fortune.advice}</p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {fortune.aspects.map((a: { name: string; icon: string; score: number }) => (
                <div key={a.name} className="flex items-center justify-between bg-gray-800 rounded px-3 py-2">
                  <span className="text-sm text-gray-300">
                    {a.icon} {a.name}
                  </span>
                  <span className="text-yellow-400">
                    {"★".repeat(a.score)}
                    {"☆".repeat(5 - a.score)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm bg-gray-800 rounded px-3 py-2">
              <span className="text-gray-400">
                🔢 幸运数字: <span className="text-blue-400 font-bold">{fortune.luckyNumber}</span>
              </span>
              <span className="text-gray-400">
                🎨 幸运颜色: <span className="text-pink-400 font-bold">{fortune.luckyColor}</span>
              </span>
            </div>

            <p className="text-xs text-gray-500 text-center">每日运势每天重置一次</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
