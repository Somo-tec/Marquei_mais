import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface PhoneVideoProps {
  name: "agendar" | "whatsapp" | "avaliacao" | "agenda";
}

// Video do fluxo (sem audio, sem letreiros) dentro da tela do celular.
// Toca so quando visivel; com "reduzir movimento" mostra apenas a imagem de capa.
export function PhoneVideo({ name }: PhoneVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <video
      ref={ref}
      className="h-full w-full object-cover"
      src={`/landing/${name}.mp4`}
      poster={`/landing/${name}.jpg`}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
}
