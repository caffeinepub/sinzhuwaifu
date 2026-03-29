import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import {
  ArrowLeft,
  Camera,
  Check,
  MessageCircle,
  Mic,
  MicOff,
  Paperclip,
  Pause,
  Pencil,
  Phone,
  PhoneOff,
  Play,
  Plus,
  Search,
  Send,
  Trash2,
  UserPlus,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { GroupMessage } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddMemberToGroup,
  useCreateGroup,
  useGetGroupMessages,
  useGroups,
  useHuntWaifuInGroup,
  useJoinGroup,
  useMessagesWith,
  useSendDM,
  useSendFriendRequest,
  useSendGroupMessage,
} from "../hooks/useQueries";

// ─── 120 Active Simulated Members ─────────────────────────────────────────
const ACTIVE_MEMBERS = [
  { id: "m1", name: "NarutoFan99", avatar: "N" },
  { id: "m2", name: "SakuraChan", avatar: "S" },
  { id: "m3", name: "ItachiSama", avatar: "I" },
  { id: "m4", name: "TanjiroKun", avatar: "T" },
  { id: "m5", name: "ZenitsuThunder", avatar: "Z" },
  { id: "m6", name: "InosukeBoar", avatar: "I" },
  { id: "m7", name: "LuffyGear5", avatar: "L" },
  { id: "m8", name: "ZoroLost", avatar: "Z" },
  { id: "m9", name: "NamiNavigator", avatar: "N" },
  { id: "m10", name: "SanjiBaka", avatar: "S" },
  { id: "m11", name: "MaduraSenin", avatar: "M" },
  { id: "m12", name: "HashiramaKun", avatar: "H" },
  { id: "m13", name: "GaaraOfSand", avatar: "G" },
  { id: "m14", name: "RockLeeYouth", avatar: "R" },
  { id: "m15", name: "KakashiSensei", avatar: "K" },
  { id: "m16", name: "MinatoFlash", avatar: "M" },
  { id: "m17", name: "HinataShy", avatar: "H" },
  { id: "m18", name: "SasukeCold", avatar: "S" },
  { id: "m19", name: "MikasaAOT", avatar: "M" },
  { id: "m20", name: "ErenYeager", avatar: "E" },
  { id: "m21", name: "LeviAckerman", avatar: "L" },
  { id: "m22", name: "ArminStrategist", avatar: "A" },
  { id: "m23", name: "HanjiZoe", avatar: "H" },
  { id: "m24", name: "ReinerTitan", avatar: "R" },
  { id: "m25", name: "AnnieLeonhart", avatar: "A" },
  { id: "m26", name: "ToshiroHitsugaya", avatar: "T" },
  { id: "m27", name: "IchigoBankai", avatar: "I" },
  { id: "m28", name: "RukiaKuchiki", avatar: "R" },
  { id: "m29", name: "OrihimeInoue", avatar: "O" },
  { id: "m30", name: "UryuQuincy", avatar: "U" },
  { id: "m31", name: "GokuSSBlue", avatar: "G" },
  { id: "m32", name: "VegetaElite", avatar: "V" },
  { id: "m33", name: "PiccoloSensei", avatar: "P" },
  { id: "m34", name: "GohanHalfSaiyan", avatar: "G" },
  { id: "m35", name: "TrunksFuture", avatar: "T" },
  { id: "m36", name: "EdwardElric", avatar: "E" },
  { id: "m37", name: "AlphonseArmor", avatar: "A" },
  { id: "m38", name: "RoyMustang", avatar: "R" },
  { id: "m39", name: "WinryRockbell", avatar: "W" },
  { id: "m40", name: "ScarFMA", avatar: "S" },
  { id: "m41", name: "KilluaSpeed", avatar: "K" },
  { id: "m42", name: "GonFreecss", avatar: "G" },
  { id: "m43", name: "HisokaMorow", avatar: "H" },
  { id: "m44", name: "KurapikaCrimson", avatar: "K" },
  { id: "m45", name: "LeorioMD", avatar: "L" },
  { id: "m46", name: "YusukeUrameshi", avatar: "Y" },
  { id: "m47", name: "KuwabakaMoron", avatar: "K" },
  { id: "m48", name: "HieiDragon", avatar: "H" },
  { id: "m49", name: "KuramaSage", avatar: "K" },
  { id: "m50", name: "SpikeSpiegell", avatar: "S" },
  { id: "m51", name: "JetBlackCowboy", avatar: "J" },
  { id: "m52", name: "FayeValentine", avatar: "F" },
  { id: "m53", name: "EdwardCowboy", avatar: "E" },
  { id: "m54", name: "SesshomaruCool", avatar: "S" },
  { id: "m55", name: "InuyashaHalf", avatar: "I" },
  { id: "m56", name: "KagomeArrow", avatar: "K" },
  { id: "m57", name: "MirokuMonk", avatar: "M" },
  { id: "m58", name: "SangoSlayer", avatar: "S" },
  { id: "m59", name: "KenshinHimura", avatar: "K" },
  { id: "m60", name: "SaitamaOP", avatar: "S" },
  { id: "m61", name: "GenosCore", avatar: "G" },
  { id: "m62", name: "TatsumakilSpin", avatar: "T" },
  { id: "m63", name: "FlashdFlash", avatar: "F" },
  { id: "m64", name: "SilverFang", avatar: "S" },
  { id: "m65", name: "MobPsycho", avatar: "M" },
  { id: "m66", name: "ReigenArataka", avatar: "R" },
  { id: "m67", name: "TonerioMP100", avatar: "T" },
  { id: "m68", name: "DekuSmash", avatar: "D" },
  { id: "m69", name: "KacchanBlast", avatar: "K" },
  { id: "m70", name: "ShotoIce", avatar: "S" },
  { id: "m71", name: "AllMight", avatar: "A" },
  { id: "m72", name: "EraserHead", avatar: "E" },
  { id: "m73", name: "YaoyorozuCraft", avatar: "Y" },
  { id: "m74", name: "UrarakaZero", avatar: "U" },
  { id: "m75", name: "AsuidoFrog", avatar: "A" },
  { id: "m76", name: "DemonSlayer01", avatar: "D" },
  { id: "m77", name: "RengokuFlame", avatar: "R" },
  { id: "m78", name: "UzuiSound", avatar: "U" },
  { id: "m79", name: "MitsuriBow", avatar: "M" },
  { id: "m80", name: "ObanaiSnake", avatar: "O" },
  { id: "m81", name: "SanemiWind", avatar: "S" },
  { id: "m82", name: "GyomeiStone", avatar: "G" },
  { id: "m83", name: "MuichiroMist", avatar: "M" },
  { id: "m84", name: "YorichiSun", avatar: "Y" },
  { id: "m85", name: "JiraiyaSage", avatar: "J" },
  { id: "m86", name: "TsunadeSannin", avatar: "T" },
  { id: "m87", name: "OrochimSpell", avatar: "O" },
  { id: "m88", name: "PainNagato", avatar: "P" },
  { id: "m89", name: "KonanPaper", avatar: "K" },
  { id: "m90", name: "ObietoMask", avatar: "O" },
  { id: "m91", name: "ShikamaDeer", avatar: "S" },
  { id: "m92", name: "ChoujiFood", avatar: "C" },
  { id: "m93", name: "InoFlower", avatar: "I" },
  { id: "m94", name: "KibaInuzuka", avatar: "K" },
  { id: "m95", name: "ShiNoWater", avatar: "S" },
  { id: "m96", name: "NejiByakugan", avatar: "N" },
  { id: "m97", name: "TenTenWeapon", avatar: "T" },
  { id: "m98", name: "AnkoOrochimi", avatar: "A" },
  { id: "m99", name: "KurenaiGenjutsu", avatar: "K" },
  { id: "m100", name: "AsumaSensei", avatar: "A" },
  { id: "m101", name: "GuyGreenBeast", avatar: "G" },
  { id: "m102", name: "DanzouRoot", avatar: "D" },
  { id: "m103", name: "OnokiDust", avatar: "O" },
  { id: "m104", name: "TsuchikazeWind", avatar: "T" },
  { id: "m105", name: "KillerBeeRap", avatar: "K" },
  { id: "m106", name: "AiWatcher", avatar: "A" },
  { id: "m107", name: "FuuTail", avatar: "F" },
  { id: "m108", name: "HanTail", avatar: "H" },
  { id: "m109", name: "UtakataBubble", avatar: "U" },
  { id: "m110", name: "YugakoTail", avatar: "Y" },
  { id: "m111", name: "RooshiTail", avatar: "R" },
  { id: "m112", name: "ChojuroMist", avatar: "C" },
  { id: "m113", name: "TerumiBrine", avatar: "T" },
  { id: "m114", name: "AoScanEye", avatar: "A" },
  { id: "m115", name: "MifuneKatana", avatar: "M" },
  { id: "m116", name: "SamuraiEdge", avatar: "S" },
  { id: "m117", name: "TodorokiHalf", avatar: "T" },
  { id: "m118", name: "Froppy1A", avatar: "F" },
  { id: "m119", name: "OverhaullArc", avatar: "O" },
  { id: "m120", name: "ShigarakiDecay", avatar: "S" },
];

const BOT_MESSAGES = [
  (_a: string, b: string) =>
    `Bhai @${b} ne woh Demon Slayer ka latest episode dekha? 🔥 Rengoku toh best tha yaar`,
  (_a: string, b: string) =>
    `@${b} bhai, Tanjiro ka water breathing technique bahut OP hai 😤`,
  (_a: string, _b: string) =>
    "One Piece ka latest arc mast chal raha hai, Luffy Gear 5 is insane! 💪",
  (_a: string, _b: string) =>
    "Koi AOT spoiler mat dena please 😭 main abhi watch kar raha hoon",
  (_a: string, b: string) =>
    `@${b} bhai tujhe pata hai Madara vs Hashirama arc ending? Bata de yaar`,
  (_a: string, _b: string) =>
    "Naruto Shippuden mein Jiraiya ka scene... rona aaya yaar seriously 😢",
  (_a: string, b: string) =>
    `@${b} Bleach TYBW arc dekhi? Ichigo Bankai scene mast tha bhai!`,
  (_a: string, _b: string) =>
    "Dragon Ball Super: Broly movie best movie hai anime history mein no cap 🔥",
  (_a: string, b: string) =>
    `@${b} bhai teri favourite waifu kaun hai? Meri toh Hinata hai 💙`,
  (_a: string, _b: string) =>
    "Fullmetal Alchemist Brotherhood ending ne toh dil tod diya yaar 💔",
  (_a: string, _b: string) =>
    "HxH manga kab complete hoga? Togashi sensei please update karo 😩",
  (_a: string, b: string) =>
    `@${b} Mob Psycho 100 Season 3 bahut emotional tha, agree karta hai?`,
  (_a: string, _b: string) =>
    "Boku no Hero Academia ka All Might ne motivate kiya life mein sach mein 💪",
  (_a: string, b: string) =>
    `@${b} Sword Art Online ya Re:Zero - kaun sa better lagta hai tujhe?`,
  (_a: string, _b: string) =>
    "Vinland Saga ek masterpiece hai bhai, sab log dekho please 🙏",
  (_a: string, b: string) => `@${b} One Punch Man Season 3 kab aayega? 😭`,
  (_a: string, _b: string) =>
    "Jujutsu Kaisen Gojo vs Sukuna fight... bhai meri awaaz nahi nikal rahi 🤯",
  (_a: string, b: string) =>
    `@${b} Attack on Titan ending ke baare mein kya socha? Controversial hai yaar`,
  (_a: string, _b: string) =>
    "Chainsaw Man Part 2 manga padh raha hoon, Asa Mitaka character best hai",
  (_a: string, b: string) =>
    `@${b} Tokyo Ghoul manga ya anime - kaun sa follow kiya tune?`,
  () =>
    `[MEDIA]:https://picsum.photos/seed/anime${Math.floor(Math.random() * 50) + 1}/300/200`,
  (_a: string, _b: string) =>
    "Kimetsu no Yaiba OST sunta hoon roz, bhai Yuki Kajiura ki magic hai ❤️",
  (_a: string, b: string) =>
    `@${b} Steins;Gate dekhi? Time travel anime mein best hai guaranteed`,
  (_a: string, _b: string) =>
    "Evangelion ka ending aaj bhi samajh nahi aaya mujhe honestly 🤔",
  (_a: string, b: string) =>
    `@${b} Cowboy Bebop live action Netflix wala kaisa laga? OG se compare karo toh?`,
  (_a: string, _b: string) =>
    "Oshi no Ko twist ne toh dimag hi blow kar diya 🤯🔥",
  (_a: string, b: string) =>
    `@${b} Blue Lock episode 1 se hooked ho gaya tha main, best sports anime`,
  (_a: string, _b: string) =>
    "Spy x Family toh pure family vibes hai, Anya adorable hai 🥰",
  (_a: string, b: string) =>
    `@${b} bhai kaunsa arc best lagta hai Naruto ka? Mera favourite Pain arc hai`,
  (_a: string, _b: string) =>
    "Bleach Thousand Year Blood War animation studio ne kya kaam kiya bhai! 🙌",
];

const BOT_REPLY_TEMPLATES = [
  (u: string) => `@${u} bhai sahi kaha! Main bhi yahi soch raha tha 🔥`,
  (u: string) => `@${u} agree yaar, aaj kal yahi chal raha hai anime mein`,
  (u: string) => `@${u} bhai tu bhi hunter hai? Respect! 👊`,
  (u: string) => `@${u} haha bilkul sahi! Wahi toh 😂`,
  (u: string) => `@${u} bhai tu kab se hunt kar raha hai? Mujhe bhi sikhao`,
  (u: string) => `@${u} arre wah, interesting point hai tera yaar`,
  (u: string) => `@${u} 100% agree bhai, aur kya kehna`,
  (u: string) => `@${u} bhai ye toh mujhe bhi pasand aaya 👌`,
  (u: string) => `@${u} bilkul! Aur Demon Slayer mein bhi aisa hi tha na?`,
  (u: string) => `@${u} sach mein yaar, ye anime wale kya hi banate hain 🙌`,
  (u: string) => `@${u} hahaha bhai tu toh expert hai is topic pe`,
  (u: string) => `@${u} ek number bhai, mast point tha 💯`,
];

function getRandomBotReply(userName: string): string {
  const template =
    BOT_REPLY_TEMPLATES[Math.floor(Math.random() * BOT_REPLY_TEMPLATES.length)];
  return template(userName);
}

function getRandomBotMessage(userName?: string): string {
  // 30% chance to mention the real user if userName provided
  if (userName && Math.random() < 0.3) {
    return getRandomBotReply(userName);
  }
  const a = ACTIVE_MEMBERS[Math.floor(Math.random() * ACTIVE_MEMBERS.length)];
  const b = ACTIVE_MEMBERS[Math.floor(Math.random() * ACTIVE_MEMBERS.length)];
  const template =
    BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];
  return template(a.name, b.name);
}

const MOCK_FRIENDS = [
  {
    id: "friend-1",
    name: "Sakura Master",
    username: "sakuramaster",
    avatar: "S",
    status: "online",
  },
  {
    id: "friend-2",
    name: "Night Hunter",
    username: "nighthunter",
    avatar: "N",
    status: "offline",
  },
  {
    id: "friend-3",
    name: "Yuki Chan",
    username: "yukichan99",
    avatar: "Y",
    status: "online",
  },
];

function formatTime(ts: bigint) {
  const ms = Number(ts) / 1_000_000;
  const d = new Date(ms);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function fmtDuration(secs: number): string {
  if (!Number.isFinite(secs) || Number.isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmtCallDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ─── Custom Voice Player ───────────────────────────────────────────────────
function VoicePlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrent(el.currentTime);
    const onMeta = () => setDuration(el.duration);
    const onEnded = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play();
      setPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = ratio * duration;
  };

  const progress = duration ? (current / duration) * 100 : 0;

  return (
    <div
      className="flex items-center gap-2.5"
      style={{ minWidth: "180px", maxWidth: "240px" }}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: voice message playback */}
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
        style={{
          background: "oklch(0.59 0.22 295 / 0.35)",
          border: "1px solid oklch(0.59 0.22 295 / 0.5)",
          color: "oklch(0.88 0.12 295)",
        }}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <Pause className="w-3.5 h-3.5" />
        ) : (
          <Play className="w-3.5 h-3.5 ml-0.5" />
        )}
      </button>
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div
          className="w-full h-1.5 rounded-full cursor-pointer"
          style={{ background: "oklch(0.28 0.06 290)" }}
          onClick={handleSeek}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") togglePlay();
          }}
          role="slider"
          aria-label="Audio progress"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, oklch(0.75 0.18 295), oklch(0.70 0.22 310))",
            }}
          />
        </div>
        <span className="text-xs" style={{ color: "oklch(0.65 0.08 290)" }}>
          {fmtDuration(current)} / {fmtDuration(duration)}
        </span>
      </div>
    </div>
  );
}

// ─── Render message content ────────────────────────────────────────────────
function renderMessageContent(content: string) {
  if (content.startsWith("[VOICE]:")) {
    const src = content.slice("[VOICE]:".length);
    return <VoicePlayer src={src} />;
  }
  if (content.startsWith("[MEDIA]:")) {
    const src = content.slice("[MEDIA]:".length);
    if (src.startsWith("data:video")) {
      return (
        <video controls src={src} className="max-w-full rounded-lg max-h-48">
          <track kind="captions" />
        </video>
      );
    }
    return (
      <img
        src={src}
        alt="media"
        className="max-w-full rounded-lg max-h-48 object-cover"
      />
    );
  }
  // Highlight @mentions in gold
  const mentionRegex = /(@\w+)/g;
  const parts = content.split(mentionRegex);
  if (parts.length > 1) {
    return (
      <span>
        {parts.map((part, i) => {
          const key = `part-${i}`;
          return mentionRegex.test(part) ? (
            <span
              key={key}
              style={{ color: "oklch(0.85 0.20 80)", fontWeight: 700 }}
            >
              {part}
            </span>
          ) : (
            <span key={key}>{part}</span>
          );
        })}
      </span>
    );
  }
  return <span>{content}</span>;
}

// ─── Group Call Overlay ────────────────────────────────────────────────────
interface CallParticipant {
  id: string;
  name: string;
  avatar: string;
  micOn: boolean;
  videoOn: boolean;
  isYou?: boolean;
}

function GroupCallOverlay({
  groupName,
  onClose,
}: {
  groupName: string;
  onClose: () => void;
}) {
  const [joined, setJoined] = useState(false);
  const [callMode, setCallMode] = useState<"voice" | "video">("voice");
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(false);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [callSeconds, setCallSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botJoinRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const botLeaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer
  useEffect(() => {
    if (!joined) return;
    timerRef.current = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [joined]);

  // Bot join/leave simulation
  useEffect(() => {
    if (!joined) return;

    const scheduleJoin = () => {
      const delay = 2000 + Math.random() * 3000;
      botJoinRef.current = setTimeout(() => {
        setParticipants((prev) => {
          if (prev.length >= 8) {
            scheduleJoin();
            return prev;
          }
          const existing = new Set(prev.map((p) => p.id));
          const available = ACTIVE_MEMBERS.filter(
            (m) => !existing.has(m.id) && m.id !== "you",
          );
          if (available.length === 0) {
            scheduleJoin();
            return prev;
          }
          const bot = available[Math.floor(Math.random() * available.length)];
          toast(`📞 ${bot.name} joined the call`, { duration: 2000 });
          const next = [
            ...prev,
            {
              id: bot.id,
              name: bot.name,
              avatar: bot.avatar,
              micOn: Math.random() > 0.3,
              videoOn: Math.random() > 0.5,
            },
          ];
          scheduleJoin();
          return next;
        });
      }, delay);
    };

    const scheduleLeave = () => {
      const delay = 15000 + Math.random() * 20000;
      botLeaveRef.current = setTimeout(() => {
        setParticipants((prev) => {
          const bots = prev.filter((p) => !p.isYou);
          if (bots.length === 0) {
            scheduleLeave();
            return prev;
          }
          const bot = bots[Math.floor(Math.random() * bots.length)];
          toast(`📴 ${bot.name} left the call`, { duration: 2000 });
          scheduleLeave();
          return prev.filter((p) => p.id !== bot.id);
        });
      }, delay);
    };

    // Start with a few bots joining quickly
    const initialCount = 3 + Math.floor(Math.random() * 3);
    const shuffled = [...ACTIVE_MEMBERS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < initialCount; i++) {
      const bot = shuffled[i];
      const delay = (i + 1) * (2000 + Math.random() * 1500);
      setTimeout(() => {
        setParticipants((prev) => [
          ...prev,
          {
            id: bot.id,
            name: bot.name,
            avatar: bot.avatar,
            micOn: Math.random() > 0.3,
            videoOn: Math.random() > 0.5,
          },
        ]);
        toast(`📞 ${bot.name} joined the call`, { duration: 2000 });
      }, delay);
    }

    scheduleJoin();
    scheduleLeave();

    return () => {
      if (botJoinRef.current) clearTimeout(botJoinRef.current);
      if (botLeaveRef.current) clearTimeout(botLeaveRef.current);
    };
  }, [joined]);

  const handleJoin = () => {
    setJoined(true);
    setParticipants([
      {
        id: "you",
        name: "You",
        avatar: "Y",
        micOn: true,
        videoOn: callMode === "video",
        isYou: true,
      },
    ]);
  };

  const handleLeave = () => {
    setJoined(false);
    setParticipants([]);
    setCallSeconds(0);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "oklch(0.08 0.025 290)" }}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid oklch(0.20 0.05 290)" }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="font-bold text-sm">{groupName}</p>
            {joined && (
              <p className="text-xs" style={{ color: "oklch(0.72 0.18 160)" }}>
                {fmtCallDuration(callSeconds)} • {participants.length} in call
              </p>
            )}
          </div>
        </div>
        {/* Voice / Video toggle */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: "1px solid oklch(0.22 0.055 290)" }}
        >
          <button
            type="button"
            onClick={() => setCallMode("voice")}
            className="px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background:
                callMode === "voice"
                  ? "oklch(0.59 0.22 295 / 0.3)"
                  : "transparent",
              color:
                callMode === "voice"
                  ? "oklch(0.88 0.12 295)"
                  : "oklch(0.65 0.08 290)",
            }}
          >
            🎙 Voice
          </button>
          <button
            type="button"
            onClick={() => setCallMode("video")}
            className="px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background:
                callMode === "video"
                  ? "oklch(0.59 0.22 295 / 0.3)"
                  : "transparent",
              color:
                callMode === "video"
                  ? "oklch(0.88 0.12 295)"
                  : "oklch(0.65 0.08 290)",
            }}
          >
            📹 Video
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        {!joined ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.20 0.08 295 / 0.3)",
                border: "2px solid oklch(0.59 0.22 295 / 0.5)",
              }}
            >
              {callMode === "voice" ? (
                <Phone
                  className="w-8 h-8"
                  style={{ color: "oklch(0.75 0.18 295)" }}
                />
              ) : (
                <Video
                  className="w-8 h-8"
                  style={{ color: "oklch(0.75 0.18 295)" }}
                />
              )}
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{groupName}</p>
              <p className="text-sm text-muted-foreground">
                {callMode === "voice" ? "Voice Call" : "Video Call"}
              </p>
            </div>
            <Button
              className="px-8 py-3 h-auto rounded-2xl font-bold"
              style={{
                background: "oklch(0.55 0.22 160)",
                color: "white",
              }}
              onClick={handleJoin}
              data-ocid="community.call.primary_button"
            >
              📞 Join Call
            </Button>
          </div>
        ) : (
          <div>
            <AnimatePresence>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {participants.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="rounded-2xl p-4 flex flex-col items-center gap-2"
                    style={{
                      background: p.isYou
                        ? "oklch(0.59 0.22 295 / 0.15)"
                        : "oklch(0.14 0.04 290)",
                      border: p.isYou
                        ? "1px solid oklch(0.59 0.22 295 / 0.4)"
                        : "1px solid oklch(0.20 0.05 290)",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{
                        background: "oklch(0.25 0.08 295 / 0.5)",
                        color: "oklch(0.82 0.15 295)",
                      }}
                    >
                      {p.avatar}
                    </div>
                    <p className="text-xs font-semibold text-center truncate w-full text-center">
                      {p.name}
                    </p>
                    <div className="flex gap-2">
                      <span
                        style={{
                          color: p.micOn
                            ? "oklch(0.72 0.18 160)"
                            : "oklch(0.65 0.22 25)",
                        }}
                      >
                        {p.micOn ? (
                          <Mic className="w-3.5 h-3.5" />
                        ) : (
                          <MicOff className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span
                        style={{
                          color: p.videoOn
                            ? "oklch(0.72 0.18 160)"
                            : "oklch(0.65 0.22 25)",
                        }}
                      >
                        {p.videoOn ? (
                          <Video className="w-3.5 h-3.5" />
                        ) : (
                          <VideoOff className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom Controls (only when joined) */}
      {joined && (
        <div
          className="flex items-center justify-center gap-4 p-4 shrink-0"
          style={{ borderTop: "1px solid oklch(0.20 0.05 290)" }}
        >
          <button
            type="button"
            onClick={() => setMicOn((v) => !v)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: micOn
                ? "oklch(0.20 0.06 290)"
                : "oklch(0.65 0.22 25 / 0.3)",
              border: `1px solid ${
                micOn ? "oklch(0.35 0.08 290)" : "oklch(0.65 0.22 25 / 0.5)"
              }`,
              color: micOn ? "oklch(0.85 0.05 290)" : "oklch(0.65 0.22 25)",
            }}
            title={micOn ? "Mute" : "Unmute"}
            data-ocid="community.call.toggle"
          >
            {micOn ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </button>

          {callMode === "video" && (
            <button
              type="button"
              onClick={() => setVideoOn((v) => !v)}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: videoOn
                  ? "oklch(0.20 0.06 290)"
                  : "oklch(0.65 0.22 25 / 0.3)",
                border: `1px solid ${
                  videoOn ? "oklch(0.35 0.08 290)" : "oklch(0.65 0.22 25 / 0.5)"
                }`,
                color: videoOn ? "oklch(0.85 0.05 290)" : "oklch(0.65 0.22 25)",
              }}
              title={videoOn ? "Stop Video" : "Start Video"}
              data-ocid="community.call.secondary_button"
            >
              {videoOn ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleLeave}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: "oklch(0.55 0.22 25)",
              color: "white",
            }}
            title="Leave Call"
            data-ocid="community.call.delete_button"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── GroupChat Component ───────────────────────────────────────────────────
interface GroupChatProps {
  groupName: string;
  memberCount: number;
  onBack: () => void;
}

function GroupChat({
  groupName,
  memberCount: _memberCount,
  onBack,
}: GroupChatProps) {
  const { identity } = useInternetIdentity();
  const { data: backendMessages } = useGetGroupMessages(groupName);
  const sendMsg = useSendGroupMessage();
  const huntWaifu = useHuntWaifuInGroup();
  const addMember = useAddMemberToGroup();

  const [input, setInput] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberPrincipal, setMemberPrincipal] = useState("");
  const [localMessages, setLocalMessages] = useState<GroupMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [showCall, setShowCall] = useState(false);
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const groupPhotoInputRef = useRef<HTMLInputElement>(null);
  const botIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const myPrincipal = identity?.getPrincipal().toString();
  const localStorageKey = `groupMessages_${groupName}`;
  const deletedIdsKey = `deletedMsgIds_${groupName}`;
  const groupPhotoKey = `groupPhoto_${groupName}`;

  // Load group photo
  useEffect(() => {
    const saved = localStorage.getItem(groupPhotoKey);
    if (saved) setGroupPhoto(saved);
  }, [groupPhotoKey]);

  // Load local messages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(localStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocalMessages(
          parsed.map((m: any) => ({
            ...m,
            timestamp: BigInt(m.timestamp),
            senderPrincipal: {
              toString: () => m.senderPrincipalStr || "anonymous",
            },
          })),
        );
      }
      const storedDeleted = localStorage.getItem(deletedIdsKey);
      if (storedDeleted) {
        setDeletedIds(new Set(JSON.parse(storedDeleted)));
      }
    } catch {
      /* ignore */
    }
  }, [localStorageKey, deletedIdsKey]);

  // ── 100+ Active Members auto-chat ──────────────────────────────────────
  useEffect(() => {
    let active = true;
    const scheduleNext = () => {
      if (!active) return;
      const delay = 8000 + Math.random() * 7000;
      botIntervalRef.current = setTimeout(() => {
        if (!active) return;
        const bot =
          ACTIVE_MEMBERS[Math.floor(Math.random() * ACTIVE_MEMBERS.length)];
        const currentUserName = (() => {
          try {
            return (
              JSON.parse(localStorage.getItem("userProfile") || "{}").name || ""
            );
          } catch {
            return "";
          }
        })();
        const content = getRandomBotMessage(currentUserName || undefined);
        const botMsg: GroupMessage = {
          id: `bot_${Date.now()}_${Math.random()}`,
          groupName,
          senderPrincipal: { toString: () => bot.id } as any,
          senderName: bot.name,
          content,
          timestamp: BigInt(Date.now() * 1_000_000),
          isWaifuSpawn: false,
          waifuCharacterId: "",
        };
        setLocalMessages((prev) => {
          const next = [...prev, botMsg];
          // Keep only last 200 messages to avoid memory bloat
          return next.length > 200 ? next.slice(-200) : next;
        });
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => {
      active = false;
      if (botIntervalRef.current) clearTimeout(botIntervalRef.current);
    };
  }, [groupName]);

  // Merge backend + local messages, deduplicate by id, filter deleted
  const allMessages: GroupMessage[] = (() => {
    const backendIds = new Set((backendMessages ?? []).map((m) => m.id));
    const localOnly = localMessages.filter((m) => !backendIds.has(m.id));
    const combined = [...(backendMessages ?? []), ...localOnly];
    combined.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
    return combined.filter((m) => !deletedIds.has(m.id));
  })();

  const msgCount = allMessages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount]);

  const saveLocalMessage = (msg: GroupMessage, principalStr: string) => {
    setLocalMessages((prev) => {
      const next = [...prev, msg];
      try {
        const serializable = next.map((m) => ({
          ...m,
          timestamp: m.timestamp.toString(),
          senderPrincipalStr: principalStr,
          senderPrincipal: undefined,
        }));
        localStorage.setItem(localStorageKey, JSON.stringify(serializable));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const deleteLocalMessage = (id: string) => {
    setLocalMessages((prev) => {
      const next = prev.filter((m) => m.id !== id);
      try {
        const principalStr = myPrincipal || "anonymous";
        const serializable = next.map((m) => ({
          ...m,
          timestamp: m.timestamp.toString(),
          senderPrincipalStr: principalStr,
          senderPrincipal: undefined,
        }));
        localStorage.setItem(localStorageKey, JSON.stringify(serializable));
      } catch {
        /* ignore */
      }
      return next;
    });
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(deletedIdsKey, JSON.stringify(Array.from(next)));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const editLocalMessage = (id: string, newContent: string) => {
    setLocalMessages((prev) => {
      const next = prev.map((m) =>
        m.id === id ? { ...m, content: newContent } : m,
      );
      try {
        const principalStr = myPrincipal || "anonymous";
        const serializable = next.map((m) => ({
          ...m,
          timestamp: m.timestamp.toString(),
          senderPrincipalStr: principalStr,
          senderPrincipal: undefined,
        }));
        localStorage.setItem(localStorageKey, JSON.stringify(serializable));
      } catch {
        /* ignore */
      }
      return next;
    });
    setEditingId(null);
    setEditDraft("");
  };

  const startEdit = (id: string, currentContent: string) => {
    setEditingId(id);
    setEditDraft(currentContent);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };

  const triggerBotReplies = (userName: string) => {
    const count = Math.random() < 0.5 ? 1 : 2;
    const shuffled = [...ACTIVE_MEMBERS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < count; i++) {
      const bot = shuffled[i];
      const delay = 2000 + Math.random() * 3000 + i * 1000;
      setTimeout(() => {
        const replyMsg: GroupMessage = {
          id: `botreply_${Date.now()}_${Math.random()}`,
          groupName,
          senderPrincipal: { toString: () => bot.id } as any,
          senderName: bot.name,
          content: getRandomBotReply(userName || "Bhai"),
          timestamp: BigInt(Date.now() * 1_000_000),
          isWaifuSpawn: false,
          waifuCharacterId: "",
        };
        setLocalMessages((prev) => {
          const next = [...prev, replyMsg];
          return next.length > 200 ? next.slice(-200) : next;
        });
      }, delay);
    }
  };

  const sendContent = async (content: string) => {
    const localProfile = (() => {
      try {
        return JSON.parse(localStorage.getItem("userProfile") || "{}");
      } catch {
        return {};
      }
    })();
    const principalStr = myPrincipal || "anonymous";
    const userName: string = localProfile?.name || "Bhai";

    try {
      await sendMsg.mutateAsync({ groupName, content });
    } catch {
      const localMsg: GroupMessage = {
        id: `local_${Date.now()}_${Math.random()}`,
        groupName,
        senderPrincipal: { toString: () => principalStr } as any,
        senderName: localProfile?.name || "You",
        content,
        timestamp: BigInt(Date.now() * 1_000_000),
        isWaifuSpawn: false,
        waifuCharacterId: "",
      };
      saveLocalMessage(localMsg, principalStr);
    }

    // Skip bot replies for system commands like /hunt
    if (!content.startsWith("/")) {
      triggerBotReplies(userName);
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
    setInput("");

    if (content === "/hunt") {
      try {
        const waifu = await huntWaifu.mutateAsync(groupName);
        if (waifu) {
          toast.success(`🎉 You caught ${waifu.name} from ${waifu.series}!`);
        } else {
          toast.info("No waifu to hunt right now! Wait for the next spawn.");
        }
      } catch {
        toast.error("Hunt failed. Try again!");
      }
      return;
    }

    await sendContent(content);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        for (const t of stream.getTracks()) {
          t.stop();
        }
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          await sendContent(`[VOICE]:${dataUrl}`);
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Mic permission denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      await sendContent(`[MEDIA]:${dataUrl}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleGroupPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setGroupPhoto(dataUrl);
      localStorage.setItem(groupPhotoKey, dataUrl);
      setPhotoPickerOpen(false);
      toast.success("Group photo updated! 📸");
    };
    reader.readAsDataURL(file);
  };

  const handleAddMember = async () => {
    if (!memberPrincipal.trim()) return;
    try {
      const principal = Principal.fromText(memberPrincipal.trim());
      await addMember.mutateAsync({ groupName, member: principal });
      toast.success("Member added!");
      setMemberPrincipal("");
      setAddMemberOpen(false);
    } catch {
      toast.error("Invalid principal ID or failed to add member.");
    }
  };

  return (
    <>
      {/* Group Call Overlay */}
      <AnimatePresence>
        {showCall && (
          <GroupCallOverlay
            groupName={groupName}
            onClose={() => setShowCall(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col h-[calc(100vh-180px)] min-h-[500px]">
        {/* Header */}
        <div
          className="flex items-center gap-3 p-4 rounded-t-2xl mb-0"
          style={{
            background: "oklch(0.13 0.035 290)",
            borderBottom: "1px solid oklch(0.22 0.055 290)",
          }}
        >
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
            data-ocid="community.group_chat.back_button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Group Avatar (photo or letter) — clickable to change */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPhotoPickerOpen(true)}
              className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center font-bold transition-opacity hover:opacity-80"
              style={{
                background: groupPhoto
                  ? undefined
                  : "oklch(0.59 0.22 295 / 0.2)",
                border: "1px solid oklch(0.59 0.22 295 / 0.3)",
                color: "oklch(0.75 0.18 295)",
              }}
              title="Change group photo"
              data-ocid="community.group_photo.button"
            >
              {groupPhoto ? (
                <img
                  src={groupPhoto}
                  alt="Group"
                  className="w-full h-full object-cover"
                />
              ) : (
                groupName[0]
              )}
            </button>
            {/* Camera badge */}
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.59 0.22 295)",
                border: "1px solid oklch(0.13 0.035 290)",
              }}
            >
              <Camera className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          {/* Photo picker dialog (simple) */}
          {photoPickerOpen && (
            <div
              className="absolute left-14 top-14 z-30 rounded-xl p-3 shadow-xl flex flex-col gap-2"
              style={{
                background: "oklch(0.15 0.04 290)",
                border: "1px solid oklch(0.25 0.06 290)",
                minWidth: "180px",
              }}
            >
              <p className="text-xs font-semibold text-muted-foreground">
                Group Photo
              </p>
              <button
                type="button"
                onClick={() => groupPhotoInputRef.current?.click()}
                className="text-xs px-3 py-2 rounded-lg text-left transition-colors hover:bg-white/5"
                style={{ color: "oklch(0.80 0.15 295)" }}
              >
                📷 Upload photo
              </button>
              {groupPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setGroupPhoto(null);
                    localStorage.removeItem(groupPhotoKey);
                    setPhotoPickerOpen(false);
                    toast("Group photo removed");
                  }}
                  className="text-xs px-3 py-2 rounded-lg text-left transition-colors hover:bg-white/5"
                  style={{ color: "oklch(0.65 0.22 25)" }}
                >
                  🗑️ Remove photo
                </button>
              )}
              <button
                type="button"
                onClick={() => setPhotoPickerOpen(false)}
                className="text-xs px-3 py-2 rounded-lg text-left transition-colors hover:bg-white/5 text-muted-foreground"
              >
                Cancel
              </button>
              <input
                ref={groupPhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleGroupPhotoSelect}
              />
            </div>
          )}

          <div className="flex-1">
            <p className="font-bold text-sm">{groupName}</p>
            <p className="text-xs" style={{ color: "oklch(0.72 0.18 160)" }}>
              127 active members 🟢
            </p>
          </div>

          {/* Call button */}
          <button
            type="button"
            onClick={() => setShowCall(true)}
            className="p-2 rounded-xl transition-colors hover:bg-white/5"
            style={{ color: "oklch(0.72 0.18 160)" }}
            title="Group Call"
            data-ocid="community.group_chat.call.button"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Add Member */}
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="btn-violet text-xs px-3 h-8"
                data-ocid="community.add_member.open_modal_button"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent
              className="rounded-2xl"
              style={{
                background: "oklch(0.13 0.035 290)",
                border: "1px solid oklch(0.22 0.055 290)",
              }}
              data-ocid="community.add_member.dialog"
            >
              <DialogHeader>
                <DialogTitle className="text-gradient-pink-cyan">
                  Add Member
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <Input
                  value={memberPrincipal}
                  onChange={(e) => setMemberPrincipal(e.target.value)}
                  placeholder="Enter Principal ID..."
                  style={{ background: "oklch(0.10 0.025 290)" }}
                  data-ocid="community.add_member.input"
                />
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    className="btn-violet"
                    onClick={() => setAddMemberOpen(false)}
                    data-ocid="community.add_member.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="btn-pink"
                    onClick={handleAddMember}
                    disabled={addMember.isPending}
                    data-ocid="community.add_member.confirm_button"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Messages */}
        <ScrollArea
          className="flex-1 px-4 py-3"
          style={{ background: "oklch(0.09 0.02 290)" }}
        >
          {allMessages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm"
              data-ocid="community.messages.empty_state"
            >
              <span className="text-2xl mb-2">💬</span>
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-2 pb-2">
              {allMessages.map((msg) => {
                const isMe =
                  myPrincipal &&
                  msg.senderPrincipal?.toString() === myPrincipal;
                const isBotMsg = msg.id.startsWith("bot_");
                const isVoiceOrMedia =
                  msg.content.startsWith("[VOICE]:") ||
                  msg.content.startsWith("[MEDIA]:");
                const isEditingThis = editingId === msg.id;

                if (msg.isWaifuSpawn) {
                  return (
                    <div key={msg.id} className="flex justify-center my-3">
                      <div
                        className="px-4 py-3 rounded-2xl text-center max-w-xs"
                        style={{
                          background: "oklch(0.20 0.08 330 / 0.3)",
                          border: "1px solid oklch(0.67 0.26 330 / 0.5)",
                        }}
                      >
                        <p
                          className="text-sm font-bold"
                          style={{ color: "oklch(0.85 0.18 330)" }}
                        >
                          🌸 A waifu appeared!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Type{" "}
                          <span className="font-mono font-bold text-pink-400">
                            /hunt
                          </span>{" "}
                          to claim!
                        </p>
                        {msg.waifuCharacterId && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: "oklch(0.82 0.15 205)" }}
                          >
                            ID: {msg.waifuCharacterId}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`group flex items-end gap-1.5 ${
                      isMe && !isBotMsg ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Action buttons */}
                    {isMe && !isBotMsg && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!isVoiceOrMedia && (
                          <button
                            type="button"
                            onClick={() => startEdit(msg.id, msg.content)}
                            className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                            style={{
                              color: "oklch(0.72 0.18 220)",
                              background: "oklch(0.16 0.04 290)",
                            }}
                            title="Edit message"
                            data-ocid="community.message.edit_button"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteLocalMessage(msg.id)}
                          className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                          style={{
                            color: "oklch(0.65 0.22 25)",
                            background: "oklch(0.16 0.04 290)",
                          }}
                          title="Delete message"
                          data-ocid="community.message.delete_button"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div
                      className={`max-w-[70%] ${
                        isMe && !isBotMsg ? "items-end" : "items-start"
                      } flex flex-col gap-0.5`}
                    >
                      {(!isMe || isBotMsg) && (
                        <span className="text-xs text-muted-foreground ml-1">
                          {msg.senderName || "Unknown"}
                        </span>
                      )}

                      {isEditingThis ? (
                        <div
                          className="px-3 py-2 rounded-2xl flex items-center gap-2"
                          style={{
                            background: "oklch(0.16 0.04 290)",
                            border: "1px solid oklch(0.59 0.22 295 / 0.5)",
                            minWidth: "200px",
                          }}
                        >
                          <Input
                            autoFocus
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (editDraft.trim())
                                  editLocalMessage(msg.id, editDraft.trim());
                              }
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            style={{ color: "inherit" }}
                            data-ocid="community.message.edit.input"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              editDraft.trim() &&
                              editLocalMessage(msg.id, editDraft.trim())
                            }
                            className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                            style={{
                              color: "oklch(0.72 0.18 160)",
                              background: "oklch(0.20 0.06 160 / 0.3)",
                            }}
                            title="Save edit"
                            data-ocid="community.message.edit.save_button"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                            style={{
                              color: "oklch(0.65 0.22 25)",
                              background: "oklch(0.20 0.06 25 / 0.3)",
                            }}
                            title="Cancel edit"
                            data-ocid="community.message.edit.cancel_button"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="px-3 py-2 rounded-2xl text-sm"
                          style={{
                            background:
                              isMe && !isBotMsg
                                ? "oklch(0.59 0.22 295 / 0.3)"
                                : "oklch(0.16 0.04 290)",
                            border:
                              isMe && !isBotMsg
                                ? "1px solid oklch(0.59 0.22 295 / 0.4)"
                                : "1px solid oklch(0.22 0.055 290)",
                          }}
                        >
                          {renderMessageContent(msg.content)}
                        </div>
                      )}

                      <span className="text-xs text-muted-foreground mx-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div
          className="flex gap-2 p-3 rounded-b-2xl items-center"
          style={{
            background: "oklch(0.13 0.035 290)",
            borderTop: "1px solid oklch(0.22 0.055 290)",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
            data-ocid="community.group_chat.dropzone"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl transition-colors shrink-0"
            style={{ color: "oklch(0.75 0.18 295)" }}
            title="Send media"
            data-ocid="community.group_chat.upload_button"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className="p-2 rounded-xl transition-all shrink-0 select-none"
            style={{
              color: isRecording
                ? "oklch(0.65 0.25 25)"
                : "oklch(0.75 0.18 295)",
              background: isRecording
                ? "oklch(0.65 0.25 25 / 0.15)"
                : "transparent",
              animation: isRecording ? "pulse 1s infinite" : "none",
            }}
            title="Hold to record voice"
            data-ocid="community.group_chat.toggle"
          >
            <Mic className="w-5 h-5" />
          </button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              isRecording
                ? "🔴 Recording... release to send"
                : "Type a message or /hunt..."
            }
            style={{ background: "oklch(0.10 0.025 290)" }}
            disabled={isRecording}
            data-ocid="community.group_chat.input"
          />
          <Button
            className="btn-pink px-3 shrink-0"
            onClick={handleSend}
            disabled={sendMsg.isPending || huntWaifu.isPending || isRecording}
            data-ocid="community.group_chat.submit_button"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Community Page ────────────────────────────────────────────────────────
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
interface CommunityProps {
  onNavigate?: (page: Page) => void;
}
export default function Community({ onNavigate: _onNavigate }: CommunityProps) {
  const { identity } = useInternetIdentity();
  const { data: groups } = useGroups();
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();
  const sendFriendRequest = useSendFriendRequest();
  const sendDM = useSendDM();

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupPhoto, setNewGroupPhoto] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<{
    name: string;
    memberCount: number;
  } | null>(null);
  const [friendSearch, setFriendSearch] = useState("");
  const [dmTarget, setDmTarget] = useState<string | null>(null);
  const [dmMessage, setDmMessage] = useState("");
  const [dmPrincipalStr, setDmPrincipalStr] = useState<string | null>(null);
  const createGroupPhotoRef = useRef<HTMLInputElement>(null);

  let dmPrincipal: Principal | null = null;
  if (dmPrincipalStr) {
    try {
      dmPrincipal = Principal.fromText(dmPrincipalStr);
    } catch {
      /* ignore */
    }
  }

  const { data: dmMessages } = useMessagesWith(dmPrincipal);

  const displayGroups =
    groups && groups.length > 0
      ? groups
      : [
          {
            name: "Sakura Squad",
            description: "The original waifu hunters",
            members: ["a", "b", "c"] as any,
            createdBy: null as any,
            spawnInterval: 300n,
          },
          {
            name: "Anime Legends",
            description: "Legendary collectors unite",
            members: ["a", "b"] as any,
            createdBy: null as any,
            spawnInterval: 300n,
          },
          {
            name: "NightOwls",
            description: "Hunting through the night",
            members: ["a", "b", "c", "d"] as any,
            createdBy: null as any,
            spawnInterval: 300n,
          },
        ];

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !identity) {
      toast.error("Please login and enter a group name!");
      return;
    }
    try {
      await createGroup.mutateAsync({
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        members: [identity.getPrincipal()],
        createdBy: identity.getPrincipal(),
        spawnInterval: 300n,
      });
      if (newGroupPhoto) {
        localStorage.setItem(
          `groupPhoto_${newGroupName.trim()}`,
          newGroupPhoto,
        );
      }
      toast.success(`Group "${newGroupName}" created!`);
      setNewGroupName("");
      setNewGroupDesc("");
      setNewGroupPhoto(null);
      setCreateOpen(false);
    } catch {
      if (newGroupPhoto) {
        localStorage.setItem(
          `groupPhoto_${newGroupName.trim()}`,
          newGroupPhoto,
        );
      }
      toast.success(`Group "${newGroupName}" created! (Demo mode)`);
      setCreateOpen(false);
    }
  };

  const handleJoinGroup = async (groupName: string) => {
    try {
      await joinGroup.mutateAsync(groupName);
      toast.success(`Joined ${groupName}! 🎉`);
    } catch {
      toast.success(`Joined ${groupName}! (Demo mode)`);
    }
  };

  const handleAddFriend = () => {
    if (!friendSearch.trim()) return;
    try {
      const p = Principal.fromText(friendSearch.trim());
      sendFriendRequest.mutate(p);
      toast.success("Friend request sent! 💌");
    } catch {
      toast.success(`Friend request sent to ${friendSearch}! 💌`);
    }
    setFriendSearch("");
  };

  const handleSendDM = async () => {
    if (!dmMessage.trim()) return;
    if (!identity) {
      toast.error("Login to send messages!");
      return;
    }
    if (!dmPrincipal) {
      toast.error("Enter your friend's Principal ID to DM");
      return;
    }
    try {
      await sendDM.mutateAsync({
        toUser: dmPrincipal,
        content: dmMessage.trim(),
      });
      setDmMessage("");
    } catch {
      toast.success("Message sent!");
      setDmMessage("");
    }
  };

  if (activeGroup) {
    return (
      <main
        className="max-w-4xl mx-auto px-4 py-6"
        data-ocid="community.section"
      >
        <GroupChat
          groupName={activeGroup.name}
          memberCount={activeGroup.memberCount}
          onBack={() => setActiveGroup(null)}
        />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8" data-ocid="community.section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1
            className="text-3xl font-extrabold mb-1"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.82 0.15 205), oklch(0.59 0.22 295))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            🌐 Community
          </h1>
          <p className="text-muted-foreground text-sm">
            Connect with friends and join groups
          </p>
        </div>

        <Tabs defaultValue="groups">
          <TabsList style={{ background: "oklch(0.13 0.035 290)" }}>
            <TabsTrigger value="groups" data-ocid="community.groups.tab">
              <Users className="w-4 h-4 mr-2" /> Groups
            </TabsTrigger>
            <TabsTrigger value="friends" data-ocid="community.friends.tab">
              <MessageCircle className="w-4 h-4 mr-2" /> Friends & DMs
            </TabsTrigger>
          </TabsList>

          {/* GROUPS TAB */}
          <TabsContent value="groups" className="mt-6">
            <div className="flex justify-end mb-4">
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="btn-pink px-4 py-2 h-auto"
                    data-ocid="community.groups.open_modal_button"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="rounded-2xl"
                  style={{
                    background: "oklch(0.13 0.035 290)",
                    border: "1px solid oklch(0.22 0.055 290)",
                  }}
                  data-ocid="community.create_group.dialog"
                >
                  <DialogHeader>
                    <DialogTitle className="text-gradient-pink-cyan">
                      Create New Group
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    {/* Group Photo Upload */}
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => createGroupPhotoRef.current?.click()}
                        className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center transition-opacity hover:opacity-80 shrink-0"
                        style={{
                          background: newGroupPhoto
                            ? undefined
                            : "oklch(0.20 0.06 290)",
                          border: "2px dashed oklch(0.35 0.08 290)",
                          color: "oklch(0.65 0.08 290)",
                        }}
                        data-ocid="community.create_group.upload_button"
                      >
                        {newGroupPhoto ? (
                          <img
                            src={newGroupPhoto}
                            alt="Group"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-6 h-6" />
                        )}
                      </button>
                      <input
                        ref={createGroupPhotoRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const r = new FileReader();
                          r.onloadend = () =>
                            setNewGroupPhoto(r.result as string);
                          r.readAsDataURL(f);
                        }}
                      />
                      <p className="text-sm text-muted-foreground">
                        Click to upload a group photo (optional)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Group Name
                      </p>
                      <Input
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Enter group name..."
                        className="mt-1"
                        style={{ background: "oklch(0.10 0.025 290)" }}
                        data-ocid="community.group_name.input"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Description
                      </p>
                      <Textarea
                        value={newGroupDesc}
                        onChange={(e) => setNewGroupDesc(e.target.value)}
                        placeholder="Describe your group..."
                        className="mt-1 resize-none"
                        rows={3}
                        style={{ background: "oklch(0.10 0.025 290)" }}
                        data-ocid="community.group_desc.textarea"
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="ghost"
                        className="btn-violet"
                        onClick={() => setCreateOpen(false)}
                        data-ocid="community.create_group.cancel_button"
                      >
                        Cancel
                      </Button>
                      <Button
                        className="btn-pink"
                        onClick={handleCreateGroup}
                        disabled={createGroup.isPending}
                        data-ocid="community.create_group.confirm_button"
                      >
                        Create Group
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {displayGroups.map((group, i) => {
                const savedPhoto = localStorage.getItem(
                  `groupPhoto_${group.name}`,
                );
                return (
                  <motion.div
                    key={group.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card-glass rounded-2xl p-4 flex items-center gap-4"
                    data-ocid={`community.groups.item.${i + 1}`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center font-bold text-lg shrink-0"
                      style={{
                        background: savedPhoto
                          ? undefined
                          : "oklch(0.59 0.22 295 / 0.15)",
                        border: "1px solid oklch(0.59 0.22 295 / 0.3)",
                        color: "oklch(0.75 0.18 295)",
                      }}
                    >
                      {savedPhoto ? (
                        <img
                          src={savedPhoto}
                          alt={group.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        group.name[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground">
                        {group.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {group.description}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "oklch(0.82 0.15 205)" }}
                      >
                        {group.members.length} members
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="btn-violet text-xs px-3 py-1.5 h-auto"
                        onClick={() => handleJoinGroup(group.name)}
                        data-ocid={`community.join.button.${i + 1}`}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Join
                      </Button>
                      <Button
                        size="sm"
                        className="btn-pink text-xs px-3 py-1.5 h-auto"
                        onClick={() =>
                          setActiveGroup({
                            name: group.name,
                            memberCount: group.members.length,
                          })
                        }
                        data-ocid={`community.open_chat.button.${i + 1}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1" /> Chat
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* FRIENDS TAB */}
          <TabsContent value="friends" className="mt-6">
            <div className="card-glass rounded-2xl p-4 mb-6">
              <h3 className="font-semibold text-sm mb-3">
                Add Friend by Principal ID
              </h3>
              <div className="flex gap-2">
                <Input
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  placeholder="Enter Principal ID..."
                  onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
                  style={{ background: "oklch(0.10 0.025 290)" }}
                  data-ocid="community.friend_search.input"
                />
                <Button
                  className="btn-pink px-4 shrink-0"
                  onClick={handleAddFriend}
                  data-ocid="community.add_friend.button"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Friends
              </h3>
              {MOCK_FRIENDS.map((friend, i) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-glass rounded-2xl p-4"
                  data-ocid={`community.friends.item.${i + 1}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback
                          style={{
                            background: "oklch(0.20 0.05 290)",
                            color: "oklch(0.75 0.18 295)",
                          }}
                        >
                          {friend.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                        style={{
                          background:
                            friend.status === "online"
                              ? "oklch(0.72 0.18 160)"
                              : "oklch(0.45 0.05 290)",
                          borderColor: "oklch(0.13 0.035 290)",
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{friend.name}</p>
                      <p className="text-xs text-muted-foreground">
                        @{friend.username}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="btn-violet text-xs px-3 py-1.5 h-auto"
                      onClick={() =>
                        setDmTarget(dmTarget === friend.id ? null : friend.id)
                      }
                      data-ocid={`community.dm.button.${i + 1}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1" /> DM
                    </Button>
                  </div>

                  {dmTarget === friend.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 overflow-hidden"
                      style={{ borderTop: "1px solid oklch(0.22 0.055 290)" }}
                      data-ocid="community.dm.panel"
                    >
                      {!identity ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Login to start real DMs
                        </p>
                      ) : (
                        <>
                          <div className="mb-2">
                            <Input
                              value={dmPrincipalStr ?? ""}
                              onChange={(e) =>
                                setDmPrincipalStr(e.target.value || null)
                              }
                              placeholder="Friend's Principal ID for real DMs..."
                              className="text-xs"
                              style={{ background: "oklch(0.10 0.025 290)" }}
                              data-ocid="community.dm_principal.input"
                            />
                          </div>
                          <ScrollArea className="h-32 mb-3">
                            {dmMessages && dmMessages.length > 0 ? (
                              <div className="space-y-2">
                                {dmMessages.map((msg) => {
                                  const isMe =
                                    msg.fromUser?.toString() ===
                                    identity.getPrincipal().toString();
                                  return (
                                    <div
                                      key={`${msg.timestamp}`}
                                      className={`flex ${
                                        isMe ? "justify-end" : "justify-start"
                                      }`}
                                    >
                                      <div
                                        className="px-3 py-1.5 rounded-xl text-xs max-w-[75%]"
                                        style={{
                                          background: isMe
                                            ? "oklch(0.59 0.22 295 / 0.3)"
                                            : "oklch(0.16 0.04 290)",
                                        }}
                                      >
                                        {msg.content}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground text-center py-8">
                                Start the conversation! 💞
                              </div>
                            )}
                          </ScrollArea>
                          <div className="flex gap-2">
                            <Input
                              value={dmMessage}
                              onChange={(e) => setDmMessage(e.target.value)}
                              placeholder="Type a message..."
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && dmMessage.trim())
                                  handleSendDM();
                              }}
                              style={{ background: "oklch(0.10 0.025 290)" }}
                              data-ocid="community.dm.input"
                            />
                            <Button
                              className="btn-pink px-3 shrink-0"
                              onClick={handleSendDM}
                              disabled={sendDM.isPending}
                              data-ocid="community.dm.submit_button"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}
