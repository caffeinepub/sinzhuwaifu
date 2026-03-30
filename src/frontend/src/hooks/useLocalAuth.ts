import { useCallback, useState } from "react";

export interface LocalUser {
  id: string;
  username: string;
  password: string;
  displayName: string;
}

const AUTH_KEY = "sinzhu_local_auth";

export function useLocalAuth() {
  const [user, setUser] = useState<LocalUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(
    (
      username: string,
      password: string,
    ): { success: boolean; error?: string } => {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        // Existing user — check credentials
        const existing: LocalUser = JSON.parse(stored);
        if (existing.username === username && existing.password === password) {
          setUser(existing);
          return { success: true };
        }
        return { success: false, error: "Username ya password galat hai" };
      }
      // New user — create account
      const newUser: LocalUser = {
        id: `user_${Date.now()}`,
        username,
        password,
        displayName: username,
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
      // Also set sinzhu_profile
      const profile = {
        username,
        displayName: username,
        bio: "",
        picture: "",
      };
      localStorage.setItem("sinzhu_profile", JSON.stringify(profile));
      setUser(newUser);
      return { success: true };
    },
    [],
  );

  const resetUser = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("sinzhu_profile");
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const isExistingUser = !!localStorage.getItem(AUTH_KEY);

  return { user, login, logout, resetUser, isExistingUser };
}
