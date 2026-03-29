import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { WaifuCharacter } from "../backend";
import WaifuCard from "../components/WaifuCard";
import { RARITY_CONFIG, SEED_WAIFUS } from "../data/seedData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerProfile,
  useSaveProfile,
  useUserHarem,
  useWaifuCharacters,
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

interface HaremProps {
  onNavigate: (page: Page) => void;
}

export default function Harem({ onNavigate }: HaremProps) {
  const { identity, login } = useInternetIdentity();
  const { data: haremData, isLoading } = useUserHarem(
    identity?.getPrincipal() ?? null,
  );
  const { data: characters } = useWaifuCharacters();
  const { data: profile } = useCallerProfile();
  const saveProfile = useSaveProfile();

  const [filter, setFilter] = useState<
    "all" | "favorites" | "legendary" | "epic" | "rare"
  >("all");
  const [localHarem, setLocalHarem] = useState<
    { id: string; isFavorite: boolean }[]
  >([
    { id: "waifu-001", isFavorite: true },
    { id: "waifu-002", isFavorite: false },
    { id: "waifu-004", isFavorite: false },
    { id: "waifu-005", isFavorite: true },
  ]);

  const allCharacters: WaifuCharacter[] =
    characters && characters.length > 0 ? characters : SEED_WAIFUS;

  const harems =
    haremData && haremData.length > 0
      ? haremData.map((h) => ({ id: h.characterId, isFavorite: h.isFavorite }))
      : localHarem;

  const haremCharacters = harems
    .map((h) => {
      const char = allCharacters.find((c) => c.id === h.id);
      return char ? { char, isFavorite: h.isFavorite } : null;
    })
    .filter(Boolean) as { char: WaifuCharacter; isFavorite: boolean }[];

  const filtered = haremCharacters.filter((h) => {
    if (filter === "favorites") return h.isFavorite;
    if (filter === "all") return true;
    return h.char.rarity === filter;
  });

  const toggleFavorite = (characterId: string) => {
    setLocalHarem((prev) =>
      prev.map((h) =>
        h.id === characterId ? { ...h, isFavorite: !h.isFavorite } : h,
      ),
    );
    toast.success("Favorite updated! 💝");
  };

  const sellWaifu = async (characterId: string) => {
    const char = allCharacters.find((c) => c.id === characterId);
    if (!char) return;
    const rarity = RARITY_CONFIG[char.rarity] ?? RARITY_CONFIG.common;
    const sellPrice = rarity.stars * 50;
    setLocalHarem((prev) => prev.filter((h) => h.id !== characterId));
    if (profile) {
      try {
        await saveProfile.mutateAsync({
          ...profile,
          balance: profile.balance + BigInt(sellPrice),
        });
      } catch {
        /* ignore */
      }
    }
    toast.success(`Sold ${char.name} for ${sellPrice} Onex! 💶`);
  };

  const FILTERS = [
    { value: "all", label: "All" },
    { value: "favorites", label: "💝 Faves" },
    { value: "legendary", label: "⭐ Legendary" },
    { value: "epic", label: "💜 Epic" },
    { value: "rare", label: "💙 Rare" },
  ] as const;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8" data-ocid="harem.section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-3xl font-extrabold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.75 0.22 330), oklch(0.82 0.15 205))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              🎴 My Harem
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {haremCharacters.length} waifus collected
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                type="button"
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background:
                    filter === f.value
                      ? "oklch(0.67 0.26 330 / 0.2)"
                      : "oklch(0.16 0.04 290)",
                  border:
                    filter === f.value
                      ? "1px solid oklch(0.67 0.26 330 / 0.5)"
                      : "1px solid oklch(0.22 0.055 290)",
                  color:
                    filter === f.value
                      ? "oklch(0.75 0.22 330)"
                      : "oklch(0.72 0.04 290)",
                }}
                data-ocid={`harem.${f.value}.tab`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {["h0", "h1", "h2", "h3", "h4", "h5", "h6", "h7"].map((hk) => (
              <Skeleton key={hk} className="aspect-[5/7] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="harem.empty_state"
          >
            <div className="text-6xl animate-float">
              {!identity ? "🔓" : "💔"}
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {!identity
                ? "Login to see your harem"
                : filter === "favorites"
                  ? "No favorites yet!"
                  : "Your harem is empty!"}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              {!identity
                ? "Connect your Internet Identity to access your collection."
                : "Go hunting to collect waifus and build your harem."}
            </p>
            {!identity ? (
              <Button
                className="btn-pink px-8"
                onClick={login}
                data-ocid="harem.login.button"
              >
                😍 Login to Play
              </Button>
            ) : (
              <Button
                className="btn-pink px-8"
                onClick={() => onNavigate("hunt")}
                data-ocid="harem.hunt.button"
              >
                🍀 Start Hunting
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(({ char, isFavorite }, i) => (
              <WaifuCard
                key={char.id}
                character={char}
                owned={{
                  userId: identity?.getPrincipal()!,
                  characterId: char.id,
                  isFavorite,
                  obtainedAt: 0n,
                }}
                index={i}
                onFavorite={toggleFavorite}
                onSell={sellWaifu}
                showActions
              />
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
}
