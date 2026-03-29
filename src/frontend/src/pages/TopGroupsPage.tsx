import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface TopGroupsPageProps {
  onNavigate: (page: string) => void;
}

const MOCK_GROUPS = [
  { name: "Anime Legends", total: 12400 },
  { name: "Waifu Warriors", total: 9800 },
  { name: "Sakura Alliance", total: 7650 },
  { name: "Dragon Collectors", total: 6200 },
  { name: "Elite Hunters", total: 5100 },
  { name: "Celestial Guild", total: 4300 },
  { name: "Shadow Realm", total: 3700 },
  { name: "Frost Order", total: 2900 },
  { name: "Blaze Squad", total: 1800 },
  { name: "Silver Wings", total: 950 },
];

const GROUP_COLORS = [
  "#FFD700",
  "#C0C0C0",
  "#CD7F32",
  "#5288c1",
  "#5288c1",
  "#5288c1",
  "#5288c1",
  "#5288c1",
  "#5288c1",
  "#5288c1",
];

export default function TopGroupsPage({ onNavigate }: TopGroupsPageProps) {
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
          data-ocid="topgroups.back.button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#e8f4fd" }}>
          🌐 Top Groups
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {MOCK_GROUPS.map((group, i) => {
          const medals = ["🥇", "🥈", "🥉"];
          const isTop3 = i < 3;
          return (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "#1c2733" }}
              data-ocid={`topgroups.group.item.${i + 1}`}
            >
              <span
                className="text-xl w-8 text-center"
                style={{ color: GROUP_COLORS[i] }}
              >
                {isTop3 ? medals[i] : `${i + 1}.`}
              </span>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "#e8f4fd" }}>
                  {group.name}
                </p>
                <p className="text-xs" style={{ color: "#8eacbb" }}>
                  Group
                </p>
              </div>
              <span className="font-bold text-sm" style={{ color: "#5288c1" }}>
                {group.total.toLocaleString()} 💝
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
