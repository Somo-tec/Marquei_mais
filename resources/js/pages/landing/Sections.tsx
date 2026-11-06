import React, { useState } from "react";
import { Plus, Scissors, Sparkles, Heart, Flower2 } from "lucide-react";
import { Reveal } from "./Reveal";
import { PhoneFrame } from "./PhoneFrame";
import { AgendaMock, BookingMock, ReviewMock, WhatsAppMock } from "./mocks";
import { BLUE, BLUE_50, BLUE_100, NAVY, PAPER, MUTED, SHOW_TESTIMONIALS } from "./tokens";

const label = "text-[11px] font-semibold uppercase tracking-[0.14em]";

/* ---------- Como funciona ---------- */
export function HowItWorks() {
  const steps = [
    { t: "Cadastre serviços e horários", d: "Monte seu cardápio de serviços com preço e duração, e defina os dias e horários em que atende." },
    { t: "O cliente escolhe e agenda", d: "Ele abre seu link, vê os horários livres e marca sozinho. Sem troca de mensagens." },
    { t: "O Marquei confirma e pede avaliação", d: "Confirmação no WhatsApp do cliente na hora e, depois do serviço, um pedido de avaliação direto para o seu Google." },
  ];
  return (
    <section id="como-funciona" className="px-4 py-20 sm:px-6 sm:py-28" style={{ background: BLUE_50 }}>
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: NAVY }}>Como funciona</h2>
            <span className={label} style={{ color: MUTED }}>Seu tempo, de volta</span>
          </div>
        </Reveal>
        <div className="mt-12 space-y-8">
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.12}>
              <div className="flex gap-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold" style={{ color: NAVY }}>
                  {i + 1}
                </div>
                <div className="max-w-md">
                  <h3 className="text-xl font-semibold" style={{ color: NAVY }}>{s.t}</h3>
                  <p className="mt-1.5" style={{ color: MUTED }}>{s.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Recursos (blocos alternados com mockup) ---------- */
interface FeatureProps {
  kicker: string;
  title: string;
  text: string;
  mock: React.ReactNode;
  bg: string;
  solid?: boolean; // azul cheio: titulo branco, texto em navy
  flip?: boolean;
}

function Feature({ kicker, title, text, mock, bg, solid, flip }: FeatureProps) {
  return (
    <section className="overflow-hidden px-4 py-20 sm:px-6 sm:py-28" style={{ background: bg }}>
      <div className={`mx-auto flex max-w-5xl flex-col items-center gap-12 md:gap-20 ${flip ? "md:flex-row-reverse" : "md:flex-row"}`}>
        <div className="flex-1 text-center md:text-left">
          <Reveal>
            <span className={label} style={{ color: solid ? NAVY : MUTED }}>{kicker}</span>
            <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl" style={{ color: solid ? "#fff" : NAVY }}>
              {title}
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg md:mx-0" style={{ color: solid ? NAVY : MUTED }}>{text}</p>
          </Reveal>
        </div>
        <Reveal delay={0.15} y={60}>
          <PhoneFrame className="w-[240px] sm:w-[270px]">{mock}</PhoneFrame>
        </Reveal>
      </div>
    </section>
  );
}

export function Features() {
  return (
    <div id="recursos">
      <Feature
        kicker="Cardápio virtual"
        title="Seus serviços e horários num link só"
        text="O cliente vê o que você faz, quanto custa e quando tem vaga. Escolhe o horário e pronto. Você nem precisa parar o que está fazendo."
        mock={<BookingMock />}
        bg="#FFFFFF"
      />
      <Feature
        kicker="WhatsApp"
        title="Confirmação automática no WhatsApp do cliente"
        text="Agendou, o Marquei avisa. Antes do horário, manda o lembrete. Menos falta, menos remarcação, zero mensagem digitada por você."
        mock={<WhatsAppMock />}
        bg={BLUE}
        solid
        flip
      />
      <Feature
        kicker="Avaliações"
        title="Cliente satisfeito vira nota 5 no Google"
        text="Depois do serviço, uma mensagem automática pede a avaliação e leva o cliente direto para a página da sua empresa no Google."
        mock={<ReviewMock />}
        bg={BLUE_100}
      />
      <Feature
        kicker="Agenda"
        title="Seu dia organizado, sem buraco"
        text="Veja o que vem pela frente, quem já confirmou e quanto vai entrar. O fluxo fica leve para você focar em fazer o melhor serviço possível."
        mock={<AgendaMock />}
        bg="#FFFFFF"
        flip
      />
    </div>
  );
}

/* ---------- Para quem é (azul cheio) ---------- */
export function Segments() {
  const items = [
    { i: Scissors, t: "Barbearias" },
    { i: Sparkles, t: "Salões de beleza" },
    { i: Flower2, t: "Estética e unhas" },
    { i: Heart, t: "Outros serviços" },
  ];
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28" style={{ background: BLUE }}>
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <span className={label} style={{ color: NAVY }}>Para quem é</span>
          <h2 className="mx-auto mt-3 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Para quem vive de agenda e quer viver de serviço
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {items.map(({ i: Icon, t }, k) => (
            <Reveal key={t} delay={k * 0.1}>
              <div className="rounded-3xl bg-white px-4 py-8" style={{ color: NAVY }}>
                <Icon className="mx-auto mb-3 h-7 w-7" />
                <div className="font-semibold">{t}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Depoimentos (escondidos ate haver citacoes reais) ---------- */
const TESTIMONIALS: { quote: string; name: string; role: string }[] = [];

export function Testimonials() {
  if (!SHOW_TESTIMONIALS || TESTIMONIALS.length === 0) return null;
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28" style={{ background: PAPER }}>
      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t, k) => (
          <Reveal key={t.name} delay={k * 0.1}>
            <figure className="rounded-3xl bg-white p-6" style={{ color: NAVY }}>
              <blockquote className="text-lg">{t.quote}</blockquote>
              <figcaption className="mt-4 text-sm" style={{ color: MUTED }}>{t.name}, {t.role}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const FAQ = [
  { q: "Preciso pagar para começar?", a: "Não. Você começa sem cartão, com 14 dias grátis do Plano Profissional. Existe também um plano gratuito, com limite de agendamentos por mês. Os planos e valores ficam dentro do sistema, sem surpresa." },
  { q: "O cliente precisa baixar algum aplicativo?", a: "Não. Ele abre o seu link no celular, escolhe o serviço e o horário e confirma. Pronto." },
  { q: "A confirmação no WhatsApp é automática?", a: "Sim. Assim que o cliente agenda, ele recebe a confirmação, e você não digita nada." },
  { q: "Como funciona o pedido de avaliação?", a: "Depois do serviço, o cliente recebe uma mensagem automática com o link para avaliar a sua empresa no Google." },
  { q: "Serve para o meu tipo de negócio?", a: "Serve para barbearias, salões, estética, unhas e outros serviços que trabalham com horário marcado." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="duvidas" className="px-4 py-20 sm:px-6 sm:py-28" style={{ background: BLUE_50 }}>
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: NAVY }}>Dúvidas frequentes</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.06}>
                <div className="rounded-2xl bg-white">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
                    style={{ color: NAVY }}
                  >
                    {f.q}
                    <Plus className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-45" : ""}`} />
                  </button>
                  {isOpen && <p className="px-5 pb-5" style={{ color: MUTED }}>{f.a}</p>}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA final (azul cheio) ---------- */
export function FinalCta({ onSignup }: { onSignup: () => void }) {
  return (
    <section className="px-4 py-24 text-center sm:px-6 sm:py-32" style={{ background: BLUE }}>
      <Reveal>
        <h2 className="mx-auto max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
          Foque no que importa: o serviço
        </h2>
        <p className="mt-5 text-lg" style={{ color: NAVY }}>Comece hoje. 14 dias grátis, sem cartão.</p>
        <button
          onClick={onSignup}
          className="mt-8 rounded-full px-9 py-4 text-base font-semibold text-white transition-transform active:scale-95"
          style={{ background: NAVY }}
        >
          Comece grátis
        </button>
      </Reveal>
    </section>
  );
}

/* ---------- Rodape ---------- */
export function Footer() {
  return (
    <footer className="px-4 py-10 text-center text-sm sm:px-6" style={{ background: NAVY, color: "#8895A7" }}>
      <div className="mb-3 flex justify-center gap-6">
        <a href="#" className="hover:text-white">Termos de Uso</a>
        <a href="#" className="hover:text-white">Privacidade</a>
        <a href="#" className="hover:text-white">Ajuda</a>
      </div>
      &copy; {new Date().getFullYear()} Marquei+. Todos os direitos reservados.
    </footer>
  );
}
