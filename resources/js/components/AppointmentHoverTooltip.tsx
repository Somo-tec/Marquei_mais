import React, { useState, useRef, useCallback, useEffect } from "react";
import { format, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Scissors, DollarSign, UserCheck, CalendarClock } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Appointment } from "@/context/AppDataContext";
import { useAppData } from "@/context/AppDataContext";

interface AppointmentHoverTooltipProps {
  appointment: Appointment;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export function AppointmentHoverTooltip({
  appointment,
  children,
  className,
  style,
  onClick,
}: AppointmentHoverTooltipProps) {
  const { businessSettings } = useAppData();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; placement: "top" | "bottom" }>({
    top: 0,
    left: 0,
    placement: "bottom",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const endTime = addMinutes(appointment.startTime, appointment.durationMinutes);

  const showTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 300);
  }, []);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150);
  }, []);

  // Position calculation
  useEffect(() => {
    if (isVisible && containerRef.current && tooltipRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const tooltipWidth = 280;
      const gap = 8;

      // Default: show below
      let placement: "top" | "bottom" = "bottom";
      let top = containerRect.bottom + gap;
      let left = containerRect.left + containerRect.width / 2 - tooltipWidth / 2;

      // If not enough space below, show above
      if (top + tooltipRect.height > viewportHeight - 20) {
        placement = "top";
        top = containerRect.top - tooltipRect.height - gap;
      }

      // If still goes above viewport, show below anyway
      if (top < 10) {
        placement = "bottom";
        top = containerRect.bottom + gap;
      }

      // Keep within horizontal viewport
      if (left < 10) left = 10;
      if (left + tooltipWidth > viewportWidth - 10) {
        left = viewportWidth - tooltipWidth - 10;
      }

      setPosition({ top, left, placement });
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const statusConfig = {
    confirmed: {
      label: "Confirmado",
      color: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
      dot: "bg-emerald-500",
    },
    pending: {
      label: "Pendente",
      color: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
      dot: "bg-amber-500",
    },
    cancelled: {
      label: "Cancelado",
      color: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30",
      dot: "bg-red-500",
    },
    completed: {
      label: "Concluído",
      color: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30",
      dot: "bg-green-500",
    },
    noshow: {
      label: "Não compareceu",
      color: "bg-gray-200 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/30",
      dot: "bg-gray-500",
    },
  };

  const status = statusConfig[appointment.status];

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        style={style}
        onClick={onClick}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-[9999] w-[280px] pointer-events-auto",
            "animate-in fade-in-0 zoom-in-95 duration-150"
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={hideTooltip}
        >
          <div className="bg-white dark:bg-[#1e2435] rounded-xl shadow-xl dark:shadow-2xl dark:shadow-black/40 border border-gray-200 dark:border-[#2d3545] overflow-hidden">
            {/* Header with status indicator */}
            <div className="px-4 pt-3.5 pb-2.5 border-b border-gray-100 dark:border-[#2d3545]">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="font-bold text-sm text-gray-900 dark:text-[#e8ecf4] truncate flex-1">
                  {appointment.clientName}
                </h4>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1",
                  status.color
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                  {status.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#8895a7] truncate">
                {appointment.serviceName}
              </p>
            </div>

            {/* Details */}
            <div className="px-4 py-3 space-y-2.5">
              {/* Time */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#50CAE6]/10 dark:bg-[#50CAE6]/15 flex items-center justify-center shrink-0">
                  <CalendarClock className="w-3.5 h-3.5 text-[#50CAE6]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-[#e8ecf4]">
                    {format(appointment.startTime, "HH:mm")} – {format(endTime, "HH:mm")}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-[#8895a7] capitalize">
                    {format(appointment.startTime, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-100/80 dark:bg-purple-500/15 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                </div>
                <p className="text-xs text-gray-700 dark:text-[#c0c8d4]">
                  {appointment.durationMinutes} minutos
                </p>
              </div>

              {/* Professional */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100/80 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-xs text-gray-700 dark:text-[#c0c8d4] truncate">
                  {appointment.professional}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100/80 dark:bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-[#e8ecf4]">
                  {businessSettings?.currency || "R$"} {appointment.price.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-[#1a1f2b] border-t border-gray-100 dark:border-[#2d3545]">
              <p className="text-[10px] text-gray-400 dark:text-[#8895a7] text-center">
                Clique para editar
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}