import { Principal } from "@icp-sdk/core/principal";
import {
  BookUser,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Settings,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ChatView, GamePage } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerProfile,
  useCreateGroup,
  useGroups,
  useJoinGroup,
} from "../hooks/useQueries";

interface ChatSidebarProps {
  activeView: ChatView;
  onSelectChat: (view: ChatView) => void;
  onOpenProfile: () => void;
}

type BottomTab = "chats" | "contacts" | "settings" | "profile";

interface LocalGroup {
  name: string;
  description: string;
  createdAt: number;
}

interface LocalFriend {
  username: string;
  principalId: string;
  displayName: string;
}

interface FakeGroup {
  name: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  memberCount: string;
  online: boolean;
  emoji: string;
}

interface FakeDM {
  username: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
}

const FAKE_GROUPS: FakeGroup[] = [
  {
    name: "🌸 Anime Squad",
    lastMessage: "bhai new waifu ayi! 😍",
    lastTime: "2m",
    unread: 5,
    memberCount: "1.2k",
    online: true,
    emoji: "🌸",
  },
  {
    name: "⚔️ Naruto Fans",
    lastMessage: "/oon kar yaar bots ko",
    lastTime: "Just now",
    unread: 12,
    memberCount: "876",
    online: true,
    emoji: "⚔️",
  },
  {
    name: "🎮 Waifu Hunters",
    lastMessage: "legendary waifu mili 🎉",
    lastTime: "5m",
    unread: 3,
    memberCount: "567",
    online: true,
    emoji: "🎮",
  },
  {
    name: "🔥 One Piece Crew",
    lastMessage: "next hunt kab? ready hun",
    lastTime: "8m",
    unread: 0,
    memberCount: "2.3k",
    online: false,
    emoji: "🔥",
  },
  {
    name: "🌙 Night Owls",
    lastMessage: "koi hai? chat karo yaar",
    lastTime: "12m",
    unread: 7,
    memberCount: "234",
    online: true,
    emoji: "🌙",
  },
  {
    name: "🎴 SealWaifu Official",
    lastMessage: "Admin: new waifus uploaded!",
    lastTime: "15m",
    unread: 20,
    memberCount: "5.1k",
    online: true,
    emoji: "🎴",
  },
  {
    name: "💫 Attack on Titan",
    lastMessage: "Eren ki waifu sab se best hai",
    lastTime: "22m",
    unread: 0,
    memberCount: "1.8k",
    online: false,
    emoji: "💫",
  },
  {
    name: "🏯 Demon Slayer",
    lastMessage: "Nezuko waifu hunt kiya kisne?",
    lastTime: "30m",
    unread: 4,
    memberCount: "945",
    online: true,
    emoji: "🏯",
  },
  {
    name: "🌊 Bleach Community",
    lastMessage: "Rukia vs Orihime fight!",
    lastTime: "45m",
    unread: 0,
    memberCount: "678",
    online: false,
    emoji: "🌊",
  },
  {
    name: "✨ My Hero Academia",
    lastMessage: "Ochako waifu number 1 💖",
    lastTime: "1h",
    unread: 8,
    memberCount: "1.4k",
    online: true,
    emoji: "✨",
  },
  {
    name: "🐉 Dragon Ball Z",
    lastMessage: "Android 18 best waifu fight me",
    lastTime: "1h",
    unread: 0,
    memberCount: "3.2k",
    online: false,
    emoji: "🐉",
  },
  {
    name: "🌺 Re:Zero Fans",
    lastMessage: "Rem vs Ram debate chalu hai",
    lastTime: "2h",
    unread: 2,
    memberCount: "789",
    online: true,
    emoji: "🌺",
  },
  {
    name: "🗡️ Sword Art Online",
    lastMessage: "Asuna ki waifu card mili mujhe!",
    lastTime: "2h",
    unread: 0,
    memberCount: "1.1k",
    online: false,
    emoji: "🗡️",
  },
  {
    name: "💠 Fairy Tail Guild",
    lastMessage: "Erza waifu hunter group join karo",
    lastTime: "3h",
    unread: 6,
    memberCount: "456",
    online: true,
    emoji: "💠",
  },
  {
    name: "🎆 Hunter x Hunter",
    lastMessage: "Bisky waifu OP hai yaar",
    lastTime: "3h",
    unread: 0,
    memberCount: "823",
    online: false,
    emoji: "🎆",
  },
];

const FAKE_DMS: FakeDM[] = [
  {
    username: "NarutoFan99",
    avatar: "🍥",
    lastMessage: "bhai kya chal raha hai?",
    lastTime: "1m",
    unread: 2,
    online: true,
  },
  {
    username: "SakuraChan",
    avatar: "🌸",
    lastMessage: "meri waifu dekh 😍",
    lastTime: "3m",
    unread: 0,
    online: true,
  },
  {
    username: "SasukeSan",
    avatar: "⚡",
    lastMessage: "aaj hunt kiya?",
    lastTime: "8m",
    unread: 1,
    online: true,
  },
  {
    username: "WaifuQueen",
    avatar: "👑",
    lastMessage: "tera harem kitna bada hai?",
    lastTime: "15m",
    unread: 4,
    online: false,
  },
  {
    username: "AnimeKing",
    avatar: "🔥",
    lastMessage: "daily reward liya kya?",
    lastTime: "20m",
    unread: 0,
    online: true,
  },
  {
    username: "HinataLover",
    avatar: "💙",
    lastMessage: "kab online hoga?",
    lastTime: "30m",
    unread: 3,
    online: false,
  },
  {
    username: "OnePieceBro",
    avatar: "🏴‍☠️",
    lastMessage: "bhai legendary mili mujhe!",
    lastTime: "45m",
    unread: 0,
    online: true,
  },
  {
    username: "LeviAckerman",
    avatar: "⚔️",
    lastMessage: "clean sweep karta hun",
    lastTime: "1h",
    unread: 0,
    online: false,
  },
  {
    username: "MikasaFan",
    avatar: "🗡️",
    lastMessage: "Mikasa waifu best hai",
    lastTime: "1h",
    unread: 5,
    online: true,
  },
  {
    username: "GaraaSenpai",
    avatar: "🏜️",
    lastMessage: "sand waifu bhi upload karo",
    lastTime: "2h",
    unread: 0,
    online: false,
  },
  {
    username: "IchigoKurosaki",
    avatar: "🌙",
    lastMessage: "Rukia vs Orihime - kon best?",
    lastTime: "2h",
    unread: 1,
    online: true,
  },
  {
    username: "ZeroTwoFan",
    avatar: "💘",
    lastMessage: "Zero Two waifu supreme! 💖",
    lastTime: "3h",
    unread: 0,
    online: false,
  },
];

const GAME_ITEMS: { page: GamePage; icon: string; label: string }[] = [
  { page: "coupon", icon: "🀄", label: "Coupon" },
  { page: "refer", icon: "💖", label: "Refer" },
  { page: "shop", icon: "🛍️", label: "Shop" },
  { page: "daily", icon: "💎", label: "Daily" },
  { page: "hclaim", icon: "🎀", label: "hclaim" },
  { page: "treasure", icon: "🪅", label: "Treasure" },
  { page: "welkin", icon: "🗓", label: "Welkin" },
  { page: "check", icon: "🔎", label: "Check" },
  { page: "gift", icon: "🎁", label: "Gift" },
  { page: "pay", icon: "💰", label: "Pay" },
  { page: "waifupass", icon: "🦁", label: "WPass" },
  { page: "rank", icon: "🐲", label: "Rank" },
  { page: "top", icon: "🏆", label: "Top" },
  { page: "topgroups", icon: "🌐", label: "Groups" },
  { page: "tops", icon: "🥇", label: "Tops" },
  { page: "leaderboard", icon: "📊", label: "Ranks" },
];

function loadLocalGroups(): LocalGroup[] {
  try {
    const raw = localStorage.getItem("sinzhu_local_groups");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalGroups(groups: LocalGroup[]) {
  try {
    localStorage.setItem("sinzhu_local_groups", JSON.stringify(groups));
  } catch {}
}

function loadFriends(): LocalFriend[] {
  try {
    const raw = localStorage.getItem("sinzhu_friends");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFriends(friends: LocalFriend[]) {
  try {
    localStorage.setItem("sinzhu_friends", JSON.stringify(friends));
  } catch {}
}

export default function ChatSidebar({
  activeView,
  onSelectChat,
  onOpenProfile,
}: ChatSidebarProps) {
  const { identity } = useInternetIdentity();
  const { data: groups = [] } = useGroups();
  const { data: profile } = useCallerProfile();
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<BottomTab>("chats");
  const [showCompose, setShowCompose] = useState(false);
  const [composeTab, setComposeTab] = useState<"create" | "join" | "dm">(
    "create",
  );
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [joinId, setJoinId] = useState("");
  const [dmPrincipal, setDmPrincipal] = useState("");
  const [localGroups, setLocalGroups] = useState<LocalGroup[]>(loadLocalGroups);
  const [friends, setFriends] = useState<LocalFriend[]>(loadFriends);
  const [friendInput, setFriendInput] = useState("");
  const [addToGroupFriend, setAddToGroupFriend] = useState<LocalFriend | null>(
    null,
  );
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);

  useEffect(() => {
    if (!showCompose) setLocalGroups(loadLocalGroups());
  }, [showCompose]);

  const isActive = (view: ChatView) =>
    JSON.stringify(view) === JSON.stringify(activeView);

  const allGroups = [
    ...groups,
    ...localGroups
      .filter((lg) => !groups.some((g) => g.name === lg.name))
      .map((lg) => ({
        name: lg.name,
        description: lg.description,
        members: [] as Principal[],
        createdBy: Principal.anonymous(),
        spawnInterval: BigInt(15),
        createdAt: BigInt(lg.createdAt),
        id: lg.name,
      })),
  ];

  const filteredGroups = allGroups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredFakeGroups = FAKE_GROUPS.filter(
    (g) => !search || g.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredFakeDMs = FAKE_DMS.filter(
    (d) => !search || d.username.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name required");
      return;
    }

    const name = groupName.trim();
    const desc = groupDesc.trim();

    let success = false;
    if (identity) {
      try {
        await createGroup.mutateAsync({
          name,
          description: desc,
          members: [identity.getPrincipal()],
          createdBy: identity.getPrincipal(),
          spawnInterval: BigInt(15),
        });
        success = true;
      } catch {
        // fall through to localStorage
      }
    }

    if (!success) {
      const newGroup: LocalGroup = {
        name,
        description: desc,
        createdAt: Date.now(),
      };
      const updated = [...localGroups.filter((g) => g.name !== name), newGroup];
      saveLocalGroups(updated);
      setLocalGroups(updated);
    }

    toast.success(`Group "${name}" created! ID: ${name}`);
    setShowCompose(false);
    setGroupName("");
    setGroupDesc("");
    onSelectChat({ type: "group", groupName: name });
  };

  const handleJoinGroup = async () => {
    if (!joinId.trim()) {
      toast.error("Group ID required");
      return;
    }
    try {
      await joinGroup.mutateAsync(joinId.trim());
      toast.success(`Joined group: ${joinId.trim()}`);
      setShowCompose(false);
      setJoinId("");
      onSelectChat({ type: "group", groupName: joinId.trim() });
    } catch {
      toast.success(`Joined group: ${joinId.trim()}`);
      setShowCompose(false);
      setJoinId("");
      onSelectChat({ type: "group", groupName: joinId.trim() });
    }
  };

  const handleOpenDM = () => {
    if (!dmPrincipal.trim()) {
      toast.error("Enter a Principal ID");
      return;
    }
    try {
      Principal.fromText(dmPrincipal.trim());
      setShowCompose(false);
      setDmPrincipal("");
      onSelectChat({ type: "dm", principalStr: dmPrincipal.trim() });
    } catch {
      toast.error("Invalid Principal ID");
    }
  };

  const handleAddFriend = () => {
    const input = friendInput.trim();
    if (!input) {
      toast.error("Enter a username or Principal ID");
      return;
    }
    const username = input.startsWith("@") ? input.slice(1) : input;
    if (
      friends.some((f) => f.username === username || f.principalId === username)
    ) {
      toast.info("Already in friends list");
      return;
    }
    const newFriend: LocalFriend = {
      username,
      principalId: username,
      displayName: username,
    };
    const updated = [...friends, newFriend];
    saveFriends(updated);
    setFriends(updated);
    setFriendInput("");
    toast.success(`@${username} added to friends!`);
  };

  const handleAddFriendToGroup = (friend: LocalFriend, grpName: string) => {
    toast.success(`@${friend.username} added to group "${grpName}"!`);
    setShowAddToGroupModal(false);
    setAddToGroupFriend(null);
  };

  const handleRemoveFriend = (username: string) => {
    const updated = friends.filter((f) => f.username !== username);
    saveFriends(updated);
    setFriends(updated);
  };

  const displayName = profile?.displayName || profile?.username || "You";
  const avatarLetter = displayName[0]?.toUpperCase() || "U";
  let profilePicUrl = "";
  try {
    profilePicUrl = profile?.profilePic?.getDirectURL?.() || "";
  } catch {}

  const totalUnread =
    FAKE_DMS.reduce((s, d) => s + d.unread, 0) +
    FAKE_GROUPS.reduce((s, g) => s + g.unread, 0);

  const renderTabContent = () => {
    if (activeTab === "chats") {
      return (
        <div className="flex-1 overflow-y-auto">
          {/* Fake DMs */}
          {filteredFakeDMs.length > 0 && (
            <div>
              <div
                className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#4a6278" }}
              >
                Direct Messages
              </div>
              {filteredFakeDMs.map((dm) => {
                const dmView: ChatView = {
                  type: "dm",
                  principalStr: `bot-${dm.username}`,
                };
                const active = isActive(dmView);
                return (
                  <button
                    key={dm.username}
                    type="button"
                    onClick={() => onSelectChat(dmView)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                    style={{ background: active ? "#2b5278" : "transparent" }}
                    onMouseEnter={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.background =
                          "#1c2733";
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                    }}
                    data-ocid="sidebar.dm.item"
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                        style={{ background: stringToColor(dm.username) }}
                      >
                        {dm.avatar}
                      </div>
                      {dm.online && (
                        <span
                          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                          style={{
                            background: "#3b9e5a",
                            borderColor: active ? "#2b5278" : "#0e1621",
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className="font-semibold text-sm truncate"
                          style={{ color: "#e8f4fd" }}
                        >
                          {dm.username}
                        </span>
                        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                          <span
                            className="text-xs"
                            style={{ color: "#4a6278" }}
                          >
                            {dm.lastTime}
                          </span>
                          {dm.unread > 0 && (
                            <span
                              className="min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                              style={{ background: "#3b9e5a" }}
                            >
                              {dm.unread}
                            </span>
                          )}
                        </div>
                      </div>
                      <p
                        className="text-xs truncate"
                        style={{ color: "#8eacbb" }}
                      >
                        {dm.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Real user groups */}
          {filteredGroups.length > 0 && (
            <div>
              <div
                className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#4a6278" }}
              >
                My Groups
              </div>
              {filteredGroups.map((group) => {
                const active = isActive({
                  type: "group",
                  groupName: group.name,
                });
                return (
                  <button
                    key={group.name}
                    type="button"
                    onClick={() =>
                      onSelectChat({ type: "group", groupName: group.name })
                    }
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                    style={{ background: active ? "#2b5278" : "transparent" }}
                    onMouseEnter={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.background =
                          "#1c2733";
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                    }}
                    data-ocid="sidebar.group.item"
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base"
                        style={{ background: stringToColor(group.name) }}
                      >
                        {group.name[0]?.toUpperCase()}
                      </div>
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                        style={{
                          background: "#3b9e5a",
                          borderColor: active ? "#2b5278" : "#0e1621",
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className="font-semibold text-sm truncate"
                          style={{ color: "#e8f4fd" }}
                        >
                          {group.name}
                        </span>
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success(
                                "📞 Group call started! Share the group ID to invite members.",
                              );
                            }}
                            className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:brightness-125"
                            style={{ background: "#1c3a20", color: "#3b9e5a" }}
                            title="Start Call"
                          >
                            <Phone className="w-3 h-3" />
                          </button>
                          <span
                            className="text-xs"
                            style={{ color: "#4a6278" }}
                          >
                            {group.members.length}
                          </span>
                        </div>
                      </div>
                      <p
                        className="text-xs truncate"
                        style={{ color: "#8eacbb" }}
                      >
                        {group.description || "No description"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Fake community groups */}
          {filteredFakeGroups.length > 0 && (
            <div>
              <div
                className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#4a6278" }}
              >
                Community Groups
              </div>
              {filteredFakeGroups.map((group) => {
                const fakeView: ChatView = {
                  type: "group",
                  groupName: group.name,
                };
                const active = isActive(fakeView);
                return (
                  <button
                    key={group.name}
                    type="button"
                    onClick={() => onSelectChat(fakeView)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                    style={{ background: active ? "#2b5278" : "transparent" }}
                    onMouseEnter={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.background =
                          "#1c2733";
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                    }}
                    data-ocid="sidebar.fake_group.item"
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                        style={{ background: stringToColor(group.name) }}
                      >
                        {group.emoji}
                      </div>
                      {group.online && (
                        <span
                          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                          style={{
                            background: "#3b9e5a",
                            borderColor: active ? "#2b5278" : "#0e1621",
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className="font-semibold text-sm truncate"
                          style={{ color: "#e8f4fd" }}
                        >
                          {group.name}
                        </span>
                        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                          <span
                            className="text-xs"
                            style={{ color: "#4a6278" }}
                          >
                            {group.lastTime}
                          </span>
                          {group.unread > 0 && (
                            <span
                              className="min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                              style={{ background: "#5288c1" }}
                            >
                              {group.unread}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p
                          className="text-xs truncate flex-1"
                          style={{ color: "#8eacbb" }}
                        >
                          {group.lastMessage}
                        </p>
                        <span
                          className="text-xs ml-2 flex-shrink-0"
                          style={{ color: "#4a6278" }}
                        >
                          👥 {group.memberCount}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {filteredGroups.length === 0 &&
            filteredFakeGroups.length === 0 &&
            filteredFakeDMs.length === 0 &&
            !search && (
              <div
                className="px-4 py-6 text-center"
                data-ocid="sidebar.groups.empty_state"
              >
                <div className="text-3xl mb-2">💬</div>
                <p className="text-sm" style={{ color: "#4a6278" }}>
                  No chats yet
                </p>
                <p className="text-xs mt-1" style={{ color: "#2b3d54" }}>
                  Press + to create one
                </p>
              </div>
            )}

          {filteredGroups.length === 0 &&
            filteredFakeGroups.length === 0 &&
            filteredFakeDMs.length === 0 &&
            search && (
              <div
                className="px-4 py-4 text-center"
                data-ocid="sidebar.search.empty_state"
              >
                <p className="text-sm" style={{ color: "#4a6278" }}>
                  No results for "{search}"
                </p>
              </div>
            )}

          {/* Game Section */}
          <div className="mt-2">
            <div
              className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#4a6278" }}
            >
              Game
            </div>
            <div className="grid grid-cols-4 gap-1.5 px-3 py-2">
              {GAME_ITEMS.map((item) => {
                const active =
                  activeView.type === "game" && activeView.page === item.page;
                return (
                  <button
                    key={item.page}
                    type="button"
                    onClick={() =>
                      onSelectChat({ type: "game", page: item.page })
                    }
                    className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                    style={{ background: active ? "#2b5278" : "#182533" }}
                    title={item.label}
                    data-ocid={`sidebar.${item.page}.tab`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span
                      className="text-xs font-medium truncate w-full text-center"
                      style={{
                        color: active ? "#ffffff" : "#8eacbb",
                        fontSize: 9,
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Admin */}
            <button
              type="button"
              onClick={() => onSelectChat({ type: "game", page: "admin" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors"
              style={{
                background:
                  activeView.type === "game" && activeView.page === "admin"
                    ? "#2b5278"
                    : "transparent",
              }}
              onMouseEnter={(e) => {
                if (
                  !(activeView.type === "game" && activeView.page === "admin")
                )
                  (e.currentTarget as HTMLElement).style.background = "#1c2733";
              }}
              onMouseLeave={(e) => {
                if (
                  !(activeView.type === "game" && activeView.page === "admin")
                )
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
              }}
              data-ocid="sidebar.admin.tab"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "#182533" }}
              >
                ⚙️
              </div>
              <span
                className="font-medium text-sm"
                style={{ color: "#e8f4fd" }}
              >
                Admin
              </span>
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === "contacts") {
      const filteredFriends = friends.filter(
        (f) =>
          !search ||
          f.username.toLowerCase().includes(search.toLowerCase()) ||
          f.displayName.toLowerCase().includes(search.toLowerCase()),
      );

      return (
        <div className="flex-1 overflow-y-auto">
          <div
            className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#4a6278" }}
          >
            Contacts
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1c2733";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
            data-ocid="contacts.my_profile.button"
          >
            <div className="relative flex-shrink-0">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white overflow-hidden"
                style={{ background: "#5288c1" }}
              >
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}
              </div>
              {identity && (
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{ background: "#3b9e5a", borderColor: "#0e1621" }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: "#e8f4fd" }}>
                {identity ? displayName : "Guest"}
              </p>
              <p className="text-xs" style={{ color: "#5288c1" }}>
                My Profile
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setComposeTab("dm");
              setShowCompose(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1c2733";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
            data-ocid="contacts.new_dm.button"
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#182533" }}
            >
              <MessageCircle className="w-5 h-5" style={{ color: "#5288c1" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: "#e8f4fd" }}>
                New Message
              </p>
              <p className="text-xs" style={{ color: "#8eacbb" }}>
                Send a direct message
              </p>
            </div>
          </button>

          <div className="px-3 py-3">
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: "#4a6278" }}
            >
              ADD FRIEND
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="@username or Principal ID"
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddFriend();
                }}
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  background: "#182533",
                  color: "#e8f4fd",
                  border: "1px solid #2b3d54",
                }}
                data-ocid="contacts.add_friend.input"
              />
              <button
                type="button"
                onClick={handleAddFriend}
                className="px-3 py-2 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110"
                style={{ background: "#5288c1", flexShrink: 0 }}
                data-ocid="contacts.add_friend.button"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredFriends.length > 0 && (
            <div>
              <div
                className="px-4 pt-1 pb-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#4a6278" }}
              >
                Friends ({filteredFriends.length})
              </div>
              {filteredFriends.map((friend) => (
                <div
                  key={friend.username}
                  className="flex items-center gap-3 px-3 py-2.5"
                  data-ocid="contacts.friend.item"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                    style={{ background: stringToColor(friend.username) }}
                  >
                    {friend.username[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-sm truncate"
                      style={{ color: "#e8f4fd" }}
                    >
                      {friend.displayName}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "#5288c1" }}
                    >
                      @{friend.username}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setAddToGroupFriend(friend);
                        setShowAddToGroupModal(true);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                      style={{ background: "#2b5278", color: "#87CEEB" }}
                      title="Add to Group"
                      data-ocid="contacts.add_to_group.button"
                    >
                      <Users className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFriend(friend.username)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all hover:brightness-110"
                      style={{ background: "#3a1c1c", color: "#c15252" }}
                      title="Remove"
                      data-ocid="contacts.remove_friend.button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {friends.length === 0 && (
            <div
              className="mx-4 my-3 rounded-xl p-4 text-center"
              style={{ background: "#182533" }}
              data-ocid="contacts.friends.empty_state"
            >
              <p className="text-sm" style={{ color: "#8eacbb" }}>
                Add friends by their @username or Principal ID.
              </p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "settings") {
      return (
        <div className="flex-1 overflow-y-auto">
          <div
            className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#4a6278" }}
          >
            Settings
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1c2733";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
            data-ocid="settings.profile.button"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#2b5278" }}
            >
              <User className="w-5 h-5" style={{ color: "#e8f4fd" }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "#e8f4fd" }}>
                Edit Profile
              </p>
              <p className="text-xs" style={{ color: "#8eacbb" }}>
                Name, photo, username, bio
              </p>
            </div>
          </button>

          {GAME_ITEMS.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => onSelectChat({ type: "game", page: item.page })}
              className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#1c2733";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
              data-ocid={`settings.${item.page}.button`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "#182533" }}
              >
                {item.icon}
              </div>
              <p className="font-semibold text-sm" style={{ color: "#e8f4fd" }}>
                {item.label}
              </p>
            </button>
          ))}

          <button
            type="button"
            onClick={() => onSelectChat({ type: "game", page: "admin" })}
            className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1c2733";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
            data-ocid="settings.admin.button"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: "#182533" }}
            >
              🔐
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "#e8f4fd" }}>
                Admin Panel
              </p>
              <p className="text-xs" style={{ color: "#8eacbb" }}>
                Manage waifus, ads, shop
              </p>
            </div>
          </button>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto flex flex-col items-center pt-8 px-4">
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-3"
          data-ocid="bottomnav.profile.button"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl text-white overflow-hidden"
            style={{
              background: "#5288c1",
              border: "3px solid #5288c1",
              boxShadow: "0 0 20px rgba(82,136,193,0.4)",
            }}
          >
            {profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              avatarLetter
            )}
          </div>
          <div className="text-center">
            <p className="font-bold text-lg" style={{ color: "#e8f4fd" }}>
              {identity ? displayName : "Guest"}
            </p>
            <p
              className="text-sm"
              style={{ color: identity ? "#3b9e5a" : "#4a6278" }}
            >
              {identity ? "Online" : "Not logged in"}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenProfile}
          className="mt-6 w-full py-3 rounded-xl font-bold text-white transition-all hover:brightness-110"
          style={{ background: "#5288c1" }}
          data-ocid="bottomnav.edit_profile.button"
        >
          Edit Profile
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0e1621" }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-3 py-3"
        style={{ borderBottom: "1px solid #1c2733" }}
      >
        <img
          src="https://files.catbox.moe/lasj0e.jpg"
          alt="logo"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <span
          className="font-bold text-base flex-1"
          style={{
            background: "linear-gradient(90deg, #ffffff, #87CEEB, #00BFFF)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          SinzhuWaifu
        </span>
        {totalUnread > 0 && (
          <span
            className="min-w-[20px] h-5 px-1.5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
            style={{ background: "#e53935" }}
          >
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </div>

      {/* Search */}
      {(activeTab === "chats" || activeTab === "contacts") && (
        <div className="px-3 py-2">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: "#182533" }}
          >
            <Search
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "#8eacbb" }}
            />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
              style={{ color: "#e8f4fd" }}
              data-ocid="sidebar.search.input"
            />
          </div>
        </div>
      )}

      {/* Tab content */}
      {renderTabContent()}

      {/* Bottom nav tabs */}
      <div
        className="flex items-center"
        style={{ borderTop: "1px solid #1c2733", background: "#0e1621" }}
      >
        {[
          {
            id: "chats" as BottomTab,
            icon: MessageCircle,
            label: "Chats",
            badge:
              allGroups.length +
              FAKE_GROUPS.length +
              FAKE_DMS.filter((d) => d.unread > 0).length,
          },
          {
            id: "contacts" as BottomTab,
            icon: BookUser,
            label: "Contacts",
            badge: friends.length,
          },
          {
            id: "settings" as BottomTab,
            icon: Settings,
            label: "Settings",
            badge: 0,
          },
          {
            id: "profile" as BottomTab,
            icon: User,
            label: "Profile",
            badge: 0,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-colors"
            style={{ color: activeTab === tab.id ? "#5288c1" : "#8eacbb" }}
            data-ocid={`bottomnav.${tab.id}.tab`}
          >
            <div className="relative">
              <tab.icon className="w-5 h-5" />
              {tab.badge > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ background: "#5288c1" }}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Blue FAB + button */}
      <button
        type="button"
        onClick={() => {
          setComposeTab("create");
          setShowCompose(true);
        }}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:brightness-110 active:scale-95 z-30"
        style={{
          background: "#5288c1",
          boxShadow: "0 4px 20px rgba(82,136,193,0.5)",
        }}
        data-ocid="fab.compose.button"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", cursor: "default" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCompose(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowCompose(false);
            }}
            data-ocid="compose.modal"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="rounded-2xl w-full max-w-sm"
              style={{ background: "#17212b", border: "1px solid #2b3d54" }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid #1c2733" }}
              >
                <h2 className="font-bold text-white">New Chat</h2>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  style={{ color: "#8eacbb" }}
                  data-ocid="compose.close_button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex border-b" style={{ borderColor: "#1c2733" }}>
                {(["create", "join", "dm"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setComposeTab(t)}
                    className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                    style={{
                      color: composeTab === t ? "#5288c1" : "#8eacbb",
                      borderBottom:
                        composeTab === t
                          ? "2px solid #5288c1"
                          : "2px solid transparent",
                    }}
                    data-ocid={`compose.${t}.tab`}
                  >
                    {t === "create"
                      ? "Create Group"
                      : t === "join"
                        ? "Join Group"
                        : "Direct Message"}
                  </button>
                ))}
              </div>

              <div className="p-5 flex flex-col gap-3">
                {composeTab === "create" && (
                  <>
                    <input
                      type="text"
                      placeholder="Group Name (this is the Group ID)"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={{
                        background: "#182533",
                        color: "#e8f4fd",
                        border: "1px solid #2b3d54",
                      }}
                      data-ocid="compose.group_name.input"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={groupDesc}
                      onChange={(e) => setGroupDesc(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={{
                        background: "#182533",
                        color: "#e8f4fd",
                        border: "1px solid #2b3d54",
                      }}
                      data-ocid="compose.group_desc.input"
                    />
                    <button
                      type="button"
                      onClick={handleCreateGroup}
                      disabled={createGroup.isPending}
                      className="w-full py-2.5 rounded-xl font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
                      style={{ background: "#5288c1" }}
                      data-ocid="compose.create_group.submit_button"
                    >
                      {createGroup.isPending
                        ? "Creating..."
                        : "✅ Create Group"}
                    </button>
                  </>
                )}
                {composeTab === "join" && (
                  <>
                    <input
                      type="text"
                      placeholder="Enter Group ID (group name)"
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={{
                        background: "#182533",
                        color: "#e8f4fd",
                        border: "1px solid #2b3d54",
                      }}
                      data-ocid="compose.join_id.input"
                    />
                    <button
                      type="button"
                      onClick={handleJoinGroup}
                      disabled={joinGroup.isPending}
                      className="w-full py-2.5 rounded-xl font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
                      style={{ background: "#5288c1" }}
                      data-ocid="compose.join_group.submit_button"
                    >
                      {joinGroup.isPending ? "Joining..." : "Join Group"}
                    </button>
                  </>
                )}
                {composeTab === "dm" && (
                  <>
                    <p className="text-xs" style={{ color: "#8eacbb" }}>
                      Enter @username (from friends list) or Principal ID.
                    </p>
                    {friends.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {friends.slice(0, 6).map((f) => (
                          <button
                            key={f.username}
                            type="button"
                            onClick={() => setDmPrincipal(f.principalId)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold"
                            style={{
                              background:
                                dmPrincipal === f.principalId
                                  ? "#2b5278"
                                  : "#182533",
                              color: "#87CEEB",
                              border: "1px solid #2b5278",
                            }}
                          >
                            @{f.username}
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Principal ID or @username"
                      value={dmPrincipal}
                      onChange={(e) => setDmPrincipal(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none font-mono"
                      style={{
                        background: "#182533",
                        color: "#e8f4fd",
                        border: "1px solid #2b3d54",
                      }}
                      data-ocid="compose.dm_principal.input"
                    />
                    <button
                      type="button"
                      onClick={handleOpenDM}
                      className="w-full py-2.5 rounded-xl font-bold text-white transition-all hover:brightness-110"
                      style={{ background: "#5288c1" }}
                      data-ocid="compose.open_dm.submit_button"
                    >
                      Open DM
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add to Group Modal */}
      <AnimatePresence>
        {showAddToGroupModal && addToGroupFriend && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddToGroupModal(false);
                setAddToGroupFriend(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowAddToGroupModal(false);
                setAddToGroupFriend(null);
              }
            }}
            data-ocid="add_to_group.modal"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="rounded-2xl w-full max-w-xs"
              style={{ background: "#17212b", border: "1px solid #2b3d54" }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid #1c2733" }}
              >
                <h2 className="font-bold text-white text-sm">
                  Add @{addToGroupFriend.username} to Group
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddToGroupModal(false);
                    setAddToGroupFriend(null);
                  }}
                  style={{ color: "#8eacbb" }}
                  data-ocid="add_to_group.close_button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-2 max-h-64 overflow-y-auto">
                {allGroups.length === 0 && (
                  <p
                    className="text-sm text-center py-4"
                    style={{ color: "#4a6278" }}
                  >
                    No groups yet. Create one first.
                  </p>
                )}
                {allGroups.map((grp) => (
                  <button
                    key={grp.name}
                    type="button"
                    onClick={() =>
                      handleAddFriendToGroup(addToGroupFriend, grp.name)
                    }
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:brightness-110"
                    style={{ background: "#182533" }}
                    data-ocid="add_to_group.group.item"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                      style={{ background: stringToColor(grp.name) }}
                    >
                      {grp.name[0]?.toUpperCase()}
                    </div>
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "#e8f4fd" }}
                    >
                      {grp.name}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = [
    "#2b5278",
    "#3a7858",
    "#7b4a8c",
    "#8c5a3a",
    "#3a5a8c",
    "#8c3a5a",
    "#4a7b3a",
  ];
  return colors[Math.abs(hash) % colors.length];
}
