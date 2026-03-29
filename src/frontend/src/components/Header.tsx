import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Coins,
  LogIn,
  LogOut,
  Menu,
  Shield,
  Sword,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile, useIsAdmin } from "../hooks/useQueries";

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

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "hunt", label: "Hunt", icon: "🍀" },
  { id: "harem", label: "Harem", icon: "🎴" },
  { id: "shop", label: "Shop", icon: "🛍️" },
  { id: "daily", label: "Daily", icon: "💎" },
  { id: "leaderboard", label: "Ranks", icon: "🏆" },
  { id: "community", label: "Community", icon: "🌐" },
];

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const { data: isAdmin } = useIsAdmin();
  const isLoggedIn = !!identity;

  const navItems = isAdmin
    ? [...NAV_ITEMS, { id: "admin" as Page, label: "Admin", icon: "🛡️" }]
    : NAV_ITEMS;

  return (
    <header
      className="sticky top-0 z-50 border-b border-border"
      style={{
        background:
          "linear-gradient(to bottom, oklch(0.11 0.03 290 / 0.98), oklch(0.09 0.025 290 / 0.95))",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          type="button"
          className="flex items-center gap-2 shrink-0 cursor-pointer"
          onClick={() => onNavigate("home")}
          data-ocid="brand.link"
        >
          <div className="relative">
            <img
              src="https://files.catbox.moe/lasj0e.jpg"
              alt="SinzhuWaifu"
              className="w-9 h-9 rounded-full object-cover"
              style={{ boxShadow: "0 0 12px oklch(0.67 0.26 330 / 0.6)" }}
            />
          </div>
          <span
            className="font-extrabold text-xl hidden sm:block"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.22 330), oklch(0.82 0.15 205))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SinzhuWaifu
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`nav-link flex items-center gap-1.5 ${
                currentPage === item.id ? "active" : ""
              }`}
              data-ocid={`nav.${item.id}.link`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {isLoggedIn && profile && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{
                background: "oklch(0.82 0.15 75 / 0.12)",
                border: "1px solid oklch(0.82 0.15 75 / 0.3)",
                color: "oklch(0.85 0.15 75)",
              }}
              data-ocid="balance.panel"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{Number(profile.balance).toLocaleString()} Onex</span>
            </div>
          )}

          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate("profile")}
                className="flex items-center gap-2"
                data-ocid="profile.link"
              >
                <Avatar
                  className="w-8 h-8 cursor-pointer"
                  style={{ border: "2px solid oklch(0.67 0.26 330 / 0.6)" }}
                >
                  <AvatarImage src={profile?.profilePic?.getDirectURL()} />
                  <AvatarFallback
                    style={{
                      background: "oklch(0.20 0.05 290)",
                      color: "oklch(0.75 0.22 330)",
                    }}
                  >
                    {profile?.displayName?.[0]?.toUpperCase() ?? (
                      <User className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clear}
                className="text-muted-foreground hover:text-destructive w-8 h-8"
                data-ocid="logout.button"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              onClick={login}
              disabled={loginStatus === "logging-in"}
              className="btn-pink text-sm px-4 py-2 h-9"
              data-ocid="login.button"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              {loginStatus === "logging-in" ? "Connecting..." : "Start 😍"}
            </Button>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileOpen((v) => !v)}
            data-ocid="mobile_menu.toggle"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-border"
            style={{ background: "oklch(0.10 0.03 290 / 0.98)" }}
          >
            <div className="px-4 py-3 grid grid-cols-3 gap-2">
              {navItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all ${
                    currentPage === item.id
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  data-ocid={`mobile_nav.${item.id}.link`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
