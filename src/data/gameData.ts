/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Country, Dogma, GameEvent } from '../types';

export const INITIAL_COUNTRIES: Country[] = [
  {
    id: 'usa',
    name: 'Estados Unidos',
    population: 335000000,
    converts: 120, // Start with a tiny pocket of believers
    resistance: 15,
    violence: 45,
    leaderInfiltration: 5,
    leaderName: 'Presidente Joseph',
    regimeType: 'democracia',
    specialTrait: 'Grande Mídia de Massa',
    specialTraitDesc: 'Canais de mídia de massa dão +30% de converts por pregação, mas democracias vigiam o ativismo agressivo.',
    coordinates: { x: 18, y: 35 }
  },
  {
    id: 'china',
    name: 'China',
    population: 1412000000,
    converts: 0,
    resistance: 55,
    violence: 25,
    leaderInfiltration: 0,
    leaderName: 'Secretário-Geral Jin',
    regimeType: 'opressor',
    specialTrait: 'Censura da Grande Muralha Digital',
    specialTraitDesc: 'Muito difícil penetrar no ciberespaço. Ações normais custam +50% de Fé, porém o fervor ganho em oposição é duplicado (+100%).',
    coordinates: { x: 82, y: 38 }
  },
  {
    id: 'india',
    name: 'Índia',
    population: 1408000000,
    converts: 0,
    resistance: 30,
    violence: 48,
    leaderInfiltration: 0,
    leaderName: 'Primeiro-Ministro Dev',
    regimeType: 'teocracia',
    specialTrait: 'Sincretismo Ancestral',
    specialTraitDesc: 'Prontidão para fés harmônicas. Seitas Sincretistas convertem 50% mais rápido, enquanto caminhos Místicos enfrentam desconfiança sectária.',
    coordinates: { x: 73, y: 48 }
  },
  {
    id: 'germany',
    name: 'Alemanha',
    population: 83000000,
    converts: 0,
    resistance: 22,
    violence: 18,
    leaderInfiltration: 0,
    leaderName: 'Chanceler Hans',
    regimeType: 'liberal',
    specialTrait: 'Sociedade Altamente Secular',
    specialTraitDesc: 'Dificuldade em engajar multidões com fé pura. Resistência cresce 15% mais rápido contra rituais exagerados.',
    coordinates: { x: 50, y: 25 }
  },
  {
    id: 'brazil',
    name: 'Brasil',
    population: 214000000,
    converts: 0,
    resistance: 10,
    violence: 60,
    leaderInfiltration: 0,
    leaderName: 'Presidente Silva',
    regimeType: 'vibrante',
    specialTrait: 'Fervor Natural',
    specialTraitDesc: 'O povo é profundamente espiritual. Conversão flui 40% mais rápido de forma orgânica, mas a alta criminalidade exige pacificação constante.',
    coordinates: { x: 33, y: 72 }
  },
  {
    id: 'russia',
    name: 'Rússia',
    population: 143000000,
    converts: 0,
    resistance: 40,
    violence: 52,
    leaderInfiltration: 0,
    leaderName: 'Governador Yuri',
    regimeType: 'autoritario',
    specialTrait: 'Nacionalismo Conservador',
    specialTraitDesc: 'Resistência severa a ideias de fora. No entanto, sua rígida hierarquia política torna as infiltrações de líderes surpreendentemente fortes (+25% efeito).',
    coordinates: { x: 68, y: 22 }
  },
  {
    id: 'egypt',
    name: 'Egito',
    population: 109000000,
    converts: 0,
    resistance: 45,
    violence: 36,
    leaderInfiltration: 0,
    leaderName: 'Ministro Tariq',
    regimeType: 'teocracia',
    specialTrait: 'Fronteiras Vigiadas',
    specialTraitDesc: 'Forte barreira militar e geopolítica. Reduz à metade a dispersão automática e a contaminação passiva por fronteiras terrestres.',
    coordinates: { x: 54, y: 50 }
  },
  {
    id: 'south_africa',
    name: 'África do Sul',
    population: 59000000,
    converts: 0,
    resistance: 18,
    violence: 68,
    leaderInfiltration: 0,
    leaderName: 'Líder Mandela II',
    regimeType: 'vibrante',
    specialTrait: 'Tensões Sociais e Desigualdade',
    specialTraitDesc: 'Fome de mudança social. Ações humanitárias e dogmas de caridade geram o triplo de impacto de conversão.',
    coordinates: { x: 56, y: 80 }
  },
  {
    id: 'japan',
    name: 'Japão',
    population: 125000000,
    converts: 0,
    resistance: 55,
    violence: 8,
    leaderInfiltration: 0,
    leaderName: 'Imperador Sato',
    regimeType: 'estavel',
    specialTrait: 'Ceticismo Tecnológico',
    specialTraitDesc: 'Cultura pragmática com violência quase zero. Exige 40% mais pontos de Fé para conversões, mas infiltrações políticas são facilitadas por ser uma burocracia focada.',
    coordinates: { x: 92, y: 34 }
  },
  {
    id: 'mexico',
    name: 'México',
    population: 126000000,
    converts: 0,
    resistance: 12,
    violence: 74,
    leaderInfiltration: 0,
    leaderName: 'Presidente Carlos',
    regimeType: 'vibrante',
    specialTrait: 'Crise de Cartéis',
    specialTraitDesc: 'Alta violência e medo. Pregadores que trouxerem paz ganham atenção imediata das comunidades locais.',
    coordinates: { x: 14, y: 50 }
  },
  {
    id: 'saudi_arabia',
    name: 'Arábia Saudita',
    population: 36000000,
    converts: 0,
    resistance: 75,
    violence: 22,
    leaderInfiltration: 0,
    leaderName: 'Rei Salman II',
    regimeType: 'teocracia',
    specialTrait: 'Fronteiras Ideológicas Herméticas',
    specialTraitDesc: 'Leis teocráticas impenetráveis. Missionários estrangeiros são banidos, gerando +150% de Fervor quando descobertos, mas a conversão base é de extrema dificuldade.',
    coordinates: { x: 63, y: 48 }
  },
  {
    id: 'australia',
    name: 'Austrália',
    population: 26000000,
    converts: 0,
    resistance: 18,
    violence: 15,
    leaderInfiltration: 0,
    leaderName: 'Premiê Oliver',
    regimeType: 'liberal',
    specialTrait: 'Isolamento de Fronteiras Marítimas',
    specialTraitDesc: 'Fronteiras insulares. Totalmente imune à conversão passiva internacional aérea/marítima. Deve ser ativamente ativada via missionário.',
    coordinates: { x: 88, y: 82 }
  }
];

export const INITIAL_DOGMAS: Dogma[] = [
  // UNIVERSAL DOGMAS
  {
    id: 'evangelismo_digital',
    name: 'Evangelismo Digital',
    description: 'Use redes sociais e streams para pregar de forma barata e atingir as massas secularizadas.',
    costFaith: 35,
    costFervor: 0,
    purchased: false,
    effect: 'Aumenta em 25% a taxa de conversão em países liberais e estáveis (como Alemanha, EUA, Japão).'
  },
  {
    id: 'caridade_global',
    name: 'Sopa Comunitária',
    description: 'Ofereça comida e ajuda humanitária direta aos fragilizados por crises.',
    costFaith: 40,
    costFervor: 0,
    purchased: false,
    effect: 'Reduz a violência em 20% em países com violência alta e adiciona conversão significativa instantaneamente.'
  },
  {
    id: 'templos_sociais',
    name: 'Templos-Abrigo',
    description: 'Seus locais de culto também funcionam como refúgio social e médico durante tribulações.',
    costFaith: 55,
    costFervor: 10,
    purchased: false,
    effect: 'Gera +5 Fé por ciclo e diminui a hostilidade das autoridades (Resistência decai 10% globalmente).'
  },
  {
    id: 'lobby_politico',
    name: 'Conselheiros Espirituais',
    description: 'Coloque representantes devotos nos círculos de poder e assessorias ministeriais.',
    costFaith: 70,
    costFervor: 20,
    purchased: false,
    effect: 'Duplica a velocidade de infiltração na mente dos governantes mundiais.'
  },

  // MÍSTICA (Mystic)
  {
    id: 'camino_santiago',
    name: 'Caminhos de Peregrinação',
    description: 'Crie grandes rotas místicas de caminhada espiritual carregadas de relíquias.',
    costFaith: 45,
    costFervor: 0,
    purchased: false,
    traitRequirement: 'Mistical',
    effect: 'Aumenta em 40% a dispersão automática em países com baixa resistência.'
  },
  {
    id: 'reliquias_sagradas',
    name: 'Relíquias Milagrosas',
    description: 'Anuncie a descoberta de artefatos antigos com suposto poder curativo e transcendente.',
    costFaith: 60,
    costFervor: 5,
    purchased: false,
    traitRequirement: 'Mistical',
    effect: 'Todos os eventos de "êxtase" místico geram +50% de Fé e +30 de Fervor imediato.'
  },
  {
    id: 'transcendencia_fisica',
    name: 'Rituais de Jejum e Êxtase',
    description: 'Proporcione vivências transcendentais comunitárias de êxtase devocional.',
    costFaith: 80,
    costFervor: 15,
    purchased: false,
    traitRequirement: 'Mistical',
    effect: 'Desbloqueia a ação ativa de Êxtase Coletivo, adicionando conversões em massa.'
  },
  {
    id: 'aura_iluminada',
    name: 'Corte Celestial',
    description: 'Eleve o líder religioso a uma figura divina que emana dons misticos inescapáveis.',
    costFaith: 110,
    costFervor: 30,
    purchased: false,
    traitRequirement: 'Mistical',
    effect: 'A infiltração de líderes gera um surto automático de conversão de 15% na população vizinha.'
  },

  // PROFÉTICA (Prophetic)
  {
    id: 'livro_revelacoes',
    name: 'O Livro das Revelações',
    description: 'Publique um texto profético descrevendo meticulosamente as angústias do fim dos tempos.',
    costFaith: 40,
    costFervor: 0,
    purchased: false,
    traitRequirement: 'Prophetic',
    effect: 'Revela com antecedência eventos futuros negativos e concede +15% de resistência à perseguição.'
  },
  {
    id: 'sinais_celestes',
    name: 'Leitura dos Sinais',
    description: 'Ensine que eclipses, cometas e crises financeiras são sinais nítidos da vontade divina.',
    costFaith: 60,
    costFervor: 10,
    purchased: false,
    traitRequirement: 'Prophetic',
    effect: 'Garante que crises econômicas e eventos de perseguição acelerem a conversão em 50%.'
  },
  {
    id: 'mensageiros_divinos',
    name: 'Oráculos Itinerantes',
    description: 'Profetas viajam proclamando avisos urgentes nas praças dos países populosos.',
    costFaith: 80,
    costFervor: 15,
    purchased: false,
    traitRequirement: 'Prophetic',
    effect: 'Aumenta drasticamente a taxa de conversão de grandes massas na China e na Índia.'
  },
  {
    id: 'reforma_escatologica',
    name: 'Grande Julgamento',
    description: 'Institua a certeza absoluta do julgamento iminente na mentalidade dos governantes.',
    costFaith: 120,
    costFervor: 25,
    purchased: false,
    traitRequirement: 'Prophetic',
    effect: 'Reduz o custo em fé da conversão de líderes políticos em 50% globalmente.'
  },

  // ATIVISTA (Activist)
  {
    id: 'comissoes_justica',
    name: 'Comissões de Direitos Humanos',
    description: 'Estabeleça conselhos de apoio jurídico para proteger perseguidos políticos e minorias.',
    costFaith: 40,
    costFervor: 5,
    purchased: false,
    traitRequirement: 'Activist',
    effect: 'Dobra a velocidade de conversão e infiltração em regimes opressores ou autoritários.'
  },
  {
    id: 'martires_revolucao',
    name: 'Culto aos Mártires',
    description: 'Transforme ativistas executados ou presos por governantes em santos heróicos.',
    costFaith: 30,
    costFervor: 30,
    purchased: false,
    traitRequirement: 'Activist',
    effect: 'Sempre que sua fé sofrer perseguição em regimes opressores, ganhe +150% de Fervor.'
  },
  {
    id: 'combate_corrupcao',
    name: 'Púlpitos Anticorrupção',
    description: 'Pregue abertamente contra o suborno e a exploração social das oligarquias.',
    costFaith: 75,
    costFervor: 15,
    purchased: false,
    traitRequirement: 'Activist',
    effect: 'Diminui a resistência das democracias liberais e consolida o fervor popular (+35%).'
  },
  {
    id: 'reconciliacao_nações',
    name: 'Ações de Paz Radical',
    description: 'Lidere desarmamento comunitário e mediação física entre facções rivais.',
    costFaith: 110,
    costFervor: 20,
    purchased: false,
    traitRequirement: 'Activist',
    effect: 'Assegura que a taxa de violência de qualquer país sob nossa influência caia instantaneamente para 10%.'
  },

  // SINCRETISTA (Syncretist)
  {
    id: 'comparatismo_teologico',
    name: 'Teologia da Harmonia',
    description: 'Declare que todos os deuses locais são avatares benignos da força mestre única.',
    costFaith: 35,
    costFervor: 0,
    purchased: false,
    traitRequirement: 'Syncretist',
    effect: 'Zera a penalidade de conversão inicial. Ganho de frentes iniciais facilitado.'
  },
  {
    id: 'festivais_sagrados',
    name: 'Sagração de Festas Locais',
    description: 'Fundir os festivais tradicionais (Natal, Hanukkah, Carnaval) em datas comemorativas unificadas.',
    costFaith: 60,
    costFervor: 5,
    purchased: false,
    traitRequirement: 'Syncretist',
    effect: 'Cada festival local dobra as taxas de conversão passiva, e a resistência global cai em 25%.'
  },
  {
    id: 'panteao_aberto',
    name: 'Templos de Muitas Portas',
    description: 'Permita estátuas e altares de santos tradicionais coexistirem nos seus templos.',
    costFaith: 80,
    costFervor: 10,
    purchased: false,
    traitRequirement: 'Syncretist',
    effect: 'A resistência máxima dos países nunca excederá 50% (como garantia doutrinária).'
  },
  {
    id: 'alianca_universal',
    name: 'Ecumenismo Imperial',
    description: 'Assine tratados de amizade teológica com os líderes conservadores das capitais mundiais.',
    costFaith: 115,
    costFervor: 15,
    purchased: false,
    traitRequirement: 'Syncretist',
    effect: 'O Iluminado (conversão de líderes) avança automaticamente 20% em todos os países.'
  }
];

export const RANDOM_EVENTS_POOL: GameEvent[] = [
  // GENERAL EVENTS
  {
    id: 'global_economic_crisis',
    title: 'Crise Financeira Global',
    description: 'A quebra imprevista de fundos de investimento gera recessão mundial, medo e insegurança.',
    impactType: 'neutral',
    actionEffects: {
      globalFaithMod: 15,
      countryViolenceMod: { usa: 15, mexico: 10, brazil: 10, south_africa: 15 }
    }
  },
  {
    id: 'world_peace_summit',
    title: 'Cúpula Mundial da Paz',
    description: 'Líderes internacionais reúnem-se e proclamam tratados de cooperação internacional temporária.',
    impactType: 'bonus',
    actionEffects: {
      countryViolenceMod: { usa: -15, germany: -10, china: -5, russia: -10 },
      countryResistanceMod: { germany: -10, usa: -5 }
    }
  },
  {
    id: 'border_restriction_clash',
    title: 'Fronteiras Blindadas',
    description: 'Devido a tensões geopolíticas, vários países fecham aeroportos e erguem defesas terrestres.',
    impactType: 'penalty',
    actionEffects: {
      countryResistanceMod: { egypt: 20, saudi_arabia: 15, australia: 25, germany: 10 }
    }
  },

  // MÍSTICA (Mystic-oriented events)
  {
    id: 'mystic_miracle',
    title: 'Milagre nas Astúrias',
    description: 'Peregrinos alegam visões arrebatadoras e curas milagrosas de males crônicos. O fervor atinge picos históricos.',
    impactType: 'ecstasy',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFaithMod: 40,
      globalFervorMod: 20,
      countryConvertsMod: { germany: 35000, usa: 150000, brazil: 1800000 }
    }
  },
  {
    id: 'mystic_vision',
    title: 'Estátua que Chora no México',
    description: 'Milhares viajam em procissão de êxtase para contemplar um efígie sagrada. Ciência falha em refutar.',
    impactType: 'ecstasy',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFaithMod: 30,
      countryConvertsMod: { mexico: 1400000, usa: 300000 },
      countryResistanceMod: { mexico: -15 }
    }
  },

  // PROFÉTICA (Prophetic-oriented events)
  {
    id: 'prophecy_eclipse',
    title: 'Grande Eclipse de Sangue se Alinha',
    description: 'Como anunciado meses atrás nos panfletos proféticos, a Lua cobre o Sol perfeitamente ao meio-dia. Multidões correm para converter-se!',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      globalFaithMod: 50,
      countryConvertsMod: { mexico: 2800000, brazil: 3500000, egypt: 800000, india: 4000000 }
    }
  },
  {
    id: 'prophecy_revelation',
    title: 'Profecia Alimentar se Cumpre',
    description: 'Secas severas anunciadas pelos profetas assolam lavouras na Ásia. Pragas confirmam o julgamento prenunciado.',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      globalFervorMod: 35,
      countryConvertsMod: { india: 5000000, china: 2000000 },
      countryResistanceMod: { india: -25, china: -10 }
    }
  },

  // ATIVISTA (Activist-oriented events)
  {
    id: 'activist_persecution_saudi',
    title: 'Prisões Arbitrárias em Riad',
    description: 'O governo teocrático local encarcera e pune publicamente pregadores que advogavam pela igualdade política.',
    impactType: 'persecution',
    traitRequirement: 'Activist',
    actionEffects: {
      globalFervorMod: 75,
      countryConvertsMod: { saudi_arabia: -100 },
      countryResistanceMod: { saudi_arabia: 15 }
    }
  },
  {
    id: 'activist_soup_solidarity',
    title: 'Cozinhas da Esperança em Johannesburg',
    description: 'Voluntários criam dezenas de refeitórios autogeridos alimentando famílias desabrigadas na África do Sul. Exemplo de ativismo civil.',
    impactType: 'bonus',
    traitRequirement: 'Activist',
    actionEffects: {
      globalFaithMod: 30,
      countryConvertsMod: { south_africa: 1500000, brazil: 800000 },
      countryViolenceMod: { south_africa: -25, brazil: -10 }
    }
  },

  // SINCRETISTA (Syncretist-oriented events)
  {
    id: 'syncretist_holiday_fusion',
    title: 'Mescla do Solstício',
    description: 'Líderes de comunidades e igrejas antigas nos EUA concordam em compartilhar celebrações em um rito conjunto.',
    impactType: 'bonus',
    traitRequirement: 'Syncretist',
    actionEffects: {
      globalFaithMod: 25,
      countryConvertsMod: { usa: 4500000, germany: 800000 },
      countryResistanceMod: { usa: -15, germany: -10 }
    }
  },
  {
    id: 'syncretist_temple_coexistence',
    title: 'Templos Compartilhados em Nova Déli',
    description: 'Um santuário hindu milenar abre um altar ecumênico para acomodar orações da nossa nova fé.',
    impactType: 'bonus',
    traitRequirement: 'Syncretist',
    actionEffects: {
      globalFaithMod: 30,
      countryConvertsMod: { india: 11000000 },
      countryResistanceMod: { india: -20 }
    }
  }
];
