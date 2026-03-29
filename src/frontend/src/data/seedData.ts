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
    rarity: "epic",
  },
  {
    id: "waifu-003",
    name: "Akuma Rei",
    series: "Shadow Abyss",
    imageUrl: "/assets/generated/waifu-akuma.dim_400x560.jpg",
    rarity: "epic",
  },
  {
    id: "waifu-004",
    name: "Hikari Angel",
    series: "Divine Heaven",
    imageUrl: "/assets/generated/waifu-hikari.dim_400x560.jpg",
    rarity: "legendary",
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
    rarity: "rare",
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
    name: "Epic Summon Ticket",
    description: "Guaranteed Epic rarity waifu. One-time use.",
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
  { label: string; color: string; stars: number; className: string }
> = {
  legendary: {
    label: "Legendary",
    color: "#F6C453",
    stars: 5,
    className: "rarity-legendary",
  },
  epic: { label: "Epic", color: "#A78BFA", stars: 4, className: "rarity-epic" },
  rare: { label: "Rare", color: "#37D6FF", stars: 3, className: "rarity-rare" },
  common: {
    label: "Common",
    color: "#A8A3C2",
    stars: 2,
    className: "rarity-common",
  },
};

export const ITEM_TYPE_ICONS: Record<string, string> = {
  pass: "🎫",
  ticket: "🎟️",
  boost: "⚡",
  upgrade: "🔮",
  cosmetic: "✨",
};
