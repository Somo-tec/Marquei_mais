import React, { useState, useMemo } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, User, Check, Calendar as CalendarIcon, Clock, ChevronLeft, UserCog, Briefcase, Plus } from "lucide-react";
import { format, setHours, setMinutes, addDays, startOfToday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { useAppData } from "@/context/AppDataContext";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";

interface NewAppointmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewAppointment({ open, onOpenChange }: NewAppointmentProps) {
  const { clients, services, professionals, addAppointment, addClient, getAvailableSlots, hasConflict, businessSettings } = useAppData();

  const [step, setStep] = useState<"client" | "service" | "professional" | "datetime" | "confirm">("client");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // New client inline form
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedProfessional = professionals.find(p => p.id === selectedProfessionalId);

  // Available time slots based on professional & date
  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedProfessionalId || !selectedService) return [];
    return getAvailableSlots(selectedDate, selectedProfessionalId, selectedService.duration);
  }, [selectedDate, selectedProfessionalId, selectedService, getAvailableSlots]);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const resetFlow = () => {
    setStep("client");
    setSelectedClientId(null);
    setSelectedServiceId(null);
    setSelectedProfessionalId(null);
    setSelectedDate(new Date());
    setSelectedTime(null);
    setSearchTerm("");
    setIsAddingNewClient(false);
    setNewClientName("");
    setNewClientPhone("");
  };

  const handleClientSelect = (id: string) => {
    setSelectedClientId(id);
    setStep("service");
  };

  const handleAddNewClient = async () => {
    if (!newClientName.trim() || !newClientPhone.trim()) {
      toast.error("Preencha nome e telefone do cliente.");
      return;
    }
    const newClientId = await addClient({
      name: newClientName,
      email: "",
      phone: newClientPhone,
      status: "active",
    });
    setSelectedClientId(newClientId);
    setIsAddingNewClient(false);
    setNewClientName("");
    setNewClientPhone("");
    toast.success("Cliente cadastrado!");
    setStep("service");
  };

  const handleServiceSelect = (id: string) => {
    setSelectedServiceId(id);
    setStep("professional");
  };

  const handleProfessionalSelect = (id: string) => {
    setSelectedProfessionalId(id);
    setStep("datetime");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("confirm");
  };

  const handleBack = () => {
    switch (step) {
      case "service": setStep("client"); break;
      case "professional": setStep("service"); break;
      case "datetime": setStep("professional"); break;
      case "confirm": setStep("datetime"); break;
    }
  };

  const handleConfirm = async () => {
    if (!selectedClient || !selectedService || !selectedProfessional || !selectedDate || !selectedTime) {
      toast.error("Preencha todos os campos.");
      return;
    }

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const startTime = setMinutes(setHours(new Date(selectedDate), hours), minutes);
    startTime.setSeconds(0, 0);

    // Final conflict check
    if (hasConflict(selectedProfessional.id, startTime, selectedService.duration)) {
      toast.error("Conflito de horário! Este profissional já tem um agendamento neste horário.");
      return;
    }

    await addAppointment({
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      professionalId: selectedProfessional.id,
      professional: selectedProfessional.name,
      startTime,
      durationMinutes: selectedService.duration,
      status: "confirmed",
      price: selectedService.price,
    });

    toast.success("Agendamento criado com sucesso!", {
      description: `${selectedClient.name} · ${selectedService.name} · ${format(startTime, "dd/MM 'às' HH:mm")}`,
    });

    onOpenChange(false);
    resetFlow();
  };

  // Generate next 14 days for quick date selection
  const nextDays = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i));

  return (
    <Drawer open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetFlow(); }}>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="text-left">
          <div className="flex items-center gap-3">
            {step !== "client" && (
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={handleBack}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <DrawerTitle>
                {step === "client" && "Quem é o cliente?"}
                {step === "service" && "Qual o serviço?"}
                {step === "professional" && "Qual profissional?"}
                {step === "datetime" && "Quando?"}
                {step === "confirm" && "Confirmar agendamento"}
              </DrawerTitle>
              <DrawerDescription>
                {step === "client" && "Busque pelo nome ou adicione novo."}
                {step === "service" && "Selecione o procedimento."}
                {step === "professional" && "Escolha quem vai atender."}
                {step === "datetime" && "Selecione data e horário disponível."}
                {step === "confirm" && "Revise os dados antes de confirmar."}
              </DrawerDescription>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex gap-1 mt-3">
            {["client", "service", "professional", "datetime", "confirm"].map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  i <= ["client", "service", "professional", "datetime", "confirm"].indexOf(step)
                    ? "bg-[#50CAE6]"
                    : "bg-gray-200"
                )}
              />
            ))}
          </div>
        </DrawerHeader>

        <div className="p-4 flex-1 overflow-y-auto">
          {/* Step 1: Client */}
          {step === "client" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cliente..."
                  className="pl-9 bg-gray-50 border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {!isAddingNewClient ? (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-[#50CAE6] border-dashed border-[#50CAE6] bg-cyan-50/50 hover:bg-cyan-50"
                    onClick={() => setIsAddingNewClient(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Novo Cliente
                  </Button>
                  {filteredClients.map(client => (
                    <Button
                      key={client.id}
                      variant="ghost"
                      className="w-full justify-start font-normal h-14"
                      onClick={() => handleClientSelect(client.id)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-gray-900 font-medium">{client.name}</span>
                        <span className="text-gray-400 text-xs">{client.phone}</span>
                      </div>
                    </Button>
                  ))}
                  {filteredClients.length === 0 && searchTerm && (
                    <p className="text-center text-sm text-gray-400 py-4">Nenhum cliente encontrado.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="font-semibold text-gray-700 text-sm">Cadastro Rápido</h4>
                  <Input
                    placeholder="Nome do cliente *"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                  <Input
                    placeholder="Telefone *"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setIsAddingNewClient(false)}>Cancelar</Button>
                    <Button className="flex-1 bg-[#50CAE6] hover:bg-[#45b0c9] text-white" onClick={handleAddNewClient}>Cadastrar</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Service */}
          {step === "service" && (
            <div className="space-y-2">
              {services.map(service => (
                <Button
                  key={service.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-between font-normal h-16 border border-gray-100 rounded-xl mb-2 hover:border-[#50CAE6] hover:bg-cyan-50/30",
                    selectedServiceId === service.id && "border-[#50CAE6] bg-cyan-50/50"
                  )}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-gray-900 font-medium">{service.name}</span>
                    <span className="text-gray-400 text-xs">{service.duration} min</span>
                  </div>
                  <span className="font-semibold text-gray-900">{businessSettings.currency || "R$"} {service.price}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Step 3: Professional */}
          {step === "professional" && (() => {
            const filteredPros = selectedServiceId
              ? professionals.filter(p => p.serviceIds?.includes(selectedServiceId))
              : professionals;
            const prosToShow = filteredPros.length > 0 ? filteredPros : professionals;

            return (
              <div className="space-y-2">
                {filteredPros.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2">
                    <p className="text-xs text-amber-700">Nenhum profissional está vinculado a este serviço. Mostrando todos os profissionais.</p>
                  </div>
                )}
                {prosToShow.map(pro => (
                  <Button
                    key={pro.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start font-normal h-16 border border-gray-100 rounded-xl mb-2 hover:border-[#50CAE6] hover:bg-cyan-50/30",
                      selectedProfessionalId === pro.id && "border-[#50CAE6] bg-cyan-50/50"
                    )}
                    onClick={() => handleProfessionalSelect(pro.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-[#50CAE6] font-bold text-sm">
                        {pro.initials}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-gray-900 font-medium">{pro.name}</span>
                        <span className="text-gray-400 text-xs">{pro.roles.join(", ")}</span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            );
          })()}

          {/* Step 4: Date & Time */}
          {step === "datetime" && (
            <div className="space-y-6">
              {/* Horizontal Date Selector */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Data</Label>
                <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                  {nextDays.map(day => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    return (
                      <button
                        key={day.toString()}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "flex flex-col items-center min-w-[3.5rem] px-2 py-2.5 rounded-xl transition-all shrink-0",
                          isSelected
                            ? "bg-[#50CAE6] text-white shadow-md"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        <span className={cn("text-[10px] font-semibold uppercase", isSelected ? "text-white/70" : "text-gray-400")}>
                          {format(day, "EEE", { locale: ptBR })}
                        </span>
                        <span className={cn("text-lg font-bold", isSelected ? "text-white" : "")}>
                          {format(day, "d")}
                        </span>
                        <span className={cn("text-[10px]", isSelected ? "text-white/70" : "text-gray-400")}>
                          {format(day, "MMM", { locale: ptBR })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Horários Disponíveis
                  <span className="text-xs font-normal text-gray-400 ml-auto">
                    {availableSlots.length} horário{availableSlots.length !== 1 ? "s" : ""}
                  </span>
                </Label>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map(time => (
                      <Button
                        key={time}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "transition-all",
                          selectedTime === time
                            ? "bg-[#50CAE6] text-white border-[#50CAE6] hover:bg-[#45b0c9]"
                            : "hover:border-[#50CAE6] hover:text-[#50CAE6]"
                        )}
                        onClick={() => handleTimeSelect(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                    <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    {selectedDate && selectedProfessional && (() => {
                      const daySchedule = selectedProfessional.workingHours?.[selectedDate.getDay()];
                      const isOff = !daySchedule || !daySchedule.enabled;
                      return isOff ? (
                        <>
                          <p className="text-sm text-gray-400">Profissional de folga neste dia.</p>
                          <p className="text-xs text-gray-400 mt-1">Escolha outra data.</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-400">Sem horários disponíveis neste dia.</p>
                          <p className="text-xs text-gray-400 mt-1">Tente outra data.</p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Confirm */}
          {step === "confirm" && selectedClient && selectedService && selectedProfessional && selectedDate && selectedTime && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#50CAE6]/10 flex items-center justify-center">
                    <User className="text-[#50CAE6] w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Cliente</span>
                    <span className="font-semibold text-gray-900">{selectedClient.name}</span>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#50CAE6]/10 flex items-center justify-center">
                    <Briefcase className="text-[#50CAE6] w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-400 block">Serviço</span>
                    <span className="font-semibold text-gray-900">{selectedService.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{businessSettings.currency || "R$"} {selectedService.price}</span>
                    <span className="text-xs text-gray-400 block">{selectedService.duration} min</span>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#50CAE6]/10 flex items-center justify-center">
                    <UserCog className="text-[#50CAE6] w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Profissional</span>
                    <span className="font-semibold text-gray-900">{selectedProfessional.name}</span>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#50CAE6]/10 flex items-center justify-center">
                    <CalendarIcon className="text-[#50CAE6] w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Data e Horário</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })} às {selectedTime}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                className="w-full h-14 text-lg bg-[#50CAE6] hover:bg-[#45b0c9] text-white rounded-xl shadow-md"
                onClick={handleConfirm}
              >
                <Check className="w-5 h-5 mr-2" />
                Confirmar Agendamento
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}