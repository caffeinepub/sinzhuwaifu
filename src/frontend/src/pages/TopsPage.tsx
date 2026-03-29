import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface TopsPageProps {
  onNavigate: (page: string) => void;
}

const MOCK_TOPS = [
  { name: "RichWaifuLord", balance: 98400 },
  { name: "OnexMaster", balance: 72500 },
  { name: "GoldHoarder", balance: 61000 },
  { name: "DiamondHunter", balance: 48900 },
  { name: "CoinEmperor", balance: 35200 },
  { name: "WealthSeeker", balance: 27800 },
  { name: "SilverBaron", balance: 18600 },
  { name: "BronzeKing", balance: 12300 },
  { name: "OnexFarmer", balance: 8900 },
  { name: "NewPlayer", balance: 3400 },
];

export default function TopsPage({ onNavigate }: TopsPageProps) {
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
          data-ocid="tops.back.button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#e8f4fd" }}>
          🥇 Top Onex Holders
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {MOCK_TOPS.map((user, i) => {
          const medals = ["🥇", "🥈", "🥉"];
          const isTop3 = i < 3;
          return (
            <motion.div
              key={user.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: isTop3 ? "#1e2d1e" : "#1c2733",
                border: isTop3
                  ? "1px solid #3b9e5a40"
                  : "1px solid transparent",
              }}
              data-ocid={`tops.holder.item.${i + 1}`}
            >
              <span className="text-xl w-8 text-center">
                {isTop3 ? medals[i] : `${i + 1}.`}
              </span>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "#e8f4fd" }}>
                  {user.name}
                </p>
                <p className="text-xs" style={{ color: "#8eacbb" }}>
                  Onex Holder
                </p>
              </div>
              <span className="font-bold text-sm" style={{ color: "#FFD700" }}>
                💸 {user.balance.toLocaleString()}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
