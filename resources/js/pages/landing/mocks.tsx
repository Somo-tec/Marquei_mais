import React from "react";
import { Check, CheckCheck, Star, Scissors, Clock, ChevronLeft } from "lucide-react";
import { BLUE, BLUE_50, BLUE_100, BLUE_200, NAVY, PAPER, MUTED } from "./tokens";

// Telas de mockup chapadas, imitando o sistema. Sem dados reais, sem dependencia de contexto.
const screen = "h-full w-full pt-9 px-3 pb-3 text-[10px] leading-tight overflow-hidden";

export function BookingMock() {
  const services = [
    { n: "Corte masculino", d: "40 min", p: "R$ 45" },
    { n: "Barba", d: "30 min", p: "R$ 30" },
    { n: "Corte + barba", d: "1h 10", p: "R$ 65" },
  ];
  const hours = ["09:00", "09:40", "10:20", "11:00", "14:00", "14:40"];
  return (
    <div className={screen} style={{ background: PAPER, color: NAVY }}>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: BLUE }}>
          <Scissors className="h-4 w-4" color={NAVY} />
        </div>
        <div>
          <div className="text-[11px] font-bold">Barbearia do Léo</div>
          <div style={{ color: MUTED }}>Agende seu horário</div>
        </div>
      </div>
      <div className="mb-1.5 font-bold">Serviços</div>
      <div className="mb-3 space-y-1.5">
        {services.map((s, i) => (
          <div
            key={s.n}
            className="flex items-center justify-between rounded-xl bg-white px-2.5 py-2"
            style={i === 0 ? { outline: `2px solid ${BLUE}` } : undefined}
          >
            <div>
              <div className="font-semibold">{s.n}</div>
              <div style={{ color: MUTED }}>{s.d}</div>
            </div>
            <div className="font-bold">{s.p}</div>
          </div>
        ))}
      </div>
      <div className="mb-1.5 font-bold">Horários livres · sexta</div>
      <div className="grid grid-cols-3 gap-1.5">
        {hours.map((h, i) => (
          <div
            key={h}
            className="rounded-lg py-1.5 text-center font-semibold"
            style={i === 2 ? { background: BLUE, color: NAVY } : { background: BLUE_100, color: NAVY }}
          >
            {h}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-full py-2 text-center font-bold text-white" style={{ background: NAVY }}>
        Confirmar horário
      </div>
    </div>
  );
}

export function WhatsAppMock() {
  return (
    <div className={screen} style={{ background: "#EFEAE2", color: NAVY }}>
      <div className="-mx-3 -mt-9 mb-3 flex items-center gap-2 px-3 pb-2 pt-9" style={{ background: NAVY, color: "#fff" }}>
        <ChevronLeft className="h-4 w-4" />
        <div className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: BLUE, color: NAVY }}>
          M
        </div>
        <div className="font-semibold">Barbearia do Léo</div>
      </div>
      <div className="mb-2 ml-auto w-[78%] rounded-xl rounded-tr-sm bg-white p-2">
        <div className="mb-1 font-bold">Agendamento confirmado ✅</div>
        Oi, Carlos! Seu corte está marcado para <b>sexta, 10:20</b>. Te esperamos!
        <div className="mt-1 text-right text-[8px]" style={{ color: MUTED }}>
          09:12 <CheckCheck className="inline h-3 w-3" color={BLUE} />
        </div>
      </div>
      <div className="mb-2 w-[60%] rounded-xl rounded-tl-sm p-2" style={{ background: BLUE_200 }}>
        Perfeito, obrigado!
      </div>
      <div className="mb-2 ml-auto w-[78%] rounded-xl rounded-tr-sm bg-white p-2">
        <div className="mb-1 font-bold">Lembrete 🔔</div>
        Amanhã às <b>10:20</b>. Precisa remarcar? É só responder aqui.
      </div>
    </div>
  );
}

export function ReviewMock() {
  return (
    <div className={screen} style={{ background: "#EFEAE2", color: NAVY }}>
      <div className="-mx-3 -mt-9 mb-3 flex items-center gap-2 px-3 pb-2 pt-9" style={{ background: NAVY, color: "#fff" }}>
        <ChevronLeft className="h-4 w-4" />
        <div className="font-semibold">Barbearia do Léo</div>
      </div>
      <div className="mb-2 ml-auto w-[82%] rounded-xl rounded-tr-sm bg-white p-2">
        <div className="mb-1 font-bold">Como foi seu corte? ✂️</div>
        Obrigado pela visita, Carlos! Sua opinião ajuda muito a gente.
        <div className="my-2 flex justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-4 w-4" fill="#F5B50A" color="#F5B50A" />
          ))}
        </div>
        <div className="rounded-full py-1.5 text-center font-bold" style={{ background: BLUE, color: NAVY }}>
          Avaliar no Google
        </div>
      </div>
      <div className="w-[70%] rounded-xl rounded-tl-sm p-2" style={{ background: BLUE_200 }}>
        Avaliei! 5 estrelas 😄
      </div>
    </div>
  );
}

export function AgendaMock() {
  const items = [
    { t: "09:00", n: "Carlos Silva", s: "Corte", ok: true },
    { t: "09:40", n: "Pedro Alves", s: "Barba", ok: true },
    { t: "10:20", n: "Rafael Costa", s: "Corte + barba", ok: false },
    { t: "11:30", n: "Bruno Lima", s: "Corte", ok: true },
  ];
  return (
    <div className={screen} style={{ background: PAPER, color: NAVY }}>
      <div className="mb-2 text-[12px] font-bold">Hoje, sexta</div>
      <div className="mb-3 grid grid-cols-2 gap-1.5">
        <div className="rounded-xl bg-white p-2">
          <div style={{ color: MUTED }}>Agendamentos</div>
          <div className="text-lg font-bold">8</div>
        </div>
        <div className="rounded-xl p-2" style={{ background: BLUE }}>
          <div>Faturamento</div>
          <div className="text-lg font-bold">R$ 420</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {items.map((a) => (
          <div key={a.t} className="flex items-center gap-2 rounded-xl bg-white p-2">
            <div className="flex h-8 w-9 flex-col items-center justify-center rounded-lg font-bold" style={{ background: BLUE_50 }}>
              <Clock className="mb-0.5 h-2.5 w-2.5" color={MUTED} />
              {a.t}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{a.n}</div>
              <div style={{ color: MUTED }}>{a.s}</div>
            </div>
            {a.ok && <Check className="h-3.5 w-3.5" color={BLUE} />}
          </div>
        ))}
      </div>
    </div>
  );
}
