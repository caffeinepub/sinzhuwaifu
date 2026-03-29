import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  type Ad,
  useAds,
  useCallerProfile,
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

interface HomeProps {
  onNavigate: (page: Page) => void;
}

function AdsCarousel({ ads }: { ads: Ad[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ads.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (ads.length === 0) return null;

  const ad = ads[current];

  const handleAdClick = () => {
    if (ad.link) window.open(ad.link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full" data-ocid="home.ads.panel">
      <button
        type="button"
        className="relative w-full rounded-2xl overflow-hidden cursor-pointer text-left"
        style={{
          border: "1px solid oklch(0.75 0.22 330 / 0.3)",
          background: "transparent",
        }}
        onClick={handleAdClick}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
          >
            {ad.videoUrl ? (
              <div className="w-full" style={{ maxHeight: 180 }}>
                <iframe
                  src={ad.videoUrl}
                  className="w-full rounded-t-2xl"
                  style={{ height: 180, border: "none" }}
                  allowFullScreen
                  title={ad.title}
                />
              </div>
            ) : ad.imageUrl ? (
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full object-cover rounded-t-2xl"
                style={{ maxHeight: 180, height: 180 }}
              />
            ) : null}
            <div
              className="px-4 py-2 flex items-center justify-between"
              style={{ background: "oklch(0.12 0.03 290 / 0.95)" }}
            >
              <span className="text-sm font-semibold text-foreground">
                {ad.title}
              </span>
              {ad.link && (
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.75 0.22 330)" }}
                >
                  Visit →
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </button>

      {ads.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {ads.map((adItem, i) => (
            <button
              key={adItem.id}
              type="button"
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all"
              style={{
                width: i === current ? 18 : 6,
                height: 6,
                background:
                  i === current
                    ? "oklch(0.75 0.22 330)"
                    : "oklch(0.75 0.22 330 / 0.3)",
              }}
              data-ocid="home.ads.toggle"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home({ onNavigate }: HomeProps) {
  const { data: characters } = useWaifuCharacters();
  const { data: profile } = useCallerProfile();
  const { identity } = useInternetIdentity();
  const { data: ads = [] } = useAds();

  const coins = profile ? Number(profile.balance) : 0;

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center gap-6">
      {/* Coins badge */}
      <div className="w-full flex justify-start">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: "oklch(0.82 0.15 75 / 0.12)",
            border: "1px solid oklch(0.82 0.15 75 / 0.3)",
            color: "oklch(0.85 0.15 75)",
          }}
          data-ocid="home.coins.badge"
        >
          💛 Coins {identity ? coins.toLocaleString() : 0}
        </span>
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <style>{`
          @keyframes shimmer-sky {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes float-rainbow {
            0%, 100% { transform: translateY(-50%) rotate(0deg); }
            50% { transform: translateY(calc(-50% - 8px)) rotate(12deg); }
          }
          @keyframes rain-drop-1 {
            0% { opacity: 1; transform: translateY(0px); }
            100% { opacity: 0; transform: translateY(28px); }
          }
          @keyframes rain-drop-2 {
            0% { opacity: 1; transform: translateY(0px); }
            100% { opacity: 0; transform: translateY(28px); }
          }
          @keyframes float-cloud {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(7px); }
          }
        `}</style>
        <div className="relative inline-block" style={{ padding: "8px 48px" }}>
          <span
            style={{
              position: "absolute",
              left: 4,
              top: "50%",
              fontSize: 24,
              animation: "float-rainbow 3s ease-in-out infinite",
              display: "inline-block",
            }}
          >
            🌈
          </span>
          <span
            style={{
              position: "absolute",
              right: 0,
              top: -4,
              fontSize: 18,
              animation: "float-cloud 4s ease-in-out infinite",
              display: "inline-block",
            }}
          >
            ☁️
          </span>
          <span
            style={{
              position: "absolute",
              right: 14,
              bottom: 2,
              fontSize: 14,
              animation: "rain-drop-1 1.3s ease-in infinite",
              display: "inline-block",
            }}
          >
            💧
          </span>
          <span
            style={{
              position: "absolute",
              right: 28,
              bottom: 6,
              fontSize: 11,
              animation: "rain-drop-2 1.3s ease-in 0.45s infinite",
              display: "inline-block",
            }}
          >
            💧
          </span>
          <h1
            className="text-5xl font-extrabold mb-1 tracking-wide"
            style={{
              background:
                "linear-gradient(90deg, #ffffff, #87CEEB, #00BFFF, #e0f7ff, #ffffff)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer-sky 3s linear infinite",
              filter:
                "drop-shadow(0 0 10px rgba(135,206,235,0.95)) drop-shadow(0 0 22px rgba(0,191,255,0.6))",
            }}
          >
            Sinzhu Wafu
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Collect. Hunt. Dominate.
        </p>
      </motion.div>

      {/* Ads Carousel */}
      {ads.length > 0 && (
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AdsCarousel ads={ads} />
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="w-full flex flex-col gap-3"
      >
        <Button
          className="btn-pink w-full py-6 text-base font-bold h-auto"
          onClick={() => onNavigate("hunt")}
          data-ocid="home.start_hunting.primary_button"
        >
          <Zap className="w-5 h-5 mr-2" />
          Start Hunting 🍀
        </Button>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="btn-violet py-4 text-sm font-semibold h-auto"
            onClick={() => onNavigate("harem")}
          >
            🎴 Harem
          </Button>
          <Button
            variant="outline"
            className="btn-violet py-4 text-sm font-semibold h-auto"
            onClick={() => onNavigate("daily")}
          >
            📎 Daily
          </Button>
          <Button
            variant="outline"
            className="btn-violet py-4 text-sm font-semibold h-auto"
            onClick={() => onNavigate("community")}
          >
            🌐 Groups
          </Button>
        </div>
      </motion.div>

      {/* Featured Waifus Grid */}
      {characters && characters.length > 0 && (
        <motion.section
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2">
            <span
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.75 0.22 330), oklch(0.82 0.15 205))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Featured Waifus
            </span>
            🎴
          </h2>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
            data-ocid="home.waifus.list"
          >
            {characters.map((char, i) => (
              <button
                key={char.id}
                type="button"
                className="rounded-xl overflow-hidden flex flex-col text-left"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.14 0.035 290 / 0.9), oklch(0.11 0.03 290 / 0.8))",
                  border: "1px solid oklch(0.22 0.055 290)",
                  boxShadow: "0 12px 30px oklch(0 0 0 / 0.35)",
                }}
                onClick={() => onNavigate("hunt")}
                data-ocid={`home.waifus.item.${i + 1}`}
              >
                <img
                  src={char.imageUrl}
                  alt={char.name}
                  className="w-full object-cover"
                  style={{ height: 128 }}
                />
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold truncate text-center">
                    {char.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </motion.section>
      )}
    </main>
  );
}
