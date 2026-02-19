import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "随机万事屋 - 随机数 · 选择助手 · 运势 · 抽奖",
  description: "随机万事屋：随机数生成、选择困难助手、今日运势、抽奖系统、抛硬币、掷骰子、随机分组，帮你做出所有随机决定。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/globe.svg" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
