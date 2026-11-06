import React from "react";
import { Logo } from "@/components/Logo";
import { NAVY, PAPER } from "./tokens";

interface HeaderProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function Header({ onLogin, onSignup }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50" style={{ background: PAPER }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2" aria-label="Marquei+">
          <Logo variant="icon" className="h-7 w-auto" />
          <span className="text-lg font-bold tracking-tight" style={{ color: NAVY }}>
            Marquei+
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.12em] md:flex" style={{ color: NAVY }}>
          <a href="#como-funciona" className="hover:opacity-60">Como funciona</a>
          <a href="#recursos" className="hover:opacity-60">Recursos</a>
          <a href="#duvidas" className="hover:opacity-60">Dúvidas</a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={onLogin}
            className="hidden rounded-full px-4 py-2 text-sm font-semibold sm:block hover:opacity-60"
            style={{ color: NAVY }}
          >
            Entrar
          </button>
          <button
            onClick={onSignup}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
            style={{ background: NAVY }}
          >
            Comece grátis
          </button>
        </div>
      </div>
    </header>
  );
}
