import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { getRankForCount } from "../data/seedData";

interface TopPageProps {
  onNavigate: (page: string) => void;
}

const MOCK_TOP = [
  { name: "ShadowHunter", count: 4520 },
  { name: "WaifuKing99", count: 3890 },
  { name: "Celestia_X", count: 2740 },
  { name: "NovaBlade", count: 2150 },
  { name: "MoonlitSoul", count: 1680 },
  { name: "StarForge", count: 1230 },
  { name: "DragonReign", count: 890 },
  { name: "SilverRose", count: 620 },
  { name: "AzureWing", count: 380 },
  { name: "CrimsonDawn", count: 240 },
];

export default function TopPage({ onNavigate }: TopPageProps) {
  return (
    <div className="flex flex-col h-full" style={{ background: "#17212b" }}>
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: "#1c2733" }}
      >
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="p-1.5 rounded-full"
          style={{ color: "#8eacbb" }}
          data-ocid="top.back.button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#e8f4fd" }}>
          🏆 Top Waifu Collectors
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {MOCK_TOP.map((user, i) => {
          const rank = getRankForCount(user.count);
          const isTop3 = i < 3;
          const medals = ["🥇", "🥈", "🥉"];
          return (
            <motion.div
              key={user.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: isTop3 ? `${rank.color}15` : "#1c2733",
                border: isTop3
                  ? `1px solid ${rank.color}40`
                  : "1px solid transparent",
              }}
              data-ocid={`top.collector.item.${i + 1}`}
            >
              <span className="text-xl w-8 text-center">
                {isTop3 ? medals[i] : `${i + 1}.`}
              </span>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "#e8f4fd" }}>
                  {user.name}
                </p>
                <p className="text-xs" style={{ color: rank.color }}>
                  {rank.icon} {rank.name}
                </p>
              </div>
              <span className="font-bold text-sm" style={{ color: "#FFD700" }}>
                {user.count.toLocaleString()} 💝
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
