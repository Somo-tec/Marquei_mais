import React, { useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfessionalRegistrationModal } from "@/components/professionals/ProfessionalRegistrationModal";
import { WorkingHoursModal } from "@/components/professionals/WorkingHoursModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAppData } from "@/context/AppDataContext";
import { cn } from "@/components/ui/utils";

const DAY_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

export function Professionals() {
  const { professionals, services, addProfessional, updateProfessional, deleteProfessional } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<any>(null);
  const [professionalToDelete, setProfessionalToDelete] = useState<string | null>(null);

  // Working hours modal state
  const [workingHoursProId, setWorkingHoursProId] = useState<string | null>(null);
  const [workingHoursProName, setWorkingHoursProName] = useState("");

  const handleProfessionalSaved = (data: any) => {
    if (editingProfessional) {
      updateProfessional(editingProfessional.id, {
        name: data.name,
        roles: data.roles,
        serviceIds: data.serviceIds || [],
        photoUrl: data.photoUrl || "",
        email: data.email || "",
        phone: data.phone || "",
      });
      setEditingProfessional(null);
      toast.success("Profissional atualizado com sucesso!");
    } else {
      addProfessional({
        name: data.name,
        roles: data.roles,
        serviceIds: data.serviceIds || [],
        photoUrl: data.photoUrl || "",
        email: data.email || "",
        phone: data.phone || "",
        workingHours: {
          0: { enabled: false, start: "09:00", end: "18:00", lunchEnabled: false, lunchStart: "12:00", lunchEnd: "13:00" },
          1: { enabled: true, start: "08:00", end: "20:00", lunchEnabled: true, lunchStart: "12:00", lunchEnd: "13:00" },
          2: { enabled: true, start: "08:00", end: "20:00", lunchEnabled: true, lunchStart: "12:00", lunchEnd: "13:00" },
          3: { enabled: true, start: "08:00", end: "20:00", lunchEnabled: true, lunchStart: "12:00", lunchEnd: "13:00" },
          4: { enabled: true, start: "08:00", end: "20:00", lunchEnabled: true, lunchStart: "12:00", lunchEnd: "13:00" },
          5: { enabled: true, start: "08:00", end: "20:00", lunchEnabled: true, lunchStart: "12:00", lunchEnd: "13:00" },
          6: { enabled: true, start: "09:00", end: "17:00", lunchEnabled: false, lunchStart: "12:00", lunchEnd: "13:00" },
        },
      });
      toast.success("Profissional adicionado com sucesso!");
    }
  };

  const handleEditClick = (pro: any) => {
    setEditingProfessional(pro);
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingProfessional(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setProfessionalToDelete(id);
  };

  const confirmDelete = () => {
    if (professionalToDelete) {
        deleteProfessional(professionalToDelete);
        toast.success("Profissional removido com sucesso.");
        setProfessionalToDelete(null);
    }
  };

  const handleOpenWorkingHours = (pro: any) => {
    setWorkingHoursProId(pro.id);
    setWorkingHoursProName(pro.name);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-[#e8ecf4]">Profissionais</h2>
          <p className="text-gray-500 dark:text-[#8895a7]">Quem trabalha com você</p>
        </div>
        <Button 
            className="bg-[#50CAE6] hover:bg-[#45b0c9] text-white shadow-md gap-2 rounded-xl"
            onClick={handleAddNewClick}
        >
          <Plus className="h-5 w-5" />
          <span>Novo Profissional</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {professionals.map((pro) => {
          const workingDays = pro.workingHours
            ? Object.entries(pro.workingHours)
                .filter(([_, ds]) => ds.enabled)
                .map(([day]) => Number(day))
            : [];

          return (
            <Card key={pro.id} className="p-4 flex flex-col items-center text-center space-y-3 hover:shadow-md transition-shadow border-gray-100 dark:border-[#2d3545] dark:bg-[#232938] relative group">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(pro)}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenWorkingHours(pro)}>
                              <Clock className="mr-2 h-4 w-4" /> Horários
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDeleteClick(pro.id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>

              <div className="relative mt-2">
                  <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
                      <AvatarImage src={pro.photoUrl} alt={pro.name} />
                      <AvatarFallback className="bg-cyan-50 text-[#50CAE6] text-xl font-bold">{pro.initials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-[#e8ecf4] leading-tight">{pro.name}</h3>
                <p className="text-sm text-gray-500 dark:text-[#8895a7] max-w-[150px] truncate mx-auto" title={pro.roles.join(", ")}>
                  {pro.roles.join(", ")}
                </p>
              </div>

              {/* Services assigned */}
              {pro.serviceIds && pro.serviceIds.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center px-2">
                  {pro.serviceIds.slice(0, 3).map(sid => {
                    const svc = services.find(s => s.id === sid);
                    return svc ? (
                      <span key={sid} className="text-[10px] bg-cyan-50 text-[#50CAE6] px-2 py-0.5 rounded-full">
                        {svc.name}
                      </span>
                    ) : null;
                  })}
                  {pro.serviceIds.length > 3 && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      +{pro.serviceIds.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Working days indicator */}
              <div className="flex gap-1 pt-1">
                {[0, 1, 2, 3, 4, 5, 6].map(day => (
                  <button
                    key={day}
                    onClick={() => handleOpenWorkingHours(pro)}
                    className={cn(
                      "w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center transition-colors",
                      workingDays.includes(day)
                        ? "bg-[#50CAE6]/15 text-[#50CAE6]"
                        : "bg-gray-100 text-gray-300 dark:bg-[#2a3142] dark:text-[#3d4556]"
                    )}
                    title={workingDays.includes(day) 
                      ? `${pro.workingHours[day].start} - ${pro.workingHours[day].end}${pro.workingHours[day].lunchEnabled ? ` (Intervalo: ${pro.workingHours[day].lunchStart} - ${pro.workingHours[day].lunchEnd})` : ""}`
                      : "Folga"}
                  >
                    {DAY_SHORT[day]}
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <ProfessionalRegistrationModal 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onProfessionalSaved={handleProfessionalSaved}
        professionalToEdit={editingProfessional}
      />

      <WorkingHoursModal
        isOpen={!!workingHoursProId}
        onOpenChange={(open) => !open && setWorkingHoursProId(null)}
        professionalId={workingHoursProId || ""}
        professionalName={workingHoursProName}
      />

      <AlertDialog open={!!professionalToDelete} onOpenChange={(open) => !open && setProfessionalToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o profissional da sua equipe.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                    Excluir
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}