import React from "react";
import { RouterProvider } from "react-router";
import { AppDataProvider } from "@/context/AppDataContext";
import { WhatsAppUnreadProvider } from "@/context/WhatsAppUnreadContext";
import { AuthProvider } from "@/context/AuthContext";
import { router } from "@/routes";

export default function App() {
  return (
    <AppDataProvider>
      <WhatsAppUnreadProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </WhatsAppUnreadProvider>
    </AppDataProvider>
  );
}
