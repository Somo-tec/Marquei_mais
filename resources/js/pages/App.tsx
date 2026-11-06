import React from "react";
import { RouterProvider } from "react-router";
import { AppDataProvider } from "@/context/AppDataContext";
import { WhatsAppUnreadProvider } from "@/context/WhatsAppUnreadContext";
import { AuthProvider } from "@/context/AuthContext";
import { router } from "@/routes";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <AppDataProvider>
      <WhatsAppUnreadProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </WhatsAppUnreadProvider>
    </AppDataProvider>
  );
}
