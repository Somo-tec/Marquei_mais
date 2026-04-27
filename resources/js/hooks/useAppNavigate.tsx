import { useNavigate, useLocation } from "react-router";
import { useCallback } from "react";

// Maps internal page IDs to URL routes
const PAGE_TO_ROUTE: Record<string, string> = {
  dashboard: "/inicio",
  agenda: "/agenda",
  clients: "/clientes",
  whatsapp: "/whatsapp",
  services: "/servicos",
  professionals: "/profissionais",
  settings: "/configuracoes",
  subscription: "/assinatura",
  create: "__modal__", // handled separately
};

// Maps URL paths to internal page IDs
const ROUTE_TO_PAGE: Record<string, string> = {
  "/inicio": "dashboard",
  "/agenda": "agenda",
  "/clientes": "clients",
  "/whatsapp": "whatsapp",
  "/servicos": "services",
  "/profissionais": "professionals",
  "/configuracoes": "settings",
  "/assinatura": "subscription",
};

export function pageToRoute(page: string): string {
  return PAGE_TO_ROUTE[page] || `/${page}`;
}

export function routeToPage(pathname: string): string {
  return ROUTE_TO_PAGE[pathname] || "dashboard";
}

export function useCurrentPage(): string {
  const location = useLocation();
  return routeToPage(location.pathname);
}

/**
 * Hook that provides a navigate function compatible with the old
 * onNavigate(page, data?) interface but uses React Router under the hood.
 */
export function useAppNavigate() {
  const navigate = useNavigate();

  const appNavigate = useCallback((
    page: string,
    data?: { phone: string; contactName: string; message: string }
  ) => {
    if (page === "create") {
      // This is handled by the layout via a custom event
      window.dispatchEvent(new CustomEvent("open-new-appointment"));
      return;
    }

    const route = pageToRoute(page);
    if (data) {
      navigate(route, { state: { pendingMessage: data } });
    } else {
      navigate(route);
    }
    window.scrollTo(0, 0);
  }, [navigate]);

  return appNavigate;
}
