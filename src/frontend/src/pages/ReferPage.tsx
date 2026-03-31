import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ReferPageProps {
  onNavigate: (page: string) => void;
}

function syncOnexToProfile(amount: number) {
  try {
    const profile = JSON.parse(localStorage.getItem("sinzhu_profile") || "{}");
    profile.balance = (profile.balance || 0) + amount;
    localStorage.setItem("sinzhu_profile", JSON.stringify(profile));
  } catch {}
}

export default function ReferPage({ onNavigate }: ReferPageProps) {
  // BUG 4 FIX: Use sinzhu_userId for a stable, unique refer code
  const userId = localStorage.getItem("sinzhu_userId") || "";
  const myReferCode = userId
    ? userId.slice(0, 6).toUpperCase().padEnd(6, "0")
    : "XXXXXX";

  const [friendCode, setFriendCode] = useState("");
  const [loading, setLoading] = useState(false);

  // BUG 4 FIX: Check for pending referral rewards on mount
  useEffect(() => {
    if (!myReferCode || myReferCode === "XXXXXX") return;
    try {
      const rewards: Record<string, number> = JSON.parse(
        localStorage.getItem("sinzhu_refer_rewards") || "{}",
      );
      const pending = rewards[myReferCode] || 0;
      if (pending > 0) {
        const current = Number.parseInt(
          localStorage.getItem("userOnex") || "0",
          10,
        );
        localStorage.setItem("userOnex", String(current + pending));
        syncOnexToProfile(pending);
        // Clear the pending reward
        rewards[myReferCode] = 0;
        localStorage.setItem("sinzhu_refer_rewards", JSON.stringify(rewards));
        toast.success(`🎉 You earned ${pending} Onex from referrals!`);
      }
    } catch {}
  }, [myReferCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(myReferCode).then(() => {
      toast.success("✅ Refer code copied!");
    });
  };

  const handleClaim = () => {
    const trimmed = friendCode.trim().toUpperCase();
    if (!trimmed || trimmed.length !== 6) {
      toast.error("❌ Enter a valid 6-digit refer code");
      return;
    }
    if (trimmed === myReferCode) {
      toast.error("❌ Cannot use your own code");
      return;
    }
    setLoading(true);
    try {
      const usedRaw = localStorage.getItem("sinzhu_refer_used");
      const used: string[] = usedRaw ? JSON.parse(usedRaw) : [];
      if (used.includes(trimmed)) {
        toast.error("❌ Already claimed");
        setLoading(false);
        return;
      }
      // BUG 4 + 5 FIX: Give claimer 300 Onex + sync to profile
      const current = Number.parseInt(
        localStorage.getItem("userOnex") || "0",
        10,
      );
      localStorage.setItem("userOnex", String(current + 300));
      syncOnexToProfile(300);

      // Store 300 Onex reward for the referrer (they collect when they open ReferPage)
      const rewards: Record<string, number> = JSON.parse(
        localStorage.getItem("sinzhu_refer_rewards") || "{}",
      );
      rewards[trimmed] = (rewards[trimmed] || 0) + 300;
      localStorage.setItem("sinzhu_refer_rewards", JSON.stringify(rewards));

      used.push(trimmed);
      localStorage.setItem("sinzhu_refer_used", JSON.stringify(used));
      toast.success("✅ You got 300 onex!");
      setFriendCode("");
    } catch {
      toast.error("❌ Something went wrong");
    }
    setLoading(false);
  };

  return (
    <main
      className="min-h-screen px-4 py-6"
      style={{ background: "#17212b" }}
      data-ocid="refer.section"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Back button */}
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 mb-6 text-sm transition-colors hover:text-white"
          style={{ color: "#8eacbb" }}
          data-ocid="refer.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💖</div>
          <h1
            className="text-3xl font-extrabold mb-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.22 330), oklch(0.82 0.15 75))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Refer
          </h1>
          <p style={{ color: "#8eacbb" }} className="text-sm">
            Share your code — your friend gets 300 Onex when they use it!
          </p>
        </div>

        {/* My Refer Code */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: "#1c2733", border: "1px solid #2b3d54" }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: "#8eacbb" }}>
            Your Refer Code
          </p>
          <div className="flex items-center gap-3">
            <div
              className="flex-1 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest"
              style={{
                background: "oklch(0.75 0.22 330 / 0.12)",
                border: "1px solid oklch(0.75 0.22 330 / 0.35)",
                color: "oklch(0.85 0.18 330)",
                letterSpacing: "0.3em",
              }}
            >
              {myReferCode}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              style={{
                background: "oklch(0.75 0.22 330 / 0.15)",
                border: "1px solid oklch(0.75 0.22 330 / 0.4)",
                color: "oklch(0.85 0.18 330)",
              }}
              onClick={handleCopy}
              data-ocid="refer.copy_button"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs mt-2" style={{ color: "#8eacbb" }}>
            Share this code with friends so they can earn 300 Onex!
          </p>
        </div>

        {/* Separator */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background: "#2b3d54" }} />
          <span className="text-xs" style={{ color: "#4a6278" }}>
            OR
          </span>
          <div className="flex-1 h-px" style={{ background: "#2b3d54" }} />
        </div>

        {/* Friend Code Claim */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "#1c2733", border: "1px solid #2b3d54" }}
        >
          <div>
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "#e8f4fd" }}
            >
              Enter Friend's Refer Code
            </p>
            <Input
              value={friendCode}
              onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="XXXXXX"
              className="text-center text-xl font-bold tracking-widest"
              style={{
                background: "oklch(0.10 0.025 290)",
                border: "1px solid #2b3d54",
                color: "#e8f4fd",
                letterSpacing: "0.3em",
              }}
              data-ocid="refer.input"
              onKeyDown={(e) => e.key === "Enter" && handleClaim()}
            />
          </div>

          <Button
            className="w-full h-12 text-base font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.22 330), oklch(0.82 0.15 75))",
              color: "#fff",
            }}
            onClick={handleClaim}
            disabled={loading}
            data-ocid="refer.submit_button"
          >
            {loading ? "Claiming..." : "💖 Claim 300 Onex"}
          </Button>
        </div>

        <div
          className="mt-4 rounded-xl p-4 text-xs"
          style={{
            background: "oklch(0.82 0.15 75 / 0.07)",
            border: "1px solid oklch(0.82 0.15 75 / 0.2)",
            color: "#8eacbb",
          }}
        >
          💡 Each refer code can only be claimed once per user. You cannot use
          your own code.
        </div>
      </motion.div>
    </main>
  );
}
