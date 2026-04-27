import { startOfToday, addHours, addDays, subDays } from "date-fns";
import type { Service, Professional, Client, BusinessSettings, WeeklySchedule } from "@/context/AppDataContext";
import { getBarbeariaWhatsApp, getNailWhatsApp, getPetWhatsApp, getFitnessWhatsApp, getEsteticaWhatsApp } from "@/context/DemoWhatsAppData";

// Serialized appointment (dates as ISO strings)
export interface DemoAppointmentSerialized {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professional: string;
  startTime: string;
  durationMinutes: number;
  status: "confirmed" | "pending" | "cancelled";
  price: number;
}

export interface DemoNotificationSerialized {
  id: string;
  type: "new_pending" | "confirmed" | "cancelled" | "reminder";
  title: string;
  message: string;
  appointmentId?: string;
  createdAt: string;
  read: boolean;
}

export interface DemoProfile {
  id: string;
  label: string;
  niche: string;
  icon: string;
  email: string;
  color: string;
  services: Service[];
  professionals: Professional[];
  clients: Client[];
  appointments: DemoAppointmentSerialized[];
  notifications: DemoNotificationSerialized[];
  settings: BusinessSettings;
  whatsappConversations?: DemoWhatsAppConversation[];
}

export interface DemoWhatsAppConversation {
  contactPhone: string;
  contactName: string;
  lastMessage: string;
  lastTimestamp: number;
  lastDirection: string;
  unreadCount: number;
  messages: DemoWhatsAppMessage[];
}

export interface DemoWhatsAppMessage {
  id: string;
  direction: "incoming" | "outgoing";
  body: string;
  timestamp: number;
  status: string;
  contactPhone: string;
}

// Helper schedules
const SCHED_CLOSED: { enabled: false; start: string; end: string; lunchEnabled: false; lunchStart: string; lunchEnd: string } = { enabled: false, start: "09:00", end: "18:00", lunchEnabled: false, lunchStart: "12:00", lunchEnd: "13:00" };
const SCHED_FULL = (s: string, e: string, lunch = true) => ({ enabled: true as const, start: s, end: e, lunchEnabled: lunch, lunchStart: "12:00", lunchEnd: "13:00" });

const BASE_SETTINGS: BusinessSettings = {
  name: "", address: "", phone: "", welcomeMessage: "",
  showPrices: true, allowProfessionalSelection: true, autoConfirm: false,
  maxAdvanceDays: 14, cancellationPolicy: "", requireEmail: false,
  themeMode: "light",
  whatsappEnabled: true, whatsappAutoConfirmation: true, whatsappAutoReminder: true,
  whatsappReminderHours: 2, whatsappAutoFollowup: false,
  businessHours: {
    0: SCHED_CLOSED,
    1: SCHED_FULL("08:00", "20:00"),
    2: SCHED_FULL("08:00", "20:00"),
    3: SCHED_FULL("08:00", "20:00"),
    4: SCHED_FULL("08:00", "20:00"),
    5: SCHED_FULL("08:00", "20:00"),
    6: SCHED_FULL("09:00", "17:00", false),
  },
  bufferMinutes: 0, minAdvanceHours: 0, maxConcurrentBookings: 0, blockedDates: [],
  whatsappConfirmationTemplate: "Ola {{cliente}}! Seu agendamento de {{servico}} foi confirmado para {{data}} as {{hora}} com {{profissional}}. Ate la!",
  whatsappReminderTemplate: "Oi {{cliente}}! Lembrete: voce tem {{servico}} amanha as {{hora}} com {{profissional}}. Confirma sua presenca?",
  whatsappFollowupTemplate: "Oi {{cliente}}! Obrigado por nos visitar! Como foi seu {{servico}}? Esperamos te ver em breve!",
  notifyOnNewBooking: true, notifyOnCancellation: true, notifyOnReminder: true,
  logoUrl: "", socialInstagram: "", socialFacebook: "", socialTiktok: "", socialGoogleMaps: "",
  ownerName: "", ownerEmail: "",
  publicPageDescription: "", publicPageColor: "#50CAE6",
  currency: "R$", language: "pt-BR",
};

// ============================
// 1. BARBEARIA
// ============================
function generateBarbearia(): DemoProfile {
  const today = startOfToday();
  const services: Service[] = [
    { id: "bs1", name: "Corte Masculino", duration: 30, price: 45, description: "Corte classico ou moderno com acabamento na navalha" },
    { id: "bs2", name: "Barba Completa", duration: 25, price: 35, description: "Modelagem de barba com toalha quente e pos-barba" },
    { id: "bs3", name: "Corte + Barba", duration: 50, price: 70, description: "Combo corte de cabelo e barba completa" },
    { id: "bs4", name: "Degradê / Fade", duration: 40, price: 55, description: "Corte degrade com transicao precisa" },
    { id: "bs5", name: "Sobrancelha", duration: 10, price: 15, description: "Design e acabamento de sobrancelhas masculinas" },
    { id: "bs6", name: "Pigmentacao Capilar", duration: 90, price: 180, description: "Micropigmentacao para preenchimento de falhas" },
    { id: "bs7", name: "Relaxamento", duration: 45, price: 60, description: "Relaxamento e alinhamento dos fios" },
    { id: "bs8", name: "Platinado", duration: 120, price: 200, description: "Descoloracao completa com tonalizacao platinada" },
  ];

  const schedule1: WeeklySchedule = {
    0: SCHED_CLOSED,
    1: SCHED_FULL("09:00", "20:00"),
    2: SCHED_FULL("09:00", "20:00"),
    3: SCHED_FULL("09:00", "20:00"),
    4: SCHED_FULL("09:00", "20:00"),
    5: SCHED_FULL("09:00", "20:00"),
    6: SCHED_FULL("09:00", "17:00", false),
  };

  const professionals: Professional[] = [
    { id: "bp1", name: "Ricardo Barber", roles: ["Barbeiro Senior"], serviceIds: ["bs1", "bs2", "bs3", "bs4", "bs6", "bs8"], initials: "RB", photoUrl: "https://i.pravatar.cc/300?u=ricardo-barber", email: "ricardo@barberking.com", phone: "(11) 99888-1001", workingHours: schedule1 },
    { id: "bp2", name: "Thiago Cortes", roles: ["Barbeiro"], serviceIds: ["bs1", "bs2", "bs3", "bs4", "bs5"], initials: "TC", photoUrl: "https://i.pravatar.cc/300?u=thiago-barber", email: "thiago@barberking.com", phone: "(11) 99888-1002", workingHours: { ...schedule1, 3: SCHED_CLOSED } },
    { id: "bp3", name: "Felipe Blade", roles: ["Barbeiro", "Colorista"], serviceIds: ["bs1", "bs3", "bs4", "bs7", "bs8"], initials: "FB", photoUrl: "https://i.pravatar.cc/300?u=felipe-barber", email: "felipe@barberking.com", phone: "(11) 99888-1003", workingHours: schedule1 },
  ];

  const clients: Client[] = [
    { id: "bc1", name: "Lucas Mendes", email: "lucas.m@email.com", phone: "(11) 99111-0001", status: "vip", notes: "Cliente fiel, sempre corte fade medio" },
    { id: "bc2", name: "Pedro Almeida", email: "pedro.a@email.com", phone: "(11) 99111-0002", status: "active" },
    { id: "bc3", name: "Guilherme Santos", email: "gui.s@email.com", phone: "(11) 99111-0003", status: "active" },
    { id: "bc4", name: "Rafael Costa", email: "rafa.c@email.com", phone: "(11) 99111-0004", status: "active" },
    { id: "bc5", name: "Bruno Oliveira", email: "bruno.o@email.com", phone: "(11) 99111-0005", status: "vip", notes: "Faz platinado a cada 2 meses" },
    { id: "bc6", name: "Mateus Ferreira", email: "mateus.f@email.com", phone: "(11) 99111-0006", status: "active" },
    { id: "bc7", name: "Caio Ribeiro", email: "caio.r@email.com", phone: "(11) 99111-0007", status: "inactive" },
    { id: "bc8", name: "Andre Souza", email: "andre.s@email.com", phone: "(11) 99111-0008", status: "active" },
  ];

  const appointments: DemoAppointmentSerialized[] = [
    { id: "ba1", clientId: "bc1", clientName: "Lucas Mendes", serviceId: "bs4", serviceName: "Degradê / Fade", professionalId: "bp1", professional: "Ricardo Barber", startTime: addHours(today, 9).toISOString(), durationMinutes: 40, status: "confirmed", price: 55 },
    { id: "ba2", clientId: "bc2", clientName: "Pedro Almeida", serviceId: "bs3", serviceName: "Corte + Barba", professionalId: "bp2", professional: "Thiago Cortes", startTime: addHours(today, 10).toISOString(), durationMinutes: 50, status: "pending", price: 70 },
    { id: "ba3", clientId: "bc3", clientName: "Guilherme Santos", serviceId: "bs1", serviceName: "Corte Masculino", professionalId: "bp3", professional: "Felipe Blade", startTime: addHours(today, 11).toISOString(), durationMinutes: 30, status: "confirmed", price: 45 },
    { id: "ba4", clientId: "bc5", clientName: "Bruno Oliveira", serviceId: "bs8", serviceName: "Platinado", professionalId: "bp3", professional: "Felipe Blade", startTime: addHours(today, 14).toISOString(), durationMinutes: 120, status: "confirmed", price: 200 },
    { id: "ba5", clientId: "bc4", clientName: "Rafael Costa", serviceId: "bs2", serviceName: "Barba Completa", professionalId: "bp1", professional: "Ricardo Barber", startTime: addHours(today, 16).toISOString(), durationMinutes: 25, status: "pending", price: 35 },
    { id: "ba6", clientId: "bc6", clientName: "Mateus Ferreira", serviceId: "bs1", serviceName: "Corte Masculino", professionalId: "bp2", professional: "Thiago Cortes", startTime: addHours(addDays(today, 1), 10).toISOString(), durationMinutes: 30, status: "confirmed", price: 45 },
    { id: "ba7", clientId: "bc8", clientName: "Andre Souza", serviceId: "bs3", serviceName: "Corte + Barba", professionalId: "bp1", professional: "Ricardo Barber", startTime: addHours(addDays(today, 1), 15).toISOString(), durationMinutes: 50, status: "confirmed", price: 70 },
    { id: "ba8", clientId: "bc1", clientName: "Lucas Mendes", serviceId: "bs4", serviceName: "Degradê / Fade", professionalId: "bp1", professional: "Ricardo Barber", startTime: addHours(subDays(today, 3), 10).toISOString(), durationMinutes: 40, status: "confirmed", price: 55 },
    { id: "ba9", clientId: "bc5", clientName: "Bruno Oliveira", serviceId: "bs1", serviceName: "Corte Masculino", professionalId: "bp3", professional: "Felipe Blade", startTime: addHours(subDays(today, 7), 11).toISOString(), durationMinutes: 30, status: "confirmed", price: 45 },
    { id: "ba10", clientId: "bc2", clientName: "Pedro Almeida", serviceId: "bs3", serviceName: "Corte + Barba", professionalId: "bp2", professional: "Thiago Cortes", startTime: addHours(subDays(today, 5), 14).toISOString(), durationMinutes: 50, status: "confirmed", price: 70 },
  ];

  const notifications: DemoNotificationSerialized[] = [
    { id: "bn1", type: "new_pending", title: "Novo agendamento pendente", message: "Pedro Almeida agendou Corte + Barba para hoje as 10:00.", appointmentId: "ba2", createdAt: new Date().toISOString(), read: false },
    { id: "bn2", type: "new_pending", title: "Novo agendamento pendente", message: "Rafael Costa agendou Barba Completa para hoje as 16:00.", appointmentId: "ba5", createdAt: new Date().toISOString(), read: false },
  ];

  return {
    id: "barbearia",
    label: "Barber King",
    niche: "Barbearia",
    icon: "scissors",
    email: "demo@barberking.com",
    color: "#3B82F6",
    services, professionals, clients, appointments, notifications,
    settings: {
      ...BASE_SETTINGS,
      name: "Barber King",
      address: "Av. Paulista, 1500 - Bela Vista, SP",
      phone: "(11) 99888-1000",
      welcomeMessage: "Fala, parceiro! Agenda teu horario e chega no estilo.",
      ownerName: "Ricardo Barber",
      ownerEmail: "ricardo@barberking.com",
      publicPageDescription: "A melhor barbearia de SP. Cortes modernos, ambiente descontraido e cerveja gelada.",
      publicPageColor: "#3B82F6",
      socialInstagram: "@barberking_sp",
      socialFacebook: "barberkingsp",
      autoConfirm: false,
      bufferMinutes: 10,
      themeMode: "light",
      currency: "R$",
      businessHours: {
        0: SCHED_CLOSED,
        1: SCHED_FULL("09:00", "20:00"),
        2: SCHED_FULL("09:00", "20:00"),
        3: SCHED_FULL("09:00", "20:00"),
        4: SCHED_FULL("09:00", "20:00"),
        5: SCHED_FULL("09:00", "21:00"),
        6: SCHED_FULL("09:00", "17:00", false),
      },
    },
    whatsappConversations: getBarbeariaWhatsApp(),
  };
}

// ============================
// 2. NAIL DESIGNER
// ============================
function generateNailDesigner(): DemoProfile {
  const today = startOfToday();
  const services: Service[] = [
    { id: "ns1", name: "Manicure Simples", duration: 40, price: 35, description: "Cutilagem e esmaltacao das unhas" },
    { id: "ns2", name: "Pedicure Completa", duration: 50, price: 45, description: "Cutilagem, esfoliacao e esmaltacao" },
    { id: "ns3", name: "Manicure + Pedicure", duration: 80, price: 70, description: "Combo completo maos e pes" },
    { id: "ns4", name: "Alongamento em Gel", duration: 120, price: 180, description: "Alongamento com gel moldado e acabamento" },
    { id: "ns5", name: "Alongamento Fibra de Vidro", duration: 150, price: 220, description: "Alongamento em fibra de vidro com nail art" },
    { id: "ns6", name: "Esmaltacao em Gel", duration: 45, price: 65, description: "Esmaltacao em gel com secagem em cabine UV" },
    { id: "ns7", name: "Manutencao Alongamento", duration: 60, price: 90, description: "Retoque e manutencao do alongamento" },
    { id: "ns8", name: "Nail Art (por unha)", duration: 15, price: 12, description: "Decoracao artistica personalizada" },
    { id: "ns9", name: "Banho de Gel", duration: 60, price: 80, description: "Fortalecimento com banho de gel" },
  ];

  const schedule1: WeeklySchedule = {
    0: SCHED_CLOSED,
    1: SCHED_FULL("08:00", "18:00"),
    2: SCHED_FULL("08:00", "18:00"),
    3: SCHED_FULL("08:00", "18:00"),
    4: SCHED_FULL("08:00", "18:00"),
    5: SCHED_FULL("08:00", "18:00"),
    6: SCHED_FULL("08:00", "14:00", false),
  };

  const professionals: Professional[] = [
    { id: "np1", name: "Patricia Lima", roles: ["Nail Designer", "Manicure"], serviceIds: ["ns1", "ns2", "ns3", "ns4", "ns5", "ns6", "ns7", "ns8", "ns9"], initials: "PL", photoUrl: "https://i.pravatar.cc/300?u=patricia-nail", email: "paty@unhaspaty.com", phone: "(21) 99777-2001", workingHours: schedule1 },
    { id: "np2", name: "Camila Duarte", roles: ["Manicure", "Pedicure"], serviceIds: ["ns1", "ns2", "ns3", "ns6", "ns9"], initials: "CD", photoUrl: "https://i.pravatar.cc/300?u=camila-nail", email: "camila@unhaspaty.com", phone: "(21) 99777-2002", workingHours: { ...schedule1, 6: SCHED_CLOSED } },
  ];

  const clients: Client[] = [
    { id: "nc1", name: "Fernanda Rodrigues", email: "fer.rod@email.com", phone: "(21) 98222-0001", status: "vip", notes: "Sempre faz alongamento em gel, prefere tons nude" },
    { id: "nc2", name: "Amanda Martins", email: "amanda.m@email.com", phone: "(21) 98222-0002", status: "active" },
    { id: "nc3", name: "Isabela Gomes", email: "isa.g@email.com", phone: "(21) 98222-0003", status: "active" },
    { id: "nc4", name: "Larissa Nunes", email: "lari.n@email.com", phone: "(21) 98222-0004", status: "vip", notes: "Alergica a esmalte com formol" },
    { id: "nc5", name: "Juliana Pereira", email: "ju.pereira@email.com", phone: "(21) 98222-0005", status: "active" },
    { id: "nc6", name: "Mariana Alves", email: "mari.alves@email.com", phone: "(21) 98222-0006", status: "active" },
    { id: "nc7", name: "Bruna Carvalho", email: "bruna.c@email.com", phone: "(21) 98222-0007", status: "inactive" },
  ];

  const appointments: DemoAppointmentSerialized[] = [
    { id: "na1", clientId: "nc1", clientName: "Fernanda Rodrigues", serviceId: "ns4", serviceName: "Alongamento em Gel", professionalId: "np1", professional: "Patricia Lima", startTime: addHours(today, 8).toISOString(), durationMinutes: 120, status: "confirmed", price: 180 },
    { id: "na2", clientId: "nc2", clientName: "Amanda Martins", serviceId: "ns3", serviceName: "Manicure + Pedicure", professionalId: "np2", professional: "Camila Duarte", startTime: addHours(today, 9).toISOString(), durationMinutes: 80, status: "confirmed", price: 70 },
    { id: "na3", clientId: "nc3", clientName: "Isabela Gomes", serviceId: "ns6", serviceName: "Esmaltacao em Gel", professionalId: "np2", professional: "Camila Duarte", startTime: addHours(today, 14).toISOString(), durationMinutes: 45, status: "pending", price: 65 },
    { id: "na4", clientId: "nc4", clientName: "Larissa Nunes", serviceId: "ns7", serviceName: "Manutencao Alongamento", professionalId: "np1", professional: "Patricia Lima", startTime: addHours(today, 14).toISOString(), durationMinutes: 60, status: "confirmed", price: 90 },
    { id: "na5", clientId: "nc5", clientName: "Juliana Pereira", serviceId: "ns1", serviceName: "Manicure Simples", professionalId: "np2", professional: "Camila Duarte", startTime: addHours(addDays(today, 1), 10).toISOString(), durationMinutes: 40, status: "confirmed", price: 35 },
    { id: "na6", clientId: "nc1", clientName: "Fernanda Rodrigues", serviceId: "ns4", serviceName: "Alongamento em Gel", professionalId: "np1", professional: "Patricia Lima", startTime: addHours(subDays(today, 4), 9).toISOString(), durationMinutes: 120, status: "confirmed", price: 180 },
    { id: "na7", clientId: "nc6", clientName: "Mariana Alves", serviceId: "ns9", serviceName: "Banho de Gel", professionalId: "np1", professional: "Patricia Lima", startTime: addHours(subDays(today, 2), 13).toISOString(), durationMinutes: 60, status: "confirmed", price: 80 },
    { id: "na8", clientId: "nc4", clientName: "Larissa Nunes", serviceId: "ns5", serviceName: "Alongamento Fibra de Vidro", professionalId: "np1", professional: "Patricia Lima", startTime: addHours(subDays(today, 10), 8).toISOString(), durationMinutes: 150, status: "confirmed", price: 220 },
  ];

  const notifications: DemoNotificationSerialized[] = [
    { id: "nn1", type: "new_pending", title: "Novo agendamento pendente", message: "Isabela Gomes agendou Esmaltacao em Gel para hoje as 14:00.", appointmentId: "na3", createdAt: new Date().toISOString(), read: false },
  ];

  return {
    id: "nail",
    label: "Unhas da Paty",
    niche: "Nail Designer",
    icon: "palette",
    email: "demo@unhaspaty.com",
    color: "#EC4899",
    services, professionals, clients, appointments, notifications,
    settings: {
      ...BASE_SETTINGS,
      name: "Unhas da Paty",
      address: "Rua das Flores, 45 - Copacabana, RJ",
      phone: "(21) 99777-2000",
      welcomeMessage: "Suas unhas merecem o melhor! Agende e arrase.",
      ownerName: "Patricia Lima",
      ownerEmail: "paty@unhaspaty.com",
      publicPageDescription: "Nail designer especialista em alongamento em gel, fibra e nail art. Ambiente acolhedor e atendimento personalizado.",
      publicPageColor: "#EC4899",
      socialInstagram: "@unhasdapaty",
      socialTiktok: "@unhaspaty",
      autoConfirm: true,
      bufferMinutes: 5,
      minAdvanceHours: 2,
      themeMode: "light",
      currency: "R$",
      businessHours: {
        0: SCHED_CLOSED,
        1: SCHED_FULL("08:00", "18:00"),
        2: SCHED_FULL("08:00", "18:00"),
        3: SCHED_FULL("08:00", "18:00"),
        4: SCHED_FULL("08:00", "18:00"),
        5: SCHED_FULL("08:00", "18:00"),
        6: SCHED_FULL("08:00", "14:00", false),
      },
    },
    whatsappConversations: getNailWhatsApp(),
  };
}

// ============================
// 3. PET SHOP / VETERINARIO
// ============================
function generatePetShop(): DemoProfile {
  const today = startOfToday();
  const services: Service[] = [
    { id: "ps1", name: "Banho Pequeno Porte", duration: 45, price: 55, description: "Banho completo para caes ate 10kg" },
    { id: "ps2", name: "Banho Grande Porte", duration: 60, price: 85, description: "Banho completo para caes acima de 10kg" },
    { id: "ps3", name: "Banho + Tosa Higienica", duration: 75, price: 95, description: "Banho com tosa nas regioes intimas e patas" },
    { id: "ps4", name: "Tosa na Tesoura", duration: 90, price: 130, description: "Tosa estetica artesanal na tesoura" },
    { id: "ps5", name: "Tosa na Maquina", duration: 60, price: 80, description: "Tosa completa na maquina" },
    { id: "ps6", name: "Consulta Veterinaria", duration: 30, price: 150, description: "Consulta clinica geral com avaliacao" },
    { id: "ps7", name: "Vacinacao", duration: 15, price: 80, description: "Aplicacao de vacina com avaliacao rapida" },
    { id: "ps8", name: "Hidratacao de Pelagem", duration: 30, price: 50, description: "Tratamento hidratante para pelagem" },
  ];

  const schedule1: WeeklySchedule = {
    0: SCHED_CLOSED,
    1: SCHED_FULL("08:00", "18:00"),
    2: SCHED_FULL("08:00", "18:00"),
    3: SCHED_FULL("08:00", "18:00"),
    4: SCHED_FULL("08:00", "18:00"),
    5: SCHED_FULL("08:00", "18:00"),
    6: SCHED_FULL("08:00", "13:00", false),
  };

  const professionals: Professional[] = [
    { id: "pp1", name: "Dra. Marina Lopes", roles: ["Veterinaria"], serviceIds: ["ps6", "ps7"], initials: "ML", photoUrl: "https://i.pravatar.cc/300?u=marina-vet", email: "marina@aumigo.com", phone: "(31) 99666-3001", workingHours: schedule1 },
    { id: "pp2", name: "Joao Groomer", roles: ["Groomer Senior"], serviceIds: ["ps1", "ps2", "ps3", "ps4", "ps5", "ps8"], initials: "JG", photoUrl: "https://i.pravatar.cc/300?u=joao-groomer", email: "joao@aumigo.com", phone: "(31) 99666-3002", workingHours: schedule1 },
    { id: "pp3", name: "Carla Banhista", roles: ["Banhista"], serviceIds: ["ps1", "ps2", "ps3", "ps8"], initials: "CB", photoUrl: "https://i.pravatar.cc/300?u=carla-pet", email: "carla@aumigo.com", phone: "(31) 99666-3003", workingHours: { ...schedule1, 6: SCHED_CLOSED } },
  ];

  const clients: Client[] = [
    { id: "pc1", name: "Roberto Silva (Thor)", email: "roberto.s@email.com", phone: "(31) 97333-0001", status: "vip", notes: "Golden Retriever, 4 anos. Alergia a shampoo comum." },
    { id: "pc2", name: "Lucia Mendes (Mel)", email: "lucia.m@email.com", phone: "(31) 97333-0002", status: "active", notes: "Poodle, 2 anos" },
    { id: "pc3", name: "Fernando Costa (Rex)", email: "fernando.c@email.com", phone: "(31) 97333-0003", status: "active", notes: "Pastor Alemao, 5 anos" },
    { id: "pc4", name: "Camila Duarte (Luna)", email: "camila.d@email.com", phone: "(31) 97333-0004", status: "active", notes: "Shih-Tzu, 3 anos" },
    { id: "pc5", name: "Paulo Nunes (Bob)", email: "paulo.n@email.com", phone: "(31) 97333-0005", status: "active", notes: "Bulldog Frances, 1 ano" },
    { id: "pc6", name: "Ana Ferreira (Mia)", email: "ana.f@email.com", phone: "(31) 97333-0006", status: "vip", notes: "Lhasa Apso, 6 anos. Tosa na tesoura mensal." },
  ];

  const appointments: DemoAppointmentSerialized[] = [
    { id: "pa1", clientId: "pc1", clientName: "Roberto Silva (Thor)", serviceId: "ps2", serviceName: "Banho Grande Porte", professionalId: "pp2", professional: "Joao Groomer", startTime: addHours(today, 8).toISOString(), durationMinutes: 60, status: "confirmed", price: 85 },
    { id: "pa2", clientId: "pc2", clientName: "Lucia Mendes (Mel)", serviceId: "ps3", serviceName: "Banho + Tosa Higienica", professionalId: "pp3", professional: "Carla Banhista", startTime: addHours(today, 9).toISOString(), durationMinutes: 75, status: "confirmed", price: 95 },
    { id: "pa3", clientId: "pc3", clientName: "Fernando Costa (Rex)", serviceId: "ps6", serviceName: "Consulta Veterinaria", professionalId: "pp1", professional: "Dra. Marina Lopes", startTime: addHours(today, 10).toISOString(), durationMinutes: 30, status: "pending", price: 150 },
    { id: "pa4", clientId: "pc6", clientName: "Ana Ferreira (Mia)", serviceId: "ps4", serviceName: "Tosa na Tesoura", professionalId: "pp2", professional: "Joao Groomer", startTime: addHours(today, 14).toISOString(), durationMinutes: 90, status: "confirmed", price: 130 },
    { id: "pa5", clientId: "pc4", clientName: "Camila Duarte (Luna)", serviceId: "ps1", serviceName: "Banho Pequeno Porte", professionalId: "pp3", professional: "Carla Banhista", startTime: addHours(addDays(today, 1), 10).toISOString(), durationMinutes: 45, status: "confirmed", price: 55 },
    { id: "pa6", clientId: "pc5", clientName: "Paulo Nunes (Bob)", serviceId: "ps7", serviceName: "Vacinacao", professionalId: "pp1", professional: "Dra. Marina Lopes", startTime: addHours(addDays(today, 1), 14).toISOString(), durationMinutes: 15, status: "confirmed", price: 80 },
    { id: "pa7", clientId: "pc1", clientName: "Roberto Silva (Thor)", serviceId: "ps2", serviceName: "Banho Grande Porte", professionalId: "pp2", professional: "Joao Groomer", startTime: addHours(subDays(today, 6), 9).toISOString(), durationMinutes: 60, status: "confirmed", price: 85 },
    { id: "pa8", clientId: "pc6", clientName: "Ana Ferreira (Mia)", serviceId: "ps4", serviceName: "Tosa na Tesoura", professionalId: "pp2", professional: "Joao Groomer", startTime: addHours(subDays(today, 4), 14).toISOString(), durationMinutes: 90, status: "confirmed", price: 130 },
  ];

  const notifications: DemoNotificationSerialized[] = [
    { id: "pn1", type: "new_pending", title: "Novo agendamento pendente", message: "Fernando Costa (Rex) agendou Consulta Veterinaria para hoje as 10:00.", appointmentId: "pa3", createdAt: new Date().toISOString(), read: false },
  ];

  return {
    id: "pet",
    label: "AuMigo Pet Care",
    niche: "Pet Shop & Vet",
    icon: "paw",
    email: "demo@aumigo.com",
    color: "#F59E0B",
    services, professionals, clients, appointments, notifications,
    settings: {
      ...BASE_SETTINGS,
      name: "AuMigo Pet Care",
      address: "Rua dos Animais, 300 - Savassi, BH",
      phone: "(31) 99666-3000",
      welcomeMessage: "Cuide do seu melhor amigo com carinho! Agende banho, tosa ou consulta.",
      ownerName: "Dra. Marina Lopes",
      ownerEmail: "marina@aumigo.com",
      publicPageDescription: "Pet shop e clinica veterinaria com banho, tosa, consultas e vacinacao. Seu pet merece o melhor!",
      publicPageColor: "#F59E0B",
      socialInstagram: "@aumigopet",
      socialFacebook: "aumigopetcare",
      autoConfirm: false,
      bufferMinutes: 15,
      minAdvanceHours: 1,
      maxConcurrentBookings: 3,
      themeMode: "light",
      currency: "R$",
      businessHours: {
        0: SCHED_CLOSED,
        1: SCHED_FULL("08:00", "18:00"),
        2: SCHED_FULL("08:00", "18:00"),
        3: SCHED_FULL("08:00", "18:00"),
        4: SCHED_FULL("08:00", "18:00"),
        5: SCHED_FULL("08:00", "18:00"),
        6: SCHED_FULL("08:00", "13:00", false),
      },
    },
    whatsappConversations: getPetWhatsApp(),
  };
}

// ============================
// 4. PERSONAL TRAINER / FITNESS
// ============================
function generateFitness(): DemoProfile {
  const today = startOfToday();
  const services: Service[] = [
    { id: "fs1", name: "Treino Personal", duration: 60, price: 120, description: "Sessao individual com acompanhamento completo" },
    { id: "fs2", name: "Avaliacao Fisica", duration: 45, price: 90, description: "Avaliacao antropometrica e composicao corporal" },
    { id: "fs3", name: "Treino Funcional", duration: 45, price: 100, description: "Sessao de treino funcional ao ar livre ou studio" },
    { id: "fs4", name: "Aula de Yoga", duration: 60, price: 80, description: "Aula de yoga individual com tecnicas de respiracao" },
    { id: "fs5", name: "Consultoria de Treino Online", duration: 30, price: 70, description: "Montagem de periodizacao e planilha online" },
    { id: "fs6", name: "Treino em Dupla", duration: 60, price: 80, description: "Treino para 2 pessoas com desconto por pessoa" },
    { id: "fs7", name: "Pilates Individual", duration: 50, price: 110, description: "Sessao de pilates com aparelhos" },
  ];

  const schedule1: WeeklySchedule = {
    0: SCHED_CLOSED,
    1: SCHED_FULL("06:00", "21:00", false),
    2: SCHED_FULL("06:00", "21:00", false),
    3: SCHED_FULL("06:00", "21:00", false),
    4: SCHED_FULL("06:00", "21:00", false),
    5: SCHED_FULL("06:00", "21:00", false),
    6: SCHED_FULL("07:00", "12:00", false),
  };

  const professionals: Professional[] = [
    { id: "fp1", name: "Diego Martins", roles: ["Personal Trainer", "Funcional"], serviceIds: ["fs1", "fs2", "fs3", "fs5", "fs6"], initials: "DM", photoUrl: "https://i.pravatar.cc/300?u=diego-personal", email: "diego@fitpro.com", phone: "(41) 99555-4001", workingHours: schedule1 },
    { id: "fp2", name: "Renata Yoga", roles: ["Instrutora de Yoga", "Pilates"], serviceIds: ["fs4", "fs7"], initials: "RY", photoUrl: "https://i.pravatar.cc/300?u=renata-yoga", email: "renata@fitpro.com", phone: "(41) 99555-4002", workingHours: { ...schedule1, 1: SCHED_FULL("07:00", "19:00", false), 2: SCHED_FULL("07:00", "19:00", false), 3: SCHED_FULL("07:00", "19:00", false), 4: SCHED_FULL("07:00", "19:00", false), 5: SCHED_FULL("07:00", "19:00", false) } },
  ];

  const clients: Client[] = [
    { id: "fc1", name: "Marcos Pereira", email: "marcos.p@email.com", phone: "(41) 96444-0001", status: "vip", notes: "Objetivo: hipertrofia. Treina 5x por semana." },
    { id: "fc2", name: "Carolina Souza", email: "carol.s@email.com", phone: "(41) 96444-0002", status: "active", notes: "Objetivo: emagrecimento" },
    { id: "fc3", name: "Thiago Almeida", email: "thiago.a@email.com", phone: "(41) 96444-0003", status: "active" },
    { id: "fc4", name: "Beatriz Nunes", email: "bia.n@email.com", phone: "(41) 96444-0004", status: "active", notes: "Faz yoga as quartas" },
    { id: "fc5", name: "Gabriel Santos", email: "gabriel.s@email.com", phone: "(41) 96444-0005", status: "vip", notes: "Atleta amador de corrida" },
    { id: "fc6", name: "Priscila Costa", email: "priscila.c@email.com", phone: "(41) 96444-0006", status: "active" },
    { id: "fc7", name: "Eduardo Mendes", email: "edu.m@email.com", phone: "(41) 96444-0007", status: "inactive" },
    { id: "fc8", name: "Roberta Lima", email: "roberta.l@email.com", phone: "(41) 96444-0008", status: "active" },
    { id: "fc9", name: "Alexandre Dias", email: "alex.d@email.com", phone: "(41) 96444-0009", status: "active" },
  ];

  const appointments: DemoAppointmentSerialized[] = [
    { id: "fa1", clientId: "fc1", clientName: "Marcos Pereira", serviceId: "fs1", serviceName: "Treino Personal", professionalId: "fp1", professional: "Diego Martins", startTime: addHours(today, 6).toISOString(), durationMinutes: 60, status: "confirmed", price: 120 },
    { id: "fa2", clientId: "fc2", clientName: "Carolina Souza", serviceId: "fs3", serviceName: "Treino Funcional", professionalId: "fp1", professional: "Diego Martins", startTime: addHours(today, 7).toISOString(), durationMinutes: 45, status: "confirmed", price: 100 },
    { id: "fa3", clientId: "fc4", clientName: "Beatriz Nunes", serviceId: "fs4", serviceName: "Aula de Yoga", professionalId: "fp2", professional: "Renata Yoga", startTime: addHours(today, 8).toISOString(), durationMinutes: 60, status: "confirmed", price: 80 },
    { id: "fa4", clientId: "fc5", clientName: "Gabriel Santos", serviceId: "fs1", serviceName: "Treino Personal", professionalId: "fp1", professional: "Diego Martins", startTime: addHours(today, 17).toISOString(), durationMinutes: 60, status: "pending", price: 120 },
    { id: "fa5", clientId: "fc6", clientName: "Priscila Costa", serviceId: "fs7", serviceName: "Pilates Individual", professionalId: "fp2", professional: "Renata Yoga", startTime: addHours(today, 16).toISOString(), durationMinutes: 50, status: "confirmed", price: 110 },
    { id: "fa6", clientId: "fc3", clientName: "Thiago Almeida", serviceId: "fs2", serviceName: "Avaliacao Fisica", professionalId: "fp1", professional: "Diego Martins", startTime: addHours(addDays(today, 1), 8).toISOString(), durationMinutes: 45, status: "confirmed", price: 90 },
    { id: "fa7", clientId: "fc8", clientName: "Roberta Lima", serviceId: "fs4", serviceName: "Aula de Yoga", professionalId: "fp2", professional: "Renata Yoga", startTime: addHours(addDays(today, 1), 10).toISOString(), durationMinutes: 60, status: "confirmed", price: 80 },
    { id: "fa8", clientId: "fc9", clientName: "Alexandre Dias", serviceId: "fs6", serviceName: "Treino em Dupla", professionalId: "fp1", professional: "Diego Martins", startTime: addHours(addDays(today, 2), 7).toISOString(), durationMinutes: 60, status: "confirmed", price: 80 },
    { id: "fa9", clientId: "fc1", clientName: "Marcos Pereira", serviceId: "fs1", serviceName: "Treino Personal", professionalId: "fp1", professional: "Diego Martins", startTime: addHours(subDays(today, 1), 6).toISOString(), durationMinutes: 60, status: "confirmed", price: 120 },
    { id: "fa10", clientId: "fc5", clientName: "Gabriel Santos", serviceId: "fs1", serviceName: "Treino Personal", professionalId: "fp1", professional: "Diego Martins", startTime: addHours(subDays(today, 2), 17).toISOString(), durationMinutes: 60, status: "confirmed", price: 120 },
    { id: "fa11", clientId: "fc2", clientName: "Carolina Souza", serviceId: "fs3", serviceName: "Treino Funcional", professionalId: "fp1", professional: "Diego Martins", startTime: addHours(subDays(today, 3), 7).toISOString(), durationMinutes: 45, status: "confirmed", price: 100 },
  ];

  const notifications: DemoNotificationSerialized[] = [
    { id: "fn1", type: "new_pending", title: "Novo agendamento pendente", message: "Gabriel Santos agendou Treino Personal para hoje as 17:00.", appointmentId: "fa4", createdAt: new Date().toISOString(), read: false },
    { id: "fn2", type: "confirmed", title: "Agendamento confirmado", message: "Marcos Pereira confirmou Treino Personal para hoje as 06:00.", appointmentId: "fa1", createdAt: subDays(new Date(), 1).toISOString(), read: true },
  ];

  return {
    id: "fitness",
    label: "FitPro Studio",
    niche: "Personal & Fitness",
    icon: "dumbbell",
    email: "demo@fitpro.com",
    color: "#F97316",
    services, professionals, clients, appointments, notifications,
    settings: {
      ...BASE_SETTINGS,
      name: "FitPro Studio",
      address: "Av. Fitness, 800 - Batel, Curitiba",
      phone: "(41) 99555-4000",
      welcomeMessage: "Transforme seu corpo e sua mente! Agende sua sessao.",
      ownerName: "Diego Martins",
      ownerEmail: "diego@fitpro.com",
      publicPageDescription: "Personal trainer e studio de pilates/yoga. Treinos personalizados para todos os niveis. Resultados reais!",
      publicPageColor: "#F97316",
      socialInstagram: "@fitpro_studio",
      socialTiktok: "@fitprostudio",
      autoConfirm: false,
      bufferMinutes: 0,
      minAdvanceHours: 3,
      themeMode: "light",
      currency: "R$",
      businessHours: {
        0: SCHED_CLOSED,
        1: SCHED_FULL("06:00", "21:00", false),
        2: SCHED_FULL("06:00", "21:00", false),
        3: SCHED_FULL("06:00", "21:00", false),
        4: SCHED_FULL("06:00", "21:00", false),
        5: SCHED_FULL("06:00", "21:00", false),
        6: SCHED_FULL("07:00", "12:00", false),
      },
    },
    whatsappConversations: getFitnessWhatsApp(),
  };
}

// ============================
// 5. CLINICA DE ESTETICA
// ============================
function generateEstetica(): DemoProfile {
  const today = startOfToday();
  const services: Service[] = [
    { id: "es1", name: "Limpeza de Pele", duration: 60, price: 150, description: "Limpeza profunda com extracao e mascara calmante" },
    { id: "es2", name: "Peeling Quimico", duration: 45, price: 200, description: "Peeling acido para renovacao celular e uniformizacao" },
    { id: "es3", name: "Microagulhamento", duration: 60, price: 280, description: "Estimulo de colageno para rejuvenescimento" },
    { id: "es4", name: "Drenagem Linfatica", duration: 60, price: 130, description: "Massagem drenante para reducao de inchacos" },
    { id: "es5", name: "Depilacao a Laser (Axila)", duration: 20, price: 120, description: "Sessao de depilacao a laser na regiao axilar" },
    { id: "es6", name: "Depilacao a Laser (Virilha)", duration: 30, price: 180, description: "Sessao completa de depilacao a laser" },
    { id: "es7", name: "Massagem Relaxante", duration: 60, price: 140, description: "Massagem corporal completa com oleos essenciais" },
    { id: "es8", name: "Botox (por area)", duration: 30, price: 600, description: "Aplicacao de toxina botulinica por regiao" },
    { id: "es9", name: "Preenchimento Labial", duration: 45, price: 900, description: "Preenchimento com acido hialuronico" },
    { id: "es10", name: "Protocolo Anti-idade", duration: 90, price: 350, description: "Combinacao de tratamentos rejuvenescedores" },
  ];

  const schedule1: WeeklySchedule = {
    0: SCHED_CLOSED,
    1: SCHED_FULL("08:00", "19:00"),
    2: SCHED_FULL("08:00", "19:00"),
    3: SCHED_FULL("08:00", "19:00"),
    4: SCHED_FULL("08:00", "19:00"),
    5: SCHED_FULL("08:00", "19:00"),
    6: SCHED_FULL("08:00", "14:00", false),
  };

  const professionals: Professional[] = [
    { id: "ep1", name: "Dra. Isabela Renova", roles: ["Dermatologista", "Esteticista"], serviceIds: ["es1", "es2", "es3", "es8", "es9", "es10"], initials: "IR", photoUrl: "https://i.pravatar.cc/300?u=isabela-estetica", email: "isabela@clinicarenova.com", phone: "(51) 99444-5001", workingHours: schedule1 },
    { id: "ep2", name: "Vanessa Campos", roles: ["Esteticista", "Massoterapeuta"], serviceIds: ["es1", "es4", "es7"], initials: "VC", photoUrl: "https://i.pravatar.cc/300?u=vanessa-estetica", email: "vanessa@clinicarenova.com", phone: "(51) 99444-5002", workingHours: schedule1 },
    { id: "ep3", name: "Dr. Lucas Ferreira", roles: ["Biomedico", "Laserterapia"], serviceIds: ["es3", "es5", "es6", "es10"], initials: "LF", photoUrl: "https://i.pravatar.cc/300?u=lucas-estetica", email: "lucas@clinicarenova.com", phone: "(51) 99444-5003", workingHours: { ...schedule1, 6: SCHED_CLOSED } },
    { id: "ep4", name: "Amanda Torres", roles: ["Esteticista"], serviceIds: ["es1", "es2", "es4", "es5", "es6"], initials: "AT", photoUrl: "https://i.pravatar.cc/300?u=amanda-estetica", email: "amanda@clinicarenova.com", phone: "(51) 99444-5004", workingHours: schedule1 },
  ];

  const clients: Client[] = [
    { id: "ec1", name: "Renata Oliveira", email: "renata.o@email.com", phone: "(51) 96555-0001", status: "vip", notes: "Pacote trimestral de microagulhamento + peeling. Pele sensivel." },
    { id: "ec2", name: "Cristina Mendes", email: "cristina.m@email.com", phone: "(51) 96555-0002", status: "active" },
    { id: "ec3", name: "Fabiana Lima", email: "fabiana.l@email.com", phone: "(51) 96555-0003", status: "vip", notes: "Faz botox a cada 4 meses" },
    { id: "ec4", name: "Helena Santos", email: "helena.s@email.com", phone: "(51) 96555-0004", status: "active" },
    { id: "ec5", name: "Gabriela Costa", email: "gabi.c@email.com", phone: "(51) 96555-0005", status: "active" },
    { id: "ec6", name: "Tatiana Alves", email: "tati.a@email.com", phone: "(51) 96555-0006", status: "active" },
    { id: "ec7", name: "Marcelo Duarte", email: "marcelo.d@email.com", phone: "(51) 96555-0007", status: "active", notes: "Faz limpeza de pele mensal" },
    { id: "ec8", name: "Patricia Nunes", email: "patricia.n@email.com", phone: "(51) 96555-0008", status: "inactive" },
    { id: "ec9", name: "Simone Ribeiro", email: "simone.r@email.com", phone: "(51) 96555-0009", status: "vip", notes: "Preenchimento labial + protocolo anti-idade" },
  ];

  const appointments: DemoAppointmentSerialized[] = [
    { id: "ea1", clientId: "ec1", clientName: "Renata Oliveira", serviceId: "es3", serviceName: "Microagulhamento", professionalId: "ep1", professional: "Dra. Isabela Renova", startTime: addHours(today, 8).toISOString(), durationMinutes: 60, status: "confirmed", price: 280 },
    { id: "ea2", clientId: "ec2", clientName: "Cristina Mendes", serviceId: "es4", serviceName: "Drenagem Linfatica", professionalId: "ep2", professional: "Vanessa Campos", startTime: addHours(today, 9).toISOString(), durationMinutes: 60, status: "confirmed", price: 130 },
    { id: "ea3", clientId: "ec3", clientName: "Fabiana Lima", serviceId: "es8", serviceName: "Botox (por area)", professionalId: "ep1", professional: "Dra. Isabela Renova", startTime: addHours(today, 10).toISOString(), durationMinutes: 30, status: "confirmed", price: 600 },
    { id: "ea4", clientId: "ec5", clientName: "Gabriela Costa", serviceId: "es5", serviceName: "Depilacao a Laser (Axila)", professionalId: "ep3", professional: "Dr. Lucas Ferreira", startTime: addHours(today, 11).toISOString(), durationMinutes: 20, status: "pending", price: 120 },
    { id: "ea5", clientId: "ec7", clientName: "Marcelo Duarte", serviceId: "es1", serviceName: "Limpeza de Pele", professionalId: "ep4", professional: "Amanda Torres", startTime: addHours(today, 14).toISOString(), durationMinutes: 60, status: "confirmed", price: 150 },
    { id: "ea6", clientId: "ec9", clientName: "Simone Ribeiro", serviceId: "es9", serviceName: "Preenchimento Labial", professionalId: "ep1", professional: "Dra. Isabela Renova", startTime: addHours(today, 15).toISOString(), durationMinutes: 45, status: "pending", price: 900 },
    { id: "ea7", clientId: "ec4", clientName: "Helena Santos", serviceId: "es7", serviceName: "Massagem Relaxante", professionalId: "ep2", professional: "Vanessa Campos", startTime: addHours(addDays(today, 1), 10).toISOString(), durationMinutes: 60, status: "confirmed", price: 140 },
    { id: "ea8", clientId: "ec6", clientName: "Tatiana Alves", serviceId: "es10", serviceName: "Protocolo Anti-idade", professionalId: "ep3", professional: "Dr. Lucas Ferreira", startTime: addHours(addDays(today, 1), 14).toISOString(), durationMinutes: 90, status: "confirmed", price: 350 },
    { id: "ea9", clientId: "ec1", clientName: "Renata Oliveira", serviceId: "es2", serviceName: "Peeling Quimico", professionalId: "ep1", professional: "Dra. Isabela Renova", startTime: addHours(subDays(today, 5), 9).toISOString(), durationMinutes: 45, status: "confirmed", price: 200 },
    { id: "ea10", clientId: "ec3", clientName: "Fabiana Lima", serviceId: "es8", serviceName: "Botox (por area)", professionalId: "ep1", professional: "Dra. Isabela Renova", startTime: addHours(subDays(today, 30), 10).toISOString(), durationMinutes: 30, status: "confirmed", price: 600 },
    { id: "ea11", clientId: "ec9", clientName: "Simone Ribeiro", serviceId: "es9", serviceName: "Preenchimento Labial", professionalId: "ep1", professional: "Dra. Isabela Renova", startTime: addHours(subDays(today, 14), 15).toISOString(), durationMinutes: 45, status: "confirmed", price: 900 },
    { id: "ea12", clientId: "ec7", clientName: "Marcelo Duarte", serviceId: "es1", serviceName: "Limpeza de Pele", professionalId: "ep4", professional: "Amanda Torres", startTime: addHours(subDays(today, 8), 14).toISOString(), durationMinutes: 60, status: "confirmed", price: 150 },
  ];

  const notifications: DemoNotificationSerialized[] = [
    { id: "en1", type: "new_pending", title: "Novo agendamento pendente", message: "Gabriela Costa agendou Depilacao a Laser para hoje as 11:00.", appointmentId: "ea4", createdAt: new Date().toISOString(), read: false },
    { id: "en2", type: "new_pending", title: "Novo agendamento pendente", message: "Simone Ribeiro agendou Preenchimento Labial para hoje as 15:00.", appointmentId: "ea6", createdAt: new Date().toISOString(), read: false },
    { id: "en3", type: "confirmed", title: "Agendamento confirmado", message: "Renata Oliveira confirmou Microagulhamento para hoje as 08:00.", appointmentId: "ea1", createdAt: subDays(new Date(), 1).toISOString(), read: true },
  ];

  return {
    id: "estetica",
    label: "Clinica Renova",
    niche: "Estetica Avancada",
    icon: "sparkles",
    email: "demo@clinicarenova.com",
    color: "#8B5CF6",
    services, professionals, clients, appointments, notifications,
    settings: {
      ...BASE_SETTINGS,
      name: "Clinica Renova Estetica",
      address: "Rua da Beleza, 220 - Moinhos de Vento, POA",
      phone: "(51) 99444-5000",
      welcomeMessage: "Realce sua beleza natural com tratamentos de ponta. Agende sua avaliacao!",
      ownerName: "Dra. Isabela Renova",
      ownerEmail: "isabela@clinicarenova.com",
      publicPageDescription: "Clinica de estetica avancada com dermatologista, laser, botox, preenchimento e protocolos anti-idade. Tecnologia e sofisticacao.",
      publicPageColor: "#8B5CF6",
      socialInstagram: "@clinicarenova",
      socialFacebook: "clinicarenova",
      socialGoogleMaps: "clinicarenova-poa",
      autoConfirm: false,
      requireEmail: true,
      bufferMinutes: 15,
      minAdvanceHours: 4,
      maxConcurrentBookings: 4,
      themeMode: "light",
      currency: "R$",
      maxAdvanceDays: 30,
      businessHours: {
        0: SCHED_CLOSED,
        1: SCHED_FULL("08:00", "19:00"),
        2: SCHED_FULL("08:00", "19:00"),
        3: SCHED_FULL("08:00", "19:00"),
        4: SCHED_FULL("08:00", "19:00"),
        5: SCHED_FULL("08:00", "19:00"),
        6: SCHED_FULL("08:00", "14:00", false),
      },
    },
    whatsappConversations: getEsteticaWhatsApp(),
  };
}

// ============================
// EXPORT ALL PROFILES
// ============================
export const DEMO_PROFILES: DemoProfile[] = [
  generateBarbearia(),
  generateNailDesigner(),
  generatePetShop(),
  generateFitness(),
  generateEstetica(),
];

export function getDemoProfile(id: string): DemoProfile | undefined {
  return DEMO_PROFILES.find(p => p.id === id);
}