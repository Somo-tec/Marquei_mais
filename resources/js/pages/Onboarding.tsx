import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Plus, X, Check, Copy, ExternalLink, Store, Scissors, Users, CheckCircle2, Sparkles, Hand, Heart, MoreHorizontal, Palette, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  // Data States
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState(""); // Stores ID like 'barbershop' or custom text
  const [customBusinessType, setCustomBusinessType] = useState(""); // Stores custom text input
  const [services, setServices] = useState<{name: string, price: string}[]>([]);
  const [professionals, setProfessionals] = useState<string[]>([]);

  // Temporary inputs
  const [tempService, setTempService] = useState("");
  const [tempPrice, setTempPrice] = useState("");
  const [tempProfessional, setTempProfessional] = useState("");

  const businessTypes = [
    { id: "barbershop", label: "Barbearia", icon: Scissors },
    { id: "beauty_salon", label: "Salão de Beleza", icon: Sparkles },
    { id: "nail_salon", label: "Esmalteria", icon: Palette },
    { id: "aesthetics", label: "Estética", icon: Smile },
    { id: "health", label: "Saúde", icon: Heart },
    { id: "other", label: "Outro", icon: MoreHorizontal }
  ];

  const serviceSuggestions: Record<string, {name: string, price: string}[]> = {
    barbershop: [
        { name: "Corte Masculino", price: "35" },
        { name: "Barba", price: "25" },
        { name: "Pezinho", price: "10" }
    ],
    beauty_salon: [
        { name: "Corte Feminino", price: "80" },
        { name: "Escova", price: "45" },
        { name: "Hidratação", price: "60" }
    ],
    nail_salon: [
        { name: "Manicure", price: "25" },
        { name: "Pedicure", price: "30" },
        { name: "Esmaltação em Gel", price: "50" }
    ],
    aesthetics: [
        { name: "Limpeza de Pele", price: "120" },
        { name: "Massagem Relaxante", price: "90" },
        { name: "Botox", price: "900" }
    ],
    health: [
        { name: "Consulta", price: "150" },
        { name: "Avaliação", price: "0" }
    ]
  };

  const nextStep = () => {
    // If moving from step 1 to 2, populate suggestions if empty
    if (step === 1) {
        if (services.length === 0 && serviceSuggestions[businessType]) {
            setServices(serviceSuggestions[businessType]);
        }
    }
    setStep(s => Math.min(s + 1, totalSteps));
  };
  
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const addService = () => {
    if (tempService) {
      setServices([...services, { name: tempService, price: tempPrice }]);
      setTempService("");
      setTempPrice("");
    }
  };

  const addProfessional = () => {
    if (tempProfessional) {
      setProfessionals([...professionals, tempProfessional]);
      setTempProfessional("");
    }
  };

  const copyLink = async () => {
    const link = `marquei.mais/${businessName.toLowerCase().replace(/\s/g, '-')}`;
    try {
        await navigator.clipboard.writeText(link);
        toast.success("Link copiado!");
    } catch (err) {
        console.error("Clipboard failed:", err);
        toast.error("Erro ao copiar. Link: " + link);
    }
  };

  const handleTypeSelect = (typeId: string) => {
      setBusinessType(typeId);
      // Reset custom input if selecting a preset
      if (typeId !== 'other') {
          setCustomBusinessType("");
      }
  };

  const getDisplayBusinessType = () => {
      if (businessType === 'other') return customBusinessType;
      const type = businessTypes.find(t => t.id === businessType);
      return type ? type.label : customBusinessType;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Header with Progress */}
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {step < 4 ? `Etapa ${step} de ${totalSteps}` : "Concluído!"}
                </h2>
                <span className="text-xs text-gray-400 font-mono">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200" />
        </div>

        <Card className="p-6 md:p-8 shadow-sm border-gray-100 min-h-[400px] flex flex-col relative overflow-hidden">
             <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="mb-6">
                            <div className="h-12 w-12 bg-blue-50 text-blue-500 rounded-xl mb-4 flex items-center justify-center">
                                <Store className="h-6 w-6" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Vamos configurar seu negócio</h1>
                            <p className="text-gray-500 mt-2">Escolha a categoria que melhor define seu trabalho.</p>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-2">
                                <Label>Nome do negócio</Label>
                                <Input 
                                    placeholder="Ex: Studio Ana Beauty" 
                                    value={businessName}
                                    onChange={e => setBusinessName(e.target.value)}
                                    className="h-12 text-lg"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label>Tipo de negócio</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {businessTypes.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = businessType === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => handleTypeSelect(type.id)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 gap-2 hover:bg-gray-50",
                                                    isSelected 
                                                        ? "border-[#50CAE6] bg-cyan-50/30 ring-1 ring-[#50CAE6] text-[#50CAE6]" 
                                                        : "border-gray-200 text-gray-600"
                                                )}
                                            >
                                                <Icon className={cn("h-6 w-6", isSelected ? "text-[#50CAE6]" : "text-gray-400")} />
                                                <span className="text-sm font-medium">{type.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                                
                                {businessType === "other" && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="pt-2"
                                    >
                                         <Input 
                                            placeholder="Digite o tipo do seu negócio..." 
                                            value={customBusinessType}
                                            onChange={e => setCustomBusinessType(e.target.value)}
                                            className="h-12 border-[#50CAE6] focus-visible:ring-[#50CAE6]"
                                            autoFocus
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                            <Button 
                                onClick={nextStep} 
                                disabled={!businessName || !businessType || (businessType === 'other' && !customBusinessType)}
                                className="bg-[#50CAE6] hover:bg-[#45b0c9] h-12 px-8 text-base"
                            >
                                Continuar
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="mb-6">
                             <div className="h-12 w-12 bg-purple-50 text-purple-500 rounded-xl mb-4 flex items-center justify-center">
                                <Scissors className="h-6 w-6" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Quais serviços você oferece?</h1>
                            <p className="text-gray-500 mt-2">
                                {services.length > 0 ? "Já sugerimos alguns serviços para você." : "Adicione seus serviços."}
                            </p>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-2">
                                    <Label className="sr-only">Nome do serviço</Label>
                                    <Input 
                                        placeholder="Nome (Ex: Corte Masculino)" 
                                        value={tempService}
                                        onChange={e => setTempService(e.target.value)}
                                    />
                                </div>
                                <div className="w-24 space-y-2">
                                    <Label className="sr-only">Preço</Label>
                                    <Input 
                                        placeholder="R$ 00" 
                                        value={tempPrice}
                                        onChange={e => setTempPrice(e.target.value)}
                                    />
                                </div>
                                <Button size="icon" onClick={addService} disabled={!tempService} className="shrink-0 bg-gray-900 text-white hover:bg-gray-800">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto">
                                {services.map((s, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 group"
                                    >
                                        <span className="font-medium text-gray-900">{s.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-500 text-sm">R$ {s.price}</span>
                                            <button 
                                                onClick={() => setServices(services.filter((_, idx) => idx !== i))}
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                                {services.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                        Nenhum serviço adicionado ainda
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between">
                            <Button variant="ghost" onClick={prevStep}>Voltar</Button>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={nextStep} className="text-gray-500">Pular</Button>
                                <Button 
                                    onClick={nextStep}
                                    disabled={services.length === 0}
                                    className="bg-[#50CAE6] hover:bg-[#45b0c9]"
                                >
                                    Continuar
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div 
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="mb-6">
                            <div className="h-12 w-12 bg-orange-50 text-orange-500 rounded-xl mb-4 flex items-center justify-center">
                                <Users className="h-6 w-6" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Quem atende no seu negócio?</h1>
                            <p className="text-gray-500 mt-2">Você pode adicionar mais pessoas depois.</p>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Nome do profissional" 
                                    value={tempProfessional}
                                    onChange={e => setTempProfessional(e.target.value)}
                                />
                                <Button size="icon" onClick={addProfessional} disabled={!tempProfessional} className="shrink-0 bg-gray-900 text-white hover:bg-gray-800">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto">
                                {professionals.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                                {p.substring(0,2).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-900">{p}</span>
                                        </div>
                                        <button 
                                            onClick={() => setProfessionals(professionals.filter((_, idx) => idx !== i))}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {professionals.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                        Nenhum profissional adicionado
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between">
                            <Button variant="ghost" onClick={prevStep}>Voltar</Button>
                            <Button 
                                onClick={nextStep}
                                className="bg-[#50CAE6] hover:bg-[#45b0c9]"
                            >
                                Continuar
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div 
                        key="step4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center text-center justify-center py-8"
                    >
                        <div className="h-24 w-24 bg-green-50 text-green-500 rounded-full mb-6 flex items-center justify-center animate-in zoom-in duration-500">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                        
                        <h1 className="text-3xl font-bold text-gray-900">Tudo pronto!</h1>
                        <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                            Seu link de agendamento já foi criado e você pode começar a receber clientes.
                        </p>

                        <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 mt-8 mb-8 flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-gray-600 truncate flex-1 text-left">
                                marquei.mais/{businessName.toLowerCase().replace(/\s/g, '-') || "seu-negocio"}
                            </span>
                            <div className="flex gap-1">
                                <Button size="icon" variant="ghost" onClick={copyLink} className="h-8 w-8 text-gray-500 hover:text-[#50CAE6]">
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-[#50CAE6]">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Button 
                            onClick={onComplete}
                            className="w-full bg-[#50CAE6] hover:bg-[#45b0c9] h-14 text-lg font-semibold shadow-lg shadow-cyan-200/50"
                        >
                            Ir para o Painel
                        </Button>
                    </motion.div>
                )}
             </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
