import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, Check, CheckCircle2, User, Phone, MapPin, Mail, AlertTriangle, ClockIcon, Instagram, Facebook, Video, MapPinned, ExternalLink } from "lucide-react";
import { format, addDays, startOfToday, isSameDay, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppData } from "@/context/AppDataContext";
import { cn } from "@/components/ui/utils";

interface PublicBookingProps {
    onBack?: () => void;
}

export function PublicBooking({ onBack }: PublicBookingProps) {
  const { services, professionals, addAppointment, addClient, clients, getAvailableSlots, hasConflict, businessSettings } = useAppData();

  const [step, setStep] = useState<"service" | "professional" | "datetime" | "form" | "success">("service");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("any");
  const [clientData, setClientData] = useState({ name: "", phone: "", email: "" });

  const business = {
    name: businessSettings.name,
    address: businessSettings.address
  };

  const accentColor = businessSettings.publicPageColor || "#50CAE6";

  const hasSocialLinks = businessSettings.socialInstagram || businessSettings.socialFacebook || businessSettings.socialTiktok || businessSettings.socialGoogleMaps;

  // Build professional list with "any" option, filtered by selected service
  const professionalOptions = useMemo(() => {
    const filteredPros = selectedService
      ? professionals.filter(p => p.serviceIds?.includes(selectedService.id))
      : professionals;
    const prosToUse = filteredPros.length > 0 ? filteredPros : professionals;
    return [
      { id: "any", name: "Qualquer profissional" },
      ...prosToUse.map(p => ({ id: p.id, name: p.name }))
    ];
  }, [selectedService, professionals]);

  // Compute available time slots
  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedService) return [];
    
    if (selectedProfessionalId === "any") {
      const filteredPros = professionals.filter(p => p.serviceIds?.includes(selectedService.id));
      const prosToCheck = filteredPros.length > 0 ? filteredPros : professionals;
      const allSlots = new Set<string>();
      prosToCheck.forEach(pro => {
        const slots = getAvailableSlots(selectedDate, pro.id, selectedService.duration);
        slots.forEach(s => allSlots.add(s));
      });
      return Array.from(allSlots).sort();
    } else {
      return getAvailableSlots(selectedDate, selectedProfessionalId, selectedService.duration);
    }
  }, [selectedDate, selectedService, selectedProfessionalId, professionals, getAvailableSlots]);

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    if (businessSettings.allowProfessionalSelection) {
        setStep("professional");
    } else {
        setStep("datetime");
    }
  };

  const handleProfessionalSelect = (proId: string) => {
      setSelectedProfessionalId(proId);
      setStep("datetime");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("form");
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientData.name || !clientData.phone) return;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const startTime = setMinutes(setHours(new Date(selectedDate), hours), minutes);
    startTime.setSeconds(0, 0);

    let client = clients.find(c => c.phone === clientData.phone);
    let clientId = client?.id || "";
    let clientName = clientData.name;

    if (!client) {
      clientId = await addClient({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        status: "active",
      });
      clientName = clientData.name;
    } else {
      clientId = client.id;
      clientName = client.name;
    }

    let profId = selectedProfessionalId;
    let profName = "";
    
    if (selectedProfessionalId === "any") {
      const filteredPros = professionals.filter(p => p.serviceIds?.includes(selectedService.id));
      const prosToCheck = filteredPros.length > 0 ? filteredPros : professionals;
      for (const pro of prosToCheck) {
        if (!hasConflict(pro.id, startTime, selectedService.duration)) {
          profId = pro.id;
          profName = pro.name;
          break;
        }
      }
    } else {
      const pro = professionals.find(p => p.id === selectedProfessionalId);
      profName = pro?.name || "";
    }

    await addAppointment({
      clientId,
      clientName,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      professionalId: profId,
      professional: profName,
      startTime,
      durationMinutes: selectedService.duration,
      status: businessSettings.autoConfirm ? "confirmed" : "pending",
      price: selectedService.price,
    });

    setStep("success");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 font-sans">
      <div className="w-full max-w-lg">
        
        {/* Header - with logo, name, social links */}
        {step !== "success" && (
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {businessSettings.logoUrl && (
                            <img src={businessSettings.logoUrl} alt={business.name} className="h-12 w-12 rounded-xl object-cover border border-gray-100 shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        )}
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
                            <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                <MapPin className="w-3 h-3 mr-1" />
                                {business.address}
                            </div>
                        </div>
                    </div>
                    {onBack && (
                         <Button variant="ghost" size="sm" onClick={onBack} className="text-xs text-gray-400">
                            Voltar (Demo)
                         </Button>
                    )}
                </div>
                {businessSettings.publicPageDescription && (
                    <p className="text-sm text-gray-500 mt-3 leading-relaxed">{businessSettings.publicPageDescription}</p>
                )}
                {hasSocialLinks && (
                    <div className="flex items-center gap-2 mt-3">
                        {businessSettings.socialInstagram && (
                            <a href={businessSettings.socialInstagram.startsWith("http") ? businessSettings.socialInstagram : `https://instagram.com/${businessSettings.socialInstagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-pink-500 hover:bg-pink-50 transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                        )}
                        {businessSettings.socialFacebook && (
                            <a href={businessSettings.socialFacebook.startsWith("http") ? businessSettings.socialFacebook : `https://${businessSettings.socialFacebook}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                        )}
                        {businessSettings.socialTiktok && (
                            <a href={businessSettings.socialTiktok.startsWith("http") ? businessSettings.socialTiktok : `https://tiktok.com/${businessSettings.socialTiktok.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors">
                                <Video className="w-4 h-4" />
                            </a>
                        )}
                        {businessSettings.socialGoogleMaps && (
                            <a href={businessSettings.socialGoogleMaps.startsWith("http") ? businessSettings.socialGoogleMaps : `https://maps.google.com/?q=${businessSettings.socialGoogleMaps}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <MapPinned className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                )}
            </div>
        )}

        <Card className="overflow-hidden border-gray-100 shadow-sm min-h-[500px] flex flex-col relative bg-white">
          {/* Progress Bar */}
          {step !== "success" && (
            <div className="h-1 bg-gray-100 w-full">
                <motion.div 
                    className="h-full"
                    style={{ backgroundColor: accentColor }}
                    initial={{ width: "0%" }}
                    animate={{ 
                        width: step === "service" ? "25%" : step === "professional" ? "50%" : step === "datetime" ? "75%" : "100%" 
                    }}
                />
            </div>
          )}

          <div className="p-6 flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: SELECT SERVICE */}
              {step === "service" && (
                <motion.div
                  key="service"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">O que você deseja agendar?</h2>
                  {businessSettings.welcomeMessage && (
                    <p className="text-sm text-gray-500 mb-6">{businessSettings.welcomeMessage}</p>
                  )}
                  {!businessSettings.welcomeMessage && <div className="mb-4" />}
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className="p-4 rounded-xl border border-gray-100 hover:border-[#50CAE6] hover:bg-cyan-50/30 cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-[#50CAE6] transition-colors">{service.name}</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration} min</span>
                            </div>
                          </div>
                          {businessSettings.showPrices && (
                            <span className="font-semibold text-gray-900">{businessSettings.currency || "R$"} {service.price}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SELECT PROFESSIONAL */}
              {step === "professional" && (
                <motion.div
                  key="professional"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1"
                >
                   <div className="flex items-center gap-2 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => setStep("service")} className="-ml-2 h-8 w-8 rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-xl font-semibold text-gray-900">Com quem prefere?</h2>
                  </div>

                  <div className="space-y-3">
                    {professionalOptions.map((pro) => (
                      <div
                        key={pro.id}
                        onClick={() => handleProfessionalSelect(pro.id)}
                        className={cn(
                          "p-4 rounded-xl border cursor-pointer transition-all group flex items-center gap-4",
                          selectedProfessionalId === pro.id 
                            ? "border-[#50CAE6] bg-cyan-50/30" 
                            : "border-gray-100 hover:border-[#50CAE6] hover:bg-cyan-50/30"
                        )}
                      >
                         <div className={cn(
                           "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                           selectedProfessionalId === pro.id 
                             ? "bg-[#50CAE6] text-white" 
                             : "bg-gray-100 text-gray-400 group-hover:bg-[#50CAE6] group-hover:text-white"
                         )}>
                             <User className="h-5 w-5" />
                         </div>
                         <div>
                            <h3 className="font-semibold text-gray-900">{pro.name}</h3>
                            <p className="text-xs text-gray-500">
                                {pro.id === "any" ? "O primeiro disponível" : professionals.find(p => p.id === pro.id)?.roles.join(", ")}
                            </p>
                         </div>
                         {selectedProfessionalId === pro.id && (
                             <CheckCircle2 className="ml-auto h-5 w-5 text-[#50CAE6]" />
                         )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SELECT DATE & TIME */}
              {step === "datetime" && (
                <motion.div
                  key="datetime"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => setStep(businessSettings.allowProfessionalSelection ? "professional" : "service")} className="-ml-2 h-8 w-8 rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-xl font-semibold text-gray-900">Escolha o horário</h2>
                  </div>

                  <div className="flex flex-col gap-6">
                     
                     {/* Date Selection - Horizontal Scroll */}
                     <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                            Escolha o dia
                        </h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                            {Array.from({ length: businessSettings.maxAdvanceDays }).map((_, i) => {
                                const date = addDays(startOfToday(), i);
                                const isSelected = selectedDate && isSameDay(date, selectedDate);
                                const isToday = isSameDay(date, new Date());
                                const dateStr = format(date, "yyyy-MM-dd");
                                const isBlocked = businessSettings.blockedDates?.includes(dateStr);
                                // Check if business is closed on this day
                                const bizDay = businessSettings.businessHours?.[date.getDay()];
                                const isClosed = bizDay && !bizDay.enabled;
                                const isDisabled = isBlocked || isClosed;
                                const weekDay = isToday 
                                    ? "Hoje" 
                                    : format(date, "EEE", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase());
                                const dayNumber = format(date, "d");

                                return (
                                    <button
                                        key={date.toISOString()}
                                        onClick={() => !isDisabled && setSelectedDate(date)}
                                        disabled={isDisabled}
                                        className={`
                                            flex flex-col items-center justify-center min-w-[72px] h-[84px] rounded-2xl border transition-all shrink-0
                                            ${isDisabled
                                                ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed opacity-50"
                                                : isSelected 
                                                    ? "bg-gray-900 text-white border-gray-900 shadow-lg scale-105" 
                                                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                                            }
                                        `}
                                    >
                                        <span className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${isDisabled ? "text-gray-300" : isSelected ? "text-white/70" : "text-gray-400"}`}>
                                            {isBlocked ? "Folga" : isClosed ? "Fechado" : weekDay}
                                        </span>
                                        <span className={`text-2xl font-bold ${isDisabled ? "text-gray-300" : isSelected ? "text-white" : "text-gray-600"}`}>
                                            {dayNumber}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                     </div>
                    
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            Horários disponíveis
                            <span className="text-xs font-normal text-gray-400 ml-auto">
                              {availableSlots.length} horário{availableSlots.length !== 1 ? "s" : ""}
                            </span>
                        </h3>
                        {availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {availableSlots.map((time) => (
                                  <Button
                                      key={time}
                                      variant="outline"
                                      onClick={() => handleTimeSelect(time)}
                                      className="border-gray-200 hover:border-[#50CAE6] hover:bg-cyan-50/50 hover:text-[#50CAE6] h-12 text-base font-medium"
                                  >
                                      {time}
                                  </Button>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                            <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            {selectedDate && selectedProfessionalId !== "any" && (() => {
                              const pro = professionals.find(p => p.id === selectedProfessionalId);
                              const daySchedule = pro?.workingHours?.[selectedDate.getDay()];
                              const isOff = !daySchedule || !daySchedule.enabled;
                              return isOff ? (
                                <>
                                  <p className="text-sm text-gray-400">Profissional de folga neste dia.</p>
                                  <p className="text-xs text-gray-400 mt-1">Escolha outra data ou profissional.</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm text-gray-400">Sem horários disponíveis neste dia.</p>
                                  <p className="text-xs text-gray-400 mt-1">Tente outra data.</p>
                                </>
                              );
                            })()}
                            {(selectedProfessionalId === "any" || !selectedDate) && (
                              <>
                                <p className="text-sm text-gray-400">Sem horários disponíveis neste dia.</p>
                                <p className="text-xs text-gray-400 mt-1">Tente outra data.</p>
                              </>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: CONFIRM FORM */}
              {step === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => setStep("datetime")} className="-ml-2 h-8 w-8 rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-xl font-semibold text-gray-900">Confirme seus dados</h2>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                     <div className="flex justify-between items-center">
                         <span className="text-gray-500 text-sm">Serviço</span>
                         <span className="font-medium text-gray-900">{selectedService?.name}</span>
                     </div>
                     <div className="h-px bg-gray-200" />
                     {businessSettings.allowProfessionalSelection && selectedProfessionalId !== "any" && (
                        <>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Profissional</span>
                                <span className="font-medium text-gray-900">{professionals.find(p => p.id === selectedProfessionalId)?.name}</span>
                            </div>
                            <div className="h-px bg-gray-200" />
                        </>
                     )}
                     <div className="flex justify-between items-center">
                         <span className="text-gray-500 text-sm">Data</span>
                         <span className="font-medium text-gray-900 capitalize">
                            {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                         </span>
                     </div>
                     <div className="flex justify-between items-center">
                         <span className="text-gray-500 text-sm">Horário</span>
                         <span className="font-medium text-gray-900">{selectedTime}</span>
                     </div>
                      {businessSettings.showPrices && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">Valor</span>
                          <span className="font-medium text-gray-900">{businessSettings.currency || "R$"} {selectedService?.price}</span>
                        </div>
                      )}
                  </div>

                  {/* Cancellation Policy */}
                  {businessSettings.cancellationPolicy && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 leading-relaxed">{businessSettings.cancellationPolicy}</p>
                    </div>
                  )}

                  <div className="space-y-4 flex-1">

                    <div className="space-y-2">
                        <Label htmlFor="name">Seu Nome</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input 
                                id="name" 
                                placeholder="Como você gostaria de ser chamado?" 
                                className="pl-10 h-12"
                                value={clientData.name}
                                onChange={e => setClientData({...clientData, name: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">WhatsApp</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input 
                                id="phone" 
                                placeholder="(00) 00000-0000" 
                                className="pl-10 h-12"
                                value={clientData.phone}
                                onChange={e => setClientData({...clientData, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center justify-between">
                            Email
                            {!businessSettings.requireEmail && (
                              <span className="text-xs font-normal text-gray-400">Opcional</span>
                            )}
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input 
                                id="email" 
                                type="email"
                                placeholder="seu@email.com" 
                                className="pl-10 h-12"
                                value={clientData.email}
                                onChange={e => setClientData({...clientData, email: e.target.value})}
                            />
                        </div>
                    </div>
                  </div>

                   <Button 
                        onClick={handleBooking}
                        disabled={!clientData.name || !clientData.phone || (businessSettings.requireEmail && !clientData.email)}
                        className="w-full h-14 text-lg font-semibold mt-6 shadow-lg text-white"
                        style={{ backgroundColor: accentColor }}
                    >
                        Confirmar Agendamento
                    </Button>
                </motion.div>
              )}

              {/* STEP 5: SUCCESS */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-8"
                >
                   <div className={`h-24 w-24 ${businessSettings.autoConfirm ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'} rounded-full mb-6 flex items-center justify-center animate-in zoom-in duration-500`}>
                        {businessSettings.autoConfirm ? (
                          <CheckCircle2 className="h-12 w-12" />
                        ) : (
                          <Clock className="h-12 w-12" />
                        )}
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-900">
                      {businessSettings.autoConfirm ? "Agendamento Confirmado!" : "Agendamento Recebido!"}
                    </h1>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                      {businessSettings.autoConfirm 
                        ? `Tudo certo, ${clientData.name}. Seu horário está confirmado!`
                        : `Obrigado, ${clientData.name}! Seu agendamento foi recebido e aguarda confirmação.`
                      }
                    </p>

                    <div className="bg-gray-50 rounded-xl p-6 mt-8 w-full max-w-sm border border-gray-100">
                         <p className="font-medium text-gray-900 mb-1">{selectedService?.name}</p>
                         <p className="text-gray-500 text-sm">
                            {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })} às {selectedTime}
                         </p>
                    </div>

                    {onBack && (
                         <Button variant="outline" onClick={onBack} className="mt-8 w-full">
                            Fazer novo agendamento
                        </Button>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
        
        {step !== "success" && (
             <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
                Agendamento simples via <span className="font-bold text-gray-500">Marquei+</span>
            </p>
        )}
      </div>
    </div>
  );
}