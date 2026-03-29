import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Eye, RefreshCw, XCircle, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { WaifuCharacter } from "../backend";
import { RARITY_CONFIG, SEED_WAIFUS } from "../data/seedData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddWaifuToHarem,
  useCallerProfile,
  useIsAdmin,
  useSaveProfile,
  useWaifuCharacters,
} from "../hooks/useQueries";

const HUNT_STORAGE_KEY = "sinzhu_hunt_state";
const CLAIMED_STORAGE_KEY = "sinzhu_claimed";

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

interface HuntProps {
  onNavigate: (page: Page) => void;
}

interface HuntState {
  characterId: string;
  spawnedAt: number;
}

export default function Hunt({ onNavigate }: HuntProps) {
  const { data: characters } = useWaifuCharacters();
  const { data: profile } = useCallerProfile();
  const { data: isAdmin } = useIsAdmin();
  const { identity, login } = useInternetIdentity();
  const addToHarem = useAddWaifuToHarem();
  const saveProfile = useSaveProfile();

  const [guess, setGuess] = useState("");
  const [huntState, setHuntState] = useState<HuntState | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [lastClaimed, setLastClaimed] = useState<string | null>(null);

  const allCharacters: WaifuCharacter[] =
    characters && characters.length > 0 ? characters : SEED_WAIFUS;

  useEffect(() => {
    const stored = localStorage.getItem(HUNT_STORAGE_KEY);
    if (stored) {
      try {
        setHuntState(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
    const claimedStored = localStorage.getItem(CLAIMED_STORAGE_KEY);
    if (claimedStored) {
      try {
        setClaimedIds(new Set(JSON.parse(claimedStored)));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const spawnWaifu = useCallback(() => {
    if (allCharacters.length === 0) return;
    const available = allCharacters.filter((c) => !claimedIds.has(c.id));
    const pool = available.length > 0 ? available : allCharacters;
    const random = pool[Math.floor(Math.random() * pool.length)];
    const state: HuntState = { characterId: random.id, spawnedAt: Date.now() };
    setHuntState(state);
    setRevealed(false);
    setGuess("");
    setResult(null);
    setLastClaimed(null);
    localStorage.setItem(HUNT_STORAGE_KEY, JSON.stringify(state));
    toast.success("A wild waifu appeared! 🌸");
  }, [allCharacters, claimedIds]);

  const currentCharacter = huntState
    ? (allCharacters.find((c) => c.id === huntState.characterId) ?? null)
    : null;

  const handleGuess = async () => {
    if (!currentCharacter || !guess.trim()) return;
    const correct =
      guess.trim().toLowerCase() === currentCharacter.name.toLowerCase();
    if (correct) {
      setResult("correct");
      setRevealed(true);
      if (identity && profile) {
        try {
          await addToHarem.mutateAsync({
            userId: identity.getPrincipal(),
            characterId: currentCharacter.id,
            isFavorite: false,
            obtainedAt: BigInt(Date.now()),
          });
          const reward = 50n;
          await saveProfile.mutateAsync({
            ...profile,
            balance: profile.balance + reward,
          });
          toast.success(
            `Correct! ${currentCharacter.name} added to your harem! +50 Onex 💰`,
          );
        } catch {
          toast.success(
            `Correct! ${currentCharacter.name} claimed! (Demo mode)`,
          );
        }
      } else {
        toast.success(`Correct! It was ${currentCharacter.name}!`);
      }
      const newClaimed = new Set(claimedIds);
      newClaimed.add(currentCharacter.id);
      setClaimedIds(newClaimed);
      setLastClaimed(currentCharacter.name);
      localStorage.setItem(
        CLAIMED_STORAGE_KEY,
        JSON.stringify([...newClaimed]),
      );
      localStorage.removeItem(HUNT_STORAGE_KEY);
      setHuntState(null);
    } else {
      setResult("wrong");
      toast.error("Wrong guess! Try again! 💀");
      setTimeout(() => setResult(null), 1500);
    }
    setGuess("");
  };

  const rarity = currentCharacter
    ? (RARITY_CONFIG[currentCharacter.rarity] ?? RARITY_CONFIG.common)
    : null;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8" data-ocid="hunt.section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <h1
            className="text-3xl md:text-4xl font-extrabold mb-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.22 330), oklch(0.82 0.15 205))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            🍀 Waifu Hunt
          </h1>
          <p className="text-muted-foreground">
            Guess the character name to claim them!
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          {/* Claimed success CTA */}
          {lastClaimed && !currentCharacter && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-glass rounded-3xl p-8 flex flex-col items-center gap-4 text-center"
              style={{ width: "min(380px, 100%)", maxWidth: 380 }}
            >
              <div className="text-5xl">🎉</div>
              <h3 className="text-xl font-extrabold text-foreground">
                {lastClaimed} claimed!
              </h3>
              <p className="text-sm text-muted-foreground">
                She's now in your harem waiting for you.
              </p>
              <Button
                className="btn-pink w-full h-11"
                onClick={() => onNavigate("harem")}
                data-ocid="hunt.go_harem.button"
              >
                🎴 View in Harem
              </Button>
              <Button
                variant="ghost"
                className="btn-violet w-full h-10 text-sm"
                onClick={spawnWaifu}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Hunt Another
              </Button>
            </motion.div>
          )}

          {!lastClaimed && (
            <>
              {currentCharacter ? (
                <motion.div
                  key={currentCharacter.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`relative rounded-3xl overflow-hidden ${rarity?.className}`}
                  style={{ width: "min(380px, 100%)", maxWidth: 380 }}
                  data-ocid="hunt.card"
                >
                  <div className="relative aspect-[5/7]">
                    <img
                      src={currentCharacter.imageUrl}
                      alt="???"
                      className="w-full h-full object-cover"
                      style={{
                        filter: revealed
                          ? "none"
                          : "blur(24px) brightness(0.4) saturate(0.3)",
                        transition: "filter 0.6s ease",
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, oklch(0.08 0.02 290) 0%, transparent 60%)",
                      }}
                    />
                    {!revealed && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 2,
                          }}
                          className="text-8xl font-black"
                          style={{ color: "oklch(0.75 0.22 330)" }}
                        >
                          ?
                        </motion.div>
                        <span
                          className="mt-2 text-sm font-semibold px-3 py-1 rounded-full"
                          style={{
                            background: "oklch(0.67 0.26 330 / 0.2)",
                            color: "oklch(0.75 0.22 330)",
                            border: "1px solid oklch(0.67 0.26 330 / 0.4)",
                          }}
                        >
                          {currentCharacter.series}
                        </span>
                      </div>
                    )}
                    {revealed && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-2xl font-extrabold text-white">
                          {currentCharacter.name}
                        </h2>
                        <p className="text-sm" style={{ color: rarity?.color }}>
                          {rarity?.label} • {currentCharacter.series}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div
                  className="card-glass rounded-3xl p-12 flex flex-col items-center gap-4 text-center"
                  style={{ width: "min(380px, 100%)", maxWidth: 380 }}
                  data-ocid="hunt.empty_state"
                >
                  <div className="text-6xl animate-float">🌸</div>
                  <h3 className="text-lg font-bold text-foreground">
                    No waifu spawned yet!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isAdmin
                      ? "Click Spawn to summon a waifu."
                      : "Click Spawn to hunt a waifu!"}
                  </p>
                  {!identity && (
                    <Button className="btn-pink px-6" onClick={login}>
                      Login to Save Progress
                    </Button>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="w-full max-w-sm space-y-3">
                {currentCharacter && !revealed && (
                  <>
                    <div className="relative">
                      <Input
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                        placeholder="Type character name..."
                        className="h-12 text-center text-base font-medium rounded-2xl"
                        style={{
                          background: "oklch(0.13 0.035 290)",
                          border:
                            result === "correct"
                              ? "2px solid oklch(0.72 0.18 160)"
                              : result === "wrong"
                                ? "2px solid oklch(0.58 0.22 22)"
                                : "2px solid oklch(0.22 0.055 290)",
                        }}
                        data-ocid="hunt.input"
                      />
                      <AnimatePresence>
                        {result && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {result === "correct" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-destructive" />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <Button
                      className="btn-pink w-full h-12 text-base"
                      onClick={handleGuess}
                      disabled={
                        !guess.trim() ||
                        addToHarem.isPending ||
                        saveProfile.isPending
                      }
                      data-ocid="hunt.submit_button"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Guess! 🍀
                    </Button>
                    <Button
                      variant="ghost"
                      className="btn-violet w-full h-10 text-sm"
                      onClick={() => setRevealed(true)}
                      data-ocid="hunt.secondary_button"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Give Up (Reveal)
                    </Button>
                  </>
                )}

                <Button
                  className="btn-violet w-full h-10 text-sm"
                  onClick={spawnWaifu}
                  data-ocid="hunt.spawn.button"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {currentCharacter ? "Spawn Next Waifu" : "Spawn Waifu"}
                </Button>
              </div>

              {currentCharacter && !revealed && (
                <div
                  className="text-center text-sm"
                  style={{ color: "oklch(0.72 0.04 290)" }}
                >
                  <span>Series: </span>
                  <span className="font-semibold text-foreground">
                    {currentCharacter.series}
                  </span>
                  <span> • Rarity: </span>
                  <span
                    className="font-semibold"
                    style={{ color: rarity?.color }}
                  >
                    {rarity?.label}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}
