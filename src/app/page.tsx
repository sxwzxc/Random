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

const TABS = [
  { id: "number", label: "随机数", icon: Dices, color: "text-blue-400" },
  { id: "decision", label: "选择助手", icon: HelpCircle, color: "text-purple-400" },
  { id: "fortune", label: "今日运势", icon: Star, color: "text-yellow-400" },
  { id: "lottery", label: "抽奖", icon: Gift, color: "text-red-400" },
  { id: "coin", label: "抛硬币", icon: Coins, color: "text-amber-400" },
  { id: "dice", label: "掷骰子", icon: Dice1, color: "text-green-400" },
  { id: "team", label: "随机分组", icon: Users, color: "text-teal-400" },
  { id: "history", label: "历史记录", icon: History, color: "text-gray-400" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("number");
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const refreshHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const renderContent = () => {
    switch (activeTab) {
      case "number":
        return <RandomNumber onUpdate={refreshHistory} />;
      case "decision":
        return <DecisionHelper onUpdate={refreshHistory} />;
      case "fortune":
        return <DailyFortune onUpdate={refreshHistory} />;
      case "lottery":
        return <LotteryDraw onUpdate={refreshHistory} />;
      case "coin":
        return <CoinFlip onUpdate={refreshHistory} />;
      case "dice":
        return <DiceRoll onUpdate={refreshHistory} />;
      case "team":
        return <TeamSplitter onUpdate={refreshHistory} />;
      case "history":
        return <HistoryPanel records={history} onClear={refreshHistory} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 bg-black/90 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shuffle className="w-6 h-6 text-blue-400" />
              <h1 className="text-lg font-semibold">随机万事屋</h1>
            </div>
            <a
              href="https://pages.edgeone.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <img
                src="/eo-logo-blue.svg"
                alt="EdgeOne"
                width={20}
                height={20}
              />
              <span className="hidden sm:inline">EdgeOne Pages</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="text-center py-8 sm:py-12 px-4">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          随机万事屋
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          当你犹豫不决的时候，让随机来帮你做决定
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-[53px] bg-black/90 backdrop-blur-sm z-40 border-b border-gray-800">
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
                      ? "bg-gray-800 text-white"
                      : "text-gray-500 hover:text-gray-300 hover:bg-gray-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? tab.color : ""}`}
                  />
                  {tab.label}
                  {tab.id === "history" && history.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-gray-700 text-gray-400">
                      {history.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>Powered by EdgeOne Pages</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
