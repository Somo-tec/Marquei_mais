import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, setAuth, clearAuth, hasToken, getOrg } from "@/lib/api";
import { useAppData } from "@/context/AppDataContext";

export interface LoginCredentials {
  slug: string;
  mode: "master" | "user";
  password: string;
  email?: string;
}

export interface RegisterData {
  org_name: string;
  owner_name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  orgName: string;
  orgSlug: string;
  handleLogin: (credentials: LoginCredentials) => Promise<void>;
  handleSignup: (data: RegisterData) => Promise<{ slug: string }>;
  handleDemoLogin: (profileId: string) => void;
  handleOnboardingComplete: () => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadDemoProfile, refreshData, clearData } = useAppData();

  // Initialise synchronously from localStorage to avoid flash-redirect on reload
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasToken());
  const [hasOnboarded, setHasOnboarded] = useState(() => hasToken());
  const [orgName, setOrgName] = useState(() => getOrg()?.name ?? "");
  const [orgSlug, setOrgSlug] = useState(() => getOrg()?.slug ?? "");

  // Validate stored token in the background; clear if expired/invalid
  useEffect(() => {
    if (!hasToken()) return;

    api.auth.me()
      .then(data => {
        setOrgName(data.organization?.name ?? "");
        setOrgSlug(data.organization?.slug ?? "");
      })
      .catch(() => {
        clearAuth();
        setIsAuthenticated(false);
        setHasOnboarded(false);
        setOrgName("");
        setOrgSlug("");
      });
  }, []);

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    const res = await api.auth.login(credentials);
    setAuth(res.token, res.organization);
    setOrgName(res.organization?.name ?? "");
    setOrgSlug(res.organization?.slug ?? "");
    setIsAuthenticated(true);
    setHasOnboarded(true);
    await refreshData();
  }, [refreshData]);

  const handleSignup = useCallback(async (data: RegisterData): Promise<{ slug: string }> => {
    const res = await api.auth.register(data);
    setAuth(res.token, res.organization);
    setOrgName(res.organization?.name ?? "");
    setOrgSlug(res.organization?.slug ?? "");
    setIsAuthenticated(true);
    setHasOnboarded(false);
    await refreshData();
    return { slug: res.organization?.slug ?? "" };
  }, [refreshData]);

  const handleDemoLogin = useCallback((profileId: string) => {
    loadDemoProfile(profileId);
    setOrgName("Demo");
    setOrgSlug("demo");
    setIsAuthenticated(true);
    setHasOnboarded(true);
  }, [loadDemoProfile]);

  const handleOnboardingComplete = useCallback(() => {
    setHasOnboarded(true);
  }, []);

  const handleLogout = useCallback(() => {
    clearAuth();
    clearData();
    setIsAuthenticated(false);
    setHasOnboarded(false);
    setOrgName("");
    setOrgSlug("");
  }, [clearData]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      hasOnboarded,
      orgName,
      orgSlug,
      handleLogin,
      handleSignup,
      handleDemoLogin,
      handleOnboardingComplete,
      handleLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
