import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import type { LoginCredentials, RegisterData } from "@/context/AuthContext";

interface LoginProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onSignup?: (data: RegisterData) => Promise<{ slug: string }>;
  onDemoLogin?: (profileId: string) => void;
  initialMode?: "login" | "signup";
}

export function Login({ onLogin, onSignup, onDemoLogin, initialMode = "login" }: LoginProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successSlug, setSuccessSlug] = useState("");

  // Login fields
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");

  // Signup fields
  const [orgName, setOrgName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessSlug("");
    setIsLoading(true);
    try {
      if (mode === "login") {
        await onLogin({ slug: slug.trim(), mode: "master", password });
      } else if (onSignup) {
        const result = await onSignup({
          org_name: orgName.trim(),
          owner_name: ownerName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
        });
        setSuccessSlug(result.slug);
      }
    } catch (err: any) {
      setError(err.message ?? "Erro ao conectar. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    if (isDemoLoading) return;
    setIsDemoLoading(true);
    setTimeout(() => {
      onDemoLogin?.("barbearia");
    }, 600);
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
    setSuccessSlug("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start sm:justify-center p-4 pt-8 sm:pt-4 overflow-y-auto">
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="h-12 w-12 bg-[#50CAE6] rounded-xl mx-auto mb-4 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "login" ? "Acesse sua agenda" : "Crie sua conta gratis"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {mode === "login" ? "Gerencie seus agendamentos em poucos cliques" : "Comece a usar o Marquei+ hoje mesmo"}
          </p>
        </div>

        {/* Form card */}
        <Card className="p-6 border-gray-100 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="signup-fields"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Nome do estabelecimento</Label>
                    <Input
                      id="orgName"
                      placeholder="Ex: Barber King, Studio Ana..."
                      required={mode === "signup"}
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      className="bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Seu nome</Label>
                    <Input
                      id="ownerName"
                      placeholder="Nome completo"
                      required={mode === "signup"}
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      className="bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">E-mail</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      required={mode === "signup"}
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      className="bg-gray-50/50"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === "login" && (
              <div className="space-y-2">
                <Label htmlFor="slug">Identificador do estabelecimento</Label>
                <Input
                  id="slug"
                  placeholder="ex: barber-king"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  className="bg-gray-50/50"
                />
                <p className="text-xs text-gray-400">Gerado na criação da conta</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={mode === "login" ? password : signupPassword}
                  onChange={e => mode === "login" ? setPassword(e.target.value) : setSignupPassword(e.target.value)}
                  className="bg-gray-50/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium animate-in slide-in-from-top-1">
                {error}
              </div>
            )}

            {successSlug && (
              <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm space-y-1">
                <p className="font-semibold">Conta criada!</p>
                <p>Seu identificador: <span className="font-mono font-bold">{successSlug}</span></p>
                <p className="text-xs text-green-600">Guarde este codigo — voce vai precisar para entrar.</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#50CAE6] hover:bg-[#45b0c9] h-11 text-base shadow-sm mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{mode === "login" ? "Entrando..." : "Criando conta..."}</>
              ) : (
                mode === "login" ? "Entrar" : "Comecar agora"
              )}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <div className="flex items-center justify-center gap-1 text-sm">
              <span className="text-gray-500">
                {mode === "login" ? "Nao tem uma conta?" : "Ja tem uma conta?"}
              </span>
              <Button
                variant="link"
                className="text-[#50CAE6] hover:text-[#45b0c9] font-semibold h-auto p-0"
                onClick={toggleMode}
              >
                {mode === "login" ? "Cadastre-se gratis" : "Fazer login"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Single Demo button */}
        {onDemoLogin && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Acesso rapido
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              type="button"
              disabled={isDemoLoading}
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-[#50CAE6] hover:shadow-sm transition-all text-sm font-medium text-gray-700 hover:text-[#50CAE6] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDemoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-[#50CAE6]" />
              )}
              {isDemoLoading ? "Carregando demo..." : "Explorar como Demo"}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
