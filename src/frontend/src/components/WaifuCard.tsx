import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Heart, Star } from "lucide-react";
import { motion } from "motion/react";
import type { OwnedWaifu, WaifuCharacter } from "../backend";
import { RARITY_CONFIG } from "../data/seedData";

interface WaifuCardProps {
  character: WaifuCharacter;
  owned?: OwnedWaifu;
  index?: number;
  onFavorite?: (characterId: string) => void;
  onSell?: (characterId: string) => void;
  showActions?: boolean;
}

export default function WaifuCard({
  character,
  owned,
  index = 0,
  onFavorite,
  onSell,
  showActions = false,
}: WaifuCardProps) {
  const rarity = RARITY_CONFIG[character.rarity] ?? RARITY_CONFIG.common;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`relative rounded-2xl overflow-hidden group cursor-pointer ${rarity.className}`}
      style={{
        background:
          "linear-gradient(180deg, oklch(0.14 0.035 290), oklch(0.10 0.025 290))",
      }}
      data-ocid={`waifu.item.${index + 1}`}
    >
      {/* Image */}
      <div className="relative aspect-[5/7] overflow-hidden">
        <img
          src={character.imageUrl}
          alt={character.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, oklch(0.08 0.02 290) 0%, transparent 50%, transparent 80%, oklch(0.08 0.02 290 / 0.3) 100%)",
          }}
        />

        {/* Rarity badge top-left */}
        <div className="absolute top-2 left-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: `${rarity.color}22`,
              color: rarity.color,
              border: `1px solid ${rarity.color}55`,
            }}
          >
            {rarity.label}
          </span>
        </div>

        {/* Favorite button top-right */}
        {(showActions || owned) && (
          <button
            type="button"
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: owned?.isFavorite
                ? "oklch(0.67 0.26 330 / 0.9)"
                : "oklch(0.10 0.025 290 / 0.8)",
              border: "1px solid oklch(0.67 0.26 330 / 0.5)",
            }}
            onClick={() => onFavorite?.(character.id)}
            data-ocid={`waifu.favorite.${index + 1}`}
          >
            <Heart
              className="w-4 h-4"
              fill={owned?.isFavorite ? "white" : "none"}
              stroke="white"
            />
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div className="p-3">
        <h3 className="font-bold text-sm text-foreground truncate">
          {character.name}
        </h3>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {character.series}
        </p>

        {/* Stars */}
        <div className="flex gap-0.5 mt-1.5">
          {["s0", "s1", "s2", "s3", "s4"].map((sk, i) => (
            <Star
              key={sk}
              className="w-3 h-3"
              fill={i < rarity.stars ? rarity.color : "transparent"}
              stroke={i < rarity.stars ? rarity.color : "oklch(0.30 0.05 290)"}
            />
          ))}
        </div>

        {/* Sell button */}
        {showActions && onSell && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 h-7 text-xs rounded-lg"
            style={{
              background: "oklch(0.16 0.04 290)",
              color: "oklch(0.72 0.04 290)",
            }}
            onClick={() => onSell(character.id)}
            data-ocid={`waifu.delete_button.${index + 1}`}
          >
            <DollarSign className="w-3 h-3 mr-1" />
            Sell
          </Button>
        )}
      </div>
    </motion.div>
  );
}
