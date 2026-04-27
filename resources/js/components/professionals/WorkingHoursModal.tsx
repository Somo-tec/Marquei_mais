import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Save, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { useAppData, WeeklySchedule, DaySchedule } from "@/context/AppDataContext";
import { cn } from "@/components/ui/utils";

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const DAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Generate time options from 06:00 to 23:00 every 30 min
const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 23; h++) {
  for (let m = 0; m < 60; m += 30) {
    if (h === 23 && m > 0) break;
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

interface WorkingHoursModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  professionalId: string;
  professionalName: string;
}

export function WorkingHoursModal({
  isOpen,
  onOpenChange,
  professionalId,
  professionalName,
}: WorkingHoursModalProps) {
  const { getProfessionalSchedule, updateWorkingHours } = useAppData();
  const [schedule, setSchedule] = useState<WeeklySchedule>({} as WeeklySchedule);

  useEffect(() => {
    if (isOpen) {
      const current = getProfessionalSchedule(professionalId);
      // Deep copy
      setSchedule(JSON.parse(JSON.stringify(current)));
    }
  }, [isOpen, professionalId, getProfessionalSchedule]);

  const updateDay = (day: number, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSave = () => {
    // Validate
    for (let d = 0; d < 7; d++) {
      const ds = schedule[d];
      if (ds?.enabled) {
        if (ds.start >= ds.end) {
          toast.error(`${DAY_NAMES[d]}: horário de início deve ser anterior ao de saída.`);
          return;
        }
        if (ds.lunchEnabled) {
          if (ds.lunchStart >= ds.lunchEnd) {
            toast.error(`${DAY_NAMES[d]}: início do intervalo deve ser anterior ao fim.`);
            return;
          }
          if (ds.lunchStart < ds.start || ds.lunchEnd > ds.end) {
            toast.error(`${DAY_NAMES[d]}: intervalo deve estar dentro do expediente.`);
            return;
          }
        }
      }
    }
    updateWorkingHours(professionalId, schedule);
    toast.success("Horários atualizados com sucesso!");
    onOpenChange(false);
  };

  const enabledCount = Object.values(schedule).filter(d => d?.enabled).length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#50CAE6]" />
            Horários de Trabalho
          </DialogTitle>
          <DialogDescription>
            Configure os dias, horários e intervalos de {professionalName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 py-2">
          {/* Quick overview chips */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {[0, 1, 2, 3, 4, 5, 6].map(day => (
              <button
                key={day}
                onClick={() => updateDay(day, "enabled", !schedule[day]?.enabled)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-semibold transition-all border",
                  schedule[day]?.enabled
                    ? "bg-[#50CAE6]/10 text-[#50CAE6] border-[#50CAE6]/30"
                    : "bg-gray-50 text-gray-400 border-gray-200"
                )}
              >
                {DAY_SHORT[day]}
              </button>
            ))}
            <span className="text-[10px] text-gray-400 self-center ml-1">
              {enabledCount} dia{enabledCount !== 1 ? "s" : ""} ativo{enabledCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Day rows */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {[1, 2, 3, 4, 5, 6, 0].map(day => {
              const ds = schedule[day];
              if (!ds) return null;
              return (
                <div
                  key={day}
                  className={cn(
                    "rounded-xl border transition-all",
                    ds.enabled
                      ? "bg-white border-gray-200"
                      : "bg-gray-50/50 border-gray-100 opacity-60"
                  )}
                >
                  {/* Main row: enable + day name + hours */}
                  <div className="flex items-center gap-3 p-3">
                    <Switch
                      checked={ds.enabled}
                      onCheckedChange={(v) => updateDay(day, "enabled", v)}
                      className="data-[state=checked]:bg-[#50CAE6] shrink-0"
                    />

                    <span className={cn(
                      "text-sm font-medium w-16 shrink-0",
                      ds.enabled ? "text-gray-900" : "text-gray-400"
                    )}>
                      {DAY_NAMES[day]}
                    </span>

                    {ds.enabled ? (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Select
                          value={ds.start}
                          onValueChange={(v) => updateDay(day, "start", v)}
                        >
                          <SelectTrigger className="h-8 text-xs w-[90px] bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {TIME_OPTIONS.map(t => (
                              <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-xs text-gray-400">até</span>
                        <Select
                          value={ds.end}
                          onValueChange={(v) => updateDay(day, "end", v)}
                        >
                          <SelectTrigger className="h-8 text-xs w-[90px] bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {TIME_OPTIONS.map(t => (
                              <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Folga</span>
                    )}
                  </div>

                  {/* Lunch break sub-row */}
                  {ds.enabled && (
                    <div className={cn(
                      "flex items-center gap-3 px-3 pb-3 pt-0 ml-11 border-t border-dashed border-gray-100 mt-0"
                    )}>
                      <button
                        onClick={() => updateDay(day, "lunchEnabled", !ds.lunchEnabled)}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all border shrink-0",
                          ds.lunchEnabled
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <UtensilsCrossed className="w-3 h-3" />
                        Intervalo
                      </button>

                      {ds.lunchEnabled ? (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Select
                            value={ds.lunchStart}
                            onValueChange={(v) => updateDay(day, "lunchStart", v)}
                          >
                            <SelectTrigger className="h-7 text-[11px] w-[80px] bg-white border-amber-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              {TIME_OPTIONS.map(t => (
                                <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-[11px] text-gray-400">até</span>
                          <Select
                            value={ds.lunchEnd}
                            onValueChange={(v) => updateDay(day, "lunchEnd", v)}
                          >
                            <SelectTrigger className="h-7 text-[11px] w-[80px] bg-white border-amber-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              {TIME_OPTIONS.map(t => (
                                <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Sem intervalo</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#50CAE6] hover:bg-[#45b0c9] text-white gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Horários
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
