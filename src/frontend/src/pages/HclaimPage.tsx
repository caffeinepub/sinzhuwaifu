import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { WaifuCharacter } from "../backend";
import { RARITY_CONFIG, SEED_WAIFUS } from "../data/seedData";
import { useWaifuCharacters } from "../hooks/useQueries";

interface HclaimPageProps {
  onNavigate: (page: string) => void;
}

const HCLAIM_KEY = "sinzhu_daily_hclaim";
const COOLDOWN = 24 * 60 * 60 * 1000;

function canClaim() {
  const last = Number.parseInt(localStorage.getItem(HCLAIM_KEY) || "0", 10);
  return Date.now() - last >= COOLDOWN;
}

function formatCountdown() {
  const last = Number.parseInt(localStorage.getItem(HCLAIM_KEY) || "0", 10);
  const remaining = COOLDOWN - (Date.now() - last);
  if (remaining <= 0) return "Ready!";
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function HclaimPage({ onNavigate }: HclaimPageProps) {
  const { data: backendWaifus } = useWaifuCharacters();
  const [available, setAvailable] = useState(canClaim);
  const [countdown, setCountdown] = useState(formatCountdown);
  const [claiming, setClaiming] = useState(false);
  const [claimedWaifu, setClaimedWaifu] = useState<WaifuCharacter | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAvailable(canClaim());
      setCountdown(formatCountdown());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const allWaifus: WaifuCharacter[] =
    backendWaifus && backendWaifus.length > 0 ? backendWaifus : SEED_WAIFUS;

  const commonWaifus = allWaifus.filter((w) =>
    ["common", "medium", "rare"].includes(w.rarity),
  );

  const handleClaim = async () => {
    if (!available) return;
    setClaiming(true);
    await new Promise((r) => setTimeout(r, 1000));
    const pool = commonWaifus.length > 0 ? commonWaifus : allWaifus;
    const waifu = pool[Math.floor(Math.random() * pool.length)];
    localStorage.setItem(HCLAIM_KEY, Date.now().toString());

    // Add to harem
    const harem: { id: string; isFavorite: boolean }[] = (() => {
      try {
        return JSON.parse(localStorage.getItem("sinzhu_harem") || "[]");
      } catch {
        return [];
      }
    })();
    harem.push({ id: waifu.id, isFavorite: false });
    localStorage.setItem("sinzhu_harem", JSON.stringify(harem));

    setClaimedWaifu(waifu);
    setAvailable(false);
    setCountdown(formatCountdown());
    setClaiming(false);
    toast.success(`🎀 ${waifu.name} added to your harem!`);
  };

  const rarity = claimedWaifu
    ? (RARITY_CONFIG[claimedWaifu.rarity] ?? RARITY_CONFIG.common)
    : null;

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
          data-ocid="hclaim.back.button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#e8f4fd" }}>
          🎀 Daily Free Waifu
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-6 text-center w-full max-w-sm"
          style={{ background: "#1c2733", border: "1px solid #2b3d54" }}
        >
          <div className="text-6xl mb-3">🎀</div>
          <p className="text-lg font-bold" style={{ color: "#e8f4fd" }}>
            Daily Waifu Claim
          </p>
          <p className="text-sm mt-1" style={{ color: "#8eacbb" }}>
            Get a free Common–Rare waifu once per day
          </p>
        </motion.div>

        <AnimatePresence>
          {claimedWaifu && rarity && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl overflow-hidden w-full max-w-sm"
              style={{ border: `2px solid ${rarity.color}` }}
              data-ocid="hclaim.result.success_state"
            >
              <img
                src={claimedWaifu.imageUrl}
                alt={claimedWaifu.name}
                className="w-full object-cover"
                style={{ maxHeight: 280 }}
              />
              <div className="p-4" style={{ background: "#1c2733" }}>
                <p
                  className="font-extrabold text-lg"
                  style={{ color: "#e8f4fd" }}
                >
                  {claimedWaifu.name}
                </p>
                <p className="text-xs mb-2" style={{ color: "#8eacbb" }}>
                  {claimedWaifu.series}
                </p>
                <span
                  className="px-2 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: `${rarity.color}20`,
                    color: rarity.color,
                  }}
                >
                  {rarity.icon} {rarity.label}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate("harem")}
                  className="mt-3 w-full py-2 rounded-xl font-semibold text-white"
                  style={{ background: "#5288c1" }}
                  data-ocid="hclaim.view_harem.button"
                >
                  🎴 View in Harem
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!claimedWaifu && (
          <Button
            onClick={handleClaim}
            disabled={!available || claiming}
            className="w-full max-w-sm py-4 text-lg font-bold rounded-2xl"
            style={{
              background: available
                ? "linear-gradient(135deg, #FF69B4, #9B59B6)"
                : "#1c2733",
              color: available ? "white" : "#4a6278",
            }}
            data-ocid="hclaim.claim.primary_button"
          >
            {claiming
              ? "Claiming..."
              : available
                ? "🎀 Claim Free Waifu"
                : `⏳ ${countdown}`}
          </Button>
        )}

        {!available && !claimedWaifu && (
          <p className="text-sm" style={{ color: "#4a6278" }}>
            Next claim in: {countdown}
          </p>
        )}
      </div>
    </div>
  );
}
