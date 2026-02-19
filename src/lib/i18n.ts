export type Locale = "zh" | "en";

export const HISTORY_TYPES = {
  number: { zh: "随机数", en: "Random Number" },
  decision: { zh: "选择助手", en: "Decision Helper" },
  fortune: { zh: "今日运势", en: "Daily Fortune" },
  lottery: { zh: "抽奖", en: "Lottery" },
  coin: { zh: "抛硬币", en: "Coin Flip" },
  dice: { zh: "掷骰子", en: "Dice Roll" },
  team: { zh: "随机分组", en: "Team Splitter" },
} as const;
