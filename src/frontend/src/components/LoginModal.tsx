import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useLocalAuth } from "../hooks/useLocalAuth";

interface LoginModalProps {
  onSuccess: () => void;
}

export default function LoginModal({ onSuccess }: LoginModalProps) {
  const { login, resetUser, isExistingUser } = useLocalAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);

  const handleSubmit = () => {
    if (!username.trim()) {
      setError("Username daalo");
      return;
    }
    if (!password.trim()) {
      setError("Password daalo");
      return;
    }
    const result = login(username.trim(), password.trim());
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || "Login failed");
    }
  };

  const handleReset = () => {
    resetUser();
    setUsername("");
    setPassword("");
    setError("");
    setShowReset(false);
  };

  if (showReset) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: "rgba(0,0,0,0.75)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
          style={{ maxWidth: 480 }}
        >
          <div
            style={{
              background: "#1e2c3a",
              border: "1px solid #2b3d54",
              borderRadius: "20px 20px 0 0",
              padding: "28px 24px 40px",
            }}
          >
            <p
              className="text-base font-bold mb-2 text-center"
              style={{ color: "#e8f4fd" }}
            >
              ⚠️ User Reset
            </p>
            <p
              className="text-sm text-center mb-6"
              style={{ color: "#8eacbb" }}
            >
              Iska matlab aapka pura data delete ho jaayega aur naya account ban
              jaayega. Confirm karo?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "#1a2a38", color: "#8eacbb" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "#c0392b", color: "#fff" }}
              >
                Haan, Reset Karo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: "rgba(0,0,0,0.0)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full"
          style={{ maxWidth: 480 }}
        >
          <div
            style={{
              background: "#1e2c3a",
              border: "1px solid #2b3d54",
              borderRadius: "20px 20px 0 0",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "#3a5068" }}
              />
            </div>

            {/* Header */}
            <div
              className="flex flex-col items-center gap-1 px-5 pt-2 pb-3"
              style={{ borderBottom: "1px solid #2b3d54" }}
            >
              <img
                src="https://files.catbox.moe/lasj0e.jpg"
                alt="logo"
                className="w-10 h-10 rounded-full mb-1"
                style={{ objectFit: "cover" }}
              />
              <span
                className="text-base font-bold"
                style={{ color: "#e8f4fd" }}
              >
                SinzhuWaifu
              </span>
              <p className="text-xs" style={{ color: "#5a7a8e" }}>
                {isExistingUser
                  ? "Wapas aa gaye! Login karo"
                  : "Naya account banao — username & password chuno"}
              </p>
            </div>

            {/* Form */}
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="login-username"
                  className="text-xs font-semibold"
                  style={{ color: "#8eacbb" }}
                >
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  placeholder="Apna username daalo"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoComplete="username"
                  className="rounded-xl px-4 py-2.5 text-sm outline-none w-full"
                  style={{
                    background: "#0e1621",
                    border: "1px solid #2b3d54",
                    color: "#e8f4fd",
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="login-password"
                  className="text-xs font-semibold"
                  style={{ color: "#8eacbb" }}
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Apna password daalo"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoComplete="current-password"
                  className="rounded-xl px-4 py-2.5 text-sm outline-none w-full"
                  style={{
                    background: "#0e1621",
                    border: "1px solid #2b3d54",
                    color: "#e8f4fd",
                  }}
                />
              </div>

              {error && (
                <p className="text-xs" style={{ color: "#c15252" }}>
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl font-bold text-white text-sm mt-1"
                style={{ background: "#5288c1" }}
              >
                {isExistingUser ? "Login" : "Account Banao"}
              </button>

              {isExistingUser && (
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="w-full py-2 rounded-xl text-xs"
                  style={{ color: "#c0392b", background: "transparent" }}
                >
                  🔄 Username / Password bhool gaye? Reset User
                </button>
              )}
            </div>

            <div
              className="px-5 pb-6 pt-1 text-center text-xs"
              style={{ color: "#4a6278" }}
            >
              Aapka data sirf is device pe save hoga
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
