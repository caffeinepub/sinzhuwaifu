import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { WaifuCharacter } from "../backend";
import { RARITY_CONFIG, SEED_WAIFUS } from "../data/seedData";
import { useWaifuCharacters } from "../hooks/useQueries";

interface CheckPageProps {
  onNavigate: (page: string) => void;
}

export default function CheckPage({ onNavigate }: CheckPageProps) {
  const [query, setQuery] = useState("");
  const { data: backendWaifus } = useWaifuCharacters();
  const allWaifus: WaifuCharacter[] =
    backendWaifus && backendWaifus.length > 0 ? backendWaifus : SEED_WAIFUS;

  const results = query.trim()
    ? allWaifus.filter(
        (w) =>
          w.id.toLowerCase().includes(query.toLowerCase()) ||
          w.name.toLowerCase().includes(query.toLowerCase()) ||
          w.series.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

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
          data-ocid="check.back.button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#e8f4fd" }}>
          🔎 Check Character
        </h1>
      </div>

      <div className="px-4 pt-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#4a6278" }}
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID or name..."
            className="pl-9 bg-transparent border-[#2b3d54] text-[#e8f4fd] placeholder:text-[#4a6278]"
            data-ocid="check.search.input"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {!query.trim() && (
          <div className="py-12 text-center" data-ocid="check.empty_state">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-sm" style={{ color: "#8eacbb" }}>
              Type a name or ID to search
            </p>
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div
            className="py-12 text-center"
            data-ocid="check.no_results.empty_state"
          >
            <div className="text-5xl mb-3">😢</div>
            <p className="text-sm" style={{ color: "#8eacbb" }}>
              No characters found
            </p>
          </div>
        )}

        {results.map((w, i) => {
          const rarity = RARITY_CONFIG[w.rarity] ?? RARITY_CONFIG.common;
          return (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 p-4 rounded-2xl"
              style={{
                background: "#1c2733",
                border: `1px solid ${rarity.color}30`,
              }}
              data-ocid={`check.result.item.${i + 1}`}
            >
              <img
                src={w.imageUrl}
                alt={w.name}
                className="w-16 h-22 object-cover rounded-xl flex-shrink-0"
                style={{ height: 88 }}
              />
              <div className="flex-1">
                <p className="font-bold text-base" style={{ color: "#e8f4fd" }}>
                  {w.name}
                </p>
                <p className="text-xs mb-2" style={{ color: "#8eacbb" }}>
                  {w.series}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: `${rarity.color}20`,
                      color: rarity.color,
                    }}
                  >
                    {rarity.icon} {rarity.label}
                  </span>
                </div>
                <p className="text-xs mt-2" style={{ color: "#4a6278" }}>
                  ID: {w.id}
                </p>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: rarity.stars }).map((_, s) => (
                    <span
                      key={`star-${w.id}-${s}`}
                      style={{ color: rarity.color, fontSize: 10 }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
