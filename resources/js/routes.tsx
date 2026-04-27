import React, { useState, useEffect } from "react";
import { createBrowserRouter, Outlet, Navigate, useLocation, useNavigate } from "react-router";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Dashboard } from "@/pages/Dashboard";
import { Agenda } from "@/pages/Agenda";
import { NewAppointment } from "@/pages/SchedulingFlow";
import { Services } from "@/pages/Services";
import { Professionals } from "@/pages/Professionals";
import { Clients } from "@/pages/Clients";
import { Login } from "@/pages/Login";
import { Onboarding } from "@/pages/Onboarding";
import { LandingPage } from "@/pages/LandingPage";
import { PublicBooking } from "@/pages/PublicBooking";
import { Subscription } from "@/pages/Subscription";
import { Settings } from "@/pages/Settings";
import { WhatsApp } from "@/pages/WhatsApp";
import { useAppNavigate, useCurrentPage } from "@/hooks/useAppNavigate";
import { motion, AnimatePresence } from "motion/react";

// ============================
// Root Layout - applies theme
// ============================
function RootLayout() {
  const { businessSettings } = useAppData();

  useEffect(() => {
    const root = document.documentElement;
    if (businessSettings.themeMode === "dark") {
      root.classList.add("dark");
    } else if (businessSettings.themeMode === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) root.classList.add("dark");
        else root.classList.remove("dark");
      };
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [businessSettings.themeMode]);

  return <Outlet />;
}

// ============================
// Landing Page Route
// ============================
function LandingRoute() {
  const { isAuthenticated, hasOnboarded } = useAuth();
  const nav = useNavigate();

  if (isAuthenticated && hasOnboarded) {
    return <Navigate to="/inicio" replace />;
  }
  if (isAuthenticated && !hasOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <LandingPage
      onLogin={() => nav("/login")}
      onSignup={() => nav("/login?mode=signup")}
    />
  );
}

// ============================
// Login Route
// ============================
function LoginRoute() {
  const { isAuthenticated, hasOnboarded, handleLogin, handleSignup, handleDemoLogin } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialMode = params.get("mode") === "signup" ? "signup" : "login";

  if (isAuthenticated && hasOnboarded) {
    return <Navigate to="/inicio" replace />;
  }
  if (isAuthenticated && !hasOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Login
      onLogin={handleLogin}
      onSignup={handleSignup}
      onDemoLogin={handleDemoLogin}
      initialMode={initialMode as "login" | "signup"}
    />
  );
}

// ============================
// Onboarding Route
// ============================
function OnboardingRoute() {
  const { isAuthenticated, hasOnboarded, handleOnboardingComplete } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (hasOnboarded) {
    return <Navigate to="/inicio" replace />;
  }

  return (
    <Onboarding onComplete={handleOnboardingComplete} />
  );
}

// ============================
// Public Booking Route
// ============================
function PublicBookingRoute() {
  const nav = useNavigate();
  return <PublicBooking onBack={() => nav(-1)} />;
}

// ============================
// Auth Guard
// ============================
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasOnboarded } = useAuth();
  const { dataLoaded } = useAppData();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!hasOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!dataLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f1218]">
        <div className="text-center">
          <div className="flex gap-1.5 justify-center mb-4">
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ============================
// Protected Layout - wraps authenticated pages with AppShell
// ============================
function ProtectedLayout() {
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const currentPage = useCurrentPage();
  const location = useLocation();

  // Listen for "open-new-appointment" custom event
  useEffect(() => {
    const handler = () => setIsNewAppointmentOpen(true);
    window.addEventListener("open-new-appointment", handler);
    return () => window.removeEventListener("open-new-appointment", handler);
  }, []);

  return (
    <RequireAuth>
      <AppShell>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`w-full ${currentPage === "whatsapp" ? "h-full overflow-hidden" : ""}`}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        <NewAppointment open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen} />
      </AppShell>
    </RequireAuth>
  );
}

// ============================
// Page Route Components
// ============================
function DashboardRoute() {
  const navigate = useAppNavigate();
  const nav = useNavigate();
  return (
    <Dashboard
      onNewAppointment={() => window.dispatchEvent(new CustomEvent("open-new-appointment"))}
      onNavigate={navigate}
      onOpenPublicLink={() => nav("/agendamento-publico")}
    />
  );
}

function ClientsRoute() {
  const navigate = useAppNavigate();
  return (
    <Clients
      onNewAppointment={() => window.dispatchEvent(new CustomEvent("open-new-appointment"))}
      onNavigate={navigate}
    />
  );
}

function WhatsAppRoute() {
  const navigate = useAppNavigate();
  const location = useLocation();
  const [pendingMessage, setPendingMessage] = useState<{
    phone: string;
    contactName: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (location.state?.pendingMessage) {
      setPendingMessage(location.state.pendingMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <WhatsApp
      onNavigate={navigate}
      pendingMessage={pendingMessage}
      onClearPendingMessage={() => setPendingMessage(null)}
    />
  );
}

function SettingsRoute() {
  const navigate = useAppNavigate();
  const nav = useNavigate();
  const { handleLogout } = useAuth();

  return (
    <Settings
      onNavigate={navigate}
      onLogout={() => { handleLogout(); nav("/"); }}
      onOpenPublicLink={() => nav("/agendamento-publico")}
    />
  );
}

// ============================
// Router
// ============================
export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingRoute },
      { path: "login", Component: LoginRoute },
      { path: "onboarding", Component: OnboardingRoute },
      { path: "agendamento-publico", Component: PublicBookingRoute },
      {
        Component: ProtectedLayout,
        children: [
          { path: "inicio", Component: DashboardRoute },
          { path: "agenda", Component: () => <Agenda /> },
          { path: "clientes", Component: ClientsRoute },
          { path: "whatsapp", Component: WhatsAppRoute },
          { path: "servicos", Component: () => <Services /> },
          { path: "profissionais", Component: () => <Professionals /> },
          { path: "configuracoes", Component: SettingsRoute },
          { path: "assinatura", Component: () => <Subscription /> },
        ],
      },
      { path: "*", Component: () => <Navigate to="/" replace /> },
    ],
  },
]);