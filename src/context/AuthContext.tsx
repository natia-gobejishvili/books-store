import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";
import { ApiError, TOKEN_KEY } from "../services/api";
import { authService } from "../services/authService";
import type { User } from "../types/auth";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.getMe();
    setUser(currentUser);
    return currentUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        if (active) setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getMe();

        if (active) {
          setUser(currentUser);
        }
      } catch (error) {
        authService.logout();

        if (error instanceof ApiError && error.status === 0) {
        } else if (active) {
          setUser(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void initializeAuth();

    const handleExpired = () => {
      if (!active) return;
      setUser(null);
      setIsLoading(false);
      navigate("/login", {
        replace: true,
        state: { message: "სესია დასრულდა. გთხოვ, ხელახლა შეხვიდე." },
      });
    };

    window.addEventListener("auth:expired", handleExpired);

    return () => {
      active = false;
      window.removeEventListener("auth:expired", handleExpired);
    };
  }, [navigate]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    refreshUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth უნდა გამოიყენო AuthProvider-ის შიგნით.");
  }

  return context;
}
