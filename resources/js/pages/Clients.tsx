import React, { useState } from "react";
import { 
    Plus, 
    Search, 
    Phone, 
    MessageCircle, 
    MoreHorizontal, 
    Filter, 
    Download, 
    Mail, 
    Calendar,
    MapPin,
    Star,
    History,
    Pencil,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { motion, AnimatePresence } from "motion/react";

import { ClientRegistrationModal } from "@/components/clients/ClientRegistrationModal";
import { useAppData, Client } from "@/context/AppDataContext";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Clients({ onNewAppointment, onNavigate }: { onNewAppointment?: () => void; onNavigate?: (page: string) => void }) {
  const { clients, addClient, updateClient, deleteClient, getLastVisit, getNextAppointment, getTotalSpent, getAppointmentsForClient, businessSettings } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New States for Edit/Delete
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper functions for derived data
  const getLastVisitStr = (clientId: string) => {
    const date = getLastVisit(clientId);
    return date ? format(date, "dd/MM/yyyy") : "-";
  };

  const getNextAppointmentStr = (clientId: string) => {
    const apt = getNextAppointment(clientId);
    return apt ? `${format(apt.startTime, "dd/MM/yyyy")} - ${format(apt.startTime, "HH:mm")}` : null;
  };

  const getTotalSpentStr = (clientId: string) => {
    const total = getTotalSpent(clientId);
    return `${businessSettings?.currency || "R$"} ${total.toFixed(2).replace(".", ",")}`;
  };

  const handleAddNewClick = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setClientToDelete(id);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
        deleteClient(clientToDelete);
        toast.success("Cliente removido com sucesso.");
        setClientToDelete(null);
        if (selectedClient?.id === clientToDelete) {
            setIsSheetOpen(false);
            setSelectedClient(null);
        }
    }
  };

  const handleClientSaved = (data: any) => {
    if (editingClient) {
        updateClient(editingClient.id, {
            name: data.name,
            email: data.email || "",
            phone: data.phone,
            notes: data.notes,
        });
        
        if (selectedClient?.id === editingClient.id) {
            setSelectedClient({ ...selectedClient, ...data });
        }
    } else {
        addClient({
            name: data.name,
            email: data.email || "",
            phone: data.phone,
            status: "active",
            notes: data.notes,
        });
    }
    setEditingClient(null);
  };

  const handleRowClick = (client: Client) => {
      setSelectedClient(client);
      setIsSheetOpen(true);
  };

  const statusColor = (status: string) => {
      switch(status) {
          case "vip": return "bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-500/15 dark:text-purple-400 dark:hover:bg-purple-500/15";
          case "active": return "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-500/15 dark:text-green-400 dark:hover:bg-green-500/15";
          case "inactive": return "bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-500/15 dark:text-gray-400 dark:hover:bg-gray-500/15";
          default: return "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400";
      }
  };

  const statusLabel = (status: string) => {
      switch(status) {
          case "vip": return "VIP";
          case "active": return "Ativo";
          case "inactive": return "Inativo";
          default: return status;
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-6 p-1 md:p-0">
       {/* Header */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[#e8ecf4] tracking-tight">Clientes</h1>
          <p className="text-gray-500 dark:text-[#8895a7] text-sm md:text-base">Gerencie sua base de clientes e histórico.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="outline" className="hidden md:flex gap-2">
                <Download className="w-4 h-4" /> Exportar
             </Button>
            <Button 
                className="w-full sm:w-auto bg-[#50CAE6] hover:bg-[#45b0c9] gap-2 shadow-sm"
                onClick={handleAddNewClick}
            >
                <Plus className="h-4 w-4" /> 
                <span className="hidden sm:inline">Novo Cliente</span>
                <span className="sm:hidden">Novo</span>
            </Button>
        </div>
      </div>

      {/* Filters & Actions */}
      <Card className="border-gray-100 dark:border-[#2d3545] shadow-sm dark:bg-[#232938]">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Buscar por nome ou email..." 
                    className="pl-9 bg-gray-50/50 dark:bg-[#1a1f2b] border-gray-200 dark:border-[#2d3545] focus:bg-white dark:focus:bg-[#232938] transition-all dark:text-[#e8ecf4] dark:placeholder:text-[#8895a7]" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                 <Button variant="outline" size="sm" className="gap-2 text-gray-600 dark:text-[#8895a7] border-gray-200 dark:border-[#2d3545] whitespace-nowrap">
                    <Filter className="w-4 h-4" /> Filtros
                 </Button>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="sm" className="gap-2 text-gray-500 dark:text-[#8895a7]">
                             Status: Todos
                         </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Todos</DropdownMenuItem>
                        <DropdownMenuItem>Ativos</DropdownMenuItem>
                        <DropdownMenuItem>VIP</DropdownMenuItem>
                        <DropdownMenuItem>Inativos</DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
            </div>
        </CardContent>
      </Card>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-gray-100 dark:border-[#2d3545] bg-white dark:bg-[#232938] shadow-sm overflow-hidden flex-1">
        <ScrollArea className="h-full">
            <Table>
                <TableHeader className="bg-gray-50/50 dark:bg-[#1a1f2b]/50">
                    <TableRow className="hover:bg-transparent border-gray-100 dark:border-[#2d3545]">
                    <TableHead className="w-[300px] text-gray-600 dark:text-[#8895a7]">Cliente</TableHead>
                    <TableHead className="text-gray-600 dark:text-[#8895a7]">Status</TableHead>
                    <TableHead className="text-gray-600 dark:text-[#8895a7]">Telefone</TableHead>
                    <TableHead className="text-gray-600 dark:text-[#8895a7]">Última Visita</TableHead>
                    <TableHead className="text-right text-gray-600 dark:text-[#8895a7]">Total Gasto</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <AnimatePresence>
                    {filteredClients.map((client) => (
                    <motion.tr
                        key={client.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                        className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-[#2a3142]/50 transition-colors group border-b border-gray-100 dark:border-[#2d3545] last:border-0"
                        onClick={() => handleRowClick(client)}
                    >
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-gray-100 dark:border-[#2d3545]">
                                    <AvatarImage src={client.avatar} />
                                    <AvatarFallback className="bg-[#50CAE6]/10 text-[#50CAE6] font-medium">
                                        {client.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900 dark:text-[#e8ecf4] group-hover:text-[#50CAE6] transition-colors">{client.name}</span>
                                    <span className="text-xs text-gray-500 dark:text-[#8895a7]">{client.email}</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary" className={`font-medium border-0 ${statusColor(client.status)}`}>
                                {statusLabel(client.status)}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-[#8895a7] text-sm">{client.phone}</TableCell>
                        <TableCell className="text-gray-600 dark:text-[#8895a7] text-sm">{getLastVisitStr(client.id)}</TableCell>
                        <TableCell className="text-right font-medium text-gray-900 dark:text-[#e8ecf4]">{getTotalSpentStr(client.id)}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 dark:text-[#8895a7] hover:text-gray-600 dark:hover:text-[#e8ecf4]">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRowClick(client); }}>
                                        Ver detalhes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => handleEditClick(e, client)}>
                                        <Pencil className="mr-2 h-4 w-4" /> Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => handleDeleteClick(e, client.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Excluir cliente
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </motion.tr>
                    ))}
                    </AnimatePresence>
                </TableBody>
            </Table>
        </ScrollArea>
      </div>

      {/* Mobile Grid View */}
      <div className="md:hidden space-y-3 pb-20">
        <AnimatePresence>
        {filteredClients.map((client) => (
            <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
            >
            <Card className="border-gray-100 dark:border-[#2d3545] active:scale-[0.99] transition-transform dark:bg-[#232938]" onClick={() => handleRowClick(client)}>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-gray-100 dark:border-[#2d3545]">
                                <AvatarImage src={client.avatar} />
                                <AvatarFallback className="bg-[#50CAE6]/10 text-[#50CAE6]">
                                    {client.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-[#e8ecf4]">{client.name}</h3>
                                <Badge variant="secondary" className={`mt-1 text-[10px] h-5 px-1.5 font-normal border-0 ${statusColor(client.status)}`}>
                                    {statusLabel(client.status)}
                                </Badge>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 dark:text-[#8895a7]">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => handleEditClick(e, client)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => handleDeleteClick(e, client.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-[#8895a7] bg-gray-50 dark:bg-[#1a1f2b] p-3 rounded-lg mb-3">
                        <div>
                            <span className="block text-gray-400 dark:text-[#8895a7]/70 text-[10px] uppercase tracking-wider">Última Visita</span>
                            <span className="font-medium text-gray-700 dark:text-[#e8ecf4]">{getLastVisitStr(client.id)}</span>
                        </div>
                        <div>
                            <span className="block text-gray-400 dark:text-[#8895a7]/70 text-[10px] uppercase tracking-wider">Total Gasto</span>
                            <span className="font-medium text-gray-700 dark:text-[#e8ecf4]">{getTotalSpentStr(client.id)}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button className="flex-1 bg-white dark:bg-[#232938] border border-gray-200 dark:border-[#2d3545] text-gray-700 dark:text-[#e8ecf4] hover:bg-gray-50 dark:hover:bg-[#2a3142] h-9 text-xs" onClick={(e) => { e.stopPropagation(); window.open(`tel:${client.phone.replace(/\D/g, '')}`, '_self'); }}>
                            <Phone className="w-3.5 h-3.5 mr-2" /> Ligar
                        </Button>
                         <Button className="flex-1 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-0 h-9 text-xs" onClick={(e) => { e.stopPropagation(); if (onNavigate) { onNavigate('whatsapp'); } else { const phone = client.phone.replace(/\D/g, ''); window.open(`https://wa.me/55${phone}`, '_blank'); } }}>
                            <MessageCircle className="w-3.5 h-3.5 mr-2" /> WhatsApp
                        </Button>
                    </div>
                </CardContent>
            </Card>
            </motion.div>
        ))}
        </AnimatePresence>
      </div>

      {/* Client Details Sheet */}
      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-y-auto max-h-[90vh]">
            <DialogHeader className="sr-only">
                <DialogTitle>Detalhes do Cliente</DialogTitle>
                <DialogDescription>Visualizar e editar detalhes do cliente</DialogDescription>
            </DialogHeader>
            {selectedClient && (
                <div className="flex flex-col">
                    {/* Header with Cover */}
                    <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 h-32 relative shrink-0 rounded-t-lg">
                    </div>
                    
                    <div className="px-6 -mt-12 mb-6 flex items-end justify-between relative z-10">
                        <div className="flex items-end gap-4">
                            <Avatar className="w-24 h-24 border-4 border-white dark:border-[#232938] shadow-md">
                                <AvatarImage src={selectedClient.avatar} />
                                <AvatarFallback className="bg-white dark:bg-[#2a3142] text-gray-900 dark:text-[#e8ecf4] text-2xl font-bold">
                                    {selectedClient.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="mb-2">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-[#e8ecf4]">{selectedClient.name}</h2>
                                <p className="text-gray-500 dark:text-[#8895a7] text-sm">{selectedClient.email}</p>
                            </div>
                        </div>
                        <div className="mb-2 flex gap-2">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                className="hidden sm:flex"
                                onClick={(e) => { setIsSheetOpen(false); handleEditClick(e, selectedClient); }}
                            >
                                <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                            </Button>
                             <Badge variant="secondary" className={`px-3 py-1 text-sm h-8 flex items-center justify-center ${statusColor(selectedClient.status)}`}>
                                {statusLabel(selectedClient.status)}
                            </Badge>
                        </div>
                    </div>

                    <div className="px-6 flex-1 pb-6">
                        <div className="grid grid-cols-2 gap-4 mb-8">
                             <Button className="w-full bg-[#50CAE6] hover:bg-[#45b0c9]" onClick={() => { setIsSheetOpen(false); onNewAppointment?.(); toast.info(`Agendar para ${selectedClient.name} — use a aba Agenda.`); }}>
                                <Calendar className="w-4 h-4 mr-2" /> Agendar
                             </Button>
                             <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 border-gray-200 dark:border-[#2d3545]" onClick={() => { const phone = selectedClient.phone.replace(/\D/g, ''); window.open(`https://wa.me/55${phone}`, '_blank'); }}>
                                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                                </Button>
                                <Button variant="outline" className="flex-1 border-gray-200 dark:border-[#2d3545]" onClick={() => { window.open(`tel:${selectedClient.phone.replace(/\D/g, '')}`, '_self'); }}>
                                    <Phone className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" className="flex-1 border-gray-200 dark:border-[#2d3545]" onClick={() => { window.open(`mailto:${selectedClient.email}`, '_self'); }}>
                                    <Mail className="w-4 h-4" />
                                </Button>
                             </div>
                        </div>

                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="w-full justify-start h-11 bg-transparent border-b border-gray-100 dark:border-[#2d3545] rounded-none p-0 mb-6 space-x-6">
                                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#50CAE6] data-[state=active]:bg-transparent px-0 pb-3 data-[state=active]:shadow-none font-medium text-gray-500 dark:text-[#8895a7] data-[state=active]:text-[#50CAE6]">Visão Geral</TabsTrigger>
                                <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#50CAE6] data-[state=active]:bg-transparent px-0 pb-3 data-[state=active]:shadow-none font-medium text-gray-500 dark:text-[#8895a7] data-[state=active]:text-[#50CAE6]">Histórico</TabsTrigger>
                                <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#50CAE6] data-[state=active]:bg-transparent px-0 pb-3 data-[state=active]:shadow-none font-medium text-gray-500 dark:text-[#8895a7] data-[state=active]:text-[#50CAE6]">Notas</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="overview" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-[#1a1f2b] p-4 rounded-xl border border-gray-100 dark:border-[#2d3545]">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-[#8895a7] mb-1">
                                            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                                            <span className="text-xs font-semibold uppercase tracking-wider">Total Gasto</span>
                                        </div>
                                        <p className="text-xl font-bold text-gray-900 dark:text-[#e8ecf4]">{getTotalSpentStr(selectedClient.id)}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-[#1a1f2b] p-4 rounded-xl border border-gray-100 dark:border-[#2d3545]">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-[#8895a7] mb-1">
                                            <History className="w-4 h-4" />
                                            <span className="text-xs font-semibold uppercase tracking-wider">Visitas</span>
                                        </div>
                                        <p className="text-xl font-bold text-gray-900 dark:text-[#e8ecf4]">{getAppointmentsForClient(selectedClient.id).filter(a => a.status === 'confirmed' && a.startTime < new Date()).length}</p>
                                    </div>
                                </div>

                                {(() => {
                                    const nextApt = getNextAppointment(selectedClient.id);
                                    return nextApt ? (
                                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border-blue-100 dark:border-blue-500/20">
                                            <CardContent className="p-4 flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#232938] flex items-center justify-center shrink-0 shadow-sm text-blue-500">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-blue-900 dark:text-blue-300">Próximo Agendamento</h4>
                                                    <p className="text-blue-700 dark:text-blue-400 mt-1">{format(nextApt.startTime, "dd/MM/yyyy")} - {format(nextApt.startTime, "HH:mm")}</p>
                                                    <p className="text-blue-600/70 dark:text-blue-400/70 text-sm mt-0.5">{nextApt.serviceName} · {nextApt.professional}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : null;
                                })()}

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-[#e8ecf4]">Informações de Contato</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-[#8895a7]">
                                            <Phone className="w-4 h-4" /> {selectedClient.phone}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-[#8895a7]">
                                            <Mail className="w-4 h-4" /> {selectedClient.email}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-[#8895a7]">
                                            <MapPin className="w-4 h-4" /> Rua das Flores, 123 - Centro
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="history">
                                <div className="space-y-4">
                                    {(() => {
                                        const clientAppts = getAppointmentsForClient(selectedClient.id)
                                            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
                                        
                                        if (clientAppts.length === 0) {
                                            return (
                                                <div className="text-center py-8 text-gray-400">
                                                    <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                    <p className="text-sm">Nenhum histórico encontrado.</p>
                                                </div>
                                            );
                                        }

                                        return clientAppts.map((apt) => (
                                            <div key={apt.id} className="flex gap-4 items-start pb-4 border-b border-gray-100 dark:border-[#2d3545] last:border-0">
                                                <div className="text-center w-14 shrink-0">
                                                    <span className="block text-xs font-bold text-gray-400 dark:text-[#8895a7] uppercase">
                                                        {format(apt.startTime, "MMM", { locale: ptBR })}
                                                    </span>
                                                    <span className="block text-lg font-bold text-gray-900 dark:text-[#e8ecf4]">
                                                        {format(apt.startTime, "d")}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-[#e8ecf4]">{apt.serviceName}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-[#8895a7]">Com {apt.professional} · {businessSettings?.currency || "R$"} {apt.price.toFixed(2).replace(".", ",")}</p>
                                                    <Badge variant="outline" className={`mt-2 text-xs font-normal ${
                                                        apt.status === 'confirmed' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/15 border-green-100 dark:border-green-500/30' :
                                                        apt.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/15 border-yellow-100 dark:border-yellow-500/30' :
                                                        'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/15 border-red-100 dark:border-red-500/30'
                                                    }`}>
                                                        {apt.status === 'confirmed' ? (apt.startTime < new Date() ? 'Concluído' : 'Confirmado') : 
                                                         apt.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </TabsContent>

                            <TabsContent value="notes">
                                <div className="bg-yellow-50/50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 p-4 rounded-xl">
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center gap-2">
                                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> Notas Preferenciais
                                    </h4>
                                    <p className="text-sm text-yellow-800/80 dark:text-yellow-400/80 leading-relaxed">
                                        {selectedClient.notes || "Nenhuma nota registrada."}
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <label className="text-sm font-medium text-gray-700 dark:text-[#e8ecf4] mb-2 block">Adicionar nota</label>
                                    <textarea className="w-full border border-gray-200 dark:border-[#2d3545] bg-white dark:bg-[#1a1f2b] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#50CAE6]/20 outline-none min-h-[100px] dark:text-[#e8ecf4] dark:placeholder:text-[#8895a7]" placeholder="Digite uma observação..." />
                                    <Button size="sm" className="mt-2 bg-gray-900 dark:bg-[#50CAE6] text-white dark:hover:bg-[#45b0c9]">Salvar Nota</Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>

      <ClientRegistrationModal 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onClientSaved={handleClientSaved}
        clientToEdit={editingClient}
      />

      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                <AlertDialogDescription>
                    Essa ação não pode ser desfeita. O cliente e todo seu histórico serão removidos permanentemente.
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