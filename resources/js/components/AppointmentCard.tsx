import React from "react";
import { format, addMinutes, isPast } from "date-fns";
import { DollarSign, MoreVertical, Edit2, Trash2, CheckCircle2, XCircle, Check, UserX, Ban, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "motion/react";
import { Appointment } from "@/context/AppDataContext";

export type { Appointment };

interface AppointmentCardProps {
  appointment: Appointment;
  variant?: "compact" | "detailed";
  onEdit?: (id: string) => void;
  onCancel?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onMarkCompleted?: (id: string) => void;
  onMarkNoShow?: (id: string) => void;
}

export function AppointmentCard({ 
    appointment, 
    variant = "detailed",
    onEdit,
    onCancel,
    onConfirm,
    onMarkCompleted,
    onMarkNoShow
}: AppointmentCardProps) {
    const endTime = addMinutes(appointment.startTime, appointment.durationMinutes);
    const appointmentPassed = isPast(endTime);
    const isResolved = appointment.status === "completed" || appointment.status === "noshow" || appointment.status === "cancelled";
    const needsResolution = appointmentPassed && !isResolved;

    const statusColors: Record<string, string> = {
        confirmed: "border-l-[#50CAE6] bg-white dark:bg-[#232938]",
        pending: "border-l-yellow-400 bg-yellow-50/50 dark:bg-yellow-500/10",
        cancelled: "border-l-red-400 bg-red-50/50 dark:bg-red-500/10 opacity-60",
        completed: "border-l-green-500 bg-green-50/30 dark:bg-green-500/5",
        noshow: "border-l-gray-400 bg-gray-50/50 dark:bg-gray-500/10 opacity-70",
    };

    const statusLabels: Record<string, string> = {
        confirmed: "Confirmado",
        pending: "Pendente",
        cancelled: "Cancelado",
        completed: "Concluído",
        noshow: "Não compareceu",
    };

    // Past unresolved appointments: compact card with action buttons
    if (needsResolution) {
        return (
            <motion.div
                whileHover={{ scale: 1.005 }}
                className="rounded-xl shadow-sm border border-amber-200 dark:border-amber-500/30 relative border-l-4 border-l-amber-400 bg-amber-50/40 dark:bg-amber-500/5 transition-all"
            >
                <div className="flex items-center gap-3 px-3 py-2.5">
                    {/* Time - compact */}
                    <div className="flex flex-col items-center min-w-[2.5rem]">
                        <span className="text-sm font-bold text-gray-500 dark:text-[#8895a7] leading-none">
                            {format(appointment.startTime, "HH:mm")}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-[#6b7a8d]">
                            {format(endTime, "HH:mm")}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-amber-200 dark:bg-amber-500/20 shrink-0" />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-700 dark:text-[#c8d0dc] text-sm truncate">{appointment.clientName}</h3>
                        <p className="text-xs text-gray-400 dark:text-[#6b7a8d] truncate">{appointment.serviceName}</p>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 shrink-0">
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 whitespace-nowrap">Confirmar</span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 px-3 pb-2.5 pt-0.5">
                    <Button
                        size="sm"
                        className="flex-1 h-8 text-xs font-medium bg-green-500 hover:bg-green-600 text-white border-none rounded-lg gap-1.5"
                        onClick={() => onMarkCompleted?.(appointment.id)}
                    >
                        <Check className="w-3.5 h-3.5" />
                        Atendido
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs font-medium bg-gray-100 dark:bg-[#2a3142] hover:bg-gray-200 dark:hover:bg-[#343d50] text-gray-600 dark:text-[#8895a7] border-gray-200 dark:border-[#3a4456] rounded-lg gap-1.5"
                        onClick={() => onMarkNoShow?.(appointment.id)}
                    >
                        <UserX className="w-3.5 h-3.5" />
                        Faltou
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs font-medium bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 rounded-lg gap-1.5"
                        onClick={() => onCancel?.(appointment.id)}
                    >
                        <Ban className="w-3.5 h-3.5" />
                        Cancelou
                    </Button>
                </div>
            </motion.div>
        );
    }

    // Resolved past appointments: extra compact, muted
    if (appointmentPassed && isResolved) {
        return (
            <motion.div
                whileHover={{ scale: 1.005 }}
                className={`rounded-xl px-3 py-2.5 shadow-sm border border-gray-100 dark:border-[#2d3545] relative border-l-4 transition-all ${statusColors[appointment.status]}`}
            >
                <div className="flex items-center gap-3">
                    {/* Time */}
                    <span className="text-sm font-semibold text-gray-400 dark:text-[#6b7a8d] min-w-[2.5rem] text-center">
                        {format(appointment.startTime, "HH:mm")}
                    </span>

                    {/* Divider */}
                    <div className="w-px h-6 bg-gray-200 dark:bg-[#2d3545] shrink-0" />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-500 dark:text-[#8895a7] text-sm truncate">{appointment.clientName}</h3>
                        <p className="text-xs text-gray-400 dark:text-[#6b7a8d] truncate">{appointment.serviceName}</p>
                    </div>

                    {/* Status pill */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap shrink-0
                        ${appointment.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400' : ''}
                        ${appointment.status === 'noshow' ? 'bg-gray-200 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400' : ''}
                        ${appointment.status === 'cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400' : ''}
                    `}>
                        {statusLabels[appointment.status]}
                    </span>

                    {/* Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="bg-transparent text-gray-300 dark:text-[#6b7a8d] h-7 w-7 hover:bg-gray-100 dark:hover:bg-[#2a3142] hover:text-gray-500 dark:hover:text-[#8895a7] rounded-full">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Opções</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit?.(appointment.id)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Editar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </motion.div>
        );
    }

    // Future / active appointments: original full card
    return (
        <motion.div 
            whileHover={{ scale: 1.01 }}
            className={`rounded-xl p-4 shadow-sm border border-gray-100 dark:border-[#2d3545] relative border-l-4 transition-all ${statusColors[appointment.status]}`}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                    <div className={`flex flex-col items-center min-w-[3.5rem] rounded-lg p-2 ${variant === 'compact' ? 'bg-transparent p-0' : 'bg-gray-50 dark:bg-[#1a1f2b]'}`}>
                        <span className="text-lg font-bold text-gray-900 dark:text-[#e8ecf4] leading-none">
                            {format(appointment.startTime, "HH:mm")}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-[#8895a7] mt-1">
                            {format(endTime, "HH:mm")}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-gray-900 dark:text-[#e8ecf4] text-lg">{appointment.clientName}</h3>
                        <p className="text-sm text-gray-500 dark:text-[#8895a7] font-medium">{appointment.serviceName}</p>
                        
                        {variant === "detailed" && (
                             <div className="flex items-center gap-3 mt-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border
                                    ${appointment.status === 'confirmed' ? 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/20' : ''}
                                    ${appointment.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/20' : ''}
                                    ${appointment.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/20' : ''}
                                    ${appointment.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/20' : ''}
                                    ${appointment.status === 'noshow' ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-500/15 dark:text-gray-400 dark:border-gray-500/20' : ''}
                                `}>
                                    {statusLabels[appointment.status]}
                                </span>
                                <span className="text-sm font-semibold text-gray-600 dark:text-[#8895a7] flex items-center bg-gray-50 dark:bg-[#1a1f2b] px-2 py-0.5 rounded-md">
                                    <DollarSign className="w-3 h-3 mr-0.5" /> {appointment.price}
                                </span>
                            </div>
                        )}
                        {variant === "compact" && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium text-gray-400 dark:text-[#8895a7]">
                                   {statusLabels[appointment.status]}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="bg-transparent text-gray-400 dark:text-[#8895a7] -mr-2 -mt-2 hover:bg-gray-100 dark:hover:bg-[#2a3142] hover:text-gray-600 dark:hover:text-[#e8ecf4] rounded-full">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Opções</DropdownMenuLabel>
                        {onConfirm && appointment.status === 'pending' && (
                             <DropdownMenuItem onClick={() => onConfirm(appointment.id)} className="text-green-600 focus:text-green-700 focus:bg-green-50">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Confirmar
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onEdit?.(appointment.id)}>
                            <Edit2 className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onCancel?.(appointment.id)} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                            <XCircle className="w-4 h-4 mr-2" /> Cancelar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    );
}
