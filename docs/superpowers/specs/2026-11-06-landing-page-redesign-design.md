# Redesign da Landing Page do Marquei +

## Intenção

A LP atual (`resources/js/pages/LandingPage.tsx`) destoa do sistema: usa cinza/branco e um degradê azul-600 para ciano, enquanto o sistema usa o ciano `#50CAE6` sobre navy `#1A1F2B`. O objetivo é refazer a LP para que pareça o mesmo produto e conte com clareza a proposta do Marquei.

**Proposta a comunicar:** o profissional (barbearia, salão, estética, outros) foca só em executar o serviço. O cliente vê os horários livres e agenda sozinho. O WhatsApp confirma automaticamente. Depois do serviço, uma mensagem automática pede avaliação e leva o cliente para a página da empresa no Google. A página também funciona como cardápio virtual (serviços e horários disponíveis) e a agenda fica organizada.

**Referência principal:** https://eternal.co (hero com celular grande, estrutura de seções, mockups, animações de scroll e elementos que aparecem com atraso). Secundárias: wabi.ai, reactbits.dev, buzz.xyz. Deve ser bem fiel ao Eternal em estrutura e ritmo, mas repensado para a identidade visual do Marquei.

## Objetivos

- LP visualmente coerente com o sistema (mesmas cores, mesmo navy).
- Estrutura e animações fiéis ao Eternal.
- Mockups mostrando as telas reais do Marquei.
- CTA leva direto ao cadastro (`onSignup`), sem tabela de preços.

## Não objetivos

- Sem degradês, sombras pesadas ou glassmorphism (estilo chapado).
- Sem seção de preços/planos (os planos ficam na tela de assinatura do sistema).
- Não mexer no restante do sistema nem nas rotas.

## Anti-objetivos (falha mesmo que "funcione")

- Parecer outro produto, ou um template genérico de SaaS.
- Texto branco pequeno sobre o ciano (contraste baixo).
- Animações que atrapalham a leitura ou travam no celular.

## Decisões do Davi

- **Azul:** o mesmo do sistema, `#50CAE6`, chapado. Tons pastel das superfícies saem dele clareando.
- **Texto e botões:** navy `#1A1F2B` (o do dark mode do sistema).
- **Seções "escuras" estilo Eternal:** fundo no azul `#50CAE6` chapado, com títulos grandes brancos.
- **Preços:** não aparecem na LP. Botão leva ao cadastro, com "14 dias grátis" em destaque.
- **Animações:** de scroll, com elementos que entram com atraso, como no Eternal.

## Estrutura da página

1. **Hero:** título centralizado com palavras em destaque (provisório: "Você cuida do serviço. O Marquei cuida do resto."), subtítulo curto, CTA pílula, celular grande com a agenda/página de agendamento, pequenos rótulos laterais ("Agenda sem troca de mensagens", "Avaliações no Google, no automático").
2. **Como funciona:** 3 passos numerados (cadastre serviços e horários; cliente escolhe e agenda; Marquei confirma e pede avaliação).
3. **Blocos alternados com mockup**, um por funcionalidade: página de agendamento (cardápio + horários), confirmação no WhatsApp (bloco azul), avaliação no Google, agenda do profissional.
4. **Para quem é:** barbearia, salão, estética, outros (bloco azul).
5. **Depoimentos:** seção construída a partir de um array de dados, mas **escondida** (flag desligada) porque os depoimentos atuais não são reais. Só liga com citações verdadeiras.
6. **FAQ curto**, incluindo uma resposta em texto sobre preço.
7. **CTA final** (bloco azul) com "14 dias grátis".
8. **Rodapé** e cabeçalho com Entrar e Começar (`onLogin`, `onSignup`, já existentes).

Blocos azul cheio: WhatsApp, Para quem é, CTA final. Os demais alternam entre off-white e pastel claro.

## Restrições técnicas

- Reescrever `LandingPage.tsx`, mantendo a assinatura `LandingPage({ onLogin, onSignup })`.
- Stack existente: React 18, Tailwind 4, `motion` 12 (já usado na LP), `lucide-react`. Não adicionar dependências sem necessidade.
- Cores como tokens (ciano `#50CAE6`, navy `#1A1F2B`, pastéis derivados), não valores soltos espalhados.
- Mockups devem reproduzir as telas reais do sistema (reaproveitar `Dashboard` e componentes existentes onde fizer sentido), não imagens genéricas.
- Responsivo (celular primeiro, é onde o dono de barbearia vai abrir) e respeitar `prefers-reduced-motion`.
- Mudança de UI só está pronta depois de vista funcionando no navegador, com lint e typecheck passando.

## Escolhas minhas (para o Davi conferir)

- Fundo da página: off-white leve em vez de branco puro.
- Texto pequeno sobre o azul cheio em navy.
- Título do hero e textos provisórios.
- Mockups feitos dentro de `LandingPage.tsx`, imitando as telas do sistema, sem mexer em outros arquivos (a LP já é renderizada dentro do `AppDataProvider`, mas não depende dele).
- Hero com moldura de celular em código, entrada animada e leve parallax ao rolar.
- LP sempre no layout claro; tokens de cor definidos só dentro da LP.
- Efeitos copiados do Eternal: entradas no scroll com atraso, blocos em sequência, parallax do celular. Respeita `prefers-reduced-motion`.
- Título grande branco sobre o azul (decisão do Davi); texto pequeno nesses blocos em navy.
- **Oferta (decisão baseada em prática de conversão para pequenos negócios):** CTA "Comece grátis" com "14 dias grátis, sem cartão". O cadastro atual ("Crie sua conta gratis") não pede cartão em nenhum passo do fluxo; se isso mudar, o texto muda junto. Testes sem cartão reduzem a barreira de entrada de donos de barbearia e salão, que decidem rápido.
- **FAQ de preço:** explica a estrutura (plano gratuito com limite de agendamentos e Plano Profissional com 14 dias de teste) sem publicar valores, porque os valores não estão definidos no código e podem mudar. Se o Davi quiser mostrar valores, é só incluir no FAQ.
- Depoimentos escondidos (ver estrutura).
- Inclusão de FAQ curto e da seção "Para quem é".

## Deixado para o construtor

Detalhes de espaçamento, tipografia (manter a fonte do sistema), curvas e tempos de animação, escolha das telas exatas nos mockups, copy final dentro da proposta acima.
