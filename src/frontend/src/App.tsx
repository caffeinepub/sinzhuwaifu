import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import TelegramProfile from "./components/TelegramProfile";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import Admin from "./pages/Admin";
import CheckPage from "./pages/CheckPage";
import Daily from "./pages/Daily";
import GiftPage from "./pages/GiftPage";
import Harem from "./pages/Harem";
import HclaimPage from "./pages/HclaimPage";
import Leaderboard from "./pages/Leaderboard";
import PayPage from "./pages/PayPage";
import RankPage from "./pages/RankPage";
import Shop from "./pages/Shop";
import TopGroupsPage from "./pages/TopGroupsPage";
import TopPage from "./pages/TopPage";
import TopsPage from "./pages/TopsPage";
import TreasurePage from "./pages/TreasurePage";
import WaifuPass from "./pages/WaifuPass";
import WelkinPage from "./pages/WelkinPage";

export type GamePage =
  | "harem"
  | "shop"
  | "daily"
  | "leaderboard"
  | "admin"
  | "waifupass"
  | "rank"
  | "gift"
  | "check"
  | "pay"
  | "top"
  | "topgroups"
  | "tops"
  | "welkin"
  | "treasure"
  | "hclaim";

export type ChatView =
  | { type: "welcome" }
  | { type: "group"; groupName: string }
  | { type: "dm"; principalStr: string }
  | { type: "game"; page: GamePage }
  | { type: "profile" };

type AnyPage = string;

function LoadingScreen() {
  return (
    <div
      className="flex h-screen w-screen items-center justify-center"
      style={{ background: "#17212b" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "#2481cc", borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: "#8eacbb" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div
      className="flex h-screen w-screen items-center justify-center"
      style={{ background: "#0e1621" }}
      data-ocid="login.panel"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-5 px-6"
        style={{ maxWidth: 360, width: "100%" }}
      >
        {/* Logo */}
        <div
          className="w-20 h-20 rounded-full overflow-hidden"
          style={{
            boxShadow: "0 0 0 3px #2481cc, 0 0 20px 4px rgba(36,129,204,0.35)",
          }}
        >
          <img
            src="https://files.catbox.moe/lasj0e.jpg"
            alt="SinzhuWaifu Logo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* App name */}
        <div className="flex flex-col items-center gap-1">
          <h1
            className="text-2xl font-bold text-center"
            style={{
              background:
                "linear-gradient(90deg, #ffffff 0%, #54c2f0 60%, #2481cc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.3,
            }}
          >
            🍀 sɪɴᴢʜᴜ ᴡᴀɪғᴜ ʙᴏᴛ 🍭
          </h1>
          <p className="text-sm" style={{ color: "#8eacbb" }}>
            Sign in to continue
          </p>
        </div>

        {/* Login button */}
        <button
          type="button"
          onClick={onLogin}
          data-ocid="login.primary_button"
          className="w-full rounded-xl py-3 text-white font-semibold text-base transition-opacity hover:opacity-90 active:opacity-75"
          style={{ background: "#2481cc", maxWidth: 320 }}
        >
          🔑 Login with Google
        </button>

        {/* Powered by note */}
        <p className="text-xs" style={{ color: "#4a6378" }}>
          Powered by Internet Identity
        </p>
      </motion.div>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing, login } = useInternetIdentity();
  const [activeView, setActiveView] = useState<ChatView>({ type: "welcome" });
  const [showSidebar, setShowSidebar] = useState(true);

  // Auth gate
  if (isInitializing) {
    return <LoadingScreen />;
  }

  const isAnon = !identity || identity.getPrincipal().isAnonymous();
  if (isAnon) {
    return <LoginScreen onLogin={login} />;
  }

  const handleSelectChat = (view: ChatView) => {
    setActiveView(view);
    setShowSidebar(false);
  };

  const handleBack = () => {
    setShowSidebar(true);
  };

  const handleNavigate = (page: AnyPage) => {
    if (page === "profile") {
      setActiveView({ type: "profile" });
      setShowSidebar(false);
    } else if (page === "community" || page === "home") {
      setActiveView({ type: "welcome" });
      setShowSidebar(true);
    } else {
      const gamePage = page as GamePage;
      setActiveView({ type: "game", page: gamePage });
      setShowSidebar(false);
    }
  };

  const renderMainPanel = () => {
    if (activeView.type === "profile") {
      return (
        <TelegramProfile onBack={handleBack} onNavigate={handleNavigate} />
      );
    }

    if (activeView.type === "game") {
      const wrapperClass = "flex flex-col h-full overflow-y-auto";
      const nav = handleNavigate as (page: any) => void;
      switch (activeView.page) {
        case "harem":
          return (
            <div className={wrapperClass}>
              <Harem onNavigate={nav} />
            </div>
          );
        case "shop":
          return (
            <div className={wrapperClass}>
              <Shop onNavigate={nav} />
            </div>
          );
        case "daily":
          return (
            <div className={wrapperClass}>
              <Daily onNavigate={nav} />
            </div>
          );
        case "leaderboard":
          return (
            <div className={wrapperClass}>
              <Leaderboard onNavigate={nav} />
            </div>
          );
        case "admin":
          return (
            <div className={wrapperClass}>
              <Admin />
            </div>
          );
        case "waifupass":
          return (
            <div className={wrapperClass}>
              <WaifuPass onNavigate={nav} />
            </div>
          );
        case "rank":
          return (
            <div className={wrapperClass}>
              <RankPage onNavigate={nav} />
            </div>
          );
        case "gift":
          return (
            <div className={wrapperClass}>
              <GiftPage onNavigate={nav} />
            </div>
          );
        case "check":
          return (
            <div className={wrapperClass}>
              <CheckPage onNavigate={nav} />
            </div>
          );
        case "pay":
          return (
            <div className={wrapperClass}>
              <PayPage onNavigate={nav} />
            </div>
          );
        case "top":
          return (
            <div className={wrapperClass}>
              <TopPage onNavigate={nav} />
            </div>
          );
        case "topgroups":
          return (
            <div className={wrapperClass}>
              <TopGroupsPage onNavigate={nav} />
            </div>
          );
        case "tops":
          return (
            <div className={wrapperClass}>
              <TopsPage onNavigate={nav} />
            </div>
          );
        case "welkin":
          return (
            <div className={wrapperClass}>
              <WelkinPage onNavigate={nav} />
            </div>
          );
        case "treasure":
          return (
            <div className={wrapperClass}>
              <TreasurePage onNavigate={nav} />
            </div>
          );
        case "hclaim":
          return (
            <div className={wrapperClass}>
              <HclaimPage onNavigate={nav} />
            </div>
          );
      }
    }

    if (activeView.type === "group" || activeView.type === "dm") {
      return (
        <ChatWindow
          activeView={activeView}
          onBack={handleBack}
          onNavigate={handleNavigate}
        />
      );
    }

    // welcome / empty state — Telegram-style empty right panel
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center h-full select-none"
        style={{ background: "#17212b" }}
      >
        <div className="flex flex-col items-center gap-3 opacity-30">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ border: "2px solid #8eacbb" }}
            aria-hidden="true"
          >
            <span style={{ fontSize: 28, lineHeight: 1 }}>💬</span>
          </div>
          <p className="text-sm" style={{ color: "#8eacbb" }}>
            Select a chat to start messaging
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: "#17212b" }}
    >
      <div
        className={[
          "flex-shrink-0 flex-col",
          "md:flex md:w-80",
          showSidebar ? "flex w-full" : "hidden",
        ].join(" ")}
        style={{ background: "#0e1621", borderRight: "1px solid #1c2733" }}
      >
        <ChatSidebar
          activeView={activeView}
          onSelectChat={handleSelectChat}
          onOpenProfile={() => {
            setActiveView({ type: "profile" });
            setShowSidebar(false);
          }}
        />
      </div>

      <div
        className={[
          "flex-1 flex-col overflow-hidden",
          "md:flex",
          showSidebar ? "hidden" : "flex w-full",
        ].join(" ")}
        style={{ background: "#17212b" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={JSON.stringify(activeView)}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-hidden h-full"
          >
            {renderMainPanel()}
          </motion.div>
        </AnimatePresence>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1c2733",
            border: "1px solid #2b3d54",
            color: "#e8f4fd",
          },
        }}
      />
    </div>
  );
}
