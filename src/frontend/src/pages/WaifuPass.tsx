import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface WaifuPassProps {
  onNavigate: (page: string) => void;
}

const BENEFITS = [
  "🎴 Daily free waifu claim",
  "⚡ 2x spawn rate boost in groups",
  "💮 Access to Exclusive rarity waifus",
  "🌟 Priority hunt in group chats",
  "💎 +50 bonus Onex daily",
];

function getPassExpiry(): string | null {
  const exp = localStorage.getItem("sinzhu_waifu_pass_expiry");
  if (!exp) return null;
  const date = new Date(Number.parseInt(exp, 10));
  if (date < new Date()) {
    localStorage.removeItem("sinzhu_waifu_pass_expiry");
    return null;
  }
  return date.toLocaleDateString();
}

export default function WaifuPass({ onNavigate }: WaifuPassProps) {
  const [expiry] = useState<string | null>(getPassExpiry);
  const isActive = !!expiry;

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
          data-ocid="waifupass.back.button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#e8f4fd" }}>
          🦁 Waifu Pass
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 text-center"
          style={{
            background: isActive
              ? "linear-gradient(135deg, #1a3a4a 0%, #1c2733 100%)"
              : "#1c2733",
            border: isActive ? "2px solid #7DF9FF" : "2px solid #2b3d54",
          }}
        >
          <div className="text-6xl mb-3">{isActive ? "🦁" : "🔒"}</div>
          <h2
            className="text-xl font-extrabold mb-1"
            style={{ color: isActive ? "#7DF9FF" : "#8eacbb" }}
          >
            {isActive ? "PASS ACTIVE" : "NO ACTIVE PASS"}
          </h2>
          {isActive ? (
            <p className="text-sm" style={{ color: "#8eacbb" }}>
              Expires: {expiry}
            </p>
          ) : (
            <p className="text-sm" style={{ color: "#4a6278" }}>
              Purchase a Waifu Pass from the Shop
            </p>
          )}
        </motion.div>

        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: "#4a6278" }}
          >
            Pass Benefits
          </h3>
          <div className="space-y-2">
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "#1c2733" }}
              >
                {isActive ? (
                  <CheckCircle size={16} style={{ color: "#3b9e5a" }} />
                ) : (
                  <XCircle size={16} style={{ color: "#4a6278" }} />
                )}
                <span
                  className="text-sm"
                  style={{ color: isActive ? "#e8f4fd" : "#8eacbb" }}
                >
                  {benefit}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {!isActive && (
          <button
            type="button"
            onClick={() => onNavigate("shop")}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:brightness-110"
            style={{ background: "#5288c1" }}
            data-ocid="waifupass.buy.primary_button"
          >
            🛍️ Buy Pass from Shop — 500 Onex
          </button>
        )}
      </div>
    </div>
  );
}
