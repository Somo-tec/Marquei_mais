import React, { useState } from "react";
import { format, addHours, startOfToday, isSameDay, addMinutes, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
    Calendar as CalendarIcon, 
    Plus, 
    Link as LinkIcon, 
    ExternalLink, 
    Copy, 
    ChevronDown, 
    Settings,
    AlertCircle,
    Check,
    X,
    Clock,
    CalendarClock,
    ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "motion/react";
import { AppointmentCard } from "@/components/AppointmentCard";
import { EditAppointmentModal } from "@/components/EditAppointmentModal";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAppData, Appointment } from "@/context/AppDataContext";

export function Dashboard({ 
    onNewAppointment, 
    onNavigate,
    onOpenPublicLink
}: { 
    onNewAppointment: () => void; 
    onNavigate?: (page: string, data?: { phone: string; contactName: string; message: string }) => void;
    onOpenPublicLink?: () => void;
}) {
  const { appointments, updateAppointment, getAppointmentsByDate, businessSettings, clients } = useAppData();
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newDate, setNewDate] = useState<Date | undefined>(new Date());
  const [newTime, setNewTime] = useState("");

  const todayAppointments = getAppointmentsByDate(currentDate);
  const calendarDayAppointments = getAppointmentsByDate(currentDate);
  
  // Next appointment: first try the selected day (if today or future), then any future day globally
  const now = new Date();
  
  // If we want the global next appointment regardless of the selected date:
  const nextAppointment = appointments
    .filter(a => a.startTime > now && a.status !== 'cancelled')
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0];
  
  const nextIsToday = nextAppointment ? isSameDay(nextAppointment.startTime, now) : false;
  
  const pendingAppointments = todayAppointments.filter(a => a.status === 'pending');
  // Also show pending from other days
  const allPendingAppointments = appointments.filter(a => a.status === 'pending');
  const pendingCount = allPendingAppointments.length;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const copyLink = async () => {
    const slug = businessSettings.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const link = `marquei.mais/${slug}`;
    try {
        await navigator.clipboard.writeText(link);
        toast.success("Link copiado para a área de transferência!");
    } catch (err) {
        console.error("Clipboard failed:", err);
        toast.error("Não foi possível copiar. Link: " + link);
    }
  };

  const handleEdit = (id: string) => {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      setEditingAppointment(apt);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = (updated: Appointment) => {
    updateAppointment(updated.id, updated);
    toast.success("Agendamento atualizado com sucesso!");
  };

  const handleCancel = (id: string) => {
    updateAppointment(id, { status: 'cancelled' });
    toast.error("Agendamento cancelado");
  };

  const handleMarkCompleted = (id: string) => {
    updateAppointment(id, { status: 'completed' });
    toast.success("Atendimento marcado como concluído!");
  };

  const handleMarkNoShow = (id: string) => {
    updateAppointment(id, { status: 'noshow' });
    toast("Cliente marcado como não compareceu.", { icon: "⚠️" });
  };

  const confirmAppointment = (id: string) => {
    updateAppointment(id, { status: 'confirmed' });
    toast.success("Agendamento confirmado!");
    if (allPendingAppointments.length === 1) setIsPendingModalOpen(false);
  };

  const rejectAppointment = (id: string) => {
    updateAppointment(id, { status: 'cancelled' });
    toast.info("Solicitação recusada.");
    if (allPendingAppointments.length === 1) setIsPendingModalOpen(false);
  };

  const handleRescheduleClick = (apt: Appointment) => {
    if (reschedulingId === apt.id) {
        setReschedulingId(null);
    } else {
        setReschedulingId(apt.id);
        setNewDate(apt.startTime);
        setNewTime(format(apt.startTime, "HH:mm"));
    }
  };

  const submitReschedule = (id: string) => {
    if (!newDate || !newTime) {
        toast.error("Selecione data e hora");
        return;
    }

    // Find the appointment and client to build the WhatsApp message
    const apt = allPendingAppointments.find(a => a.id === id);
    if (!apt) return;

    const client = clients.find(c => c.id === apt.clientId);
    const clientPhone = client?.phone?.replace(/\D/g, "") || "";
    const normalizedPhone = clientPhone.startsWith("55") ? clientPhone : `55${clientPhone}`;
    const clientFirstName = apt.clientName.split(" ")[0];
    const formattedDate = format(newDate, "dd/MM/yyyy");
    const message = `Ola ${clientFirstName}! Tudo bem? Aqui e do *${businessSettings.name}*. Sobre seu agendamento de *${apt.serviceName}*, gostaríamos de sugerir um novo horario: *${formattedDate} as ${newTime}*. Esse horario fica bom pra voce? Aguardamos sua confirmacao!`;

    setReschedulingId(null);
    setIsPendingModalOpen(false);

    // Navigate to WhatsApp with pre-filled message
    if (onNavigate) {
      onNavigate("whatsapp", {
        phone: normalizedPhone,
        contactName: apt.clientName,
        message,
      });
    }

    toast.success("Redirecionando para o WhatsApp com a sugestão...");
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8ecf4]">Início</h1>
         <Popover>
            <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[#8895a7] hover:text-gray-900 dark:hover:text-[#e8ecf4] hover:bg-gray-50 dark:hover:bg-[#232938] px-2 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#50CAE6]/20">
                    <span>{format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={(date) => date && setCurrentDate(date)}
                    initialFocus
                    locale={ptBR}
                    footer={
                        <div className="pt-3 mt-3 border-t border-gray-100">
                             <div className="flex items-center justify-between mb-2 px-1">
                                <span className="text-xs font-semibold text-gray-700">Agenda do dia</span>
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">{calendarDayAppointments.filter(a => a.status !== 'cancelled').length}</span>
                             </div>
                             <div className="space-y-1 mb-3 max-h-[120px] overflow-y-auto px-1">
                                {calendarDayAppointments.filter(a => a.status !== 'cancelled').length > 0 ? (
                                    calendarDayAppointments.filter(a => a.status !== 'cancelled').map(apt => (
                                        <div key={apt.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-gray-50/50 border border-gray-100/50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#50CAE6] shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{apt.clientName}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{apt.serviceName}</p>
                                            </div>
                                            <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{format(apt.startTime, "HH:mm")}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 text-center py-2">Livre</p>
                                )}
                             </div>
                             <Button 
                                size="sm" 
                                className="w-full bg-[#50CAE6] hover:bg-[#45b0c9] text-white h-8 text-xs font-medium rounded-lg"
                                onClick={() => onNavigate?.("agenda")}
                             >
                                Ver Agenda Completa
                             </Button>
                        </div>
                    }
                />
            </PopoverContent>
         </Popover>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Appointments Count */}
        <motion.div variants={item}>
            <Card className="p-4 border-none dark:border dark:border-[#2d3545] shadow-sm bg-white dark:bg-[#232938] rounded-2xl h-full flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                    <span className="text-gray-500 dark:text-[#8895a7] text-xs font-medium uppercase tracking-wider">Agendamentos</span>
                    <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg">
                        <CalendarIcon className="w-4 h-4" />
                    </div>
                </div>
                <div className="mt-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-[#e8ecf4]">{todayAppointments.filter(a => a.status !== 'cancelled').length}</span>
                    <span className="text-xs text-gray-400 dark:text-[#8895a7] ml-1">
                        {isSameDay(currentDate, startOfToday()) ? "hoje" : format(currentDate, "dd/MM")}
                    </span>
                </div>
            </Card>
        </motion.div>

        {/* Next Client */}
        <motion.div variants={item}>
            <Card className="p-4 border-none dark:border dark:border-[#2d3545] shadow-sm bg-white dark:bg-[#232938] rounded-2xl h-full flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#50CAE6]/20 to-transparent rounded-bl-full -mr-4 -mt-4" />
                
                <div className="flex items-start justify-between relative z-10">
                    <span className="text-gray-500 dark:text-[#8895a7] text-xs font-medium uppercase tracking-wider">Próximo Cliente</span>
                </div>
                <div className="mt-2 relative z-10">
                    <span className="text-lg font-bold text-gray-900 dark:text-[#e8ecf4] block truncate">
                        {nextAppointment ? format(nextAppointment.startTime, "HH:mm") : "--:--"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-[#8895a7] truncate block">
                        {nextAppointment 
                          ? nextIsToday 
                            ? nextAppointment.clientName 
                            : `${nextAppointment.clientName} · ${format(nextAppointment.startTime, "d/MM")}`
                          : "Agenda Livre"}
                    </span>
                </div>
            </Card>
        </motion.div>
      </div>

      {/* Pending Actions / Notifications */}
      <AnimatePresence>
      {pendingCount > 0 && (
          <motion.div 
            variants={item}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl p-4 flex items-center justify-between shadow-sm cursor-pointer" onClick={() => setIsPendingModalOpen(true)}>
                <div className="flex items-center gap-3">
                    <div className="bg-orange-100 text-orange-600 p-2 rounded-full animate-pulse">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-orange-900">Solicitações Pendentes</p>
                        <p className="text-xs text-orange-700">
                            {pendingCount} cliente{pendingCount > 1 ? 's' : ''} aguardando confirmação
                        </p>
                    </div>
                </div>
                <Button size="sm" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none shadow-none">
                    Revisar
                </Button>
            </div>
          </motion.div>
      )}
      </AnimatePresence>

      {/* Sharing Section */}
      <motion.div variants={item}>
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-5 rounded-2xl shadow-md text-white relative overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
             <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white opacity-10 rounded-full blur-xl"></div>
             
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-cyan-100" />
                        <h3 className="font-bold text-lg">Link de Agendamento</h3>
                    </div>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-cyan-100 hover:text-white hover:bg-white/10 rounded-full"
                        onClick={() => onNavigate?.("settings")}
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-cyan-50 text-sm mb-4 leading-relaxed max-w-[90%]">
                    Seu cliente agenda sozinho nos horários livres. Compartilhe seu link.
                </p>
                <div className="flex gap-2">
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white text-cyan-600 hover:bg-cyan-50 border-none shadow-sm"
                        onClick={copyLink}
                    >
                        <Copy className="w-3 h-3 mr-2" /> Copiar
                    </Button>
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-cyan-600 text-white hover:bg-cyan-700 border-none shadow-sm"
                        onClick={onOpenPublicLink}
                    >
                        <ExternalLink className="w-3 h-3 mr-2" /> Abrir
                    </Button>
                </div>
             </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4">
          <Button 
            className="h-auto py-4 flex flex-col items-center gap-2 bg-gray-900 dark:bg-[#232938] dark:border dark:border-[#2d3545] hover:bg-gray-800 dark:hover:bg-[#2a3142] text-white border-none shadow-md transition-transform hover:scale-[1.02]"
            onClick={onNewAppointment}
          >
            <Plus className="w-6 h-6" />
            <span className="font-medium">Novo Agendamento</span>
          </Button>
           <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2 bg-white dark:bg-[#232938] border-gray-100 dark:border-[#2d3545] shadow-sm hover:bg-gray-50 dark:hover:bg-[#2a3142] text-gray-700 dark:text-[#e8ecf4] transition-transform hover:scale-[1.02]"
            onClick={() => onNavigate?.("agenda")}
          >
            <CalendarIcon className="w-6 h-6 text-[#50CAE6]" />
            <span className="font-medium">Ver Agenda</span>
          </Button>
      </motion.div>

      {/* Day's Short View */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-[#e8ecf4] flex items-center gap-2">
                {isSameDay(currentDate, startOfToday()) ? "Hoje" : format(currentDate, "EEEE", { locale: ptBR }).replace('-feira', '')}
                <Badge variant="secondary" className="text-xs font-normal">
                    {format(currentDate, "d MMM", { locale: ptBR })}
                </Badge>
            </h2>
            <Button variant="ghost" size="sm" className="text-[#50CAE6] hover:text-[#45b0c9] hover:bg-cyan-50 dark:hover:bg-[#50CAE6]/10" onClick={() => onNavigate?.("agenda")}>
                Ver tudo
            </Button>
        </div>
        
        <div className="space-y-3">
            {todayAppointments
              .filter(a => a.status !== 'cancelled')
              .sort((a, b) => {
                const aEnd = addMinutes(a.startTime, a.durationMinutes);
                const bEnd = addMinutes(b.startTime, b.durationMinutes);
                const aPast = isPast(aEnd);
                const bPast = isPast(bEnd);
                const aResolved = a.status === 'completed' || a.status === 'noshow';
                const bResolved = b.status === 'completed' || b.status === 'noshow';
                const aNeedsAction = aPast && !aResolved;
                const bNeedsAction = bPast && !bResolved;
                // Needs action first
                if (aNeedsAction && !bNeedsAction) return -1;
                if (!aNeedsAction && bNeedsAction) return 1;
                // Then upcoming (not past)
                if (!aPast && bPast && bResolved) return -1;
                if (aPast && aResolved && !bPast) return 1;
                // Within same group, sort by time
                return a.startTime.getTime() - b.startTime.getTime();
              })
              .map((apt) => (
                <AppointmentCard 
                    key={apt.id} 
                    appointment={apt} 
                    variant="compact" 
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onConfirm={confirmAppointment}
                    onMarkCompleted={handleMarkCompleted}
                    onMarkNoShow={handleMarkNoShow}
                />
            ))}
             {todayAppointments.filter(a => a.status !== 'cancelled').length === 0 && (
                <div className="text-center py-8 text-gray-400 bg-white dark:bg-[#232938] rounded-xl border border-gray-50 dark:border-[#2d3545]">
                    <p>{isSameDay(currentDate, startOfToday()) ? "Sem agendamentos hoje." : "Sem agendamentos nesta data."}</p>
                </div>
            )}
        </div>
      </motion.div>
      
      {/* Spacer for FAB */}
      <div className="h-20" />

      {/* Pending Approvals Modal */}
      <Dialog open={isPendingModalOpen} onOpenChange={setIsPendingModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
                <DialogTitle>Solicitações Pendentes</DialogTitle>
                <DialogDescription>
                    Gerencie os pedidos de agendamento recebidos.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
                <AnimatePresence>
                {allPendingAppointments.map((apt) => (
                    <motion.div 
                        key={apt.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0, paddingBottom: 0 }}
                        className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-gray-900">{apt.clientName}</h4>
                                <p className="text-sm text-gray-500">{apt.serviceName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{format(apt.startTime, "HH:mm")}</p>
                                <p className="text-xs text-gray-400">{format(apt.startTime, "d/MM")}</p>
                            </div>
                        </div>

                        {/* Standard View */}
                        {reschedulingId !== apt.id && (
                            <>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Duração estimada: {apt.durationMinutes} min</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    <Button 
                                        className="col-span-1 bg-red-50 text-red-600 hover:bg-red-100 border-none h-9 px-0"
                                        variant="outline"
                                        title="Recusar"
                                        onClick={() => rejectAppointment(apt.id)}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                    <Button 
                                        className="col-span-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none h-9 text-xs"
                                        variant="outline"
                                        onClick={() => handleRescheduleClick(apt)}
                                    >
                                        <CalendarClock className="w-4 h-4 mr-1.5" /> Sugerir Horário
                                    </Button>
                                    <Button 
                                        className="col-span-1 bg-green-600 text-white hover:bg-green-700 h-9 px-0"
                                        title="Confirmar"
                                        onClick={() => confirmAppointment(apt.id)}
                                    >
                                        <Check className="w-5 h-5" />
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Reschedule View */}
                        {reschedulingId === apt.id && (
                             <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                             >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-gray-700">Propor novo horário</span>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setReschedulingId(null)}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-gray-500 mb-1 block">Nova Data</Label>
                                        <div className="flex gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left text-xs h-9 bg-white">
                                                        <CalendarIcon className="mr-2 h-3 w-3" />
                                                        {newDate ? format(newDate, "dd/MM/yyyy") : <span>Selecione</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={newDate}
                                                        onSelect={setNewDate}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-500 mb-1 block">Novo Horário</Label>
                                        <Input 
                                            type="time" 
                                            className="h-9 bg-white text-xs"
                                            value={newTime}
                                            onChange={(e) => setNewTime(e.target.value)}
                                        />
                                    </div>
                                    <Button className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 mt-2" onClick={() => submitReschedule(apt.id)}>
                                        Enviar Sugestão <ArrowRight className="w-3 h-3 ml-2" />
                                    </Button>
                                </div>
                             </motion.div>
                        )}

                    </motion.div>
                ))}
                </AnimatePresence>
                {allPendingAppointments.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <Check className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Tudo em dia! Nenhuma solicitação pendente.</p>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsPendingModalOpen(false)} className="w-full">
                    Fechar
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Modal */}
      <EditAppointmentModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        appointment={editingAppointment}
        onSave={handleSaveEdit}
      />
    </motion.div>
  );
}