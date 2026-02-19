"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/storage";
import { Users, Plus, X } from "lucide-react";
import { HISTORY_TYPES, type Locale } from "@/lib/i18n";

export default function TeamSplitter({ onUpdate, locale }: { onUpdate: () => void; locale: Locale }) {
  const [input, setInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);

  const text = {
    zh: {
      title: "随机分组",
      addLabel: "添加成员（逗号分隔）",
      addPlaceholder: "成员1, 成员2, 成员3...",
      groupCount: "分成几组",
      action: "🔀 随机分组",
      clear: "清空",
      group: "第",
      people: "人",
      detailGroup: "组",
    },
    en: {
      title: "Team Splitter",
      addLabel: "Add members (comma-separated)",
      addPlaceholder: "Member 1, Member 2, Member 3...",
      groupCount: "Number of groups",
      action: "🔀 Split Randomly",
      clear: "Clear",
      group: "Group",
      people: "members",
      detailGroup: "groups",
    },
  }[locale];

  const addMembers = () => {
    const names = input
      .split(/[,，\n]/)
      .map((s) => s.trim())
      .filter((s) => s);
    if (names.length === 0) return;
    setMembers([...new Set([...members, ...names])]);
    setInput("");
  };

  const removeMember = (name: string) => {
    setMembers(members.filter((m) => m !== name));
  };

  const splitTeams = () => {
    const shuffled = [...members];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const result: string[][] = Array.from({ length: teamCount }, () => []);
    shuffled.forEach((m, i) => result[i % teamCount].push(m));
    setTeams(result);
    addHistory({
      type: HISTORY_TYPES.team[locale],
      result: `${teamCount} ${text.detailGroup}`,
      detail: result
        .map((t, i) =>
          locale === "zh"
            ? `第${i + 1}组: ${t.join(", ")}`
            : `Group ${i + 1}: ${t.join(", ")}`
        )
        .join(" | "),
    });
    onUpdate();
  };

  const clearAll = () => {
    setMembers([]);
    setTeams([]);
  };

  const TEAM_COLORS = [
    "border-blue-500 bg-blue-500/10",
    "border-red-500 bg-red-500/10",
    "border-green-500 bg-green-500/10",
    "border-yellow-500 bg-yellow-500/10",
    "border-purple-500 bg-purple-500/10",
    "border-pink-500 bg-pink-500/10",
  ];

  return (
    <Card className="bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Users className="w-5 h-5 text-teal-500 dark:text-teal-400" />
          {text.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">{text.addLabel}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMembers()}
              placeholder={text.addPlaceholder}
              className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Button
              onClick={addMembers}
              className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {members.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {m}
                  <button
                    onClick={() => removeMember(m)}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                {text.groupCount}
              </label>
              <div className="flex items-center gap-2">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setTeamCount(n)}
                    disabled={n > members.length}
                    className={`w-9 h-9 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                      teamCount === n
                        ? "bg-teal-600 text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={splitTeams}
                disabled={members.length < teamCount}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
              >
                {text.action}
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                className="border-gray-400 dark:border-gray-600 text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                {text.clear}
              </Button>
            </div>
          </>
        )}

        {teams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map((team, i) => (
              <div
                key={i}
                className={`border rounded-lg p-3 ${TEAM_COLORS[i % TEAM_COLORS.length]}`}
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {locale === "zh"
                    ? `第 ${i + 1} 组 (${team.length}${text.people})`
                    : `Group ${i + 1} (${team.length} ${text.people})`}
                </p>
                <div className="flex flex-wrap gap-1">
                  {team.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-0.5 rounded bg-white/70 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
