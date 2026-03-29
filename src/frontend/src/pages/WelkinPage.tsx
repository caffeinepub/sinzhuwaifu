import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface WelkinPageProps {
  onNavigate: (page: string) => void;
}

const WELKIN_KEY = "sinzhu_daily_welkin";
const STREAK_KEY = "sinzhu_welkin_streak";
const LAST_CLAIM_KEY = "sinzhu_welkin_last_claim_date";
const COOLDOWN = 24 * 60 * 60 * 1000;
const DAILY_REWARD = 150;

function canClaim() {
  const last = Number.parseInt(localStorage.getItem(WELKIN_KEY) || "0", 10);
  return Date.now() - last >= COOLDOWN;
}

function getStreak() {
  return Number.parseInt(localStorage.getItem(STREAK_KEY) || "0", 10);
}

function formatCountdown() {
  const last = Number.parseInt(localStorage.getItem(WELKIN_KEY) || "0", 10);
  const remaining = COOLDOWN - (Date.now() - last);
  if (remaining <= 0) return "Ready!";
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function WelkinPage({ onNavigate }: WelkinPageProps) {
  const [available, setAvailable] = useState(canClaim);
  const [countdown, setCountdown] = useState(formatCountdown);
  const [streak, setStreak] = useState(getStreak);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

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
    const newStreak = streak + 1;
    localStorage.setItem(WELKIN_KEY, Date.now().toString());
    localStorage.setItem(STREAK_KEY, newStreak.toString());
    localStorage.setItem(LAST_CLAIM_KEY, new Date().toDateString());
    setStreak(newStreak);
    setAvailable(false);
    setCountdown(formatCountdown());
    setClaimed(true);
    setClaiming(false);
    toast.success(`🗓 +${DAILY_REWARD} Onex! Streak: ${newStreak} days 🔥`);
  };

  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

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
          data-ocid="welkin.back.button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#e8f4fd" }}>
          🗓 Daily Welkin
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 text-center"
          style={{ background: "#1c2733", border: "1px solid #2b3d54" }}
        >
          <p className="text-4xl mb-1">🔥</p>
          <p className="text-2xl font-extrabold" style={{ color: "#FFD700" }}>
            {streak} Day Streak
          </p>
          <p className="text-sm" style={{ color: "#8eacbb" }}>
            +{DAILY_REWARD} Onex daily bonus
          </p>
        </motion.div>

        {/* Claim Button */}
        <Button
          onClick={handleClaim}
          disabled={!available || claiming}
          className="w-full py-4 text-lg font-bold rounded-2xl"
          style={{
            background: available
              ? "linear-gradient(135deg, #5288c1, #1c6f9c)"
              : "#1c2733",
            color: available ? "white" : "#4a6278",
          }}
          data-ocid="welkin.claim.primary_button"
        >
          {claiming
            ? "Claiming..."
            : available
              ? `🗓 Claim +${DAILY_REWARD} Onex`
              : `⏳ ${countdown}`}
        </Button>

        {claimed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm font-bold"
            style={{ color: "#3b9e5a" }}
            data-ocid="welkin.claimed.success_state"
          >
            ✅ Claimed! +{DAILY_REWARD} Onex added
          </motion.p>
        )}

        {/* 30-Day Calendar */}
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: "#4a6278" }}
          >
            30-Day Calendar
          </h3>
          <div className="grid grid-cols-6 gap-1.5">
            {calendarDays.map((day) => {
              const isDone = day <= streak;
              const isToday = day === streak + 1 && available;
              return (
                <div
                  key={day}
                  className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    background: isDone
                      ? "#5288c1"
                      : isToday
                        ? "#1c6f9c"
                        : "#1c2733",
                    color: isDone ? "white" : isToday ? "#7DF9FF" : "#4a6278",
                    border: isToday ? "1px solid #7DF9FF" : "none",
                  }}
                >
                  {isDone ? "✓" : day}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
