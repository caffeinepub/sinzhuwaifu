import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Coins } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCallerProfile } from "../hooks/useQueries";

interface PayPageProps {
  onNavigate: (page: string) => void;
}

export default function PayPage({ onNavigate }: PayPageProps) {
  const { data: profile } = useCallerProfile();
  const [amount, setAmount] = useState("");
  const [friendName, setFriendName] = useState("");
  const [sending, setSending] = useState(false);

  const balance = Number(profile?.balance ?? 0);
  const parsedAmount = Number.parseInt(amount, 10) || 0;
  const canPay =
    parsedAmount > 0 && parsedAmount <= balance && friendName.trim();

  const handlePay = async () => {
    if (!canPay) {
      if (parsedAmount > balance) toast.error("Insufficient Onex balance");
      else toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success(`💰 ${parsedAmount} Onex sent to ${friendName}!`);
    setAmount("");
    setFriendName("");
    setSending(false);
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
          data-ocid="pay.back.button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#e8f4fd" }}>
          💰 Pay Onex
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Balance Card */}
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: "#1c2733", border: "1px solid #2b3d54" }}
          >
            <p
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: "#4a6278" }}
            >
              Your Balance
            </p>
            <p className="text-3xl font-extrabold" style={{ color: "#FFD700" }}>
              💸 {balance.toLocaleString()} Onex
            </p>
          </div>

          {/* Pay Form */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ background: "#1c2733" }}
          >
            <div>
              <label
                htmlFor="pay-friend"
                className="text-sm font-medium mb-1 block"
                style={{ color: "#8eacbb" }}
              >
                Friend's Username
              </label>
              <Input
                id="pay-friend"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="@username"
                className="bg-transparent border-[#2b3d54] text-[#e8f4fd] placeholder:text-[#4a6278]"
                data-ocid="pay.friend.input"
              />
            </div>
            <div>
              <label
                htmlFor="pay-amount"
                className="text-sm font-medium mb-1 block"
                style={{ color: "#8eacbb" }}
              >
                Amount (Onex)
              </label>
              <Input
                id="pay-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1000"
                type="number"
                min="1"
                className="bg-transparent border-[#2b3d54] text-[#e8f4fd] placeholder:text-[#4a6278]"
                data-ocid="pay.amount.input"
              />
            </div>
            {parsedAmount > balance && (
              <p className="text-xs" style={{ color: "#e53e3e" }}>
                Insufficient balance
              </p>
            )}
            <Button
              onClick={handlePay}
              disabled={sending || !canPay}
              className="w-full font-bold"
              style={{ background: "#5288c1" }}
              data-ocid="pay.send.primary_button"
            >
              {sending ? (
                "Sending..."
              ) : (
                <>
                  <Coins size={16} className="mr-2" />
                  Send Onex
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center" style={{ color: "#4a6278" }}>
            Earn more Onex via{" "}
            <button
              type="button"
              onClick={() => onNavigate("daily")}
              style={{ color: "#5288c1" }}
              className="underline"
            >
              Daily Rewards
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
