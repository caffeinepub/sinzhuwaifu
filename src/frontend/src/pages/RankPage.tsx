import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { RANK_TIERS, getRankForCount } from "../data/seedData";

interface RankPageProps {
  onNavigate: (page: string) => void;
}

export default function RankPage({ onNavigate }: RankPageProps) {
  const localHarem: { id: string }[] = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("sinzhu_harem") || "null") ?? [
          { id: "waifu-001" },
          { id: "waifu-002" },
          { id: "waifu-004" },
          { id: "waifu-005" },
        ]
      );
    } catch {
      return [];
    }
  })();

  const count = localHarem.length;
  const currentRank = getRankForCount(count);
  const currentIndex = RANK_TIERS.findIndex((t) => t.name === currentRank.name);
  const nextRank = RANK_TIERS[currentIndex + 1] ?? null;
  const progress = nextRank
    ? ((count - currentRank.minCount) /
        (nextRank.minCount - currentRank.minCount)) *
      100
    : 100;

  return (
    <div className="flex flex-col h-full" style={{ background: "#17212b" }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: "#1c2733" }}
      >
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="p-1.5 rounded-full transition-colors"
          style={{ color: "#8eacbb" }}
          data-ocid="rank.back.button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#e8f4fd" }}>
          🐲 Your Rank
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Current Rank Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-6 text-center"
          style={{
            background: "#1c2733",
            border: `2px solid ${currentRank.color}40`,
          }}
        >
          <div className="text-6xl mb-3">{currentRank.icon}</div>
          <h2
            className="text-2xl font-extrabold mb-1"
            style={{ color: currentRank.color }}
          >
            {currentRank.name}
          </h2>
          <p className="text-sm mb-4" style={{ color: "#8eacbb" }}>
            {count} waifus collected
          </p>

          {nextRank ? (
            <div className="space-y-2">
              <div
                className="flex justify-between text-xs"
                style={{ color: "#8eacbb" }}
              >
                <span>{currentRank.name}</span>
                <span>
                  {nextRank.name} — {nextRank.minCount} needed
                </span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-2" />
              <p className="text-xs" style={{ color: "#5288c1" }}>
                {nextRank.minCount - count} more waifus to reach {nextRank.name}
              </p>
            </div>
          ) : (
            <p className="text-sm font-bold" style={{ color: "#FFD700" }}>
              🏆 MAX RANK ACHIEVED!
            </p>
          )}
        </motion.div>

        {/* Rank Tiers List */}
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: "#4a6278" }}
          >
            All Ranks
          </h3>
          <div className="space-y-1.5">
            {RANK_TIERS.map((tier, i) => {
              const isCurrentRank = tier.name === currentRank.name;
              const unlocked = count >= tier.minCount;
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{
                    background: isCurrentRank ? `${tier.color}20` : "#1c2733",
                    border: isCurrentRank
                      ? `1px solid ${tier.color}60`
                      : "1px solid transparent",
                    opacity: unlocked ? 1 : 0.4,
                  }}
                >
                  <span className="text-xl w-8 text-center">{tier.icon}</span>
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: isCurrentRank ? tier.color : "#e8f4fd" }}
                    >
                      {tier.name}
                      {isCurrentRank && (
                        <span
                          className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: tier.color, color: "#0e1621" }}
                        >
                          YOU
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs" style={{ color: "#4a6278" }}>
                    {tier.minCount}+
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
