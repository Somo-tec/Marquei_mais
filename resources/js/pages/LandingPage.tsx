import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Home,
  Users,
  Settings,
  Bell,
  Check,
  Clock,
  MoreHorizontal,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus,
  CreditCard,
  Star,
  Zap,
  Shield,
  Smartphone,
  Scissors,
  MessageCircle,
  BarChart3,
  Palette,
  Globe,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Dashboard } from "@/pages/Dashboard";
import appStoreBadge from "@/assets/50ddacdc5bb3f9318de03319980704342410f975.png";
import googlePlayBadge from "@/assets/d3506e8e08e243e681fd51bb9b3817137c656d8f.png";
import barberImage from "@/assets/0f376491811bf151e866a38d09bb3597c75522fe.png";
import facialImage from "@/assets/950d39cc830a1be0979cd6c1215180c7317c9d46.png";
import nailImage from "@/assets/69a325d9ce093c23aefe0c92e407b70e09930f53.png";
import desktopAppImage from "@/assets/0184b388b88b308158e45ce81143a285a15fa9b1.png";
import mobileAppImage from "@/assets/2c5b4aa22937461bd2c805a1389dd27fbfdeac82.png";
import iphoneMockup from "@/assets/2ab082ff3f339677acf67e7f735a29a72ca5b85a.png";

const MockDashboard = () => (
  <div className="space-y-5 p-4 bg-gray-50 h-full font-sans select-none pointer-events-none">
    {/* Header */}
    <div className="flex items-center justify-between mb-2">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Olá, Ana Beauty
        </h1>
        <p className="text-xs text-gray-500">
          Sábado, 20 de Dezembro
        </p>
      </div>
      <div className="h-8 w-8 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm">
        <Bell className="h-4 w-4 text-gray-600" />
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100/50">
        <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wide">
          Agendamentos
        </span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-gray-900">
            8
          </span>
          <span className="text-[10px] text-green-500 font-medium">
            +2 hoje
          </span>
        </div>
      </div>
      <div className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100/50">
        <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wide">
          Faturamento
        </span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-gray-900">
            R$ 420
          </span>
        </div>
      </div>
    </div>

    {/* Banner */}
    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-2xl shadow-lg shadow-cyan-500/20 text-white relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="font-bold text-sm mb-1">
          Link de Agendamento
        </h3>
        <p className="text-cyan-50 text-[10px] leading-relaxed max-w-[80%] opacity-90">
          Compartilhe seu link para clientes agendarem.
        </p>
      </div>
      <div className="absolute -right-2 -bottom-6 text-white/10 rotate-12">
        <Settings className="w-20 h-20" />
      </div>
    </div>

    {/* Agenda List */}
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
        Próximos
        <div className="h-4 px-1.5 rounded-full bg-blue-100 text-blue-600 text-[10px] flex items-center justify-center">
          3
        </div>
      </h2>

      {[
        {
          time: "09:00",
          name: "Júlia Santos",
          service: "Corte e Hidratação",
          price: "R$ 120",
          status: "confirmed",
        },
        {
          time: "10:30",
          name: "Mariana Costa",
          service: "Manicure",
          price: "R$ 45",
          status: "pending",
        },
        {
          time: "14:00",
          name: "Fernanda Lima",
          service: "Progressiva",
          price: "R$ 250",
          status: "confirmed",
        },
      ].map((apt, i) => (
        <div
          key={i}
          className="bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.02)] flex items-center gap-3"
        >
          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 shrink-0">
            <span className="text-xs font-bold text-gray-700">
              {apt.time.split(":")[0]}
            </span>
            <span className="text-[9px] text-gray-400">
              {apt.time.split(":")[1]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-gray-900 truncate">
                {apt.name}
              </h4>
              {apt.status === "confirmed" && (
                <Check className="w-3 h-3 text-cyan-500" />
              )}
            </div>
            <p className="text-[10px] text-gray-500 truncate">
              {apt.service}
            </p>
          </div>
          <div className="text-xs font-medium text-gray-900">
            {apt.price}
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function LandingPage({
  onLogin,
  onSignup,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden font-sans">
      {/* Header */}
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between border-b border-transparent z-50 fixed top-0 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-200">
            <Calendar className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            Marquei<span className="text-blue-600">+</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onLogin}
            className="text-gray-600 hover:text-blue-600 font-medium hidden sm:flex"
          >
            Entrar
          </Button>
          <Button
            onClick={onSignup}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 shadow-lg shadow-blue-200 rounded-full transition-transform hover:scale-105"
          >
            Criar Conta Grátis
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto w-full gap-12 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-100/40 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 -z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 -z-10" />

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 max-w-xl space-y-8 text-center lg:text-left z-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-100">
            <Zap className="w-3 h-3 fill-current" /> Nova Versão
            2.0
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-[1.1]">
            SUA AGENDA{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              LOTADA.
            </span>{" "}
            <br />
            <span className="whitespace-nowrap">
              SEU TEMPO{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
              LIVRE.
            </span>
          </h1>

          <p className="text-xl md:text-2xl font-medium text-gray-800">
            A plataforma completa para quem agenda, atende e
            cresce.
          </p>

          <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto lg:mx-0 lg:max-w-none">
            De barbearias a clínicas de estética, de pet shops a
            academias &mdash; o Marquei+ se adapta ao seu nicho
            com agendamento online, WhatsApp integrado e dark
            mode elegante.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button className="transition-transform active:scale-95 duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1 rounded-lg overflow-hidden border border-gray-100">
              <img
                src={appStoreBadge}
                alt="Download on the App Store"
                className="h-14 w-auto"
              />
            </button>

            <button className="transition-transform active:scale-95 duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1 rounded-lg overflow-hidden border border-gray-100">
              <img
                src={googlePlayBadge}
                alt="Get it on Google Play"
                className="h-14 w-auto"
              />
            </button>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-4 pt-4 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 fill-current"
                  />
                ))}
              </div>
              <span>Mais de 2.000 profissionais usam</span>
            </div>
          </div>
        </motion.div>

        {/* Right Live Preview */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative flex justify-center items-center w-full min-h-[400px] md:min-h-[500px] lg:min-h-auto"
        >
          {/* Service Bubbles (Decorations) */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-10 -left-4 z-30 bg-white p-2 rounded-2xl shadow-lg shadow-black/5 rotate-[-6deg] hidden lg:block max-w-[140px]"
          >
            <img
              src={barberImage}
              className="w-full h-24 object-cover rounded-xl mb-2"
              alt="Barbearia"
            />
            <div className="px-1 pb-1">
              <div className="text-[10px] font-bold text-gray-900">
                Barbearia
              </div>
              <div className="text-[9px] text-gray-500">
                Gestão completa
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-1/2 -right-12 z-30 bg-white p-2 rounded-2xl shadow-lg shadow-black/5 rotate-[6deg] hidden lg:block max-w-[140px]"
          >
            <img
              src={nailImage}
              className="w-full h-24 object-cover rounded-xl mb-2"
              alt="Manicure"
            />
            <div className="px-1 pb-1">
              <div className="text-[10px] font-bold text-gray-900">
                Nail Design
              </div>
              <div className="text-[9px] text-gray-500">
                Agenda fácil
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute -bottom-4 left-0 z-30 bg-white p-2 rounded-2xl shadow-lg shadow-black/5 rotate-[-3deg] hidden lg:block max-w-[140px]"
          >
            <img
              src={facialImage}
              className="w-full h-24 object-cover rounded-xl mb-2"
              alt="Estética"
            />
            <div className="px-1 pb-1">
              <div className="text-[10px] font-bold text-gray-900">
                Estética
              </div>
              <div className="text-[9px] text-gray-500">
                Controle total
              </div>
            </div>
          </motion.div>

          <div className="relative w-full max-w-[800px] lg:mr-0 perspective-[1000px] flex items-center justify-center">
            {/* Desktop Window Mockup */}
            <motion.div
              className="relative bg-white rounded-xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.2)] border border-gray-200/60 overflow-hidden w-[90%] md:w-[650px] z-10 select-none hidden md:block"
              style={{
                transform:
                  "rotateY(-12deg) rotateX(5deg) scale(0.95)",
                transformStyle: "preserve-3d",
                perspective: "1200px",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent z-50 pointer-events-none" />
              <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-4 sticky top-0 z-40">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] border border-black/10 shadow-inner" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] border border-black/10 shadow-inner" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] border border-black/10 shadow-inner" />
                </div>
                <div className="flex-1 bg-gray-50/50 border border-gray-200/50 h-7 rounded-md mx-2 shadow-sm text-[10px] flex items-center justify-center gap-1 text-gray-500 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  app.marqueimais.com
                </div>
              </div>

              <div className="bg-gray-50 overflow-hidden relative flex">
                <img
                  src={desktopAppImage}
                  alt="Marquei+ Desktop Dashboard"
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>

            {/* Mobile Phone Mockup - iPhone 16 Pro Max Style */}
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative md:absolute md:-right-12 md:-bottom-16 w-[280px] md:w-[300px] z-30"
            >
              <img
                src={iphoneMockup}
                alt="Marquei+ Mobile App Mockup"
                className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
              <Sparkles className="w-3 h-3" /> Funcionalidades
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para crescer
            </h2>
            <p className="text-gray-500 text-lg">
              Deixe as planilhas e o papel de lado. Automatize
              sua rotina e foque no que importa: atender bem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Link de Agendamento",
                desc: "Página pública personalizada com sua marca. Clientes agendam 24h sem precisar te ligar.",
                color: "bg-cyan-50 text-cyan-600",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp Integrado",
                desc: "Envie confirmações, lembretes e mensagens direto pelo app. Reduza faltas em até 40%.",
                color: "bg-green-50 text-green-600",
              },
              {
                icon: BarChart3,
                title: "Dashboard Inteligente",
                desc: "Visualize faturamento, taxa de ocupação e tendências do seu negócio em tempo real.",
                color: "bg-purple-50 text-purple-600",
              },
              {
                icon: Users,
                title: "Gestão de Equipe",
                desc: "Cada profissional com sua agenda, horários e serviços próprios. Sem conflitos.",
                color: "bg-orange-50 text-orange-600",
              },
              {
                icon: Palette,
                title: "Tema Personalizável",
                desc: "Dark mode elegante, cores do seu negócio e identidade visual profissional.",
                color: "bg-indigo-50 text-indigo-600",
              },
              {
                icon: Shield,
                title: "Dados na Nuvem",
                desc: "Backup automático, acesso multi-dispositivo e segurança enterprise para seus dados.",
                color: "bg-rose-50 text-rose-600",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Niche Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-600 text-xs font-bold uppercase tracking-wider mb-6 border border-cyan-100">
                <Scissors className="w-3 h-3" /> Multi-Nicho
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Um app, infinitos negócios.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  O seu do seu jeito.
                </span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Não importa se você tem uma barbearia premium,
                um studio de unhas, um pet shop ou uma academia.
                O Marquei+ se adapta com serviços, horários e
                configurações específicas para cada segmento.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { emoji: "💈", label: "Barbearias" },
                  { emoji: "💅", label: "Nail Design" },
                  { emoji: "🐾", label: "Pet Shops" },
                  { emoji: "💪", label: "Academias" },
                  { emoji: "✨", label: "Estética" },
                  { emoji: "💇", label: "Salões" },
                ].map((niche, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-default"
                  >
                    <span className="text-2xl">
                      {niche.emoji}
                    </span>
                    <span className="font-semibold text-gray-700 text-sm">
                      {niche.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-2xl text-white shadow-xl"
                >
                  <div className="text-3xl mb-3">💈</div>
                  <div className="font-bold text-sm">
                    BarberKing
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Corte + Barba
                  </div>
                  <div className="mt-3 bg-[#50CAE6]/20 text-[#50CAE6] text-[10px] font-bold px-2 py-1 rounded-full inline-block">
                    Dark Mode
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-pink-50 to-rose-50 p-5 rounded-2xl shadow-xl border border-pink-100 mt-8"
                >
                  <div className="text-3xl mb-3">💅</div>
                  <div className="font-bold text-sm text-gray-900">
                    NailArt Studio
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    Gel + Alongamento
                  </div>
                  <div className="mt-3 bg-pink-100 text-pink-600 text-[10px] font-bold px-2 py-1 rounded-full inline-block">
                    12 serviços
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl shadow-xl border border-amber-100"
                >
                  <div className="text-3xl mb-3">🐾</div>
                  <div className="font-bold text-sm text-gray-900">
                    PetCare Plus
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    Banho + Tosa
                  </div>
                  <div className="mt-3 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full inline-block">
                    3 profissionais
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl shadow-xl border border-blue-100 mt-8"
                >
                  <div className="text-3xl mb-3">💪</div>
                  <div className="font-bold text-sm text-gray-900">
                    FitStudio
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    Personal + Aula
                  </div>
                  <div className="mt-3 bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full inline-block">
                    Agenda semanal
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 text-xs font-bold uppercase tracking-wider mb-4 border border-yellow-100">
              <Star className="w-3 h-3 fill-current" />{" "}
              Depoimentos
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Quem usa, não volta atrás
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Júlia M.",
                role: "Cabeleireira · São Paulo",
                text: "Antes eu perdia 2h por dia respondendo WhatsApp. Agora meus clientes agendam sozinhos e eu recebi 30% menos faltas no primeiro mês.",
                image:
                  "https://images.unsplash.com/photo-1617340094158-4662f07836a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoYWlyZHJlc3NlciUyMHdvbWFuJTIwcG9ydHJhaXQlMjBjaGVlcmZ1bHxlbnwxfHx8fDE3NjYyMjI0MDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
              },
              {
                name: "Roberto S.",
                role: "Barbeiro · Belo Horizonte",
                text: "O dark mode ficou incrível na barbearia. Meus clientes elogiam a página de agendamento e eu gerencio tudo pelo celular entre um corte e outro.",
                image:
                  "https://images.unsplash.com/photo-1747832512459-5566e6d0ee5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBiYXJiZXIlMjBtYW4lMjBwb3J0cmFpdCUyMGNoZWVyZnVsfGVufDF8fHx8MTc2NjIyMjQwNHww&ixlib=rb-4.1.0&q=80&w=1080",
              },
              {
                name: "Carla D.",
                role: "Nail Designer · Rio de Janeiro",
                text: "Gerencio 3 profissionais, 12 serviços e mais de 200 clientes sem estresse. O dashboard me mostra exatamente quanto faturei na semana.",
                image:
                  "https://images.unsplash.com/photo-1623676553419-8ee475fd9661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW5pY3VyaXN0JTIwd29tYW4lMjBwb3J0cmFpdCUyMGNoZWVyZnVsfGVufDF8fHx8MTc2NjIyMjQwNHww&ixlib=rb-4.1.0&q=80&w=1080",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex text-yellow-400 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-4 h-4 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <div className="font-bold text-gray-900">
                      {t.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-center px-6 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm mb-2 backdrop-blur-md shadow-lg">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>TESTE GRÁTIS DISPONÍVEL</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Experimente o Plano Profissional <br /> por 14 dias
            grátis
          </h2>

          <p className="text-blue-100 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Descubra na prática como a gestão automatizada
            transforma seu dia a dia. Acesso total a todas as
            funcionalidades premium.
          </p>

          <div className="flex flex-col items-center gap-8 pt-4">
            <Button
              onClick={onSignup}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-10 h-16 rounded-full font-extrabold shadow-[0_10px_40px_-10px_rgba(255,255,255,0.4)] transition-all hover:scale-105 hover:-translate-y-1"
            >
              QUERO TESTAR GRÁTIS
            </Button>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/90 font-medium">
              <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                <Check className="w-4 h-4 text-[#50CAE6]" />{" "}
                Acesso imediato
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                <Check className="w-4 h-4 text-[#50CAE6]" />{" "}
                Cancele quando quiser
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Simple copyright */}
      <footer className="py-8 text-center text-gray-400 text-sm bg-gray-50 border-t border-gray-100">
        <div className="flex justify-center gap-6 mb-4">
          <a href="#" className="hover:text-gray-600">
            Termos de Uso
          </a>
          <a href="#" className="hover:text-gray-600">
            Privacidade
          </a>
          <a href="#" className="hover:text-gray-600">
            Ajuda
          </a>
        </div>
        &copy; {new Date().getFullYear()} Marquei+. Todos os
        direitos reservados.
      </footer>
    </div>
  );
}