import type { ShopItem, WaifuCharacter } from "../backend";

export const SEED_WAIFUS: WaifuCharacter[] = [
  {
    id: "waifu-001",
    name: "Sakura Miyamoto",
    series: "Blossom Chronicles",
    imageUrl: "/assets/generated/waifu-sakura.dim_400x560.jpg",
    rarity: "legendary",
  },
  {
    id: "waifu-002",
    name: "Yuki Tsukino",
    series: "Frost Realm",
    imageUrl: "/assets/generated/waifu-yuki.dim_400x560.jpg",
    rarity: "celestial",
  },
  {
    id: "waifu-003",
    name: "Akuma Rei",
    series: "Shadow Abyss",
    imageUrl: "/assets/generated/waifu-akuma.dim_400x560.jpg",
    rarity: "exclusive",
  },
  {
    id: "waifu-004",
    name: "Hikari Angel",
    series: "Divine Heaven",
    imageUrl: "/assets/generated/waifu-hikari.dim_400x560.jpg",
    rarity: "premium",
  },
  {
    id: "waifu-005",
    name: "Cyber Nova",
    series: "NeoTokyo 2099",
    imageUrl: "/assets/generated/waifu-cyber.dim_400x560.jpg",
    rarity: "rare",
  },
  {
    id: "waifu-006",
    name: "Hana Dragonfyre",
    series: "Dragon Ascent",
    imageUrl: "/assets/generated/waifu-hana.dim_400x560.jpg",
    rarity: "medium",
  },
  {
    id: "waifu-007",
    name: "Luna Starweave",
    series: "Celestial Bonds",
    imageUrl: "/assets/generated/waifu-sakura.dim_400x560.jpg",
    rarity: "common",
  },
  {
    id: "waifu-008",
    name: "Seraphine",
    series: "Echoes of Eternity",
    imageUrl: "/assets/generated/waifu-hikari.dim_400x560.jpg",
    rarity: "special",
  },
];

export const SEED_SHOP_ITEMS: ShopItem[] = [
  {
    id: "shop-001",
    name: "Waifu Pass — 30 Days",
    description: "Unlock daily spawns and exclusive hunts for 30 days.",
    itemType: "pass",
    price: 500n,
  },
  {
    id: "shop-002",
    name: "Legendary Summon Ticket",
    description: "Guaranteed Legendary waifu summon. One-time use.",
    itemType: "ticket",
    price: 1200n,
  },
  {
    id: "shop-003",
    name: "Premium Summon Ticket",
    description: "Guaranteed Premium rarity waifu. One-time use.",
    itemType: "ticket",
    price: 600n,
  },
  {
    id: "shop-004",
    name: "Onex Boost x2",
    description: "Double all Onex earnings for 7 days.",
    itemType: "boost",
    price: 300n,
  },
  {
    id: "shop-005",
    name: "Harem Expander",
    description: "Expand your harem capacity by 20 slots.",
    itemType: "upgrade",
    price: 400n,
  },
  {
    id: "shop-006",
    name: "Name Change Token",
    description: "Change your username once. Cosmetic only.",
    itemType: "cosmetic",
    price: 150n,
  },
];

export const RARITY_CONFIG: Record<
  string,
  {
    label: string;
    icon: string;
    color: string;
    stars: number;
    className: string;
  }
> = {
  god: {
    label: "God Summon",
    icon: "🌟",
    color: "#FFD700",
    stars: 11,
    className: "rarity-god",
  },
  shop: {
    label: "Only Shop",
    icon: "🎀",
    color: "#FF69B4",
    stars: 10,
    className: "rarity-shop",
  },
  limited: {
    label: "Limited",
    icon: "🔮",
    color: "#9B59B6",
    stars: 9,
    className: "rarity-limited",
  },
  premium: {
    label: "Premium",
    icon: "💎",
    color: "#00CED1",
    stars: 8,
    className: "rarity-premium",
  },
  special: {
    label: "Special",
    icon: "🎐",
    color: "#FF8C00",
    stars: 7,
    className: "rarity-special",
  },
  exclusive: {
    label: "Exclusive",
    icon: "💮",
    color: "#FF1493",
    stars: 6,
    className: "rarity-exclusive",
  },
  celestial: {
    label: "Celestial",
    icon: "🪽",
    color: "#7DF9FF",
    stars: 5,
    className: "rarity-celestial",
  },
  legendary: {
    label: "Legendary",
    icon: "🟡",
    color: "#F6C453",
    stars: 4,
    className: "rarity-legendary",
  },
  rare: {
    label: "Rare",
    icon: "🟠",
    color: "#FFA500",
    stars: 3,
    className: "rarity-rare",
  },
  medium: {
    label: "Medium",
    icon: "🔵",
    color: "#37D6FF",
    stars: 2,
    className: "rarity-medium",
  },
  common: {
    label: "Common",
    icon: "🟢",
    color: "#A8A3C2",
    stars: 1,
    className: "rarity-common",
  },
  // Legacy
  epic: {
    label: "Epic",
    icon: "💜",
    color: "#A78BFA",
    stars: 6,
    className: "rarity-epic",
  },
};

export const RARITY_SELL_PRICES: Record<string, number> = {
  god: 5000,
  shop: 2000,
  limited: 1000,
  premium: 500,
  special: 300,
  exclusive: 200,
  celestial: 150,
  legendary: 100,
  rare: 50,
  medium: 20,
  common: 10,
  epic: 200,
};

export const ITEM_TYPE_ICONS: Record<string, string> = {
  pass: "🎫",
  ticket: "🎟️",
  boost: "⚡",
  upgrade: "🔮",
  cosmetic: "✨",
};

export const RANK_TIERS = [
  { name: "Bronze", minCount: 0, icon: "🦂", color: "#CD7F32" },
  { name: "Bronze II", minCount: 20, icon: "🦂", color: "#CD7F32" },
  { name: "Bronze III", minCount: 50, icon: "🦂", color: "#CD7F32" },
  { name: "Silver", minCount: 100, icon: "🐼", color: "#C0C0C0" },
  { name: "Silver II", minCount: 160, icon: "🐼", color: "#C0C0C0" },
  { name: "Silver III", minCount: 230, icon: "🐼", color: "#C0C0C0" },
  { name: "Gold", minCount: 330, icon: "🐞", color: "#FFD700" },
  { name: "Gold II", minCount: 450, icon: "🐞", color: "#FFD700" },
  { name: "Gold III", minCount: 560, icon: "🐞", color: "#FFD700" },
  { name: "Platinum", minCount: 650, icon: "🦀", color: "#E5E4E2" },
  { name: "Platinum II", minCount: 780, icon: "🦀", color: "#E5E4E2" },
  { name: "Platinum III", minCount: 920, icon: "🦀", color: "#E5E4E2" },
  { name: "Diamond", minCount: 1000, icon: "🪼", color: "#B9F2FF" },
  { name: "Diamond II", minCount: 1300, icon: "🪼", color: "#B9F2FF" },
  { name: "Diamond III", minCount: 1600, icon: "🪼", color: "#B9F2FF" },
  { name: "Diamond IIII", minCount: 1900, icon: "🪼", color: "#B9F2FF" },
  { name: "Elite Diamond", minCount: 2000, icon: "🪼", color: "#7DF9FF" },
  { name: "Heroic", minCount: 2300, icon: "🐦‍🔥", color: "#FF4500" },
  { name: "Heroic II", minCount: 2600, icon: "🐦‍🔥", color: "#FF4500" },
  { name: "Heroic III", minCount: 2900, icon: "🐦‍🔥", color: "#FF4500" },
  { name: "Heroic IIII", minCount: 3300, icon: "🐦‍🔥", color: "#FF4500" },
  { name: "Elite Heroic", minCount: 3900, icon: "🐦‍🔥", color: "#FF6B35" },
  { name: "Master", minCount: 4300, icon: "🐲", color: "#9B59B6" },
  { name: "Master II", minCount: 4600, icon: "🐲", color: "#9B59B6" },
  { name: "Master III", minCount: 4900, icon: "🐲", color: "#9B59B6" },
  { name: "Elite Master", minCount: 5300, icon: "🐲", color: "#8E44AD" },
  { name: "Grand Master", minCount: 6000, icon: "🐲", color: "#6C3483" },
];

export function getRankForCount(count: number) {
  let current = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (count >= tier.minCount) current = tier;
    else break;
  }
  return current;
}
