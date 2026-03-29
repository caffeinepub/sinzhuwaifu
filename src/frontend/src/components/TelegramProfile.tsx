import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Camera,
  Check,
  Copy,
  Edit3,
  Save,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAcceptFriendRequest,
  useCallerProfile,
  useGetFriendRequests,
  useIsAdmin,
  useSaveProfile,
  useUserHarem,
} from "../hooks/useQueries";

interface TelegramProfileProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export default function TelegramProfile({
  onBack,
  onNavigate,
}: TelegramProfileProps) {
  const { identity, login, clear } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const { data: harem = [] } = useUserHarem(identity?.getPrincipal() ?? null);
  const { data: isAdmin } = useIsAdmin();
  const { data: friendRequests = [] } = useGetFriendRequests(
    identity?.getPrincipal() ?? null,
  );
  const acceptFriendRequest = useAcceptFriendRequest();
  const saveProfile = useSaveProfile();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ username: "", displayName: "", bio: "" });
  const [editing, setEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [copiedPrincipal, setCopiedPrincipal] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
      });
    }
  }, [profile]);

  const principalStr = identity?.getPrincipal().toString() ?? "";

  const handleSave = async () => {
    if (!profile) return;
    try {
      await saveProfile.mutateAsync({
        ...profile,
        username: form.username,
        displayName: form.displayName,
        bio: form.bio,
      });
      toast.success("Profile updated! ✨");
      setEditing(false);
    } catch {
      toast.error("Failed to save.");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      setUploadProgress(0);
      const arrayBuffer = await file.arrayBuffer();
      const blob = ExternalBlob.fromBytes(
        new Uint8Array(arrayBuffer),
      ).withUploadProgress((pct) => setUploadProgress(pct));
      await saveProfile.mutateAsync({ ...profile, profilePic: blob });
      setUploadProgress(null);
      toast.success("Photo updated! 📸");
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    } catch {
      setUploadProgress(null);
      toast.error("Upload failed.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeletePhoto = async () => {
    if (!profile) return;
    setDeletingPhoto(true);
    try {
      await saveProfile.mutateAsync({
        ...profile,
        profilePic: ExternalBlob.fromURL(""),
      });
      toast.success("Photo removed.");
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    } catch {
      toast.error("Failed to remove photo.");
    }
    setDeletingPhoto(false);
  };

  const handleCopyPrincipal = () => {
    if (!principalStr) return;
    navigator.clipboard.writeText(principalStr);
    setCopiedPrincipal(true);
    setTimeout(() => setCopiedPrincipal(false), 2000);
    toast.success("Principal ID copied!");
  };

  let picUrl = "";
  try {
    picUrl = profile?.profilePic?.getDirectURL?.() || "";
  } catch {}

  const displayName = form.displayName || form.username || "User";
  const avatarLetter = displayName[0]?.toUpperCase() ?? "U";
  const coins = profile ? Number(profile.balance) : 0;

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-y-auto"
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
          data-ocid="profile.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-white flex-1">Profile</h1>
        {profile && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ color: "#5288c1" }}
            data-ocid="profile.edit.button"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
        {editing && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saveProfile.isPending}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ color: "#3b9e5a" }}
            data-ocid="profile.save.button"
          >
            <Save className="w-4 h-4" />
          </button>
        )}
      </div>

      {!identity ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="text-4xl">👤</div>
          <p className="font-semibold" style={{ color: "#8eacbb" }}>
            Please login to view your profile
          </p>
          <button
            type="button"
            onClick={login}
            className="px-6 py-2.5 rounded-xl font-bold text-white"
            style={{ background: "#5288c1" }}
            data-ocid="profile.login.button"
          >
            Login
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center px-4 py-6 gap-4">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-white text-4xl overflow-hidden"
              style={{ background: "#5288c1", border: "3px solid #2b5278" }}
            >
              {picUrl ? (
                <img
                  src={picUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                avatarLetter
              )}
            </div>
            <div className="absolute -bottom-1 right-0 flex gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "#5288c1" }}
                data-ocid="profile.photo.upload_button"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              {picUrl && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  disabled={deletingPhoto}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "#c15252" }}
                  data-ocid="profile.photo.delete_button"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            {uploadProgress !== null && (
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                <span className="text-white text-sm font-bold">
                  {uploadProgress}%
                </span>
              </div>
            )}
          </div>

          {/* Online badge */}
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: "#3b9e5a" }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: "#3b9e5a" }}
            >
              Online
            </span>
          </div>

          {/* Name / Username / Bio */}
          <div className="w-full max-w-sm flex flex-col gap-3">
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "#182533", border: "1px solid #2b3d54" }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid #2b3d54" }}
              >
                <p className="text-xs" style={{ color: "#4a6278" }}>
                  Display Name
                </p>
                {editing ? (
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, displayName: e.target.value }))
                    }
                    className="w-full bg-transparent text-sm font-semibold outline-none mt-0.5"
                    style={{ color: "#e8f4fd" }}
                    data-ocid="profile.name.input"
                  />
                ) : (
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#e8f4fd" }}
                  >
                    {form.displayName || "—"}
                  </p>
                )}
              </div>
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid #2b3d54" }}
              >
                <p className="text-xs" style={{ color: "#4a6278" }}>
                  Username
                </p>
                {editing ? (
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, username: e.target.value }))
                    }
                    className="w-full bg-transparent text-sm outline-none mt-0.5"
                    style={{ color: "#e8f4fd" }}
                    data-ocid="profile.username.input"
                  />
                ) : (
                  <p
                    className="text-sm"
                    style={{ color: form.username ? "#5288c1" : "#4a6278" }}
                  >
                    {form.username ? `@${form.username}` : "—"}
                  </p>
                )}
              </div>
              <div className="px-4 py-3">
                <p className="text-xs" style={{ color: "#4a6278" }}>
                  Bio
                </p>
                {editing ? (
                  <textarea
                    value={form.bio}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bio: e.target.value }))
                    }
                    className="w-full bg-transparent text-sm outline-none mt-0.5 resize-none"
                    style={{ color: "#e8f4fd" }}
                    rows={3}
                    data-ocid="profile.bio.textarea"
                  />
                ) : (
                  <p
                    className="text-sm"
                    style={{ color: form.bio ? "#e8f4fd" : "#4a6278" }}
                  >
                    {form.bio || "No bio set"}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "#182533", border: "1px solid #2b3d54" }}
              >
                <p className="text-xs" style={{ color: "#4a6278" }}>
                  Balance
                </p>
                <p className="text-sm font-bold" style={{ color: "#f0c040" }}>
                  💛 {coins.toLocaleString()} Coins
                </p>
              </div>
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "#182533", border: "1px solid #2b3d54" }}
              >
                <p className="text-xs" style={{ color: "#4a6278" }}>
                  Harem
                </p>
                <p className="text-sm font-bold" style={{ color: "#e8f4fd" }}>
                  💝 {harem.length} Waifus
                </p>
              </div>
            </div>

            {/* Principal ID */}
            {principalStr && (
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: "#182533", border: "1px solid #2b3d54" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: "#4a6278" }}>
                    Principal ID (share to add to groups)
                  </p>
                  <p
                    className="text-xs font-mono truncate mt-0.5"
                    style={{ color: "#5288c1" }}
                  >
                    {principalStr}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPrincipal}
                  className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ color: "#5288c1" }}
                  data-ocid="profile.principal.button"
                >
                  {copiedPrincipal ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {/* Friend Requests */}
            {friendRequests.filter((r) => r.status === "pending").length >
              0 && (
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "#182533", border: "1px solid #2b3d54" }}
              >
                <div
                  className="px-4 py-3"
                  style={{ borderBottom: "1px solid #2b3d54" }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#4a6278" }}
                  >
                    Friend Requests
                  </p>
                </div>
                {friendRequests
                  .filter((r) => r.status === "pending")
                  .map((req, i) => (
                    <div
                      key={req.fromUser.toString()}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{
                        borderBottom:
                          i < friendRequests.length - 1
                            ? "1px solid #2b3d54"
                            : "none",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-mono truncate"
                          style={{ color: "#e8f4fd" }}
                        >
                          {req.fromUser.toString().slice(0, 16)}...
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          acceptFriendRequest
                            .mutateAsync(req.fromUser)
                            .then(() =>
                              toast.success("Friend request accepted!"),
                            )
                            .catch(() => toast.error("Failed to accept."))
                        }
                        className="px-3 py-1 rounded-lg text-xs font-bold text-white"
                        style={{ background: "#3b9e5a" }}
                        data-ocid={`profile.friend_request.button.${i + 1}`}
                      >
                        Accept
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Admin Panel link */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => onNavigate("admin")}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:brightness-110 flex items-center justify-center gap-2"
                style={{ background: "#2b3d54", border: "1px solid #3d5a78" }}
                data-ocid="profile.admin.button"
              >
                ⚙️ Admin Panel
              </button>
            )}

            {/* Logout */}
            <button
              type="button"
              onClick={clear}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110"
              style={{
                background: "rgba(193,82,82,0.15)",
                color: "#c15252",
                border: "1px solid rgba(193,82,82,0.3)",
              }}
              data-ocid="profile.logout.button"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Footer attribution */}
      <div className="px-4 py-4 text-center">
        <p className="text-xs" style={{ color: "#2b3d54" }}>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#4a6278" }}
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
