import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, User, Briefcase, UserCog, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/components/ui/utils";
import { useAppData, Appointment } from "@/context/AppDataContext";
import { toast } from "sonner";

const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
}).filter((t) => {
  const h = parseInt(t.split(":")[0]);
  return h >= 8 && h <= 20;
});

interface EditAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onSave: (updated: Appointment) => void;
}

export function EditAppointmentModal({
  open,
  onOpenChange,
  appointment,
  onSave,
}: EditAppointmentModalProps) {
  const { services, professionals, hasConflict } = useAppData();

  const [clientName, setClientName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [professional, setProfessional] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<"confirmed" | "pending" | "cancelled" | "completed" | "noshow">("confirmed");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (appointment) {
      setClientName(appointment.clientName);
      setServiceName(appointment.serviceName);
      setServiceId(appointment.serviceId || "");
      setProfessional(appointment.professional || "");
      setProfessionalId(appointment.professionalId || "");
      setDate(appointment.startTime);
      setTime(format(appointment.startTime, "HH:mm"));
      setStatus(appointment.status);
      setDurationMinutes(appointment.durationMinutes);
      setPrice(appointment.price);
    }
  }, [appointment]);

  const handleServiceChange = (id: string) => {
    const service = services.find((s) => s.id === id);
    if (service) {
      setServiceId(id);
      setServiceName(service.name);
      setPrice(service.price);
      setDurationMinutes(service.duration);
      // Reset professional if not linked to new service
      const linkedPros = professionals.filter(p => p.serviceIds?.includes(id));
      if (linkedPros.length > 0 && !linkedPros.some(p => p.id === professionalId)) {
        setProfessionalId(linkedPros[0].id);
        setProfessional(linkedPros[0].name);
      }
    }
  };

  const handleProfessionalChange = (id: string) => {
    const pro = professionals.find((p) => p.id === id);
    if (pro) {
      setProfessionalId(id);
      setProfessional(pro.name);
    }
  };

  const handleSave = () => {
    if (!appointment || !date || !time) return;

    const [hours, minutes] = time.split(":").map(Number);
    const newStartTime = new Date(date);
    newStartTime.setHours(hours, minutes, 0, 0);

    // Check for conflicts
    if (professionalId && hasConflict(professionalId, newStartTime, durationMinutes, appointment.id)) {
      toast.error("Conflito de horário!", {
        description: "Este profissional já tem um agendamento neste horário."
      });
      return;
    }

    onSave({
      ...appointment,
      clientName,
      serviceName,
      serviceId,
      professional,
      professionalId,
      startTime: newStartTime,
      durationMinutes,
      price,
      status,
    });
    onOpenChange(false);
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
          <DialogDescription>
            Altere os dados do agendamento abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto px-1">
          {/* Client Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <User className="h-4 w-4 text-gray-400" />
              Cliente
            </Label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome do cliente"
              className="h-11 rounded-xl border-gray-200 focus-visible:ring-[#50CAE6]"
            />
          </div>

          {/* Service */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <Briefcase className="h-4 w-4 text-gray-400" />
              Serviço
            </Label>
            <Select value={serviceId} onValueChange={handleServiceChange}>
              <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-[#50CAE6]">
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{s.name}</span>
                      <span className="text-xs text-gray-400">
                        R$ {s.price} · {s.duration}min
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Professional */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <UserCog className="h-4 w-4 text-gray-400" />
              Profissional
            </Label>
            <Select value={professionalId} onValueChange={handleProfessionalChange}>
              <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-[#50CAE6]">
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {(() => {
                  const filteredPros = serviceId
                    ? professionals.filter(p => p.serviceIds?.includes(serviceId))
                    : professionals;
                  const prosToShow = filteredPros.length > 0 ? filteredPros : professionals;
                  return prosToShow.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ));
                })()}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                Data
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start rounded-xl border-gray-200 font-normal",
                      !date && "text-gray-400"
                    )}
                  >
                    {date ? format(date, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700">
                <Clock className="h-4 w-4 text-gray-400" />
                Horário
              </Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-[#50CAE6]">
                  <SelectValue placeholder="Horário" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration & Price Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-700">Duração (min)</Label>
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={15}
                step={15}
                className="h-11 rounded-xl border-gray-200 focus-visible:ring-[#50CAE6]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Preço (R$)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                step={5}
                className="h-11 rounded-xl border-gray-200 focus-visible:ring-[#50CAE6]"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-gray-700">Status</Label>
            <div className="flex gap-2">
              {[
                { value: "confirmed" as const, label: "Confirmado", color: "bg-cyan-50 text-cyan-700 border-cyan-200 ring-cyan-100" },
                { value: "pending" as const, label: "Pendente", color: "bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-100" },
                { value: "cancelled" as const, label: "Cancelado", color: "bg-red-50 text-red-700 border-red-200 ring-red-100" },
                { value: "completed" as const, label: "Concluído", color: "bg-green-50 text-green-700 border-green-200 ring-green-100" },
                { value: "noshow" as const, label: "Não Compareceu", color: "bg-gray-50 text-gray-700 border-gray-200 ring-gray-100" },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={cn(
                    "flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all",
                    status === s.value
                      ? `${s.color} ring-2`
                      : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-gray-200"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#50CAE6] hover:bg-[#45b0c9] text-white rounded-xl gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}