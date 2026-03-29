import { Principal } from "@icp-sdk/core/principal";
import { ArrowLeft, Info, Send, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ChatView } from "../App";
import type { GroupMessage, WaifuCharacter } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetGroupMessages,
  useGroups,
  useHuntWaifuInGroup,
  useMessagesWith,
  useSendDM,
  useSendGroupMessage,
  useUserProfile,
} from "../hooks/useQueries";
import GroupInfoPanel from "./GroupInfoPanel";

interface ChatWindowProps {
  activeView:
    | { type: "group"; groupName: string }
    | { type: "dm"; principalStr: string };
  onBack: () => void;
}

function formatTime(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function ChatWindow({ activeView, onBack }: ChatWindowProps) {
  const { identity, login } = useInternetIdentity();
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

  const sendGroupMsg = useSendGroupMessage();
  const sendDMMsg = useSendDM();
  const huntWaifu = useHuntWaifuInGroup();

  const [input, setInput] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [spawnedWaifu, setSpawnedWaifu] = useState<WaifuCharacter | null>(null);
  const msgCountRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = isGroup ? groupMessages : dmMessages;

  const msgLengthRef = useRef(0);
  useEffect(() => {
    const len = messages.length;
    if (len !== msgLengthRef.current) {
      msgLengthRef.current = len;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  });

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
    if (!identity) {
      toast.error("Please login to chat");
      return;
    }

    setInput("");

    if (isGroup && groupName) {
      if (content === "/hunt") {
        try {
          const waifu = await huntWaifu.mutateAsync(groupName);
          if (waifu) {
            setSpawnedWaifu(waifu);
            setTimeout(() => setSpawnedWaifu(null), 5000);
            toast.success(`🎉 You caught ${waifu.name}!`);
          } else {
            toast.info("No waifu appeared... try again!");
          }
        } catch {
          toast.error("Hunt failed.");
        }
        return;
      }

      try {
        await sendGroupMsg.mutateAsync({ groupName, content });
        msgCountRef.current += 1;
        if (msgCountRef.current % 15 === 0) {
          const waifu = await huntWaifu.mutateAsync(groupName);
          if (waifu) {
            setSpawnedWaifu(waifu);
            setTimeout(() => setSpawnedWaifu(null), 8000);
          }
        }
      } catch {
        toast.error("Failed to send message.");
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

        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
            style={{
              background: isGroup ? stringToColor(groupName ?? "") : "#5288c1",
            }}
          >
            {isGroup
              ? (groupName?.[0]?.toUpperCase() ?? "G")
              : (chatTitle?.[0]?.toUpperCase() ?? "U")}
          </div>
          <span
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
            style={{
              background: isGroup ? "#3b9e5a" : "#8eacbb",
              borderColor: "#17212b",
            }}
          />
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
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ color: "#8eacbb" }}
            data-ocid="chat.info.button"
          >
            <Info className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Waifu Spawn Banner */}
      <AnimatePresence>
        {spawnedWaifu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4 mt-2 rounded-xl overflow-hidden flex items-center gap-3 p-3"
            style={{ background: "#2b5278", border: "1px solid #5288c1" }}
            data-ocid="chat.waifu_spawn.panel"
          >
            <img
              src={spawnedWaifu.imageUrl}
              alt={spawnedWaifu.name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div>
              <p className="text-xs font-bold" style={{ color: "#87CEEB" }}>
                ✨ Waifu Appeared!
              </p>
              <p className="font-bold text-white">{spawnedWaifu.name}</p>
              <p className="text-xs" style={{ color: "#8eacbb" }}>
                {spawnedWaifu.series} · {spawnedWaifu.rarity}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSpawnedWaifu(null)}
              className="ml-auto"
              style={{ color: "#8eacbb" }}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
        {messages.length === 0 && (
          <div
            className="flex-1 flex items-center justify-center"
            data-ocid="chat.messages.empty_state"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{isGroup ? "💬" : "✉️"}</div>
              <p className="font-semibold" style={{ color: "#8eacbb" }}>
                {isGroup ? `Say hi to ${groupName}!` : "Start a conversation!"}
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
          ? (groupMessages as GroupMessage[]).map((msg, i) => {
              const isOwn =
                myPrincipal &&
                msg.senderPrincipal.toString() === myPrincipal.toString();
              if (msg.isWaifuSpawn) {
                return (
                  <div key={msg.id ?? i} className="flex justify-center my-2">
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
              return (
                <MessageBubble
                  key={msg.id ?? i}
                  content={msg.content}
                  senderName={msg.senderName || "Unknown"}
                  timestamp={msg.timestamp}
                  isOwn={!!isOwn}
                  isGroup
                />
              );
            })
          : (dmMessages as import("../backend").DMMessage[]).map((msg) => {
              const isOwn =
                myPrincipal &&
                msg.fromUser.toString() === myPrincipal.toString();
              return (
                <MessageBubble
                  key={msg.timestamp.toString() + msg.fromUser.toString()}
                  content={msg.content}
                  senderName={isOwn ? "You" : (chatTitle ?? "")}
                  timestamp={msg.timestamp}
                  isOwn={!!isOwn}
                  isGroup={false}
                />
              );
            })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
        style={{ background: "#17212b", borderTop: "1px solid #1c2733" }}
      >
        {!identity ? (
          <div className="flex-1 flex items-center justify-center gap-3 py-2">
            <span className="text-sm" style={{ color: "#8eacbb" }}>
              Login to chat
            </span>
            <button
              type="button"
              onClick={login}
              className="px-4 py-1.5 rounded-xl font-bold text-white text-sm"
              style={{ background: "#5288c1" }}
              data-ocid="chat.login.button"
            >
              Login
            </button>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              placeholder={isGroup ? "Message... (try /hunt)" : "Message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
              style={{
                background: "#182533",
                color: "#e8f4fd",
                border: "1px solid #2b3d54",
              }}
              data-ocid="chat.message.input"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={
                !input.trim() || sendGroupMsg.isPending || sendDMMsg.isPending
              }
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:brightness-110 disabled:opacity-40"
              style={{ background: "#5288c1", flexShrink: 0 }}
              data-ocid="chat.send.button"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </>
        )}
      </div>

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

function MessageBubble({
  content,
  senderName,
  timestamp,
  isOwn,
  isGroup,
}: {
  content: string;
  senderName: string;
  timestamp: bigint;
  isOwn: boolean;
  isGroup: boolean;
}) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className="max-w-xs md:max-w-sm lg:max-w-md px-3 py-2 rounded-xl"
        style={{
          background: isOwn ? "#2b5278" : "#182533",
          borderRadius: isOwn ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
        }}
        data-ocid="chat.message.item"
      >
        {isGroup && !isOwn && (
          <p
            className="text-xs font-bold mb-0.5"
            style={{ color: senderNameColor(senderName) }}
          >
            {senderName}
          </p>
        )}
        <p className="text-sm break-words" style={{ color: "#e8f4fd" }}>
          {content}
        </p>
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
