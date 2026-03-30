import { Principal } from "@icp-sdk/core/principal";
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  Info,
  Mic,
  MicOff,
  Paperclip,
  Phone,
  PhoneOff,
  Send,
  UserCheck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ChatView } from "../App";
import type { GroupMessage, WaifuCharacter } from "../backend";
import {
  RARITY_CONFIG,
  RARITY_SELL_PRICES,
  SEED_WAIFUS,
  getRankForCount,
} from "../data/seedData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddWaifuToHarem,
  useGetGroupMessages,
  useGroups,
  useHuntWaifuInGroup,
  useMessagesWith,
  useSendDM,
  useSendGroupMessage,
  useUserHarem,
  useUserProfile,
  useWaifuCharacters,
} from "../hooks/useQueries";
import GroupInfoPanel from "./GroupInfoPanel";

interface BotMessage {
  id: string;
  content: string;
  timestamp: number;
  waifuCard?: WaifuCharacter | null;
  isWaifuSpawnCard?: boolean;
  isUserMessage?: boolean;
  isOwn?: boolean;
  senderName?: string;
  mediaType?: "image" | "voice" | "video";
  mediaUrl?: string;
}

interface ChatWindowProps {
  activeView:
    | { type: "group"; groupName: string }
    | { type: "dm"; principalStr: string };
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

interface LocalFriend {
  username: string;
  principalId: string;
  displayName: string;
}

const BOT_CASUAL_MESSAGES = [
  "Nice chat! 🌸 Keep collecting waifus!",
  "A waifu is watching you... 👀",
  "Tip: Use /hunt after a waifu spawns! 🍀",
  "Your harem is waiting for you~ 💝",
  "🌟 Keep going, collector!",
  "The more you chat, the more waifus appear! ✨",
  "🍀 sɪɴᴢʜᴜ ᴡᴀɪғᴜ ʙᴏᴛ 🍭 is always here for you!",
  "Did you claim your /daily reward today? 💎",
  "Aww, you're so active~ 🥰 Keep chatting!",
  "Hehe~ I see you~ 👁️ Don't forget to /hunt!",
  "You seem fun! 😄 Want a waifu? Keep chatting~",
  "Every message brings you closer to a waifu spawn! 🌸",
  "Type /harem to see your beautiful collection~ 🎴",
  "Konnichiwa! 🍡 I'm always watching the chat~",
  "Ara ara~ you're chatting a lot today! 💕",
  "Don't forget /hclaim for your free daily waifu! 🎀",
  "Your waifus miss you~ go visit /harem 💖",
  "So lively in here! I love it~ 🎊",
  "Psst... a rare waifu might appear soon! 🔮",
  "Uwu~ this group is amazing! 🌺",
  "Keep the energy up! More chats = more waifus! ⚡",
  "Type /rank to see how powerful you are! 🐲",
  "Teehee~ 🍭 I'm your forever companion!",
  "You're doing great, collector! 🏆 Never stop hunting!",
];

const PLACEHOLDER_HINTS = [
  "Message... (try /hunt)",
  "Message... (try /daily)",
  "Message... (try /slavetime 15)",
  "Message... (try /harem)",
  "Message... (try /rank)",
];

const ALL_COMMANDS = [
  { cmd: "/hunt", desc: "Claim spawned waifu" },
  { cmd: "/fav [id]", desc: "Favorite a waifu" },
  { cmd: "/hclaim", desc: "Daily free waifu" },
  { cmd: "/daily", desc: "Claim +100 Onex" },
  { cmd: "/welkin", desc: "Claim +150 Onex" },
  { cmd: "/tesure", desc: "Treasure reward" },
  { cmd: "/onex", desc: "Check balance" },
  { cmd: "/tops", desc: "Top 10 Onex holders" },
  { cmd: "/top", desc: "Top 10 collectors" },
  { cmd: "/topgroups", desc: "Top 10 groups" },
  { cmd: "/rank", desc: "Your rank info" },
  { cmd: "/check [id]", desc: "Search character" },
  { cmd: "/wsell [id]", desc: "Sell a waifu" },
  { cmd: "/gift [id]", desc: "Gift a waifu" },
  { cmd: "/pay [amount]", desc: "Pay Onex to friend" },
  { cmd: "/wpass", desc: "Waifu pass status" },
  { cmd: "/shop", desc: "Open shop" },
  { cmd: "/slavetime [n]", desc: "Set spawn interval (≥15)" },
  { cmd: "/oon", desc: "Activate anime bots party" },
  { cmd: "/oof", desc: "Stop anime bots" },
  { cmd: "/harem", desc: "View your waifu collection" },
  { cmd: "/start", desc: "Show all commands" },
];

// Anime bots for group chat party mode
const ANIME_BOTS = [
  {
    name: "NarutoBot",
    avatar: "🍥",
    messages: [
      "Dattebayo! 😤 Main sabse pehle hunt karunga!",
      "Bhai, meri waifu collection dekhi? 💪",
      "Yaar koi mujhe /hunt mein help karo!",
      "Shadow Clone Jutsu se double waifus milti hain kya? 🤣",
      "Sakura-chan se zyada cute waifu mil gayi mujhe~ 🌸",
      "Main Hokage banega aur saari waifus claim karunga! 💫",
    ],
  },
  {
    name: "SasukeChan",
    avatar: "⚡",
    messages: [
      "Pathetic. Mera harem tumse better hai. 😏",
      "Anime mein best girl kaunsi hai? Obviously Hinata. 💙",
      "Power of Sharingan se rare waifu dhund li! 👁️",
      "Bhai /rank check karo, main top pe hoon~ 🐲",
      "Itachi ne bola tha waifus collect karo 🔥",
      "Uchiha clan ki waifu policy strict hai~ 😎",
    ],
  },
  {
    name: "SakuraFan",
    avatar: "🌸",
    messages: [
      "OMG itni cute waifu!! /hunt karo jaldi! 🥰",
      "Bhai mere harem mein 50 waifus aa gayi~ 🎴",
      "Konnichiwa minna! Aaj kaunsi waifu spawn hogi? 🌺",
      "Inner Sakura: MAIN SAARI WAIFUS LUNGI!!! 💪",
      "Anime girls are life bhai~ 💕",
      "Medical ninjutsu se waifus heal hoti hain kya? 😂",
    ],
  },
  {
    name: "GaraaSama",
    avatar: "🏜️",
    messages: [
      "Sand + waifus = perfect combo 🏜️",
      "Kazekage hone ke baad bhi waifus hunt karta hoon 😌",
      "Gaara of the Desert aur Gaara of the Waifus~ 🌵",
      "Bhai /daily le lo, free Onex hai!",
      "Desert mein bhi anime dekh ta hoon yaar 🌙",
      "Meri waifu sand se bani hai... just kidding 😅",
    ],
  },
  {
    name: "RockLeeBot",
    avatar: "🥊",
    messages: [
      "YOUTH! WAIFUS! TRAINING! 🔥",
      "Bhai main bina jutsu ke top pe hoon! 💪",
      "Guy-sensei ne kaha 1000 hunts practice karo!",
      "Lotus no waifu blooms! 🌸🥊",
      "Agar waifu na mile toh 500 squats! 😤",
      "Springtime of Youth aur waifus~ ✨",
    ],
  },
  {
    name: "ItachiBot",
    avatar: "🔮",
    messages: [
      "Izanagi se deleted waifu wapas aa sakti hai? 🔮",
      "Bhai ye sab illusion hai, real waifu dil mein hoti hai~ 💙",
      "Mangekyou Sharingan activate for rare waifu hunting 👁️",
      "Akatsuki mein bhi waifu hunters hain~ 😏",
      "Little brother, /hunt karna seekh lo...",
      "Genjutsu se forced waifu claim? That's cheating 🚫",
    ],
  },
  {
    name: "HinataKun",
    avatar: "💙",
    messages: [
      "N-Naruto-kun aur waifus dono mujhe pasand hain~ 😳",
      "Byakugan se rare waifus dhund sakti hoon!",
      "Bhai main bahut shy hoon but /hunt main zaroor karti hoon 💙",
      "Hyuga clan ki waifu collection best hai~",
      "N-neji bhaiya ne hunt karna sikhaya 🌀",
      "Bhai 64 palms of waifu claiming! 🥊",
    ],
  },
  {
    name: "KakashiSensei",
    avatar: "📖",
    messages: [
      "Icha Icha Paradise se zyada acchi waifu nahi 📖",
      "Copy ninja ne ye waifu copy kar li~ 😏",
      "Bhai late aaya kyunki raste mein waifu spawn thi 😅",
      "1000 hunts complete, A-rank collector!",
      "Sharingan se /hunt perfect accuracy~ 👁️",
      "My ninja way: Never miss a waifu spawn!",
    ],
  },
  {
    name: "MinatoSan",
    avatar: "⚡",
    messages: [
      "Hiraishin no jutsu se instant waifu claim! ⚡",
      "Yellow Flash has entered the waifu game~ 💛",
      "Bhai speed se /hunt karo, pehle claim karo!",
      "Kushina-chan se cute waifu nahi dekhi~ ❤️",
      "4th Hokage approves of this waifu collection! 🌟",
      "Teleport + hunt = pro strat bhai 😎",
    ],
  },
  {
    name: "ObieBot",
    avatar: "🌀",
    messages: [
      "Kamui se waifu steal karna valid hai? 😂",
      "Jikkan... baaki sab waifus illusion hain, meri real hai~",
      "Uchiha Obito reporting for waifu duty! 🌀",
      "Rin-chan ke baad koi waifu nahi... 😢 (jk /hunt karo)",
      "Moon's Eye Plan: all waifus belong to me!",
      "Bhai masked rehna padta hai kyunki waifus distract karti hain 😅",
    ],
  },
  {
    name: "TobiSama",
    avatar: "🍬",
    messages: [
      "Tobi is a good boy who hunts waifus! 🍬",
      "Senpai! Mujhe bhi waifu chahiye!!! 🥺",
      "Wheee /hunt /hunt /hunt!!! 🌀",
      "Akatsuki mein candy aur waifus dono hain~ 🍭",
      "Bhai Tobi ko rare waifu kab milegi? 😭",
      "Deidara-senpai meri waifu le gaya NOOOO 😱",
    ],
  },
  {
    name: "DeidaraSan",
    avatar: "💥",
    messages: [
      "ART IS AN EXPLOSION! Aur waifus bhi! 💥",
      "Bhai mera clay waifu best art hai~ hmm",
      "C4 Karura: destroys rivals' harams! 😈",
      "Un! Rare waifu = true art! 🎨",
      "Sasori no danna se meri waifu better hai~ 💥",
      "Exploding clay aur exploding feelings for waifus~ hmm",
    ],
  },
];

// 127 always-active members — chat continuously regardless of /on /off
const ACTIVE_MEMBERS = [
  {
    name: "AkatsukiFan",
    avatar: "🔴",
    messages: [
      "Bhai /hunt fast karo!",
      "Akatsuki gang assemble!",
      "Waifu collection mein add kar li!",
    ],
  },
  {
    name: "KonohaHero",
    avatar: "🍃",
    messages: [
      "Yaar kaunsi waifu best hai?",
      "Main village protect karta hoon aur waifus bhi 😂",
      "Konoha mein sab waifu hunters hain!",
    ],
  },
  {
    name: "UzumakiKing",
    avatar: "🌀",
    messages: [
      "Uzumaki style hunt karo!",
      "Shadow clone jutsu for waifus!",
      "Dattebayo!! Hunt karo!",
    ],
  },
  {
    name: "SandVillage",
    avatar: "🏜️",
    messages: [
      "Desert se aayi waifu sabse rare hai",
      "Sand jutsu + waifu = op combo",
      "Gaara bhai kuch bolo!",
    ],
  },
  {
    name: "LeafNinja99",
    avatar: "🌿",
    messages: [
      "Ninja way: collect waifus!",
      "Leaf village mein best harams hain",
      "Hokage ka sapna: poori waifu list!",
    ],
  },
  {
    name: "MistVillage",
    avatar: "🌊",
    messages: [
      "Kirigakure se aaya hoon, waifus laaya hoon~",
      "Bhai water style waifu rare hai!",
      "Seven swordsmen of waifus lol",
    ],
  },
  {
    name: "CloudNin",
    avatar: "⛅",
    messages: [
      "Kumogakure mein bhi waifu culture hai!",
      "Lightning + waifu = Raikage approved",
      "Bhai /daily maro free onex milega",
    ],
  },
  {
    name: "RockNinja",
    avatar: "🪨",
    messages: [
      "Iwagakure rocks! Aur waifus bhi!",
      "Earth style mein waifu bury nahi hoti 😂",
      "Tsuchikage ki waifu list dekhi? 👀",
    ],
  },
  {
    name: "SoundVillage",
    avatar: "🎵",
    messages: [
      "Orochimaru bhi waifu collector tha kya?",
      "Sound four mein kaun best waifu hunter?",
      "Bhai genjutsu waifu real lagti hai!",
    ],
  },
  {
    name: "RainNin",
    avatar: "🌧️",
    messages: [
      "Amegakure mein baarish aur waifus dono!",
      "Pain bhai waifu world domination plan!",
      "Konan-san best waifu confirmed ✅",
    ],
  },
  {
    name: "AnimeOtaku01",
    avatar: "🎌",
    messages: [
      "Bhai konsa anime dekh raha hai?",
      "One Piece mein Nami best girl!",
      "Bleach > Naruto fight karo!",
    ],
  },
  {
    name: "WaifuHunter99",
    avatar: "💘",
    messages: [
      "Main aaaj 5 waifus claim karunga!",
      "Rare waifu dekhte hi /hunt!",
      "Bhai meri harem dekho~ 🎴",
    ],
  },
  {
    name: "SenpaiNoticed",
    avatar: "👁️",
    messages: [
      "Senpai ne dekha! >///<",
      "Kouhai ki waifu senpai se better? IMPOSSIBLE",
      "Notice me senpai!!",
    ],
  },
  {
    name: "KawaiiDesu",
    avatar: "🌸",
    messages: [
      "Kawaii waifu dekhke dil pighal gaya!",
      "Moe moe kyun~ 💕",
      "Ara ara~ ye waifu toh adorable hai!",
    ],
  },
  {
    name: "TsundereKing",
    avatar: "😤",
    messages: [
      "B-baka! Main sirf waifus hunt kar raha tha!",
      "Hmpf... ye waifu achhi nahi hai (it's good)",
      "I-it's not like I wanted this waifu!",
    ],
  },
  {
    name: "YandereMode",
    avatar: "🔪",
    messages: [
      "Ye waifu sirf meri hai... 👀",
      "Jo bhi mere haram ko touch kare...",
      "Daisuki~ *stares intensely*",
    ],
  },
  {
    name: "KuudereVibes",
    avatar: "❄️",
    messages: ["...(hunts quietly)", "Waifu acquired.", "...nice spawn."],
  },
  {
    name: "DeredereSmile",
    avatar: "😊",
    messages: [
      "Everyone deserves a good waifu!",
      "Bhai team mein milke hunt karo!",
      "Group mein sab best hain~",
    ],
  },
  {
    name: "ChunniCaster",
    avatar: "🌑",
    messages: [
      "My dark powers activated for this waifu!",
      "Chaos of the crimson world, grant me waifus!",
      "Eighth element: rare waifu!",
    ],
  },
  {
    name: "MeganeKun",
    avatar: "🤓",
    messages: [
      "Statistics bata rahe hain ye waifu S-tier hai",
      "Bhai data analysis: 73% rare spawn chance",
      "Calculated. /hunt karo.",
    ],
  },
  {
    name: "ShikimiKun",
    avatar: "🌙",
    messages: [
      "Moonlit waifu is the best waifu",
      "Tsukimi night mein rare waifus spawn hoti hain?",
      "Bhai raat ko hunt karo, luck better hoga",
    ],
  },
  {
    name: "HoshikoSan",
    avatar: "⭐",
    messages: [
      "Stars align karte hain jab rare waifu aati hai!",
      "Hoshi bolta hai: /hunt karo!",
      "Galactic waifu collection goals~",
    ],
  },
  {
    name: "YumesawaRyu",
    avatar: "🐉",
    messages: [
      "Dragon hunter turned waifu hunter!",
      "Ryuu no chikara for best waifu!",
      "Bhai dragon waifu mil gayi!",
    ],
  },
  {
    name: "TornadoAce",
    avatar: "🌪️",
    messages: [
      "Bhai storm ki tarah /hunt karo!",
      "Wind style waifu? Temari-chan!",
      "Tornado of waifus sweeping through!",
    ],
  },
  {
    name: "FlameUser99",
    avatar: "🔥",
    messages: [
      "Katon jutsu activate for waifu hunt!",
      "Bhai fire waifu best waifu!",
      "Burning passion for rare waifus!",
    ],
  },
  {
    name: "IceWielder",
    avatar: "🧊",
    messages: [
      "Ice waifu = cool waifu literally",
      "Bhai Haku-chan waifu hai ya nahi 😂",
      "Freeze! Waifu captured!",
    ],
  },
  {
    name: "ThunderBolt",
    avatar: "⚡",
    messages: [
      "Lightning fast /hunt!",
      "Bhai Killua vibes waifu hunt mein!",
      "Raikiri speed pe waifu claim!",
    ],
  },
  {
    name: "EarthShaker",
    avatar: "🌍",
    messages: [
      "Bhai ground type waifu underrated hai",
      "Earth element waifu solidest waifu!",
      "Tremor of waifus incoming!",
    ],
  },
  {
    name: "NatureLover",
    avatar: "🌱",
    messages: [
      "Wood style: grow your waifu collection!",
      "Yamato-senpai approved waifu!",
      "Nature is the rarest waifu 🌿",
    ],
  },
  {
    name: "VoidWalker",
    avatar: "🕳️",
    messages: [
      "Kamui portal se waifu steal karna 😂",
      "Void between waifus... sad",
      "Dimension hop for rare waifu!",
    ],
  },
  {
    name: "TimeKeeper",
    avatar: "⏳",
    messages: [
      "Bhai /daily timer check karo",
      "Time flies jab waifu hunt karo!",
      "Hourly waifu spawn track kar raha hoon",
    ],
  },
  {
    name: "SpaceOtaku",
    avatar: "🚀",
    messages: [
      "Galactic waifu hunt mission!",
      "Astronaut who hunts waifus in orbit 😂",
      "Houston, we have a rare waifu!",
    ],
  },
  {
    name: "OceanDiver",
    avatar: "🌊",
    messages: [
      "Deep sea rare waifu found!",
      "Underwater waifu expedition!",
      "Bhai Kisame ka waifu game strong tha",
    ],
  },
  {
    name: "DesertRose",
    avatar: "🌹",
    messages: [
      "Desert bloom: rare waifu appeared!",
      "Oasis mein waifu rest kar rahi thi~",
      "Sand and roses: perfect waifu combo",
    ],
  },
  {
    name: "MountainEcho",
    avatar: "🏔️",
    messages: [
      "Mountain top pe rare waifu hai!",
      "Climbing to waifu greatness!",
      "Echo: waifuuuu waifuuuu 😂",
    ],
  },
  {
    name: "SkyPilot",
    avatar: "✈️",
    messages: [
      "Sky high waifu collection!",
      "Bhai clouds mein waifu fly kar rahi thi",
      "Altitude: maximum waifu 🛫",
    ],
  },
  {
    name: "NightOwl99",
    avatar: "🦉",
    messages: [
      "Night owl waifu hunter activate!",
      "3am spawn check kar raha hoon 👀",
      "Bhai late night best time for rare hunt!",
    ],
  },
  {
    name: "DawnBreaker",
    avatar: "🌅",
    messages: [
      "Sunrise ke saath waifu hunt shuru!",
      "Dawn waifu is rarest waifu~",
      "Early bird gets the rare waifu!",
    ],
  },
  {
    name: "StormChaser",
    avatar: "🌩️",
    messages: [
      "Chasing storms and waifus!",
      "Thunder waifu appeared!",
      "Bhai thunder clap /hunt karo!",
    ],
  },
  {
    name: "RainMaker",
    avatar: "☔",
    messages: [
      "Rain brings rare waifus!",
      "Bhai baarish mein waifu spawn chance +50%?",
      "Rainy day waifu hunt best vibe~",
    ],
  },
  {
    name: "SnowDancer",
    avatar: "❄️",
    messages: [
      "Snow waifu is COLD but BEAUTIFUL!",
      "Winter hunt season shuru!",
      "Bhai blizzard mein bhi /hunt karo",
    ],
  },
  {
    name: "SummerVibes",
    avatar: "☀️",
    messages: [
      "Beach episode waifu best waifu!",
      "Summer matsuri waifu hunt!",
      "Bhai summer special rare spawn hoga!",
    ],
  },
  {
    name: "AutumnLeaf",
    avatar: "🍂",
    messages: [
      "Autumn mein waifu gir rahi hain literally!",
      "Maple leaf waifu aesthetic~",
      "Bhai fall season best for hunting",
    ],
  },
  {
    name: "SpringBlossom",
    avatar: "🌺",
    messages: [
      "Sakura season = waifu season!",
      "Spring waifu freshest waifu~",
      "Hanami event mein waifu hunt karo!",
    ],
  },
  {
    name: "MidnightRun",
    avatar: "🌃",
    messages: [
      "Midnight city run aur waifu hunt!",
      "City lights, rare waifu sights~",
      "Bhai urban waifu aesthetic fire hai",
    ],
  },
  {
    name: "ForestSpirit",
    avatar: "🌲",
    messages: [
      "Forest spirit ka ashirvad: rare waifu!",
      "Bhai Mononoke vibes waifu hunt mein",
      "Ancient forest hidden waifus!",
    ],
  },
  {
    name: "VolcanoKing",
    avatar: "🌋",
    messages: [
      "Lava hot waifu appeared!",
      "Volcanic rare spawn INCOMING!",
      "Bhai eruption se rare waifu nikli!",
    ],
  },
  {
    name: "RiverFlow",
    avatar: "🏞️",
    messages: [
      "River current le jaayega waifu tak!",
      "Bhai flowing hair waifu best waifu",
      "Stream of consciousness = waifu thoughts",
    ],
  },
  {
    name: "WildHunter",
    avatar: "🏹",
    messages: [
      "Arrow shot! Waifu claimed!",
      "Bhai precision /hunt karo!",
      "Hunter instinct: rare waifu sense!",
    ],
  },
  {
    name: "ShadowStep",
    avatar: "👥",
    messages: [
      "Bhai shadow clone already hunting!",
      "Step into shadows, emerge with waifus~",
      "ANBU operative on waifu mission!",
    ],
  },
  {
    name: "GhostRider",
    avatar: "👻",
    messages: [
      "Ghost can still /hunt 😂",
      "Spectral waifu? Only I can see her!",
      "Bhai invisible waifu = mine alone!",
    ],
  },
  {
    name: "PhoenixRise",
    avatar: "🦅",
    messages: [
      "Phoenix reborn with new waifu!",
      "Ashes to rare waifus!",
      "Bhai rebirth mechanic in waifu game?",
    ],
  },
  {
    name: "DragonFly",
    avatar: "🦋",
    messages: [
      "Beautiful waifu flew by!",
      "Butterfly effect: one hunt, whole harem!",
      "Bhai transformation arc: waifu collector!",
    ],
  },
  {
    name: "TigerStreak",
    avatar: "🐯",
    messages: [
      "RAWR = rare waifu appeared!",
      "Tiger hunting waifu in wild!",
      "Bhai tiger mode /hunt FAST!",
    ],
  },
  {
    name: "WolfPack",
    avatar: "🐺",
    messages: [
      "Pack hunting waifus together!",
      "Alpha gets first waifu!",
      "Bhai wolf clan waifu team!",
    ],
  },
  {
    name: "BearGrip",
    avatar: "🐻",
    messages: [
      "Bhai bear hug your waifu!",
      "Grizzly rare waifu found!",
      "Hibernate ends, waifu hunt begins!",
    ],
  },
  {
    name: "FoxTricks",
    avatar: "🦊",
    messages: [
      "Kyuubi waifu is mine!",
      "Fox tricks: steal rare waifu!",
      "Bhai nine tails give nine waifus?",
    ],
  },
  {
    name: "RabbitSpeed",
    avatar: "🐰",
    messages: [
      "Fast as bunny /hunt!",
      "Bhai speed run waifu hunt!",
      "Usagi speed for rare claim!",
    ],
  },
  {
    name: "CatPerson",
    avatar: "🐱",
    messages: [
      "Nyan~ waifu dekhke dil bahar aayi!",
      "Cat girls best waifu category!",
      "Bhai nekopara vibes in this group!",
    ],
  },
  {
    name: "DogLoyalty",
    avatar: "🐕",
    messages: [
      "Loyal like dog to my waifu!",
      "Bhai Akamaru waifu finder?",
      "Good boy gets good waifu!",
    ],
  },
  {
    name: "PandaVibes",
    avatar: "🐼",
    messages: [
      "Panda rare like S-tier waifu!",
      "Black and white = balanced waifu taste!",
      "Bhai panda waifu adorable hai!",
    ],
  },
  {
    name: "EagleEye",
    avatar: "🦅",
    messages: [
      "Eagle eye spots rare waifu first!",
      "Bhai aerial view of waifu spawn!",
      "Soaring to waifu greatness!",
    ],
  },
  {
    name: "LionPride",
    avatar: "🦁",
    messages: [
      "King of waifus!",
      "Pride: my waifu collection!",
      "Bhai lion heart for best waifu!",
    ],
  },
  {
    name: "SnakeSense",
    avatar: "🐍",
    messages: [
      "Orochimaru-style waifu sense!",
      "Slither to the rare waifu~",
      "Bhai snake eyes on spawn!",
    ],
  },
  {
    name: "SwordMaster",
    avatar: "⚔️",
    messages: [
      "Blade of waifu justice!",
      "Bhai kenjutsu waifu hunt!",
      "Slash! Waifu claimed!",
    ],
  },
  {
    name: "ShieldBearer",
    avatar: "🛡️",
    messages: [
      "Protecting my waifu collection!",
      "Bhai shield > sword for waifu safety",
      "Guardian of the harem!",
    ],
  },
  {
    name: "CannonBall",
    avatar: "💣",
    messages: [
      "BOOM! Rare waifu found!",
      "Bhai explosive entry into harem!",
      "Cannon fodder for waifus? Worth it!",
    ],
  },
  {
    name: "RocketPunch",
    avatar: "🤜",
    messages: [
      "ROCKET PUNCH waifu!!",
      "Bhai Gurren Lagann vibes!",
      "Who the hell do you think waifus are?!",
    ],
  },
  {
    name: "LaserBeam",
    avatar: "🔆",
    messages: [
      "Laser focused on waifu hunt!",
      "Bhai beam of rare waifu energy!",
      "Pew pew waifu claimed!",
    ],
  },
  {
    name: "MagicCircle",
    avatar: "🔯",
    messages: [
      "Magic circle summon rare waifu!",
      "Bhai alchemy for waifu?",
      "Transmutation: coins to waifus!",
    ],
  },
  {
    name: "CrystalBall",
    avatar: "🔮",
    messages: [
      "Crystal ball predicted rare spawn!",
      "Bhai fortune teller confirmed waifu!",
      "Future vision: I see waifus~",
    ],
  },
  {
    name: "RuneWriter",
    avatar: "📜",
    messages: [
      "Ancient runes guide to rare waifu!",
      "Bhai runic waifu knowledge!",
      "Mystical inscription: /hunt!",
    ],
  },
  {
    name: "PotionBrew",
    avatar: "⚗️",
    messages: [
      "Potion of waifu luck crafted!",
      "Bhai alchemist brewed rare spawn!",
      "Drink up: waifu probability +100%!",
    ],
  },
  {
    name: "TomeReader",
    avatar: "📚",
    messages: [
      "Ancient tome of waifus found!",
      "Bhai reading all waifu lore!",
      "Knowledge = more waifus somehow!",
    ],
  },
  {
    name: "MapMaker",
    avatar: "🗺️",
    messages: [
      "Mapping all waifu spawn locations!",
      "Bhai treasure map to rare waifu!",
      "X marks the waifu spot!",
    ],
  },
  {
    name: "CompassSpin",
    avatar: "🧭",
    messages: [
      "Compass points to rare waifu!",
      "Bhai navigating harem expansion!",
      "True north = best waifu direction!",
    ],
  },
  {
    name: "GadgetGuru",
    avatar: "⚙️",
    messages: [
      "Tech gadget locate rare waifu!",
      "Bhai engineering waifu solutions!",
      "Gear up for waifu hunt!",
    ],
  },
  {
    name: "TreasureSeek",
    avatar: "💰",
    messages: [
      "X marks waifu treasure!",
      "Bhai gold = onex = waifus!",
      "Chest opened: rare waifu inside!",
    ],
  },
  {
    name: "GemCutter",
    avatar: "💎",
    messages: [
      "Diamond rare waifu found!",
      "Bhai precious stone = precious waifu!",
      "Cut and polished waifu collection!",
    ],
  },
  {
    name: "CrownWearer",
    avatar: "👑",
    messages: [
      "King claims the best waifus!",
      "Bhai royal decree: /hunt karo!",
      "Crown worthy waifu acquired!",
    ],
  },
  {
    name: "AnvilForge",
    avatar: "⚒️",
    messages: [
      "Forged my waifu collection in steel!",
      "Bhai blacksmith of waifus!",
      "Hammered out rare waifu claim!",
    ],
  },
  {
    name: "BrushStroke",
    avatar: "🖌️",
    messages: [
      "Painting my ideal waifu!",
      "Bhai artist waifu collection best!",
      "Masterpiece: my harem!",
    ],
  },
  {
    name: "NoteMusician",
    avatar: "🎵",
    messages: [
      "Music waifu > regular waifu!",
      "Bhai anime soundtrack + waifu = 💯",
      "Melody of rare waifu hunt~",
    ],
  },
  {
    name: "DrumBeat",
    avatar: "🥁",
    messages: [
      "BOOM BOOM waifu appeared!",
      "Bhai rhythm of /hunt!",
      "Drumroll for rare waifu...",
    ],
  },
  {
    name: "GuitarShred",
    avatar: "🎸",
    messages: [
      "SHRED! Rare waifu unlocked!",
      "Bhai rock and roll waifu life!",
      "Guitar solo for best waifu!",
    ],
  },
  {
    name: "PianoKeys",
    avatar: "🎹",
    messages: [
      "Classical taste: best waifus!",
      "Bhai piano waifu most elegant!",
      "Keys of waifu destiny~",
    ],
  },
  {
    name: "TrumpetCall",
    avatar: "🎺",
    messages: [
      "TRUMPET CALL: rare waifu here!",
      "Bhai herald announces waifu spawn!",
      "Fanfare for legendary waifu!",
    ],
  },
  {
    name: "CameraSnap",
    avatar: "📸",
    messages: [
      "Snap! Waifu photo taken!",
      "Bhai photographer of rare waifus!",
      "Album full of waifu memories~",
    ],
  },
  {
    name: "FilmRoll",
    avatar: "🎬",
    messages: [
      "ACTION! Waifu scene!",
      "Bhai director of waifu drama!",
      "Cut! Perfect waifu take!",
    ],
  },
  {
    name: "GamePadPro",
    avatar: "🎮",
    messages: [
      "GG! Waifu boss defeated!",
      "Bhai gamer has best waifu taste!",
      "PLAYER 1 claimed rare waifu!",
    ],
  },
  {
    name: "DiceRoller",
    avatar: "🎲",
    messages: [
      "Rolled 20! Rare waifu!",
      "Bhai luck stat maxed for hunt!",
      "Dice says: /hunt now!",
    ],
  },
  {
    name: "ChessKing",
    avatar: "♟️",
    messages: [
      "Strategic waifu collection!",
      "Bhai chess master of harams!",
      "Checkmate! Waifu mine!",
    ],
  },
  {
    name: "CardDealer",
    avatar: "🃏",
    messages: [
      "Wild card: rare waifu!",
      "Bhai card game = waifu game!",
      "Full house of waifus!",
    ],
  },
  {
    name: "PuzzlePiece",
    avatar: "🧩",
    messages: [
      "Last piece: found my waifu!",
      "Bhai puzzle complete = harem complete!",
      "Fitting waifu into collection~",
    ],
  },
  {
    name: "TrophyCase",
    avatar: "🏆",
    messages: [
      "Trophy: best waifu collector!",
      "Bhai championship in /hunt!",
      "Gold medal harem winner!",
    ],
  },
  {
    name: "LanternLight",
    avatar: "🏮",
    messages: [
      "Lantern guides to rare waifu!",
      "Bhai festival waifu season!",
      "Light in darkness = rare spawn!",
    ],
  },
  {
    name: "FireworkBurst",
    avatar: "🎆",
    messages: [
      "BOOM! Rare waifu appeared!",
      "Bhai celebrate waifu with fireworks!",
      "Spectacular waifu spawn!",
    ],
  },
  {
    name: "BalloonFly",
    avatar: "🎈",
    messages: [
      "Float to rare waifu!",
      "Bhai party time: new waifu!",
      "Balloon wishes: best waifu!",
    ],
  },
  {
    name: "ConfettiFall",
    avatar: "🎊",
    messages: [
      "CONFETTI! Rare waifu!",
      "Bhai celebration for new harem member!",
      "Party popper: waifu unlocked!",
    ],
  },
  {
    name: "RamenLover",
    avatar: "🍜",
    messages: [
      "Naruto ramen + waifu = life!",
      "Bhai ramen shop waifu encounter!",
      "Slurp! Waifu fuel!",
    ],
  },
  {
    name: "SushiRoll",
    avatar: "🍱",
    messages: [
      "Japanese culture: anime + sushi + waifu!",
      "Bhai sushi chef waifu?",
      "Roll roll roll your waifu~",
    ],
  },
  {
    name: "MochiBite",
    avatar: "🍡",
    messages: [
      "Mochi soft like good waifu!",
      "Bhai wagashi store waifu date!",
      "Sweet and sticky waifu feelings~",
    ],
  },
  {
    name: "MatcaTime",
    avatar: "🍵",
    messages: [
      "Matcha tea with my waifu~",
      "Bhai japanese tea ceremony waifu!",
      "Bitter tea, sweet waifu balance!",
    ],
  },
  {
    name: "SakuraBranch",
    avatar: "🌸",
    messages: [
      "Sakura season = waifu everywhere!",
      "Bhai hanami picnic with waifu!",
      "Petals fall, waifus spawn~",
    ],
  },
  {
    name: "BonsaiTree",
    avatar: "🌳",
    messages: [
      "Patient like bonsai, wait for rare!",
      "Bhai cultivation of waifu collection!",
      "Ancient tree, ancient waifu wisdom!",
    ],
  },
  {
    name: "LotusFlower",
    avatar: "🪷",
    messages: [
      "Pure as lotus = pure waifu!",
      "Bhai lotus blooms = rare spawn!",
      "Rising from water: rare waifu!",
    ],
  },
  {
    name: "KoiFish",
    avatar: "🐟",
    messages: [
      "Koi fish luck for rare waifu!",
      "Bhai Japanese koi pond waifu scene!",
      "Colorful koi = colorful harem!",
    ],
  },
  {
    name: "ToriiGate",
    avatar: "⛩️",
    messages: [
      "Shrine maiden waifu incoming!",
      "Bhai kami-sama bless my hunt!",
      "Sacred gate of waifus!",
    ],
  },
  {
    name: "FujiSan",
    avatar: "🗻",
    messages: [
      "Mt Fuji bless this rare waifu!",
      "Bhai summit: best waifu view!",
      "Climb to the top of waifu ranking!",
    ],
  },
  {
    name: "NightSkyGaze",
    avatar: "🌌",
    messages: [
      "Galaxy full of waifus~",
      "Bhai space waifu collection!",
      "Milky way = waifu highway!",
    ],
  },
  {
    name: "CometTail",
    avatar: "☄️",
    messages: [
      "Comet speed /hunt!",
      "Bhai wish on shooting waifu!",
      "Make a wish: rare waifu!",
    ],
  },
  {
    name: "SolarFlare",
    avatar: "🌞",
    messages: [
      "Sun-powered waifu hunt!",
      "Bhai solar energy for /hunt!",
      "Flare up: rare waifu spawn!",
    ],
  },
  {
    name: "LunarGlow",
    avatar: "🌙",
    messages: [
      "Moon goddess waifu best!",
      "Bhai lunar calendar rare spawn?",
      "Moonlit waifu = most romantic~",
    ],
  },
  {
    name: "AuroraWatch",
    avatar: "🌈",
    messages: [
      "Rainbow = all waifus collected!",
      "Bhai aurora borealis waifu!",
      "Colorful harem like aurora!",
    ],
  },
  {
    name: "CloudRider",
    avatar: "☁️",
    messages: [
      "Riding clouds to rare waifu!",
      "Bhai nimbus cloud + waifu!",
      "Above the clouds: legendary waifu!",
    ],
  },
  {
    name: "ZephyrWind",
    avatar: "💨",
    messages: [
      "Wind carries waifu to me!",
      "Bhai breeze = rare spawn hint!",
      "Zephyr brings rare waifu news~",
    ],
  },
  {
    name: "OniSlayer",
    avatar: "👹",
    messages: [
      "Oni mode: hunting waifus!",
      "Bhai demon slayer of rare waifus!",
      "FORM THREE: waifu obliteration!",
    ],
  },
  {
    name: "TenguFlight",
    avatar: "🦅",
    messages: [
      "Tengu flies to rare waifu spawn!",
      "Bhai mountain spirit waifu!",
      "Wind and feathers: rare waifu!",
    ],
  },
  {
    name: "KitsunePlay",
    avatar: "🦊",
    messages: [
      "Kitsune tricks: extra waifu!",
      "Bhai nine-tail fox = nine waifus!",
      "Illusion or real? It is a rare waifu!",
    ],
  },
  {
    name: "TanukiLuck",
    avatar: "🦝",
    messages: [
      "Tanuki shapeshifts into waifu... just kidding 😂",
      "Bhai raccoon dog lucky for /hunt!",
      "Transformation magic: waifu luck +!",
    ],
  },
  {
    name: "DaitenguSoar",
    avatar: "🌬️",
    messages: [
      "Mountain wind brings rare waifu!",
      "Bhai high altitude rare spawns!",
      "Tengu art: master waifu hunting!",
    ],
  },
  {
    name: "RyuJinDeep",
    avatar: "🌊",
    messages: [
      "Dragon god of sea sends rare waifu!",
      "Bhai ocean deity waifu blessing!",
      "Deep sea rare waifu unlocked!",
    ],
  },
  {
    name: "AmaterasuGlow",
    avatar: "☀️",
    messages: [
      "Sun goddess blessed this waifu!",
      "Bhai divine light on rare spawn!",
      "Amaterasu no waifu = legendary!",
    ],
  },
  {
    name: "SusanooStrike",
    avatar: "⛈️",
    messages: [
      "SUSANOO ACTIVATED for rare waifu!",
      "Bhai storm god waifu hunt!",
      "Divine technique: waifu claim!",
    ],
  },
  {
    name: "TsukuyomiDream",
    avatar: "🌙",
    messages: [
      "Dream world waifu is realest waifu!",
      "Bhai moon god shows rare spawn!",
      "Eternal moonlight waifu~",
    ],
  },
  {
    name: "IzanagiCreate",
    avatar: "✨",
    messages: [
      "Creation deity: spawned rare waifu!",
      "Bhai god-level waifu taste!",
      "Izanagi no waifu = top tier!",
    ],
  },
];

function formatTime(ts: bigint | number): string {
  const ms = typeof ts === "bigint" ? Number(ts) / 1_000_000 : ts;
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function checkCooldown(key: string): number {
  const stored = localStorage.getItem(key);
  if (!stored) return 0;
  const expiry = Number(stored);
  const remaining = expiry - Date.now();
  return remaining > 0 ? remaining : 0;
}

function setCooldown(key: string, durationMs = 86_400_000) {
  localStorage.setItem(key, String(Date.now() + durationMs));
}

function formatCooldownRemaining(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

function loadFriends(): LocalFriend[] {
  try {
    const raw = localStorage.getItem("sinzhu_friends");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function renderMessageWithMentions(
  content: string,
  myUsername: string,
): React.ReactNode {
  if (!content.includes("@")) return content;
  const parts = content.split(/(\@[\w\u0600-\u06FF]+)/g);
  const nodes: React.ReactNode[] = [];
  for (let idx = 0; idx < parts.length; idx++) {
    const part = parts[idx];
    if (part.startsWith("@")) {
      const mentioned = part.slice(1).toLowerCase();
      const isMe =
        Boolean(myUsername) && mentioned === myUsername.toLowerCase();
      nodes.push(
        <span
          key={idx}
          style={{ color: isMe ? "#ffd700" : "#5288c1", fontWeight: "bold" }}
        >
          {part}
        </span>,
      );
    } else {
      nodes.push(part);
    }
  }
  return nodes;
}

export default function ChatWindow({
  activeView,
  onBack,
  onNavigate,
}: ChatWindowProps) {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();

  const isGroup = activeView.type === "group";
  const groupName = isGroup ? activeView.groupName : null;
  const dmPrincipal = !isGroup
    ? (() => {
        try {
          return Principal.fromText(activeView.principalStr);
        } catch {
          return null;
        }
      })()
    : null;

  const { data: groups = [] } = useGroups();
  const group = groups.find((g) => g.name === groupName);

  const { data: groupMessages = [] } = useGetGroupMessages(groupName);
  const { data: dmMessages = [] } = useMessagesWith(dmPrincipal);
  const { data: dmUserProfile } = useUserProfile(dmPrincipal);
  const { data: harem = [] } = useUserHarem(myPrincipal ?? null);
  const { data: uploadedWaifus = [] } = useWaifuCharacters();

  const sendGroupMsg = useSendGroupMessage();
  const sendDMMsg = useSendDM();
  const huntWaifu = useHuntWaifuInGroup();
  const addWaifuToHarem = useAddWaifuToHarem();

  const [input, setInput] = useState("");
  const [editingBotMsgId, setEditingBotMsgId] = useState<string | null>(null);
  const [editingBotMsgText, setEditingBotMsgText] = useState("");
  const [localDeletedMsgIds, setLocalDeletedMsgIds] = useState<Set<string>>(
    new Set(),
  );
  const [localEditedMsgs, setLocalEditedMsgs] = useState<Map<string, string>>(
    new Map(),
  );
  const [showInfo, setShowInfo] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [spawnedWaifu, setSpawnedWaifu] = useState<WaifuCharacter | null>(null);
  const [localHaremIds, setLocalHaremIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("sinzhu_harem_global");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [botMessages, setBotMessages] = useState<BotMessage[]>([]);
  // Load botsActive from localStorage per group so it persists when user goes offline
  const [botsActive, setBotsActive] = useState<boolean>(() => {
    try {
      const key = `sinzhu_bots_active_${groupName ?? "global"}`;
      return localStorage.getItem(key) === "true";
    } catch {
      return false;
    }
  });
  const botsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeMembersIntervalRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [mentionDropdown, setMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [friends] = useState<LocalFriend[]>(loadFriends);
  const [isRecording, setIsRecording] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive my username from localStorage profile
  const myUsername = (() => {
    try {
      const raw = localStorage.getItem("sinzhu_profile");
      if (raw) {
        const p = JSON.parse(raw);
        return p.username || p.displayName || "";
      }
    } catch {}
    return "";
  })();

  // Per-group spawn interval & message count
  const [spawnInterval, setSpawnInterval] = useState(15);
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [callParticipants, setCallParticipants] = useState<string[]>([]);
  const [groupPhotoUrl, setGroupPhotoUrl] = useState<string>(() => {
    try {
      return (
        localStorage.getItem(`sinzhu_group_photo_${groupName ?? ""}`) || ""
      );
    } catch {
      return "";
    }
  });
  const [showHaremView, setShowHaremView] = useState(false);
  const groupPhotoInputRef = useRef<HTMLInputElement>(null);
  const msgCountRef = useRef(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load slavetime and message count from localStorage on mount/group change
  useEffect(() => {
    if (!groupName) return;
    const savedInterval = localStorage.getItem(`sinzhu_slavetime_${groupName}`);
    if (savedInterval) setSpawnInterval(Number(savedInterval));
    const savedCount = localStorage.getItem(`sinzhu_msgcount_${groupName}`);
    if (savedCount) msgCountRef.current = Number(savedCount);
  }, [groupName]);

  // Anime bots chat interval — active when botsActive=true
  useEffect(() => {
    if (!isGroup || !botsActive) {
      if (botsIntervalRef.current) {
        clearInterval(botsIntervalRef.current);
        botsIntervalRef.current = null;
      }
      return;
    }
    botsIntervalRef.current = setInterval(
      () => {
        // Pick a random bot
        const bot = ANIME_BOTS[Math.floor(Math.random() * ANIME_BOTS.length)];
        const msg =
          bot.messages[Math.floor(Math.random() * bot.messages.length)];
        const botMsg: BotMessage = {
          id: `animebot-${Date.now()}-${Math.random()}`,
          content: msg,
          timestamp: Date.now(),
          senderName: `${bot.avatar} ${bot.name}`,
          isUserMessage: true,
          isOwn: false,
        };
        setBotMessages((prev) => [...prev, botMsg]);
        msgCountRef.current += 1;
        // Waifu spawn check
        if (
          msgCountRef.current >= spawnInterval &&
          msgCountRef.current % spawnInterval === 0
        ) {
          setTimeout(() => triggerWaifuSpawn(), 500);
        }
      },
      4000 + Math.random() * 3000,
    );
    return () => {
      if (botsIntervalRef.current) {
        clearInterval(botsIntervalRef.current);
        botsIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botsActive, isGroup, spawnInterval]);

  // Active members — always-on background chat (independent of botsActive)
  useEffect(() => {
    if (!isGroup) return;
    const fireMsg = () => {
      const member =
        ACTIVE_MEMBERS[Math.floor(Math.random() * ACTIVE_MEMBERS.length)];
      let msg =
        member.messages[Math.floor(Math.random() * member.messages.length)];
      // Occasionally mention the user
      const uname = (() => {
        try {
          const p = JSON.parse(localStorage.getItem("sinzhu_profile") || "{}");
          return p.username || p.displayName || "";
        } catch {
          return "";
        }
      })();
      if (uname && Math.random() < 0.15) {
        msg = `${msg} @${uname}`;
      } else if (Math.random() < 0.1) {
        const otherMember =
          ACTIVE_MEMBERS[Math.floor(Math.random() * ACTIVE_MEMBERS.length)];
        msg = `${msg} @${otherMember.name}`;
      }
      setBotMessages((prev) => [
        ...prev,
        {
          id: `active-${Date.now()}-${Math.random()}`,
          content: msg,
          timestamp: Date.now(),
          senderName: `${member.avatar} ${member.name}`,
          isUserMessage: true,
          isOwn: false,
        },
      ]);
    };
    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 5000;
      activeMembersIntervalRef.current = setTimeout(() => {
        fireMsg();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => {
      if (activeMembersIntervalRef.current) {
        clearTimeout(activeMembersIntervalRef.current);
        activeMembersIntervalRef.current = null;
      }
    };
  }, [isGroup]);

  // Rotate placeholder hints
  useEffect(() => {
    if (!isGroup) return;
    const id = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_HINTS.length);
    }, 4000);
    return () => clearInterval(id);
  }, [isGroup]);

  const msgLengthRef = useRef(0);
  const allMessages = [
    ...groupMessages,
    ...botMessages.map((b) => ({ ...b, _isBot: true })),
  ];
  useEffect(() => {
    const len = allMessages.length;
    if (len !== msgLengthRef.current) {
      msgLengthRef.current = len;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  });

  const addBotMessage = (
    content: string,
    waifuCard?: WaifuCharacter | null,
    isWaifuSpawnCard = false,
  ) => {
    const msg: BotMessage = {
      id: `bot-${Date.now()}-${Math.random()}`,
      content,
      timestamp: Date.now(),
      waifuCard,
      isWaifuSpawnCard,
    };
    setBotMessages((prev) => [...prev, msg]);
  };

  const triggerWaifuSpawn = async () => {
    if (!groupName) return;
    if (uploadedWaifus.length === 0) {
      addBotMessage(
        "⚠️ Koi waifu upload nahi hai abhi — admin se waifus upload karne ko kaho!",
      );
      return;
    }
    const waifuPool = uploadedWaifus;
    try {
      const waifu = await huntWaifu.mutateAsync(groupName);
      const spawned =
        waifu ?? waifuPool[Math.floor(Math.random() * waifuPool.length)];
      setSpawnedWaifu(spawned);
      addBotMessage(
        "🌸 A wild waifu appeared! Quick, type /hunt to claim her before someone else does!",
        spawned,
        true,
      );
    } catch {
      const spawned = waifuPool[Math.floor(Math.random() * waifuPool.length)];
      setSpawnedWaifu(spawned);
      addBotMessage(
        "🌸 A wild waifu appeared! Quick, type /hunt to claim her before someone else does!",
        spawned,
        true,
      );
    }
  };

  // Build mention candidates: friends + group members
  const mentionCandidates: string[] = [
    ...friends.map((f) => f.username),
    ...(group?.members ?? []).map((m) => m.toString().slice(0, 8)),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const filteredMentions = mentionDropdown
    ? mentionCandidates.filter((u) =>
        u.toLowerCase().startsWith(mentionQuery.toLowerCase()),
      )
    : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    // Detect @ mention
    const lastAtIdx = val.lastIndexOf("@");
    if (lastAtIdx !== -1) {
      const afterAt = val.slice(lastAtIdx + 1);
      // Only show if no space after @
      if (!afterAt.includes(" ")) {
        setMentionDropdown(true);
        setMentionQuery(afterAt);
        return;
      }
    }
    setMentionDropdown(false);
    setMentionQuery("");
  };

  const handleMentionSelect = (username: string) => {
    const lastAtIdx = input.lastIndexOf("@");
    const newInput = `${input.slice(0, lastAtIdx)}@${username} `;
    setInput(newInput);
    setMentionDropdown(false);
    setMentionQuery("");
    inputRef.current?.focus();
  };

  const checkMentionsInMessage = (content: string, sender: string) => {
    if (!myUsername) return;
    const mentionRegex = new RegExp(`@${myUsername}\\b`, "i");
    if (mentionRegex.test(content)) {
      toast(`🔔 You were mentioned by ${sender} in ${groupName ?? "chat"}`, {
        duration: 5000,
        style: {
          background: "#2b4a1a",
          border: "1px solid #3b9e5a",
          color: "#e8f4fd",
        },
      });
    }
  };

  const handleMediaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localProfile = (() => {
      try {
        const r = localStorage.getItem("sinzhu_profile");
        return r ? JSON.parse(r) : null;
      } catch {
        return null;
      }
    })();
    const username =
      myPrincipal?.toString().slice(0, 8) ??
      localProfile?.username ??
      localProfile?.displayName ??
      "Collector";
    const url = URL.createObjectURL(file);
    const mediaType = file.type.startsWith("video") ? "video" : "image";
    const mediaMsg: BotMessage = {
      id: `media-${Date.now()}-${Math.random()}`,
      content: "",
      timestamp: Date.now(),
      isUserMessage: true,
      isOwn: true,
      senderName: username,
      mediaType,
      mediaUrl: url,
    };
    setBotMessages((prev) => [...prev, mediaMsg]);
    msgCountRef.current += 1;
    const botMsg =
      BOT_CASUAL_MESSAGES[
        Math.floor(Math.random() * BOT_CASUAL_MESSAGES.length)
      ];
    setTimeout(() => addBotMessage(botMsg), 800);
    e.target.value = "";
  };

  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaStreamRef.current) {
        for (const track of mediaStreamRef.current.getTracks()) track.stop();
        mediaStreamRef.current = null;
      }
      setIsRecording(false);
      const localProfile2 = (() => {
        try {
          const r = localStorage.getItem("sinzhu_profile");
          return r ? JSON.parse(r) : null;
        } catch {
          return null;
        }
      })();
      const voiceUsername =
        myPrincipal?.toString().slice(0, 8) ??
        localProfile2?.username ??
        localProfile2?.displayName ??
        "Collector";
      const voiceMsg: BotMessage = {
        id: `voice-${Date.now()}-${Math.random()}`,
        content: "🎤 Voice message",
        timestamp: Date.now(),
        isUserMessage: true,
        isOwn: true,
        senderName: voiceUsername,
        mediaType: "voice",
      };
      setBotMessages((prev) => [...prev, voiceMsg]);
      msgCountRef.current += 1;
      const botMsg2 =
        BOT_CASUAL_MESSAGES[
          Math.floor(Math.random() * BOT_CASUAL_MESSAGES.length)
        ];
      setTimeout(() => addBotMessage(botMsg2), 800);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaStreamRef.current = stream;
        setIsRecording(true);
        toast("🎤 Recording... tap again to stop", {
          duration: 3000,
          style: {
            background: "#1c2733",
            border: "1px solid #c15252",
            color: "#e8f4fd",
          },
        });
      } catch {
        toast.error(
          "❌ Mic access denied. Please allow microphone permission.",
        );
      }
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;

    setInput("");
    setMentionDropdown(false);

    const localProfile = (() => {
      try {
        const r = localStorage.getItem("sinzhu_profile");
        return r ? JSON.parse(r) : null;
      } catch {
        return null;
      }
    })();
    const username =
      myPrincipal?.toString().slice(0, 8) ??
      localProfile?.username ??
      localProfile?.displayName ??
      "Collector";
    const principalStr = myPrincipal?.toString() ?? "local";

    // Only process commands in group chat
    if (isGroup && groupName && content.startsWith("/")) {
      const parts = content.split(" ");
      const cmd = parts[0].toLowerCase();
      const arg = parts.slice(1).join(" ").trim();

      switch (cmd) {
        case "/hunt": {
          if (!spawnedWaifu) {
            addBotMessage(
              "😅 No waifu right now! Keep chatting and one will appear soon~",
            );
          } else if (!arg) {
            addBotMessage(
              `🍀 A wild waifu appeared! Guess her name to claim her!\nType: /hunt <name>\nHint: She has ${RARITY_CONFIG[spawnedWaifu.rarity]?.icon ?? "🟢"} ${RARITY_CONFIG[spawnedWaifu.rarity]?.label ?? spawnedWaifu.rarity} rarity~`,
            );
          } else if (
            !spawnedWaifu.name
              .toLowerCase()
              .trim()
              .includes(arg.toLowerCase().trim()) &&
            spawnedWaifu.name.toLowerCase().trim() !== arg.toLowerCase().trim()
          ) {
            addBotMessage(
              `❌ Wrong name! That's not her. Hint: Her name starts with "${spawnedWaifu.name[0]}"~ Try again with /hunt <name>`,
            );
          } else {
            const caught = spawnedWaifu;
            setSpawnedWaifu(null);
            const _rarityInfo =
              RARITY_CONFIG[caught.rarity] ?? RARITY_CONFIG.common;
            addBotMessage(
              `🎉 Congrats ${username}! ${caught.name} is now yours! She's lucky to have you~ 💕`,
            );
            toast.success(`🎉 You caught ${caught.name}!`);
            // Add to harem
            if (myPrincipal) {
              try {
                await addWaifuToHarem.mutateAsync({
                  userId: myPrincipal,
                  obtainedAt: BigInt(Date.now()) * 1_000_000n,
                  isFavorite: false,
                  characterId: caught.id,
                });
              } catch {
                // Silently add to local harem
              }
              setLocalHaremIds((prev) => {
                const updated = [...prev, caught.id];
                try {
                  localStorage.setItem(
                    "sinzhu_harem_global",
                    JSON.stringify(updated),
                  );
                } catch {}
                return updated;
              });
              toast.success("+50 Onex earned! 💰", { duration: 2000 });
            }
            if (onNavigate) {
              setTimeout(() => {
                toast(
                  <div className="flex items-center gap-2">
                    <span>Want to see your collection?</span>
                    <button
                      type="button"
                      className="px-2 py-1 rounded text-white text-xs font-bold"
                      style={{ background: "#5288c1" }}
                      onClick={() => onNavigate("harem")}
                    >
                      🎴 View Harem
                    </button>
                  </div>,
                  { duration: 6000 },
                );
              }, 1000);
            }
          }
          return;
        }

        case "/harem": {
          setShowHaremView(true);
          return;
        }

        case "/fav": {
          if (!arg) {
            toast.error("❌ Usage: /fav [waifu-id]");
          } else {
            toast.success(`✅ Waifu ${arg} marked as favorite!`);
          }
          return;
        }

        case "/hclaim": {
          const cdKey = `sinzhu_hclaim_${principalStr}`;
          const remaining = checkCooldown(cdKey);
          if (remaining > 0) {
            toast.info(
              `⏳ Hclaim on cooldown. Come back in ${formatCooldownRemaining(remaining)}`,
            );
          } else {
            const hclaimPool =
              uploadedWaifus.length > 0 ? uploadedWaifus : SEED_WAIFUS;
            const freeWaifu = hclaimPool.filter(
              (w) => w.rarity === "common" || w.rarity === "medium",
            );
            const picked =
              freeWaifu[Math.floor(Math.random() * freeWaifu.length)] ??
              hclaimPool[0];
            setCooldown(cdKey);
            toast.success(
              `🎀 Daily waifu claimed: ${picked.name}! Check your harem~`,
            );
            if (myPrincipal) {
              try {
                await addWaifuToHarem.mutateAsync({
                  userId: myPrincipal,
                  obtainedAt: BigInt(Date.now()) * 1_000_000n,
                  isFavorite: false,
                  characterId: picked.id,
                });
              } catch {
                // ignore
              }
            }
          }
          return;
        }

        case "/daily": {
          const cdKey = `sinzhu_daily_${principalStr}`;
          const remaining = checkCooldown(cdKey);
          if (remaining > 0) {
            toast.info(
              `⏳ Daily on cooldown. Come back in ${formatCooldownRemaining(remaining)}`,
            );
          } else {
            setCooldown(cdKey);
            toast.success("💎 Daily Onex claimed! +100 Onex");
          }
          return;
        }

        case "/welkin": {
          const cdKey = `sinzhu_welkin_${principalStr}`;
          const remaining = checkCooldown(cdKey);
          if (remaining > 0) {
            toast.info(
              `⏳ Welkin on cooldown. Come back in ${formatCooldownRemaining(remaining)}`,
            );
          } else {
            setCooldown(cdKey);
            toast.success("🗓 Welkin reward claimed! +150 Onex");
          }
          return;
        }

        case "/tesure":
        case "/treasure": {
          const cdKey = `sinzhu_treasure_${principalStr}`;
          const remaining = checkCooldown(cdKey);
          if (remaining > 0) {
            toast.info(
              `⏳ Treasure on cooldown. Come back in ${formatCooldownRemaining(remaining)}`,
            );
          } else {
            const rewards = ["+50 Onex", "+200 Onex", "a rare waifu!"];
            const reward = rewards[Math.floor(Math.random() * rewards.length)];
            setCooldown(cdKey);
            toast.success(`🪅 Treasure claimed! You got ${reward}`);
          }
          return;
        }

        case "/onex": {
          const bal = 100;
          toast.info(`💸 Your Onex balance: ${bal} Onex`);
          return;
        }

        case "/tops": {
          addBotMessage(
            "💸 Top 10 Onex Holders:\n" +
              "1. 🥇 WaifuKing — 9,820 Onex\n" +
              "2. 🥈 SakuraMaster — 7,410 Onex\n" +
              "3. 🥉 NightCrawler — 6,100 Onex\n" +
              "4. CelestialHunter — 5,500 Onex\n" +
              "5. DragonSlayer — 4,900 Onex\n" +
              "6. MoonLight — 4,200 Onex\n" +
              "7. StarWeave — 3,800 Onex\n" +
              "8. CyberNova — 3,100 Onex\n" +
              "9. ShadowRealm — 2,700 Onex\n" +
              "10. HikariAngel — 2,300 Onex",
          );
          return;
        }

        case "/top": {
          addBotMessage(
            "🏆 Top 10 Waifu Collectors:\n" +
              "1. 🥇 WaifuKing — 483 waifus\n" +
              "2. 🥈 SakuraMaster — 371 waifus\n" +
              "3. 🥉 NightCrawler — 294 waifus\n" +
              "4. CelestialHunter — 241 waifus\n" +
              "5. DragonSlayer — 198 waifus\n" +
              "6. MoonLight — 175 waifus\n" +
              "7. StarWeave — 149 waifus\n" +
              "8. CyberNova — 123 waifus\n" +
              "9. ShadowRealm — 98 waifus\n" +
              "10. HikariAngel — 76 waifus",
          );
          return;
        }

        case "/topgroups": {
          addBotMessage(
            "🌐 Top 10 Waifu Groups:\n" +
              "1. 🥇 SinzhuWorld — 2,841 hunts\n" +
              "2. 🥈 WaifuHaven — 1,993 hunts\n" +
              "3. 🥉 AnimeElite — 1,720 hunts\n" +
              "4. SakuraGarden — 1,410 hunts\n" +
              "5. NightHunters — 1,200 hunts\n" +
              "6. CelestialClan — 980 hunts\n" +
              "7. MoonRisers — 840 hunts\n" +
              "8. StarGazers — 710 hunts\n" +
              "9. DragonCove — 590 hunts\n" +
              "10. CyberZone — 430 hunts",
          );
          return;
        }

        case "/rank": {
          const count = harem.length;
          const rank = getRankForCount(count);
          addBotMessage(
            `🐲 Your Rank: ${rank.icon} ${rank.name}\nWaifus collected: ${count}\nNext rank at: ${rank.minCount + 20} waifus\nKeep hunting to level up! 💪`,
          );
          return;
        }

        case "/check": {
          if (!arg) {
            toast.error("❌ Usage: /check [waifu-id or name]");
            return;
          }
          const found = SEED_WAIFUS.find(
            (w) =>
              w.id === arg || w.name.toLowerCase().includes(arg.toLowerCase()),
          );
          if (found) {
            const ri = RARITY_CONFIG[found.rarity] ?? RARITY_CONFIG.common;
            addBotMessage(
              `🔎 Character Found!\nName: ${found.name}\nSeries: ${found.series}\nRarity: ${ri.icon} ${ri.label}\nID: ${found.id}`,
            );
          } else {
            addBotMessage(
              `❌ Character "${arg}" not found. Try a different name or ID.`,
            );
          }
          return;
        }

        case "/wsell": {
          if (!arg) {
            toast.error("❌ Usage: /wsell [waifu-id]");
            return;
          }
          const owned = harem.find((h) => h.characterId === arg);
          if (!owned) {
            toast.error(`❌ Waifu "${arg}" not in your harem.`);
            return;
          }
          const char = SEED_WAIFUS.find((w) => w.id === arg);
          const price = char ? (RARITY_SELL_PRICES[char.rarity] ?? 10) : 10;
          toast.success(`💶 Sold! Got ${price} Onex`);
          return;
        }

        case "/gift": {
          toast.info(
            "🎁 Gift system: use the Gift page to send waifus to friends by Principal ID",
          );
          if (onNavigate) {
            setTimeout(() => onNavigate("gift"), 500);
          }
          return;
        }

        case "/pay": {
          toast.info("💰 Pay system: use the Pay page to send Onex to friends");
          if (onNavigate) {
            setTimeout(() => onNavigate("pay"), 500);
          }
          return;
        }

        case "/wpass":
        case "/wpss": {
          toast.info(
            "🦁 Waifu Pass: check the WPass page for your pass status",
          );
          if (onNavigate) {
            setTimeout(() => onNavigate("waifupass"), 500);
          }
          return;
        }
        case "/shop": {
          toast.success("🛍️ Opening Shop...");
          if (onNavigate) onNavigate("shop");
          return;
        }

        case "/leaderboard": {
          addBotMessage(
            "🏆 Leaderboard — Top Collectors:\n" +
              "1. WaifuKing — 483 waifus\n" +
              "2. SakuraMaster — 371 waifus\n" +
              "3. NightCrawler — 294 waifus",
          );
          return;
        }

        case "/slavetime": {
          if (!arg) {
            addBotMessage(
              `⏱️ Current spawn interval: every ${spawnInterval} messages. Use /slavetime [number] to change (minimum 15).`,
            );
            return;
          }
          const n = Number(arg);
          if (Number.isNaN(n) || n < 15) {
            addBotMessage(
              "❌ Minimum slavetime is 15! Please use /slavetime 15 or higher.",
            );
          } else {
            setSpawnInterval(n);
            if (groupName)
              localStorage.setItem(`sinzhu_slavetime_${groupName}`, String(n));
            addBotMessage(
              `✅ Waifu will now spawn every ${n} messages in this group!`,
            );
          }
          return;
        }

        case "/oon": {
          if (botsActive) {
            addBotMessage(
              "🤖 Anime bots pehle se active hain! Use /off to stop them.",
            );
          } else {
            setBotsActive(true);
            try {
              localStorage.setItem(
                `sinzhu_bots_active_${groupName ?? "global"}`,
                "true",
              );
            } catch {}
            addBotMessage(
              "🎉 Anime Bot Party MODE ON!\n\n12 anime bots join ho gaye group mein! Ab woh aapas mein anime ki baatein karenge — Hinglish aur English mein~ 🍥⚡🌸\n\n/off likhne se band ho jaayenge!",
            );
            // Send intro messages from a few bots
            const introMsgs = [
              {
                bot: ANIME_BOTS[0],
                msg: "DATTEBAYO! Main aa gaya group mein! Koi hunt karega? 🍥",
              },
              {
                bot: ANIME_BOTS[1],
                msg: "Hn. Finally kuch interesting ho raha hai group mein. ⚡",
              },
              {
                bot: ANIME_BOTS[2],
                msg: "OMG everyone is here!! Konnichiwa minna!! 🌸🎊",
              },
            ];
            introMsgs.forEach(({ bot, msg }, i) => {
              setTimeout(
                () => {
                  setBotMessages((prev) => [
                    ...prev,
                    {
                      id: `intro-${Date.now()}-${i}`,
                      content: msg,
                      timestamp: Date.now() + i * 100,
                      senderName: `${bot.avatar} ${bot.name}`,
                      isUserMessage: true,
                      isOwn: false,
                    },
                  ]);
                },
                (i + 1) * 1200,
              );
            });
          }
          return;
        }

        case "/oof": {
          if (!botsActive) {
            addBotMessage(
              "🤖 Anime bots pehle se inactive hain! Use /on to activate them.",
            );
          } else {
            setBotsActive(false);
            try {
              localStorage.setItem(
                `sinzhu_bots_active_${groupName ?? "global"}`,
                "false",
              );
            } catch {}
            addBotMessage(
              "😴 Anime bots sone chale gaye... Group wapas quiet ho gaya~\n\n/on likhne se wapas aa jaayenge! 👋",
            );
          }
          return;
        }

        case "/start": {
          addBotMessage(
            `🎀 Welcome to SinzhuWaifu Bot! Here are all commands:\n\n${ALL_COMMANDS.map((c) => `${c.cmd} — ${c.desc}`).join("\n")}`,
          );
          return;
        }

        default: {
          addBotMessage(
            `❓ Unknown command "${cmd}". Type /start to see all commands.`,
          );
          return;
        }
      }
    }

    // Normal message — check for @mentions of current user
    if (isGroup && groupName) {
      // Check if message mentions anyone in the group (we simulate other user detection via bot)
      // Always show message locally immediately
      const localMsg: BotMessage = {
        id: `local-${Date.now()}-${Math.random()}`,
        content,
        timestamp: Date.now(),
        isUserMessage: true,
        isOwn: true,
        senderName: username,
      };
      setBotMessages((prev) => [...prev, localMsg]);
      msgCountRef.current += 1;
      if (groupName) {
        localStorage.setItem(
          `sinzhu_msgcount_${groupName}`,
          String(msgCountRef.current),
        );
      }

      // Bot replies to every message
      const botMsg =
        BOT_CASUAL_MESSAGES[
          Math.floor(Math.random() * BOT_CASUAL_MESSAGES.length)
        ];
      setTimeout(() => addBotMessage(botMsg), 800);

      // Waifu spawn check
      if (
        msgCountRef.current >= spawnInterval &&
        msgCountRef.current % spawnInterval === 0
      ) {
        setTimeout(() => triggerWaifuSpawn(), 1000);
      }

      // Try backend (ignore error)
      try {
        await sendGroupMsg.mutateAsync({ groupName, content });
      } catch {
        /* already shown locally */
      }
    } else if (!isGroup && dmPrincipal) {
      try {
        await sendDMMsg.mutateAsync({ toUser: dmPrincipal, content });
      } catch {
        toast.error("Failed to send DM.");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionDropdown && filteredMentions.length > 0) {
      if (e.key === "Escape") {
        setMentionDropdown(false);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const chatTitle = isGroup
    ? groupName
    : dmUserProfile?.displayName ||
      dmUserProfile?.username ||
      `${activeView.principalStr.slice(0, 12)}...`;
  const chatSubtitle = isGroup
    ? `${group?.members?.length ?? 0} members`
    : dmUserProfile?.username
      ? `@${dmUserProfile.username}`
      : "Direct Message";

  // Merge real messages + bot messages (sorted by timestamp)
  const mergedMessages: Array<
    | { _type: "real"; msg: GroupMessage; idx: number }
    | { _type: "bot"; msg: BotMessage }
  > = [
    ...(groupMessages as GroupMessage[]).map((msg, idx) => ({
      _type: "real" as const,
      msg,
      idx,
    })),
    ...botMessages.map((msg) => ({ _type: "bot" as const, msg })),
  ].sort((a, b) => {
    const ta =
      a._type === "real"
        ? Number(a.msg.timestamp) / 1_000_000
        : a.msg.timestamp;
    const tb =
      b._type === "real"
        ? Number(b.msg.timestamp) / 1_000_000
        : b.msg.timestamp;
    return ta - tb;
  });

  return (
    <div
      className="flex-1 flex flex-col h-full"
      style={{ background: "#17212b" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-3 py-3 flex-shrink-0"
        style={{ background: "#17212b", borderBottom: "1px solid #1c2733" }}
      >
        <button
          type="button"
          onClick={onBack}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-full"
          style={{ color: "#5288c1" }}
          data-ocid="chat.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div
          className="relative flex-shrink-0 group/avatar"
          onClick={() => isGroup && groupPhotoInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              isGroup && groupPhotoInputRef.current?.click();
            }
          }}
          role={isGroup ? "button" : undefined}
          tabIndex={isGroup ? 0 : undefined}
          style={{ cursor: isGroup ? "pointer" : "default" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white overflow-hidden"
            style={{
              background: isGroup ? stringToColor(groupName ?? "") : "#5288c1",
            }}
          >
            {groupPhotoUrl && isGroup ? (
              <img
                src={groupPhotoUrl}
                alt="group"
                className="w-full h-full object-cover"
              />
            ) : isGroup ? (
              (groupName?.[0]?.toUpperCase() ?? "G")
            ) : (
              (chatTitle?.[0]?.toUpperCase() ?? "U")
            )}
          </div>
          {isGroup && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              <Camera className="w-4 h-4 text-white" />
            </div>
          )}
          <span
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
            style={{
              background: isGroup ? "#3b9e5a" : "#8eacbb",
              borderColor: "#17212b",
            }}
          />
          {isGroup && (
            <input
              type="file"
              accept="image/*"
              ref={groupPhotoInputRef}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const url = ev.target?.result as string;
                  if (url) {
                    localStorage.setItem(
                      `sinzhu_group_photo_${groupName ?? ""}`,
                      url,
                    );
                    localStorage.setItem(`groupPhoto_${groupName ?? ""}`, url);
                    setGroupPhotoUrl(url);
                    toast.success("Group photo updated!");
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="font-bold text-sm truncate"
            style={{ color: "#e8f4fd" }}
          >
            {chatTitle}
          </p>
          <p className="text-xs truncate" style={{ color: "#8eacbb" }}>
            {chatSubtitle}
          </p>
        </div>

        {isGroup && (
          <div className="flex items-center gap-1">
            {!inCall ? (
              <button
                type="button"
                onClick={() => {
                  setInCall(true);
                  const participants = ANIME_BOTS.slice(0, 5).map(
                    (b) => b.name,
                  );
                  setCallParticipants(participants);
                  addBotMessage(
                    "📞 Group call shuru ho gaya! Sabhi members join kar sakte hain.",
                  );
                  ANIME_BOTS.slice(0, 3).forEach((bot, i) => {
                    setTimeout(
                      () => {
                        setBotMessages((prev) => [
                          ...prev,
                          {
                            id: `call-join-${Date.now()}-${i}`,
                            content: `📞 ${bot.avatar} ${bot.name} ne call join kiya!`,
                            timestamp: Date.now(),
                            senderName: "🍀 sɪɴᴢʜᴜ ᴡᴀɪғᴜ ʙᴏᴛ 🍭",
                            isUserMessage: true,
                            isOwn: false,
                          },
                        ]);
                      },
                      (i + 1) * 1500,
                    );
                  });
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:brightness-125"
                style={{ background: "#1c3a20", color: "#3b9e5a" }}
                data-ocid="chat.call.button"
                title="Start Group Call"
              >
                <Phone className="w-4 h-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{ color: "#8eacbb" }}
              data-ocid="chat.info.button"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Group Call Bar */}
      {isGroup && inCall && (
        <div
          className="flex items-center gap-3 px-4 py-2 flex-shrink-0"
          style={{ background: "#1a3a22", borderBottom: "1px solid #2d6a35" }}
          data-ocid="chat.call.panel"
        >
          <span
            className="flex items-center gap-2 flex-1 text-sm font-semibold"
            style={{ color: "#4caf72" }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            📞 Group call • {callParticipants.length + 1} participants
          </span>
          <button
            type="button"
            title={micOn ? "Mute mic" : "Unmute mic"}
            onClick={() => {
              setMicOn((prev) => {
                toast(prev ? "🔇 Mic muted" : "🎤 Mic unmuted");
                return !prev;
              });
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
            style={{
              background: micOn ? "#1c3a20" : "#3a1c1c",
              color: micOn ? "#3b9e5a" : "#e05555",
            }}
            data-ocid="chat.call.mic.toggle"
          >
            {micOn ? (
              <Mic className="w-4 h-4" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            title="Leave call"
            onClick={() => {
              setInCall(false);
              setCallParticipants([]);
              addBotMessage("📞 Aap ne call leave kar diya.");
              toast("📞 Call left");
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
            style={{ background: "#3a1c1c", color: "#e05555" }}
            data-ocid="chat.call.leave.button"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Waifu Spawn Banner */}
      <AnimatePresence>
        {spawnedWaifu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4 mt-2 rounded-xl overflow-hidden flex items-center gap-3 p-3 flex-shrink-0"
            style={{ background: "#2b5278", border: "1px solid #5288c1" }}
            data-ocid="chat.waifu_spawn.panel"
          >
            <img
              src={spawnedWaifu.imageUrl}
              alt="?"
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-xs font-bold" style={{ color: "#87CEEB" }}>
                ✨ Waifu Appeared!
              </p>
              <p className="text-sm text-white">
                Type <span className="font-bold">/hunt &lt;name&gt;</span> to
                claim!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSpawnedWaifu(null)}
              style={{ color: "#8eacbb" }}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline Harem View */}
      {showHaremView ? (
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ background: "#17212b" }}
        >
          {/* Harem top bar */}
          <div
            className="flex items-center px-3 py-3 flex-shrink-0"
            style={{ background: "#17212b", borderBottom: "1px solid #1c2733" }}
          >
            <button
              type="button"
              onClick={() => setShowHaremView(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold mr-3"
              style={{ background: "#1c2f45", color: "#87CEEB" }}
              data-ocid="harem.back.button"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <p
              className="flex-1 text-center text-base font-bold"
              style={{ color: "#e8f4fd", marginRight: "3.5rem" }}
            >
              🎴 My Harem
            </p>
          </div>
          {/* Harem content */}
          <div className="flex-1 overflow-y-auto p-4">
            {(() => {
              const backendIds = harem.map((h) => h.characterId);
              const allIds = Array.from(
                new Set([...backendIds, ...localHaremIds]),
              );
              const waifuPool =
                uploadedWaifus.length > 0 ? uploadedWaifus : SEED_WAIFUS;
              const haremChars = allIds
                .map(
                  (id) =>
                    waifuPool.find((w) => w.id === id) ??
                    SEED_WAIFUS.find((w) => w.id === id),
                )
                .filter(Boolean) as import("../backend").WaifuCharacter[];
              if (haremChars.length === 0) {
                return (
                  <div
                    className="flex-1 flex items-center justify-center h-full pt-16 text-center"
                    data-ocid="harem.empty_state"
                  >
                    <div>
                      <div className="text-5xl mb-4">🎴</div>
                      <p
                        className="text-base font-semibold"
                        style={{ color: "#8eacbb" }}
                      >
                        Your harem is empty!
                      </p>
                      <p className="text-sm mt-1" style={{ color: "#4a6278" }}>
                        Hunt waifus with /hunt~ 🍀
                      </p>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                  data-ocid="harem.list"
                >
                  {haremChars.map((waifu, idx) => {
                    const ri =
                      RARITY_CONFIG[waifu.rarity] ?? RARITY_CONFIG.common;
                    return (
                      <div
                        key={waifu.id}
                        className="rounded-xl overflow-hidden flex flex-col"
                        style={{
                          background: "#1c2733",
                          border: "1px solid #2b3d54",
                        }}
                        data-ocid={`harem.item.${idx + 1}`}
                      >
                        <img
                          src={waifu.imageUrl}
                          alt={waifu.name}
                          className="w-full object-cover"
                          style={{ height: "140px", filter: "none" }}
                        />
                        <div className="p-2 flex flex-col gap-1 flex-1">
                          <p
                            className="text-xs font-bold truncate"
                            style={{ color: "#e8f4fd" }}
                          >
                            {waifu.name}
                          </p>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full font-semibold self-start"
                            style={{
                              background: `${ri.color}33`,
                              color: ri.color,
                              fontSize: "0.65rem",
                            }}
                          >
                            {ri.icon} {ri.label}
                          </span>
                          <button
                            type="button"
                            className="mt-auto text-xs py-1 rounded-lg font-semibold transition-all hover:brightness-110"
                            style={{ background: "#3a1c1c", color: "#e05555" }}
                            data-ocid={`harem.delete_button.${idx + 1}`}
                            onClick={() => {
                              const newIds = localHaremIds.filter(
                                (id) => id !== waifu.id,
                              );
                              setLocalHaremIds(newIds);
                              localStorage.setItem(
                                "sinzhu_harem_global",
                                JSON.stringify(newIds),
                              );
                              toast.success("Waifu sold! 💸");
                            }}
                          >
                            💸 Sell
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
            {mergedMessages.length === 0 && (
              <div
                className="flex-1 flex items-center justify-center"
                data-ocid="chat.messages.empty_state"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{isGroup ? "💬" : "✉️"}</div>
                  <p className="font-semibold" style={{ color: "#8eacbb" }}>
                    {isGroup
                      ? `Say hi to ${groupName}!`
                      : "Start a conversation!"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#4a6278" }}>
                    {isGroup
                      ? "Use /hunt to catch waifus"
                      : "Send a direct message"}
                  </p>
                </div>
              </div>
            )}

            {isGroup
              ? mergedMessages.map((item, i) => {
                  if (item._type === "bot") {
                    const isOwnBotMsg =
                      item.msg.isUserMessage && item.msg.isOwn;
                    return (
                      <BotMessageBubble
                        key={item.msg.id}
                        message={item.msg}
                        isWaifuSpawnCard={!!item.msg.isWaifuSpawnCard}
                        onEdit={
                          isOwnBotMsg
                            ? () => {
                                setEditingBotMsgId(item.msg.id);
                                setEditingBotMsgText(item.msg.content);
                              }
                            : undefined
                        }
                        onDelete={
                          isOwnBotMsg
                            ? () => {
                                setBotMessages((prev) =>
                                  prev.filter((m) => m.id !== item.msg.id),
                                );
                              }
                            : undefined
                        }
                        isEditing={editingBotMsgId === item.msg.id}
                        editText={
                          editingBotMsgId === item.msg.id
                            ? editingBotMsgText
                            : undefined
                        }
                        onEditChange={
                          isOwnBotMsg ? setEditingBotMsgText : undefined
                        }
                        onEditSave={
                          isOwnBotMsg
                            ? () => {
                                setBotMessages((prev) =>
                                  prev.map((m) =>
                                    m.id === editingBotMsgId
                                      ? { ...m, content: editingBotMsgText }
                                      : m,
                                  ),
                                );
                                setEditingBotMsgId(null);
                              }
                            : undefined
                        }
                      />
                    );
                  }
                  const msg = item.msg;
                  const isOwn =
                    myPrincipal &&
                    msg.senderPrincipal.toString() === myPrincipal.toString();
                  if (msg.isWaifuSpawn) {
                    return (
                      <div
                        key={msg.id ?? i}
                        className="flex justify-center my-2"
                      >
                        <div
                          className="px-4 py-2 rounded-xl text-center max-w-xs"
                          style={{
                            background: "#1c3a50",
                            border: "1px solid #5288c1",
                          }}
                        >
                          <p
                            className="text-xs font-bold"
                            style={{ color: "#87CEEB" }}
                          >
                            ✨ A waifu appeared!
                          </p>
                          <p className="text-xs" style={{ color: "#8eacbb" }}>
                            Type /hunt to claim!
                          </p>
                        </div>
                      </div>
                    );
                  }
                  // Check if this message mentions me
                  const mentionsMe = myUsername
                    ? new RegExp(`@${myUsername}\\b`, "i").test(msg.content)
                    : false;
                  const msgId = (msg.id ?? i).toString();
                  if (localDeletedMsgIds.has(msgId)) return null;
                  const editedContent =
                    localEditedMsgs.get(msgId) ?? msg.content;
                  const isEditingThis = editingBotMsgId === msgId;
                  return (
                    <MessageBubble
                      key={msg.id ?? i}
                      content={editedContent}
                      senderName={msg.senderName || "Unknown"}
                      timestamp={msg.timestamp}
                      isOwn={!!isOwn}
                      isGroup
                      mentionsMe={mentionsMe}
                      myUsername={myUsername}
                      onRendered={() => {
                        if (mentionsMe && !isOwn)
                          checkMentionsInMessage(
                            msg.content,
                            msg.senderName || "Unknown",
                          );
                      }}
                      onEdit={
                        isOwn
                          ? () => {
                              setEditingBotMsgId(msgId);
                              setEditingBotMsgText(editedContent);
                            }
                          : undefined
                      }
                      onDelete={
                        isOwn
                          ? () => {
                              setLocalDeletedMsgIds(
                                (prev) => new Set([...prev, msgId]),
                              );
                            }
                          : undefined
                      }
                      isEditing={isEditingThis}
                      editText={isEditingThis ? editingBotMsgText : undefined}
                      onEditChange={isOwn ? setEditingBotMsgText : undefined}
                      onEditSave={
                        isOwn
                          ? () => {
                              setLocalEditedMsgs(
                                (prev) =>
                                  new Map([
                                    ...prev,
                                    [msgId, editingBotMsgText],
                                  ]),
                              );
                              setEditingBotMsgId(null);
                            }
                          : undefined
                      }
                    />
                  );
                })
              : (dmMessages as import("../backend").DMMessage[]).map((msg) => {
                  const isOwn =
                    myPrincipal &&
                    msg.fromUser.toString() === myPrincipal.toString();
                  const dmMsgId =
                    msg.timestamp.toString() + msg.fromUser.toString();
                  if (localDeletedMsgIds.has(dmMsgId)) return null;
                  const dmEditedContent =
                    localEditedMsgs.get(dmMsgId) ?? msg.content;
                  const isDMEditingThis = editingBotMsgId === dmMsgId;
                  return (
                    <MessageBubble
                      key={dmMsgId}
                      content={dmEditedContent}
                      senderName={isOwn ? "You" : (chatTitle ?? "")}
                      timestamp={msg.timestamp}
                      isOwn={!!isOwn}
                      isGroup={false}
                      mentionsMe={false}
                      myUsername={myUsername}
                      onEdit={
                        isOwn
                          ? () => {
                              setEditingBotMsgId(dmMsgId);
                              setEditingBotMsgText(dmEditedContent);
                            }
                          : undefined
                      }
                      onDelete={
                        isOwn
                          ? () => {
                              setLocalDeletedMsgIds(
                                (prev) => new Set([...prev, dmMsgId]),
                              );
                            }
                          : undefined
                      }
                      isEditing={isDMEditingThis}
                      editText={isDMEditingThis ? editingBotMsgText : undefined}
                      onEditChange={isOwn ? setEditingBotMsgText : undefined}
                      onEditSave={
                        isOwn
                          ? () => {
                              setLocalEditedMsgs(
                                (prev) =>
                                  new Map([
                                    ...prev,
                                    [dmMsgId, editingBotMsgText],
                                  ]),
                              );
                              setEditingBotMsgId(null);
                            }
                          : undefined
                      }
                    />
                  );
                })}
            <div ref={bottomRef} />
          </div>

          {/* Command hints chip + popup */}
          {isGroup && identity && (
            <div className="px-3 pb-1 flex-shrink-0 relative">
              <AnimatePresence>
                {showCommands && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full left-3 right-3 mb-2 rounded-xl overflow-hidden z-50"
                    style={{
                      background: "#1c2733",
                      border: "1px solid #2b3d54",
                    }}
                    data-ocid="chat.commands.popover"
                  >
                    <div className="p-3 max-h-64 overflow-y-auto">
                      <p
                        className="text-xs font-bold mb-2"
                        style={{ color: "#5288c1" }}
                      >
                        🎀 All Commands
                      </p>
                      <div className="grid grid-cols-1 gap-0.5">
                        {ALL_COMMANDS.map((c) => (
                          <button
                            key={c.cmd}
                            type="button"
                            className="text-left px-2 py-1.5 rounded-lg hover:brightness-125 transition-all"
                            style={{ background: "transparent" }}
                            onClick={() => {
                              setInput(`${c.cmd.split(" ")[0]} `);
                              setShowCommands(false);
                              inputRef.current?.focus();
                            }}
                          >
                            <span
                              className="text-xs font-mono font-bold"
                              style={{ color: "#87CEEB" }}
                            >
                              {c.cmd}
                            </span>
                            <span
                              className="text-xs ml-2"
                              style={{ color: "#8eacbb" }}
                            >
                              — {c.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => setShowCommands((v) => !v)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:brightness-110"
                style={{
                  background: "#1c2f45",
                  color: "#87CEEB",
                  border: "1px solid #2b5278",
                }}
                data-ocid="chat.commands.toggle"
              >
                🎀 Commands
                <ChevronDown
                  className="w-3 h-3"
                  style={{
                    transform: showCommands ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
            </div>
          )}

          {/* Input bar */}
          <div
            className="flex items-center gap-2 px-3 py-3 flex-shrink-0 relative"
            style={{ background: "#17212b", borderTop: "1px solid #1c2733" }}
          >
            {/* @mention dropdown */}
            <AnimatePresence>
              {mentionDropdown && filteredMentions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full left-3 right-14 mb-2 rounded-xl overflow-hidden z-50"
                  style={{ background: "#1c2733", border: "1px solid #2b5278" }}
                  data-ocid="chat.mention.popover"
                >
                  {filteredMentions.slice(0, 6).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleMentionSelect(u)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:brightness-125"
                      style={{ background: "transparent" }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: stringToColor(u) }}
                      >
                        {u[0]?.toUpperCase()}
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "#5288c1" }}
                      >
                        @{u}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Media button */}
              <button
                type="button"
                onClick={handleMediaClick}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:brightness-125"
                style={{ background: "#1c2733", color: "#8eacbb" }}
                data-ocid="chat.upload_button"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Text input */}
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  isGroup ? PLACEHOLDER_HINTS[placeholderIdx] : "Message..."
                }
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
                style={{
                  background: "#182533",
                  color: "#e8f4fd",
                  border: "1px solid #2b3d54",
                }}
                data-ocid="chat.message.input"
              />

              {/* Mic or Send button */}
              {input.trim() ? (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sendGroupMsg.isPending || sendDMMsg.isPending}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:brightness-110 disabled:opacity-40 flex-shrink-0"
                  style={{ background: "#5288c1" }}
                  data-ocid="chat.send.button"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleMicClick}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    isRecording ? "animate-pulse" : "hover:brightness-125"
                  }`}
                  style={{
                    background: isRecording ? "#c15252" : "#1c2733",
                    color: isRecording ? "#ffffff" : "#8eacbb",
                  }}
                  data-ocid="chat.toggle"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </>
          </div>
        </>
      )}

      {/* Group Info Panel */}
      {isGroup && groupName && (
        <GroupInfoPanel
          groupName={groupName}
          open={showInfo}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  );
}

function VoiceMessagePlayer({ src }: { src?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-2 py-1 min-w-[180px]">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (a) {
            setCurrentTime(a.currentTime);
            setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => setPlaying(false)}
      >
        <track kind="captions" />
      </audio>
      <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "#5288c1" }}
      >
        <span className="text-white text-xs">{playing ? "⏸" : "▶"}</span>
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div
          className="w-full h-1.5 rounded-full cursor-pointer"
          style={{ background: "#1e3a4a" }}
          onClick={(e) => {
            e.stopPropagation();
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            if (audioRef.current)
              audioRef.current.currentTime =
                pct * (audioRef.current.duration || 0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" && audioRef.current)
              audioRef.current.currentTime = Math.min(
                audioRef.current.duration || 0,
                audioRef.current.currentTime + 5,
              );
            if (e.key === "ArrowLeft" && audioRef.current)
              audioRef.current.currentTime = Math.max(
                0,
                audioRef.current.currentTime - 5,
              );
          }}
          role="slider"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, background: "#87CEEB" }}
          />
        </div>
        <span className="text-xs" style={{ color: "#87CEEB" }}>
          {fmt(currentTime)} / {fmt(duration)}
        </span>
      </div>
    </div>
  );
}

function BotMessageBubble({
  message,
  isWaifuSpawnCard,
  onEdit,
  onDelete,
  isEditing,
  editText,
  onEditChange,
  onEditSave,
}: {
  message: BotMessage;
  isWaifuSpawnCard: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
  editText?: string;
  onEditChange?: (v: string) => void;
  onEditSave?: () => void;
}) {
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tapped, setTapped] = useState(false);

  const handleTap = (isOwn: boolean, isVoiceOrMedia: boolean) => {
    if (!isOwn) return;
    tapCountRef.current += 1;
    setTapped(true);
    setTimeout(() => setTapped(false), 200);
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      const count = tapCountRef.current;
      tapCountRef.current = 0;
      if (count >= 3 && onDelete) onDelete();
      else if (count === 2 && !isVoiceOrMedia && onEdit) onEdit();
    }, 350);
  };

  // Render user-sent messages (text, media, voice) as proper chat bubbles
  if (message.isUserMessage) {
    const isOwn = message.isOwn;
    const isVoiceOrMedia = message.mediaType === "voice" || !!message.mediaUrl;
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
        <div
          className="max-w-xs md:max-w-sm lg:max-w-md px-3 py-2 rounded-xl transition-all duration-150"
          style={{
            background:
              tapped && isOwn ? "#3a6a9a" : isOwn ? "#2b5278" : "#182533",
            borderRadius: isOwn ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
            cursor: isOwn ? "pointer" : "default",
            userSelect: "none",
          }}
          data-ocid="chat.message.item"
          onClick={() => handleTap(!!isOwn, isVoiceOrMedia)}
          onKeyDown={(e) =>
            e.key === "Enter" && handleTap(!!isOwn, isVoiceOrMedia)
          }
        >
          {!isOwn && message.senderName && (
            <p
              className="text-xs font-bold mb-0.5"
              style={{ color: "#5288c1" }}
            >
              {message.senderName}
            </p>
          )}
          {message.mediaType === "image" && message.mediaUrl && (
            <img
              src={message.mediaUrl}
              alt="media"
              className="rounded-lg max-w-full max-h-48 object-cover mb-1"
            />
          )}
          {message.mediaType === "video" && message.mediaUrl && (
            <video
              src={message.mediaUrl}
              controls
              className="rounded-lg max-w-full max-h-48 mb-1"
            >
              <track kind="captions" />
            </video>
          )}
          {message.mediaType === "voice" ? (
            <VoiceMessagePlayer key={message.id} src={message.mediaUrl} />
          ) : isEditing ? (
            <input
              className="text-sm w-full rounded px-2 py-1 outline-none"
              style={{
                background: "#0e1f30",
                color: "#e8f4fd",
                border: "1px solid #5288c1",
              }}
              value={editText ?? ""}
              onChange={(e) => onEditChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onEditSave?.();
                }
                if (e.key === "Escape") {
                  onEditChange?.(message.content);
                  onEditSave?.();
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            message.content && (
              <p className="text-sm break-words" style={{ color: "#e8f4fd" }}>
                {message.content}
              </p>
            )
          )}
          {isOwn && !isEditing && (
            <p
              className="text-right text-xs mt-0.5 opacity-50"
              style={{ color: "#87CEEB", fontSize: "9px" }}
            >
              2x edit · 3x delete
            </p>
          )}
          <p
            className="text-right text-xs mt-0.5"
            style={{ color: isOwn ? "#87CEEB" : "#4a6278" }}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-1">
      <div className="flex items-start gap-2 max-w-xs md:max-w-sm lg:max-w-md">
        <div className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5 overflow-hidden">
          <img
            src="https://files.catbox.moe/lasj0e.jpg"
            alt="bot"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-bold mb-0.5" style={{ color: "#5288c1" }}>
            🍀 sɪɴᴢʜᴜ ᴡᴀɪғᴜ ʙᴏᴛ 🍭
          </p>
          <div
            className="px-3 py-2 rounded-xl"
            style={{
              background: "#1a3a50",
              borderRadius: "2px 12px 12px 12px",
              border: "1px solid #2b5278",
            }}
            data-ocid="chat.message.item"
          >
            {isWaifuSpawnCard && message.waifuCard && (
              <div
                className="mb-2 rounded-lg overflow-hidden flex items-center gap-2 p-2"
                style={{ background: "#0e1f30" }}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={message.waifuCard.imageUrl}
                    alt="waifu"
                    className="w-14 h-20 rounded object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: "#87CEEB" }}>
                    🌸 Waifu Appeared!
                  </p>
                  <p className="text-xs" style={{ color: "#8eacbb" }}>
                    {RARITY_CONFIG[message.waifuCard.rarity]?.icon ?? "🟢"}{" "}
                    {RARITY_CONFIG[message.waifuCard.rarity]?.label ??
                      message.waifuCard.rarity}
                  </p>
                  <p
                    className="text-xs mt-1 font-bold"
                    style={{ color: "#5288c1" }}
                  >
                    /hunt &lt;name&gt; to claim!
                  </p>
                </div>
              </div>
            )}
            <p
              className="text-sm break-words whitespace-pre-wrap"
              style={{ color: "#e8f4fd" }}
            >
              {message.content}
            </p>
            <p
              className="text-right text-xs mt-0.5"
              style={{ color: "#4a6278" }}
            >
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  content,
  senderName,
  timestamp,
  isOwn,
  isGroup,
  mentionsMe,
  myUsername,
  onRendered,
  onEdit,
  onDelete,
  isEditing,
  editText,
  onEditChange,
  onEditSave,
}: {
  content: string;
  senderName: string;
  timestamp: bigint;
  isOwn: boolean;
  isGroup: boolean;
  mentionsMe: boolean;
  myUsername: string;
  onRendered?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
  editText?: string;
  onEditChange?: (v: string) => void;
  onEditSave?: () => void;
}) {
  const renderedRef = useRef(false);
  useEffect(() => {
    if (!renderedRef.current && onRendered) {
      renderedRef.current = true;
      onRendered();
    }
  }, [onRendered]);

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tapped, setTapped] = useState(false);

  const handleTap = () => {
    if (!isOwn) return;
    tapCountRef.current += 1;
    setTapped(true);
    setTimeout(() => setTapped(false), 200);
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      const count = tapCountRef.current;
      tapCountRef.current = 0;
      if (count >= 3 && onDelete) onDelete();
      else if (count === 2 && onEdit) onEdit();
    }, 350);
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className="max-w-xs md:max-w-sm lg:max-w-md px-3 py-2 rounded-xl transition-all duration-150"
        style={{
          background:
            tapped && isOwn
              ? "#3a6a9a"
              : mentionsMe
                ? "#2b3a1a"
                : isOwn
                  ? "#2b5278"
                  : "#182533",
          borderRadius: isOwn ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          border: mentionsMe ? "1px solid #ffd700" : "none",
          cursor: isOwn ? "pointer" : "default",
          userSelect: "none",
        }}
        data-ocid="chat.message.item"
        onClick={handleTap}
        onKeyDown={(e) => e.key === "Enter" && handleTap()}
      >
        {isGroup && !isOwn && (
          <p
            className="text-xs font-bold mb-0.5"
            style={{ color: senderNameColor(senderName) }}
          >
            {senderName}
          </p>
        )}
        {isEditing ? (
          <input
            className="text-sm w-full rounded px-2 py-1 outline-none"
            style={{
              background: "#0e1f30",
              color: "#e8f4fd",
              border: "1px solid #5288c1",
            }}
            value={editText ?? ""}
            onChange={(e) => onEditChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onEditSave?.();
              }
              if (e.key === "Escape") {
                onEditChange?.(content);
                onEditSave?.();
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p className="text-sm break-words" style={{ color: "#e8f4fd" }}>
            {renderMessageWithMentions(content, myUsername)}
          </p>
        )}
        {isOwn && !isEditing && (
          <p
            className="text-right opacity-40"
            style={{ color: "#87CEEB", fontSize: "9px" }}
          >
            2x edit · 3x delete
          </p>
        )}
        <p
          className="text-right text-xs mt-0.5"
          style={{ color: isOwn ? "#87CEEB" : "#4a6278" }}
        >
          {formatTime(timestamp)}
        </p>
      </div>
    </div>
  );
}

function senderNameColor(name: string): string {
  const colors = [
    "#5288c1",
    "#3b9e5a",
    "#c17a28",
    "#8c52c1",
    "#c15252",
    "#52c1b8",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#2b5278", "#3a7858", "#7b4a8c", "#8c5a3a", "#3a5a8c"];
  return colors[Math.abs(hash) % colors.length];
}
