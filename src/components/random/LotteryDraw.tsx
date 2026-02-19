"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  addHistory,
  getLotteryPool,
  saveLotteryPool,
  clearLotteryPool,
} from "@/lib/storage";
import { Download, Gift, Plus, RotateCcw, X } from "lucide-react";

const WHEEL_COLORS = [
  "#dc2626", "#b91c1c", "#ef4444", "#f87171",
  "#c084fc", "#a855f7", "#fb923c", "#f59e0b",
];
// Proportional easing factor for wheel-stop-at-target animation
const EASE_FACTOR = 0.03;
const MIN_SPEED = 0.3;
const STOP_THRESHOLD = 1; // degrees remaining before snapping to target

export default function LotteryDraw({ onUpdate }: { onUpdate: () => void }) {
  const [pool, setPool] = useState<{
    participants: string[];
    drawn: string[];
    prizeWinners: Record<string, string[]>;
  }>({ participants: [], drawn: [], prizeWinners: {} });
  const [input, setInput] = useState("");
  const [prizeInput, setPrizeInput] = useState("一等奖:1\n二等奖:2\n三等奖:3");
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerPrize, setWinnerPrize] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [wheelRot, setWheelRot] = useState(0);
  const wheelRotRef = useRef(0);
  const wheelRafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadPool = useCallback(() => {
    setPool(getLotteryPool());
  }, []);

  useEffect(() => {
    loadPool();
  }, [loadPool]);

  // Draw the wheel on the canvas whenever participants or rotation changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width; // 352px canvas → displayed at 176px via w-full h-full (2× for HiDPI)
    const cx = size / 2;
    const cy = size / 2;
    const r = cx - 8;
    const n = pool.participants.length;
    ctx.clearRect(0, 0, size, size);
    if (n === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = "#dc2626";
      ctx.fill();
      return;
    }
    const step = (2 * Math.PI) / n;
    // Start from top (12 o'clock = -π/2 in canvas) and add rotation
    const rotRad = (wheelRot * Math.PI) / 180 - Math.PI / 2;
    for (let i = 0; i < n; i++) {
      const startAngle = rotRad + i * step;
      const endAngle = startAngle + step;
      const midAngle = startAngle + step / 2;
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Draw participant name
      const maxChars = n > 10 ? 3 : n > 6 ? 4 : 5;
      const displayName = pool.participants[i].length > maxChars
        ? pool.participants[i].substring(0, maxChars)
        : pool.participants[i];
      const fontSize = Math.max(16, Math.min(28, (r * 1.5) / n));
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midAngle);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 3;
      ctx.fillStyle = "white";
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(displayName, r - 12, 0);
      ctx.restore();
    }
  }, [pool.participants, wheelRot]);

  useEffect(() => {
    return () => {
      if (wheelRafRef.current !== null) cancelAnimationFrame(wheelRafRef.current);
    };
  }, []);

  const addParticipant = () => {
    const names = input
      .split(/[,，\n]/)
      .map((s) => s.trim())
      .filter((s) => s);
    if (names.length === 0) return;
    const next = {
      ...pool,
      participants: [...new Set([...pool.participants, ...names])],
    };
    setPool(next);
    saveLotteryPool(next);
    setInput("");
  };

  const removeParticipant = (name: string) => {
    const nextPrizeWinners = Object.fromEntries(
      Object.entries(pool.prizeWinners).map(([prize, winners]) => [
        prize,
        winners.filter((w) => w !== name),
      ])
    );
    const next = {
      participants: pool.participants.filter((p) => p !== name),
      drawn: pool.drawn.filter((d) => d !== name),
      prizeWinners: nextPrizeWinners,
    };
    setPool(next);
    saveLotteryPool(next);
  };

  const drawByPrizes = () => {
    const prizeConfigs = prizeInput
      .split(/\n|,|，/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, count] = line.split(/[:：]/).map((s) => s.trim());
        return { name, count: Number.parseInt(count || "0", 10) };
      })
      .filter((item) => item.name && Number.isFinite(item.count) && item.count > 0);

    if (prizeConfigs.length === 0) return;
    const nextDrawn = [...pool.drawn];
    const nextPrizeWinners: Record<string, string[]> = { ...pool.prizeWinners };

    for (const prize of prizeConfigs) {
      const available = pool.participants.filter((p) => !nextDrawn.includes(p));
      if (available.length === 0) break;
      const drawCount = Math.min(prize.count, available.length);
      const winners: string[] = [];
      for (let i = 0; i < drawCount; i++) {
        const index = Math.floor(Math.random() * available.length);
        const selected = available.splice(index, 1)[0];
        winners.push(selected);
        nextDrawn.push(selected);
      }
      if (winners.length > 0) {
        nextPrizeWinners[prize.name] = [
          ...(nextPrizeWinners[prize.name] || []),
          ...winners,
        ];
      }
    }

    if (nextDrawn.length === pool.drawn.length) return;
    const next = {
      ...pool,
      drawn: nextDrawn,
      prizeWinners: nextPrizeWinners,
    };
    setPool(next);
    saveLotteryPool(next);
    const prizeResult = Object.entries(nextPrizeWinners)
      .filter(([, winners]) => winners.length > 0)
      .map(([prize, winners]) => `${prize}: ${winners.join("、")}`)
      .join("；");
    setWinner(prizeResult);
    addHistory({
      type: "抽奖",
      result: "按奖项抽奖完成",
      detail: `已抽出 ${next.drawn.length}/${next.participants.length} 人`,
    });
    onUpdate();
  };

  const draw = () => {
    const available = pool.participants.filter(
      (p) => !pool.drawn.includes(p)
    );
    if (available.length === 0) return;

    // Determine the next unfilled prize slot
    const prizeConfigs = prizeInput
      .split(/\n|,|，/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, count] = line.split(/[:：]/).map((s) => s.trim());
        return { name, count: Number.parseInt(count || "0", 10) };
      })
      .filter((item) => item.name && Number.isFinite(item.count) && item.count > 0);

    const nextPrize = prizeConfigs.find(
      (pc) => (pool.prizeWinners[pc.name]?.length || 0) < pc.count
    );

    // Pre-select winner and compute target rotation so wheel lands on winner's segment
    const winnerIndex = Math.floor(Math.random() * available.length);
    const final = available[winnerIndex];
    const n = available.length;
    const segStep = 360 / n;
    const segMid = (winnerIndex + 0.5) * segStep; // middle of winner segment (degrees from top)
    const currentNorm = ((wheelRotRef.current % 360) + 360) % 360;
    let extraAngle = segMid - currentNorm;
    if (extraAngle < 0) extraAngle += 360;
    // At least 2 full spins (720°) plus the extra angle to reach winner's segment
    const targetRot = wheelRotRef.current + 720 + extraAngle;

    setAnimating(true);
    setWinner(null);
    setWinnerPrize(null);

    if (wheelRafRef.current !== null) cancelAnimationFrame(wheelRafRef.current);
    const spinTick = () => {
      const remaining = targetRot - wheelRotRef.current;
      if (remaining <= STOP_THRESHOLD) {
        // Snap to exact target so the pointer lands on winner's segment
        wheelRotRef.current = targetRot;
        setWheelRot(targetRot);
        // Wheel has stopped – now reveal the winner
        const nextDrawn = [...pool.drawn, final];
        const nextPrizeWinners = { ...pool.prizeWinners };
        if (nextPrize) {
          nextPrizeWinners[nextPrize.name] = [
            ...(nextPrizeWinners[nextPrize.name] || []),
            final,
          ];
        }
        const next = {
          ...pool,
          drawn: nextDrawn,
          prizeWinners: nextPrizeWinners,
        };
        setPool(next);
        saveLotteryPool(next);
        setWinner(final);
        setWinnerPrize(nextPrize?.name || null);
        setAnimating(false);
        addHistory({
          type: "抽奖",
          result: final,
          detail: nextPrize
            ? `奖项: ${nextPrize.name}, 参与者: ${pool.participants.length}人`
            : `参与者: ${pool.participants.length}人, 已抽: ${nextDrawn.length}人`,
        });
        onUpdate();
      } else {
        // Proportional easing: fast start, slow near target
        const speed = Math.max(MIN_SPEED, remaining * EASE_FACTOR);
        wheelRotRef.current += speed;
        setWheelRot(wheelRotRef.current);
        wheelRafRef.current = requestAnimationFrame(spinTick);
      }
    };
    wheelRafRef.current = requestAnimationFrame(spinTick);
  };

  const resetDraw = () => {
    const next = { ...pool, drawn: [], prizeWinners: {} };
    setPool(next);
    saveLotteryPool(next);
    setWinner(null);
    setWinnerPrize(null);
  };

  const clearAll = () => {
    clearLotteryPool();
    setPool({ participants: [], drawn: [], prizeWinners: {} });
    setWinner(null);
    setWinnerPrize(null);
  };

  const exportWinners = () => {
    const lines = Object.entries(pool.prizeWinners)
      .filter(([, winners]) => winners.length > 0)
      .map(([prize, winners]) => `${prize},${winners.join(",")}`);
    if (lines.length === 0) return;
    const blob = new Blob([`\uFEFF奖项,名单\n${lines.join("\n")}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lottery-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const available = pool.participants.filter(
    (p) => !pool.drawn.includes(p)
  );

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Gift className="w-5 h-5 text-red-400" />
          抽奖系统
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            添加参与者（逗号分隔）
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addParticipant()}
              placeholder="张三, 李四, 王五..."
              className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Button
              onClick={addParticipant}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">奖项设置（每行 奖项:人数）</label>
          <textarea
            value={prizeInput}
            onChange={(e) => setPrizeInput(e.target.value)}
            placeholder="一等奖:1"
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {pool.participants.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              参与者 ({available.length}/{pool.participants.length} 可抽)
            </p>
            <div className="flex flex-wrap gap-2">
              {pool.participants.map((p) => {
                const isDrawn = pool.drawn.includes(p);
                return (
                  <span
                    key={p}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${
                      isDrawn
                        ? "bg-gray-700 text-gray-500 line-through"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    {p}
                    {!isDrawn && (
                      <button
                        onClick={() => removeParticipant(p)}
                        className="text-gray-400 hover:text-red-400 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={draw}
            disabled={animating || available.length === 0}
            className="flex-1 min-w-[120px] bg-red-600 hover:bg-red-700 text-white cursor-pointer"
          >
            {animating
              ? "抽奖中..."
              : available.length === 0
              ? "全部已抽完"
              : "🎉 开始抽奖"}
          </Button>
          <Button
            onClick={drawByPrizes}
            disabled={available.length === 0}
            variant="outline"
            className="flex-1 min-w-[100px] border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
          >
            按奖项抽取
          </Button>
          {pool.drawn.length > 0 && (
            <Button
              onClick={resetDraw}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          {pool.participants.length > 0 && (
            <Button
              onClick={clearAll}
              variant="outline"
              className="border-gray-600 text-red-400 hover:bg-gray-800 cursor-pointer"
            >
              清空
            </Button>
          )}
          {Object.values(pool.prizeWinners).some((winners) => winners.length > 0) && (
            <Button
              onClick={exportWinners}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>

        {pool.participants.length > 0 && (
          <div className="relative mx-auto w-44 h-44">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[18px] border-l-transparent border-r-transparent border-t-yellow-400" />
            <canvas
              ref={canvasRef}
              width={352}
              height={352}
              className="w-full h-full rounded-full border-4 border-red-700 shadow-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-gray-900 border-2 border-red-500 flex items-center justify-center">
                <Gift className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        )}

        {winner && !animating && (
          <div className="text-center py-6 rounded-lg border bg-gradient-to-b from-gray-800 to-red-950 border-red-800">
            <p className="text-sm text-gray-400 mb-2">🎊 恭喜中奖</p>
            <p className="text-4xl font-bold text-red-400">
              {winner}
            </p>
            {winnerPrize && (
              <span className="inline-block mt-2 px-3 py-1 bg-red-700/50 text-red-200 rounded-full text-sm font-medium">
                🏆 {winnerPrize}
              </span>
            )}
          </div>
        )}

        {pool.drawn.length > 0 && (
          <div className="text-xs text-gray-500">
            已抽出: {pool.drawn.join(", ")}
          </div>
        )}
        {Object.entries(pool.prizeWinners).some(([, winners]) => winners.length > 0) && (
          <div className="space-y-2 bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400 font-medium">🏆 中奖名单</p>
            {Object.entries(pool.prizeWinners).map(
              ([prize, winners]) =>
                winners.length > 0 && (
                  <div key={prize} className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-yellow-400 font-medium shrink-0">{prize}:</span>
                    <div className="flex flex-wrap gap-1">
                      {winners.map((w) => (
                        <span key={w} className="px-2 py-0.5 bg-red-700/40 text-red-200 rounded text-sm">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
