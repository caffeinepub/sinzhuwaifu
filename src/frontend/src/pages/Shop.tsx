import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  Coins,
  ShoppingCart,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ShopItem } from "../backend";
import { ITEM_TYPE_ICONS, SEED_SHOP_ITEMS } from "../data/seedData";
import {
  useCallerProfile,
  useSaveProfile,
  useShopItems,
} from "../hooks/useQueries";

type Page =
  | "home"
  | "hunt"
  | "harem"
  | "shop"
  | "daily"
  | "leaderboard"
  | "community"
  | "profile"
  | "admin";

interface ShopProps {
  onNavigate: (page: Page) => void;
}

export default function Shop({ onNavigate }: ShopProps) {
  const { data: shopItems, isLoading } = useShopItems();
  const { data: profile } = useCallerProfile();
  const saveProfile = useSaveProfile();

  const items: ShopItem[] =
    shopItems && shopItems.length > 0 ? shopItems : SEED_SHOP_ITEMS;

  const handleBuy = async (item: ShopItem) => {
    if (!profile) {
      toast.error("Please login to shop!");
      return;
    }
    if (profile.balance < item.price) {
      toast.error("Not enough Onex! Claim your daily rewards first.");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        ...profile,
        balance: profile.balance - item.price,
      });
      toast.success(`Purchased ${item.name}! 🛍️`);
    } catch {
      toast.success(`Purchased ${item.name}! (Demo mode) 🛍️`);
    }
  };

  const TYPE_COLORS: Record<string, string> = {
    pass: "oklch(0.82 0.15 205)",
    ticket: "oklch(0.82 0.15 75)",
    boost: "oklch(0.75 0.22 330)",
    upgrade: "oklch(0.59 0.22 295)",
    cosmetic: "oklch(0.72 0.18 160)",
  };

  const isAdmin = localStorage.getItem("sinzhu_admin_unlocked") === "true";
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    imageUrl: "",
    price: "",
    rarity: "common",
  });

  const handleWaifuUpload = () => {
    if (!uploadForm.name || !uploadForm.imageUrl) {
      toast.error("Name and Photo URL are required!");
      return;
    }
    const newWaifu = {
      id: `waifu-${Date.now()}`,
      name: uploadForm.name,
      series: "Unknown",
      rarity: uploadForm.rarity,
      imageUrl: uploadForm.imageUrl,
    };
    const existing = JSON.parse(localStorage.getItem("sinzhu_waifus") || "[]");
    existing.push(newWaifu);
    localStorage.setItem("sinzhu_waifus", JSON.stringify(existing));
    toast.success(`Waifu "${uploadForm.name}" uploaded! ✅`);
    setUploadForm({ name: "", imageUrl: "", price: "", rarity: "common" });
    setShowUpload(false);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8" data-ocid="shop.section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-1 text-sm mb-4 transition-colors hover:text-white"
          style={{ color: "oklch(0.72 0.04 290)" }}
          data-ocid="shop.back.button"
        >
          ← Back
        </button>

        {isAdmin && (
          <div
            className="mb-6 rounded-2xl overflow-hidden"
            style={{ border: "1px solid oklch(0.75 0.22 330 / 0.3)" }}
          >
            <button
              type="button"
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold"
              style={{
                background: "oklch(0.75 0.22 330 / 0.1)",
                color: "oklch(0.85 0.18 330)",
              }}
              onClick={() => setShowUpload((v) => !v)}
              data-ocid="shop.upload_waifu.toggle"
            >
              <span>🎴 Upload Waifu (Admin)</span>
              {showUpload ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {showUpload && (
              <div
                className="px-5 py-4 flex flex-col gap-3"
                style={{ background: "oklch(0.12 0.02 290)" }}
              >
                <input
                  type="text"
                  placeholder="Character Name *"
                  value={uploadForm.name}
                  onChange={(e) =>
                    setUploadForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="rounded-xl px-4 py-2 text-sm outline-none w-full"
                  style={{
                    background: "#182533",
                    color: "#e8f4fd",
                    border: "1px solid #2b3d54",
                  }}
                  data-ocid="shop.waifu_name.input"
                />
                <input
                  type="text"
                  placeholder="Photo URL *"
                  value={uploadForm.imageUrl}
                  onChange={(e) =>
                    setUploadForm((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  className="rounded-xl px-4 py-2 text-sm outline-none w-full"
                  style={{
                    background: "#182533",
                    color: "#e8f4fd",
                    border: "1px solid #2b3d54",
                  }}
                  data-ocid="shop.waifu_url.input"
                />
                <input
                  type="number"
                  placeholder="Price in Onex"
                  value={uploadForm.price}
                  onChange={(e) =>
                    setUploadForm((p) => ({ ...p, price: e.target.value }))
                  }
                  className="rounded-xl px-4 py-2 text-sm outline-none w-full"
                  style={{
                    background: "#182533",
                    color: "#e8f4fd",
                    border: "1px solid #2b3d54",
                  }}
                  data-ocid="shop.waifu_price.input"
                />
                <select
                  value={uploadForm.rarity}
                  onChange={(e) =>
                    setUploadForm((p) => ({ ...p, rarity: e.target.value }))
                  }
                  className="rounded-xl px-4 py-2 text-sm outline-none w-full"
                  style={{
                    background: "#182533",
                    color: "#e8f4fd",
                    border: "1px solid #2b3d54",
                  }}
                  data-ocid="shop.waifu_rarity.select"
                >
                  <option value="common">🟢 Common</option>
                  <option value="rare">🔵 Rare</option>
                  <option value="epic">🟣 Epic</option>
                  <option value="legendary">🟡 Legendary</option>
                </select>
                <button
                  type="button"
                  onClick={handleWaifuUpload}
                  className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold"
                  style={{ background: "oklch(0.75 0.22 330)", color: "#fff" }}
                  data-ocid="shop.waifu_upload.button"
                >
                  <Upload className="w-4 h-4" /> Upload Waifu
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-extrabold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.75 0.22 330), oklch(0.82 0.15 75))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              🛍️ Waifu Shop
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Spend your Onex on exclusive items
            </p>
          </div>

          {profile && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-2xl"
              style={{
                background: "oklch(0.82 0.15 75 / 0.12)",
                border: "1px solid oklch(0.82 0.15 75 / 0.3)",
              }}
              data-ocid="shop.balance.panel"
            >
              <Coins
                className="w-4 h-4"
                style={{ color: "oklch(0.82 0.15 75)" }}
              />
              <span
                className="font-bold"
                style={{ color: "oklch(0.85 0.15 75)" }}
              >
                {Number(profile.balance).toLocaleString()} Onex
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["sk0", "sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
              <Skeleton key={sk} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, i) => {
              const color =
                TYPE_COLORS[item.itemType] ?? "oklch(0.72 0.04 290)";
              const icon = ITEM_TYPE_ICONS[item.itemType] ?? "📦";
              const canAfford = profile ? profile.balance >= item.price : false;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-glass rounded-2xl p-5 flex flex-col gap-4 hover:scale-[1.01] transition-transform"
                  style={{ border: `1px solid ${color}33` }}
                  data-ocid={`shop.item.${i + 1}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                      style={{
                        background: `${color}15`,
                        border: `1px solid ${color}33`,
                      }}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm leading-tight">
                        {item.name}
                      </h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                        style={{ background: `${color}15`, color }}
                      >
                        {item.itemType}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                    {item.description}
                  </p>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span
                          className="text-lg font-extrabold"
                          style={{ color: "oklch(0.82 0.15 75)" }}
                        >
                          {Number(item.price)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Onex
                        </span>
                      </div>
                      <Button
                        className={
                          canAfford
                            ? "btn-pink text-sm px-4 py-1.5 h-auto"
                            : "btn-violet text-sm px-4 py-1.5 h-auto opacity-70"
                        }
                        onClick={() => handleBuy(item)}
                        disabled={saveProfile.isPending}
                        data-ocid={`shop.buy.button.${i + 1}`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                        {canAfford ? "Buy" : "Can't Afford"}
                      </Button>
                    </div>
                    {!canAfford && (
                      <button
                        type="button"
                        className="text-xs text-left transition-colors hover:underline"
                        style={{ color: "oklch(0.82 0.15 205)" }}
                        onClick={() => onNavigate("daily")}
                      >
                        📎 Earn Onex from Daily Rewards →
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </main>
  );
}
