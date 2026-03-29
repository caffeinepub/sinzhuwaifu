import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

interface GoogleLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GoogleLoginModal({
  open,
  onClose,
  onSuccess,
}: GoogleLoginModalProps) {
  const { loginDemo } = useGoogleAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "name">("email");
  const [error, setError] = useState("");

  const handleEmailNext = () => {
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setStep("name");
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    loginDemo(name.trim(), email.trim());
    onSuccess?.();
    onClose();
    setName("");
    setEmail("");
    setStep("email");
    setError("");
  };

  const handleClose = () => {
    onClose();
    setName("");
    setEmail("");
    setStep("email");
    setError("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.22 }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: "min(360px, 92vw)" }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#1e2c3a",
                border: "1px solid #2b3d54",
                boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              }}
            >
              {/* Google header */}
              <div
                className="flex flex-col items-center gap-2 px-6 pt-6 pb-4"
                style={{ borderBottom: "1px solid #2b3d54" }}
              >
                {/* Google logo */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span style={{ fontSize: 22 }}>G</span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#8eacbb" }}
                  >
                    Sign in with Google
                  </span>
                </div>
                <p className="text-xs text-center" style={{ color: "#5a7a8e" }}>
                  Use your Google Account to sign in to SinzhuWaifu
                </p>
              </div>

              {/* Form */}
              <div className="px-6 py-5 flex flex-col gap-4">
                {step === "email" ? (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="google-email"
                        className="text-xs font-semibold"
                        style={{ color: "#8eacbb" }}
                      >
                        Email or phone
                      </label>
                      <input
                        id="google-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleEmailNext()
                        }
                        className="rounded-xl px-4 py-3 text-sm outline-none w-full"
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
                    <div className="flex items-center justify-between">
                      <a
                        href="https://accounts.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs"
                        style={{ color: "#5288c1" }}
                      >
                        Create account
                      </a>
                      <button
                        type="button"
                        onClick={handleEmailNext}
                        className="px-5 py-2 rounded-xl font-bold text-white text-sm"
                        style={{ background: "#5288c1" }}
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{
                        background: "#0e1621",
                        border: "1px solid #2b3d54",
                      }}
                    >
                      <span className="text-xs" style={{ color: "#8eacbb" }}>
                        {email}
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep("email")}
                        className="ml-auto text-xs"
                        style={{ color: "#5288c1" }}
                      >
                        Change
                      </button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="google-name"
                        className="text-xs font-semibold"
                        style={{ color: "#8eacbb" }}
                      >
                        Your Name
                      </label>
                      <input
                        id="google-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        className="rounded-xl px-4 py-3 text-sm outline-none w-full"
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
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep("email")}
                        className="text-xs"
                        style={{ color: "#5288c1" }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-5 py-2 rounded-xl font-bold text-white text-sm"
                        style={{ background: "#5288c1" }}
                      >
                        Sign In
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Divider */}
              <div
                className="px-6 py-3 text-center text-xs"
                style={{
                  borderTop: "1px solid #2b3d54",
                  color: "#4a6278",
                }}
              >
                Your info will only be used in this app
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
