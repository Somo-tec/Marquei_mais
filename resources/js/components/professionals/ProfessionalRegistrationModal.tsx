import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, Camera, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppData } from "@/context/AppDataContext";

const professionalSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  roles: z.array(z.string()).min(1, "Selecione pelo menos uma especialidade"),
  serviceIds: z.array(z.string()),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 caracteres").optional().or(z.literal("")),
  photoUrl: z.string().optional().or(z.literal("")),
});

type ProfessionalFormValues = z.infer<typeof professionalSchema>;

interface ProfessionalRegistrationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProfessionalSaved: (professional: ProfessionalFormValues) => void;
  professionalToEdit?: (ProfessionalFormValues & { serviceIds?: string[] }) | null;
}

const AVAILABLE_ROLES = [
  "Barbeiro",
  "Cabeleireira",
  "Manicure",
  "Esteticista",
  "Maquiadora",
  "Massagista",
  "Podóloga",
];

export function ProfessionalRegistrationModal({
  isOpen,
  onOpenChange,
  onProfessionalSaved,
  professionalToEdit,
}: ProfessionalRegistrationModalProps) {
  const { services: availableServices } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customRole, setCustomRole] = useState("");
  const [hasOtherRole, setHasOtherRole] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      name: "",
      roles: [],
      serviceIds: [],
      email: "",
      phone: "",
      photoUrl: "",
    },
  });

  useEffect(() => {
    if (isOpen && professionalToEdit) {
      // Check if there are custom roles (not in AVAILABLE_ROLES)
      const knownRoles = professionalToEdit.roles?.filter(r => AVAILABLE_ROLES.includes(r)) || [];
      const customRoles = professionalToEdit.roles?.filter(r => !AVAILABLE_ROLES.includes(r)) || [];
      
      reset({
        ...professionalToEdit,
        serviceIds: professionalToEdit.serviceIds || [],
      });
      
      if (customRoles.length > 0) {
        setHasOtherRole(true);
        setCustomRole(customRoles.join(", "));
      } else {
        setHasOtherRole(false);
        setCustomRole("");
      }
    } else if (isOpen) {
      reset({
        name: "",
        roles: [],
        serviceIds: [],
        email: "",
        phone: "",
        photoUrl: "",
      });
      setHasOtherRole(false);
      setCustomRole("");
    }
  }, [isOpen, professionalToEdit, reset]);

  const selectedRoles = watch("roles");
  const selectedServiceIds = watch("serviceIds");
  const photoUrl = watch("photoUrl");
  const name = watch("name");
  const initials = name ? name.substring(0, 2).toUpperCase() : "";

  const toggleRole = (role: string) => {
    const currentRoles = (selectedRoles || []).filter(r => AVAILABLE_ROLES.includes(r));
    let newRoles: string[];
    if (currentRoles.includes(role)) {
      newRoles = currentRoles.filter((r) => r !== role);
    } else {
      newRoles = [...currentRoles, role];
    }
    // Re-add custom role if exists
    if (hasOtherRole && customRole.trim()) {
      newRoles = [...newRoles, customRole.trim()];
    }
    setValue("roles", newRoles, { shouldValidate: true });
  };

  const toggleOtherRole = () => {
    const newHasOther = !hasOtherRole;
    setHasOtherRole(newHasOther);
    
    const knownRoles = (selectedRoles || []).filter(r => AVAILABLE_ROLES.includes(r));
    if (!newHasOther) {
      setCustomRole("");
      setValue("roles", knownRoles, { shouldValidate: true });
    } else if (customRole.trim()) {
      setValue("roles", [...knownRoles, customRole.trim()], { shouldValidate: true });
    }
  };

  const handleCustomRoleChange = (value: string) => {
    setCustomRole(value);
    const knownRoles = (selectedRoles || []).filter(r => AVAILABLE_ROLES.includes(r));
    if (value.trim()) {
      setValue("roles", [...knownRoles, value.trim()], { shouldValidate: true });
    } else {
      setValue("roles", knownRoles, { shouldValidate: true });
    }
  };

  const toggleService = (serviceId: string) => {
    const current = selectedServiceIds || [];
    if (current.includes(serviceId)) {
      setValue("serviceIds", current.filter(id => id !== serviceId), { shouldValidate: true });
    } else {
      setValue("serviceIds", [...current, serviceId], { shouldValidate: true });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("photoUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setValue("photoUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: ProfessionalFormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    onProfessionalSaved(data);
    toast.success(professionalToEdit ? "Profissional atualizado com sucesso!" : "Profissional adicionado com sucesso!");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[560px] max-h-[90dvh] flex flex-col gap-0 p-0 overflow-hidden">

        {/* Header fixo */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b shrink-0">
          <DialogTitle>{professionalToEdit ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
          <DialogDescription>
            {professionalToEdit ? "Edite as informações do membro da equipe." : "Adicione um novo membro à sua equipe."}
          </DialogDescription>
        </DialogHeader>

        {/* Conteúdo scrollável */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                placeholder="Ex: João Silva"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
            </div>

            <div className="space-y-2">
              <Label>Foto de Perfil</Label>
              <div className="flex items-center gap-4">
                <div className="relative group/avatar shrink-0">
                  <Avatar className="h-16 w-16 border-2 border-gray-200">
                    <AvatarImage src={photoUrl} alt="Preview" />
                    <AvatarFallback className="bg-cyan-50 text-[#50CAE6] font-bold text-lg">
                      {initials || <Camera className="w-5 h-5 text-gray-400" />}
                    </AvatarFallback>
                  </Avatar>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/avatar:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <Button type="button" variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4" />
                    {photoUrl ? "Trocar foto" : "Enviar foto"}
                  </Button>
                  <p className="text-[10px] text-gray-500 mt-1">JPG, PNG ou WebP. Máximo 5MB.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Especialidades *</Label>
              <div className="border rounded-md p-3 bg-gray-50/50">
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_ROLES.map((role) => (
                    <div key={role} className="flex items-center gap-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={selectedRoles?.includes(role)}
                        onCheckedChange={() => toggleRole(role)}
                      />
                      <label htmlFor={`role-${role}`} className="text-sm font-medium cursor-pointer">{role}</label>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Checkbox id="role-outro" checked={hasOtherRole} onCheckedChange={toggleOtherRole} />
                    <label htmlFor="role-outro" className="text-sm font-medium cursor-pointer">Outro</label>
                  </div>
                </div>
                {hasOtherRole && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <Input
                      placeholder="Digite a especialidade..."
                      value={customRole}
                      onChange={(e) => handleCustomRoleChange(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                    />
                  </div>
                )}
              </div>
              {errors.roles && <span className="text-xs text-red-500">{errors.roles.message}</span>}
            </div>

            <div className="space-y-2">
              <Label>Serviços</Label>
              <div className="border rounded-md p-3 bg-gray-50/50">
                <div className="grid grid-cols-2 gap-2">
                  {availableServices.map((service) => (
                    <div key={service.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={selectedServiceIds?.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <label htmlFor={`service-${service.id}`} className="text-sm font-medium cursor-pointer">{service.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input id="email" type="email" placeholder="Ex: joao@email.com" {...register("email")} />
              {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input id="phone" placeholder="Ex: (11) 99999-9999" {...register("phone")} />
            </div>

          </div>

          {/* Footer fixo */}
          <div className="px-5 py-4 border-t bg-white shrink-0 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#50CAE6] hover:bg-[#45b0c9] text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
              ) : (
                professionalToEdit ? "Salvar Alterações" : "Adicionar"
              )}
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}