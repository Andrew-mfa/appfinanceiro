import { type Category } from '@/types'

const RULES: Array<{ patterns: RegExp[]; category: Category }> = [
  {
    category: 'Alimentação',
    patterns: [
      /supermercado/i, /mercado\s/i, /ifood/i, /rappi/i, /restaurante/i,
      /lanchonete/i, /padaria/i, /a[çc]ougue/i, /pizzaria/i, /hamburguer/i,
      /burger/i, /sushi/i, /delivery/i, /alimenta/i, /hortifruti/i, /feira\s/i,
      /caf[eé]\s/i, /p[aã]o\s/i, /doce\s/i, /bolo\s/i, /sorveteria/i,
      /bar\s/i, /churrasco/i, /quiosque/i, /mercearia/i,
    ],
  },
  {
    category: 'Transporte',
    patterns: [
      /uber/i, /99pop/i, /99\s/i, /t[aá]xi/i, /metr[oô]/i, /[oô]nibus/i,
      /gasolina/i, /posto\s/i, /combust[ií]vel/i, /estacionamento/i,
      /ped[aá]gio/i, /transporte/i, /passagem/i, /lyft/i, /cabify/i,
      /buser/i, /rodo/i, /a[eé]reo/i, /passagem/i, /voo\s/i, /latam/i,
      /gol\s/i, /azul\s/i, /tap\s/i, /flixbus/i,
    ],
  },
  {
    category: 'Moradia',
    patterns: [
      /aluguel/i, /condom[ií]nio/i, /energia\s/i, /[áa]gua\s/i, /celesc/i,
      /enel/i, /g[aá]s\s/i, /internet/i, /net\s/i, /claro\s/i, /vivo\s/i,
      /tim\s/i, /\boi\b/i, /iptu/i, /moradia/i, /habita/i, /copasa/i,
      /sabesp/i, /comg[aá]s/i, /portaria/i, /contas\scasa/i, /manutenção/i,
    ],
  },
  {
    category: 'Lazer',
    patterns: [
      /netflix/i, /spotify/i, /cinema/i, /teatro/i, /ingresso/i, /disney/i,
      /amazon\sprime/i, /hbo/i, /steam/i, /playstation/i, /xbox/i, /lazer/i,
      /\bshow\b/i, /festival/i, /deezer/i, /youtube\spremium/i, /twitch/i,
      /gaming/i, /game\s/i, /jogo\s/i, /bilheteria/i, /parque/i, /museu/i,
      /academia/i, /crossfit/i, /natação/i, /clube/i,
    ],
  },
  {
    category: 'Saúde',
    patterns: [
      /farm[áa]cia/i, /drogaria/i, /hospital/i, /cl[íi]nica/i, /m[eé]dico/i,
      /dentista/i, /plano.sa[úu]de/i, /conv[eê]nio/i, /laborat[oó]rio/i,
      /exame/i, /consulta/i, /sa[úu]de/i, /unimed/i, /hapvida/i, /amil/i,
      /sulam[eé]rica/i, /bradesco\ssa[uú]de/i, /psic[oó]logo/i, /terapeuta/i,
      /fisioterapeuta/i, /ortopedista/i, /cardiologista/i, /rem[eé]dio/i,
      /medicamento/i, /vacina/i,
    ],
  },
  {
    category: 'Educação',
    patterns: [
      /escola/i, /faculdade/i, /universidade/i, /\bcurso\b/i, /udemy/i,
      /alura/i, /livro\s/i, /material.escolar/i, /mensalidade/i, /\bedu/i,
      /rocketseat/i, /coursera/i, /dio\./i, /origamid/i, /sebrae/i,
      /conteúdo/i, /ead\s/i, /plataforma\s/i, /apostila/i, /vestibular/i,
    ],
  },
  {
    category: 'Salário',
    patterns: [
      /sal[áa]rio/i, /pagamento\s/i, /folha\s/i, /holerite/i, /remunera/i,
      /\bclt\b/i, /empregador/i, /pag\s.*empresa/i, /pagto\s/i,
      /credit.*empregador/i, /sal[áa]rio\slíquido/i, /adiantamento/i,
    ],
  },
  {
    category: 'Freelance',
    patterns: [
      /freelance/i, /freela/i, /project/i, /servi[çc]o\sprestado/i,
      /honor[áa]rio/i, /aut[oô]nomo/i, /pix\srecebido/i, /transfer.*pix/i,
      /proposta/i, /contrato\s/i, /consultoria/i,
    ],
  },
]

export function autoCategorize(description: string): Category {
  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(description)) return rule.category
    }
  }
  return 'Outros'
}
