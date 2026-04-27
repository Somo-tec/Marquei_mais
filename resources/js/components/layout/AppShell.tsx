import React, { useState } from "react";
import { Logo } from "@/components/Logo";
import { Calendar, Home, Settings, Users, Briefcase, Plus, UserCog, MoreHorizontal, ChevronRight, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { NotificationBellDesktop, NotificationBellMobile } from "@/components/NotificationCenter";
import { useWhatsAppUnread } from "@/context/WhatsAppUnreadContext";
import { useAppNavigate, useCurrentPage } from "@/hooks/useAppNavigate";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { totalUnread } = useWhatsAppUnread();
  const navigate = useAppNavigate();
  const currentPage = useCurrentPage();

  const navItems = [
    { id: "dashboard", icon: Home, label: "Inicio" },
    { id: "agenda", icon: Calendar, label: "Agenda" },
    { id: "create", icon: Plus, label: "Novo", primary: true },
    { id: "whatsapp", icon: MessageCircle, label: "WhatsApp" },
    { id: "more", icon: MoreHorizontal, label: "Mais" },
  ];

  const moreMenuItems = [
    { id: "clients", icon: Users, label: "Clientes", description: "Gerencie sua base de clientes" },
    { id: "services", icon: Briefcase, label: "Serviços", description: "Gerencie seus serviços" },
    { id: "professionals", icon: UserCog, label: "Profissionais", description: "Equipe e colaboradores" },
    { id: "settings", icon: Settings, label: "Configurações", description: "Preferências do app" },
  ];

  const handleNavClick = (id: string) => {
    if (id === "more") {
      setMoreMenuOpen(true);
    } else {
      navigate(id);
    }
  };

  const handleMoreItemClick = (id: string) => {
    setMoreMenuOpen(false);
    navigate(id);
  };

  const isMoreActive = ["clients", "services", "professionals", "settings"].includes(currentPage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1f2b] flex flex-col font-sans text-gray-900 dark:text-[#e8ecf4] transition-colors duration-300">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white/80 dark:bg-[#161b25]/90 backdrop-blur-md border-b border-gray-100 dark:border-[#2d3545] p-4 sticky top-0 z-20 flex justify-between items-center h-16 transition-all duration-200">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <Logo variant="icon" className="h-8 w-8" />
        </motion.div>
        <motion.span 
            key={currentPage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-semibold text-lg text-gray-800 dark:text-[#e8ecf4]"
        >
          {currentPage === "dashboard" && "Visão Geral"}
          {currentPage === "agenda" && "Agenda"}
          {currentPage === "clients" && "Clientes"}
          {currentPage === "settings" && "Configurações"}
          {currentPage === "services" && "Serviços"}
          {currentPage === "professionals" && "Profissionais"}
          {currentPage === "whatsapp" && "WhatsApp"}
        </motion.span>
        <NotificationBellMobile />
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#161b25] border-r border-gray-100 dark:border-[#2d3545] flex-col z-20 shadow-sm">
        <div className="p-8 flex justify-center border-b border-gray-50 dark:border-[#2d3545]">
          <Logo className="h-24 w-full" />
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
            {[
                { id: "dashboard", label: "Início", icon: Home },
                { id: "agenda", label: "Agenda", icon: Calendar },
                { id: "clients", label: "Clientes", icon: Users },
                { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
                { id: "services", label: "Serviços", icon: Briefcase },
                { id: "professionals", label: "Profissionais", icon: UserCog },
                { id: "settings", label: "Configurações", icon: Settings },
            ].map((item) => (
                <motion.div key={item.id} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                        variant={currentPage === item.id ? "secondary" : "ghost"} 
                        className={`w-full justify-start text-base h-12 transition-all duration-200 relative ${currentPage === item.id ? (item.id === "whatsapp" ? "bg-[#25D366]/10 dark:bg-[#25D366]/15 text-[#25D366]" : "bg-blue-50 dark:bg-[#50CAE6]/15 text-[#50CAE6]") : "hover:bg-gray-50 dark:hover:bg-[#232938]"}`}
                        onClick={() => navigate(item.id)}
                    >
                        <div className="relative mr-3">
                          <item.icon className={`h-5 w-5 ${currentPage === item.id ? (item.id === "whatsapp" ? "text-[#25D366]" : "text-[#50CAE6]") : (item.id === "whatsapp" ? "text-[#25D366]" : "text-gray-400")}`} />
                          {item.id === "whatsapp" && totalUnread > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-[#25D366] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                              {totalUnread > 99 ? "99+" : totalUnread}
                            </span>
                          )}
                        </div>
                        {item.label}
                    </Button>
                </motion.div>
            ))}
        </nav>

        {/* Desktop notification bell + new appointment button */}
        <div className="px-6 pb-6 pt-2 flex items-center gap-2">
            <motion.div className="flex-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                <Button className="w-full h-11 text-sm font-medium bg-[#50CAE6] hover:bg-[#45b0c9] text-white rounded-xl transition-all" onClick={() => navigate("create")}>
                    <Plus className="mr-2 h-5 w-5" /> Novo Agendamento
                </Button>
            </motion.div>
            <NotificationBellDesktop />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 transition-all duration-200">
        <div className={`w-full ${
          currentPage === "whatsapp" 
            ? "h-[calc(100vh-4rem)] lg:h-screen p-0 lg:p-4 lg:pl-0 overflow-hidden" 
            : "max-w-7xl mx-auto p-4 md:p-8 pb-24 lg:pb-8"
        }`}>
            {children}
        </div>
      </main>

      {/* Mobile "More" Bottom Sheet */}
      <AnimatePresence>
        {moreMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setMoreMenuOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#161b25] rounded-t-2xl z-[70] shadow-xl pb-safe"
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#e8ecf4]">Mais opções</h3>
                <button
                  onClick={() => setMoreMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-3">
                {moreMenuItems.map((item, index) => {
                  const isActive = currentPage === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleMoreItemClick(item.id)}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-150 ${
                        isActive
                          ? "bg-blue-50 dark:bg-[#50CAE6]/15"
                          : "hover:bg-gray-50 dark:hover:bg-[#232938] active:bg-gray-100"
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${
                        isActive
                          ? "bg-[#50CAE6]/15 text-[#50CAE6]"
                          : "bg-gray-100 dark:bg-[#2a3142] text-gray-500 dark:text-[#8895a7]"
                      }`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${
                          isActive ? "text-[#50CAE6]" : "text-gray-900 dark:text-[#e8ecf4]"
                        }`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className={`h-4 w-4 ${
                        isActive ? "text-[#50CAE6]" : "text-gray-300 dark:text-[#3d4556]"
                      }`} />
                    </motion.button>
                  );
                })}
              </div>

              {/* Bottom safe spacing */}
              <div className="h-4" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#161b25]/95 backdrop-blur-lg border-t border-gray-100 dark:border-[#2d3545] flex justify-around items-center px-2 pb-safe pt-2 h-16 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          if (item.primary) {
            return (
              <div key={item.id} className="relative -top-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNavClick(item.id)}
                  className="bg-[#50CAE6] text-white rounded-full p-4 shadow-lg shadow-blue-200 dark:shadow-[#50CAE6]/20 flex items-center justify-center h-14 w-14 border-4 border-gray-50 dark:border-[#1a1f2b] ring-4 ring-transparent hover:ring-blue-50 dark:hover:ring-[#50CAE6]/10 transition-all"
                >
                  <item.icon className="h-6 w-6" />
                </motion.button>
              </div>
            );
          }
          const isActive = item.id === "more"
            ? isMoreActive
            : currentPage === item.id;
          const isWhatsApp = item.id === "whatsapp";
          const activeColor = isWhatsApp ? "text-[#25D366]" : "text-[#50CAE6]";
          const inactiveColor = isWhatsApp ? "text-[#25D366]/60" : "text-gray-400";
          const pillColor = isWhatsApp ? "bg-[#25D366]" : "bg-[#50CAE6]";
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative`}
            >
              {isActive && (
                  <motion.div 
                    layoutId="nav-pill"
                    className={`absolute -top-2 w-8 h-1 ${pillColor}`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
              )}
              <div className="relative">
                <item.icon className={`h-6 w-6 transition-colors duration-200 ${isActive ? activeColor : inactiveColor}`} />
                {isWhatsApp && totalUnread > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-[#25D366] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? activeColor : inactiveColor}`}>
                  {item.label}
              </span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
