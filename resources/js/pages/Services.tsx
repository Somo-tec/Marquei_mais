import React, { useState, useEffect, useMemo } from "react";
import { Plus, MoreHorizontal, Clock, DollarSign, Search, Scissors, Sparkles, Pencil, Trash2, Users, UserPlus, AlertTriangle, Check, ChevronLeft, ChevronRight, Dumbbell, Heart, PawPrint, Palette, Briefcase, SlidersHorizontal, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useAppData, Service } from "@/context/AppDataContext";
import { cn } from "@/components/ui/utils";

// --- Types & Schema ---

const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  price: z.coerce.number().min(1, "Preço deve ser maior que 0"),
  duration: z.coerce.number().min(5, "Duração mínima de 5 minutos"),
  description: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

// --- Predefined Services by Niche ---

interface PresetService {
  name: string;
  price: number;
  duration: number;
  description: string;
}

interface Niche {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  services: PresetService[];
}

const NICHES: Niche[] = [
  {
    id: "barbearia",
    label: "Barbearia",
    icon: <Scissors className="w-5 h-5" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-100",
    services: [
      { name: "Corte Masculino", price: 45, duration: 30, description: "Corte tradicional ou moderno com acabamento" },
      { name: "Barba", price: 35, duration: 20, description: "Aparar e modelar barba com toalha quente" },
      { name: "Corte + Barba", price: 70, duration: 45, description: "Combo corte de cabelo e barba completa" },
      { name: "Degradê / Fade", price: 50, duration: 40, description: "Corte degradê com transição precisa" },
      { name: "Sobrancelha Masculina", price: 15, duration: 10, description: "Design e acabamento de sobrancelhas" },
      { name: "Hidratação Capilar", price: 40, duration: 30, description: "Tratamento hidratante para cabelos masculinos" },
      { name: "Pigmentação de Barba", price: 80, duration: 60, description: "Preenchimento de falhas na barba" },
      { name: "Relaxamento Capilar", price: 60, duration: 45, description: "Relaxamento e alinhamento dos fios" },
    ],
  },
  {
    id: "salao",
    label: "Salão de Beleza",
    icon: <Flower2 className="w-5 h-5" />,
    color: "text-pink-600",
    bgColor: "bg-pink-50 border-pink-100",
    services: [
      { name: "Corte Feminino", price: 80, duration: 45, description: "Corte com lavagem e finalização" },
      { name: "Escova Progressiva", price: 200, duration: 120, description: "Alisamento com escova progressiva" },
      { name: "Coloração", price: 150, duration: 90, description: "Coloração completa com tintura profissional" },
      { name: "Mechas / Luzes", price: 250, duration: 150, description: "Mechas ou luzes com descoloração" },
      { name: "Escova Modeladora", price: 60, duration: 40, description: "Escova com modelagem e finalização" },
      { name: "Cauterização", price: 120, duration: 60, description: "Tratamento reparador para fios danificados" },
      { name: "Penteado", price: 100, duration: 60, description: "Penteado para festas e eventos" },
      { name: "Botox Capilar", price: 180, duration: 90, description: "Tratamento de reposição de massa capilar" },
    ],
  },
  {
    id: "estetica",
    label: "Estética",
    icon: <Sparkles className="w-5 h-5" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-100",
    services: [
      { name: "Limpeza de Pele", price: 120, duration: 60, description: "Limpeza profunda com extração" },
      { name: "Peeling Facial", price: 150, duration: 45, description: "Esfoliação facial para renovação celular" },
      { name: "Microagulhamento", price: 200, duration: 60, description: "Estímulo de colágeno com microagulhas" },
      { name: "Drenagem Linfática", price: 100, duration: 60, description: "Massagem para redução de inchaço" },
      { name: "Massagem Relaxante", price: 120, duration: 60, description: "Massagem corporal para alívio de tensão" },
      { name: "Depilação a Laser", price: 180, duration: 30, description: "Depilação a laser por região" },
      { name: "Design de Sobrancelha", price: 40, duration: 20, description: "Modelagem e design personalizado" },
      { name: "Extensão de Cílios", price: 200, duration: 90, description: "Aplicação fio a fio de cílios postiços" },
    ],
  },
  {
    id: "unhas",
    label: "Nail Designer",
    icon: <Palette className="w-5 h-5" />,
    color: "text-rose-600",
    bgColor: "bg-rose-50 border-rose-100",
    services: [
      { name: "Manicure", price: 35, duration: 40, description: "Cutilagem e esmaltação das unhas das mãos" },
      { name: "Pedicure", price: 40, duration: 45, description: "Cutilagem e esmaltação das unhas dos pés" },
      { name: "Manicure + Pedicure", price: 65, duration: 75, description: "Combo completo mãos e pés" },
      { name: "Unhas em Gel", price: 120, duration: 90, description: "Alongamento ou cobertura em gel" },
      { name: "Unhas em Fibra", price: 150, duration: 120, description: "Alongamento em fibra de vidro" },
      { name: "Nail Art", price: 30, duration: 30, description: "Decoração artística por unha" },
      { name: "Esmaltação em Gel", price: 60, duration: 40, description: "Esmaltação com secagem em cabine UV" },
      { name: "Manutenção de Alongamento", price: 80, duration: 60, description: "Retoque e manutenção do alongamento" },
    ],
  },
  {
    id: "saude",
    label: "Saúde & Bem-estar",
    icon: <Heart className="w-5 h-5" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-100",
    services: [
      { name: "Consulta Nutricional", price: 200, duration: 60, description: "Avaliação nutricional personalizada" },
      { name: "Sessão de Fisioterapia", price: 120, duration: 50, description: "Tratamento fisioterapêutico" },
      { name: "Acupuntura", price: 150, duration: 45, description: "Sessão de acupuntura terapêutica" },
      { name: "Pilates Individual", price: 100, duration: 60, description: "Aula individual de Pilates" },
      { name: "Quiropraxia", price: 130, duration: 30, description: "Ajuste quiroprático" },
      { name: "Terapia Holística", price: 160, duration: 60, description: "Sessão de terapia holística" },
      { name: "Avaliação Postural", price: 100, duration: 45, description: "Análise postural completa" },
      { name: "Reflexologia", price: 90, duration: 40, description: "Massagem reflexológica nos pés" },
    ],
  },
  {
    id: "fitness",
    label: "Fitness & Personal",
    icon: <Dumbbell className="w-5 h-5" />,
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-100",
    services: [
      { name: "Treino Personal", price: 100, duration: 60, description: "Treino individual com personal trainer" },
      { name: "Avaliação Física", price: 80, duration: 45, description: "Avaliação física e composição corporal" },
      { name: "Pacote Mensal (12 treinos)", price: 960, duration: 60, description: "12 sessões de treino por mês" },
      { name: "Treino Funcional", price: 80, duration: 45, description: "Sessão de treino funcional" },
      { name: "Aula de Yoga", price: 70, duration: 60, description: "Aula de yoga individual ou em dupla" },
      { name: "Consultoria Online", price: 150, duration: 30, description: "Montagem de treino e acompanhamento" },
    ],
  },
  {
    id: "pet",
    label: "Pet / Veterinário",
    icon: <PawPrint className="w-5 h-5" />,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-100",
    services: [
      { name: "Banho Pequeno Porte", price: 50, duration: 45, description: "Banho completo para cães de pequeno porte" },
      { name: "Banho Grande Porte", price: 80, duration: 60, description: "Banho completo para cães de grande porte" },
      { name: "Banho + Tosa", price: 90, duration: 90, description: "Banho e tosa higiênica ou estética" },
      { name: "Tosa na Máquina", price: 60, duration: 60, description: "Tosa completa na máquina" },
      { name: "Tosa na Tesoura", price: 100, duration: 90, description: "Tosa artística na tesoura" },
      { name: "Consulta Veterinária", price: 150, duration: 30, description: "Consulta clínica geral" },
      { name: "Vacinação", price: 80, duration: 15, description: "Aplicação de vacina com avaliação" },
      { name: "Hidratação de Pelagem", price: 40, duration: 20, description: "Tratamento hidratante para pelagem" },
    ],
  },
  {
    id: "consultoria",
    label: "Consultoria & Serviços",
    icon: <Briefcase className="w-5 h-5" />,
    color: "text-slate-600",
    bgColor: "bg-slate-50 border-slate-100",
    services: [
      { name: "Consultoria (1h)", price: 200, duration: 60, description: "Sessão de consultoria presencial ou online" },
      { name: "Mentoria Individual", price: 300, duration: 90, description: "Sessão de mentoria personalizada" },
      { name: "Sessão de Coaching", price: 250, duration: 60, description: "Sessão de coaching de vida ou carreira" },
      { name: "Aula Particular", price: 100, duration: 60, description: "Aula individual sob demanda" },
      { name: "Fotografia (Ensaio)", price: 400, duration: 120, description: "Ensaio fotográfico profissional" },
      { name: "Sessão de Psicoterapia", price: 180, duration: 50, description: "Sessão de psicoterapia individual" },
    ],
  },
];

// --- Service Modal (multi-step) ---

interface ServiceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ServiceFormValues) => void;
  serviceToEdit?: Service | null;
}

type ModalStep = "niche" | "preset" | "form";

function ServiceModal({ isOpen, onOpenChange, onSave, serviceToEdit }: ServiceModalProps) {
  const { businessSettings } = useAppData();
  const [step, setStep] = useState<ModalStep>("niche");
  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
  const [searchPreset, setSearchPreset] = useState("");

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      price: 0,
      duration: 30,
      description: "",
    },
  });

  // Reset steps when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (serviceToEdit) {
        // Edit mode: go directly to form
        setStep("form");
        form.reset({
          name: serviceToEdit.name,
          price: serviceToEdit.price,
          duration: serviceToEdit.duration,
          description: serviceToEdit.description || "",
        });
      } else {
        // New mode: start at niche selection
        setStep("niche");
        setSelectedNiche(null);
        setSearchPreset("");
        form.reset({
          name: "",
          price: 0,
          duration: 30,
          description: "",
        });
      }
    }
  }, [serviceToEdit, isOpen, form]);

  const handleSelectNiche = (niche: Niche) => {
    setSelectedNiche(niche);
    setSearchPreset("");
    setStep("preset");
  };

  const handleSelectPreset = (preset: PresetService) => {
    form.reset({
      name: preset.name,
      price: preset.price,
      duration: preset.duration,
      description: preset.description,
    });
    setStep("form");
  };

  const handleCustomFromScratch = () => {
    form.reset({
      name: "",
      price: 0,
      duration: 30,
      description: "",
    });
    setStep("form");
  };

  const handleBack = () => {
    if (step === "preset") {
      setStep("niche");
      setSelectedNiche(null);
    } else if (step === "form" && !serviceToEdit) {
      if (selectedNiche) {
        setStep("preset");
      } else {
        setStep("niche");
      }
    }
  };

  const onSubmit = (data: ServiceFormValues) => {
    onSave(data);
    onOpenChange(false);
  };

  const filteredPresets = selectedNiche?.services.filter(s =>
    s.name.toLowerCase().includes(searchPreset.toLowerCase())
  ) || [];

  const renderNicheStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Novo Serviço</DialogTitle>
        <DialogDescription>
          Escolha um nicho para ver sugestões ou crie do zero.
        </DialogDescription>
      </DialogHeader>

      <div className="overflow-y-auto max-h-[60vh] sm:max-h-[400px] -mx-6 px-6">
        <div className="grid grid-cols-2 gap-2 py-1">
          {/* Criar do zero - first option, always visible */}
          <button
            type="button"
            onClick={handleCustomFromScratch}
            className={cn(
              "flex flex-col items-center gap-2 px-3 py-4 rounded-xl border-2 border-dashed transition-all text-center",
              "hover:scale-[1.02] active:scale-[0.98]",
              "border-[#50CAE6]/40 bg-cyan-50/50 hover:bg-cyan-50"
            )}
          >
            <div className="p-2 rounded-lg bg-white shadow-sm text-[#50CAE6]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-[#50CAE6]">Criar do zero</span>
            <span className="text-[10px] text-gray-400">Personalizado</span>
          </button>

          {NICHES.map((niche) => (
            <button
              key={niche.id}
              type="button"
              onClick={() => handleSelectNiche(niche)}
              className={cn(
                "flex flex-col items-center gap-2 px-3 py-4 rounded-xl border transition-all text-center",
                "hover:scale-[1.02] active:scale-[0.98]",
                niche.bgColor,
                niche.color
              )}
            >
              <div className="p-2 rounded-lg bg-white/80 shadow-sm">
                {niche.icon}
              </div>
              <span className="text-xs font-medium text-gray-700">{niche.label}</span>
              <span className="text-[10px] text-gray-400">{niche.services.length} serviços</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const renderPresetStep = () => (
    <div className="flex flex-col h-[70vh] sm:h-auto sm:max-h-[500px]">
      <div className="pb-3 space-y-3 shrink-0">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="p-1 -ml-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <DialogTitle className="flex items-center gap-2">
                {selectedNiche?.icon}
                {selectedNiche?.label}
              </DialogTitle>
              <DialogDescription>
                Escolha um serviço para pré-preencher ou personalize depois.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Buscar nesta categoria..."
            className="pl-9 h-9 text-sm rounded-xl bg-gray-50"
            value={searchPreset}
            onChange={(e) => setSearchPreset(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto min-h-0 px-2">
        <div className="space-y-1.5 py-1 pb-2">
          {filteredPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-left group"
            >
              <div className={cn("p-2 rounded-lg shrink-0", selectedNiche?.bgColor)}>
                <Sparkles className={cn("w-4 h-4", selectedNiche?.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{preset.name}</p>
                <p className="text-xs text-gray-400 truncate">{preset.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-900">{(businessSettings?.currency || "R$")} {preset.price.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400">{preset.duration} min</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          ))}
          {filteredPresets.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <Search className="w-5 h-5 mx-auto mb-1.5 opacity-50" />
              <p className="text-sm">Nenhum serviço encontrado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed footer */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-100 dark:border-[#2d3545]">
        <DialogFooter className="sm:justify-between gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancelar
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCustomFromScratch}
            className="text-[#50CAE6] hover:text-[#45b0c9] hover:bg-cyan-50 rounded-xl gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Criar do zero
          </Button>
        </DialogFooter>
      </div>
    </div>
  );

  const renderFormStep = () => (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          {!serviceToEdit && (
            <button
              type="button"
              onClick={handleBack}
              className="p-1 -ml-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <DialogTitle>{serviceToEdit ? "Editar Serviço" : "Detalhes do Serviço"}</DialogTitle>
            <DialogDescription>
              {serviceToEdit
                ? "Faça alterações nos detalhes do serviço abaixo."
                : "Revise e ajuste os dados antes de salvar."}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Serviço</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Corte Masculino" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço ({businessSettings?.currency || "R$"})</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input type="number" className="pl-9" placeholder="0,00" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (min)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input type="number" className="pl-9" placeholder="30" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Breve descrição do serviço..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="bg-[#50CAE6] hover:bg-[#45b0c9] text-white">
              {serviceToEdit ? "Salvar Alterações" : "Criar Serviço"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "rounded-2xl",
        step === "form" ? "sm:max-w-[425px]" : "sm:max-w-[480px]",
        step === "preset" && "!overflow-y-hidden !p-0 !pt-0"
      )}>
        {step === "niche" && renderNicheStep()}
        {step === "preset" && renderPresetStep()}
        {step === "form" && renderFormStep()}
      </DialogContent>
    </Dialog>
  );
}

// --- Link Professionals Modal ---

interface LinkProfessionalsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  serviceName: string;
}

function LinkProfessionalsModal({ isOpen, onOpenChange, serviceId, serviceName }: LinkProfessionalsModalProps) {
  const { professionals, updateProfessional } = useAppData();
  const [localLinked, setLocalLinked] = useState<Set<string>>(new Set());

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen) {
      const linked = new Set<string>();
      professionals.forEach(p => {
        if (p.serviceIds?.includes(serviceId)) {
          linked.add(p.id);
        }
      });
      setLocalLinked(linked);
    }
  }, [isOpen, serviceId, professionals]);

  const toggleProfessional = (proId: string) => {
    setLocalLinked(prev => {
      const next = new Set(prev);
      if (next.has(proId)) {
        next.delete(proId);
      } else {
        next.add(proId);
      }
      return next;
    });
  };

  const handleSave = () => {
    professionals.forEach(pro => {
      const isCurrentlyLinked = pro.serviceIds?.includes(serviceId);
      const shouldBeLinked = localLinked.has(pro.id);

      if (shouldBeLinked && !isCurrentlyLinked) {
        // Add service to professional
        updateProfessional(pro.id, {
          serviceIds: [...(pro.serviceIds || []), serviceId],
        });
      } else if (!shouldBeLinked && isCurrentlyLinked) {
        // Remove service from professional
        updateProfessional(pro.id, {
          serviceIds: (pro.serviceIds || []).filter(id => id !== serviceId),
        });
      }
    });

    toast.success("Profissionais vinculados atualizados!", {
      description: `${localLinked.size} profissional(is) vinculado(s) a ${serviceName}.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#50CAE6]" />
            Vincular Profissionais
          </DialogTitle>
          <DialogDescription>
            Selecione quem realiza o serviço <strong className="text-gray-700">{serviceName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[320px]">
          <div className="space-y-1 py-2">
            {professionals.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum profissional cadastrado.</p>
                <p className="text-xs mt-1">Cadastre profissionais primeiro.</p>
              </div>
            ) : (
              professionals.map(pro => {
                const isLinked = localLinked.has(pro.id);
                return (
                  <button
                    key={pro.id}
                    type="button"
                    onClick={() => toggleProfessional(pro.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left",
                      isLinked
                        ? "bg-cyan-50 border border-[#50CAE6]/30"
                        : "hover:bg-gray-50 border border-transparent"
                    )}
                  >
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm shrink-0">
                      <AvatarImage src={pro.photoUrl} alt={pro.name} />
                      <AvatarFallback className="bg-cyan-50 text-[#50CAE6] text-sm font-bold">
                        {pro.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{pro.name}</p>
                      <p className="text-xs text-gray-400 truncate">{pro.roles.join(", ")}</p>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      isLinked
                        ? "bg-[#50CAE6] border-[#50CAE6]"
                        : "border-gray-300"
                    )}>
                      {isLinked && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>

        {professionals.length > 0 && (
          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span>{localLinked.size} de {professionals.length} selecionado(s)</span>
            {localLinked.size === 0 && (
              <span className="flex items-center gap-1 text-amber-500">
                <AlertTriangle className="w-3 h-3" />
                Sem profissional vinculado
              </span>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#50CAE6] hover:bg-[#45b0c9] text-white rounded-xl gap-2"
          >
            <Check className="w-4 h-4" />
            Salvar Vínculos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Services Page ---

export function Services() {
  const { services, professionals, addService, updateService, deleteService, businessSettings } = useAppData();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  // Link professionals modal state
  const [linkModalServiceId, setLinkModalServiceId] = useState<string | null>(null);
  const [linkModalServiceName, setLinkModalServiceName] = useState("");

  // Get linked professionals for a service
  const getLinkedProfessionals = useMemo(() => {
    const map = new Map<string, typeof professionals>();
    services.forEach(s => {
      map.set(
        s.id,
        professionals.filter(p => p.serviceIds?.includes(s.id))
      );
    });
    return map;
  }, [services, professionals]);

  const handleAddNewClick = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setServiceToDelete(id);
  };

  const confirmDelete = () => {
    if (serviceToDelete) {
        deleteService(serviceToDelete);
        toast.success("Serviço removido com sucesso.");
        setServiceToDelete(null);
    }
  };

  const handleOpenLinkModal = (service: Service) => {
    setLinkModalServiceId(service.id);
    setLinkModalServiceName(service.name);
  };

  const handleSaveService = async (data: ServiceFormValues) => {
    if (editingService) {
        updateService(editingService.id, data);
        toast.success("Serviço atualizado com sucesso!");
    } else {
        const newId = await addService(data);
        // Alert: new service has no professionals linked
        toast("Serviço criado com sucesso!", {
          description: "Vincule profissionais a este serviço para que ele apareça corretamente nos agendamentos.",
          icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
          action: {
            label: "Vincular agora",
            onClick: () => {
              setLinkModalServiceId(newId);
              setLinkModalServiceName(data.name);
            },
          },
          duration: 8000,
        });
    }
    setEditingService(null);
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-[#e8ecf4] flex items-center gap-2">
            Catálogo de Serviços
          </h2>
          <p className="text-gray-500 dark:text-[#8895a7] text-sm mt-1">Gerencie os serviços oferecidos no seu estabelecimento.</p>
        </div>
        <Button 
            onClick={handleAddNewClick}
            className="bg-[#50CAE6] hover:bg-[#45b0c9] text-white shadow-md gap-2 rounded-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Serviço</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
            placeholder="Buscar serviços..." 
            className="pl-10 bg-white dark:bg-[#232938] border-gray-200 dark:border-[#2d3545] rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => {
              const linkedPros = getLinkedProfessionals.get(service.id) || [];
              const hasNoPros = linkedPros.length === 0;

              return (
                <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    data-service-id={service.id}
                >
                    <Card className="p-0 overflow-hidden border-none dark:border dark:border-[#2d3545] shadow-sm hover:shadow-md transition-shadow group bg-white dark:bg-[#232938] rounded-2xl h-full cursor-pointer" onClick={() => handleEditClick(service)}>
                        <div className="p-5 flex flex-col h-full">
                            <div className="flex justify-end items-start mb-2">
                                <div className="flex items-center gap-1">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-gray-300 hover:text-[#50CAE6] hover:bg-cyan-50 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => { e.stopPropagation(); handleEditClick(service); }}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-gray-600 -mr-2 -mt-2" onClick={(e) => e.stopPropagation()}>
                                                <MoreHorizontal className="w-5 h-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditClick(service); }}>
                                                <Pencil className="mr-2 h-4 w-4" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenLinkModal(service); }}>
                                                <Users className="mr-2 h-4 w-4" /> Vincular Profissionais
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteClick(service.id); }}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-lg text-gray-900 dark:text-[#e8ecf4] mb-1">{service.name}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2 min-h-[2.5rem] mb-3 flex-grow">
                                {service.description || "Sem descrição definida."}
                            </p>

                            {/* Linked Professionals */}
                            <div className="mb-3">
                              {hasNoPros ? (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleOpenLinkModal(service); }}
                                  className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors w-full"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                  <span>Nenhum profissional vinculado</span>
                                  <UserPlus className="w-3.5 h-3.5 ml-auto shrink-0" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleOpenLinkModal(service); }}
                                  className="flex items-center gap-2 w-full group/pros hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                                >
                                  <div className="flex -space-x-2">
                                    {linkedPros.slice(0, 4).map(pro => (
                                      <Avatar key={pro.id} className="h-7 w-7 border-2 border-white shadow-sm">
                                        <AvatarImage src={pro.photoUrl} alt={pro.name} />
                                        <AvatarFallback className="bg-cyan-50 text-[#50CAE6] text-[9px] font-bold">
                                          {pro.initials}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {linkedPros.length > 4 && (
                                      <div className="h-7 w-7 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-bold text-gray-500">
                                        +{linkedPros.length - 4}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500 truncate">
                                    {linkedPros.length === 1
                                      ? linkedPros[0].name
                                      : `${linkedPros.length} profissionais`}
                                  </span>
                                  <Pencil className="w-3 h-3 text-gray-300 ml-auto opacity-0 group-hover/pros:opacity-100 transition-opacity shrink-0" />
                                </button>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                                    <Clock className="w-4 h-4 text-gray-400" /> 
                                    {service.duration} min
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-gray-900 dark:text-[#e8ecf4] font-bold">
                                        <span className="text-xs text-gray-400 font-normal">{businessSettings?.currency || "R$"}</span>
                                        {service.price.toFixed(2)}
                                    </div>
                                    <span className="text-xs text-[#50CAE6] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        <Pencil className="w-3 h-3" />
                                        Editar
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
              );
            })}
        </AnimatePresence>
        
        {filteredServices.length === 0 && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"
            >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <Search className="w-6 h-6" />
                </div>
                <h3 className="text-gray-900 font-medium">Nenhum serviço encontrado</h3>
                <p className="text-gray-500 text-sm mt-1">Tente buscar por outro termo ou adicione um novo serviço.</p>
            </motion.div>
        )}
      </div>

      <ServiceModal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSave={handleSaveService} 
        serviceToEdit={editingService} 
      />

      <LinkProfessionalsModal
        isOpen={!!linkModalServiceId}
        onOpenChange={(open) => { if (!open) setLinkModalServiceId(null); }}
        serviceId={linkModalServiceId || ""}
        serviceName={linkModalServiceName}
      />

      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Excluir serviço?</AlertDialogTitle>
                <AlertDialogDescription>
                    Essa ação não pode ser desfeita. O serviço será removido permanentemente do seu catálogo.
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