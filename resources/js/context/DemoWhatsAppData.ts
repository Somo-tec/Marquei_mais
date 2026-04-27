import { subHours, subDays, subMinutes } from "date-fns";
import type { DemoWhatsAppConversation, DemoWhatsAppMessage } from "@/context/DemoProfiles";

// Helper to create a message
function msg(
  id: string,
  direction: "incoming" | "outgoing",
  body: string,
  timestamp: number,
  phone: string
): DemoWhatsAppMessage {
  return {
    id,
    direction,
    body,
    timestamp,
    status: direction === "outgoing" ? "simulated" : "received",
    contactPhone: phone,
  };
}

// Normalize phone for consistency
function norm(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

// ============================
// BARBEARIA - Barber King
// ============================
export function getBarbeariaWhatsApp(): DemoWhatsAppConversation[] {
  const now = Date.now();
  const p1 = norm("11991110001"); // Lucas Mendes
  const p2 = norm("11991110002"); // Pedro Almeida
  const p3 = norm("11991110005"); // Bruno Oliveira
  const p4 = norm("11991110004"); // Rafael Costa

  return [
    {
      contactPhone: p1,
      contactName: "Lucas Mendes",
      lastMessage: "Valeu, Ricardo! Ate sabado entao!",
      lastTimestamp: subHours(now, 2).valueOf(),
      lastDirection: "incoming",
      unreadCount: 1,
      messages: [
        msg("bw1-1", "outgoing", "Fala Lucas! Tudo certo pra sabado? Teu degrade ta agendado pras 09:00 com o Ricardo.", subDays(now, 1).valueOf(), p1),
        msg("bw1-2", "incoming", "Opa, tudo sim! Vou querer o mesmo fade de sempre", subDays(now, 1).valueOf() + 300000, p1),
        msg("bw1-3", "outgoing", "Perfeito, ja ta anotado. Fade medio com navalha no pe. Chega uns 5min antes pra gente nao atrasar", subDays(now, 1).valueOf() + 600000, p1),
        msg("bw1-4", "incoming", "Beleza! Ah, e da pra fazer a sobrancelha tambem?", subDays(now, 1).valueOf() + 900000, p1),
        msg("bw1-5", "outgoing", "Claro! Vou adicionar sobrancelha no teu horario. Fica R$15 a mais, fecha?", subDays(now, 1).valueOf() + 1200000, p1),
        msg("bw1-6", "incoming", "Fecha sim! Manda brasa", subHours(now, 3).valueOf(), p1),
        msg("bw1-7", "outgoing", "Show! Sabado as 09:00 entao. Degrade + sobrancelha. Te esperamos!", subHours(now, 2).valueOf() + 60000, p1),
        msg("bw1-8", "incoming", "Valeu, Ricardo! Ate sabado entao!", subHours(now, 2).valueOf(), p1),
      ],
    },
    {
      contactPhone: p2,
      contactName: "Pedro Almeida",
      lastMessage: "Perfeito! Confirmado entao. Qualquer coisa manda msg aqui.",
      lastTimestamp: subHours(now, 5).valueOf(),
      lastDirection: "outgoing",
      unreadCount: 0,
      messages: [
        msg("bw2-1", "incoming", "Oi, boa tarde! Queria agendar um corte + barba pra essa semana, tem horario?", subDays(now, 2).valueOf(), p2),
        msg("bw2-2", "outgoing", "E ai Pedro! Tenho horario quinta as 10:00 com o Thiago ou sexta as 14:00 com o Ricardo. Qual prefere?", subDays(now, 2).valueOf() + 300000, p2),
        msg("bw2-3", "incoming", "Quinta as 10 ta otimo!", subDays(now, 2).valueOf() + 600000, p2),
        msg("bw2-4", "outgoing", "Agendado! Corte + barba, quinta as 10:00 com Thiago. R$70,00. Lembrando que a gente aceita Pix tambem.", subDays(now, 2).valueOf() + 900000, p2),
        msg("bw2-5", "incoming", "Show! Aceita cartao tambem ne?", subDays(now, 2).valueOf() + 1200000, p2),
        msg("bw2-6", "outgoing", "Aceita sim! Debito e credito, sem taxa.", subHours(now, 5).valueOf() + 60000, p2),
        msg("bw2-7", "incoming", "Beleza, obrigado!", subHours(now, 5).valueOf() + 120000, p2),
        msg("bw2-8", "outgoing", "Perfeito! Confirmado entao. Qualquer coisa manda msg aqui.", subHours(now, 5).valueOf(), p2),
      ],
    },
    {
      contactPhone: p3,
      contactName: "Bruno Oliveira",
      lastMessage: "Boa! Vou separar os produtos premium pra voce. Ate la!",
      lastTimestamp: subDays(now, 1).valueOf(),
      lastDirection: "outgoing",
      unreadCount: 0,
      messages: [
        msg("bw3-1", "incoming", "Ricardo, tudo bem? Quero agendar o platinado de novo. Ja faz 2 meses!", subDays(now, 3).valueOf(), p3),
        msg("bw3-2", "outgoing", "Bruno! Beleza? Bora sim! O Felipe ta disponivel pra fazer. Demora umas 2h, lembra?", subDays(now, 3).valueOf() + 300000, p3),
        msg("bw3-3", "incoming", "Lembro sim, sem problema. Tem horario pra essa semana?", subDays(now, 3).valueOf() + 600000, p3),
        msg("bw3-4", "outgoing", "Tenho sexta as 14:00. Fecha pra voce? R$200 com a tonalizacao inclusa.", subDays(now, 3).valueOf() + 900000, p3),
        msg("bw3-5", "incoming", "Perfeito! Pode confirmar", subDays(now, 2).valueOf(), p3),
        msg("bw3-6", "outgoing", "Confirmado! Platinado com Felipe, sexta as 14:00. Traz um lanche porque demora hein haha", subDays(now, 2).valueOf() + 300000, p3),
        msg("bw3-7", "incoming", "Hahaha pode deixar! Valeu!", subDays(now, 1).valueOf() + 60000, p3),
        msg("bw3-8", "outgoing", "Boa! Vou separar os produtos premium pra voce. Ate la!", subDays(now, 1).valueOf(), p3),
      ],
    },
    {
      contactPhone: p4,
      contactName: "Rafael Costa",
      lastMessage: "Queria agendar uma barba pra hoje a tarde, tem vaga?",
      lastTimestamp: subHours(now, 1).valueOf(),
      lastDirection: "incoming",
      unreadCount: 1,
      messages: [
        msg("bw4-1", "incoming", "Oi! Queria agendar uma barba pra hoje a tarde, tem vaga?", subHours(now, 1).valueOf(), p4),
      ],
    },
  ];
}

// ============================
// NAIL DESIGNER - Unhas da Paty
// ============================
export function getNailWhatsApp(): DemoWhatsAppConversation[] {
  const now = Date.now();
  const p1 = norm("21982220001"); // Fernanda Rodrigues
  const p2 = norm("21982220003"); // Isabela Gomes
  const p3 = norm("21982220004"); // Larissa Nunes
  const p4 = norm("21982220006"); // Mariana Alves

  return [
    {
      contactPhone: p1,
      contactName: "Fernanda Rodrigues",
      lastMessage: "Maravilha! Vou separar os tons nude que voce gosta. Bjs!",
      lastTimestamp: subHours(now, 3).valueOf(),
      lastDirection: "outgoing",
      unreadCount: 0,
      messages: [
        msg("nw1-1", "incoming", "Paty! Preciso remarcar meu alongamento. Pode ser segunda de manha?", subDays(now, 2).valueOf(), p1),
        msg("nw1-2", "outgoing", "Oi Fer! Claro, tenho as 08:00 ou 10:00. Qual prefere?", subDays(now, 2).valueOf() + 300000, p1),
        msg("nw1-3", "incoming", "08:00 ta perfeito pra mim!", subDays(now, 2).valueOf() + 600000, p1),
        msg("nw1-4", "outgoing", "Pronto! Remarcado pra segunda as 08:00. Alongamento em gel. Quer manter o nude ou mudar a cor?", subDays(now, 2).valueOf() + 900000, p1),
        msg("nw1-5", "incoming", "Quero nude mesmo! Aquele tom que voce fez da ultima vez ficou perfeito", subDays(now, 1).valueOf(), p1),
        msg("nw1-6", "outgoing", "Amei! O nude rose ne? Lembro sim. Vou separar!", subDays(now, 1).valueOf() + 300000, p1),
        msg("nw1-7", "incoming", "Esse mesmo! Obrigada Paty, voce e a melhor!", subHours(now, 3).valueOf() + 60000, p1),
        msg("nw1-8", "outgoing", "Maravilha! Vou separar os tons nude que voce gosta. Bjs!", subHours(now, 3).valueOf(), p1),
      ],
    },
    {
      contactPhone: p2,
      contactName: "Isabela Gomes",
      lastMessage: "Quero fazer esmaltacao em gel hoje, tem horario a tarde?",
      lastTimestamp: subHours(now, 1).valueOf(),
      lastDirection: "incoming",
      unreadCount: 1,
      messages: [
        msg("nw2-1", "incoming", "Oi Paty! Vi no Instagram umas unhas lindas que voce postou. Quero fazer igual!", subDays(now, 1).valueOf(), p2),
        msg("nw2-2", "outgoing", "Isa! Obrigada! Aquelas foram esmaltacao em gel com nail art. Ficaram lindas mesmo! Quer agendar?", subDays(now, 1).valueOf() + 300000, p2),
        msg("nw2-3", "incoming", "Quero sim! Quanto fica a esmaltacao em gel?", subDays(now, 1).valueOf() + 600000, p2),
        msg("nw2-4", "outgoing", "A esmaltacao em gel e R$65. Se quiser a nail art, cada unha e R$12 a mais. Mas fica MARAVILHOSO!", subDays(now, 1).valueOf() + 900000, p2),
        msg("nw2-5", "incoming", "Vou fazer so a esmaltacao por enquanto! Quero fazer esmaltacao em gel hoje, tem horario a tarde?", subHours(now, 1).valueOf(), p2),
      ],
    },
    {
      contactPhone: p3,
      contactName: "Larissa Nunes",
      lastMessage: "Pode ficar tranquila, so uso hipoalergenico. Te espero!",
      lastTimestamp: subHours(now, 6).valueOf(),
      lastDirection: "outgoing",
      unreadCount: 0,
      messages: [
        msg("nw3-1", "incoming", "Oi Paty! Minha manutencao ta marcada pra hoje ne?", subHours(now, 8).valueOf(), p3),
        msg("nw3-2", "outgoing", "Oi Lari! Ta sim, as 14:00. Ta tudo certo?", subHours(now, 8).valueOf() + 300000, p3),
        msg("nw3-3", "incoming", "Sim! So queria lembrar que eu tenho alergia ao esmalte com formol, ta?", subHours(now, 7).valueOf(), p3),
        msg("nw3-4", "outgoing", "Ja tenho anotado no seu cadastro! Sempre uso os produtos hipoalergenicos pra voce", subHours(now, 7).valueOf() + 300000, p3),
        msg("nw3-5", "incoming", "Ah que otimo! Obrigada por lembrar. Voce e muito cuidadosa!", subHours(now, 6).valueOf() + 60000, p3),
        msg("nw3-6", "outgoing", "Pode ficar tranquila, so uso hipoalergenico. Te espero!", subHours(now, 6).valueOf(), p3),
      ],
    },
    {
      contactPhone: p4,
      contactName: "Mariana Alves",
      lastMessage: "Obrigada Paty! Ficou incrivel o banho de gel, amei!",
      lastTimestamp: subDays(now, 2).valueOf(),
      lastDirection: "incoming",
      unreadCount: 0,
      messages: [
        msg("nw4-1", "outgoing", "Oi Mari! Obrigado por visitar as Unhas da Paty! Como ficou seu banho de gel? Esperamos te ver em breve!", subDays(now, 2).valueOf() + 60000, p4),
        msg("nw4-2", "incoming", "Obrigada Paty! Ficou incrivel o banho de gel, amei!", subDays(now, 2).valueOf(), p4),
      ],
    },
  ];
}

// ============================
// PET SHOP - AuMigo Pet Care
// ============================
export function getPetWhatsApp(): DemoWhatsAppConversation[] {
  const now = Date.now();
  const p1 = norm("31973330001"); // Roberto Silva (Thor)
  const p2 = norm("31973330003"); // Fernando Costa (Rex)
  const p3 = norm("31973330006"); // Ana Ferreira (Mia)
  const p4 = norm("31973330004"); // Camila Duarte (Luna)

  return [
    {
      contactPhone: p1,
      contactName: "Roberto Silva (Thor)",
      lastMessage: "Lembrete: o banho do Thor e amanha as 08:00. Nao esqueca de trazer a carteirinha de vacinacao!",
      lastTimestamp: subHours(now, 4).valueOf(),
      lastDirection: "outgoing",
      unreadCount: 0,
      messages: [
        msg("pw1-1", "incoming", "Oi! O Thor precisa de banho. Tem horario pra amanha?", subDays(now, 2).valueOf(), p1),
        msg("pw1-2", "outgoing", "Oi Roberto! Temos as 08:00 ou 11:00 com o Joao Groomer. O Thor e grande porte ne? Golden Retriever lindo!", subDays(now, 2).valueOf() + 300000, p1),
        msg("pw1-3", "incoming", "Isso! Golden Retriever. 08:00 ta otimo", subDays(now, 2).valueOf() + 600000, p1),
        msg("pw1-4", "outgoing", "Perfeito! Lembrete importante: o Thor tem alergia a shampoo comum, certo? Vamos usar o hipoalergenico especial.", subDays(now, 2).valueOf() + 900000, p1),
        msg("pw1-5", "incoming", "Isso mesmo! Que bom que voces lembram. Ele fica bem mais confortavel com o especial", subDays(now, 1).valueOf(), p1),
        msg("pw1-6", "outgoing", "Claro! A gente cuida de cada detalhe. Quer adicionar a hidratacao de pelagem tambem? R$50 a mais e o pelo fica SEDOSO!", subDays(now, 1).valueOf() + 300000, p1),
        msg("pw1-7", "incoming", "Vamos sim! Ele merece haha", subDays(now, 1).valueOf() + 600000, p1),
        msg("pw1-8", "outgoing", "Lembrete: o banho do Thor e amanha as 08:00. Nao esqueca de trazer a carteirinha de vacinacao!", subHours(now, 4).valueOf(), p1),
      ],
    },
    {
      contactPhone: p2,
      contactName: "Fernando Costa (Rex)",
      lastMessage: "Preciso trazer o Rex pra consulta, ele ta meio caidinho. Tem horario hoje?",
      lastTimestamp: subHours(now, 1).valueOf(),
      lastDirection: "incoming",
      unreadCount: 1,
      messages: [
        msg("pw2-1", "incoming", "Oi, bom dia! Preciso trazer o Rex pra consulta, ele ta meio caidinho. Tem horario hoje?", subHours(now, 1).valueOf(), p2),
      ],
    },
    {
      contactPhone: p3,
      contactName: "Ana Ferreira (Mia)",
      lastMessage: "A Mia ficou LINDA! Obrigada Joao, voces sao os melhores!",
      lastTimestamp: subDays(now, 1).valueOf(),
      lastDirection: "incoming",
      unreadCount: 0,
      messages: [
        msg("pw3-1", "outgoing", "Oi Ana! A tosa da Mia ficou pronta! Ela ta linda demais! Pode vir buscar quando quiser.", subDays(now, 4).valueOf(), p3),
        msg("pw3-2", "incoming", "Ja to indo! Mal posso esperar pra ver!", subDays(now, 4).valueOf() + 300000, p3),
        msg("pw3-3", "incoming", "A Mia ficou LINDA! Obrigada Joao, voces sao os melhores!", subDays(now, 4).valueOf() + 3600000, p3),
        msg("pw3-4", "outgoing", "Obrigado Ana! A Mia e uma princesa, adoramos cuidar dela. Lembra que a proxima tosa e daqui 30 dias!", subDays(now, 4).valueOf() + 3900000, p3),
        msg("pw3-5", "incoming", "Ja vou agendar! Quero o mesmo horario, pode ser?", subDays(now, 3).valueOf(), p3),
        msg("pw3-6", "outgoing", "Pronto! Tosa na tesoura daqui 30 dias, mesmo horario das 14:00 com Joao. Confirmado!", subDays(now, 3).valueOf() + 300000, p3),
        msg("pw3-7", "incoming", "Perfeito! Obrigada!", subDays(now, 1).valueOf(), p3),
      ],
    },
    {
      contactPhone: p4,
      contactName: "Camila Duarte (Luna)",
      lastMessage: "Oi! Confirmo presenca da Luna amanha as 10:00 pro banho!",
      lastTimestamp: subHours(now, 6).valueOf(),
      lastDirection: "incoming",
      unreadCount: 0,
      messages: [
        msg("pw4-1", "outgoing", "Oi Camila! Lembrete: a Luna tem banho amanha as 10:00 com a Carla. Confirma presenca?", subHours(now, 8).valueOf(), p4),
        msg("pw4-2", "incoming", "Oi! Confirmo presenca da Luna amanha as 10:00 pro banho!", subHours(now, 6).valueOf(), p4),
        msg("pw4-3", "outgoing", "Otimo! A Carla adora a Luna. Ate amanha!", subHours(now, 6).valueOf() + 300000, p4),
      ],
    },
  ];
}

// ============================
// FITNESS - FitPro Studio
// ============================
export function getFitnessWhatsApp(): DemoWhatsAppConversation[] {
  const now = Date.now();
  const p1 = norm("41964440001"); // Marcos Pereira
  const p2 = norm("41964440002"); // Carolina Souza
  const p3 = norm("41964440005"); // Gabriel Santos
  const p4 = norm("41964440004"); // Beatriz Nunes
  const p5 = norm("41964440003"); // Thiago Almeida

  return [
    {
      contactPhone: p1,
      contactName: "Marcos Pereira",
      lastMessage: "Boa! Treino heavy amanha. Descansa bem e hidrata. Bora!",
      lastTimestamp: subHours(now, 2).valueOf(),
      lastDirection: "outgoing",
      unreadCount: 0,
      messages: [
        msg("fw1-1", "incoming", "Diego, to sentindo que o treino de perna ta ficando leve demais. Da pra aumentar a carga?", subDays(now, 1).valueOf(), p1),
        msg("fw1-2", "outgoing", "Marcos! Boa! Se ta ficando leve e sinal que ta evoluindo. Vou ajustar a periodizacao essa semana.", subDays(now, 1).valueOf() + 300000, p1),
        msg("fw1-3", "incoming", "Show! E aquele suplemento que voce indicou ta fazendo diferenca!", subDays(now, 1).valueOf() + 600000, p1),
        msg("fw1-4", "outgoing", "Que bom! A creatina ajuda bastante na recuperacao. Continua tomando 5g por dia.", subDays(now, 1).valueOf() + 900000, p1),
        msg("fw1-5", "incoming", "Beleza! Amanha ta confirmado as 06:00 ne?", subHours(now, 3).valueOf(), p1),
        msg("fw1-6", "outgoing", "Confirmado! Amanha e dia de costas e biceps. Prepara que vou pegar pesado!", subHours(now, 3).valueOf() + 300000, p1),
        msg("fw1-7", "incoming", "Haha to pronto! Vamo que vamo!", subHours(now, 2).valueOf() + 60000, p1),
        msg("fw1-8", "outgoing", "Boa! Treino heavy amanha. Descansa bem e hidrata. Bora!", subHours(now, 2).valueOf(), p1),
      ],
    },
    {
      contactPhone: p2,
      contactName: "Carolina Souza",
      lastMessage: "Estou bem animada com os resultados! Ja perdi 3kg esse mes!",
      lastTimestamp: subHours(now, 4).valueOf(),
      lastDirection: "incoming",
      unreadCount: 1,
      messages: [
        msg("fw2-1", "outgoing", "Oi Carol! Vi que voce completou 1 mes de treino funcional. Como esta se sentindo?", subDays(now, 2).valueOf(), p2),
        msg("fw2-2", "incoming", "Diego! Estou amando! Me sinto com muito mais disposicao no dia a dia", subDays(now, 2).valueOf() + 300000, p2),
        msg("fw2-3", "outgoing", "Que otimo! Seus resultados tao vindo rapido. Vou montar um treino novo pra essa fase.", subDays(now, 2).valueOf() + 600000, p2),
        msg("fw2-4", "incoming", "Perfeito! Ah, queria saber se da pra incluir uns exercicios pra core", subDays(now, 1).valueOf(), p2),
        msg("fw2-5", "outgoing", "Com certeza! Vou adicionar prancha, russian twist e dead bug no final de cada sessao. Vai amar!", subDays(now, 1).valueOf() + 300000, p2),
        msg("fw2-6", "incoming", "Estou bem animada com os resultados! Ja perdi 3kg esse mes!", subHours(now, 4).valueOf(), p2),
      ],
    },
    {
      contactPhone: p3,
      contactName: "Gabriel Santos",
      lastMessage: "Quero agendar meu treino pra hoje a tarde. Da pra encaixar as 17:00?",
      lastTimestamp: subHours(now, 1).valueOf(),
      lastDirection: "incoming",
      unreadCount: 1,
      messages: [
        msg("fw3-1", "incoming", "Diego, a corrida de domingo foi otima! Fiz meu melhor tempo nos 10km!", subDays(now, 3).valueOf(), p3),
        msg("fw3-2", "outgoing", "Gabriel! Parabens!! Quanto fez? O treino de velocidade ta dando resultado!", subDays(now, 3).valueOf() + 300000, p3),
        msg("fw3-3", "incoming", "Fiz 45:30! Quero baixar pra 43 na proxima!", subDays(now, 3).valueOf() + 600000, p3),
        msg("fw3-4", "outgoing", "Excelente marca! Vamos focar em intervalados essa semana pra melhorar o pace.", subDays(now, 2).valueOf(), p3),
        msg("fw3-5", "incoming", "Perfeito! Quero agendar meu treino pra hoje a tarde. Da pra encaixar as 17:00?", subHours(now, 1).valueOf(), p3),
      ],
    },
    {
      contactPhone: p4,
      contactName: "Beatriz Nunes",
      lastMessage: "Confirmado! Aula de yoga amanha as 08:00 com a Renata. Namaste!",
      lastTimestamp: subHours(now, 5).valueOf(),
      lastDirection: "outgoing",
      unreadCount: 0,
      messages: [
        msg("fw4-1", "incoming", "Oi! Queria confirmar minha aula de yoga de amanha", subHours(now, 7).valueOf(), p4),
        msg("fw4-2", "outgoing", "Oi Bia! Ta confirmado sim, amanha as 08:00 com a Renata.", subHours(now, 7).valueOf() + 300000, p4),
        msg("fw4-3", "incoming", "Otimo! Preciso levar tapetinho ou voces tem?", subHours(now, 6).valueOf(), p4),
        msg("fw4-4", "outgoing", "Temos tapetinhos e blocos aqui no studio! Mas se preferir trazer o seu, fique a vontade.", subHours(now, 6).valueOf() + 300000, p4),
        msg("fw4-5", "incoming", "Perfeito! Vou usar os de voces mesmo. Obrigada!", subHours(now, 5).valueOf() + 60000, p4),
        msg("fw4-6", "outgoing", "Confirmado! Aula de yoga amanha as 08:00 com a Renata. Namaste!", subHours(now, 5).valueOf(), p4),
      ],
    },
    {
      contactPhone: p5,
      contactName: "Thiago Almeida",
      lastMessage: "Diego, quero agendar minha avaliacao fisica. Quando posso ir?",
      lastTimestamp: subHours(now, 8).valueOf(),
      lastDirection: "incoming",
      unreadCount: 1,
      messages: [
        msg("fw5-1", "incoming", "Diego, quero agendar minha avaliacao fisica. Quando posso ir?", subHours(now, 8).valueOf(), p5),
      ],
    },
  ];
}

// ============================
// ESTETICA - Clinica Renova
// ============================
export function getEsteticaWhatsApp(): DemoWhatsAppConversation[] {
  const now = Date.now();
  const p1 = norm("51965550001"); // Renata Oliveira
  const p2 = norm("51965550003"); // Fabiana Lima
  const p3 = norm("51965550009"); // Simone Ribeiro
  const p4 = norm("51965550007"); // Marcelo Duarte
  const p5 = norm("51965550005"); // Gabriela Costa

  return [
    {
      contactPhone: p1,
      contactName: "Renata Oliveira",
      lastMessage: "Perfeito Renata! O microagulhamento de hoje vai complementar o peeling. Ate daqui a pouco!",
      lastTimestamp: subHours(now, 1).valueOf(),
      lastDirection: "outgoing",
      unreadCount: 0,
      messages: [
        msg("ew1-1", "incoming", "Dra. Isabela, o peeling que fiz semana passada ficou otimo! A pele ja ta mais uniforme", subDays(now, 3).valueOf(), p1),
        msg("ew1-2", "outgoing", "Renata! Que otimo saber! Seu protocolo trimestral ta funcionando perfeitamente. A proxima etapa e o microagulhamento.", subDays(now, 3).valueOf() + 300000, p1),
        msg("ew1-3", "incoming", "Quando e a proxima sessao?", subDays(now, 3).valueOf() + 600000, p1),
        msg("ew1-4", "outgoing", "Ja esta agendada pra hoje as 08:00. Lembrando: evite sol 48h antes e use protetor solar FPS 50.", subDays(now, 1).valueOf(), p1),
        msg("ew1-5", "incoming", "Perfeito! Ja estou usando o protetor que voce indicou. A pele ta reagindo super bem!", subDays(now, 1).valueOf() + 300000, p1),
        msg("ew1-6", "outgoing", "Maravilha! Sua pele e sensivel mas ta respondendo muito bem ao protocolo. Resultado surpreendente!", subHours(now, 3).valueOf(), p1),
        msg("ew1-7", "incoming", "Obrigada Dra! To muito feliz com os resultados. Ate hoje entao!", subHours(now, 2).valueOf(), p1),
        msg("ew1-8", "outgoing", "Perfeito Renata! O microagulhamento de hoje vai complementar o peeling. Ate daqui a pouco!", subHours(now, 1).valueOf(), p1),
      ],
    },
    {
      contactPhone: p2,
      contactName: "Fabiana Lima",
      lastMessage: "Confirmado! Botox hoje as 10:00 com Dra. Isabela. Lembre de nao tomar anti-inflamatorio antes.",
      lastTimestamp: subHours(now, 3).valueOf(),
      lastDirection: "outgoing",
      unreadCount: 0,
      messages: [
        msg("ew2-1", "incoming", "Oi! Ja faz 4 meses do ultimo botox. To vendo umas linhas voltando na testa", subDays(now, 5).valueOf(), p2),
        msg("ew2-2", "outgoing", "Oi Fabiana! Normal, o efeito dura em media 4-6 meses. Vamos agendar a reaplicacao?", subDays(now, 5).valueOf() + 300000, p2),
        msg("ew2-3", "incoming", "Sim! Quero agendar o mais rapido possivel", subDays(now, 5).valueOf() + 600000, p2),
        msg("ew2-4", "outgoing", "Tenho horario sexta as 10:00 com a Dra. Isabela. R$600 por area. Quantas areas quer fazer?", subDays(now, 4).valueOf(), p2),
        msg("ew2-5", "incoming", "Quero testa e pe de galinha, como sempre. Sexta ta otimo!", subDays(now, 4).valueOf() + 300000, p2),
        msg("ew2-6", "outgoing", "Perfeito! 2 areas, R$1.200. Lembrando: nao tome anti-inflamatorio nos 3 dias antes.", subDays(now, 3).valueOf(), p2),
        msg("ew2-7", "incoming", "Ok! Obrigada pela dica. Pode confirmar!", subDays(now, 2).valueOf(), p2),
        msg("ew2-8", "outgoing", "Confirmado! Botox hoje as 10:00 com Dra. Isabela. Lembre de nao tomar anti-inflamatorio antes.", subHours(now, 3).valueOf(), p2),
      ],
    },
    {
      contactPhone: p3,
      contactName: "Simone Ribeiro",
      lastMessage: "Quero agendar preenchimento labial e protocolo anti-idade. Quais as opcoes?",
      lastTimestamp: subHours(now, 2).valueOf(),
      lastDirection: "incoming",
      unreadCount: 1,
      messages: [
        msg("ew3-1", "incoming", "Boa tarde! Vi os resultados da amiga que fez preenchimento com voces. Ficou muito natural!", subDays(now, 1).valueOf(), p3),
        msg("ew3-2", "outgoing", "Oi Simone! Obrigada! A Dra. Isabela e referencia em preenchimento natural. Quer agendar uma avaliacao?", subDays(now, 1).valueOf() + 300000, p3),
        msg("ew3-3", "incoming", "Quero sim! Ja quero fazer o preenchimento e tambem aquele protocolo anti-idade completo", subDays(now, 1).valueOf() + 600000, p3),
        msg("ew3-4", "outgoing", "Otimo! O preenchimento labial e R$900 e o protocolo anti-idade R$350 (inclui vitamina C + microagulhamento + LED). Quer fazer os dois?", subDays(now, 1).valueOf() + 900000, p3),
        msg("ew3-5", "incoming", "Quero agendar preenchimento labial e protocolo anti-idade. Quais as opcoes?", subHours(now, 2).valueOf(), p3),
      ],
    },
    {
      contactPhone: p4,
      contactName: "Marcelo Duarte",
      lastMessage: "Obrigado! A limpeza de pele ficou excelente. Minha pele ta outra!",
      lastTimestamp: subDays(now, 1).valueOf(),
      lastDirection: "incoming",
      unreadCount: 0,
      messages: [
        msg("ew4-1", "outgoing", "Oi Marcelo! Obrigado por visitar a Clinica Renova! Como esta a pele apos a limpeza?", subDays(now, 8).valueOf() + 86400000, p4),
        msg("ew4-2", "incoming", "Oi Amanda! Ta otima, sem espinhas e bem menos oleosa!", subDays(now, 7).valueOf(), p4),
        msg("ew4-3", "outgoing", "Que bom! Lembre de manter a rotina de skincare que passamos: sabonete facial + tonico + hidratante oil-free + protetor.", subDays(now, 7).valueOf() + 300000, p4),
        msg("ew4-4", "incoming", "To seguindo direitinho! Quando e a proxima sessao?", subDays(now, 3).valueOf(), p4),
        msg("ew4-5", "outgoing", "A proxima limpeza ta agendada pra sexta as 14:00. Mantenha a rotina que os resultados vao ser ainda melhores!", subDays(now, 3).valueOf() + 300000, p4),
        msg("ew4-6", "incoming", "Obrigado! A limpeza de pele ficou excelente. Minha pele ta outra!", subDays(now, 1).valueOf(), p4),
      ],
    },
    {
      contactPhone: p5,
      contactName: "Gabriela Costa",
      lastMessage: "Quero agendar depilacao a laser na axila. Tem horario hoje?",
      lastTimestamp: subHours(now, 1).valueOf(),
      lastDirection: "incoming",
      unreadCount: 1,
      messages: [
        msg("ew5-1", "incoming", "Oi! Quero agendar depilacao a laser na axila. Tem horario hoje?", subHours(now, 1).valueOf(), p5),
      ],
    },
  ];
}
