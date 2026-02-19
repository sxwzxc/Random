"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/storage";
import { Star, User } from "lucide-react";
import { HISTORY_TYPES, type Locale } from "@/lib/i18n";

const FORTUNES = {
  zh: [
    { level: "大吉", color: "text-yellow-400", emoji: "🌟", advice: "万事顺遂，宜大胆行动！" },
    { level: "吉", color: "text-green-400", emoji: "✨", advice: "运势不错，适合尝试新事物。" },
    { level: "中吉", color: "text-blue-400", emoji: "🌤", advice: "平稳顺利，保持好心态。" },
    { level: "小吉", color: "text-cyan-400", emoji: "🌈", advice: "有小惊喜，注意身边的美好。" },
    { level: "末吉", color: "text-gray-300", emoji: "🌥", advice: "普通的一天，平淡即是福。" },
    { level: "凶", color: "text-orange-400", emoji: "⛅", advice: "小心谨慎，避免冲动决定。" },
    { level: "大凶", color: "text-red-400", emoji: "🌧", advice: "低调行事，今日不宜冒险。" },
  ],
  en: [
    { level: "Excellent", color: "text-yellow-400", emoji: "🌟", advice: "A great day to take bold action." },
    { level: "Good", color: "text-green-400", emoji: "✨", advice: "Luck is on your side; try something new." },
    { level: "Steady", color: "text-blue-400", emoji: "🌤", advice: "Things are stable today—keep calm." },
    { level: "Small Luck", color: "text-cyan-400", emoji: "🌈", advice: "Small surprises may appear around you." },
    { level: "Average", color: "text-gray-300", emoji: "🌥", advice: "A plain day can still be a good day." },
    { level: "Caution", color: "text-orange-400", emoji: "⛅", advice: "Stay careful and avoid impulsive choices." },
    { level: "Challenging", color: "text-red-400", emoji: "🌧", advice: "Keep a low profile and avoid risks today." },
  ],
};

const ASPECTS = {
  zh: [
    { name: "事业运", icon: "💼" },
    { name: "财运", icon: "💰" },
    { name: "爱情运", icon: "💕" },
    { name: "健康运", icon: "🏃" },
    { name: "学习运", icon: "📚" },
  ],
  en: [
    { name: "Career", icon: "💼" },
    { name: "Wealth", icon: "💰" },
    { name: "Love", icon: "💕" },
    { name: "Health", icon: "🏃" },
    { name: "Study", icon: "📚" },
  ],
};

function getDailyFortune(locale: Locale, name: string = "") {
  const today = new Date().toDateString();
  const key = name ? `fortune_${locale}_${today}_${encodeURIComponent(name)}` : `fortune_${locale}_${today}`;
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  }

  const fortune = FORTUNES[locale][Math.floor(Math.random() * FORTUNES[locale].length)];
  const aspects = ASPECTS[locale].map((a) => ({
    ...a,
    score: Math.floor(Math.random() * 5) + 1,
  }));
  const luckyNumber = Math.floor(Math.random() * 100);
  const luckyColors = locale === "zh"
    ? ["红色", "蓝色", "绿色", "黄色", "紫色", "白色", "黑色", "橙色"]
    : ["Red", "Blue", "Green", "Yellow", "Purple", "White", "Black", "Orange"];
  const luckyColor = luckyColors[Math.floor(Math.random() * luckyColors.length)];

  const result = { fortune, aspects, luckyNumber, luckyColor, date: today, name, locale };
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(result));
  }
  return result;
}

const TESTED_KEY_PREFIX = "fortune_tested_";

function getTestedNicknames(locale: Locale): string[] {
  if (typeof window === "undefined") return [];
  const today = new Date().toDateString();
  const data = localStorage.getItem(`${TESTED_KEY_PREFIX}${locale}_${today}`);
  return data ? JSON.parse(data) : [];
}

function saveTestedNickname(locale: Locale, name: string) {
  const today = new Date().toDateString();
  const key = `${TESTED_KEY_PREFIX}${locale}_${today}`;
  const list = getTestedNicknames(locale);
  if (!list.includes(name)) {
    list.push(name);
    localStorage.setItem(key, JSON.stringify(list));
  }
}

export default function DailyFortune({ onUpdate, locale }: { onUpdate: () => void; locale: Locale }) {
  const [fortune, setFortune] = useState<ReturnType<typeof getDailyFortune> | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [nickname, setNickname] = useState("");
  const [currentName, setCurrentName] = useState("");
  const [testedToday, setTestedToday] = useState<string[]>([]);

  const text = {
    zh: {
      title: "今日运势",
      placeholder: "输入昵称（可留空）",
      reveal: "🔮 揭晓运势",
      tested: "今日已测：",
      anonymous: "匿名",
      luckyNumber: "幸运数字",
      luckyColor: "幸运颜色",
      reset: "每日运势每天重置一次",
      newName: "测试新昵称 →",
      empty: "输入昵称后点击揭晓，支持多人测试",
    },
    en: {
      title: "Daily Fortune",
      placeholder: "Enter nickname (optional)",
      reveal: "🔮 Reveal Fortune",
      tested: "Tested today:",
      anonymous: "Anonymous",
      luckyNumber: "Lucky Number",
      luckyColor: "Lucky Color",
      reset: "Fortune resets once per day",
      newName: "Try another nickname →",
      empty: "Enter a nickname and reveal fortune",
    },
  }[locale];

  useEffect(() => {
    const tested = getTestedNicknames(locale);
    setTestedToday(tested);
    const today = new Date().toDateString();
    const cached = localStorage.getItem(`fortune_${locale}_${today}`);
    if (cached) {
      setFortune(JSON.parse(cached));
      setRevealed(true);
      setCurrentName("");
    }
  }, [locale]);

  const handleReveal = () => {
    const name = nickname.trim();
    const f = getDailyFortune(locale, name);
    setFortune(f);
    setRevealed(true);
    setCurrentName(name);
    saveTestedNickname(locale, name);
    setTestedToday(getTestedNicknames(locale));
    addHistory({
      type: HISTORY_TYPES.fortune[locale],
      result: `${name ? `${name} · ` : ""}${f.fortune.level}`,
      detail: `${text.luckyNumber}: ${f.luckyNumber}, ${text.luckyColor}: ${f.luckyColor}`,
    });
    onUpdate();
  };

  const switchTo = (name: string) => {
    const f = getDailyFortune(locale, name);
    setFortune(f);
    setRevealed(true);
    setCurrentName(name);
    setNickname(name);
  };

  const handleNew = () => {
    setRevealed(false);
    setFortune(null);
    setNickname("");
    setCurrentName("");
  };

  return (
    <Card className="bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Star className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
          {text.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReveal()}
              placeholder={text.placeholder}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md pl-9 pr-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <Button
            onClick={handleReveal}
            className="bg-yellow-600 hover:bg-yellow-700 text-white cursor-pointer shrink-0"
          >
            {text.reveal}
          </Button>
        </div>

        {testedToday.length > 0 && (testedToday.length > 1 || testedToday[0] !== currentName) ? (
          <div className="space-y-1">
            <p className="text-xs text-gray-500">{text.tested}</p>
            <div className="flex flex-wrap gap-2">
              {testedToday.map((name) => (
                <button
                  key={name}
                  onClick={() => switchTo(name)}
                  className={`px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                    name === currentName
                      ? "bg-yellow-600 text-white"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {name || text.anonymous}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {revealed && fortune ? (
          <div className="space-y-4">
            {currentName && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {locale === "zh" ? (
                  <>
                    <span className="text-yellow-500 dark:text-yellow-400 font-medium">{currentName}</span> 的今日运势
                  </>
                ) : (
                  <>
                    Today&apos;s fortune for <span className="text-yellow-500 dark:text-yellow-400 font-medium">{currentName}</span>
                  </>
                )}
              </p>
            )}
            <div className="text-center py-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="text-4xl mb-2 block">{fortune.fortune.emoji}</span>
              <p className={`text-3xl font-bold ${fortune.fortune.color}`}>
                {fortune.fortune.level}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{fortune.fortune.advice}</p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {fortune.aspects.map((a: { name: string; icon: string; score: number }) => (
                <div key={a.name} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {a.icon} {a.name}
                  </span>
                  <span className="text-yellow-500 dark:text-yellow-400">
                    {"★".repeat(a.score)}
                    {"☆".repeat(5 - a.score)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
              <span className="text-gray-600 dark:text-gray-400">
                🔢 {text.luckyNumber}: <span className="text-blue-500 dark:text-blue-400 font-bold">{fortune.luckyNumber}</span>
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                🎨 {text.luckyColor}: <span className="text-pink-500 dark:text-pink-400 font-bold">{fortune.luckyColor}</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{text.reset}</p>
              <button
                onClick={handleNew}
                className="text-xs text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400 cursor-pointer transition-colors"
              >
                {text.newName}
              </button>
            </div>
          </div>
        ) : !revealed ? (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">{text.empty}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
