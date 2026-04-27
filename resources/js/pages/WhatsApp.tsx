import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  MessageCircle,
  Search,
  Send,
  Phone,
  ChevronLeft,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  CalendarCheck,
  Bell,
  XCircle,
  UserPlus,
  Star,
  Zap,
  Plus,
  Wifi,
  Bot,
  Trash2,
  MoreVertical,
  Smile,
  X,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useAppData, Client } from "@/context/AppDataContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
const API_BASE = "/api";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useWhatsAppUnread } from "@/context/WhatsAppUnreadContext";

// ============================
// TYPES
// ============================
interface ChatMessage {
  id: string;
  direction: "incoming" | "outgoing";
  body: string;
  timestamp: number;
  status: string;
  contactPhone: string;
}

interface Conversation {
  contactPhone: string;
  contactName: string;
  lastMessage: string;
  lastTimestamp: number;
  lastDirection: string;
  unreadCount: number;
}

// ============================
// TEMPLATES
// ============================
interface MessageTemplate {
  id: string;
  label: string;
  category: string;
  emoji: string;
  preview: string;
  getMessage: (clientName: string, businessName: string) => string;
}

const TEMPLATE_CATEGORIES = [
  { id: "abordagem", label: "Abordagem", emoji: "👋" },
  { id: "confirmacao", label: "Confirmacao", emoji: "✅" },
  { id: "lembrete", label: "Lembrete", emoji: "🔔" },
  { id: "followup", label: "Followup", emoji: "⭐" },
  { id: "cancelamento", label: "Cancelamento", emoji: "❌" },
  { id: "indicacao", label: "Indicacao", emoji: "🎁" },
];

const TEMPLATES: MessageTemplate[] = [
  // Abordagem
  {
    id: "welcome",
    label: "Boas-vindas",
    category: "abordagem",
    emoji: "🎉",
    preview: "Ola {{nome}}! Seja muito bem-vindo(a)...",
    getMessage: (name, biz) =>
      `Ola ${name}! Seja muito bem-vindo(a) ao *${biz}*! Estamos felizes em ter voce como cliente. Qualquer duvida, estamos a disposicao!`,
  },
  {
    id: "first-contact",
    label: "Primeiro contato",
    category: "abordagem",
    emoji: "💬",
    preview: "Oi {{nome}}! Tudo bem? Sou do {{negocio}}...",
    getMessage: (name, biz) =>
      `Oi ${name}! Tudo bem? Sou do *${biz}*. Vi que voce demonstrou interesse nos nossos servicos. Posso te ajudar com alguma informacao?`,
  },
  // Confirmacao
  {
    id: "confirmation",
    label: "Confirmar agendamento",
    category: "confirmacao",
    emoji: "✅",
    preview: "Seu agendamento no {{negocio}} foi confirmado...",
    getMessage: (name, biz) =>
      `Ola ${name}! Seu agendamento no *${biz}* foi confirmado. Qualquer duvida, estamos a disposicao!`,
  },
  {
    id: "confirm-request",
    label: "Pedir confirmacao",
    category: "confirmacao",
    emoji: "📋",
    preview: "Oi {{nome}}! Pode confirmar presenca...",
    getMessage: (name, biz) =>
      `Oi ${name}! Seu horario no *${biz}* esta se aproximando. Pode confirmar sua presenca? Responda SIM para confirmar ou entre em contato para remarcar.`,
  },
  // Lembrete
  {
    id: "reminder-tomorrow",
    label: "Lembrete para amanha",
    category: "lembrete",
    emoji: "🔔",
    preview: "Passando para lembrar do seu horario amanha...",
    getMessage: (name, biz) =>
      `Oi ${name}! Passando para lembrar do seu horario amanha no *${biz}*. Te esperamos!`,
  },
  {
    id: "reminder-today",
    label: "Lembrete para hoje",
    category: "lembrete",
    emoji: "⏰",
    preview: "Oi {{nome}}! Lembrando que seu horario e hoje...",
    getMessage: (name, biz) =>
      `Oi ${name}! Lembrando que seu horario no *${biz}* e hoje. Estamos te esperando! Qualquer imprevisto, avise com antecedencia.`,
  },
  {
    id: "reminder-return",
    label: "Lembrete de retorno",
    category: "lembrete",
    emoji: "🔄",
    preview: "Oi {{nome}}! Ja faz um tempinho desde sua...",
    getMessage: (name, biz) =>
      `Oi ${name}! Ja faz um tempinho desde sua ultima visita ao *${biz}*. Que tal agendar um novo horario? Estamos com novidades incriveis!`,
  },
  // Followup
  {
    id: "followup-satisfaction",
    label: "Pos-atendimento",
    category: "followup",
    emoji: "⭐",
    preview: "Obrigado por visitar o {{negocio}}!...",
    getMessage: (name, biz) =>
      `Ola ${name}! Obrigado por visitar o *${biz}*! Esperamos que tenha gostado. Sua opiniao e muito importante pra gente. Ate a proxima!`,
  },
  {
    id: "followup-review",
    label: "Pedir avaliacao",
    category: "followup",
    emoji: "📝",
    preview: "Oi {{nome}}! Pode nos avaliar no Google?...",
    getMessage: (name, biz) =>
      `Oi ${name}! Gostou do atendimento no *${biz}*? Ficariamos muito felizes com sua avaliacao no Google. Isso nos ajuda demais! Obrigado(a)!`,
  },
  {
    id: "followup-thanks",
    label: "Agradecimento",
    category: "followup",
    emoji: "🙏",
    preview: "{{nome}}, quero agradecer pela confianca...",
    getMessage: (name, biz) =>
      `${name}, quero agradecer pela confianca no *${biz}*! Clientes como voce fazem nosso trabalho valer a pena. Ate breve!`,
  },
  // Cancelamento
  {
    id: "cancellation-inform",
    label: "Informar cancelamento",
    category: "cancelamento",
    emoji: "❌",
    preview: "Precisamos informar um cancelamento...",
    getMessage: (name, biz) =>
      `Ola ${name}, infelizmente precisamos informar um cancelamento no *${biz}*. Por favor entre em contato para remarcar. Pedimos desculpas pelo inconveniente!`,
  },
  {
    id: "cancellation-reschedule",
    label: "Oferecer remarcacao",
    category: "cancelamento",
    emoji: "📅",
    preview: "Oi {{nome}}! Vimos que cancelou seu horario...",
    getMessage: (name, biz) =>
      `Oi ${name}! Vimos que seu horario no *${biz}* foi cancelado. Gostaramos de remarcar para voce. Qual o melhor dia e horario?`,
  },
  // Indicacao
  {
    id: "referral-program",
    label: "Programa de indicacao",
    category: "indicacao",
    emoji: "🎁",
    preview: "{{nome}}, sabia que indicando amigos voce...",
    getMessage: (name, biz) =>
      `${name}, sabia que indicando amigos para o *${biz}* voce ganha desconto no proximo atendimento? Indique e aproveite!`,
  },
  {
    id: "referral-promo",
    label: "Promocao especial",
    category: "indicacao",
    emoji: "🏷️",
    preview: "{{nome}}, temos uma promocao especial...",
    getMessage: (name, biz) =>
      `${name}, temos uma promocao especial no *${biz}* esse mes! Venha conferir as novidades e aproveite condicoes exclusivas para clientes fieis.`,
  },
];

// Simulated auto-replies for demo mode
const SIMULATED_REPLIES = [
  "Ok, obrigado pela informacao!",
  "Perfeito, pode confirmar sim!",
  "Qual horario voce tem disponivel?",
  "Vou verificar e te retorno!",
  "Otimo, muito obrigado(a)!",
  "Posso remarcar para outro dia?",
  "Recebi! Ate la entao!",
  "Tudo bem, sem problema!",
];

// ============================
// API HELPERS
// ============================
async function apiCall(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("marquei_token") ?? ""}`,
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`API error on ${path}:`, errText);
    throw new Error(errText);
  }
  return res.json();
}

// ============================
// STATUS ICON (stable component outside)
// ============================
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "sent":
    case "simulated":
      return <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />;
    case "sending":
      return <Clock className="w-3 h-3 text-gray-400" />;
    case "api_error":
      return <XCircle className="w-3 h-3 text-red-400" />;
    default:
      return <Check className="w-3.5 h-3.5 text-gray-400 dark:text-[#8895a7]" />;
  }
}

// ============================
// FORMAT HELPERS
// ============================
function formatMsgTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return format(d, "HH:mm");
  }
  return format(d, "dd/MM HH:mm");
}

function formatConvTime(ts: number) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return format(d, "HH:mm");
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return "Ontem";
  }
  return format(d, "dd/MM/yy");
}

// ============================
// MAIN COMPONENT
// ============================
export function WhatsApp({ onNavigate, pendingMessage, onClearPendingMessage }: { 
  onNavigate?: (page: string) => void;
  pendingMessage?: { phone: string; contactName: string; message: string } | null;
  onClearPendingMessage?: () => void;
}) {
  const { clients, businessSettings } = useAppData();
  const { setTotalUnread } = useWhatsAppUnread();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePhone, setActivePhone] = useState<string | null>(null);
  const [activeConvMeta, setActiveConvMeta] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategory, setTemplateCategory] = useState<string | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activePhoneRef = useRef<string | null>(null);

  // Keep ref in sync with state so polling closure always has latest value
  useEffect(() => {
    activePhoneRef.current = activePhone;
  }, [activePhone]);

  // Derive activeConv from conversations + activePhone for stability
  const activeConv = useMemo(() => {
    if (!activePhone) return null;
    const found = conversations.find((c) => c.contactPhone === activePhone);
    return found || activeConvMeta;
  }, [activePhone, conversations, activeConvMeta]);

  // ---- Check API config (once) ----
  useEffect(() => {
    apiCall("/whatsapp/config")
      .then((data) => setIsApiConfigured(data.isConfigured))
      .catch(() => setIsApiConfigured(false));
  }, []);

  // ---- Load conversations (stable, no deps) ----
  const loadConversations = useCallback(async () => {
    try {
      const data = await apiCall("/whatsapp/conversations");
      const incoming = (data.conversations || []) as Conversation[];
      setConversations((prev) => {
        // Only update if data actually changed (prevent flicker)
        const prevJson = JSON.stringify(prev);
        const newJson = JSON.stringify(incoming);
        return prevJson === newJson ? prev : incoming;
      });
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ---- Load messages for a phone (stable) ----
  const loadMessages = useCallback(async (phone: string) => {
    try {
      const data = await apiCall(`/whatsapp/messages/${encodeURIComponent(phone)}`);
      const incoming = (data.messages || []) as ChatMessage[];
      setMessages((prev) => {
        const prevJson = JSON.stringify(prev);
        const newJson = JSON.stringify(incoming);
        return prevJson === newJson ? prev : incoming;
      });
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  // ---- Poll for new data ----
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      loadConversations();
      const currentPhone = activePhoneRef.current;
      if (currentPhone) {
        loadMessages(currentPhone);
      }
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadConversations, loadMessages]);

  // ---- Auto-scroll to bottom when messages change ----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---- Sync total unread count to context ----
  useEffect(() => {
    const total = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    setTotalUnread(total);
  }, [conversations, setTotalUnread]);

  // ---- Handle pending message from other pages (e.g. Dashboard reschedule) ----
  const pendingHandledRef = useRef(false);
  useEffect(() => {
    if (!pendingMessage || pendingHandledRef.current) return;
    pendingHandledRef.current = true;

    const { phone, contactName, message } = pendingMessage;

    // Check if conversation already exists
    const existing = conversations.find((c) => c.contactPhone === phone);
    if (existing) {
      setActivePhone(phone);
      setActiveConvMeta(existing);
      setShowMobileChat(true);
      setInputText(message);
      loadMessages(phone).then(() => {
        setTimeout(() => {
          inputRef.current?.focus();
          if (inputRef.current) {
            inputRef.current.style.height = "auto";
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 128) + "px";
          }
        }, 150);
      });
    } else {
      // Create new conversation
      const newConv: Conversation = {
        contactPhone: phone,
        contactName: contactName,
        lastMessage: "",
        lastTimestamp: Date.now(),
        lastDirection: "outgoing",
        unreadCount: 0,
      };
      setActivePhone(phone);
      setActiveConvMeta(newConv);
      setMessages([]);
      setShowMobileChat(true);
      setInputText(message);
      setConversations((prev) => [newConv, ...prev]);
      setTimeout(() => {
        inputRef.current?.focus();
        if (inputRef.current) {
          inputRef.current.style.height = "auto";
          inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 128) + "px";
        }
      }, 150);
    }

    onClearPendingMessage?.();
  }, [pendingMessage, conversations, loadMessages, onClearPendingMessage]);

  // Reset pending handled ref when pending message is cleared
  useEffect(() => {
    if (!pendingMessage) {
      pendingHandledRef.current = false;
    }
  }, [pendingMessage]);

  // ---- Select conversation ----
  const selectConversation = useCallback(
    async (conv: Conversation) => {
      setActivePhone(conv.contactPhone);
      setActiveConvMeta(conv);
      setShowMobileChat(true);
      setLoading(true);
      await loadMessages(conv.contactPhone);
      setLoading(false);
      // Mark as read
      try {
        await apiCall("/whatsapp/mark-read", {
          method: "POST",
          body: JSON.stringify({ phone: conv.contactPhone }),
        });
        loadConversations();
      } catch {}
    },
    [loadMessages, loadConversations]
  );

  // ---- Send message ----
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || !activePhone || !activeConv) return;

    const text = inputText.trim();
    setInputText("");
    setSendingMsg(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Optimistic update
    const optimisticMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      direction: "outgoing",
      body: text,
      timestamp: Date.now(),
      status: "sending",
      contactPhone: activePhone,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await apiCall("/whatsapp/send", {
        method: "POST",
        body: JSON.stringify({
          phone: activePhone,
          message: text,
          contactName: activeConv.contactName,
        }),
      });

      await loadMessages(activePhone);
      await loadConversations();

      // If simulation mode, auto-reply after delay
      if (!isApiConfigured) {
        const capturedPhone = activePhone;
        const capturedName = activeConv.contactName;
        setTimeout(async () => {
          const reply = SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)];
          try {
            await apiCall("/whatsapp/simulate-reply", {
              method: "POST",
              body: JSON.stringify({
                phone: capturedPhone,
                message: reply,
                contactName: capturedName,
              }),
            });
            // Only reload if still viewing same conversation
            if (activePhoneRef.current === capturedPhone) {
              await loadMessages(capturedPhone);
            }
            await loadConversations();
          } catch {}
        }, 1500 + Math.random() * 2000);
      }
    } catch (err) {
      toast.error("Erro ao enviar mensagem");
      console.error(err);
    } finally {
      setSendingMsg(false);
      inputRef.current?.focus();
    }
  }, [inputText, activePhone, activeConv, isApiConfigured, loadMessages, loadConversations]);

  // ---- Start new chat from client list ----
  const startNewChat = useCallback(
    (client: Client) => {
      setNewChatOpen(false);
      setNewChatSearch("");

      const phone = client.phone.replace(/\D/g, "");
      const normalizedPhone = phone.startsWith("55") ? phone : `55${phone}`;

      // Check if conversation already exists
      const existing = conversations.find((c) => c.contactPhone === normalizedPhone);
      if (existing) {
        selectConversation(existing);
        return;
      }

      const newConv: Conversation = {
        contactPhone: normalizedPhone,
        contactName: client.name,
        lastMessage: "",
        lastTimestamp: Date.now(),
        lastDirection: "outgoing",
        unreadCount: 0,
      };

      setActivePhone(normalizedPhone);
      setActiveConvMeta(newConv);
      setMessages([]);
      setShowMobileChat(true);
      setConversations((prev) => [newConv, ...prev]);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [conversations, selectConversation]
  );

  // ---- Delete conversation ----
  const deleteConversation = useCallback(
    async (conv: Conversation, e?: React.MouseEvent) => {
      e?.stopPropagation();
      try {
        await apiCall(`/whatsapp/conversation/${encodeURIComponent(conv.contactPhone)}`, {
          method: "DELETE",
        });
        setConversations((prev) => prev.filter((c) => c.contactPhone !== conv.contactPhone));
        if (activePhone === conv.contactPhone) {
          setActivePhone(null);
          setActiveConvMeta(null);
          setMessages([]);
          setShowMobileChat(false);
        }
        toast.success("Conversa excluida");
      } catch {
        toast.error("Erro ao excluir conversa");
      }
    },
    [activePhone]
  );

  // ---- Insert template ----
  const insertTemplate = useCallback(
    (template: MessageTemplate) => {
      const clientName = activeConv?.contactName?.split(" ")[0] || "Cliente";
      const text = template.getMessage(clientName, businessSettings.name);
      setInputText(text);
      setTemplateOpen(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [activeConv, businessSettings.name]
  );

  // ---- Handle emoji select ----
  const handleEmojiSelect = useCallback((emoji: any) => {
    const sym = emoji.native || emoji.shortcodes || "";
    setInputText((prev) => prev + sym);
    setEmojiPickerOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // ---- Handle key press ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // ---- Find client avatar by phone ----
  const getClientAvatar = useCallback(
    (phone: string) => {
      const normalizedPhone = phone.replace(/\D/g, "");
      return clients.find((c) => {
        const clientPhone = c.phone.replace(/\D/g, "");
        return (
          normalizedPhone.endsWith(clientPhone) ||
          clientPhone.endsWith(normalizedPhone.slice(-8))
        );
      });
    },
    [clients]
  );

  // ---- Filtered conversations ----
  const filteredConversations = useMemo(
    () =>
      conversations.filter(
        (c) =>
          c.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.contactPhone.includes(searchTerm.replace(/\D/g, ""))
      ),
    [conversations, searchTerm]
  );

  // ---- Filtered clients for new chat ----
  const availableClients = useMemo(
    () =>
      clients.filter(
        (c) =>
          c.name.toLowerCase().includes(newChatSearch.toLowerCase()) ||
          c.phone.includes(newChatSearch)
      ),
    [clients, newChatSearch]
  );

  // ---- Go back from mobile chat ----
  const handleBackToList = useCallback(() => {
    setShowMobileChat(false);
    setActivePhone(null);
    setActiveConvMeta(null);
  }, []);

  // ---- Handle textarea auto-grow ----
  const handleTextareaInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = Math.min(target.scrollHeight, 128) + "px";
  }, []);

  // ---- Derive client data for active conv ----
  const activeClientData = useMemo(
    () => (activeConv ? getClientAvatar(activeConv.contactPhone) : undefined),
    [activeConv, getClientAvatar]
  );

  // =============================
  // RENDER
  // =============================
  return (
    <div className="h-[calc(100vh-8rem)] lg:h-full flex flex-col lg:flex-row rounded-none lg:rounded-xl overflow-hidden border-0 lg:border border-gray-200 dark:border-[#2d3545] bg-white dark:bg-[#232938] lg:shadow-sm">
      {/* ===== LEFT PANEL: Conversations ===== */}
      <div
        className={`w-full lg:w-[380px] lg:min-w-[340px] lg:max-w-[420px] border-r-0 lg:border-r border-gray-100 dark:border-[#2d3545] flex flex-col bg-white dark:bg-[#232938] overflow-hidden ${
          showMobileChat ? "hidden lg:flex" : "flex flex-1"
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2d3545] bg-white dark:bg-[#232938]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-gray-900 dark:text-[#e8ecf4]">
                WhatsApp
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                  isApiConfigured
                    ? "bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400"
                    : "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400"
                }`}
              >
                {isApiConfigured ? (
                  <>
                    <Wifi className="w-3 h-3" /> API
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3" /> Demo
                  </>
                )}
              </div>
              <Popover open={newChatOpen} onOpenChange={setNewChatOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 w-8 p-0 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-80 p-0 dark:bg-[#232938] dark:border-[#2d3545]"
                >
                  <div className="p-3 border-b border-gray-100 dark:border-[#2d3545]">
                    <p className="text-sm font-medium text-gray-900 dark:text-[#e8ecf4] mb-2">
                      Nova conversa
                    </p>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input
                        placeholder="Buscar cliente..."
                        className="pl-8 h-8 text-sm bg-gray-50 dark:bg-[#1a1f2b] border-gray-200 dark:border-[#2d3545] dark:text-[#e8ecf4]"
                        value={newChatSearch}
                        onChange={(e) => setNewChatSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {availableClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => startNewChat(client)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-[#2a3142] transition-colors text-left"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={client.avatar} />
                          <AvatarFallback className="bg-[#25D366]/10 text-[#25D366] text-xs font-medium">
                            {client.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-[#e8ecf4] truncate">
                            {client.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-[#8895a7]">
                            {client.phone}
                          </p>
                        </div>
                      </button>
                    ))}
                    {availableClients.length === 0 && (
                      <p className="text-sm text-gray-400 dark:text-[#8895a7] text-center py-6">
                        Nenhum cliente encontrado
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-[#8895a7]" />
            <Input
              placeholder="Buscar conversa..."
              className="pl-9 h-9 bg-gray-50/80 dark:bg-[#1a1f2b] border-gray-200 dark:border-[#2d3545] dark:text-[#e8ecf4] dark:placeholder:text-[#8895a7] text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-50 dark:divide-[#2d3545]/50">
            {filteredConversations.map((conv) => {
              const client = getClientAvatar(conv.contactPhone);
              const isActive = activePhone === conv.contactPhone;

              return (
                <div
                  key={conv.contactPhone}
                  onClick={() => selectConversation(conv)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") selectConversation(conv);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? "bg-[#25D366]/5 dark:bg-[#25D366]/10"
                      : "hover:bg-gray-50/80 dark:hover:bg-[#2a3142]/50"
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarImage src={client?.avatar} />
                      <AvatarFallback className="bg-[#25D366]/10 text-[#25D366] font-medium text-sm">
                        {(conv.contactName || "?").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#25D366] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium text-sm truncate ${
                          conv.unreadCount > 0
                            ? "text-gray-900 dark:text-[#e8ecf4]"
                            : "text-gray-700 dark:text-[#c4cdd8]"
                        }`}
                      >
                        {conv.contactName || conv.contactPhone}
                      </span>
                      <span
                        className={`text-[10px] shrink-0 ml-2 ${
                          conv.unreadCount > 0
                            ? "text-[#25D366] font-semibold"
                            : "text-gray-400 dark:text-[#8895a7]"
                        }`}
                      >
                        {formatConvTime(conv.lastTimestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p
                        className={`text-xs truncate pr-2 ${
                          conv.unreadCount > 0
                            ? "text-gray-700 dark:text-[#c4cdd8] font-medium"
                            : "text-gray-400 dark:text-[#8895a7]"
                        }`}
                      >
                        {conv.lastDirection === "outgoing" && (
                          <CheckCheck className="w-3 h-3 inline mr-1 text-[#53bdeb]" />
                        )}
                        {conv.lastMessage || "Nova conversa"}
                      </p>
                      <div
                        onClick={(e) => deleteConversation(conv, e)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") deleteConversation(conv, e as any);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="py-12 text-center">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-200 dark:text-[#3d4556]" />
                <p className="text-sm text-gray-400 dark:text-[#8895a7]">
                  {searchTerm ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
                </p>
                <p className="text-xs text-gray-300 dark:text-[#3d4556] mt-1">
                  Clique em + para iniciar
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ===== RIGHT PANEL: Chat ===== */}
      <div
        className={`flex-1 flex flex-col min-h-0 overflow-hidden ${
          showMobileChat ? "flex" : "hidden lg:flex"
        }`}
      >
        {!activeConv ? (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center bg-[#efeae2] dark:bg-[#0b141a]">
            <div className="text-center px-8">
              <div className="w-24 h-24 rounded-full bg-[#25D366]/10 dark:bg-[#25D366]/15 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-[#25D366]/60" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-[#e8ecf4] mb-2">
                Marquei+ WhatsApp
              </h3>
              <p className="text-gray-500 dark:text-[#8895a7] text-sm max-w-sm mx-auto leading-relaxed">
                {isApiConfigured
                  ? "Conectado a API do WhatsApp Business. Selecione uma conversa ou inicie uma nova."
                  : "Modo de demonstracao ativo. As mensagens sao simuladas localmente. Configure a API do WhatsApp Business para enviar mensagens reais."}
              </p>
              {!isApiConfigured && (
                <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 max-w-sm mx-auto">
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    <strong>Para conectar a API:</strong> Configure as variaveis{" "}
                    <code className="bg-amber-100 dark:bg-amber-500/20 px-1 rounded text-[10px]">
                      WHATSAPP_ACCESS_TOKEN
                    </code>{" "}
                    e{" "}
                    <code className="bg-amber-100 dark:bg-amber-500/20 px-1 rounded text-[10px]">
                      WHATSAPP_PHONE_NUMBER_ID
                    </code>{" "}
                    no Supabase.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active chat */
          <>
            {/* Chat Header */}
            <div className="px-4 py-2.5 border-b border-gray-100 dark:border-[#2d3545] bg-white dark:bg-[#232938] flex items-center gap-3 shrink-0">
              <button
                onClick={handleBackToList}
                className="lg:hidden p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a3142]"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-[#8895a7]" />
              </button>

              <Avatar className="h-10 w-10 border border-gray-100 dark:border-[#2d3545]">
                <AvatarImage src={activeClientData?.avatar} />
                <AvatarFallback className="bg-[#25D366]/10 text-[#25D366] font-medium text-sm">
                  {(activeConv.contactName || "?").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-[#e8ecf4] truncate">
                  {activeConv.contactName || activeConv.contactPhone}
                </h3>
                <p className="text-[11px] text-gray-400 dark:text-[#8895a7]">
                  {activeConv.contactPhone.replace(
                    /(\d{2})(\d{2})(\d{5})(\d{4})/,
                    "+$1 ($2) $3-$4"
                  )}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 bg-transparent text-gray-500 dark:text-[#8895a7] hover:text-[#25D366] hover:bg-gray-100 dark:hover:bg-[#2a3142]"
                  onClick={() =>
                    window.open(`https://wa.me/${activeConv.contactPhone}`, "_blank")
                  }
                  title="Abrir no WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 bg-transparent text-gray-500 dark:text-[#8895a7] hover:text-gray-700 dark:hover:text-[#e8ecf4] hover:bg-gray-100 dark:hover:bg-[#2a3142]"
                  onClick={() =>
                    window.open(`tel:${activeConv.contactPhone}`, "_self")
                  }
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-transparent text-gray-500 dark:text-[#8895a7] hover:text-gray-700 dark:hover:text-[#e8ecf4] hover:bg-gray-100 dark:hover:bg-[#2a3142]"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="dark:bg-[#232938] dark:border-[#2d3545]"
                  >
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500 dark:focus:bg-red-500/10"
                      onClick={() => deleteConversation(activeConv)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir conversa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto px-3 md:px-6 py-4 bg-[#efeae2] dark:bg-[#0b141a] relative"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="bg-white/80 dark:bg-[#232938]/80 backdrop-blur-sm rounded-xl px-6 py-4 text-center shadow-sm">
                    <Sparkles className="w-6 h-6 text-[#25D366] mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-[#8895a7]">
                      Inicie a conversa com{" "}
                      <span className="font-medium text-gray-900 dark:text-[#e8ecf4]">
                        {activeConv.contactName?.split(" ")[0]}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-[#5a6577] mt-1">
                      Use o botao <Zap className="w-3 h-3 inline" /> para modelos rapidos
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 max-w-3xl mx-auto">
                  {messages.map((msg, idx) => {
                    const isOut = msg.direction === "outgoing";
                    const showDate =
                      idx === 0 ||
                      new Date(msg.timestamp).toDateString() !==
                        new Date(messages[idx - 1].timestamp).toDateString();

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center py-2">
                            <span className="bg-white/80 dark:bg-[#232938]/80 backdrop-blur-sm text-[11px] text-gray-500 dark:text-[#8895a7] px-3 py-1 rounded-lg shadow-sm">
                              {format(new Date(msg.timestamp), "dd 'de' MMMM 'de' yyyy", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`relative max-w-[85%] md:max-w-[65%] px-3 py-1.5 rounded-lg shadow-sm ${
                              isOut
                                ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-[#e8ecf4] rounded-tr-none"
                                : "bg-white dark:bg-[#202c33] text-gray-900 dark:text-[#e8ecf4] rounded-tl-none"
                            }`}
                          >
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                              {msg.body}
                            </p>
                            <div
                              className={`flex items-center gap-1 mt-0.5 ${
                                isOut ? "justify-end" : "justify-start"
                              }`}
                            >
                              <span className="text-[10px] text-gray-500 dark:text-[#8895a7]">
                                {formatMsgTime(msg.timestamp)}
                              </span>
                              {isOut && <StatusIcon status={msg.status} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* ===== Templates Panel ===== */}
            <AnimatePresence>
              {templateOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-gray-100 dark:border-[#2d3545] bg-white dark:bg-[#1e2435] shrink-0"
                >
                  <div className="max-h-[340px] flex flex-col">
                    {/* Panel Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-[#2d3545] shrink-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-[#e8ecf4]">
                        Sugestoes de Mensagem
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setTemplateOpen(false);
                            setTemplateSearch("");
                            setTemplateCategory(null);
                          }}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#2a3142] text-gray-400 dark:text-[#8895a7] hover:text-gray-600 dark:hover:text-[#e8ecf4] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="px-4 py-2 shrink-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-[#8895a7]" />
                        <input
                          type="text"
                          placeholder="Buscar sugestoes..."
                          value={templateSearch}
                          onChange={(e) => setTemplateSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-[#232938] border border-gray-200 dark:border-[#2d3545] text-gray-900 dark:text-[#e8ecf4] placeholder:text-gray-400 dark:placeholder:text-[#5a6577] focus:outline-none focus:ring-1 focus:ring-[#25D366]/30 focus:border-[#25D366]"
                        />
                      </div>
                    </div>

                    {/* Category Chips */}
                    <div className="px-4 py-1.5 flex flex-wrap gap-1.5 shrink-0">
                      {TEMPLATE_CATEGORIES.map((cat) => {
                        const count = TEMPLATES.filter((t) => t.category === cat.id).length;
                        const isActive = templateCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setTemplateCategory(isActive ? null : cat.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                              isActive
                                ? "bg-[#25D366] text-white shadow-sm"
                                : "bg-gray-100 dark:bg-[#232938] text-gray-600 dark:text-[#8895a7] hover:bg-gray-200 dark:hover:bg-[#2a3142] border border-gray-200 dark:border-[#2d3545]"
                            }`}
                          >
                            {cat.label}
                            <span className={`text-[10px] font-bold ${isActive ? "text-white/80" : "text-gray-400 dark:text-[#5a6577]"}`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Template Cards */}
                    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {(() => {
                        const filtered = TEMPLATES.filter((t) => {
                          const matchCategory = !templateCategory || t.category === templateCategory;
                          const matchSearch = !templateSearch || 
                            t.label.toLowerCase().includes(templateSearch.toLowerCase()) ||
                            t.preview.toLowerCase().includes(templateSearch.toLowerCase());
                          return matchCategory && matchSearch;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="py-6 text-center">
                              <p className="text-sm text-gray-400 dark:text-[#5a6577]">Nenhuma sugestao encontrada</p>
                            </div>
                          );
                        }

                        return filtered.map((t) => {
                          const clientName = activeConv?.contactName?.split(" ")[0] || "Cliente";
                          const previewText = t.getMessage(clientName, businessSettings.name);
                          return (
                            <div
                              key={t.id}
                              className="group flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#232938] border border-gray-100 dark:border-[#2d3545] hover:border-[#25D366]/30 dark:hover:border-[#25D366]/30 hover:bg-[#25D366]/5 dark:hover:bg-[#25D366]/5 transition-all cursor-default"
                            >
                              <div className="flex-1 min-w-0">
                                <h5 className="text-[13px] font-semibold text-gray-900 dark:text-[#e8ecf4] mb-0.5">
                                  {t.label}
                                </h5>
                                <p className="text-xs text-gray-500 dark:text-[#8895a7] line-clamp-2 leading-relaxed">
                                  {previewText.length > 120 ? previewText.slice(0, 120) + "..." : previewText}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => insertTemplate(t)}
                                  className="p-1.5 rounded-lg hover:bg-[#25D366]/15 text-gray-400 dark:text-[#8895a7] hover:text-[#25D366] transition-colors"
                                  title="Inserir no campo de texto"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(previewText);
                                    toast.success("Mensagem copiada!");
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-gray-200/60 dark:hover:bg-[#2a3142] text-gray-400 dark:text-[#8895a7] hover:text-gray-600 dark:hover:text-[#e8ecf4] transition-colors"
                                  title="Copiar mensagem"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="px-3 md:px-4 py-2.5 border-t border-gray-100 dark:border-[#2d3545] bg-white dark:bg-[#232938] shrink-0">
              <div className="flex items-end gap-2 max-w-3xl mx-auto">
                {/* Templates Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-10 w-10 p-0 shrink-0 rounded-full transition-colors ${
                    templateOpen
                      ? "bg-[#25D366]/10 text-[#25D366]"
                      : "bg-transparent text-gray-500 dark:text-[#8895a7] hover:text-[#25D366] hover:bg-gray-100 dark:hover:bg-[#25D366]/10"
                  }`}
                  title="Sugestoes de Mensagem"
                  onClick={() => setTemplateOpen(!templateOpen)}
                >
                  <Zap className="w-5 h-5" />
                </Button>

                {/* Emoji Picker Button */}
                <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-10 w-10 p-0 shrink-0 rounded-full transition-colors ${
                        emojiPickerOpen
                          ? "bg-[#25D366]/10 text-[#25D366]"
                          : "bg-transparent text-gray-500 dark:text-[#8895a7] hover:text-[#25D366] hover:bg-gray-100 dark:hover:bg-[#25D366]/10"
                      }`}
                      title="Emojis"
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    align="start"
                    sideOffset={8}
                    className="w-auto p-0 border-0 bg-transparent shadow-xl rounded-xl overflow-hidden"
                  >
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiSelect}
                      theme={businessSettings.themeMode === "dark" ? "dark" : businessSettings.themeMode === "system" ? "auto" : "light"}
                      locale="pt"
                      previewPosition="none"
                      skinTonePosition="search"
                      set="native"
                      maxFrequentRows={2}
                      perLine={8}
                    />
                  </PopoverContent>
                </Popover>

                {/* Text Input */}
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onInput={handleTextareaInput}
                    placeholder="Digite uma mensagem..."
                    rows={1}
                    className="w-full resize-none rounded-2xl border border-gray-200 dark:border-[#2d3545] bg-gray-50/50 dark:bg-[#1a1f2b] px-4 py-2.5 text-sm text-gray-900 dark:text-[#e8ecf4] placeholder:text-gray-400 dark:placeholder:text-[#5a6577] focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] max-h-32 overflow-y-auto leading-5"
                    style={{ height: "auto", minHeight: "40px" }}
                  />
                </div>

                {/* Send Button */}
                <Button
                  size="sm"
                  disabled={!inputText.trim() || sendingMsg}
                  onClick={sendMessage}
                  className={`h-10 w-10 p-0 shrink-0 rounded-full transition-all ${
                    inputText.trim()
                      ? "bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md shadow-[#25D366]/20"
                      : "bg-gray-100 dark:bg-[#2d3545] text-gray-400 dark:text-[#5a6577]"
                  }`}
                >
                  <Send className="w-4.5 h-4.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}