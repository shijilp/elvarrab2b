"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

//import { api } from "@/lib/api"; // <-- use the single axios client
interface JWTPayload {
  username: string;
  is_staff: boolean;
  email?: string; // 👈 added
  exp: number;
}

interface User {
  username: string;
  isAdmin: boolean;
  email?: string; // 👈 added
  access: string; // renamed from 'token' for clarity
  refresh?: string; // optional if you want auto-refresh
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  googleLogin: (idToken: string) => Promise<void>;
  refreshAccess?: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const saveUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem("user", JSON.stringify(u));
      setAuthToken(u.access);
    } else {
      localStorage.removeItem("user");
      setAuthToken(null);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);
      setAuthToken(parsed.token);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/token/`,
        {
          username,
          password,
        }
      );

      const access = res.data.access as string;
      const refresh = res.data.refresh as string | undefined;
      const payload: JWTPayload = jwtDecode(access);

      const loggedInUser: User = {
        username: payload.username,
        isAdmin: !!payload.is_staff,
        email: payload.email ?? res.data.email,
        access,
        refresh,
      };

      setUser(loggedInUser);
      setLoading(false);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      //setAuthToken(access);
    } catch (err) {
      throw new Error("Invalid credentials");
    }
  };

  const googleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/google/`,
        { id_token: idToken }
      );
      const { access, refresh, user: profile } = res.data;

      const payload: JWTPayload = jwtDecode(access);
      const loggedInUser: User = {
        username: profile?.username ?? payload.username,
        isAdmin: !!payload.is_staff,
        email: profile?.email ?? payload.email,
        access,
        refresh,
      };
      saveUser(loggedInUser);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  // Optional: silent refresh
  const refreshAccess = async (): Promise<string | null> => {
    if (!user?.refresh) return null;
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`,
        { refresh: user.refresh }
      );
      const access = res.data.access as string;
      const updated: User = { ...user, access };
      saveUser(updated);
      return access;
    } catch {
      // refresh failed → logout
      saveUser(null);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.replace("/login");
    //setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, googleLogin, refreshAccess }}
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
