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
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAcceptFriendRequest,
  useCallerProfile,
  useGetFriendRequests,
  useIsAdmin,
  useSaveProfile,
  useUserHarem,
} from "../hooks/useQueries";

// BUG 1 & 2 FIX: Added onLogout prop
interface TelegramProfileProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

function getLocalProfile() {
  try {
    return JSON.parse(localStorage.getItem("sinzhu_profile") || "null");
  } catch {
    return null;
  }
}

function saveLocalProfile(data: Record<string, unknown>) {
  try {
    const existing = getLocalProfile() || {};
    const merged = { ...existing, ...data };
    localStorage.setItem("sinzhu_profile", JSON.stringify(merged));
    return merged;
  } catch {
    return data;
  }
}

function getLocalAuth() {
  try {
    const stored = localStorage.getItem("sinzhu_local_auth");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default function TelegramProfile({
  onBack,
  onNavigate,
  onLogout,
}: TelegramProfileProps) {
  const { identity, clear } = useInternetIdentity();
  const googleAuth = useGoogleAuth();
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
  // localPic tracks uploaded photo immediately in state (for instant UI update)
  const [localPic, setLocalPic] = useState<string>(
    () => getLocalProfile()?.picture || "",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGoogleUser = !!googleAuth.user;

  // BUG 1 FIX: Include local auth users in isLoggedIn check
  const localAuth = getLocalAuth();
  const isLoggedIn = !!identity || !!googleAuth.user || !!localAuth;

  // Initialize form — BUG 1 FIX: also handle localAuth users
  useEffect(() => {
    const local = getLocalProfile();
    const la = getLocalAuth();
    if (identity && profile) {
      setForm({
        username: local?.username ?? profile.username,
        displayName: local?.displayName ?? profile.displayName,
        bio: local?.bio ?? profile.bio,
      });
      if (local?.picture) setLocalPic(local.picture);
    } else if (googleAuth.user) {
      setForm({
        username: local?.username || googleAuth.user.email.split("@")[0],
        displayName: local?.displayName || googleAuth.user.name,
        bio: local?.bio || "",
      });
      if (local?.picture) {
        setLocalPic(local.picture);
      } else {
        setLocalPic(googleAuth.user.picture || "");
      }
    } else if (la) {
      // Local auth user
      setForm({
        username: local?.username || la.username || "",
        displayName: local?.displayName || la.displayName || la.username || "",
        bio: local?.bio || "",
      });
      if (local?.picture) setLocalPic(local.picture);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, identity, googleAuth.user]);

  const principalStr = identity?.getPrincipal().toString() ?? "";

  const handleSave = async () => {
    saveLocalProfile({
      username: form.username,
      displayName: form.displayName,
      bio: form.bio,
    });
    if (profile && identity) {
      try {
        await saveProfile.mutateAsync({
          ...profile,
          username: form.username,
          displayName: form.displayName,
          bio: form.bio,
        });
      } catch {
        // localStorage already saved
      }
    }
    toast.success("Profile updated! ✨");
    setEditing(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For Google users, local auth users, or when no backend profile — save as base64 in localStorage
    if (!identity || !profile) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        saveLocalProfile({ picture: base64 });
        setLocalPic(base64);
        toast.success("Photo updated! 📸");
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Internet Identity user with backend profile
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
      // fallback to localStorage base64
      setUploadProgress(null);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        saveLocalProfile({ picture: base64 });
        setLocalPic(base64);
        toast.success("Photo updated! 📸");
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeletePhoto = async () => {
    // Remove from localStorage for all users
    saveLocalProfile({ picture: "" });
    setLocalPic("");

    if (profile && identity) {
      setDeletingPhoto(true);
      try {
        await saveProfile.mutateAsync({
          ...profile,
          profilePic: ExternalBlob.fromURL(""),
        });
        queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
      } catch {
        // localStorage already cleared
      }
      setDeletingPhoto(false);
    }
    toast.success("Photo removed.");
  };

  const handleCopyPrincipal = () => {
    if (!principalStr) return;
    navigator.clipboard.writeText(principalStr);
    setCopiedPrincipal(true);
    setTimeout(() => setCopiedPrincipal(false), 2000);
    toast.success("Principal ID copied!");
  };

  // BUG 2 FIX: Unified logout handler
  const handleLogout = () => {
    const la = getLocalAuth();
    if (la) {
      // Local auth user
      localStorage.removeItem("sinzhu_local_auth");
      onLogout?.();
    } else if (isGoogleUser && !identity) {
      googleAuth.logout();
    } else {
      clear();
    }
  };

  // Compute pic URL: prefer localPic (uploaded/from localStorage), then backend, then Google avatar
  let picUrl = localPic;
  if (!picUrl && identity && profile) {
    try {
      picUrl = profile.profilePic?.getDirectURL?.() || "";
    } catch {}
  }

  const displayName = form.displayName || form.username || "User";
  const avatarLetter = displayName[0]?.toUpperCase() ?? "U";
  // Show Onex balance from localStorage for local auth users, coins from backend for II users
  const localOnex = (() => {
    try {
      const p = getLocalProfile();
      return p?.balance || 0;
    } catch {
      return 0;
    }
  })();
  const coins = profile ? Number(profile.balance) : localOnex;

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
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ color: "#5288c1" }}
          data-ocid="profile.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-white flex-1">Profile</h1>
        {isLoggedIn && !editing && (
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
          <>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 py-1 rounded-lg text-xs"
              style={{ color: "#8eacbb" }}
            >
              Cancel
            </button>
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
          </>
        )}
      </div>

      {!isLoggedIn ? (
        /* ===== NOT LOGGED IN (should not happen with login gate, but fallback) ===== */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center gap-5 px-6"
        >
          <div className="text-5xl">👤</div>
          <div className="flex flex-col items-center gap-1">
            <p className="font-semibold text-white">Aap logged in nahi hain</p>
            <p className="text-sm text-center" style={{ color: "#8eacbb" }}>
              Pehle login karein
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm"
            style={{
              background: "#2481cc",
              color: "#ffffff",
              maxWidth: 300,
            }}
            data-ocid="profile.back.button"
          >
            ← Go Back
          </button>
        </motion.div>
      ) : (
        /* ===== LOGGED IN ===== */
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

            {/* Camera upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 right-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "#5288c1" }}
              data-ocid="profile.photo.upload_button"
              disabled={uploadProgress !== null}
            >
              <Camera className="w-4 h-4 text-white" />
            </button>

            {/* Delete photo button — shown for all users when photo exists */}
            {picUrl && (
              <button
                type="button"
                onClick={handleDeletePhoto}
                disabled={deletingPhoto}
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "#c15252" }}
                data-ocid="profile.photo.delete_button"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
              </button>
            )}

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

          {/* Online + login method badge */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="flex items-center gap-1.5">
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
            {isGoogleUser && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(66,133,244,0.15)",
                  border: "1px solid rgba(66,133,244,0.3)",
                }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#7db3f5" }}
                >
                  Signed in with Google
                </span>
              </div>
            )}
            {localAuth && !isGoogleUser && !identity && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(82,136,193,0.15)",
                  border: "1px solid rgba(82,136,193,0.3)",
                }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#7db3f5" }}
                >
                  🔑 @{localAuth.username}
                </span>
              </div>
            )}
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
                    placeholder="Enter your name"
                    data-ocid="profile.name.input"
                  />
                ) : (
                  <p
                    className="text-sm font-semibold"
                    style={{ color: form.displayName ? "#e8f4fd" : "#4a6278" }}
                  >
                    {form.displayName || "Tap edit to set name"}
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
                    placeholder="username (no spaces)"
                    data-ocid="profile.username.input"
                  />
                ) : (
                  <p
                    className="text-sm"
                    style={{ color: form.username ? "#5288c1" : "#4a6278" }}
                  >
                    {form.username ? `@${form.username}` : "Not set"}
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
                    placeholder="Write something about yourself..."
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

            {/* Save button when editing */}
            {editing && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saveProfile.isPending}
                className="w-full py-3 rounded-xl font-bold text-sm"
                style={{ background: "#2481cc", color: "#fff" }}
              >
                {saveProfile.isPending ? "Saving..." : "💾 Save Changes"}
              </button>
            )}

            {/* Balance stats */}
            <div className="grid grid-cols-2 gap-2">
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "#182533", border: "1px solid #2b3d54" }}
              >
                <p className="text-xs" style={{ color: "#4a6278" }}>
                  Balance
                </p>
                <p className="text-sm font-bold" style={{ color: "#f0c040" }}>
                  💰 {coins.toLocaleString()} Onex
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
                  💝{" "}
                  {harem.length ||
                    (() => {
                      try {
                        return (
                          JSON.parse(
                            localStorage.getItem("sinzhu_harem_global") || "[]",
                          ).length || 0
                        );
                      } catch {
                        return 0;
                      }
                    })()}{" "}
                  Waifus
                </p>
              </div>
            </div>

            {/* Google user email */}
            {isGoogleUser && googleAuth.user && (
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "#182533", border: "1px solid #2b3d54" }}
              >
                <p className="text-xs" style={{ color: "#4a6278" }}>
                  Email
                </p>
                <p className="text-sm font-mono" style={{ color: "#7db3f5" }}>
                  {googleAuth.user.email}
                </p>
              </div>
            )}

            {/* Principal ID */}
            {principalStr && identity && (
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
            {identity &&
              friendRequests.filter((r) => r.status === "pending").length >
                0 && (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "#182533",
                    border: "1px solid #2b3d54",
                  }}
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
                style={{
                  background: "#2b3d54",
                  border: "1px solid #3d5a78",
                }}
                data-ocid="profile.admin.button"
              >
                ⚙️ Admin Panel
              </button>
            )}

            {/* BUG 2 FIX: Unified logout button */}
            <button
              type="button"
              onClick={handleLogout}
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

      {/* Footer */}
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
