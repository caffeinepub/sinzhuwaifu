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
      setError("Valid email enter karein");
      return;
    }
    setError("");
    setStep("name");
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Apna naam enter karein");
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

          {/* Bottom sheet on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.22 }}
            className="fixed z-50"
            style={{
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <div
              style={{
                background: "#1e2c3a",
                border: "1px solid #2b3d54",
                borderRadius: "20px 20px 0 0",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
                maxWidth: 480,
                margin: "0 auto",
                width: "100%",
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: "#3a5068" }}
                />
              </div>

              {/* Google header */}
              <div
                className="flex flex-col items-center gap-1.5 px-5 pt-2 pb-3"
                style={{ borderBottom: "1px solid #2b3d54" }}
              >
                <div className="flex items-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 18 18"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="Google logo"
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
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#e8f4fd" }}
                  >
                    Sign in with Google
                  </span>
                </div>
                <p className="text-xs text-center" style={{ color: "#5a7a8e" }}>
                  SinzhuWaifu mein login karein
                </p>
              </div>

              {/* Form */}
              <div className="px-5 py-4 flex flex-col gap-3">
                {step === "email" ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="google-email"
                        className="text-xs font-semibold"
                        style={{ color: "#8eacbb" }}
                      >
                        Email
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
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="text-xs px-3 py-2 rounded-lg"
                        style={{ color: "#8eacbb", background: "#1a2a38" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleEmailNext}
                        className="px-6 py-2 rounded-xl font-bold text-white text-sm"
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
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="google-name"
                        className="text-xs font-semibold"
                        style={{ color: "#8eacbb" }}
                      >
                        Aapka Naam
                      </label>
                      <input
                        id="google-name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep("email")}
                        className="text-xs px-3 py-2 rounded-lg"
                        style={{ color: "#8eacbb", background: "#1a2a38" }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-6 py-2 rounded-xl font-bold text-white text-sm"
                        style={{ background: "#5288c1" }}
                      >
                        Sign In
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div
                className="px-5 pb-6 pt-1 text-center text-xs"
                style={{ color: "#4a6278" }}
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
