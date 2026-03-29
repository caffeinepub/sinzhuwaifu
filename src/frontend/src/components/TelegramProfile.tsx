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
import GoogleLoginModal from "./GoogleLoginModal";

interface TelegramProfileProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

function GoogleColorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Google"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function TelegramProfile({
  onBack,
  onNavigate,
}: TelegramProfileProps) {
  const { identity, login, clear } = useInternetIdentity();
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
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGoogleUser = !!googleAuth.user && !identity;
  const isLoggedIn = !!identity || !!googleAuth.user;

  // Initialize form from backend profile (Internet Identity users)
  // Prefer localStorage values over backend when they exist
  useEffect(() => {
    if (profile && identity) {
      const local = (() => {
        try {
          return JSON.parse(localStorage.getItem("sinzhu_profile") || "null");
        } catch {
          return null;
        }
      })();
      setForm({
        username: local?.username ?? profile.username,
        displayName: local?.displayName ?? profile.displayName,
        bio: local?.bio ?? profile.bio,
      });
    }
  }, [profile, identity]);

  // Initialize form from localStorage (Google users)
  useEffect(() => {
    if (googleAuth.user && !identity) {
      try {
        const local = JSON.parse(
          localStorage.getItem("sinzhu_profile") || "null",
        );
        if (local) {
          setForm({
            username: local.username || "",
            displayName: local.displayName || googleAuth.user.name,
            bio: local.bio || "",
          });
        } else {
          setForm({
            username: googleAuth.user.email.split("@")[0],
            displayName: googleAuth.user.name,
            bio: "",
          });
        }
      } catch {
        setForm({
          username: googleAuth.user.email.split("@")[0],
          displayName: googleAuth.user.name,
          bio: "",
        });
      }
    }
  }, [googleAuth.user, identity]);

  const principalStr = identity?.getPrincipal().toString() ?? "";

  const handleSave = async () => {
    // Always save to localStorage
    const saved = {
      username: form.username,
      displayName: form.displayName,
      bio: form.bio,
    };
    localStorage.setItem("sinzhu_profile", JSON.stringify(saved));
    // Only call backend if Internet Identity
    if (profile && identity) {
      try {
        await saveProfile.mutateAsync({
          ...profile,
          username: form.username,
          displayName: form.displayName,
          bio: form.bio,
        });
      } catch {
        // localStorage save already happened, so we just show success
      }
    }
    toast.success("Profile updated! ✨");
    setEditing(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Google user: save as base64 in localStorage
    if (isGoogleUser && !identity) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        try {
          const existing = JSON.parse(
            localStorage.getItem("sinzhu_profile") || "{}",
          );
          existing.picture = base64;
          localStorage.setItem("sinzhu_profile", JSON.stringify(existing));
          // Force re-render
          setForm((f) => ({ ...f }));
          toast.success("Photo updated! 📸");
        } catch {}
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Internet Identity user: use backend blob upload
    if (!profile) return;
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
  if (isGoogleUser) {
    // Check localStorage for custom uploaded photo first
    try {
      const local = JSON.parse(
        localStorage.getItem("sinzhu_profile") || "null",
      );
      picUrl = local?.picture || googleAuth.user?.picture || "";
    } catch {
      picUrl = googleAuth.user?.picture || "";
    }
  } else {
    try {
      picUrl = profile?.profilePic?.getDirectURL?.() || "";
    } catch {}
  }

  const displayName =
    form.displayName ||
    form.username ||
    (isGoogleUser ? googleAuth.user?.name : "User") ||
    "User";
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

      {!isLoggedIn ? (
        /* ===== NOT LOGGED IN ===== */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center gap-5 px-6"
        >
          <div className="text-5xl">👤</div>
          <div className="flex flex-col items-center gap-1">
            <p className="font-semibold text-white">Sign in to your profile</p>
            <p className="text-sm text-center" style={{ color: "#8eacbb" }}>
              Customize your profile, collect waifus, and more
            </p>
          </div>

          {/* Google login button */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            data-ocid="profile.google.button"
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3 font-semibold text-sm transition-all hover:shadow-lg active:scale-95"
            style={{
              background: "#ffffff",
              color: "#3c4043",
              maxWidth: 300,
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
          >
            <GoogleColorIcon size={18} />
            Continue with Google
          </button>

          {/* Divider */}
          <div
            className="flex items-center gap-3 w-full"
            style={{ maxWidth: 300 }}
          >
            <div className="flex-1 h-px" style={{ background: "#2b3d54" }} />
            <span className="text-xs" style={{ color: "#4a6278" }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ background: "#2b3d54" }} />
          </div>

          {/* Internet Identity login */}
          <button
            type="button"
            onClick={login}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-sm transition-opacity hover:opacity-90 active:opacity-75"
            style={{
              background: "#2481cc",
              color: "#ffffff",
              maxWidth: 300,
            }}
            data-ocid="profile.login.button"
          >
            🔑 Login with Internet Identity
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
            {/* Show upload/delete for all logged-in users */}
            {isLoggedIn && (
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
                {picUrl && identity && (
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
                <GoogleColorIcon size={12} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#7db3f5" }}
                >
                  Signed in with Google
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

            {/* Stats — only show for II users */}
            {identity && (
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
            )}

            {/* Google user email info */}
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

            {/* Principal ID — only for II users */}
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

            {/* Friend Requests — only for II users */}
            {identity &&
              friendRequests.filter((r) => r.status === "pending").length >
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
              onClick={isGoogleUser ? googleAuth.logout : clear}
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

      {/* Google Login Modal */}
      <GoogleLoginModal
        open={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={() => setShowGoogleModal(false)}
      />
    </div>
  );
}
