import React from "react";
import { Check, CreditCard, ChevronRight, Zap, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function Subscription() {
  const currentPlan = "free"; // 'free' or 'pro'

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assinatura</h1>
        <p className="text-gray-500 mt-1">Gerencie seu plano e informações de pagamento.</p>
      </div>

      {/* Current Plan Status */}
      <Card className="border-[#50CAE6]/20 bg-gradient-to-br from-cyan-50/50 to-white">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-xl text-gray-900">Plano Gratuito</CardTitle>
                    <CardDescription className="mt-1">Você está no plano básico.</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-[#50CAE6] text-white hover:bg-[#45b0c9] border-none px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    Atual
                </Badge>
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>Seu plano renova automaticamente em <strong>20/01/2026</strong>.</span>
            </div>
            <div className="bg-white/80 rounded-lg p-4 border border-gray-100 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Agendamentos mensais</span>
                    <span className="font-medium text-gray-900">45 / 50</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#50CAE6] h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <p className="text-xs text-gray-400">Você usou 90% do seu limite gratuito.</p>
            </div>
        </CardContent>
        <CardFooter>
            <Button className="w-full bg-[#50CAE6] hover:bg-[#45b0c9] text-white font-medium">
                Fazer Upgrade para PRO
            </Button>
        </CardFooter>
      </Card>

      {/* Compare Plans */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Planos Disponíveis</h2>
        <div className="grid md:grid-cols-2 gap-4">
            {/* Free Plan */}
            <Card className="relative overflow-hidden border-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg">Gratuito</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-bold text-gray-900">R$ 0</span>
                        <span className="text-gray-500">/mês</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Até 50 agendamentos/mês</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 1 Profissional</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Link de agendamento</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Gestão de clientes básica</li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" disabled>Seu plano atual</Button>
                </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="relative overflow-hidden border-[#50CAE6] shadow-md">
                <div className="absolute top-0 right-0 bg-[#50CAE6] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Recomendado
                </div>
                <CardHeader>
                    <CardTitle className="text-lg text-[#50CAE6]">Profissional</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-bold text-gray-900">R$ 49</span>
                        <span className="text-gray-500">/mês</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#50CAE6]" /> Agendamentos ilimitados</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#50CAE6]" /> Profissionais ilimitados</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#50CAE6]" /> Lembretes automáticos (WhatsApp)</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#50CAE6]" /> Relatórios financeiros avançados</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#50CAE6]" /> Suporte prioritário</li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full bg-[#50CAE6] hover:bg-[#45b0c9] text-white">Assinar Agora</Button>
                </CardFooter>
            </Card>
        </div>
      </div>

      {/* Billing History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Histórico de Cobranças</h2>
        <Card>
            <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                    {[
                        { date: "20 Dez 2023", amount: "R$ 0,00", status: "Pago", plan: "Plano Gratuito" },
                        { date: "20 Nov 2023", amount: "R$ 0,00", status: "Pago", plan: "Plano Gratuito" },
                        { date: "20 Out 2023", amount: "R$ 0,00", status: "Pago", plan: "Plano Gratuito" },
                    ].map((invoice, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{invoice.plan}</p>
                                    <p className="text-xs text-gray-500">{invoice.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-900">{invoice.amount}</span>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-md shadow-sm border border-gray-100">
                    <Shield className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">Método de pagamento</p>
                    <p className="text-xs text-gray-500">Nenhum cartão cadastrado</p>
                </div>
            </div>
            <Button variant="outline" size="sm" className="bg-white">Adicionar</Button>
      </div>
    </div>
  );
}
