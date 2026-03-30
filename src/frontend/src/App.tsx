import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import LoginModal from "./components/LoginModal";
import TelegramProfile from "./components/TelegramProfile";
import { useLocalAuth } from "./hooks/useLocalAuth";
import { useAds } from "./hooks/useQueries";
import Admin from "./pages/Admin";
import CheckPage from "./pages/CheckPage";
import CouponPage from "./pages/CouponPage";
import Daily from "./pages/Daily";
import GiftPage from "./pages/GiftPage";
import Harem from "./pages/Harem";
import HclaimPage from "./pages/HclaimPage";
import Leaderboard from "./pages/Leaderboard";
import PayPage from "./pages/PayPage";
import RankPage from "./pages/RankPage";
import ReferPage from "./pages/ReferPage";
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
  | "hclaim"
  | "coupon"
  | "refer";

export type ChatView =
  | { type: "welcome" }
  | { type: "group"; groupName: string }
  | { type: "dm"; principalStr: string }
  | { type: "game"; page: GamePage }
  | { type: "profile" };

type AnyPage = string;

function FreefireLoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let start: number | null = null;
    let rafId: number;
    const duration = 2500;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        rafId = requestAnimationFrame(step);
      } else {
        setTimeout(() => {
          setDone(true);
          setTimeout(() => onDoneRef.current(), 450);
        }, 200);
      }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "#0a0a0a" }}
      animate={done ? { x: "100%" } : { x: 0 }}
      transition={{ duration: 0.4, ease: "easeIn" }}
    >
      <div className="flex flex-col items-center gap-4">
        <img
          src="https://files.catbox.moe/lasj0e.jpg"
          alt="SinzhuWaifu"
          className="w-[200px] h-[200px] rounded-full object-cover shadow-2xl"
          style={{ border: "3px solid #ff8c00" }}
        />
        <p className="text-white text-2xl font-extrabold tracking-widest mt-2">
          SinzhuWaifu
        </p>
        <p className="text-xs" style={{ color: "#888" }}>
          Loading your world...
        </p>
      </div>
      <div className="absolute bottom-12 left-0 right-0 px-8">
        <div
          className="w-full h-1.5 rounded-full"
          style={{ background: "#1a1a1a" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #ff6600, #ffcc00)",
            }}
          />
        </div>
        <p className="text-xs text-center mt-2" style={{ color: "#666" }}>
          {Math.round(progress)}%
        </p>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    if (sessionStorage.getItem("sinzhu_splash_shown")) return false;
    return true;
  });

  const handleSplashDone = () => {
    sessionStorage.setItem("sinzhu_splash_shown", "true");
    setShowSplash(false);
  };

  const localAuth = useLocalAuth();
  const [loggedIn, setLoggedIn] = useState(
    () => !!localStorage.getItem("sinzhu_local_auth"),
  );

  const { data: ads = [] } = useAds();
  const [adsEnabledState] = useState(
    () => localStorage.getItem("sinzhu_ads_enabled") !== "false",
  );
  const [adPopupDismissed, setAdPopupDismissed] = useState(() => {
    return sessionStorage.getItem("sinzhu_ad_popup_shown") === "true";
  });
  const showAdPopup = adsEnabledState && !adPopupDismissed && ads.length > 0;
  const handleDismissAd = () => {
    sessionStorage.setItem("sinzhu_ad_popup_shown", "true");
    setAdPopupDismissed(true);
  };
  const [activeView, setActiveView] = useState<ChatView>({ type: "welcome" });
  const [showSidebar, setShowSidebar] = useState(true);

  // Suppress unused var warning — localAuth is used for type safety
  void localAuth;

  // Splash screen
  if (showSplash) {
    return (
      <AnimatePresence>
        <FreefireLoadingScreen onDone={handleSplashDone} />
      </AnimatePresence>
    );
  }

  // Auth gate
  if (!loggedIn) {
    return <LoginModal onSuccess={() => setLoggedIn(true)} />;
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
              <Admin onNavigate={nav} />
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
        case "coupon":
          return (
            <div className={wrapperClass}>
              <CouponPage onNavigate={nav} />
            </div>
          );
        case "refer":
          return (
            <div className={wrapperClass}>
              <ReferPage onNavigate={nav} />
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
      {showAdPopup && (
        <div
          className="fixed inset-0 z-[9990] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={handleDismissAd}
          onKeyDown={(e) => e.key === "Escape" && handleDismissAd()}
          tabIndex={-1}
        >
          <div
            className="relative max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <button
              type="button"
              onClick={handleDismissAd}
              className="absolute -top-3 -right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
              style={{ background: "#e05555", fontSize: 16 }}
              aria-label="Close ad"
            >
              ✕
            </button>
            {ads[0].link ? (
              <a href={ads[0].link} target="_blank" rel="noopener noreferrer">
                <img
                  src={ads[0].imageUrl}
                  alt={ads[0].title || "Ad"}
                  className="w-full rounded-xl object-cover"
                  style={{ maxHeight: 400 }}
                />
              </a>
            ) : (
              <img
                src={ads[0].imageUrl}
                alt={ads[0].title || "Ad"}
                className="w-full rounded-xl object-cover"
                style={{ maxHeight: 400 }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
