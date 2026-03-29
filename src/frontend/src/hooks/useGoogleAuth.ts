import { useCallback, useEffect, useState } from "react";

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  givenName: string;
  familyName: string;
}

const STORAGE_KEY = "sinzhu_google_user";
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Replace with your actual Google Client ID

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (element: HTMLElement, config: object) => void;
          prompt: (
            callback?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void,
          ) => void;
          disableAutoSelect: () => void;
          revoke: (hint: string, callback: () => void) => void;
        };
      };
    };
    handleGoogleSignIn?: (response: { credential: string }) => void;
  }
}

function parseJwt(token: string): Record<string, string> {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById("google-gsi-script")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export function useGoogleAuth() {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const handleCredential = useCallback((credential: string) => {
    const payload = parseJwt(credential);
    if (!payload.sub) return;
    const googleUser: GoogleUser = {
      id: payload.sub,
      name: payload.name || "",
      email: payload.email || "",
      picture: payload.picture || "",
      givenName: payload.given_name || "",
      familyName: payload.family_name || "",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
    // Also update sinzhu_profile with Google info if not already set
    const existingProfile = (() => {
      try {
        return JSON.parse(localStorage.getItem("sinzhu_profile") || "null");
      } catch {
        return null;
      }
    })();
    if (!existingProfile) {
      const profile = {
        username: googleUser.email.split("@")[0].replace(/[^a-z0-9_]/gi, "_"),
        displayName: googleUser.name,
        bio: "",
        picture: googleUser.picture,
      };
      localStorage.setItem("sinzhu_profile", JSON.stringify(profile));
    }
    setUser(googleUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") {
      setGoogleReady(true);
      return;
    }
    loadGoogleScript().then(() => {
      if (!window.google) return;
      window.handleGoogleSignIn = (response: { credential: string }) => {
        handleCredential(response.credential);
      };
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }) => {
          handleCredential(response.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      setGoogleReady(true);
    });
  }, [handleCredential]);

  const login = useCallback(() => {
    if (GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") {
      // Demo mode: show a simulated Google login
      return;
    }
    setLoading(true);
    if (window.google) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setLoading(false);
        }
      });
    }
  }, []);

  const logout = useCallback(() => {
    if (window.google && user?.email) {
      window.google.accounts.id.revoke(user.email, () => {});
    }
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, [user]);

  const loginDemo = useCallback(
    (name: string, email: string, picture?: string) => {
      const googleUser: GoogleUser = {
        id: `demo_${Date.now()}`,
        name,
        email,
        picture: picture || "",
        givenName: name.split(" ")[0],
        familyName: name.split(" ").slice(1).join(" "),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
      const profile = {
        username: email.split("@")[0].replace(/[^a-z0-9_]/gi, "_"),
        displayName: name,
        bio: "",
        picture: picture || "",
      };
      localStorage.setItem("sinzhu_profile", JSON.stringify(profile));
      setUser(googleUser);
    },
    [],
  );

  return { user, loading, googleReady, login, logout, loginDemo };
}
