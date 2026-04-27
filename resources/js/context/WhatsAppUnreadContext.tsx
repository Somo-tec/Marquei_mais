import React, { createContext, useContext, useState, useCallback } from "react";

interface WhatsAppUnreadContextType {
  totalUnread: number;
  setTotalUnread: (count: number) => void;
}

const WhatsAppUnreadContext = createContext<WhatsAppUnreadContextType>({
  totalUnread: 0,
  setTotalUnread: () => {},
});

export function WhatsAppUnreadProvider({ children }: { children: React.ReactNode }) {
  const [totalUnread, setTotalUnreadState] = useState(0);

  const setTotalUnread = useCallback((count: number) => {
    setTotalUnreadState(count);
  }, []);

  return (
    <WhatsAppUnreadContext.Provider value={{ totalUnread, setTotalUnread }}>
      {children}
    </WhatsAppUnreadContext.Provider>
  );
}

export function useWhatsAppUnread() {
  return useContext(WhatsAppUnreadContext);
}
