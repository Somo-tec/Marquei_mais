import React, { useState, useEffect } from "react";
import { 
    CreditCard, 
    Bell, 
    LogOut, 
    Link as LinkIcon, 
    ExternalLink,
    HelpCircle,
    MessageSquare,
    Copy,
    Check,
    Store,
    MapPin,
    Phone,
    MessageCircle,
    Eye,
    Users,
    CalendarClock,
    ShieldCheck,
    Mail,
    ChevronRight,
    ChevronLeft,
    Save,
    FileText,
    Settings2,
    Sun,
    Moon,
    Monitor,
    Palette,
    Wifi,
    Bot,
    Send,
    Clock,
    Star,
    Zap,
    AlertTriangle,
    Key,
    ArrowRight,
    Timer,
    Ban,
    CalendarOff,
    Plus,
    Trash2,
    Instagram,
    Facebook,
    MapPinned,
    Video,
    User,
    Lock,
    Globe,
    DollarSign,
    Download,
    Upload,
    Image,
    Layers,
    Type,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData, BusinessSettings, ThemeMode, DaySchedule } from "@/context/AppDataContext";
import { cn } from "@/components/ui/utils";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";

const API_BASE = "/api";
const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("marquei_token") ?? ""}` });

// ============================
// TYPES
// ============================

type SettingsSection = 
    | null 
    | "business" 
    | "social" 
    | "hours" 
    | "holidays" 
    | "booking" 
    | "publicpage"
    | "whatsapp" 
    | "templates" 
    | "notifications" 
    | "appearance" 
    | "regional" 
    | "profile" 
    | "data";

interface SettingsProps {
    onNavigate: (page: string) => void;
    onLogout: () => void;
    onOpenPublicLink: () => void;
}

// ============================
// SHARED COMPONENTS
// ============================

function SettingToggle({ 
    icon: Icon, 
    label, 
    description, 
    checked, 
    onCheckedChange, 
    iconColor = "text-gray-500",
    iconBg = "bg-gray-100"
}: { 
    icon: React.ElementType; 
    label: string; 
    description: string; 
    checked: boolean; 
    onCheckedChange: (v: boolean) => void;
    iconColor?: string;
    iconBg?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#232938] p-4 rounded-xl border border-gray-100 dark:border-[#2d3545] shadow-sm">
            <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg shrink-0 mt-0.5", iconBg, iconColor)}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col space-y-0.5">
                    <Label className="font-medium text-gray-700 dark:text-[#e8ecf4] cursor-pointer">{label}</Label>
                    <span className="text-xs text-gray-500 dark:text-[#8895a7] leading-tight">{description}</span>
                </div>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                className="data-[state=checked]:bg-[#50CAE6] shrink-0"
            />
        </div>
    );
}

function ChipSelector({ options, value, onChange, color = "#50CAE6" }: { 
    options: { value: number | string; label: string }[]; 
    value: number | string; 
    onChange: (v: any) => void;
    color?: string;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        value === opt.value
                            ? "text-white shadow-md"
                            : "bg-gray-100 dark:bg-[#2a3142] text-gray-600 dark:text-[#8895a7] hover:bg-gray-200 dark:hover:bg-[#3d4556]"
                    )}
                    style={value === opt.value ? { backgroundColor: color } : {}}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function SectionHeader({ title, onBack }: { title: string; onBack: () => void }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 rounded-xl hover:bg-gray-100 dark:hover:bg-[#232938] shrink-0">
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#e8ecf4]">{title}</h2>
        </div>
    );
}

const DAY_NAMES = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];
const TIME_OPTIONS = Array.from({ length: 30 }, (_, i) => {
    const h = Math.floor((i * 30 + 360) / 60);
    const m = (i * 30 + 360) % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

// ============================
// MENU ITEM
// ============================

interface MenuItemProps {
    icon: React.ElementType;
    label: string;
    description: string;
    iconColor: string;
    iconBg: string;
    onClick: () => void;
    badge?: React.ReactNode;
}

function MenuItem({ icon: Icon, label, description, iconColor, iconBg, onClick, badge }: MenuItemProps) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#232938] active:bg-gray-100 dark:active:bg-[#2a3142] transition-all text-left group"
        >
            <div className={cn("p-2.5 rounded-xl shrink-0", iconBg, iconColor)}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-[#e8ecf4] text-[15px]">{label}</p>
                <p className="text-xs text-gray-400 dark:text-[#5a6577] mt-0.5 truncate">{description}</p>
            </div>
            {badge && <div className="shrink-0">{badge}</div>}
            <ChevronRight className="h-4 w-4 text-gray-300 dark:text-[#3d4556] shrink-0 group-hover:text-gray-400 transition-colors" />
        </button>
    );
}

// ============================
// MAIN SETTINGS COMPONENT
// ============================

export function Settings({ 
    onNavigate, 
    onLogout, 
    onOpenPublicLink,
}: SettingsProps) {
    const { businessSettings, updateBusinessSettings, services, professionals, clients, appointments } = useAppData();
    
    const [activeSection, setActiveSection] = useState<SettingsSection>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [form, setForm] = useState<BusinessSettings>(businessSettings);
    const [hasChanges, setHasChanges] = useState(false);
    const [whatsappApiConfigured, setWhatsappApiConfigured] = useState(false);
    const [checkingApi, setCheckingApi] = useState(true);
    const [newBlockedDate, setNewBlockedDate] = useState("");

    // Check WhatsApp API status
    useEffect(() => {
        setCheckingApi(true);
        fetch(`${API_BASE}/whatsapp/config`, {
            headers: getAuthHeader(),
        })
            .then(res => res.json())
            .then(data => setWhatsappApiConfigured(data.isConfigured === true))
            .catch(() => setWhatsappApiConfigured(false))
            .finally(() => setCheckingApi(false));
    }, []);

    useEffect(() => { setForm(businessSettings); }, [businessSettings]);

    useEffect(() => {
        setHasChanges(JSON.stringify(form) !== JSON.stringify(businessSettings));
    }, [form, businessSettings]);

    const publicLink = `marquei.plus/${form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(publicLink);
        setIsCopied(true);
        toast.success("Link copiado!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleSave = () => {
        updateBusinessSettings(form);
        toast.success("Configuracoes salvas com sucesso!");
    };

    const handleSupportClick = () => {
        toast.info("Abrindo chat de suporte...", { description: "Nossa equipe esta pronta para te ajudar!" });
        window.open("mailto:suporte@marqueimais.com.br?subject=Preciso de ajuda com o Marquei+");
    };

    const handleExportData = () => {
        const exportData = {
            services, professionals, clients,
            appointments: appointments.map(a => ({ ...a, startTime: a.startTime instanceof Date ? a.startTime.toISOString() : a.startTime })),
            settings: businessSettings, exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `marquei-plus-backup-${format(new Date(), "yyyy-MM-dd")}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Dados exportados com sucesso!");
    };

    const handleAddBlockedDate = () => {
        if (!newBlockedDate) return;
        if (form.blockedDates.includes(newBlockedDate)) { toast.error("Data ja bloqueada."); return; }
        setForm({ ...form, blockedDates: [...form.blockedDates, newBlockedDate].sort() });
        setNewBlockedDate("");
    };

    const handleRemoveBlockedDate = (dateStr: string) => {
        setForm({ ...form, blockedDates: form.blockedDates.filter(d => d !== dateStr) });
    };

    const updateBusinessHoursDay = (day: number, update: Partial<DaySchedule>) => {
        const current = form.businessHours?.[day] || { enabled: false, start: "08:00", end: "18:00", lunchEnabled: false, lunchStart: "12:00", lunchEnd: "13:00" };
        setForm({ ...form, businessHours: { ...form.businessHours, [day]: { ...current, ...update } } });
    };

    const goBack = () => {
        setActiveSection(null);
        window.scrollTo(0, 0);
    };

    const openSection = (section: SettingsSection) => {
        setActiveSection(section);
        window.scrollTo(0, 0);
    };

    // ============================
    // SAVE BAR
    // ============================

    const SaveBar = () => hasChanges ? (
        <div className="fixed bottom-20 lg:bottom-4 left-0 right-0 lg:left-64 p-4 z-30">
            <div className="max-w-xl mx-auto">
                <Button 
                    onClick={handleSave}
                    className="w-full bg-[#50CAE6] hover:bg-[#45b0c9] gap-2 shadow-xl shadow-cyan-300/40 h-12 text-base rounded-xl"
                >
                    <Save className="h-4 w-4" />
                    Salvar Alteracoes
                </Button>
            </div>
        </div>
    ) : null;

    // ============================
    // SUB-PAGES RENDERERS
    // ============================

    // -- BUSINESS INFO --
    const renderBusiness = () => (
        <div className="space-y-5 pb-24">
            <SectionHeader title="Dados do Negocio" onBack={goBack} />
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Store className="h-3.5 w-3.5 text-gray-400" /> Nome do Negocio</Label>
                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Studio Ana Beauty" className="h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><MapPin className="h-3.5 w-3.5 text-gray-400" /> Endereco</Label>
                    <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Ex: Rua das Flores, 123" className="h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Phone className="h-3.5 w-3.5 text-gray-400" /> Telefone / WhatsApp</Label>
                    <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" className="h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><MessageCircle className="h-3.5 w-3.5 text-gray-400" /> Mensagem de Boas-vindas</Label>
                    <textarea value={form.welcomeMessage} onChange={e => setForm({ ...form, welcomeMessage: e.target.value })} placeholder="Uma mensagem amigavel..." className="w-full min-h-[80px] rounded-lg border border-gray-200 dark:border-[#2d3545] dark:bg-[#1a1f2b] dark:text-[#e8ecf4] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#50CAE6]" rows={3} />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Image className="h-3.5 w-3.5 text-gray-400" /> Logo do Negocio (URL)</Label>
                    <Input value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://exemplo.com/logo.png" className="h-11" />
                    {form.logoUrl && (
                        <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-[#1a1f2b] rounded-lg border border-gray-100 dark:border-[#2d3545]">
                            <img src={form.logoUrl} alt="Logo" className="h-12 w-12 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <span className="text-xs text-gray-500">Preview do logo</span>
                        </div>
                    )}
                </div>
            </div>
            <SaveBar />
        </div>
    );

    // -- SOCIAL LINKS --
    const renderSocial = () => (
        <div className="space-y-5 pb-24">
            <SectionHeader title="Redes Sociais" onBack={goBack} />
            <p className="text-sm text-gray-500 dark:text-[#8895a7] -mt-3">Links exibidos na pagina publica de agendamento.</p>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Instagram className="h-3.5 w-3.5 text-pink-500" /> Instagram</Label>
                    <Input value={form.socialInstagram} onChange={e => setForm({ ...form, socialInstagram: e.target.value })} placeholder="@seunegocio" className="h-10" />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Facebook className="h-3.5 w-3.5 text-blue-600" /> Facebook</Label>
                    <Input value={form.socialFacebook} onChange={e => setForm({ ...form, socialFacebook: e.target.value })} placeholder="facebook.com/seunegocio" className="h-10" />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Video className="h-3.5 w-3.5 text-gray-900 dark:text-white" /> TikTok</Label>
                    <Input value={form.socialTiktok} onChange={e => setForm({ ...form, socialTiktok: e.target.value })} placeholder="@seunegocio" className="h-10" />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><MapPinned className="h-3.5 w-3.5 text-red-500" /> Google Maps</Label>
                    <Input value={form.socialGoogleMaps} onChange={e => setForm({ ...form, socialGoogleMaps: e.target.value })} placeholder="Link do Google Maps" className="h-10" />
                </div>
            </div>
            <SaveBar />
        </div>
    );

    // -- BUSINESS HOURS --
    const renderHours = () => (
        <div className="space-y-5 pb-24">
            <SectionHeader title="Horario de Funcionamento" onBack={goBack} />
            <p className="text-sm text-gray-500 dark:text-[#8895a7] -mt-3">Defina os dias e horarios que o estabelecimento esta aberto.</p>
            <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5, 6].map(day => {
                    const dayData = form.businessHours?.[day] || { enabled: false, start: "08:00", end: "18:00", lunchEnabled: false, lunchStart: "12:00", lunchEnd: "13:00" };
                    return (
                        <div key={day} className={cn(
                            "p-3 rounded-xl border transition-all",
                            dayData.enabled 
                                ? "bg-white dark:bg-[#1a1f2b] border-gray-100 dark:border-[#2d3545]" 
                                : "bg-gray-50 dark:bg-[#1a1f2b]/50 border-gray-100 dark:border-[#2d3545]/50 opacity-60"
                        )}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <Switch checked={dayData.enabled} onCheckedChange={v => updateBusinessHoursDay(day, { enabled: v })} className="data-[state=checked]:bg-[#50CAE6]" />
                                    <span className={cn("text-sm font-medium", dayData.enabled ? "text-gray-800 dark:text-[#e8ecf4]" : "text-gray-400 dark:text-[#5a6577]")}>{DAY_NAMES[day]}</span>
                                </div>
                                {dayData.enabled && <span className="text-xs text-gray-500 dark:text-[#8895a7]">{dayData.start} - {dayData.end}</span>}
                            </div>
                            {dayData.enabled && (
                                <div className="ml-12 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <select value={dayData.start} onChange={e => updateBusinessHoursDay(day, { start: e.target.value })} className="text-xs px-2 py-1.5 rounded-md border border-gray-200 dark:border-[#2d3545] bg-white dark:bg-[#232938] dark:text-[#e8ecf4]">
                                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <span className="text-xs text-gray-400">ate</span>
                                        <select value={dayData.end} onChange={e => updateBusinessHoursDay(day, { end: e.target.value })} className="text-xs px-2 py-1.5 rounded-md border border-gray-200 dark:border-[#2d3545] bg-white dark:bg-[#232938] dark:text-[#e8ecf4]">
                                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch checked={dayData.lunchEnabled} onCheckedChange={v => updateBusinessHoursDay(day, { lunchEnabled: v })} className="data-[state=checked]:bg-orange-400 scale-75" />
                                        <span className="text-[11px] text-gray-500 dark:text-[#8895a7]">Intervalo</span>
                                        {dayData.lunchEnabled && (
                                            <>
                                                <select value={dayData.lunchStart} onChange={e => updateBusinessHoursDay(day, { lunchStart: e.target.value })} className="text-xs px-1.5 py-1 rounded border border-gray-200 dark:border-[#2d3545] bg-white dark:bg-[#232938] dark:text-[#e8ecf4]">
                                                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                                <span className="text-[11px] text-gray-400">-</span>
                                                <select value={dayData.lunchEnd} onChange={e => updateBusinessHoursDay(day, { lunchEnd: e.target.value })} className="text-xs px-1.5 py-1 rounded border border-gray-200 dark:border-[#2d3545] bg-white dark:bg-[#232938] dark:text-[#e8ecf4]">
                                                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <SaveBar />
        </div>
    );

    // -- HOLIDAYS --
    const renderHolidays = () => (
        <div className="space-y-5 pb-24">
            <SectionHeader title="Feriados e Folgas" onBack={goBack} />
            <p className="text-sm text-gray-500 dark:text-[#8895a7] -mt-3">Bloqueie dias em que nao havera atendimento.</p>
            <div className="flex items-center gap-2">
                <Input type="date" value={newBlockedDate} onChange={e => setNewBlockedDate(e.target.value)} className="h-10 flex-1" />
                <Button size="sm" onClick={handleAddBlockedDate} className="bg-red-500 hover:bg-red-600 text-white h-10 px-4">
                    <Plus className="h-4 w-4 mr-1" /> Bloquear
                </Button>
            </div>
            {form.blockedDates.length === 0 ? (
                <div className="text-center py-12">
                    <CalendarOff className="w-10 h-10 text-gray-200 dark:text-[#2d3545] mx-auto mb-3" />
                    <p className="text-sm text-gray-400 dark:text-[#5a6577]">Nenhuma data bloqueada</p>
                    <p className="text-xs text-gray-300 dark:text-[#3d4556] mt-1">Adicione feriados ou dias de folga acima</p>
                </div>
            ) : (
                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
                    {form.blockedDates.map(dateStr => {
                        let label = dateStr;
                        try { const d = parse(dateStr, "yyyy-MM-dd", new Date()); label = format(d, "dd 'de' MMMM 'de' yyyy (EEEE)", { locale: ptBR }); } catch {}
                        return (
                            <div key={dateStr} className="flex items-center justify-between bg-red-50 dark:bg-red-500/10 px-3 py-2.5 rounded-lg border border-red-100 dark:border-red-500/20">
                                <div className="flex items-center gap-2">
                                    <CalendarOff className="h-3.5 w-3.5 text-red-400" />
                                    <span className="text-sm text-red-700 dark:text-red-300 capitalize">{label}</span>
                                </div>
                                <button onClick={() => handleRemoveBlockedDate(dateStr)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/20 text-red-400">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
            <SaveBar />
        </div>
    );

    // -- BOOKING OPTIONS --
    const renderBooking = () => (
        <div className="space-y-5 pb-24">
            <SectionHeader title="Opcoes de Agendamento" onBack={goBack} />
            <div className="space-y-3">
                <SettingToggle icon={Users} label="Escolha de Profissional" description="Permitir que o cliente escolha com quem quer ser atendido." checked={form.allowProfessionalSelection} onCheckedChange={v => setForm({ ...form, allowProfessionalSelection: v })} iconColor="text-blue-600" iconBg="bg-blue-100" />
                <SettingToggle icon={Eye} label="Exibir Precos" description="Mostrar os valores dos servicos na pagina de agendamento." checked={form.showPrices} onCheckedChange={v => setForm({ ...form, showPrices: v })} iconColor="text-green-600" iconBg="bg-green-100" />
                <SettingToggle icon={ShieldCheck} label="Confirmacao Automatica" description="Agendamentos sao confirmados automaticamente." checked={form.autoConfirm} onCheckedChange={v => setForm({ ...form, autoConfirm: v })} iconColor="text-amber-600" iconBg="bg-amber-100" />
                <SettingToggle icon={Mail} label="Email Obrigatorio" description="Exigir email do cliente ao agendar." checked={form.requireEmail} onCheckedChange={v => setForm({ ...form, requireEmail: v })} iconColor="text-purple-600" iconBg="bg-purple-100" />

                {/* Buffer */}
                <div className="bg-white dark:bg-[#1a1f2b] p-4 rounded-xl border border-gray-100 dark:border-[#2d3545] shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 shrink-0"><Timer className="h-4 w-4" /></div>
                        <div><Label className="font-medium text-gray-700 dark:text-[#e8ecf4]">Intervalo entre Agendamentos</Label><span className="text-xs text-gray-500 dark:text-[#8895a7] block mt-0.5">Tempo de preparo/limpeza entre atendimentos.</span></div>
                    </div>
                    <div className="ml-11"><ChipSelector options={[{ value: 0, label: "Sem intervalo" }, { value: 5, label: "5 min" }, { value: 10, label: "10 min" }, { value: 15, label: "15 min" }, { value: 30, label: "30 min" }]} value={form.bufferMinutes} onChange={v => setForm({ ...form, bufferMinutes: v })} /></div>
                </div>

                {/* Min Advance */}
                <div className="bg-white dark:bg-[#1a1f2b] p-4 rounded-xl border border-gray-100 dark:border-[#2d3545] shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0"><Ban className="h-4 w-4" /></div>
                        <div><Label className="font-medium text-gray-700 dark:text-[#e8ecf4]">Antecedencia Minima</Label><span className="text-xs text-gray-500 dark:text-[#8895a7] block mt-0.5">Tempo minimo antes do horario para permitir agendamento.</span></div>
                    </div>
                    <div className="ml-11"><ChipSelector options={[{ value: 0, label: "Sem limite" }, { value: 1, label: "1 hora" }, { value: 2, label: "2 horas" }, { value: 4, label: "4 horas" }, { value: 12, label: "12 horas" }, { value: 24, label: "1 dia" }]} value={form.minAdvanceHours} onChange={v => setForm({ ...form, minAdvanceHours: v })} /></div>
                </div>

                {/* Max Advance Days */}
                <div className="bg-white dark:bg-[#1a1f2b] p-4 rounded-xl border border-gray-100 dark:border-[#2d3545] shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shrink-0"><CalendarClock className="h-4 w-4" /></div>
                        <div><Label className="font-medium text-gray-700 dark:text-[#e8ecf4]">Antecedencia Maxima</Label><span className="text-xs text-gray-500 dark:text-[#8895a7] block mt-0.5">Ate quantos dias no futuro o cliente pode agendar.</span></div>
                    </div>
                    <div className="ml-11"><ChipSelector options={[{ value: 7, label: "7 dias" }, { value: 14, label: "14 dias" }, { value: 30, label: "30 dias" }, { value: 60, label: "60 dias" }, { value: 90, label: "90 dias" }]} value={form.maxAdvanceDays} onChange={v => setForm({ ...form, maxAdvanceDays: v })} /></div>
                </div>

                {/* Max Concurrent */}
                <div className="bg-white dark:bg-[#1a1f2b] p-4 rounded-xl border border-gray-100 dark:border-[#2d3545] shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shrink-0"><Layers className="h-4 w-4" /></div>
                        <div><Label className="font-medium text-gray-700 dark:text-[#e8ecf4]">Agendamentos Simultaneos</Label><span className="text-xs text-gray-500 dark:text-[#8895a7] block mt-0.5">Limite de atendimentos ao mesmo tempo (0 = ilimitado).</span></div>
                    </div>
                    <div className="ml-11"><ChipSelector options={[{ value: 0, label: "Ilimitado" }, { value: 1, label: "1" }, { value: 2, label: "2" }, { value: 3, label: "3" }, { value: 5, label: "5" }, { value: 10, label: "10" }]} value={form.maxConcurrentBookings} onChange={v => setForm({ ...form, maxConcurrentBookings: v })} /></div>
                </div>

                {/* Cancellation Policy */}
                <div className="bg-white dark:bg-[#1a1f2b] p-4 rounded-xl border border-gray-100 dark:border-[#2d3545] shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 shrink-0"><FileText className="h-4 w-4" /></div>
                        <div><Label className="font-medium text-gray-700 dark:text-[#e8ecf4]">Politica de Cancelamento</Label><span className="text-xs text-gray-500 dark:text-[#8895a7] block mt-0.5">Exibida ao cliente antes de confirmar.</span></div>
                    </div>
                    <div className="ml-11">
                        <textarea value={form.cancellationPolicy} onChange={e => setForm({ ...form, cancellationPolicy: e.target.value })} placeholder="Ex: Cancelamentos com no minimo 2 horas de antecedencia..." className="w-full min-h-[72px] rounded-lg border border-gray-200 dark:border-[#2d3545] dark:bg-[#1a1f2b] dark:text-[#e8ecf4] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#50CAE6]" rows={3} />
                    </div>
                </div>
            </div>
            <SaveBar />
        </div>
    );

    // -- PUBLIC PAGE --
    const renderPublicPage = () => (
        <div className="space-y-5 pb-24">
            <SectionHeader title="Pagina Publica" onBack={goBack} />
            <p className="text-sm text-gray-500 dark:text-[#8895a7] -mt-3">Personalize a aparencia da pagina de agendamento dos clientes.</p>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Palette className="h-3.5 w-3.5 text-gray-400" /> Cor Principal</Label>
                    <div className="flex items-center gap-3">
                        <input type="color" value={form.publicPageColor} onChange={e => setForm({ ...form, publicPageColor: e.target.value })} className="h-10 w-16 rounded-lg border border-gray-200 dark:border-[#2d3545] cursor-pointer" />
                        <Input value={form.publicPageColor} onChange={e => setForm({ ...form, publicPageColor: e.target.value })} className="h-10 w-28 font-mono text-sm" maxLength={7} />
                        <div className="flex gap-1.5">
                            {["#50CAE6", "#25D366", "#FF6B6B", "#FFB347", "#7C5CFC", "#FF69B4"].map(c => (
                                <button key={c} onClick={() => setForm({ ...form, publicPageColor: c })} className={cn("w-7 h-7 rounded-full border-2 transition-all", form.publicPageColor === c ? "border-gray-800 dark:border-white scale-110" : "border-transparent")} style={{ backgroundColor: c }} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><FileText className="h-3.5 w-3.5 text-gray-400" /> Descricao da Pagina</Label>
                    <textarea value={form.publicPageDescription} onChange={e => setForm({ ...form, publicPageDescription: e.target.value })} placeholder="Descreva seu negocio para os clientes..." className="w-full min-h-[72px] rounded-lg border border-gray-200 dark:border-[#2d3545] dark:bg-[#1a1f2b] dark:text-[#e8ecf4] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#50CAE6]" rows={3} />
                </div>
                {/* Link Preview */}
                <Card className="border-[#50CAE6] border-2 shadow-sm bg-gradient-to-br from-cyan-50 to-blue-50/50 dark:from-[#50CAE6]/10 dark:to-[#232938]">
                    <CardContent className="pt-5 space-y-3">
                        <div className="flex items-center space-x-2 bg-white dark:bg-[#1a1f2b] p-2 rounded-md border border-gray-200 dark:border-[#2d3545]">
                            <Input value={publicLink} readOnly className="border-0 bg-transparent focus-visible:ring-0 px-2 text-gray-600 dark:text-[#8895a7] font-medium" />
                            <Button size="sm" variant="ghost" onClick={handleCopyLink} className="shrink-0 text-gray-500 hover:text-[#50CAE6]">
                                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <Button variant="outline" size="sm" className="w-full bg-white hover:bg-cyan-50 text-[#50CAE6] border-[#50CAE6]" onClick={onOpenPublicLink}>
                            <ExternalLink className="w-3 h-3 mr-2" /> Visualizar como cliente
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <SaveBar />
        </div>
    );

    // -- WHATSAPP --
    const renderWhatsapp = () => (
        <div className="space-y-5 pb-24">
            <SectionHeader title="WhatsApp Business" onBack={goBack} />
            {/* Status Badge */}
            {!checkingApi && (
                <div className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border -mt-2", whatsappApiConfigured ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20" : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20")}>
                    <div className={cn("p-1.5 rounded-lg shrink-0", whatsappApiConfigured ? "bg-green-100 dark:bg-green-500/20" : "bg-amber-100 dark:bg-amber-500/20")}>
                        {whatsappApiConfigured ? <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" /> : <Bot className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                    </div>
                    <div>
                        <p className={cn("text-sm font-medium", whatsappApiConfigured ? "text-green-800 dark:text-green-300" : "text-amber-800 dark:text-amber-300")}>{whatsappApiConfigured ? "API conectada" : "Modo Demo"}</p>
                        <p className={cn("text-xs mt-0.5", whatsappApiConfigured ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400")}>{whatsappApiConfigured ? "WhatsApp Business integrado e pronto." : "Configure as credenciais para enviar mensagens reais."}</p>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <SettingToggle icon={MessageCircle} label="WhatsApp Ativo" description="Ativar integracao do WhatsApp no sistema." checked={form.whatsappEnabled} onCheckedChange={v => setForm({ ...form, whatsappEnabled: v })} iconColor="text-[#25D366]" iconBg="bg-[#25D366]/10" />
                <SettingToggle icon={Send} label="Confirmacao via WhatsApp" description="Enviar mensagem automatica de confirmacao." checked={form.whatsappAutoConfirmation} onCheckedChange={v => setForm({ ...form, whatsappAutoConfirmation: v })} iconColor="text-blue-600 dark:text-blue-400" iconBg="bg-blue-100 dark:bg-blue-900/30" />
                <SettingToggle icon={Bell} label="Lembrete via WhatsApp" description="Enviar lembrete automatico antes do horario." checked={form.whatsappAutoReminder} onCheckedChange={v => setForm({ ...form, whatsappAutoReminder: v })} iconColor="text-orange-600 dark:text-orange-400" iconBg="bg-orange-100 dark:bg-orange-900/30" />
                {form.whatsappAutoReminder && (
                    <div className="bg-white dark:bg-[#1a1f2b] p-4 rounded-xl border border-gray-100 dark:border-[#2d3545] shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shrink-0"><Clock className="h-4 w-4" /></div>
                            <div><Label className="font-medium text-gray-700 dark:text-[#e8ecf4]">Antecedencia do Lembrete</Label></div>
                        </div>
                        <div className="ml-11"><ChipSelector options={[{ value: 1, label: "1 hora" }, { value: 2, label: "2 horas" }, { value: 4, label: "4 horas" }, { value: 12, label: "12 horas" }, { value: 24, label: "1 dia" }, { value: 48, label: "2 dias" }]} value={form.whatsappReminderHours} onChange={v => setForm({ ...form, whatsappReminderHours: v })} color="#25D366" /></div>
                    </div>
                )}
                <SettingToggle icon={Star} label="Pos-atendimento" description="Enviar mensagem de agradecimento apos o atendimento." checked={form.whatsappAutoFollowup} onCheckedChange={v => setForm({ ...form, whatsappAutoFollowup: v })} iconColor="text-yellow-600 dark:text-yellow-400" iconBg="bg-yellow-100 dark:bg-yellow-900/30" />
            </div>

            {/* API Credentials */}
            <div className="bg-white dark:bg-[#1a1f2b] p-4 rounded-xl border border-gray-100 dark:border-[#2d3545] shadow-sm space-y-3">
                <div className="flex items-center gap-2"><Key className="h-4 w-4 text-gray-400" /><Label className="font-medium text-gray-700 dark:text-[#e8ecf4]">Credenciais da API</Label></div>
                <p className="text-xs text-gray-500 dark:text-[#8895a7]">Configure no painel do Supabase em Edge Functions &gt; Secrets.</p>
                {["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"].map(key => (
                    <div key={key} className="flex items-center gap-2 bg-gray-50 dark:bg-[#232938] rounded-lg px-3 py-2.5 border border-gray-100 dark:border-[#2d3545]">
                        <code className="text-xs font-mono text-gray-600 dark:text-[#8895a7] flex-1 truncate">{key}</code>
                        {whatsappApiConfigured ? <span className="text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/15 px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-2.5 h-2.5" /> OK</span> : <span className="text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-[#2a3142] px-2 py-0.5 rounded-full">Pendente</span>}
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/5" onClick={() => { goBack(); setTimeout(() => onNavigate("whatsapp"), 50); }}>
                    <MessageCircle className="w-4 h-4 mr-2" /> Abrir Chat <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-gray-600 dark:text-[#8895a7]" onClick={() => window.open("https://developers.facebook.com/docs/whatsapp/cloud-api/get-started", "_blank")}>
                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> Documentacao
                </Button>
            </div>

            {/* Webhook URL */}
            <div className="bg-gray-50 dark:bg-[#1a1f2b] rounded-xl p-4 border border-gray-100 dark:border-[#2d3545]">
                <div className="flex items-center gap-2 mb-2"><Zap className="h-4 w-4 text-gray-400" /><Label className="font-medium text-gray-700 dark:text-[#e8ecf4] text-sm">URL do Webhook</Label></div>
                <div className="flex items-center gap-2 bg-white dark:bg-[#232938] rounded-lg px-3 py-2 border border-gray-200 dark:border-[#2d3545]">
                    <code className="text-[11px] font-mono text-gray-600 dark:text-[#8895a7] flex-1 truncate select-all">{API_BASE}/whatsapp/webhook</code>
                    <button onClick={() => { navigator.clipboard.writeText(`${API_BASE}/whatsapp/webhook`); toast.success("URL copiada!"); }} className="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-[#2a3142] text-gray-400 hover:text-[#25D366] transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                </div>
            </div>
            <SaveBar />
        </div>
    );

    // -- TEMPLATES --
    const renderTemplates = () => (
        <div className="space-y-5 pb-24">
            <SectionHeader title="Templates de Mensagem" onBack={goBack} />
            <p className="text-sm text-gray-500 dark:text-[#8895a7] -mt-3">Personalize as mensagens automaticas do WhatsApp.</p>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Send className="h-3.5 w-3.5 text-blue-500" /> Confirmacao de Agendamento</Label>
                    <textarea value={form.whatsappConfirmationTemplate} onChange={e => setForm({ ...form, whatsappConfirmationTemplate: e.target.value })} className="w-full min-h-[80px] rounded-lg border border-gray-200 dark:border-[#2d3545] dark:bg-[#1a1f2b] dark:text-[#e8ecf4] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#50CAE6]" rows={3} />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Bell className="h-3.5 w-3.5 text-orange-500" /> Lembrete</Label>
                    <textarea value={form.whatsappReminderTemplate} onChange={e => setForm({ ...form, whatsappReminderTemplate: e.target.value })} className="w-full min-h-[80px] rounded-lg border border-gray-200 dark:border-[#2d3545] dark:bg-[#1a1f2b] dark:text-[#e8ecf4] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#50CAE6]" rows={3} />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Star className="h-3.5 w-3.5 text-yellow-500" /> Pos-atendimento</Label>
                    <textarea value={form.whatsappFollowupTemplate} onChange={e => setForm({ ...form, whatsappFollowupTemplate: e.target.value })} className="w-full min-h-[80px] rounded-lg border border-gray-200 dark:border-[#2d3545] dark:bg-[#1a1f2b] dark:text-[#e8ecf4] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#50CAE6]" rows={3} />
                </div>
                <div className="bg-gray-50 dark:bg-[#1a1f2b] p-3 rounded-lg border border-gray-100 dark:border-[#2d3545]">
                    <p className="text-[11px] text-gray-500 dark:text-[#8895a7]">
                        <strong>Variaveis:</strong> {"{{cliente}}"} = nome, {"{{servico}}"} = servico, {"{{data}}"} = data, {"{{hora}}"} = horario, {"{{profissional}}"} = profissional
                    </p>
                </div>
            </div>
            <SaveBar />
        </div>
    );

    // -- NOTIFICATIONS --
    const renderNotifications = () => (
        <div className="space-y-5 pb-24">
            <SectionHeader title="Notificacoes do App" onBack={goBack} />
            <p className="text-sm text-gray-500 dark:text-[#8895a7] -mt-3">Escolha quais notificacoes internas deseja receber.</p>
            <div className="space-y-3">
                <SettingToggle icon={CalendarClock} label="Novo Agendamento" description="Receber notificacao quando um cliente agendar." checked={form.notifyOnNewBooking} onCheckedChange={v => setForm({ ...form, notifyOnNewBooking: v })} iconColor="text-blue-600 dark:text-blue-400" iconBg="bg-blue-100 dark:bg-blue-900/30" />
                <SettingToggle icon={Ban} label="Cancelamento" description="Receber notificacao quando um agendamento for cancelado." checked={form.notifyOnCancellation} onCheckedChange={v => setForm({ ...form, notifyOnCancellation: v })} iconColor="text-red-600 dark:text-red-400" iconBg="bg-red-100 dark:bg-red-900/30" />
                <SettingToggle icon={Clock} label="Lembretes" description="Receber lembretes antes dos atendimentos." checked={form.notifyOnReminder} onCheckedChange={v => setForm({ ...form, notifyOnReminder: v })} iconColor="text-orange-600 dark:text-orange-400" iconBg="bg-orange-100 dark:bg-orange-900/30" />
            </div>
            <SaveBar />
        </div>
    );

    // -- APPEARANCE --
    const renderAppearance = () => (
        <div className="space-y-5 pb-24">
            <SectionHeader title="Aparencia" onBack={goBack} />
            <p className="text-sm text-gray-500 dark:text-[#8895a7] -mt-3">Escolha o tema do painel administrativo.</p>
            <div className="grid grid-cols-3 gap-3">
                {([
                    { value: "light" as ThemeMode, icon: Sun, label: "Claro", preview: "bg-white border-gray-200", dot: "bg-gray-100" },
                    { value: "dark" as ThemeMode, icon: Moon, label: "Escuro", preview: "bg-[#1a1f2b] border-[#2d3545]", dot: "bg-[#2d3545]" },
                    { value: "system" as ThemeMode, icon: Monitor, label: "Sistema", preview: "bg-gradient-to-r from-white to-[#1a1f2b] border-gray-300", dot: "bg-gradient-to-r from-gray-100 to-[#2d3545]" },
                ]).map(opt => {
                    const isSelected = form.themeMode === opt.value;
                    return (
                        <button key={opt.value} onClick={() => { setForm({ ...form, themeMode: opt.value }); updateBusinessSettings({ themeMode: opt.value }); }} className={cn("relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200", isSelected ? "border-[#50CAE6] bg-cyan-50/50 dark:bg-[#50CAE6]/10 shadow-md scale-[1.02]" : "border-gray-200 dark:border-[#2d3545] hover:border-gray-300 bg-white dark:bg-[#1a1f2b]")}>
                            <div className={cn("w-full h-12 rounded-lg border overflow-hidden flex flex-col p-1.5 gap-1", opt.preview)}>
                                <div className={cn("h-1.5 w-8 rounded-full", opt.dot)} />
                                <div className={cn("h-1.5 w-6 rounded-full opacity-60", opt.dot)} />
                                <div className={cn("h-1.5 w-10 rounded-full opacity-40", opt.dot)} />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <opt.icon className={cn("h-4 w-4", isSelected ? "text-[#50CAE6]" : "text-gray-400")} />
                                <span className={cn("text-sm font-medium", isSelected ? "text-[#50CAE6]" : "text-gray-600 dark:text-gray-300")}>{opt.label}</span>
                            </div>
                            {isSelected && <div className="absolute -top-1 -right-1"><div className="h-5 w-5 bg-[#50CAE6] rounded-full flex items-center justify-center shadow-sm"><Check className="h-3 w-3 text-white" /></div></div>}
                        </button>
                    );
                })}
            </div>
            <SaveBar />
        </div>
    );

    // -- REGIONAL --
    const renderRegional = () => (
        <div className="space-y-5 pb-24">
            <SectionHeader title="Regional" onBack={goBack} />
            <div className="space-y-4">
                <div className="bg-white dark:bg-[#1a1f2b] p-4 rounded-xl border border-gray-100 dark:border-[#2d3545] shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0"><DollarSign className="h-4 w-4" /></div>
                        <div><Label className="font-medium text-gray-700 dark:text-[#e8ecf4]">Moeda</Label><span className="text-xs text-gray-500 dark:text-[#8895a7] block mt-0.5">Simbolo utilizado para exibir precos.</span></div>
                    </div>
                    <div className="ml-11"><ChipSelector options={[{ value: "R$", label: "R$ (Real)" }, { value: "$", label: "$ (Dolar)" }, { value: "€", label: "€ (Euro)" }, { value: "£", label: "£ (Libra)" }]} value={form.currency} onChange={v => setForm({ ...form, currency: v })} color="#10b981" /></div>
                </div>
                <div className="bg-white dark:bg-[#1a1f2b] p-4 rounded-xl border border-gray-100 dark:border-[#2d3545] shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0"><Globe className="h-4 w-4" /></div>
                        <div><Label className="font-medium text-gray-700 dark:text-[#e8ecf4]">Idioma</Label><span className="text-xs text-gray-500 dark:text-[#8895a7] block mt-0.5">Idioma do sistema e da pagina publica.</span></div>
                    </div>
                    <div className="ml-11"><ChipSelector options={[{ value: "pt-BR", label: "Portugues" }, { value: "en-US", label: "English" }, { value: "es-ES", label: "Espanol" }]} value={form.language} onChange={v => setForm({ ...form, language: v })} color="#3b82f6" /></div>
                </div>
            </div>
            <SaveBar />
        </div>
    );

    // -- PROFILE --
    const renderProfile = () => (
        <div className="space-y-5 pb-24">
            <SectionHeader title="Perfil da Conta" onBack={goBack} />
            <p className="text-sm text-gray-500 dark:text-[#8895a7] -mt-3">Dados do proprietario da conta.</p>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><User className="h-3.5 w-3.5 text-gray-400" /> Nome do Proprietario</Label>
                    <Input value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} placeholder="Seu nome completo" className="h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Mail className="h-3.5 w-3.5 text-gray-400" /> Email da Conta</Label>
                    <Input type="email" value={form.ownerEmail} onChange={e => setForm({ ...form, ownerEmail: e.target.value })} placeholder="seu@email.com" className="h-11" />
                </div>
            </div>
            <SaveBar />
        </div>
    );

    // -- DATA EXPORT --
    const renderData = () => (
        <div className="space-y-5 pb-24">
            <SectionHeader title="Exportar Dados" onBack={goBack} />
            <p className="text-sm text-gray-500 dark:text-[#8895a7] -mt-3">Faca backup completo dos seus dados.</p>
            <div className="bg-white dark:bg-[#1a1f2b] p-5 rounded-xl border border-gray-100 dark:border-[#2d3545] space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-100 dark:bg-[#232938] rounded-xl"><Download className="h-6 w-6 text-gray-500" /></div>
                    <div>
                        <p className="font-medium text-gray-700 dark:text-[#e8ecf4]">Backup Completo</p>
                        <p className="text-xs text-gray-500 dark:text-[#8895a7] mt-0.5">Servicos, profissionais, clientes, agendamentos e configuracoes em JSON.</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-gray-50 dark:bg-[#232938] p-3 rounded-lg">
                        <p className="text-lg font-bold text-gray-900 dark:text-[#e8ecf4]">{services.length}</p>
                        <p className="text-[11px] text-gray-400">Servicos</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#232938] p-3 rounded-lg">
                        <p className="text-lg font-bold text-gray-900 dark:text-[#e8ecf4]">{professionals.length}</p>
                        <p className="text-[11px] text-gray-400">Profissionais</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#232938] p-3 rounded-lg">
                        <p className="text-lg font-bold text-gray-900 dark:text-[#e8ecf4]">{clients.length}</p>
                        <p className="text-[11px] text-gray-400">Clientes</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#232938] p-3 rounded-lg">
                        <p className="text-lg font-bold text-gray-900 dark:text-[#e8ecf4]">{appointments.length}</p>
                        <p className="text-[11px] text-gray-400">Agendamentos</p>
                    </div>
                </div>
                <Button onClick={handleExportData} className="w-full bg-[#50CAE6] hover:bg-[#45b0c9] h-11 gap-2">
                    <Download className="h-4 w-4" /> Exportar Dados
                </Button>
            </div>
        </div>
    );

    // ============================
    // MAIN MENU
    // ============================

    const renderMenu = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#e8ecf4]">Configuracoes</h2>

            {/* Link de Agendamento (sempre visivel) */}
            <Card className="border-[#50CAE6] border-2 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50/50 dark:from-[#50CAE6]/10 dark:to-[#232938] relative overflow-hidden dark:bg-[#232938]">
                <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none"><LinkIcon className="h-24 w-24 text-[#50CAE6]" /></div>
                <CardContent className="pt-5 space-y-3 relative">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-white dark:bg-[#1a1f2b] rounded-lg text-[#50CAE6] shadow-sm"><LinkIcon className="h-5 w-5" /></div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-[#e8ecf4]">Link de Agendamento</p>
                            <p className="text-xs text-gray-500 dark:text-[#8895a7]">Compartilhe com seus clientes</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-white dark:bg-[#1a1f2b] p-2 rounded-md border border-gray-200 dark:border-[#2d3545]">
                        <Input value={publicLink} readOnly className="border-0 bg-transparent focus-visible:ring-0 px-2 text-gray-600 dark:text-[#8895a7] font-medium" />
                        <Button size="sm" variant="ghost" onClick={handleCopyLink} className="shrink-0 text-gray-500 hover:text-[#50CAE6]">
                            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" className="w-full bg-white hover:bg-cyan-50 text-[#50CAE6] border-[#50CAE6]" onClick={onOpenPublicLink}>
                        <ExternalLink className="w-3 h-3 mr-2" /> Visualizar como cliente
                    </Button>
                </CardContent>
            </Card>

            {/* Negocio */}
            <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-[#5a6577] uppercase tracking-wider ml-4 mb-2">Negocio</p>
                <div className="bg-white dark:bg-[#1a1f2b] rounded-2xl border border-gray-100 dark:border-[#2d3545] shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-[#2d3545]">
                    <MenuItem icon={Store} label="Dados do Negocio" description="Nome, endereco, telefone e logo" iconColor="text-purple-600" iconBg="bg-purple-100 dark:bg-purple-900/30" onClick={() => openSection("business")} />
                    <MenuItem icon={Globe} label="Redes Sociais" description="Instagram, Facebook, TikTok, Maps" iconColor="text-pink-600" iconBg="bg-pink-100 dark:bg-pink-900/30" onClick={() => openSection("social")} />
                    <MenuItem icon={Clock} label="Horario de Funcionamento" description={`${Object.values(form.businessHours || {}).filter((d: any) => d.enabled).length} dias ativos`} iconColor="text-blue-600" iconBg="bg-blue-100 dark:bg-blue-900/30" onClick={() => openSection("hours")} />
                    <MenuItem icon={CalendarOff} label="Feriados e Folgas" description={form.blockedDates.length > 0 ? `${form.blockedDates.length} data(s) bloqueada(s)` : "Nenhuma data bloqueada"} iconColor="text-red-600" iconBg="bg-red-100 dark:bg-red-900/30" onClick={() => openSection("holidays")} badge={form.blockedDates.length > 0 ? <span className="text-[10px] bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 font-medium px-2 py-0.5 rounded-full">{form.blockedDates.length}</span> : undefined} />
                </div>
            </div>

            {/* Agendamento */}
            <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-[#5a6577] uppercase tracking-wider ml-4 mb-2">Agendamento</p>
                <div className="bg-white dark:bg-[#1a1f2b] rounded-2xl border border-gray-100 dark:border-[#2d3545] shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-[#2d3545]">
                    <MenuItem icon={Settings2} label="Opcoes de Agendamento" description="Regras, intervalos e limites" iconColor="text-cyan-600" iconBg="bg-cyan-100 dark:bg-cyan-900/30" onClick={() => openSection("booking")} />
                    <MenuItem icon={Palette} label="Pagina Publica" description="Cor, descricao e link" iconColor="text-indigo-600" iconBg="bg-indigo-100 dark:bg-indigo-900/30" onClick={() => openSection("publicpage")} />
                </div>
            </div>

            {/* WhatsApp */}
            <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-[#5a6577] uppercase tracking-wider ml-4 mb-2">WhatsApp</p>
                <div className="bg-white dark:bg-[#1a1f2b] rounded-2xl border border-gray-100 dark:border-[#2d3545] shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-[#2d3545]">
                    <MenuItem icon={MessageCircle} label="WhatsApp Business" description="Integracao, API e automacoes" iconColor="text-[#25D366]" iconBg="bg-[#25D366]/10" onClick={() => openSection("whatsapp")} badge={!checkingApi && (<span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", whatsappApiConfigured ? "bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400" : "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400")}>{whatsappApiConfigured ? "Conectado" : "Demo"}</span>)} />
                    <MenuItem icon={Type} label="Templates de Mensagem" description="Confirmacao, lembrete e pos-atendimento" iconColor="text-green-600" iconBg="bg-green-100 dark:bg-green-900/30" onClick={() => openSection("templates")} />
                </div>
            </div>

            {/* Sistema */}
            <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-[#5a6577] uppercase tracking-wider ml-4 mb-2">Sistema</p>
                <div className="bg-white dark:bg-[#1a1f2b] rounded-2xl border border-gray-100 dark:border-[#2d3545] shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-[#2d3545]">
                    <MenuItem icon={Bell} label="Notificacoes" description="Controle quais alertas receber" iconColor="text-amber-600" iconBg="bg-amber-100 dark:bg-amber-900/30" onClick={() => openSection("notifications")} />
                    <MenuItem icon={Sun} label="Aparencia" description={form.themeMode === "dark" ? "Tema escuro" : form.themeMode === "light" ? "Tema claro" : "Tema do sistema"} iconColor="text-indigo-600" iconBg="bg-indigo-100 dark:bg-indigo-900/30" onClick={() => openSection("appearance")} />
                    <MenuItem icon={Globe} label="Regional" description={`${form.currency} · ${form.language === "pt-BR" ? "Portugues" : form.language === "en-US" ? "English" : "Espanol"}`} iconColor="text-emerald-600" iconBg="bg-emerald-100 dark:bg-emerald-900/30" onClick={() => openSection("regional")} />
                </div>
            </div>

            {/* Conta */}
            <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-[#5a6577] uppercase tracking-wider ml-4 mb-2">Conta</p>
                <div className="bg-white dark:bg-[#1a1f2b] rounded-2xl border border-gray-100 dark:border-[#2d3545] shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-[#2d3545]">
                    <MenuItem icon={User} label="Perfil da Conta" description="Nome e email do proprietario" iconColor="text-slate-600" iconBg="bg-slate-100 dark:bg-slate-900/30" onClick={() => openSection("profile")} />
                    <MenuItem icon={CreditCard} label="Assinatura" description="Gerencie seu plano" iconColor="text-violet-600" iconBg="bg-violet-100 dark:bg-violet-900/30" onClick={() => onNavigate("subscription")} />
                    <MenuItem icon={Download} label="Exportar Dados" description="Backup em JSON" iconColor="text-gray-600" iconBg="bg-gray-100 dark:bg-gray-800" onClick={() => openSection("data")} />
                </div>
            </div>

            {/* Suporte */}
            <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-[#5a6577] uppercase tracking-wider ml-4 mb-2">Suporte</p>
                <div className="bg-white dark:bg-[#1a1f2b] rounded-2xl border border-gray-100 dark:border-[#2d3545] shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-[#2d3545]">
                    <MenuItem icon={MessageSquare} label="Falar com Desenvolvedor" description="Chat de suporte" iconColor="text-blue-600" iconBg="bg-blue-100 dark:bg-blue-900/30" onClick={handleSupportClick} />
                    <MenuItem icon={HelpCircle} label="Central de Ajuda" description="Perguntas frequentes e tutoriais" iconColor="text-gray-500" iconBg="bg-gray-100 dark:bg-gray-800" onClick={() => toast.info("Em breve!")} />
                </div>
            </div>

            {/* Sair */}
            <div className="pt-2 pb-4">
                <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 active:bg-red-100 transition-all text-left group">
                    <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500 shrink-0"><LogOut className="h-5 w-5" /></div>
                    <div className="flex-1">
                        <p className="font-medium text-red-500 text-[15px]">Sair</p>
                        <p className="text-xs text-red-300 dark:text-red-500/60 mt-0.5">Encerrar sessao</p>
                    </div>
                </button>
                <p className="text-center text-xs text-gray-300 dark:text-[#3d4556] mt-4">Versao 1.4.0 — Marquei+</p>
            </div>
        </div>
    );

    // ============================
    // RENDER
    // ============================

    const renderContent = () => {
        switch (activeSection) {
            case "business": return renderBusiness();
            case "social": return renderSocial();
            case "hours": return renderHours();
            case "holidays": return renderHolidays();
            case "booking": return renderBooking();
            case "publicpage": return renderPublicPage();
            case "whatsapp": return renderWhatsapp();
            case "templates": return renderTemplates();
            case "notifications": return renderNotifications();
            case "appearance": return renderAppearance();
            case "regional": return renderRegional();
            case "profile": return renderProfile();
            case "data": return renderData();
            default: return renderMenu();
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={activeSection || "menu"}
                initial={{ opacity: 0, x: activeSection ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeSection ? -20 : 20 }}
                transition={{ duration: 0.2 }}
            >
                {renderContent()}
            </motion.div>
        </AnimatePresence>
    );
}
