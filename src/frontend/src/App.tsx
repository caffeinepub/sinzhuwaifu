import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import GoogleLoginModal from "./components/GoogleLoginModal";
import TelegramProfile from "./components/TelegramProfile";
import { useGoogleAuth } from "./hooks/useGoogleAuth";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
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

function GoogleColorIcon() {
  return (
    <svg
      width="18"
      height="18"
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

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [showGoogleModal, setShowGoogleModal] = useState(false);

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

        {/* Google Login button */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          data-ocid="login.google.button"
          className="w-full flex items-center justify-center gap-3 rounded-xl py-3 font-semibold text-sm transition-all hover:shadow-lg active:scale-95"
          style={{
            background: "#ffffff",
            color: "#3c4043",
            maxWidth: 320,
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          <GoogleColorIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div
          className="flex items-center gap-3 w-full"
          style={{ maxWidth: 320 }}
        >
          <div className="flex-1 h-px" style={{ background: "#2b3d54" }} />
          <span className="text-xs" style={{ color: "#4a6278" }}>
            or
          </span>
          <div className="flex-1 h-px" style={{ background: "#2b3d54" }} />
        </div>

        {/* Internet Identity button */}
        <button
          type="button"
          onClick={onLogin}
          data-ocid="login.primary_button"
          className="w-full rounded-xl py-2.5 text-white font-semibold text-sm transition-opacity hover:opacity-90 active:opacity-75"
          style={{ background: "#2481cc", maxWidth: 320 }}
        >
          🔑 Login with Internet Identity
        </button>

        {/* Powered by note */}
        <p className="text-xs" style={{ color: "#4a6378" }}>
          Secured by Internet Identity · Google
        </p>
      </motion.div>

      <GoogleLoginModal
        open={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={() => setShowGoogleModal(false)}
      />
    </div>
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
  const { identity, isInitializing, login } = useInternetIdentity();
  const googleAuth = useGoogleAuth();
  const [activeView, setActiveView] = useState<ChatView>({ type: "welcome" });
  const [showSidebar, setShowSidebar] = useState(true);

  // Splash screen
  if (showSplash) {
    return (
      <AnimatePresence>
        <FreefireLoadingScreen onDone={handleSplashDone} />
      </AnimatePresence>
    );
  }

  // Auth gate
  if (isInitializing) {
    return <LoadingScreen />;
  }

  const isAnon = !identity || identity.getPrincipal().isAnonymous();
  const isLoggedIn = !isAnon || !!googleAuth.user;

  if (!isLoggedIn) {
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
    </div>
  );
}
