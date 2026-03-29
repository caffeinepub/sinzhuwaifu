import { Principal } from "@icp-sdk/core/principal";
import { Check, Copy, LogOut, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddMemberToGroup,
  useGroups,
  useJoinGroup,
  useUserProfile,
} from "../hooks/useQueries";

interface GroupInfoPanelProps {
  groupName: string;
  open: boolean;
  onClose: () => void;
}

function MemberRow({ principal }: { principal: Principal }) {
  const { data: profile } = useUserProfile(principal);
  const name =
    profile?.displayName ||
    profile?.username ||
    `${principal.toString().slice(0, 12)}...`;
  const letter = name[0]?.toUpperCase() ?? "U";
  let picUrl = "";
  try {
    picUrl = profile?.profilePic?.getDirectURL?.() || "";
  } catch {}

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 overflow-hidden"
        style={{ background: "#5288c1" }}
      >
        {picUrl ? (
          <img src={picUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          letter
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: "#e8f4fd" }}
        >
          {name}
        </p>
        <p className="text-xs truncate font-mono" style={{ color: "#4a6278" }}>
          {principal.toString().slice(0, 20)}...
        </p>
      </div>
    </div>
  );
}

export default function GroupInfoPanel({
  groupName,
  open,
  onClose,
}: GroupInfoPanelProps) {
  const { identity } = useInternetIdentity();
  const { data: groups = [] } = useGroups();
  const joinGroup = useJoinGroup();
  const addMember = useAddMemberToGroup();

  const group = groups.find((g) => g.name === groupName);
  const [joinId, setJoinId] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(groupName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Group ID copied!");
  };

  const handleJoinGroup = async () => {
    if (!joinId.trim()) {
      toast.error("Enter a Group ID");
      return;
    }
    try {
      await joinGroup.mutateAsync(joinId.trim());
      toast.success(`Joined group: ${joinId.trim()}`);
      setJoinId("");
    } catch {
      toast.error("Failed to join group.");
    }
  };

  const handleAddMember = async () => {
    if (!memberInput.trim()) {
      toast.error("Enter a Principal ID");
      return;
    }
    try {
      const p = Principal.fromText(memberInput.trim());
      await addMember.mutateAsync({ groupName, member: p });
      toast.success("Member added!");
      setMemberInput("");
    } catch {
      toast.error("Invalid Principal ID or failed to add.");
    }
  };

  const isCreator =
    identity &&
    group?.createdBy?.toString() === identity.getPrincipal().toString();

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ background: "rgba(0,0,0,0.5)", cursor: "default" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
          data-ocid="groupinfo.panel"
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="h-full w-full max-w-sm flex flex-col overflow-hidden"
            style={{ background: "#17212b", borderLeft: "1px solid #1c2733" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-4"
              style={{ borderBottom: "1px solid #1c2733" }}
            >
              <h2 className="font-bold text-white">Group Info</h2>
              <button
                type="button"
                onClick={onClose}
                style={{ color: "#8eacbb" }}
                data-ocid="groupinfo.close_button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Group avatar + name */}
              <div className="flex flex-col items-center gap-3 py-6 px-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-white text-3xl"
                  style={{ background: stringToColor(groupName) }}
                >
                  {groupName[0]?.toUpperCase()}
                </div>
                <h3 className="text-xl font-bold" style={{ color: "#e8f4fd" }}>
                  {groupName}
                </h3>
                {group?.description && (
                  <p
                    className="text-sm text-center"
                    style={{ color: "#8eacbb" }}
                  >
                    {group.description}
                  </p>
                )}
              </div>

              {/* Group ID */}
              <div className="px-4 pb-4">
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: "#182533", border: "1px solid #2b3d54" }}
                >
                  <div>
                    <p className="text-xs" style={{ color: "#4a6278" }}>
                      Group ID
                    </p>
                    <p
                      className="font-mono text-sm font-semibold"
                      style={{ color: "#5288c1" }}
                    >
                      {groupName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:brightness-125"
                    style={{ color: "#5288c1" }}
                    data-ocid="groupinfo.copy_id.button"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Members */}
              <div style={{ borderTop: "1px solid #1c2733" }}>
                <div className="px-4 pt-3 pb-1">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#4a6278" }}
                  >
                    Members ({group?.members?.length ?? 0})
                  </p>
                </div>
                {group?.members?.map((member) => (
                  <MemberRow key={member.toString()} principal={member} />
                ))}
              </div>

              {/* Add Member (creator only) */}
              {isCreator && (
                <div
                  className="px-4 py-4"
                  style={{ borderTop: "1px solid #1c2733" }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "#4a6278" }}
                  >
                    Add Member
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Principal ID"
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      className="flex-1 rounded-xl px-3 py-2 text-sm outline-none font-mono"
                      style={{
                        background: "#182533",
                        color: "#e8f4fd",
                        border: "1px solid #2b3d54",
                      }}
                      data-ocid="groupinfo.add_member.input"
                    />
                    <button
                      type="button"
                      onClick={handleAddMember}
                      disabled={addMember.isPending}
                      className="px-3 py-2 rounded-xl font-bold text-white text-sm transition-all hover:brightness-110 disabled:opacity-50"
                      style={{ background: "#5288c1" }}
                      data-ocid="groupinfo.add_member.button"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Join another group */}
              <div
                className="px-4 py-4"
                style={{ borderTop: "1px solid #1c2733" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "#4a6278" }}
                >
                  Join Another Group
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Group ID"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                    style={{
                      background: "#182533",
                      color: "#e8f4fd",
                      border: "1px solid #2b3d54",
                    }}
                    data-ocid="groupinfo.join_id.input"
                  />
                  <button
                    type="button"
                    onClick={handleJoinGroup}
                    disabled={joinGroup.isPending}
                    className="px-4 py-2 rounded-xl font-bold text-white text-sm transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ background: "#5288c1" }}
                    data-ocid="groupinfo.join_group.button"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#2b5278", "#3a7858", "#7b4a8c", "#8c5a3a", "#3a5a8c"];
  return colors[Math.abs(hash) % colors.length];
}
