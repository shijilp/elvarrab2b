"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { apiMe } from "@/lib/api";
import { User } from "@/types";

//import { api } from "@/lib/api"; // <-- use the single axios client
interface JWTPayload {
  username: string;
  is_staff: boolean;
  email?: string; // 👈 added
  exp: number;
}

// interface User {
//   username: string;
//   isAdmin: boolean;
//   email?: string; // 👈 added
//   //access: string; // renamed from 'token' for clarity
//   //refresh?: string; // optional if you want auto-refresh
//   role: string; // optional roles/permissions
//   first_name?: string;
//   is_email_verified?: boolean;
// }
type AuthUser = User | null;

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  initialized: boolean;
  googleLogin: (idToken: string) => Promise<void>;
  refreshAccess?: () => Promise<string | null>;
  refreshUser: () => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false); // ✅
  const router = useRouter();

  // (optional) schedule pre-expiry refresh
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRefresh = (access: string) => {
    try {
      const { exp } = jwtDecode<JWTPayload>(access);
      const ms = Math.max(exp * 1000 - Date.now() - 60_000, 5_000);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => {
        refreshAccess();
      }, ms);
    } catch {}
  };

  const saveUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem("user", JSON.stringify(u));
      // setAuthToken(u.access);
      // scheduleRefresh(u.access);
    } else {
      localStorage.removeItem("user");
      setAuthToken(null);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    }
  };
  // const saveUser = (u: User | null) => {
  //   setUser(u);
  //   if (u) {
  //     localStorage.setItem("user", JSON.stringify(u));
  //     setAuthToken(u.access);
  //   } else {
  //     localStorage.removeItem("user");
  //     setAuthToken(null);
  //   }
  // };
  const refreshUser = useCallback(async () => {
    try {
      const me = await apiMe();
      setUser(me);
      return me;
    } catch {
      // if cookie expired / not logged in
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const parsed: User = JSON.parse(saved);
        setUser(parsed);
        //setAuthToken(parsed.access); // ✅ (you already fixed this)
        //scheduleRefresh(parsed.access);
      } catch {}
    }
    setInitialized(true); // ✅ hydration done
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      // const res = await axios.post(
      //   `${process.env.NEXT_PUBLIC_API_URL}/api/token/`,
      //   { username, password }
      // );
      const res = await axios.post("/api/login", { username, password });
      const loggedInUser = res.data.user; // tokens are in httpOnly cookies
      // const access = res.data.access as string;
      // const refresh = res.data.refresh as string | undefined;
      // const payload: JWTPayload = jwtDecode(access);

      // const loggedInUser: User = {
      //   username: payload.username,
      //   isAdmin: !!payload.is_staff,
      //   email: payload.email ?? res.data.email,
      //   role: res.data.role ?? "user", // 👈 example
      //   first_name: res.data.first_name,
      //   access,
      //   refresh,
      // };

      saveUser(loggedInUser); // ✅ use central saver
    } catch {
      throw new Error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // const googleLogin = async (idToken: string) => {
  //   setLoading(true);
  //   try {
  //     const res = await axios.post(
  //       `${process.env.NEXT_PUBLIC_API_URL}/auth/google/`,
  //       { id_token: idToken }
  //     );
  //     const { access, refresh, user: profile } = res.data;

  //     const payload: JWTPayload = jwtDecode(access);
  //     const loggedInUser: User = {
  //       username: profile?.username ?? payload.username,
  //       isAdmin: !!payload.is_staff,
  //       email: profile?.email ?? payload.email,
  //       role: profile?.role ?? "user", // 👈 example
  //       first_name: profile?.first_name ?? "",
  //       access,
  //       refresh,
  //     };
  //     saveUser(loggedInUser);
  //     router.replace("/");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const googleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/login/google", { id_token: idToken });
      const profile = res.data.user as {
        username: string | null;
        isAdmin: boolean;
        email?: string | null;
        role?: string | null;
        first_name?: string | null;
      };

      // keep your existing User shape but WITHOUT tokens
      const loggedInUser: User = {
        username: profile.username ?? "",
        isAdmin: !!profile.isAdmin,
        email: profile.email ?? undefined,
        role: profile.role ?? "user",
        first_name: profile.first_name ?? "",
        // access/refresh are NOT stored in client anymore
      } as unknown as User;

      saveUser(loggedInUser);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  // Optional: silent refresh
  // const refreshAccess = async (): Promise<string | null> => {
  //   if (!user?.refresh) return null;
  //   try {
  //     const res = await axios.post(
  //       `${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`,
  //       { refresh: user.refresh }
  //     );
  //     const access = res.data.access as string;
  //     const updated: User = { ...user, access };
  //     saveUser(updated);
  //     return access;
  //   } catch {
  //     // refresh failed → logout
  //     saveUser(null);
  //     return null;
  //   }
  // };
  const refreshAccess = async (): Promise<boolean> => {
    try {
      const res = await axios.post("/api/refresh");
      return res.status === 200;
    } catch {
      saveUser(null); // logout on failure
      return false;
    }
  };

  const logout = () => {
    saveUser(null);
    router.replace("/login");
    //setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        initialized,
        googleLogin,
        refreshUser,
        //refreshAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Axios helper
export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};
