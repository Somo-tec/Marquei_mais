# Redesign da LP do Marquei + Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Execucao nativa, na mesma sessao (o Davi nao le plano).

**Goal:** Reescrever a LP com a identidade do sistema (ciano `#50CAE6` chapado, navy `#1A1F2B`), estrutura e animacoes fieis ao eternal.co.

**Architecture:** `pages/LandingPage.tsx` vira so a composicao das secoes. Cada secao e um arquivo em `pages/landing/`. Mockups sao componentes locais que imitam as telas do sistema, sem depender do `AppDataProvider`. Animacoes com `motion` (ja instalado) e um componente `Reveal`.

**Tech Stack:** React 18, Tailwind 4, `motion` 12, `lucide-react`.

**Spec:** `docs/superpowers/specs/2026-11-06-landing-page-redesign-design.md`

## Global Constraints

- Assinatura mantida: `LandingPage({ onLogin, onSignup })`.
- Cores so via tokens em `landing/tokens.ts`: `BLUE=#50CAE6`, `NAVY=#1A1F2B`, pastéis derivados (`BLUE_50=#EEFAFD`, `BLUE_100=#DDF4FA`, `BLUE_200=#BDEBF6`), fundo `PAPER=#F6F9FA`.
- Sem degradê, sem sombra pesada, sem travessao em nenhum texto.
- Titulo grande branco sobre o azul; texto pequeno sobre o azul em navy.
- Preco: sem valores. CTA "Comece grátis" + "14 dias grátis, sem cartão".
- Depoimentos atras da flag `SHOW_TESTIMONIALS = false`.
- `prefers-reduced-motion`: sem animacao, conteudo visivel.
- Sem novas dependencias. Nao tocar em outros arquivos alem de `LandingPage.tsx` e `landing/*`.

## Review Focus

- Reduced motion ativo: tudo precisa aparecer (nada preso em opacity 0).
- Celular estreito (375px): sem rolagem horizontal, mockups dentro da tela.
- Flag de depoimentos desligada: nenhum espaco vazio nem link orfao no menu.
- Botoes "Entrar" e "Comece grátis" chamam `onLogin` e `onSignup`.

## Tasks

### Task 1: Base (tokens, Reveal, PhoneFrame)
**Files:** Create `pages/landing/tokens.ts`, `pages/landing/Reveal.tsx`, `pages/landing/PhoneFrame.tsx`.
**Interfaces:** Produces `Reveal({ delay?: number; y?: number; children })`, `PhoneFrame({ children, className? })`, constantes de cor.
- [ ] `Reveal` usa `motion.div` com `whileInView`, `once`, `useReducedMotion` (sem animacao quando ativo).
- [ ] `PhoneFrame` desenha moldura navy arredondada com tela interna e notch, em DOM/CSS.
- [ ] Verifica: `npx tsc --noEmit` sem erros novos.

### Task 2: Mockups das telas
**Files:** Create `pages/landing/mocks.tsx`.
**Interfaces:** Produces `BookingMock`, `WhatsAppMock`, `ReviewMock`, `AgendaMock`, todos sem props, estaticos, usando tokens.
- [ ] Cada mock imita a tela real (cardapio de servicos + horarios; conversa de confirmacao; pedido de avaliacao com estrelas e link Google; lista de agenda do dia).
- [ ] Verifica: tsc.

### Task 3: Secoes
**Files:** Create `pages/landing/Hero.tsx`, `HowItWorks.tsx`, `Features.tsx`, `Segments.tsx`, `Testimonials.tsx`, `Faq.tsx`, `FinalCta.tsx`, `Header.tsx`, `Footer.tsx`.
**Interfaces:** `Header/Hero/FinalCta` recebem `{ onLogin; onSignup }` quando aplicavel; demais sem props.
- [ ] Hero: titulo centralizado com palavras em azul, CTA pilula navy, celular grande com parallax (`useScroll`/`useTransform`), rotulos laterais.
- [ ] HowItWorks: 3 passos com `Reveal` em sequencia.
- [ ] Features: 4 blocos alternados com mockup (WhatsApp em bloco azul cheio).
- [ ] Segments (azul cheio), Faq (accordion simples), FinalCta (azul cheio), Testimonials atras da flag, Footer.
- [ ] Verifica: tsc.

### Task 4: Composicao e verificacao
**Files:** Modify `pages/LandingPage.tsx` (substituir pelo composto).
- [ ] Compor secoes, manter props.
- [ ] `npm run build` passa; abrir no navegador em desktop e 375px; conferir animacoes, contraste e botoes.
- [ ] Commit em branch `feat/landing-redesign`, PR para `main`.
