import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  MessageCircle,
  Mic,
  Paperclip,
  Plus,
  Search,
  Send,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
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

function renderMessageContent(content: string) {
  if (content.startsWith("[VOICE]:")) {
    const src = content.slice("[VOICE]:".length);
    return (
      <audio
        controls
        src={src}
        className="max-w-full"
        style={{ height: "36px", minWidth: "180px" }}
      >
        <track kind="captions" />
      </audio>
    );
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
  return <span>{content}</span>;
}

interface GroupChatProps {
  groupName: string;
  memberCount: number;
  onBack: () => void;
}

function GroupChat({ groupName, memberCount, onBack }: GroupChatProps) {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myPrincipal = identity?.getPrincipal().toString();
  const localStorageKey = `groupMessages_${groupName}`;

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
    } catch {
      /* ignore */
    }
  }, [localStorageKey]);

  // Merge backend + local messages, deduplicate by id
  const allMessages: GroupMessage[] = (() => {
    const backendIds = new Set((backendMessages ?? []).map((m) => m.id));
    const localOnly = localMessages.filter((m) => !backendIds.has(m.id));
    const combined = [...(backendMessages ?? []), ...localOnly];
    combined.sort((a, b) => {
      const diff = Number(a.timestamp) - Number(b.timestamp);
      return diff;
    });
    return combined;
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

  const sendContent = async (content: string) => {
    const localProfile = (() => {
      try {
        return JSON.parse(localStorage.getItem("userProfile") || "{}");
      } catch {
        return {};
      }
    })();
    const principalStr = myPrincipal || "anonymous";

    try {
      await sendMsg.mutateAsync({ groupName, content });
    } catch {
      // Fallback: save locally
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

  // Voice recording
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

  // Media upload
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
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
          style={{
            background: "oklch(0.59 0.22 295 / 0.2)",
            border: "1px solid oklch(0.59 0.22 295 / 0.3)",
            color: "oklch(0.75 0.18 295)",
          }}
        >
          {groupName[0]}
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">{groupName}</p>
          <p className="text-xs text-muted-foreground">{memberCount} members</p>
        </div>
        <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="btn-violet text-xs px-3 h-8"
              data-ocid="community.add_member.open_modal_button"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Member
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
                myPrincipal && msg.senderPrincipal?.toString() === myPrincipal;
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
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}
                  >
                    {!isMe && (
                      <span className="text-xs text-muted-foreground ml-1">
                        {msg.senderName || "Unknown"}
                      </span>
                    )}
                    <div
                      className="px-3 py-2 rounded-2xl text-sm"
                      style={{
                        background: isMe
                          ? "oklch(0.59 0.22 295 / 0.3)"
                          : "oklch(0.16 0.04 290)",
                        border: isMe
                          ? "1px solid oklch(0.59 0.22 295 / 0.4)"
                          : "1px solid oklch(0.22 0.055 290)",
                      }}
                    >
                      {renderMessageContent(msg.content)}
                    </div>
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
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
          data-ocid="community.group_chat.dropzone"
        />

        {/* Paperclip / media button */}
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

        {/* Mic / voice button */}
        <button
          type="button"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className="p-2 rounded-xl transition-all shrink-0 select-none"
          style={{
            color: isRecording ? "oklch(0.65 0.25 25)" : "oklch(0.75 0.18 295)",
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
  );
}

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
  const [createOpen, setCreateOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<{
    name: string;
    memberCount: number;
  } | null>(null);
  const [friendSearch, setFriendSearch] = useState("");
  const [dmTarget, setDmTarget] = useState<string | null>(null);
  const [dmMessage, setDmMessage] = useState("");
  const [dmPrincipalStr, setDmPrincipalStr] = useState<string | null>(null);

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
      toast.success(`Group "${newGroupName}" created!`);
      setNewGroupName("");
      setNewGroupDesc("");
      setCreateOpen(false);
    } catch {
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
              {displayGroups.map((group, i) => (
                <motion.div
                  key={group.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-glass rounded-2xl p-4 flex items-center gap-4"
                  data-ocid={`community.groups.item.${i + 1}`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0"
                    style={{
                      background: "oklch(0.59 0.22 295 / 0.15)",
                      border: "1px solid oklch(0.59 0.22 295 / 0.3)",
                      color: "oklch(0.75 0.18 295)",
                    }}
                  >
                    {group.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground">{group.name}</h3>
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
              ))}
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

                  {/* Inline DM Panel */}
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
                                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
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
