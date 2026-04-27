import React, { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, CalendarClock, AlertCircle, XCircle, Clock, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppData, AppNotification } from "@/context/AppDataContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/components/ui/utils";
import { createPortal } from "react-dom";

function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  switch (type) {
    case "new_pending":
      return (
        <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
      );
    case "confirmed":
      return (
        <div className="p-2 rounded-full bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 shrink-0">
          <Check className="w-4 h-4" />
        </div>
      );
    case "cancelled":
      return (
        <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 shrink-0">
          <XCircle className="w-4 h-4" />
        </div>
      );
    case "reminder":
      return (
        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 shrink-0">
          <Clock className="w-4 h-4" />
        </div>
      );
  }
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer group",
        notification.read
          ? "bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-[#2a3142]"
          : "bg-blue-50/50 dark:bg-[#2a3142]/80 hover:bg-blue-50 dark:hover:bg-[#2a3142]"
      )}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      <NotificationIcon type={notification.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-sm truncate",
            notification.read ? "text-gray-700 dark:text-[#8895a7]" : "font-semibold text-gray-900 dark:text-[#e8ecf4]"
          )}>
            {notification.title}
          </p>
          {!notification.read && (
            <div className="w-2 h-2 rounded-full bg-[#50CAE6] shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-[#8895a7] mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: ptBR })}
        </p>
      </div>
    </motion.div>
  );
}

// Desktop popover notification center
export function NotificationBellDesktop() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, clearNotifications } = useAppData();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 bg-white dark:bg-[#232938] text-gray-500 dark:text-[#8895a7] hover:text-gray-700 dark:hover:text-[#e8ecf4] hover:bg-gray-100 dark:hover:bg-[#2a3142] rounded-xl border border-gray-200 dark:border-[#2d3545]">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0 shadow-xl border-gray-200 dark:border-[#2d3545] dark:bg-[#232938] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#2d3545] bg-gray-50/50 dark:bg-[#2a3142]/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-500 dark:text-[#8895a7]" />
            <h3 className="font-semibold text-gray-900 dark:text-[#e8ecf4]">Notificações</h3>
            {unreadCount > 0 && (
              <span className="bg-[#50CAE6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-[#50CAE6] hover:text-[#45b0c9] hover:bg-blue-50 dark:hover:bg-[#50CAE6]/10"
                onClick={markAllNotificationsRead}
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Ler tudo
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-gray-400 dark:text-[#8895a7] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                onClick={clearNotifications}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        <ScrollArea className="max-h-[400px]">
          <div className="p-2 space-y-1">
            <AnimatePresence>
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={markNotificationRead}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-[#8895a7]">
                  <Bell className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Sem notificações</p>
                  <p className="text-xs mt-1">Você está em dia!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Mobile notification center (full screen)
export function NotificationBellMobile() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, clearNotifications } = useAppData();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2a3142] transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-[#8895a7]" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0.5 right-0.5 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-0 bg-white dark:bg-[#1a1f2b] z-[9999] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-[#2d3545] shrink-0 bg-white dark:bg-[#232938]">
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 -ml-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2a3142] transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-[#8895a7]" />
                </button>
                <div className="flex-1 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#e8ecf4]">Notificações</h3>
                  {unreadCount > 0 && (
                    <span className="bg-[#50CAE6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-[#50CAE6]"
                      onClick={markAllNotificationsRead}
                    >
                      <CheckCheck className="w-3.5 h-3.5 mr-1" />
                      Ler tudo
                    </Button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1 overscroll-contain">
                <AnimatePresence>
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <NotificationItem
                        key={n.id}
                        notification={n}
                        onRead={markNotificationRead}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-[#8895a7]">
                      <Bell className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm font-medium">Sem notificações</p>
                      <p className="text-xs mt-1">Você está em dia!</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {notifications.length > 0 && (
                <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-gray-100 dark:border-[#2d3545] shrink-0 bg-white dark:bg-[#232938]">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-gray-500 dark:text-[#8895a7] hover:text-red-500 dark:hover:text-red-400 gap-2 dark:border-[#2d3545] dark:hover:bg-red-500/10"
                    onClick={clearNotifications}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar todas
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}