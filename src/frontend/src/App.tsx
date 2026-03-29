import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import TelegramProfile from "./components/TelegramProfile";
import Admin from "./pages/Admin";
import Daily from "./pages/Daily";
import Harem from "./pages/Harem";
import Hunt from "./pages/Hunt";
import Leaderboard from "./pages/Leaderboard";
import Shop from "./pages/Shop";

export type GamePage =
  | "hunt"
  | "harem"
  | "shop"
  | "daily"
  | "leaderboard"
  | "admin";

export type ChatView =
  | { type: "welcome" }
  | { type: "group"; groupName: string }
  | { type: "dm"; principalStr: string }
  | { type: "game"; page: GamePage }
  | { type: "profile" };

type AnyPage = string;

export default function App() {
  const [activeView, setActiveView] = useState<ChatView>({ type: "welcome" });
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSelectChat = (view: ChatView) => {
    setActiveView(view);
    setShowSidebar(false);
  };

  const handleBack = () => {
    setShowSidebar(true);
  };

  // Universal navigation handler compatible with pages' (page: Page) => void
  const handleNavigate = (page: AnyPage) => {
    if (page === "profile") {
      setActiveView({ type: "profile" });
      setShowSidebar(false);
    } else if (page === "community") {
      setActiveView({ type: "welcome" });
      setShowSidebar(false);
    } else if (page === "home") {
      setActiveView({ type: "welcome" });
      setShowSidebar(false);
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
      // Cast to any to satisfy pages' local Page type — safe since handleNavigate handles all values
      const nav = handleNavigate as (page: any) => void;
      switch (activeView.page) {
        case "hunt":
          return (
            <div className={wrapperClass}>
              <Hunt onNavigate={nav} />
            </div>
          );
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
      }
    }

    if (activeView.type === "group" || activeView.type === "dm") {
      return <ChatWindow activeView={activeView} onBack={handleBack} />;
    }

    // Welcome screen
    return <WelcomeScreen onNavigate={handleNavigate} />;
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: "#17212b" }}
    >
      {/* Sidebar */}
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

      {/* Main Panel */}
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

function WelcomeScreen({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 px-6 text-center"
      >
        <style>{`
          @keyframes shimmer-sky {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes float-rainbow {
            0%, 100% { transform: translateY(-50%) rotate(0deg); }
            50% { transform: translateY(calc(-50% - 8px)) rotate(12deg); }
          }
          @keyframes rain-drop {
            0% { opacity: 1; transform: translateY(0px); }
            100% { opacity: 0; transform: translateY(28px); }
          }
          @keyframes float-cloud {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(7px); }
          }
        `}</style>

        <div className="relative inline-block" style={{ padding: "8px 52px" }}>
          <span
            style={{
              position: "absolute",
              left: 4,
              top: "50%",
              fontSize: 24,
              animation: "float-rainbow 3s ease-in-out infinite",
              display: "inline-block",
            }}
          >
            🌈
          </span>
          <span
            style={{
              position: "absolute",
              right: 0,
              top: -4,
              fontSize: 18,
              animation: "float-cloud 4s ease-in-out infinite",
              display: "inline-block",
            }}
          >
            ☁️
          </span>
          <span
            style={{
              position: "absolute",
              right: 14,
              bottom: 2,
              fontSize: 14,
              animation: "rain-drop 1.3s ease-in infinite",
              display: "inline-block",
            }}
          >
            💧
          </span>
          <span
            style={{
              position: "absolute",
              right: 28,
              bottom: 6,
              fontSize: 11,
              animation: "rain-drop 1.3s ease-in 0.45s infinite",
              display: "inline-block",
            }}
          >
            💧
          </span>
          <h1
            className="text-5xl font-extrabold tracking-wide"
            style={{
              background:
                "linear-gradient(90deg, #ffffff, #87CEEB, #00BFFF, #e0f7ff, #ffffff)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer-sky 3s linear infinite",
              filter:
                "drop-shadow(0 0 10px rgba(135,206,235,0.95)) drop-shadow(0 0 22px rgba(0,191,255,0.6))",
            }}
          >
            Sinzhu Wafu
          </h1>
        </div>

        <p style={{ color: "#8eacbb" }} className="text-sm">
          Collect. Hunt. Dominate.
        </p>

        <img
          src="https://files.catbox.moe/vakg13.jpg"
          alt="SinzhuWaifu"
          className="w-24 h-24 rounded-full object-cover"
          style={{
            border: "3px solid #5288c1",
            boxShadow: "0 0 20px rgba(82,136,193,0.4)",
          }}
        />

        <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
          <button
            type="button"
            onClick={() => onNavigate("hunt")}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:brightness-110"
            style={{ background: "#5288c1" }}
            data-ocid="welcome.hunt.primary_button"
          >
            🎯 Start Hunting
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onNavigate("harem")}
              className="py-2.5 rounded-xl font-semibold text-white transition-all hover:brightness-110"
              style={{ background: "#1c2f45" }}
              data-ocid="welcome.harem.secondary_button"
            >
              💝 Harem
            </button>
            <button
              type="button"
              onClick={() => onNavigate("daily")}
              className="py-2.5 rounded-xl font-semibold text-white transition-all hover:brightness-110"
              style={{ background: "#1c2f45" }}
              data-ocid="welcome.daily.secondary_button"
            >
              ⭐ Daily
            </button>
          </div>
        </div>

        <p className="text-xs mt-4" style={{ color: "#4a6278" }}>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#5288c1" }}
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
