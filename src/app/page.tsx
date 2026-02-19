"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dices,
  HelpCircle,
  Star,
  Gift,
  Coins,
  Dice1,
  Users,
  History,
  Shuffle,
  Github,
  Languages,
  Moon,
  Sun,
} from "lucide-react";
import RandomNumber from "@/components/random/RandomNumber";
import DecisionHelper from "@/components/random/DecisionHelper";
import DailyFortune from "@/components/random/DailyFortune";
import LotteryDraw from "@/components/random/LotteryDraw";
import CoinFlip from "@/components/random/CoinFlip";
import DiceRoll from "@/components/random/DiceRoll";
import TeamSplitter from "@/components/random/TeamSplitter";
import HistoryPanel from "@/components/random/HistoryPanel";
import { getHistory, type HistoryRecord } from "@/lib/storage";
import type { Locale } from "@/lib/i18n";

type Theme = "light" | "dark";

const TABS = [
  {
    id: "number",
    label: { zh: "随机数", en: "Random" },
    icon: Dices,
    color: "text-blue-400",
  },
  {
    id: "decision",
    label: { zh: "选择助手", en: "Decision" },
    icon: HelpCircle,
    color: "text-purple-400",
  },
  {
    id: "fortune",
    label: { zh: "今日运势", en: "Fortune" },
    icon: Star,
    color: "text-yellow-400",
  },
  {
    id: "lottery",
    label: { zh: "抽奖", en: "Lottery" },
    icon: Gift,
    color: "text-red-400",
  },
  {
    id: "coin",
    label: { zh: "抛硬币", en: "Coin" },
    icon: Coins,
    color: "text-amber-400",
  },
  {
    id: "dice",
    label: { zh: "掷骰子", en: "Dice" },
    icon: Dice1,
    color: "text-green-400",
  },
  {
    id: "team",
    label: { zh: "随机分组", en: "Team" },
    icon: Users,
    color: "text-teal-400",
  },
  {
    id: "history",
    label: { zh: "历史记录", en: "History" },
    icon: History,
    color: "text-gray-400",
  },
] as const;

const COPY = {
  zh: {
    title: "随机万事屋",
    subtitle: "当你犹豫不决的时候，让随机来帮你做决定",
    language: "语言",
    theme: "主题",
    dark: "深色",
    light: "浅色",
    madeBy: "Made by",
  },
  en: {
    title: "Random Utility Hub",
    subtitle: "Let randomness help when you are undecided.",
    language: "Language",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    madeBy: "Made by",
  },
} as const;

export default function Home() {
  const [activeTab, setActiveTab] = useState("number");
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [locale, setLocale] = useState<Locale>("zh");
  const [theme, setTheme] = useState<Theme>("dark");

  const t = COPY[locale];

  const refreshHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    const storedLocale = localStorage.getItem("app_locale");
    if (storedLocale === "zh" || storedLocale === "en") {
      setLocale(storedLocale);
    }
    const storedTheme = localStorage.getItem("app_theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
      return;
    }
    setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  useEffect(() => {
    localStorage.setItem("app_locale", locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  useEffect(() => {
    localStorage.setItem("app_theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const renderContent = () => {
    switch (activeTab) {
      case "number":
        return <RandomNumber onUpdate={refreshHistory} locale={locale} />;
      case "decision":
        return <DecisionHelper onUpdate={refreshHistory} locale={locale} />;
      case "fortune":
        return <DailyFortune onUpdate={refreshHistory} locale={locale} />;
      case "lottery":
        return <LotteryDraw onUpdate={refreshHistory} locale={locale} />;
      case "coin":
        return <CoinFlip onUpdate={refreshHistory} locale={locale} />;
      case "dice":
        return <DiceRoll onUpdate={refreshHistory} locale={locale} />;
      case "team":
        return <TeamSplitter onUpdate={refreshHistory} locale={locale} />;
      case "history":
        return <HistoryPanel records={history} onClear={refreshHistory} locale={locale} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-black dark:text-white transition-colors">
      <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <Shuffle className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <h1 className="text-lg font-semibold">{t.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs sm:text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
                aria-label={t.language}
              >
                <Languages className="w-4 h-4" />
                <span>{locale === "zh" ? "中文" : "EN"}</span>
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs sm:text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
                aria-label={t.theme}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === "dark" ? t.light : t.dark}</span>
              </button>
              <a
                href="https://github.com/sxwzxc/Random"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                <Github className="w-5 h-5" />
                <span className="hidden sm:inline">sxwzxc/Random</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="text-center py-8 sm:py-12 px-4">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          {t.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">{t.subtitle}</p>
      </div>

      <div className="sticky top-[53px] bg-white/90 dark:bg-black/90 backdrop-blur-sm z-40 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? tab.color : ""}`} />
                  {tab.label[locale]}
                  {tab.id === "history" && history.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {history.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">{renderContent()}</main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-gray-600 dark:text-gray-500 text-sm">
            <span>
              {t.madeBy}{" "}
              <a href="https://github.com/sxwzxc" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                sxwzxc
              </a>
            </span>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-700">·</span>
            <a
              href="https://github.com/sxwzxc/Random"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-700 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
