import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { startOfToday, addHours, addDays, subDays, isSameDay, isBefore, isAfter, setHours, setMinutes, format } from "date-fns";
import { api, hasToken } from "@/lib/api";
import { getDemoProfile } from "@/context/DemoProfiles";
import { toast } from "sonner";

// ============================
// TYPES
// ============================

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
  description?: string;
}

export interface DaySchedule {
  enabled: boolean;
  start: string; // "08:00"
  end: string;   // "18:00"
  lunchEnabled: boolean;
  lunchStart: string; // "12:00"
  lunchEnd: string;   // "13:00"
}

export type WeeklySchedule = {
  [dayOfWeek: number]: DaySchedule; // 0=Sunday ... 6=Saturday
};

const DEFAULT_SCHEDULE: WeeklySchedule = {
  0: { enabled: false, start: "09:00", end: "18:00", lunchEnabled: false, lunchStart: "12:00", lunchEnd: "13:00" },
  1: { enabled: true, start: "08:00", end: "20:00", lunchEnabled: true, lunchStart: "12:00", lunchEnd: "13:00" },
  2: { enabled: true, start: "08:00", end: "20:00", lunchEnabled: true, lunchStart: "12:00", lunchEnd: "13:00" },
  3: { enabled: true, start: "08:00", end: "20:00", lunchEnabled: true, lunchStart: "12:00", lunchEnd: "13:00" },
  4: { enabled: true, start: "08:00", end: "20:00", lunchEnabled: true, lunchStart: "12:00", lunchEnd: "13:00" },
  5: { enabled: true, start: "08:00", end: "20:00", lunchEnabled: true, lunchStart: "12:00", lunchEnd: "13:00" },
  6: { enabled: true, start: "09:00", end: "17:00", lunchEnabled: false, lunchStart: "12:00", lunchEnd: "13:00" },
};

export interface Professional {
  id: string;
  name: string;
  roles: string[];
  serviceIds: string[];
  initials: string;
  photoUrl: string;
  email: string;
  phone: string;
  workingHours: WeeklySchedule;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "vip";
  notes?: string;
  avatar?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professional: string;
  startTime: Date;
  durationMinutes: number;
  status: "confirmed" | "pending" | "cancelled" | "completed" | "noshow";
  price: number;
}

export interface AppNotification {
  id: string;
  type: "new_pending" | "confirmed" | "cancelled" | "reminder";
  title: string;
  message: string;
  appointmentId?: string;
  createdAt: Date;
  read: boolean;
}

export type ThemeMode = "light" | "dark" | "system";

export interface BusinessSettings {
  name: string;
  address: string;
  phone: string;
  welcomeMessage: string;
  showPrices: boolean;
  allowProfessionalSelection: boolean;
  autoConfirm: boolean;
  maxAdvanceDays: number;
  cancellationPolicy: string;
  requireEmail: boolean;
  themeMode: ThemeMode;
  whatsappEnabled: boolean;
  whatsappAutoConfirmation: boolean;
  whatsappAutoReminder: boolean;
  whatsappReminderHours: number;
  whatsappAutoFollowup: boolean;
  businessHours: WeeklySchedule;
  bufferMinutes: number;
  minAdvanceHours: number;
  maxConcurrentBookings: number;
  blockedDates: string[];
  whatsappConfirmationTemplate: string;
  whatsappReminderTemplate: string;
  whatsappFollowupTemplate: string;
  notifyOnNewBooking: boolean;
  notifyOnCancellation: boolean;
  notifyOnReminder: boolean;
  logoUrl: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTiktok: string;
  socialGoogleMaps: string;
  ownerName: string;
  ownerEmail: string;
  publicPageDescription: string;
  publicPageColor: string;
  currency: string;
  language: string;
}

const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  name: "Meu Estabelecimento",
  address: "",
  phone: "",
  welcomeMessage: "Agende seu horario de forma rapida e pratica!",
  showPrices: true,
  allowProfessionalSelection: true,
  autoConfirm: false,
  maxAdvanceDays: 14,
  cancellationPolicy: "",
  requireEmail: false,
  themeMode: "light",
  whatsappEnabled: false,
  whatsappAutoConfirmation: true,
  whatsappAutoReminder: true,
  whatsappReminderHours: 2,
  whatsappAutoFollowup: false,
  businessHours: { ...DEFAULT_SCHEDULE },
  bufferMinutes: 0,
  minAdvanceHours: 0,
  maxConcurrentBookings: 0,
  blockedDates: [],
  whatsappConfirmationTemplate: "Ola {{cliente}}! Seu agendamento de {{servico}} foi confirmado para {{data}} as {{hora}} com {{profissional}}. Ate la!",
  whatsappReminderTemplate: "Oi {{cliente}}! Lembrete: voce tem {{servico}} amanha as {{hora}} com {{profissional}}. Confirma sua presenca?",
  whatsappFollowupTemplate: "Oi {{cliente}}! Obrigado por nos visitar! Como foi seu {{servico}}? Esperamos te ver em breve!",
  notifyOnNewBooking: true,
  notifyOnCancellation: true,
  notifyOnReminder: true,
  logoUrl: "",
  socialInstagram: "",
  socialFacebook: "",
  socialTiktok: "",
  socialGoogleMaps: "",
  ownerName: "",
  ownerEmail: "",
  publicPageDescription: "",
  publicPageColor: "#50CAE6",
  currency: "R$",
  language: "pt-BR",
};

// ============================
// DATA ADAPTERS (Backend → Frontend)
// ============================

const DAY_NAME_TO_NUM: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
};

const DAY_NUM_TO_NAME = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function adaptWorkingHours(raw: any): WeeklySchedule {
  if (!raw) return { ...DEFAULT_SCHEDULE };

  const result: WeeklySchedule = { ...DEFAULT_SCHEDULE };

  for (const [key, sched] of Object.entries(raw as Record<string, any>)) {
    // Numeric key format (0-6) — what the frontend sends
    const numKey = Number(key);
    if (!isNaN(numKey) && numKey >= 0 && numKey <= 6) {
      result[numKey] = {
        enabled: sched.enabled ?? false,
        start: sched.start ?? "09:00",
        end: sched.end ?? "18:00",
        lunchEnabled: sched.lunchEnabled ?? sched.lunch_enabled ?? false,
        lunchStart: sched.lunchStart ?? sched.lunch_start ?? "12:00",
        lunchEnd: sched.lunchEnd ?? sched.lunch_end ?? "13:00",
      };
      continue;
    }
    // English day name format (Monday…) — what DemoSeeder uses
    const dayNum = DAY_NAME_TO_NUM[key];
    if (dayNum !== undefined) {
      result[dayNum] = {
        enabled: sched.isWorking ?? sched.enabled ?? false,
        start: sched.start ?? "09:00",
        end: sched.end ?? "18:00",
        lunchEnabled: !!(sched.lunchStart && sched.lunchEnd),
        lunchStart: sched.lunchStart ?? "12:00",
        lunchEnd: sched.lunchEnd ?? "13:00",
      };
    }
  }

  return result;
}

function workingHoursToBackend(wh: WeeklySchedule): Record<string, any> {
  const result: Record<string, any> = {};
  for (let i = 0; i < 7; i++) {
    const day = wh[i];
    if (!day) continue;
    result[DAY_NUM_TO_NAME[i]] = {
      isWorking: day.enabled,
      start: day.start,
      end: day.end,
      ...(day.lunchEnabled ? { lunchStart: day.lunchStart, lunchEnd: day.lunchEnd } : {}),
    };
  }
  return result;
}

function adaptService(s: any): Service {
  return {
    id: s.id,
    name: s.name,
    price: parseFloat(s.price) || 0,
    duration: s.duration_minutes,
    description: s.description ?? undefined,
  };
}

function adaptProfessional(p: any): Professional {
  const initials = p.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  return {
    id: p.id,
    name: p.name,
    roles: Array.isArray(p.roles) ? p.roles : [],
    serviceIds: Array.isArray(p.services) ? p.services.map((s: any) => s.id) : [],
    initials,
    photoUrl: p.photo_url ?? "",
    email: p.email ?? "",
    phone: p.phone ?? "",
    workingHours: adaptWorkingHours(p.working_hours),
  };
}

function adaptClient(c: any): Client {
  return {
    id: c.id,
    name: c.name,
    email: c.email ?? "",
    phone: c.phone ?? "",
    status: (c.status ?? "active") as Client["status"],
    notes: c.notes ?? undefined,
    avatar: c.photo_url ?? undefined,
  };
}

const APPOINTMENT_STATUS_FROM_API: Record<string, string> = { no_show: "noshow" };
const APPOINTMENT_STATUS_TO_API: Record<string, string> = { noshow: "no_show" };

function adaptAppointment(a: any): Appointment {
  return {
    id: a.id,
    clientId: a.client_id,
    clientName: a.client?.name ?? "",
    serviceId: a.service_id,
    serviceName: a.service?.name ?? "",
    professionalId: a.professional_id,
    professional: a.professional?.name ?? "",
    startTime: new Date(a.starts_at),
    durationMinutes: a.duration_minutes,
    status: (APPOINTMENT_STATUS_FROM_API[a.status] ?? a.status) as Appointment["status"],
    price: parseFloat(a.price) || 0,
  };
}

const NOTIF_TYPE_MAP: Record<string, AppNotification["type"]> = {
  new_appointment: "new_pending",
  appointment_confirmed: "confirmed",
  appointment_cancelled: "cancelled",
  reminder: "reminder",
};

function adaptNotification(n: any): AppNotification {
  return {
    id: n.id,
    type: NOTIF_TYPE_MAP[n.type] ?? "new_pending",
    title: n.title,
    message: n.message,
    appointmentId: n.appointment_id ?? undefined,
    createdAt: new Date(n.created_at),
    read: Boolean(n.read),
  };
}

// ============================
// CONTEXT TYPE
// ============================

interface AppDataContextType {
  services: Service[];
  professionals: Professional[];
  clients: Client[];
  appointments: Appointment[];
  notifications: AppNotification[];
  businessSettings: BusinessSettings;
  dataLoaded: boolean;

  // Service CRUD
  addService: (service: Omit<Service, "id">) => Promise<string>;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Professional CRUD
  addProfessional: (professional: Omit<Professional, "id" | "initials">) => void;
  updateProfessional: (id: string, data: Partial<Professional>) => void;
  deleteProfessional: (id: string) => void;
  updateWorkingHours: (professionalId: string, schedule: WeeklySchedule) => void;

  // Client CRUD
  addClient: (client: Omit<Client, "id">) => Promise<string>;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Appointment CRUD
  addAppointment: (appointment: Omit<Appointment, "id">) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  unreadCount: number;

  // Business Settings
  updateBusinessSettings: (data: Partial<BusinessSettings>) => void;

  // Derived
  getAppointmentsByDate: (date: Date) => Appointment[];
  getAppointmentsForClient: (clientId: string) => Appointment[];
  getLastVisit: (clientId: string) => Date | null;
  getNextAppointment: (clientId: string) => Appointment | null;
  getTotalSpent: (clientId: string) => number;
  getAvailableSlots: (date: Date, professionalId: string, durationMinutes: number, excludeAppointmentId?: string) => string[];
  hasConflict: (professionalId: string, startTime: Date, durationMinutes: number, excludeAppointmentId?: string) => boolean;
  getProfessionalSchedule: (professionalId: string) => WeeklySchedule;

  // Demo profiles
  loadDemoProfile: (profileId: string) => void;

  // Data management (used by AuthContext)
  refreshData: () => Promise<void>;
  clearData: () => void;
}

const noop = () => {};
const noopPromiseStr = async (): Promise<string> => "";
const noopPromiseVoid = async (): Promise<void> => {};
const noopArr = (): any[] => [];
const noopNull = (): null => null;
const noopNum = (): number => 0;
const noopBool = (): boolean => false;
const noopSchedule = (): WeeklySchedule => DEFAULT_SCHEDULE;

const FALLBACK_CONTEXT: AppDataContextType = {
  services: [],
  professionals: [],
  clients: [],
  appointments: [],
  notifications: [],
  businessSettings: DEFAULT_BUSINESS_SETTINGS,
  dataLoaded: false,
  addService: noopPromiseStr,
  updateService: noop,
  deleteService: noop,
  addProfessional: noop,
  updateProfessional: noop,
  deleteProfessional: noop,
  updateWorkingHours: noop,
  addClient: noopPromiseStr,
  updateClient: noop,
  deleteClient: noop,
  addAppointment: noopPromiseVoid,
  updateAppointment: noop,
  deleteAppointment: noop,
  markNotificationRead: noop,
  markAllNotificationsRead: noop,
  clearNotifications: noop,
  unreadCount: 0,
  updateBusinessSettings: noop,
  getAppointmentsByDate: noopArr,
  getAppointmentsForClient: noopArr,
  getLastVisit: noopNull as any,
  getNextAppointment: noopNull as any,
  getTotalSpent: noopNum,
  getAvailableSlots: noopArr,
  hasConflict: noopBool,
  getProfessionalSchedule: noopSchedule,
  loadDemoProfile: noop,
  refreshData: noopPromiseVoid,
  clearData: noop,
};

const AppDataContext = createContext<AppDataContextType>(FALLBACK_CONTEXT);

// ============================
// PROVIDER
// ============================

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const isDemoRef = useRef(isDemo);
  isDemoRef.current = isDemo;
  const settingsRef = useRef(businessSettings);
  settingsRef.current = businessSettings;
  const appointmentsRef = useRef(appointments);
  appointmentsRef.current = appointments;

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // ---- Load from real backend ----
  const doLoad = useCallback(async () => {
    try {
      const [svcData, proData, cliData, aptData, notifData] = await Promise.all([
        api.services.list(),
        api.professionals.list(),
        api.clients.list({ per_page: 1000 }),
        api.appointments.list(),
        api.notifications.list(),
      ]);

      setServices(svcData.map(adaptService));
      setProfessionals(proData.map(adaptProfessional));
      setClients(cliData.data.map(adaptClient));
      setAppointments(aptData.map(adaptAppointment));
      setNotifications(notifData.map(adaptNotification));
      setIsDemo(false);
      setDataLoaded(true);
    } catch (err) {
      console.error("Failed to load app data:", err);
      setDataLoaded(true); // Don't block the app
    }
  }, []);

  const refreshData = useCallback(async () => {
    setDataLoaded(false);
    await doLoad();
  }, [doLoad]);

  const clearData = useCallback(() => {
    setServices([]);
    setProfessionals([]);
    setClients([]);
    setAppointments([]);
    setNotifications([]);
    setBusinessSettings(DEFAULT_BUSINESS_SETTINGS);
    setIsDemo(false);
    setDataLoaded(false);
  }, []);

  // Load on mount if token already present (page refresh while logged in)
  useEffect(() => {
    if (hasToken()) {
      doLoad();
    }
  }, [doLoad]);

  // ---- Local notification push ----
  const pushNotification = useCallback((notif: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    setNotifications(prev => [{
      ...notif,
      id: generateId(),
      createdAt: new Date(),
      read: false,
    }, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (!isDemoRef.current) {
      api.notifications.markRead(id).catch(() => {});
    }
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (!isDemoRef.current) {
      api.notifications.markAllRead().catch(() => {});
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // ---- Reminder checker ----
  const remindedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const check = () => {
      if (!settingsRef.current.notifyOnReminder) return;
      const now = new Date();
      const oneHourLater = addHours(now, 1);
      appointments.forEach(apt => {
        if (
          apt.status !== "cancelled" &&
          isAfter(apt.startTime, now) &&
          isBefore(apt.startTime, oneHourLater) &&
          !remindedRef.current.has(apt.id)
        ) {
          remindedRef.current.add(apt.id);
          pushNotification({
            type: "reminder",
            title: "Lembrete de agendamento",
            message: `${apt.clientName} tem ${apt.serviceName} em menos de 1 hora (${format(apt.startTime, "HH:mm")}).`,
            appointmentId: apt.id,
          });
        }
      });
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [appointments, pushNotification]);

  // ---- Service CRUD ----
  const addService = useCallback(async (service: Omit<Service, "id">): Promise<string> => {
    if (isDemoRef.current) {
      const id = generateId();
      setServices(prev => [...prev, { ...service, id }]);
      return id;
    }
    const created = await api.services.create({
      name: service.name,
      description: service.description,
      price: service.price,
      duration_minutes: service.duration,
    });
    const adapted = adaptService(created);
    setServices(prev => [...prev, adapted]);
    return adapted.id;
  }, []);

  const updateService = useCallback((id: string, data: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    if (data.name) {
      setAppointments(prev => prev.map(a => a.serviceId === id ? { ...a, serviceName: data.name! } : a));
    }
    if (!isDemoRef.current) {
      api.services.update(id, {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.duration !== undefined && { duration_minutes: data.duration }),
      }).catch(err => console.error("updateService failed:", err));
    }
  }, []);

  const deleteService = useCallback((id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    setProfessionals(prev => prev.map(p => ({ ...p, serviceIds: p.serviceIds.filter(sid => sid !== id) })));
    if (!isDemoRef.current) {
      api.services.delete(id).catch(err => console.error("deleteService failed:", err));
    }
  }, []);

  // ---- Professional CRUD ----
  const addProfessional = useCallback(async (professional: Omit<Professional, "id" | "initials">) => {
    const initials = professional.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    if (isDemoRef.current) {
      const id = generateId();
      setProfessionals(prev => [...prev, {
        ...professional, id, initials,
        workingHours: professional.workingHours || { ...DEFAULT_SCHEDULE },
      }]);
      return;
    }
    const created = await api.professionals.create({
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      photo_url: professional.photoUrl,
      roles: professional.roles,
      working_hours: workingHoursToBackend(professional.workingHours || DEFAULT_SCHEDULE),
      service_ids: professional.serviceIds,
    });
    setProfessionals(prev => [...prev, adaptProfessional(created)]);
  }, []);

  const updateProfessional = useCallback((id: string, data: Partial<Professional>) => {
    setProfessionals(prev => prev.map(p => {
      if (p.id !== id) return p;
      const u = { ...p, ...data };
      if (data.name) u.initials = data.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
      return u;
    }));
    if (data.name) {
      setAppointments(prev => prev.map(a => a.professionalId === id ? { ...a, professional: data.name! } : a));
    }
    if (!isDemoRef.current) {
      const payload: any = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.email !== undefined) payload.email = data.email;
      if (data.phone !== undefined) payload.phone = data.phone;
      if (data.photoUrl !== undefined) payload.photo_url = data.photoUrl;
      if (data.roles !== undefined) payload.roles = data.roles;
      if (data.workingHours !== undefined) payload.working_hours = workingHoursToBackend(data.workingHours);
      if (data.serviceIds !== undefined) payload.service_ids = data.serviceIds;
      api.professionals.update(id, payload).catch(err => console.error("updateProfessional failed:", err));
    }
  }, []);

  const deleteProfessional = useCallback((id: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
    if (!isDemoRef.current) {
      api.professionals.delete(id).catch(err => console.error("deleteProfessional failed:", err));
    }
  }, []);

  const updateWorkingHours = useCallback((professionalId: string, schedule: WeeklySchedule) => {
    setProfessionals(prev => prev.map(p => p.id === professionalId ? { ...p, workingHours: schedule } : p));
    if (!isDemoRef.current) {
      api.professionals.update(professionalId, { working_hours: workingHoursToBackend(schedule) })
        .catch(err => console.error("updateWorkingHours failed:", err));
    }
  }, []);

  // ---- Client CRUD ----
  const addClient = useCallback(async (client: Omit<Client, "id">): Promise<string> => {
    if (isDemoRef.current) {
      const id = generateId();
      setClients(prev => [...prev, { ...client, id }]);
      return id;
    }
    const created = await api.clients.create({
      name: client.name,
      email: client.email,
      phone: client.phone,
      photo_url: client.avatar,
      status: client.status,
      notes: client.notes,
    });
    const adapted = adaptClient(created);
    setClients(prev => [...prev, adapted]);
    return adapted.id;
  }, []);

  const updateClient = useCallback((id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    if (data.name) {
      setAppointments(prev => prev.map(a => a.clientId === id ? { ...a, clientName: data.name! } : a));
    }
    if (!isDemoRef.current) {
      api.clients.update(id, {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.avatar !== undefined && { photo_url: data.avatar }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      }).catch(err => console.error("updateClient failed:", err));
    }
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    if (!isDemoRef.current) {
      api.clients.delete(id).catch(err => console.error("deleteClient failed:", err));
    }
  }, []);

  // ---- Appointment CRUD ----
  const addAppointment = useCallback(async (appointment: Omit<Appointment, "id">): Promise<void> => {
    if (isDemoRef.current) {
      const id = generateId();
      setAppointments(prev => [...prev, { ...appointment, id }]);
      if (appointment.status === "pending" && settingsRef.current.notifyOnNewBooking) {
        pushNotification({
          type: "new_pending",
          title: "Novo agendamento pendente",
          message: `${appointment.clientName} agendou ${appointment.serviceName} para ${format(appointment.startTime, "dd/MM")} as ${format(appointment.startTime, "HH:mm")}.`,
          appointmentId: id,
        });
      }
      return;
    }
    const created = await api.appointments.create({
      client_id: appointment.clientId,
      service_id: appointment.serviceId,
      professional_id: appointment.professionalId,
      starts_at: appointment.startTime.toISOString(),
      duration_minutes: appointment.durationMinutes,
      price: appointment.price,
    });
    const adapted = adaptAppointment(created);
    setAppointments(prev => [...prev, adapted]);
    if (settingsRef.current.notifyOnNewBooking) {
      pushNotification({
        type: "new_pending",
        title: "Novo agendamento pendente",
        message: `${adapted.clientName} agendou ${adapted.serviceName} para ${format(adapted.startTime, "dd/MM")} as ${format(adapted.startTime, "HH:mm")}.`,
        appointmentId: adapted.id,
      });
    }
  }, [pushNotification]);

  const updateAppointment = useCallback((id: string, data: Partial<Appointment>) => {
    const old = appointmentsRef.current.find(a => a.id === id);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));

    if (old && data.status && data.status !== old.status) {
      if (data.status === "confirmed") {
        pushNotification({
          type: "confirmed",
          title: "Agendamento confirmado",
          message: `${old.clientName} - ${old.serviceName} em ${format(old.startTime, "dd/MM")} as ${format(old.startTime, "HH:mm")} foi confirmado.`,
          appointmentId: id,
        });
      } else if (data.status === "cancelled" && settingsRef.current.notifyOnCancellation) {
        pushNotification({
          type: "cancelled",
          title: "Agendamento cancelado",
          message: `${old.clientName} - ${old.serviceName} em ${format(old.startTime, "dd/MM")} as ${format(old.startTime, "HH:mm")} foi cancelado.`,
          appointmentId: id,
        });
      }
    }

    if (!isDemoRef.current) {
      const payload: any = {};
      if (data.startTime !== undefined) payload.starts_at = data.startTime.toISOString();
      if (data.durationMinutes !== undefined) payload.duration_minutes = data.durationMinutes;
      if (data.price !== undefined) payload.price = data.price;
      if (data.status !== undefined) payload.status = APPOINTMENT_STATUS_TO_API[data.status] ?? data.status;
      if (data.professionalId !== undefined) payload.professional_id = data.professionalId;
      api.appointments.update(id, payload).catch(err => {
        console.error("updateAppointment failed:", err);
        // O backend recusou (ex.: conflito de horario): desfaz a mudanca otimista.
        if (old) setAppointments(prev => prev.map(a => a.id === id ? old : a));
        toast.error(err instanceof Error && err.message ? err.message : "Não foi possível salvar a alteração do agendamento.");
      });
    }
  }, [pushNotification]);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    if (!isDemoRef.current) {
      api.appointments.delete(id).catch(err => console.error("deleteAppointment failed:", err));
    }
  }, []);

  // ---- Business Settings ----
  const updateBusinessSettings = useCallback((data: Partial<BusinessSettings>) => {
    setBusinessSettings(prev => ({ ...prev, ...data }));
    // Settings are stored locally for now (can be synced via org.settings later)
  }, []);

  // ---- Derived ----
  const getAppointmentsByDate = useCallback((date: Date) => {
    return appointments.filter(a => isSameDay(a.startTime, date));
  }, [appointments]);

  const getAppointmentsForClient = useCallback((clientId: string) => {
    return appointments.filter(a => a.clientId === clientId);
  }, [appointments]);

  const getLastVisit = useCallback((clientId: string) => {
    const now = new Date();
    const past = appointments
      .filter(a => a.clientId === clientId && (a.status === "confirmed" || a.status === "completed") && isBefore(a.startTime, now))
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    return past.length > 0 ? past[0].startTime : null;
  }, [appointments]);

  const getNextAppointment = useCallback((clientId: string) => {
    const now = new Date();
    const future = appointments
      .filter(a => a.clientId === clientId && a.status !== "cancelled" && isAfter(a.startTime, now))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    return future.length > 0 ? future[0] : null;
  }, [appointments]);

  const getTotalSpent = useCallback((clientId: string) => {
    return appointments
      .filter(a => a.clientId === clientId && (a.status === "confirmed" || a.status === "completed") && isBefore(a.startTime, new Date()))
      .reduce((sum, a) => sum + a.price, 0);
  }, [appointments]);

  const getProfessionalSchedule = useCallback((professionalId: string): WeeklySchedule => {
    const pro = professionals.find(p => p.id === professionalId);
    return pro?.workingHours || DEFAULT_SCHEDULE;
  }, [professionals]);

  const hasConflict = useCallback((professionalId: string, startTime: Date, durationMinutes: number, excludeAppointmentId?: string) => {
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    return appointments.some(a => {
      if (a.id === excludeAppointmentId) return false;
      if (a.professionalId !== professionalId) return false;
      if (a.status === "cancelled") return false;
      const aEnd = new Date(a.startTime.getTime() + a.durationMinutes * 60000);
      return startTime < aEnd && endTime > a.startTime;
    });
  }, [appointments]);

  const getAvailableSlots = useCallback((date: Date, professionalId: string, durationMinutes: number, excludeAppointmentId?: string) => {
    const slots: string[] = [];
    const dayOfWeek = date.getDay();
    const now = new Date();
    const settings = settingsRef.current;

    const dateStr = format(date, "yyyy-MM-dd");
    if (settings.blockedDates?.includes(dateStr)) return slots;

    const bizDay = settings.businessHours?.[dayOfWeek];
    if (bizDay && !bizDay.enabled) return slots;

    const pro = professionals.find(p => p.id === professionalId);
    const daySchedule = pro?.workingHours?.[dayOfWeek];
    if (!daySchedule || !daySchedule.enabled) return slots;

    const [startH, startM] = daySchedule.start.split(":").map(Number);
    const [endH, endM] = daySchedule.end.split(":").map(Number);
    let effectiveOpen = startH * 60 + startM;
    let effectiveClose = endH * 60 + endM;

    if (bizDay) {
      const [bStartH, bStartM] = bizDay.start.split(":").map(Number);
      const [bEndH, bEndM] = bizDay.end.split(":").map(Number);
      effectiveOpen = Math.max(effectiveOpen, bStartH * 60 + bStartM);
      effectiveClose = Math.min(effectiveClose, bEndH * 60 + bEndM);
    }

    let lunchStartMin = -1;
    let lunchEndMin = -1;
    if (daySchedule.lunchEnabled && daySchedule.lunchStart && daySchedule.lunchEnd) {
      const [lsH, lsM] = daySchedule.lunchStart.split(":").map(Number);
      const [leH, leM] = daySchedule.lunchEnd.split(":").map(Number);
      lunchStartMin = lsH * 60 + lsM;
      lunchEndMin = leH * 60 + leM;
    }

    const buffer = settings.bufferMinutes || 0;
    const totalDuration = durationMinutes + buffer;
    const minAdvanceMs = (settings.minAdvanceHours || 0) * 3600000;

    for (let totalMin = effectiveOpen; totalMin < effectiveClose; totalMin += 30) {
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      const slotTime = setMinutes(setHours(new Date(date), h), m);
      slotTime.setSeconds(0, 0);

      if (minAdvanceMs > 0 && slotTime.getTime() - now.getTime() < minAdvanceMs) continue;
      if (totalMin + totalDuration > effectiveClose) continue;
      if (lunchStartMin >= 0 && lunchEndMin >= 0) {
        if (totalMin < lunchEndMin && (totalMin + durationMinutes) > lunchStartMin) continue;
      }
      if (settings.maxConcurrentBookings > 0) {
        const slotEnd = new Date(slotTime.getTime() + durationMinutes * 60000);
        const concurrentCount = appointments.filter(a => {
          if (a.id === excludeAppointmentId) return false;
          if (a.status === "cancelled") return false;
          const aEnd = new Date(a.startTime.getTime() + a.durationMinutes * 60000);
          return slotTime < aEnd && slotEnd > a.startTime;
        }).length;
        if (concurrentCount >= settings.maxConcurrentBookings) continue;
      }
      if (!hasConflict(professionalId, slotTime, durationMinutes, excludeAppointmentId)) {
        slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
    return slots;
  }, [professionals, hasConflict, appointments]);

  // ---- Demo profiles ----
  const loadDemoProfile = useCallback((profileId: string) => {
    const demo = getDemoProfile(profileId);
    if (!demo) return;

    setServices(demo.services);
    setProfessionals(demo.professionals);
    setClients(demo.clients);
    setAppointments((demo.appointments as any[]).map(a => ({ ...a, startTime: new Date(a.startTime) })));
    setNotifications((demo.notifications as any[]).map(n => ({ ...n, createdAt: new Date(n.createdAt) })));
    setBusinessSettings(demo.settings);
    setIsDemo(true);
    setDataLoaded(true);
  }, []);

  const value = useMemo<AppDataContextType>(() => ({
    services, professionals, clients, appointments, notifications, businessSettings, dataLoaded,
    addService, updateService, deleteService,
    addProfessional, updateProfessional, deleteProfessional, updateWorkingHours,
    addClient, updateClient, deleteClient,
    addAppointment, updateAppointment, deleteAppointment,
    markNotificationRead, markAllNotificationsRead, clearNotifications, unreadCount,
    updateBusinessSettings,
    getAppointmentsByDate, getAppointmentsForClient,
    getLastVisit, getNextAppointment, getTotalSpent,
    getAvailableSlots, hasConflict, getProfessionalSchedule,
    loadDemoProfile,
    refreshData, clearData,
  }), [
    services, professionals, clients, appointments, notifications, businessSettings, dataLoaded,
    addService, updateService, deleteService,
    addProfessional, updateProfessional, deleteProfessional, updateWorkingHours,
    addClient, updateClient, deleteClient,
    addAppointment, updateAppointment, deleteAppointment,
    markNotificationRead, markAllNotificationsRead, clearNotifications, unreadCount,
    updateBusinessSettings,
    getAppointmentsByDate, getAppointmentsForClient,
    getLastVisit, getNextAppointment, getTotalSpent,
    getAvailableSlots, hasConflict, getProfessionalSchedule,
    loadDemoProfile,
    refreshData, clearData,
  ]);

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

// ============================
// HOOKS
// ============================

export function useAppData() {
  const context = useContext(AppDataContext);
  return context ?? FALLBACK_CONTEXT;
}

export function useAppDataSafe() {
  return useContext(AppDataContext);
}

export { DEFAULT_SCHEDULE };
export type { WeeklySchedule as WeeklyScheduleType };
