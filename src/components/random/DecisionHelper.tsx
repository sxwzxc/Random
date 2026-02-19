"use client";

import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/storage";
import { HelpCircle, Plus, X } from "lucide-react";
import { HISTORY_TYPES, type Locale } from "@/lib/i18n";

const STOP_THRESHOLD = 0.15;
const MIN_SPIN_SPEED = 2;
const MS_PER_FRAME = 16.67;
const ANGLE_NORMALIZATION_OFFSET = 540;
const MIN_DRAG_DELTA = 0.1;
const MIN_CLICK_SPEED = 18;
const MAX_CLICK_SPEED = 32;
const DECEL_BASE = 0.975;
const DECEL_RANGE = 0.02;
const DECEL_SPEED_SCALE = 15;

export default function DecisionHelper({
  onUpdate,
  locale,
}: {
  onUpdate: () => void;
  locale: Locale;
}) {
  const [options, setOptions] = useState([
    { text: "", weight: 1 },
    { text: "", weight: 1 },
  ]);
  const [result, setResult] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [readyToSpin, setReadyToSpin] = useState(false);
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef(0);
  const dragRef = useRef({
    dragging: false,
    moved: false,
    lastAngle: 0,
    lastTime: 0,
    velocity: 0,
    centerX: 0,
    centerY: 0,
  });

  const text = {
    zh: {
      title: "选择困难助手",
      intro: "输入选项，让命运帮你做出选择！",
      option: "选项",
      weight: "比重",
      add: "添加选项",
      spinning: "转盘旋转中...",
      ready: "请点击或拖动转盘施加初速度",
      start: "开始转盘",
      tip: "在转盘上点击或拖动后松手，系统会按你的手势速度继续旋转",
      result: "命运之选",
      detail: "选项",
    },
    en: {
      title: "Decision Helper",
      intro: "Enter options and let fate decide.",
      option: "Option",
      weight: "Weight",
      add: "Add Option",
      spinning: "Spinning...",
      ready: "Click or drag the wheel to launch",
      start: "Start Wheel",
      tip: "Click or drag the wheel, then release to keep spinning",
      result: "Chosen by Fate",
      detail: "Options",
    },
  }[locale];

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
    const normalized = ((360 - angle) % 360 + 360) % 360;
    let accumulated = 0;
    for (const item of valid) {
      accumulated += (item.weight / totalWeight) * 360;
      if (normalized < accumulated) return item.text;
    }
    return valid[valid.length - 1]?.text ?? null;
  };

  const getPointerAngle = (
    clientX: number,
    clientY: number,
    centerX: number,
    centerY: number
  ) => {
    return (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI;
  };

  const decide = (speed: number) => {
    if (valid.length < 2 || animating) return;
    setAnimating(true);
    setReadyToSpin(false);
    const totalWeight = valid.reduce((sum, item) => sum + item.weight, 0);
    let current = rotationRef.current;
    let velocity = speed;
    if (Math.abs(velocity) < MIN_SPIN_SPEED)
      velocity = velocity >= 0 ? MIN_SPIN_SPEED : -MIN_SPIN_SPEED;

    const tick = () => {
      current += velocity;
      const speed = Math.abs(velocity);
      velocity *= DECEL_BASE + DECEL_RANGE * Math.min(1, speed / DECEL_SPEED_SCALE);
      rotationRef.current = current;
      setRotation(current);

      if (Math.abs(velocity) > STOP_THRESHOLD) {
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
        type: HISTORY_TYPES.decision[locale],
        result: final,
        detail: `${text.detail}: ${valid
          .map((item) => `${item.text}(${item.weight}/${totalWeight})`)
          .join(", ")}`,
      });
      onUpdate();
    };

    requestAnimationFrame(tick);
  };

  const wheelBackground = useMemo(() => {
    if (!valid.length) return "conic-gradient(#9ca3af 0deg 360deg)";
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
    <Card className="bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <HelpCircle className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          {text.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">{text.intro}</p>
        <div className="relative mx-auto w-56 h-56">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[18px] border-l-transparent border-r-transparent border-t-yellow-400" />
          <div
            className={`w-full h-full rounded-full border-4 border-gray-400 dark:border-gray-700 shadow-lg ${
              animating
                ? "cursor-grabbing"
                : readyToSpin
                ? "cursor-grab"
                : "cursor-default"
            }`}
            style={{
              background: wheelBackground,
              transform: `rotate(${rotation}deg)`,
              touchAction: readyToSpin ? "none" : "auto",
            }}
            id="decision-wheel"
            ref={wheelRef}
            onPointerDown={(e) => {
              if (!readyToSpin || animating) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const angle = getPointerAngle(
                e.clientX,
                e.clientY,
                centerX,
                centerY
              );
              dragRef.current = {
                dragging: true,
                moved: false,
                lastAngle: angle,
                lastTime: performance.now(),
                velocity: 0,
                centerX,
                centerY,
              };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!dragRef.current.dragging || animating) return;
              const angle = getPointerAngle(
                e.clientX,
                e.clientY,
                dragRef.current.centerX,
                dragRef.current.centerY
              );
              const delta =
                ((angle - dragRef.current.lastAngle + ANGLE_NORMALIZATION_OFFSET) %
                  360) -
                180;
              const now = performance.now();
              const dt = Math.max(now - dragRef.current.lastTime, 1);
              const velocity = delta / (dt / MS_PER_FRAME);
              rotationRef.current += delta;
              setRotation(rotationRef.current);
              dragRef.current = {
                dragging: true,
                moved: dragRef.current.moved || Math.abs(delta) > MIN_DRAG_DELTA,
                lastAngle: angle,
                lastTime: now,
                velocity,
                centerX: dragRef.current.centerX,
                centerY: dragRef.current.centerY,
              };
            }}
            onPointerUp={(e) => {
              if (!dragRef.current.dragging || animating) return;
              e.currentTarget.releasePointerCapture(e.pointerId);
              const launchSpeed = dragRef.current.moved
                ? dragRef.current.velocity
                : MIN_CLICK_SPEED +
                  Math.random() * (MAX_CLICK_SPEED - MIN_CLICK_SPEED);
              dragRef.current.dragging = false;
              decide(launchSpeed);
            }}
            onPointerCancel={(e) => {
              if (!dragRef.current.dragging || animating) return;
              e.currentTarget.releasePointerCapture(e.pointerId);
              dragRef.current.dragging = false;
              setReadyToSpin(false);
            }}
          />
        </div>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={opt.text}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`${text.option} ${i + 1}`}
              className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="number"
              min="0"
              step="0.1"
              value={opt.weight}
              onChange={(e) => updateWeight(i, e.target.value)}
              className="w-20 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label={`${text.option} ${i + 1} ${text.weight}`}
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(i)}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addOption}
          className="w-full border-dashed border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" />
          {text.add}
        </Button>
        <Button
          onClick={() => {
            setResult(null);
            setReadyToSpin(true);
          }}
          disabled={animating || valid.length < 2 || readyToSpin}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
        >
          {animating ? text.spinning : readyToSpin ? text.ready : text.start}
        </Button>
        {readyToSpin && !animating && (
          <p className="text-xs text-center text-gray-600 dark:text-gray-400">{text.tip}</p>
        )}
        {result && (
          <div className="text-center py-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{text.result}</p>
            <p
              className={`text-3xl font-bold text-purple-500 dark:text-purple-400 transition-all ${
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
