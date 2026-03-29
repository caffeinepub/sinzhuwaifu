import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SEED_WAIFUS } from "../data/seedData";

interface TreasurePageProps {
  onNavigate: (page: string) => void;
}

const TREASURE_KEY = "sinzhu_daily_treasure";
const COOLDOWN = 24 * 60 * 60 * 1000;

function canClaim() {
  const last = Number.parseInt(localStorage.getItem(TREASURE_KEY) || "0", 10);
  return Date.now() - last >= COOLDOWN;
}

function formatCountdown() {
  const last = Number.parseInt(localStorage.getItem(TREASURE_KEY) || "0", 10);
  const remaining = COOLDOWN - (Date.now() - last);
  if (remaining <= 0) return "Ready!";
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  return `${h}h ${m}m`;
}

type Reward =
  | { type: "onex"; amount: number }
  | { type: "waifu"; name: string; rarity: string };

export default function TreasurePage({ onNavigate }: TreasurePageProps) {
  const [available, setAvailable] = useState(canClaim);
  const [countdown, setCountdown] = useState(formatCountdown);
  const [claiming, setClaiming] = useState(false);
  const [reward, setReward] = useState<Reward | null>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAvailable(canClaim());
      setCountdown(formatCountdown());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = async () => {
    if (!available) return;
    setClaiming(true);
    await new Promise((r) => setTimeout(r, 800));
    const roll = Math.random();
    let result: Reward;
    if (roll < 0.6) {
      result = { type: "onex", amount: Math.floor(Math.random() * 451) + 50 };
    } else {
      const w = SEED_WAIFUS[Math.floor(Math.random() * SEED_WAIFUS.length)];
      result = { type: "waifu", name: w.name, rarity: w.rarity };
    }
    localStorage.setItem(TREASURE_KEY, Date.now().toString());
    setReward(result);
    setOpened(true);
    setAvailable(false);
    setCountdown(formatCountdown());
    setClaiming(false);
    if (result.type === "onex")
      toast.success(`🪅 Found ${result.amount} Onex!`);
    else toast.success(`🪅 Found ${result.name}!`);
  };

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
          data-ocid="treasure.back.button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#e8f4fd" }}>
          🪅 Daily Treasure
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-2"
        >
          <motion.div
            animate={
              available
                ? { rotate: [0, -5, 5, -5, 5, 0], scale: [1, 1.1, 1] }
                : {}
            }
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              repeatDelay: 2,
            }}
            className="text-8xl cursor-pointer select-none"
            onClick={handleClaim}
          >
            {opened ? "🎉" : "🪅"}
          </motion.div>
          <p className="text-xl font-bold" style={{ color: "#e8f4fd" }}>
            Daily Treasure Chest
          </p>
          <p className="text-sm" style={{ color: "#8eacbb" }}>
            Claim once every 24 hours
          </p>
        </motion.div>

        <AnimatePresence>
          {opened && reward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="rounded-2xl p-6 text-center w-full max-w-sm"
              style={{ background: "#1c2733", border: "2px solid #FFD700" }}
              data-ocid="treasure.reward.success_state"
            >
              <div className="text-5xl mb-3">
                {reward.type === "onex" ? "💸" : "💝"}
              </div>
              <p
                className="text-xl font-extrabold mb-1"
                style={{ color: "#FFD700" }}
              >
                {reward.type === "onex"
                  ? `+${reward.amount} Onex!`
                  : reward.name}
              </p>
              <p className="text-sm" style={{ color: "#8eacbb" }}>
                {reward.type === "onex"
                  ? "Added to your balance"
                  : `${reward.rarity} waifu added to harem`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!opened && (
          <Button
            onClick={handleClaim}
            disabled={!available || claiming}
            className="w-full max-w-sm py-4 text-lg font-bold rounded-2xl"
            style={{
              background: available
                ? "linear-gradient(135deg, #FFD700, #FF8C00)"
                : "#1c2733",
              color: available ? "#0e1621" : "#4a6278",
            }}
            data-ocid="treasure.claim.primary_button"
          >
            {claiming
              ? "Opening..."
              : available
                ? "🪅 Open Treasure"
                : `⏳ ${countdown}`}
          </Button>
        )}

        {!available && !opened && (
          <p className="text-sm" style={{ color: "#4a6278" }}>
            Next treasure in: {countdown}
          </p>
        )}
      </div>
    </div>
  );
}
