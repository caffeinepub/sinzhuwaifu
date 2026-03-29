import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Edit3, Save, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerProfile,
  useSaveProfile,
  useUserHarem,
} from "../hooks/useQueries";

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

interface ProfileProps {
  onNavigate: (page: Page) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const { identity, login } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const { data: harem } = useUserHarem(identity?.getPrincipal() ?? null);
  const saveProfile = useSaveProfile();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: "", displayName: "", bio: "" });
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
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
      toast.error("Failed to save profile.");
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
      ).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
      await saveProfile.mutateAsync({ ...profile, profilePic: blob });
      setUploadProgress(null);
      toast.success("Profile photo updated! 📸");
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    } catch {
      setUploadProgress(null);
      toast.error("Failed to upload photo.");
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

  if (!identity) {
    return (
      <main
        className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center"
        data-ocid="profile.section"
      >
        <div className="text-6xl animate-float">👤</div>
        <h2 className="text-2xl font-bold">Login to view your profile</h2>
        <p className="text-muted-foreground">
          Connect with Internet Identity to access your profile and rewards.
        </p>
        <Button
          className="btn-pink px-8 py-3 h-auto"
          onClick={login}
          data-ocid="profile.login.button"
        >
          😍 Login to Play
        </Button>
        <Button
          variant="ghost"
          className="btn-violet px-8 py-3 h-auto"
          onClick={() => onNavigate("hunt")}
        >
          🍀 Browse Hunt (No Login)
        </Button>
      </main>
    );
  }

  const displayData = profile ?? {
    username: "new_user",
    displayName: "New User",
    bio: "Waifu hunter in training!",
    balance: 0n,
    joinDate: BigInt(Date.now()),
    profilePic: ExternalBlob.fromURL(""),
  };

  const haremCount = harem?.length ?? 0;
  const favoriteCount = harem?.filter((h) => h.isFavorite).length ?? 0;
  const joinDate = new Date(
    Number(displayData.joinDate) / 1_000_000,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const STATS = [
    {
      label: "Waifus",
      value: haremCount,
      icon: "🎴",
      color: "oklch(0.75 0.22 330)",
    },
    {
      label: "Favorites",
      value: favoriteCount,
      icon: "💝",
      color: "oklch(0.67 0.26 330)",
    },
    {
      label: "Onex",
      value: Number(displayData.balance).toLocaleString(),
      icon: "💰",
      color: "oklch(0.82 0.15 75)",
    },
  ];

  const hasPhoto = !!displayData.profilePic?.getDirectURL?.();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8" data-ocid="profile.section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="card-glass rounded-3xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                className="w-20 h-20"
                style={{
                  border: "3px solid oklch(0.67 0.26 330 / 0.6)",
                  boxShadow: "0 0 20px oklch(0.67 0.26 330 / 0.3)",
                }}
              >
                <AvatarImage src={displayData.profilePic?.getDirectURL?.()} />
                <AvatarFallback
                  className="text-2xl font-bold"
                  style={{
                    background: "oklch(0.20 0.05 290)",
                    color: "oklch(0.75 0.22 330)",
                  }}
                >
                  {displayData.displayName?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />

              {/* Upload photo button */}
              <button
                type="button"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: "oklch(0.67 0.26 330)",
                  boxShadow: "0 2px 8px oklch(0.67 0.26 330 / 0.4)",
                }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadProgress !== null || deletingPhoto}
                data-ocid="profile.upload_button"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>

              {/* Delete photo button */}
              {hasPhoto && (
                <button
                  type="button"
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: "oklch(0.55 0.22 22)",
                    boxShadow: "0 2px 6px oklch(0.55 0.22 22 / 0.5)",
                  }}
                  onClick={handleDeletePhoto}
                  disabled={deletingPhoto || uploadProgress !== null}
                  data-ocid="profile.delete_photo_button"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              )}

              {uploadProgress !== null && (
                <div
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                  style={{ color: "oklch(0.82 0.15 205)" }}
                  data-ocid="profile.upload.loading_state"
                >
                  {uploadProgress}%
                </div>
              )}
            </div>

            {/* Names */}
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="display-name"
                      className="text-xs text-muted-foreground"
                    >
                      Display Name
                    </label>
                    <Input
                      id="display-name"
                      value={form.displayName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, displayName: e.target.value }))
                      }
                      className="mt-1 h-9"
                      style={{ background: "oklch(0.10 0.025 290)" }}
                      data-ocid="profile.display_name.input"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="username"
                      className="text-xs text-muted-foreground"
                    >
                      Username
                    </label>
                    <Input
                      id="username"
                      value={form.username}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, username: e.target.value }))
                      }
                      className="mt-1 h-9"
                      style={{ background: "oklch(0.10 0.025 290)" }}
                      data-ocid="profile.username.input"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-extrabold text-foreground">
                    {displayData.displayName || "New User"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    @{displayData.username || "new_user"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined {joinDate}
                  </p>
                </>
              )}
            </div>

            {/* Edit buttons */}
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="btn-violet"
                    onClick={() => setEditing(false)}
                    data-ocid="profile.cancel.button"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="btn-pink"
                    onClick={handleSave}
                    disabled={saveProfile.isPending}
                    data-ocid="profile.save.button"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />{" "}
                    {saveProfile.isPending ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="btn-violet"
                  onClick={() => setEditing(true)}
                  data-ocid="profile.edit.button"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                </Button>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mt-5">
            {editing ? (
              <>
                <label htmlFor="bio" className="text-xs text-muted-foreground">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  className="mt-1 resize-none"
                  rows={3}
                  style={{ background: "oklch(0.10 0.025 290)" }}
                  data-ocid="profile.bio.textarea"
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {displayData.bio || "No bio yet — add one!"}
              </p>
            )}
          </div>

          {/* Principal */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Principal ID:{" "}
              <span className="font-mono text-xs opacity-70 break-all">
                {identity.getPrincipal().toString()}
              </span>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="card-glass rounded-2xl p-4 text-center"
              style={{ border: `1px solid ${stat.color}33` }}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div
                className="text-xl font-extrabold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="btn-pink h-11" onClick={() => onNavigate("harem")}>
            🎴 My Harem
          </Button>
          <Button
            className="btn-violet h-11"
            onClick={() => onNavigate("hunt")}
          >
            🍀 Go Hunt
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
