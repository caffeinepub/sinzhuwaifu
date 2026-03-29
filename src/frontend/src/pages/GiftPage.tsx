import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Gift } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { RARITY_CONFIG, SEED_WAIFUS } from "../data/seedData";

interface GiftPageProps {
  onNavigate: (page: string) => void;
}

export default function GiftPage({ onNavigate }: GiftPageProps) {
  const [waifuId, setWaifuId] = useState("");
  const [friendName, setFriendName] = useState("");
  const [sending, setSending] = useState(false);

  const localHarem: { id: string; isFavorite: boolean }[] = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("sinzhu_harem") || "null") ?? [
          { id: "waifu-001", isFavorite: true },
          { id: "waifu-002", isFavorite: false },
          { id: "waifu-004", isFavorite: false },
          { id: "waifu-005", isFavorite: true },
        ]
      );
    } catch {
      return [];
    }
  })();

  const foundWaifu = SEED_WAIFUS.find(
    (w) => w.id === waifuId || w.name.toLowerCase() === waifuId.toLowerCase(),
  );
  const inHarem = localHarem.some((h) => h.id === foundWaifu?.id);

  const handleGift = async () => {
    if (!waifuId.trim() || !friendName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!foundWaifu) {
      toast.error("Waifu not found in your collection");
      return;
    }
    if (!inHarem) {
      toast.error("You don't own this waifu");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    const newHarem = localHarem.filter((h) => h.id !== foundWaifu.id);
    localStorage.setItem("sinzhu_harem", JSON.stringify(newHarem));
    toast.success(`🎁 ${foundWaifu.name} gifted to ${friendName}!`);
    setWaifuId("");
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
          data-ocid="gift.back.button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#e8f4fd" }}>
          🎁 Gift Waifu
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ background: "#1c2733" }}
          >
            <div>
              <label
                htmlFor="gift-waifu-id"
                className="text-sm font-medium mb-1 block"
                style={{ color: "#8eacbb" }}
              >
                Waifu ID or Name
              </label>
              <Input
                id="gift-waifu-id"
                value={waifuId}
                onChange={(e) => setWaifuId(e.target.value)}
                placeholder="e.g. waifu-001 or Sakura Miyamoto"
                className="bg-transparent border-[#2b3d54] text-[#e8f4fd] placeholder:text-[#4a6278]"
                data-ocid="gift.waifu.input"
              />
            </div>
            <div>
              <label
                htmlFor="gift-friend"
                className="text-sm font-medium mb-1 block"
                style={{ color: "#8eacbb" }}
              >
                Friend's Username or Principal ID
              </label>
              <Input
                id="gift-friend"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="@username or principal..."
                className="bg-transparent border-[#2b3d54] text-[#e8f4fd] placeholder:text-[#4a6278]"
                data-ocid="gift.friend.input"
              />
            </div>

            {foundWaifu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: "#17212b",
                  border: `1px solid ${inHarem ? "#3b9e5a" : "#e53e3e"}40`,
                }}
              >
                <img
                  src={foundWaifu.imageUrl}
                  alt={foundWaifu.name}
                  className="w-12 h-16 object-cover rounded-lg"
                />
                <div>
                  <p className="font-bold text-sm" style={{ color: "#e8f4fd" }}>
                    {foundWaifu.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color:
                        RARITY_CONFIG[foundWaifu.rarity]?.color ?? "#8eacbb",
                    }}
                  >
                    {RARITY_CONFIG[foundWaifu.rarity]?.icon}{" "}
                    {RARITY_CONFIG[foundWaifu.rarity]?.label}
                  </p>
                  {!inHarem && (
                    <p className="text-xs" style={{ color: "#e53e3e" }}>
                      Not in your harem
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            <Button
              onClick={handleGift}
              disabled={sending || !waifuId.trim() || !friendName.trim()}
              className="w-full font-bold"
              style={{ background: "#5288c1" }}
              data-ocid="gift.send.primary_button"
            >
              {sending ? (
                "Sending..."
              ) : (
                <>
                  <Gift size={16} className="mr-2" /> Gift Waifu
                </>
              )}
            </Button>
          </div>

          {/* Harem list */}
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-2"
              style={{ color: "#4a6278" }}
            >
              Your Harem
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {SEED_WAIFUS.filter((w) =>
                localHarem.some((h) => h.id === w.id),
              ).map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWaifuId(w.id)}
                  className="flex items-center gap-2 p-2 rounded-xl text-left transition-all hover:brightness-110"
                  style={{
                    background: waifuId === w.id ? "#2b5278" : "#1c2733",
                    border:
                      waifuId === w.id
                        ? "1px solid #5288c1"
                        : "1px solid transparent",
                  }}
                  data-ocid={`gift.harem.item.${SEED_WAIFUS.indexOf(w) + 1}`}
                >
                  <img
                    src={w.imageUrl}
                    alt={w.name}
                    className="w-10 h-14 object-cover rounded-lg"
                  />
                  <div>
                    <p
                      className="text-xs font-bold"
                      style={{ color: "#e8f4fd" }}
                    >
                      {w.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: RARITY_CONFIG[w.rarity]?.color }}
                    >
                      {RARITY_CONFIG[w.rarity]?.icon}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
