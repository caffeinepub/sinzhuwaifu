import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const TOP_COLLECTORS = [
  {
    rank: 1,
    username: "SakuraMaster",
    displayName: "Sakura Master",
    count: 142,
    avatar: "S",
    badge: "🥇",
  },
  {
    rank: 2,
    username: "WaifuKing99",
    displayName: "Waifu King",
    count: 127,
    avatar: "W",
    badge: "🥈",
  },
  {
    rank: 3,
    username: "NightHunter",
    displayName: "Night Hunter",
    count: 118,
    avatar: "N",
    badge: "🥉",
  },
  {
    rank: 4,
    username: "StarCollector",
    displayName: "Star Collector",
    count: 95,
    avatar: "S",
    badge: "",
  },
  {
    rank: 5,
    username: "MoonPrincess",
    displayName: "Moon Princess",
    count: 88,
    avatar: "M",
    badge: "",
  },
  {
    rank: 6,
    username: "AnimeLover",
    displayName: "Anime Lover",
    count: 76,
    avatar: "A",
    badge: "",
  },
  {
    rank: 7,
    username: "DemonSlayer77",
    displayName: "Demon Slayer",
    count: 71,
    avatar: "D",
    badge: "",
  },
  {
    rank: 8,
    username: "CherryBlossom",
    displayName: "Cherry Blossom",
    count: 65,
    avatar: "C",
    badge: "",
  },
  {
    rank: 9,
    username: "IceQueen",
    displayName: "Ice Queen",
    count: 59,
    avatar: "I",
    badge: "",
  },
  {
    rank: 10,
    username: "FireDragon",
    displayName: "Fire Dragon",
    count: 52,
    avatar: "F",
    badge: "",
  },
];

const TOP_ONEX = [
  {
    rank: 1,
    username: "OnexBillionaire",
    displayName: "Onex Billionaire",
    balance: 98450,
    avatar: "O",
    badge: "🥇",
  },
  {
    rank: 2,
    username: "GoldKing",
    displayName: "Gold King",
    balance: 84200,
    avatar: "G",
    badge: "🥈",
  },
  {
    rank: 3,
    username: "CryptoWaifu",
    displayName: "Crypto Waifu",
    balance: 72100,
    avatar: "C",
    badge: "🥉",
  },
  {
    rank: 4,
    username: "DiamondHands",
    displayName: "Diamond Hands",
    balance: 65800,
    avatar: "D",
    badge: "",
  },
  {
    rank: 5,
    username: "RichOtaku",
    displayName: "Rich Otaku",
    balance: 54300,
    avatar: "R",
    badge: "",
  },
  {
    rank: 6,
    username: "NeonGlow",
    displayName: "Neon Glow",
    balance: 43100,
    avatar: "N",
    badge: "",
  },
  {
    rank: 7,
    username: "PinkSakura",
    displayName: "Pink Sakura",
    balance: 38700,
    avatar: "P",
    badge: "",
  },
  {
    rank: 8,
    username: "SilverWolf",
    displayName: "Silver Wolf",
    balance: 31200,
    avatar: "S",
    badge: "",
  },
  {
    rank: 9,
    username: "BlueOrion",
    displayName: "Blue Orion",
    balance: 28900,
    avatar: "B",
    badge: "",
  },
  {
    rank: 10,
    username: "StarDust",
    displayName: "Star Dust",
    balance: 21400,
    avatar: "S",
    badge: "",
  },
];

const TOP_GROUPS = [
  {
    rank: 1,
    name: "Sakura Squad",
    members: 87,
    description: "The original waifu hunters",
    badge: "🥇",
  },
  {
    rank: 2,
    name: "Anime Legends",
    members: 74,
    description: "Legendary collectors unite",
    badge: "🥈",
  },
  {
    rank: 3,
    name: "NightOwls",
    members: 68,
    description: "Hunting through the night",
    badge: "🥉",
  },
  {
    rank: 4,
    name: "Galaxy Hunters",
    members: 55,
    description: "From across the galaxy",
    badge: "",
  },
  {
    rank: 5,
    name: "Cherry Blossoms",
    members: 49,
    description: "Delicate but deadly",
    badge: "",
  },
  {
    rank: 6,
    name: "Cyber Warriors",
    members: 43,
    description: "Future is now",
    badge: "",
  },
  {
    rank: 7,
    name: "Dragon Clan",
    members: 38,
    description: "Born to hunt",
    badge: "",
  },
  {
    rank: 8,
    name: "Moonlight Club",
    members: 31,
    description: "Under the moonlight",
    badge: "",
  },
  {
    rank: 9,
    name: "Frost Guild",
    members: 27,
    description: "Cold and calculated",
    badge: "",
  },
  {
    rank: 10,
    name: "Flame Order",
    members: 22,
    description: "Burning passion",
    badge: "",
  },
];

function RankRow({
  rank,
  name,
  subtitle,
  value,
  valueLabel,
  avatar,
  badge,
  index,
}: {
  rank: number;
  name: string;
  subtitle?: string;
  value: number;
  valueLabel: string;
  avatar: string;
  badge: string;
  index: number;
}) {
  const isTop3 = rank <= 3;
  const rankColors = [
    { bg: "oklch(0.82 0.15 75 / 0.15)", text: "oklch(0.82 0.15 75)" },
    { bg: "oklch(0.75 0.05 290 / 0.15)", text: "oklch(0.78 0.04 290)" },
    { bg: "oklch(0.65 0.10 50 / 0.15)", text: "oklch(0.68 0.10 50)" },
  ];
  const rankColor = rankColors[rank - 1] ?? {
    bg: "oklch(0.16 0.04 290)",
    text: "oklch(0.72 0.04 290)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors"
      data-ocid={`leaderboard.item.${index + 1}`}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{ background: rankColor.bg, color: rankColor.text }}
      >
        {badge || rank}
      </div>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
        style={{
          background: isTop3 ? rankColor.bg : "oklch(0.20 0.05 290)",
          border: `2px solid ${isTop3 ? rankColor.text : "oklch(0.30 0.06 290)"}`,
          color: isTop3 ? rankColor.text : "oklch(0.97 0.01 280)",
        }}
      >
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{name}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p
          className="font-bold text-sm"
          style={{ color: "oklch(0.82 0.15 205)" }}
        >
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">{valueLabel}</p>
      </div>
    </motion.div>
  );
}

type Page =
  | "home"
  | "hunt"
  | "harem"
  | "shop"
  | "daily"
  | "leaderboard"
  | "community"
  | "profile"
  | "admin";
interface LeaderboardProps {
  onNavigate?: (page: Page) => void;
}
export default function Leaderboard({
  onNavigate: _onNavigate,
}: LeaderboardProps) {
  return (
    <main
      className="max-w-3xl mx-auto px-4 py-8"
      data-ocid="leaderboard.section"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-extrabold mb-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.82 0.15 75), oklch(0.82 0.15 205))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            🏆 Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top players across the SinzhuWaifu universe
          </p>
        </div>

        <Tabs defaultValue="collectors">
          <TabsList
            className="w-full mb-6"
            style={{ background: "oklch(0.13 0.035 290)" }}
          >
            <TabsTrigger
              value="collectors"
              className="flex-1"
              data-ocid="leaderboard.collectors.tab"
            >
              🎴 Top Collectors
            </TabsTrigger>
            <TabsTrigger
              value="onex"
              className="flex-1"
              data-ocid="leaderboard.onex.tab"
            >
              💰 Top Onex
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="flex-1"
              data-ocid="leaderboard.groups.tab"
            >
              🌐 Top Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collectors">
            <div className="card-glass rounded-2xl p-2 space-y-1">
              {TOP_COLLECTORS.map((entry, i) => (
                <RankRow
                  key={entry.username}
                  rank={entry.rank}
                  name={entry.displayName}
                  subtitle={`@${entry.username}`}
                  value={entry.count}
                  valueLabel="waifus"
                  avatar={entry.avatar}
                  badge={entry.badge}
                  index={i}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="onex">
            <div className="card-glass rounded-2xl p-2 space-y-1">
              {TOP_ONEX.map((entry, i) => (
                <RankRow
                  key={entry.username}
                  rank={entry.rank}
                  name={entry.displayName}
                  subtitle={`@${entry.username}`}
                  value={entry.balance}
                  valueLabel="Onex"
                  avatar={entry.avatar}
                  badge={entry.badge}
                  index={i}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="groups">
            <div className="card-glass rounded-2xl p-2 space-y-1">
              {TOP_GROUPS.map((entry, i) => (
                <RankRow
                  key={entry.name}
                  rank={entry.rank}
                  name={entry.name}
                  subtitle={entry.description}
                  value={entry.members}
                  valueLabel="members"
                  avatar={entry.name[0]}
                  badge={entry.badge}
                  index={i}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}
