import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Scissors, Palette, PawPrint, Dumbbell, Sparkles, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { DEMO_PROFILES } from "@/context/DemoProfiles";
import type { LoginCredentials, RegisterData } from "@/context/AuthContext";

const NICHE_ICONS: Record<string, React.ReactNode> = {
  barbearia: <Scissors className="w-4 h-4" />,
  nail: <Palette className="w-4 h-4" />,
  pet: <PawPrint className="w-4 h-4" />,
  fitness: <Dumbbell className="w-4 h-4" />,
  estetica: <Sparkles className="w-4 h-4" />,
};

const NICHE_DETAILS: Record<string, { pros: number; services: number; clients: number }> = {
  barbearia: { pros: 3, services: 8, clients: 8 },
  nail: { pros: 2, services: 9, clients: 7 },
  pet: { pros: 3, services: 8, clients: 6 },
  fitness: { pros: 2, services: 7, clients: 9 },
  estetica: { pros: 4, services: 10, clients: 9 },
};

interface LoginProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onSignup?: (data: RegisterData) => Promise<{ slug: string }>;
  onDemoLogin?: (profileId: string) => void;
  initialMode?: "login" | "signup";
}

export function Login({ onLogin, onSignup, onDemoLogin, initialMode = "login" }: LoginProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDemoId, setLoadingDemoId] = useState<string | null>(null);
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

  const handleDemoLogin = (profileId: string) => {
    if (loadingDemoId) return;
    setLoadingDemoId(profileId);
    setTimeout(() => {
      onDemoLogin?.(profileId);
    }, 800);
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
          <p className="text-gray-500 mt-2">
            {mode === "login" ? "Gerencie seus agendamentos em poucos cliques" : "Comece a usar o Marquei+ hoje mesmo"}
          </p>
        </div>

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
                <p className="text-xs text-gray-400">O identificador foi gerado na criação da conta</p>
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
                <p>Seu identificador de acesso é: <span className="font-mono font-bold">{successSlug}</span></p>
                <p className="text-xs text-green-600">Guarde este código — você vai precisar dele para entrar.</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#50CAE6] hover:bg-[#45b0c9] h-11 text-base shadow-sm mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "login" ? "Entrando..." : "Criando conta..."}
                </>
              ) : (
                mode === "login" ? "Entrar" : "Comecar agora"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
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

        {/* Demo Profiles - Quick Access */}
        {mode === "login" && onDemoLogin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-gray-200" />
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                <Zap className="w-3 h-3" />
                Acesso rapido - Demo
              </div>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-2">
              {DEMO_PROFILES.map((profile, idx) => {
                const details = NICHE_DETAILS[profile.id];
                const isLoadingThis = loadingDemoId === profile.id;

                return (
                  <motion.button
                    key={profile.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.08 }}
                    type="button"
                    disabled={!!loadingDemoId}
                    onClick={() => handleDemoLogin(profile.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                      style={{ backgroundColor: profile.color }}
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        NICHE_ICONS[profile.id]
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900 truncate">
                          {profile.label}
                        </span>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: `${profile.color}15`, color: profile.color }}
                        >
                          {profile.niche}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                        <span>{details?.services || 0} servicos</span>
                        <span className="text-gray-200">|</span>
                        <span>{details?.pros || 0} profissionais</span>
                        <span className="text-gray-200">|</span>
                        <span>{details?.clients || 0} clientes</span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </motion.button>
                );
              })}
            </div>

            <p className="text-center text-[11px] text-gray-400 mt-3">
              Clique para explorar o app com dados reais de cada nicho
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
