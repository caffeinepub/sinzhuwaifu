import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface CouponPageProps {
  onNavigate: (page: string) => void;
}

export default function CouponPage({ onNavigate }: CouponPageProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedeem = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || trimmed.length !== 6) {
      toast.error("❌ Enter a valid 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const couponsRaw = localStorage.getItem("sinzhu_coupons");
      const coupons: { code: string; onex: number; usedBy: string[] }[] =
        couponsRaw ? JSON.parse(couponsRaw) : [];
      const userId = localStorage.getItem("sinzhu_userId") || "guest";
      const idx = coupons.findIndex((c) => c.code === trimmed);
      if (idx === -1) {
        toast.error("❌ Invalid code");
        setLoading(false);
        return;
      }
      const coupon = coupons[idx];
      if (coupon.usedBy.includes(userId)) {
        toast.error("❌ Code already used");
        setLoading(false);
        return;
      }
      const current = Number.parseInt(
        localStorage.getItem("userOnex") || "0",
        10,
      );
      localStorage.setItem("userOnex", String(current + coupon.onex));
      coupons[idx].usedBy = [...coupon.usedBy, userId];
      localStorage.setItem("sinzhu_coupons", JSON.stringify(coupons));
      toast.success(`✅ You got ${coupon.onex} onex!`);
      setCode("");
    } catch {
      toast.error("❌ Something went wrong");
    }
    setLoading(false);
  };

  return (
    <main
      className="min-h-screen px-4 py-6"
      style={{ background: "#17212b" }}
      data-ocid="coupon.section"
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
          data-ocid="coupon.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🀄</div>
          <h1
            className="text-3xl font-extrabold mb-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.82 0.15 75), oklch(0.75 0.22 330))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Coupon
          </h1>
          <p style={{ color: "#8eacbb" }} className="text-sm">
            Enter a 6-digit coupon code to earn Onex!
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "#1c2733", border: "1px solid #2b3d54" }}
        >
          <div>
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "#e8f4fd" }}
            >
              Coupon Code
            </p>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="XXXXXX"
              className="text-center text-xl font-bold tracking-widest"
              style={{
                background: "oklch(0.10 0.025 290)",
                border: "1px solid #2b3d54",
                color: "#e8f4fd",
                letterSpacing: "0.3em",
              }}
              data-ocid="coupon.input"
              onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
            />
          </div>

          <Button
            className="w-full h-12 text-base font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.22 330), oklch(0.59 0.22 295))",
              color: "#fff",
            }}
            onClick={handleRedeem}
            disabled={loading}
            data-ocid="coupon.submit_button"
          >
            {loading ? "Redeeming..." : "🎁 Redeem Code"}
          </Button>
        </div>

        {/* Info */}
        <div
          className="mt-4 rounded-xl p-4 text-xs"
          style={{
            background: "oklch(0.82 0.15 205 / 0.07)",
            border: "1px solid oklch(0.82 0.15 205 / 0.2)",
            color: "#8eacbb",
          }}
        >
          💡 Coupon codes are one-time use per user. Get codes from the admin or
          special events!
        </div>
      </motion.div>
    </main>
  );
}
