import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Reveal } from "./Reveal";
import { PhoneFrame } from "./PhoneFrame";
import { PhoneVideo } from "./PhoneVideo";
import { BLUE, BLUE_100, BLUE_200, NAVY, PAPER, MUTED } from "./tokens";

interface HeroProps {
  onSignup: () => void;
}

const mark = (text: string) => (
  <span className="inline-block rounded-xl px-2.5 sm:px-3" style={{ background: BLUE, color: NAVY }}>
    {text}
  </span>
);

export function Hero({ onSignup }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -70]);

  return (
    <section id="top" ref={ref} className="relative overflow-hidden px-4 pb-0 pt-28 sm:px-6 sm:pt-32" style={{ background: PAPER }}>
      {/* Formas pastel chapadas atras do celular */}
      <div className="pointer-events-none absolute left-[8%] top-[34%] h-40 w-40 rounded-full sm:h-64 sm:w-64" style={{ background: BLUE_100 }} />
      <div className="pointer-events-none absolute right-[6%] top-[46%] h-32 w-32 rounded-full sm:h-52 sm:w-52" style={{ background: BLUE_200 }} />

      <div className="relative mx-auto max-w-4xl text-center">
        <Reveal>
          <h1 className="text-[2.2rem] font-bold leading-[1.18] tracking-tight sm:text-6xl sm:leading-[1.15]" style={{ color: NAVY }}>
            Você cuida do {mark("serviço")}
            <br />
            O Marquei cuida do {mark("resto")}
          </h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg" style={{ color: MUTED }}>
            Seu cliente vê os horários livres e agenda sozinho. O WhatsApp confirma e, depois do serviço, pede a avaliação no Google. Tudo automático.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={onSignup}
              className="rounded-full px-8 py-4 text-base font-semibold text-white transition-transform active:scale-95"
              style={{ background: NAVY }}
            >
              Comece grátis
            </button>
            <span className="text-sm" style={{ color: MUTED }}>14 dias grátis, sem cartão</span>
          </div>
        </Reveal>
      </div>

      <div className="relative mx-auto mt-12 flex max-w-5xl items-end justify-center">
        <Reveal delay={0.5} className="absolute bottom-10 left-0 hidden max-w-[10rem] text-left text-lg font-semibold leading-snug md:block">
          <span style={{ color: NAVY }}>Agenda sem <em className="not-italic" style={{ background: BLUE_200 }}>troca</em> de mensagens</span>
        </Reveal>
        <motion.div style={{ y: phoneY }} className="-mb-24 sm:-mb-40">
          <Reveal delay={0.4} y={80}>
            <PhoneFrame className="w-[240px] sm:w-[320px]">
              <PhoneVideo name="agendar" />
            </PhoneFrame>
          </Reveal>
        </motion.div>
        <Reveal delay={0.6} className="absolute bottom-10 right-0 hidden max-w-[10rem] text-right text-lg font-semibold leading-snug md:block">
          <span style={{ color: NAVY }}>Avaliações no Google, no <em className="not-italic" style={{ background: BLUE_200 }}>automático</em></span>
        </Reveal>
      </div>
    </section>
  );
}
