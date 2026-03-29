import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SEED_WAIFUS } from "../data/seedData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddWaifuToHarem,
  useCallerProfile,
  useSaveProfile,
  useWaifuCharacters,
} from "../hooks/useQueries";

const DAILY_KEYS = {
  hclaim: "sinzhu_daily_hclaim",
  daily: "sinzhu_daily_onex",
  welkin: "sinzhu_daily_welkin",
  treasure: "sinzhu_daily_treasure",
};

const CLAIM_COOLDOWN = 24 * 60 * 60 * 1000;
type ClaimType = keyof typeof DAILY_KEYS;

function getLastClaim(key: string): number {
  const val = localStorage.getItem(key);
  return val ? Number.parseInt(val, 10) : 0;
}
function canClaim(key: string): boolean {
  return Date.now() - getLastClaim(key) >= CLAIM_COOLDOWN;
}
function setClaimed(key: string) {
  localStorage.setItem(key, Date.now().toString());
}
function formatCooldown(key: string): string {
  const remaining = CLAIM_COOLDOWN - (Date.now() - getLastClaim(key));
  if (remaining <= 0) return "Ready!";
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

interface DailyProps {
  onNavigate: (page: string) => void;
}

export default function Daily({ onNavigate }: DailyProps) {
  const { identity, login } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const { data: characters } = useWaifuCharacters();
  const saveProfile = useSaveProfile();
  const addToHarem = useAddWaifuToHarem();

  const [claimStates, setClaimStates] = useState<Record<ClaimType, boolean>>(
    () => ({
      hclaim: canClaim(DAILY_KEYS.hclaim),
      daily: canClaim(DAILY_KEYS.daily),
      welkin: canClaim(DAILY_KEYS.welkin),
      treasure: canClaim(DAILY_KEYS.treasure),
    }),
  );

  const [cooldowns, setCooldowns] = useState<Record<ClaimType, string>>(() => ({
    hclaim: formatCooldown(DAILY_KEYS.hclaim),
    daily: formatCooldown(DAILY_KEYS.daily),
    welkin: formatCooldown(DAILY_KEYS.welkin),
    treasure: formatCooldown(DAILY_KEYS.treasure),
  }));

  const [pending, setPending] = useState<ClaimType | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setClaimStates({
        hclaim: canClaim(DAILY_KEYS.hclaim),
        daily: canClaim(DAILY_KEYS.daily),
        welkin: canClaim(DAILY_KEYS.welkin),
        treasure: canClaim(DAILY_KEYS.treasure),
      });
      setCooldowns({
        hclaim: formatCooldown(DAILY_KEYS.hclaim),
        daily: formatCooldown(DAILY_KEYS.daily),
        welkin: formatCooldown(DAILY_KEYS.welkin),
        treasure: formatCooldown(DAILY_KEYS.treasure),
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const allCharacters =
    characters && characters.length > 0 ? characters : SEED_WAIFUS;

  const handleClaim = async (type: ClaimType) => {
    if (!canClaim(DAILY_KEYS[type])) {
      toast.error("Already claimed! Come back later.");
      return;
    }
    setPending(type);
    setClaimed(DAILY_KEYS[type]);
    setClaimStates((prev) => ({ ...prev, [type]: false }));
    setCooldowns((prev) => ({
      ...prev,
      [type]: formatCooldown(DAILY_KEYS[type]),
    }));

    if (type === "hclaim") {
      const randomChar =
        allCharacters[Math.floor(Math.random() * allCharacters.length)];
      if (identity) {
        try {
          await addToHarem.mutateAsync({
            userId: identity.getPrincipal(),
            characterId: randomChar.id,
            isFavorite: false,
            obtainedAt: BigInt(Date.now()),
          });
        } catch {
          /* demo */
        }
      }
      toast.success(`🎠 Free waifu claimed: ${randomChar.name}!`);
      setPending(null);
      return;
    }

    const rewards: Record<
      ClaimType,
      { amount: bigint; label: string; emoji: string }
    > = {
      hclaim: { amount: 0n, label: "", emoji: "" },
      daily: { amount: 100n, label: "100 Onex", emoji: "📎" },
      welkin: { amount: 50n, label: "50 Onex", emoji: "🗓" },
      treasure: {
        amount: BigInt(Math.floor(Math.random() * 150) + 25),
        label: "Random Onex",
        emoji: "🪅",
      },
    };

    const reward = rewards[type];
    if (profile && reward.amount > 0n) {
      try {
        await saveProfile.mutateAsync({
          ...profile,
          balance: profile.balance + reward.amount,
        });
        toast.success(`${reward.emoji} Claimed ${Number(reward.amount)} Onex!`);
      } catch {
        toast.success(`${reward.emoji} Claimed ${reward.label}! (Demo mode)`);
      }
    } else if (!identity) {
      toast.info(`${reward.emoji} Login to save your rewards!`);
    } else {
      toast.success(`${reward.emoji} Claimed!`);
    }
    setPending(null);
  };

  const CLAIMS = [
    {
      type: "hclaim" as ClaimType,
      icon: "🎠",
      title: "Daily Free Waifu",
      description: "Claim a random waifu character every 24 hours",
      reward: "1 Random Waifu",
      color: "oklch(0.75 0.22 330)",
      borderColor: "oklch(0.67 0.26 330)",
    },
    {
      type: "daily" as ClaimType,
      icon: "📎",
      title: "Daily Onex",
      description: "Your daily allowance of Onex currency",
      reward: "100 Onex",
      color: "oklch(0.82 0.15 205)",
      borderColor: "oklch(0.82 0.15 205)",
    },
    {
      type: "welkin" as ClaimType,
      icon: "🗓",
      title: "Welkin Reward",
      description: "Daily Welkin bonus for loyal players",
      reward: "50 Onex",
      color: "oklch(0.59 0.22 295)",
      borderColor: "oklch(0.59 0.22 295)",
    },
    {
      type: "treasure" as ClaimType,
      icon: "🪅",
      title: "Daily Treasure",
      description: "Open a mystery treasure for random Onex!",
      reward: "25–175 Onex",
      color: "oklch(0.82 0.15 75)",
      borderColor: "oklch(0.82 0.15 75)",
    },
  ];

  return (
    <main className="max-w-3xl mx-auto px-4 py-8" data-ocid="daily.section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
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
            📎 Daily Rewards
          </h1>
          <p className="text-muted-foreground">
            Claim your free rewards every 24 hours!
          </p>
        </div>

        {!identity && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl p-4 flex items-center justify-between gap-4"
            style={{
              background: "oklch(0.75 0.22 330 / 0.08)",
              border: "1px solid oklch(0.75 0.22 330 / 0.3)",
            }}
          >
            <div>
              <p className="font-semibold text-sm">
                🔐 Login to save your rewards
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Coins and waifus won't be saved without login.
              </p>
            </div>
            <Button className="btn-pink px-5 shrink-0" onClick={login}>
              Login 😍
            </Button>
          </motion.div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {CLAIMS.map((claim, i) => {
            const ready = claimStates[claim.type];
            const isPending = pending === claim.type;
            return (
              <motion.div
                key={claim.type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="card-glass rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  border: `1px solid ${claim.borderColor}${ready ? "66" : "22"}`,
                }}
                data-ocid={`daily.${claim.type}.card`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                    style={{
                      background: `${claim.color}15`,
                      border: `1px solid ${claim.color}33`,
                      opacity: ready ? 1 : 0.5,
                    }}
                  >
                    {ready ? claim.icon : "🔒"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{claim.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {claim.description}
                    </p>
                    <div
                      className="mt-2 text-sm font-bold"
                      style={{
                        color: ready ? claim.color : "oklch(0.50 0.02 290)",
                      }}
                    >
                      {claim.reward}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {ready ? (
                    <Button
                      className="btn-pink flex-1 h-10"
                      onClick={() => handleClaim(claim.type)}
                      disabled={isPending}
                      data-ocid={`daily.${claim.type}.claim_button`}
                    >
                      {isPending ? "Claiming..." : `Claim ${claim.icon}`}
                    </Button>
                  ) : (
                    <div
                      className="flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-sm"
                      style={{
                        background: "oklch(0.14 0.03 290)",
                        border: "1px solid oklch(0.20 0.04 290)",
                        color: "oklch(0.55 0.04 290)",
                      }}
                    >
                      ⏰ {cooldowns[claim.type]}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-6 px-4 pb-6">
        <p className="text-xs text-center mb-3" style={{ color: "#4a6278" }}>
          Other Daily Rewards
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onNavigate("welkin")}
            className="flex items-center gap-2 p-3 rounded-xl transition-all hover:brightness-110"
            style={{ background: "#1c2733", border: "1px solid #2b3d54" }}
            data-ocid="daily.welkin.button"
          >
            <span className="text-2xl">🗓</span>
            <div className="text-left">
              <p className="font-bold text-sm" style={{ color: "#e8f4fd" }}>
                Welkin
              </p>
              <p className="text-xs" style={{ color: "#8eacbb" }}>
                +150 Onex daily
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("treasure")}
            className="flex items-center gap-2 p-3 rounded-xl transition-all hover:brightness-110"
            style={{ background: "#1c2733", border: "1px solid #2b3d54" }}
            data-ocid="daily.treasure.button"
          >
            <span className="text-2xl">🪅</span>
            <div className="text-left">
              <p className="font-bold text-sm" style={{ color: "#e8f4fd" }}>
                Treasure
              </p>
              <p className="text-xs" style={{ color: "#8eacbb" }}>
                Random rewards
              </p>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
