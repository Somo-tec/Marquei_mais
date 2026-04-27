import React, { useState, useEffect } from "react";
import { 
    format, 
    addHours, 
    startOfToday, 
    addDays, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    startOfMonth, 
    endOfMonth, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths,
    subWeeks,
    addWeeks,
    subDays,
    setHours,
    setMinutes,
    isWithinInterval
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, X, ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import { cn } from "@/components/ui/utils";
import { AppointmentCard } from "@/components/AppointmentCard";
import { EditAppointmentModal } from "@/components/EditAppointmentModal";
import { toast } from "sonner";
import { useAppData, Appointment } from "@/context/AppDataContext";
import { AppointmentHoverTooltip } from "@/components/AppointmentHoverTooltip";

// Color rotation based on service name hash
const getServiceStyles = (serviceName: string, services?: any[]) => {
    const colors = ["cyan", "pink", "blue", "slate", "purple", "amber"];
    let hash = 0;
    for (let i = 0; i < serviceName.length; i++) {
        hash = serviceName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    const color = colors[colorIndex];

    switch (color) {
        case "cyan":
            return {
                bg: "bg-[#50CAE6]/10 dark:bg-[#50CAE6]/20",
                border: "border-[#50CAE6]",
                text: "text-gray-900 dark:text-[#e8ecf4]",
                subtext: "text-gray-600 dark:text-[#8895a7]",
                indicator: "bg-[#50CAE6]"
            };
        case "pink":
            return {
                bg: "bg-pink-100/50 dark:bg-pink-500/15",
                border: "border-pink-500",
                text: "text-pink-900 dark:text-pink-300",
                subtext: "text-pink-700 dark:text-pink-400",
                indicator: "bg-pink-500"
            };
        case "blue":
            return {
                bg: "bg-blue-100/50 dark:bg-blue-500/15",
                border: "border-blue-500",
                text: "text-blue-900 dark:text-blue-300",
                subtext: "text-blue-700 dark:text-blue-400",
                indicator: "bg-blue-500"
            };
        case "slate":
            return {
                bg: "bg-slate-100/80 dark:bg-slate-500/15",
                border: "border-slate-500",
                text: "text-slate-900 dark:text-slate-300",
                subtext: "text-slate-600 dark:text-slate-400",
                indicator: "bg-slate-500"
            };
        case "purple":
            return {
                bg: "bg-purple-100/50 dark:bg-purple-500/15",
                border: "border-purple-500",
                text: "text-purple-900 dark:text-purple-300",
                subtext: "text-purple-700 dark:text-purple-400",
                indicator: "bg-purple-500"
            };
        case "amber":
            return {
                bg: "bg-amber-100/50 dark:bg-amber-500/15",
                border: "border-amber-500",
                text: "text-amber-900 dark:text-amber-300",
                subtext: "text-amber-700 dark:text-amber-400",
                indicator: "bg-amber-500"
            };
        default:
            return {
                bg: "bg-[#50CAE6]/10 dark:bg-[#50CAE6]/20",
                border: "border-[#50CAE6]",
                text: "text-gray-900 dark:text-[#e8ecf4]",
                subtext: "text-gray-600 dark:text-[#8895a7]",
                indicator: "bg-[#50CAE6]"
            };
    }
};

const today = startOfToday();

type ViewType = "day" | "week" | "month";

export function Agenda() {
  const { appointments, services, professionals, updateAppointment, businessSettings } = useAppData();
  const [currentDate, setCurrentDate] = useState(today);
  const [view, setView] = useState<ViewType>("week");
  
  // Filters
  const [selectedProfessional, setSelectedProfessional] = useState("all");
  const [selectedService, setSelectedService] = useState("all");

  // Edit modal state
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Export State
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [exportEndDate, setExportEndDate] = useState<Date | undefined>(endOfMonth(new Date()));
  const [exportProfessional, setExportProfessional] = useState("all");
  const [exportService, setExportService] = useState("all");

  // Build filter lists from context data
  const professionalFilterList = [
    { id: "all", name: "Todos os Profissionais" },
    ...professionals.map(p => ({ id: p.id, name: p.name }))
  ];

  const serviceFilterList = [
    { id: "all", name: "Todos os Serviços" },
    ...services.map(s => ({ id: s.id, name: s.name }))
  ];

  const handleExport = () => {
    setIsExportOpen(false);
    toast.success("Relatório exportado com sucesso!", {
        description: "O arquivo CSV foi baixado para o seu dispositivo."
    });
  };

  const handleAppointmentClick = (apt: Appointment) => {
    setEditingAppointment(apt);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updated: Appointment) => {
    updateAppointment(updated.id, updated);
    toast.success("Agendamento atualizado com sucesso!");
  };

  // Filter Logic
  const filteredAppointments = appointments.filter(apt => {
      const matchProf = selectedProfessional === "all" || apt.professionalId === selectedProfessional;
      const matchService = selectedService === "all" || apt.serviceId === selectedService;
      return matchProf && matchService;
  });

  // Navigation Handlers
  const next = () => {
      if (view === "day") setCurrentDate(addDays(currentDate, 1));
      if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
      if (view === "month") setCurrentDate(addMonths(currentDate, 1));
  };

  const prev = () => {
      if (view === "day") setCurrentDate(subDays(currentDate, 1));
      if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
      if (view === "month") setCurrentDate(subMonths(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(today);

  const onDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
        prev();
    } else if (info.offset.x < -threshold) {
        next();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-between items-start md:items-center bg-white dark:bg-[#232938] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#2d3545] shrink-0">
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-[#e8ecf4] capitalize min-w-[200px] hover:bg-gray-50 dark:hover:bg-[#2a3142] rounded-lg px-2 py-1 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[#50CAE6]/20">
                        <span>
                            {view === "month" && format(currentDate, "MMMM yyyy", { locale: ptBR })}
                            {view === "week" && `Semana de ${format(startOfWeek(currentDate), "d MMM", { locale: ptBR })}`}
                            {view === "day" && format(currentDate, "d 'de' MMMM", { locale: ptBR })}
                        </span>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={currentDate}
                        onSelect={(date) => date && setCurrentDate(date)}
                        initialFocus
                        locale={ptBR}
                    />
                </PopoverContent>
            </Popover>

            <div className="flex items-center bg-gray-100 dark:bg-[#1a1f2b] rounded-lg p-0.5">
                <Button variant="ghost" size="icon" onClick={prev} className="h-7 w-7 rounded-md hover:bg-white dark:hover:bg-[#2a3142] hover:shadow-sm">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={goToToday} className="h-7 px-3 text-xs font-medium hover:bg-white dark:hover:bg-[#2a3142] hover:shadow-sm">
                    Hoje
                </Button>
                <Button variant="ghost" size="icon" onClick={next} className="h-7 w-7 rounded-md hover:bg-white dark:hover:bg-[#2a3142] hover:shadow-sm">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto items-center">
            {/* Filters */}
            <div className="flex gap-2 w-full md:w-auto">
                 <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                    <SelectTrigger className="w-full md:w-[180px] h-9 bg-white dark:bg-[#232938] border-gray-300 dark:border-[#2d3545] font-medium text-gray-700 dark:text-[#e8ecf4] shadow-sm focus:ring-[#50CAE6] focus:border-[#50CAE6]">
                        <SelectValue placeholder="Profissional" />
                    </SelectTrigger>
                    <SelectContent>
                        {professionalFilterList.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="w-full md:w-[180px] h-9 bg-white dark:bg-[#232938] border-gray-300 dark:border-[#2d3545] font-medium text-gray-700 dark:text-[#e8ecf4] shadow-sm focus:ring-[#50CAE6] focus:border-[#50CAE6]">
                        <SelectValue placeholder="Serviço" />
                    </SelectTrigger>
                    <SelectContent>
                        {serviceFilterList.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* View Toggle + Export */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex bg-gray-100 dark:bg-[#1a1f2b] p-1 rounded-lg shrink-0 border border-gray-200 dark:border-[#2d3545]">
                <button 
                    onClick={() => setView("day")}
                    className={cn(
                        "px-4 py-1.5 text-sm font-semibold rounded-md transition-all", 
                        view === "day" 
                            ? "bg-white dark:bg-[#232938] text-[#50CAE6] shadow-sm ring-1 ring-black/5 dark:ring-[#2d3545]" 
                            : "text-gray-500 dark:text-[#8895a7] hover:text-gray-700 dark:hover:text-[#e8ecf4] hover:bg-gray-200/50 dark:hover:bg-[#2a3142]"
                    )}
                >
                    Dia
                </button>
                <button 
                    onClick={() => setView("week")}
                    className={cn(
                        "px-4 py-1.5 text-sm font-semibold rounded-md transition-all", 
                        view === "week" 
                            ? "bg-white dark:bg-[#232938] text-[#50CAE6] shadow-sm ring-1 ring-black/5 dark:ring-[#2d3545]" 
                            : "text-gray-500 dark:text-[#8895a7] hover:text-gray-700 dark:hover:text-[#e8ecf4] hover:bg-gray-200/50 dark:hover:bg-[#2a3142]"
                    )}
                >
                    Semana
                </button>
                <button 
                    onClick={() => setView("month")}
                    className={cn(
                        "px-4 py-1.5 text-sm font-semibold rounded-md transition-all", 
                        view === "month" 
                            ? "bg-white dark:bg-[#232938] text-[#50CAE6] shadow-sm ring-1 ring-black/5 dark:ring-[#2d3545]" 
                            : "text-gray-500 dark:text-[#8895a7] hover:text-gray-700 dark:hover:text-[#e8ecf4] hover:bg-gray-200/50 dark:hover:bg-[#2a3142]"
                    )}
                >
                    Mês
                </button>
            </div>

            {/* Export Dialog */}
            <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="md:w-auto md:px-3 gap-2 bg-white dark:bg-[#232938] border-gray-200 dark:border-[#2d3545] text-gray-700 dark:text-[#e8ecf4] hover:bg-gray-50 dark:hover:bg-[#2a3142] shrink-0 h-9 w-9">
                        <Download className="h-4 w-4" />
                        <span className="hidden md:inline">Exportar</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Exportar Agendamentos</DialogTitle>
                        <DialogDescription>
                            Selecione o período e os filtros para gerar seu relatório.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Data Início</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !exportStartDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {exportStartDate ? format(exportStartDate, "dd/MM/yyyy") : <span>Selecione</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={exportStartDate} onSelect={setExportStartDate} initialFocus locale={ptBR} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>Data Fim</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !exportEndDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {exportEndDate ? format(exportEndDate, "dd/MM/yyyy") : <span>Selecione</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={exportEndDate} onSelect={setExportEndDate} initialFocus locale={ptBR} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Profissional</Label>
                             <Select value={exportProfessional} onValueChange={setExportProfessional}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o profissional" />
                                </SelectTrigger>
                                <SelectContent>
                                    {professionalFilterList.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                             <Label>Serviço</Label>
                             <Select value={exportService} onValueChange={setExportService}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o serviço" />
                                </SelectTrigger>
                                <SelectContent>
                                    {serviceFilterList.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportOpen(false)}>Cancelar</Button>
                        <Button onClick={handleExport} className="bg-[#50CAE6] hover:bg-[#45b0c9] text-white">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar CSV
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white dark:bg-[#232938] rounded-xl shadow-sm border border-gray-100 dark:border-[#2d3545] overflow-hidden relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={view + currentDate.toString()}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full w-full touch-pan-y"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={onDragEnd}
                >
                    {view === "day" && <DayView currentDate={currentDate} appointments={filteredAppointments} onAppointmentClick={handleAppointmentClick} />}
                    {view === "week" && <WeekView currentDate={currentDate} appointments={filteredAppointments} onAppointmentClick={handleAppointmentClick} />}
                    {view === "month" && <MonthView currentDate={currentDate} appointments={filteredAppointments} onDateClick={(date) => { setCurrentDate(date); setView("day"); }} />}
                </motion.div>
            </AnimatePresence>
      </div>

      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        appointment={editingAppointment}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

// --- Views Components ---

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

function DayView({ currentDate, appointments, onAppointmentClick }: { currentDate: Date, appointments: Appointment[], onAppointmentClick: (apt: Appointment) => void }) {
    // Filter for current day
    const dayAppointments = appointments.filter(apt => isSameDay(apt.startTime, currentDate));

    return (
        <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="relative min-h-[800px]">
                {HOURS.map(hour => (
                    <div key={hour} className="flex border-b border-gray-50 dark:border-[#2d3545]/50 h-[80px]">
                        <div className="w-16 flex-shrink-0 flex justify-center py-2 text-xs font-medium text-gray-400 dark:text-[#8895a7] border-r border-gray-50 dark:border-[#2d3545]/50">
                            {format(setHours(new Date(), hour), "HH:00")}
                        </div>
                        <div className="flex-1 relative p-1 group hover:bg-gray-50/50 dark:hover:bg-[#2a3142]/50 transition-colors">
                            {/* Slots */}
                        </div>
                    </div>
                ))}

                {/* Render Appointments Absolute */}
                {dayAppointments.map(apt => {
                    const startHour = apt.startTime.getHours();
                    const startMinute = apt.startTime.getMinutes();
                    const top = (startHour - 8) * 80 + (startMinute / 60) * 80;
                    const height = (apt.durationMinutes / 60) * 80;
                    const styles = getServiceStyles(apt.serviceName);

                    return (
                        <AppointmentHoverTooltip
                            key={apt.id}
                            appointment={apt}
                            style={{ top: `${top}px`, height: `${height}px`, left: "70px", right: "10px", position: "absolute" }}
                            className={`${styles.bg} border-l-4 ${styles.border} rounded-r-md p-2 hover:brightness-95 cursor-pointer transition-all overflow-hidden shadow-sm`}
                            onClick={() => onAppointmentClick(apt)}
                        >
                            <div className={`font-semibold text-sm ${styles.text} truncate`}>{apt.clientName}</div>
                            <div className={`text-xs ${styles.subtext} truncate`}>{apt.serviceName}</div>
                            <div className={`text-xs ${styles.subtext} mt-1 opacity-75`}>{format(apt.startTime, "HH:mm")} - {format(addHours(apt.startTime, apt.durationMinutes/60), "HH:mm")}</div>
                        </AppointmentHoverTooltip>
                    )
                })}

                {/* Current Time Line - Only visible if viewing today */}
                {isSameDay(currentDate, new Date()) && (
                    <CurrentTimeLine />
                )}
            </div>
        </div>
    )
}

function WeekView({ currentDate, appointments, onAppointmentClick }: { currentDate: Date, appointments: Appointment[], onAppointmentClick: (apt: Appointment) => void }) {
    const { businessSettings } = useAppData();
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start, end });
    const [selectedDay, setSelectedDay] = useState(
        days.find(d => isSameDay(d, new Date())) || days[0]
    );

    // Update selectedDay when week changes
    useEffect(() => {
        const todayInWeek = days.find(d => isSameDay(d, new Date()));
        setSelectedDay(todayInWeek || days[0]);
    }, [currentDate]);

    const selectedDayAppointments = appointments
        .filter(apt => isSameDay(apt.startTime, selectedDay))
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* ===== MOBILE LAYOUT (<768px) ===== */}
            <div className="md:hidden flex flex-col h-full">
                {/* Horizontal Day Selector */}
                <div className="flex border-b border-gray-100 dark:border-[#2d3545] shrink-0 bg-white dark:bg-[#232938] px-2 py-3 gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {days.map(day => {
                        const isToday = isSameDay(day, new Date());
                        const isSelected = isSameDay(day, selectedDay);
                        const dayAppts = appointments.filter(apt => isSameDay(apt.startTime, day));
                        return (
                            <button
                                key={day.toString()}
                                onClick={() => setSelectedDay(day)}
                                className={cn(
                                    "flex flex-col items-center gap-0.5 min-w-[3rem] px-2 py-2 rounded-xl transition-all relative",
                                    isSelected
                                        ? "bg-[#50CAE6] text-white shadow-md shadow-[#50CAE6]/30"
                                        : isToday
                                            ? "bg-[#50CAE6]/10 text-[#50CAE6]"
                                            : "text-gray-500 dark:text-[#8895a7] hover:bg-gray-50 dark:hover:bg-[#2a3142]"
                                )}
                            >
                                <span className={cn(
                                    "text-[10px] font-semibold uppercase tracking-wider",
                                    isSelected ? "text-white/80" : ""
                                )}>
                                    {format(day, "EEE", { locale: ptBR })}
                                </span>
                                <span className={cn(
                                    "text-lg font-bold leading-none",
                                    isSelected ? "text-white" : isToday ? "text-[#50CAE6]" : "text-gray-900 dark:text-[#e8ecf4]"
                                )}>
                                    {format(day, "d")}
                                </span>
                                {dayAppts.length > 0 && (
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full mt-0.5",
                                        isSelected ? "bg-white" : "bg-[#50CAE6]"
                                    )} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Day Label */}
                <div className="px-4 py-2.5 bg-gray-50/80 dark:bg-[#1a1f2b] border-b border-gray-100 dark:border-[#2d3545] flex items-center justify-between shrink-0">
                    <span className="text-sm font-semibold text-gray-700 dark:text-[#e8ecf4] capitalize">
                        {isSameDay(selectedDay, new Date())
                            ? "Hoje"
                            : format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })
                        }
                    </span>
                    <span className="text-xs text-gray-400 dark:text-[#8895a7] bg-white dark:bg-[#232938] px-2 py-0.5 rounded-full border border-gray-100 dark:border-[#2d3545] font-medium">
                        {selectedDayAppointments.length} agendamento{selectedDayAppointments.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Appointments List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {selectedDayAppointments.length > 0 ? (
                        selectedDayAppointments.map(apt => {
                            const styles = getServiceStyles(apt.serviceName);
                            const endTime = addHours(apt.startTime, apt.durationMinutes / 60);
                            return (
                                <div
                                    key={apt.id}
                                    className={cn(
                                        "flex items-stretch gap-3 p-3 rounded-xl border border-gray-100 dark:border-[#2d3545] bg-white dark:bg-[#232938] shadow-sm active:scale-[0.98] transition-all cursor-pointer",
                                        apt.status === "cancelled" && "opacity-50"
                                    )}
                                    onClick={() => onAppointmentClick(apt)}
                                >
                                    {/* Time Column */}
                                    <div className="flex flex-col items-center shrink-0 min-w-[3.2rem]">
                                        <span className="text-sm font-bold text-gray-900 dark:text-[#e8ecf4]">{format(apt.startTime, "HH:mm")}</span>
                                        <div className={cn("w-0.5 flex-1 my-1 rounded-full", styles.indicator)} />
                                        <span className="text-[11px] text-gray-400 dark:text-[#8895a7]">{format(endTime, "HH:mm")}</span>
                                    </div>

                                    {/* Divider */}
                                    <div className={cn("w-1 rounded-full shrink-0", styles.indicator)} />

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <span className="font-semibold text-gray-900 dark:text-[#e8ecf4] truncate">{apt.clientName}</span>
                                        <span className="text-sm text-gray-500 dark:text-[#8895a7] truncate">{apt.serviceName}</span>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full font-semibold border",
                                                apt.status === 'confirmed' ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/30' : '',
                                                apt.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500/30' : '',
                                                apt.status === 'cancelled' ? 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-100 dark:border-red-500/30' : ''
                                            )}>
                                                {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-[#8895a7] font-medium">
                                                {businessSettings?.currency || "R$"} {apt.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-[#8895a7]">
                            <CalendarIcon className="w-10 h-10 mb-3 opacity-30" />
                            <p className="text-sm font-medium">Nenhum agendamento</p>
                            <p className="text-xs mt-1">Este dia está livre</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== DESKTOP LAYOUT (>=768px) ===== */}
            <div className="hidden md:flex flex-col h-full overflow-hidden">
             {/* Scrollable Container */}
             <div className="flex-1 overflow-auto bg-white dark:bg-[#232938] relative">
                 <div className="min-w-[800px] h-full flex flex-col">
                     
                     {/* Header Days */}
                     <div className="flex border-b border-gray-100 dark:border-[#2d3545] shrink-0 h-14 sticky top-0 bg-white dark:bg-[#232938] z-20 shadow-sm dark:shadow-none">
                        <div className="w-14 shrink-0 border-r border-gray-100 dark:border-[#2d3545] bg-gray-50/50 dark:bg-[#1a1f2b]/50" />
                        {days.map(day => {
                            const isToday = isSameDay(day, new Date());
                            return (
                                <div 
                                    key={day.toString()} 
                                    className={cn(
                                        "flex-1 py-1 text-center border-r border-gray-100 dark:border-[#2d3545] last:border-r-0 flex flex-col items-center justify-center transition-colors min-w-[100px]",
                                        isToday ? "bg-[#50CAE6]/5 dark:bg-[#50CAE6]/10" : "bg-gray-50 dark:bg-[#1a1f2b]/50"
                                    )}
                                >
                                    <div className={cn("text-[10px] font-medium uppercase", isToday ? "text-[#50CAE6]" : "text-gray-400 dark:text-[#8895a7]")}>
                                        {format(day, "EEE", { locale: ptBR })}
                                    </div>
                                    <div className={cn(
                                        "text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center",
                                         isToday ? "bg-[#50CAE6] text-white shadow-sm" : "text-gray-900 dark:text-[#e8ecf4]"
                                    )}>
                                        {format(day, "d")}
                                    </div>
                                </div>
                            );
                        })}
                     </div>

                     {/* Grid */}
                     <div className="flex-1 relative bg-white dark:bg-[#232938] min-h-[800px]">
                        <div className="absolute inset-0 flex flex-col">
                            {HOURS.map((hour, index) => (
                                <div key={hour} className="flex-1 flex border-b border-gray-50 dark:border-[#2d3545]/50 min-h-0">
                                    <div className="w-14 shrink-0 flex items-start justify-center pt-1 text-[10px] font-medium text-gray-400 dark:text-[#8895a7] border-r border-gray-100 dark:border-[#2d3545] bg-white dark:bg-[#232938] z-10 sticky left-0">
                                        {hour}:00
                                    </div>
                                    {days.map(day => (
                                        <div 
                                            key={day.toString()} 
                                            className={cn(
                                                "flex-1 border-r border-gray-50 dark:border-[#2d3545]/50 last:border-r-0 relative transition-colors min-w-[100px]",
                                                isSameDay(day, new Date()) ? "bg-[#50CAE6]/5 dark:bg-[#50CAE6]/8 hover:bg-[#50CAE6]/10" : "hover:bg-gray-50/30 dark:hover:bg-[#2a3142]/30"
                                            )}
                                        >
                                            {/* Slot */}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                         {/* Render Appointments Absolute over the grid */}
                         <div className="absolute inset-0 w-full h-full pointer-events-none">
                            <div className="absolute left-14 right-0 top-0 bottom-0 pointer-events-auto"> 
                                {appointments.filter(apt => isWithinInterval(apt.startTime, { start, end })).map(apt => {
                                    const dayIndex = apt.startTime.getDay();
                                    const startHour = apt.startTime.getHours();
                                    const startMinute = apt.startTime.getMinutes();
                                    
                                    const slotCount = HOURS.length;
                                    const slotHeightPercent = 100 / slotCount;

                                    const hoursFromStart = (startHour - 8) + (startMinute / 60);
                                    const topPercent = hoursFromStart * slotHeightPercent;
                                    
                                    const durationHours = apt.durationMinutes / 60;
                                    const heightPercent = durationHours * slotHeightPercent;

                                    const widthPercent = (100/7);
                                    const leftPercent = (dayIndex * widthPercent);
                                    const styles = getServiceStyles(apt.serviceName);

                                    return (
                                        <AppointmentHoverTooltip 
                                            key={apt.id}
                                            appointment={apt}
                                            style={{ 
                                                top: `${topPercent}%`, 
                                                height: `${heightPercent}%`, 
                                                left: `${leftPercent}%`, 
                                                width: `${widthPercent}%`,
                                                position: 'absolute',
                                                zIndex: 10
                                            }}
                                            className="p-px"
                                            onClick={() => onAppointmentClick(apt)}
                                        >
                                            <div className={`w-full h-full ${styles.bg} border-l-[3px] ${styles.border} rounded-sm px-1 py-0.5 text-[10px] hover:brightness-95 cursor-pointer overflow-hidden leading-tight shadow-sm`}>
                                                <span className={`font-bold ${styles.text} block truncate`}>{apt.clientName}</span>
                                                <span className={`${styles.subtext} truncate opacity-90`}>{apt.serviceName}</span>
                                            </div>
                                        </AppointmentHoverTooltip>
                                    )
                                })}
                            </div>
                         </div>
                     </div>
                 </div>
             </div>
            </div>
        </div>
    )
}

function MonthView({ currentDate, appointments, onDateClick }: { currentDate: Date, appointments: Appointment[], onDateClick: (date: Date) => void }) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    // Calculate exactly how many weeks we need to display
    // Usually 5 or 6 weeks
    const totalDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weeksCount = Math.ceil(totalDays.length / 7);
    
    // Grid rows based on weeks count
    const gridRowsClass = weeksCount === 5 ? "grid-rows-5" : "grid-rows-6";

    const dateFormat = "d";
    const weeks = [];
    let days = [];
    let day = startDate;

    // Build the grid
    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            const formattedDate = format(day, dateFormat);
            const cloneDay = day;
            
            const dayAppts = appointments.filter(apt => isSameDay(apt.startTime, cloneDay));
            const isToday = isSameDay(day, new Date());
            const isSelectedMonth = isSameMonth(day, monthStart);

            days.push(
                <div
                    key={day.toString()}
                    className={cn(
                        "relative group transition-colors cursor-pointer flex flex-col gap-0.5 p-1 border-r border-b border-gray-100 dark:border-[#2d3545] last:border-r-0",
                        !isSelectedMonth ? "bg-gray-50/40 dark:bg-[#1a1f2b]/40 text-gray-300 dark:text-[#8895a7]/50" : "bg-white dark:bg-[#232938] hover:bg-gray-50 dark:hover:bg-[#2a3142]",
                        isToday ? "bg-cyan-50/10 dark:bg-[#50CAE6]/5" : ""
                    )}
                    onClick={() => onDateClick(cloneDay)}
                >
                    <div className="flex justify-between items-start mb-0.5">
                        <span className={cn(
                            "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full",
                            isToday ? "bg-[#50CAE6] text-white" : "text-gray-700 dark:text-[#e8ecf4]"
                        )}>
                            {formattedDate}
                        </span>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                        {dayAppts.slice(0, 4).map(apt => {
                             const styles = getServiceStyles(apt.serviceName);
                             return (
                                <div key={apt.id} className={`text-[9px] ${styles.bg} ${styles.text} px-1 rounded-sm truncate border border-transparent leading-tight py-px`}>
                                    {apt.clientName}
                                </div>
                             )
                        })}
                        {dayAppts.length > 4 && (
                             <div className="text-[8px] text-gray-400 dark:text-[#8895a7] px-1">+ {dayAppts.length - 4}</div>
                        )}
                    </div>
                </div>
            );
            day = addDays(day, 1);
        }
        weeks.push(days);
        days = [];
    }

    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-[#2d3545] shrink-0">
                {weekDays.map(day => (
                    <div key={day} className="py-2 text-center text-[10px] font-bold text-gray-400 dark:text-[#8895a7] uppercase tracking-wider bg-gray-50/50 dark:bg-[#1a1f2b]/50">
                        {day}
                    </div>
                ))}
            </div>
            
            {/* Calendar Grid - Full Height No Scroll */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 min-h-[600px] overflow-auto">
                {weeks.flat()}
            </div>
        </div>
    );
}

function CurrentTimeLine() {
    const [now, setNow] = useState(new Date());

    React.useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const startHour = 8;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Only show if within working hours, extended slightly to cover 8:00 - 21:00
    if (currentHour < 8 || currentHour > 21) return null;

    const top = (currentHour - startHour) * 80 + (currentMinute / 60) * 80;

    return (
        <div 
            className="absolute left-16 right-0 border-t-2 border-red-500 z-20 pointer-events-none flex items-center shadow-[0_0_8px_rgba(239,68,68,0.4)]"
            style={{ top: `${top}px` }}
        >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shadow-sm" />
            <div className="absolute left-0 -top-5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {format(now, "HH:mm")}
            </div>
        </div>
    )
}