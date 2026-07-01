/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Country, Dogma, GameEvent, DoctrineChoice } from '../types';

export const INITIAL_COUNTRIES: Country[] = [
  {
    id: 'usa',
    name: 'Estados Unidos',
    population: 335000000,
    converts: 120, // Start with a tiny pocket of believers
    resistance: 15,
    violence: 30,
    leaderInfiltration: 5,
    leaderName: 'Presidente Joseph',
    regimeType: 'democracia',
    specialTrait: 'Grande Mídia de Massa',
    specialTraitDesc: 'Canais de mídia de massa dão +30% de converts por pregação, mas democracias vigiam o ativismo agressivo.',
    coordinates: { x: 18, y: 35 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 1,
    lastConflictCycle: -99,
    localReligionStrength: 15,
    tags: ['Secular', 'Progressista'],
    lastActionCycle: 0,
    convertsHistory: []
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
    coordinates: { x: 82, y: 38 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 30,
    tags: ['Autoritário'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'india',
    name: 'Índia',
    population: 1408000000,
    converts: 0,
    resistance: 30,
    violence: 38,
    leaderInfiltration: 0,
    leaderName: 'Primeiro-Ministro Dev',
    regimeType: 'democracia',
    specialTrait: 'Sincretismo Ancestral',
    specialTraitDesc: 'Prontidão para fés harmônicas. Seitas Sincretistas convertem 50% mais rápido, enquanto caminhos Místicos enfrentam desconfiança sectária.',
    coordinates: { x: 73, y: 48 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 70,
    tags: ['Devoto', 'Tribal'],
    lastActionCycle: 0,
    convertsHistory: []
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
    coordinates: { x: 50, y: 25 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 10,
    tags: ['Secular', 'Progressista'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'brazil',
    name: 'Brasil',
    population: 214000000,
    converts: 0,
    resistance: 25,
    violence: 60,
    leaderInfiltration: 0,
    leaderName: 'Presidente Silva',
    regimeType: 'vibrante',
    specialTrait: 'Fervor Natural',
    specialTraitDesc: 'O povo é profundamente espiritual. Conversão flui 40% mais rápido de forma orgânica, mas a alta criminalidade exige pacificação constante.',
    coordinates: { x: 33, y: 72 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 45,
    tags: ['Devoto', 'Progressista'],
    lastActionCycle: 0,
    convertsHistory: []
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
    coordinates: { x: 68, y: 22 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 60,
    tags: ['Autoritário', 'Militarista'],
    lastActionCycle: 0,
    convertsHistory: []
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
    coordinates: { x: 54, y: 50 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 75,
    tags: ['Devoto', 'Tribal'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'south_africa',
    name: 'África do Sul',
    population: 59000000,
    converts: 0,
    resistance: 28,
    violence: 68,
    leaderInfiltration: 0,
    leaderName: 'Líder Mandela II',
    regimeType: 'vibrante',
    specialTrait: 'Tensões Sociais e Desigualdade',
    specialTraitDesc: 'Fome de mudança social. Ações humanitárias e dogmas de caridade geram o triplo de impacto de conversão.',
    coordinates: { x: 56, y: 80 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 50,
    tags: ['Devoto'],
    lastActionCycle: 0,
    convertsHistory: []
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
    coordinates: { x: 92, y: 34 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 50,
    tags: ['Secular'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'mexico',
    name: 'México',
    population: 126000000,
    converts: 0,
    resistance: 28,
    violence: 74,
    leaderInfiltration: 0,
    leaderName: 'Presidente Carlos',
    regimeType: 'vibrante',
    specialTrait: 'Crise de Cartéis',
    specialTraitDesc: 'Alta violência e medo. Pregadores que trouxerem paz ganham atenção imediata das comunidades locais.',
    coordinates: { x: 14, y: 50 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 45,
    tags: ['Devoto', 'Progressista'],
    lastActionCycle: 0,
    convertsHistory: []
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
    coordinates: { x: 63, y: 48 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 90,
    tags: ['Devoto', 'Autoritário'],
    lastActionCycle: 0,
    convertsHistory: []
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
    coordinates: { x: 88, y: 82 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 5,
    tags: ['Secular', 'Progressista'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'turkey',
    name: 'Turquia',
    population: 85000000,
    converts: 0,
    resistance: 48,
    violence: 30,
    leaderInfiltration: 0,
    leaderName: 'Presidente Kemal',
    regimeType: 'autoritario',
    specialTrait: 'Fronteira entre Mundos',
    specialTraitDesc: 'Posição geopolítica única entre Oriente e Ocidente. Converter a Turquia reduz a resistência do Egito e da Alemanha em 8% permanentemente.',
    coordinates: { x: 58, y: 36 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 65,
    tags: ['Devoto', 'Militarista'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'iran',
    name: 'Irã',
    population: 87000000,
    converts: 0,
    resistance: 80,
    violence: 45,
    leaderInfiltration: 0,
    leaderName: 'Aiatolá Rashidi',
    regimeType: 'teocracia',
    specialTrait: 'Teocracia Rival Ativa',
    specialTraitDesc: 'Possui estrutura religiosa própria que compete ativamente. Cada ciclo sem presença no Irã adiciona +0.3 de resistência em todos os países. Se convertido, esse efeito inverte.',
    coordinates: { x: 65, y: 44 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 95,
    tags: ['Devoto', 'Militarista'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'south_korea',
    name: 'Coreia do Sul',
    population: 52000000,
    converts: 0,
    resistance: 20,
    violence: 10,
    leaderInfiltration: 0,
    leaderName: 'Presidente Yoon',
    regimeType: 'liberal',
    specialTrait: 'Cultura Viral e Conectada',
    specialTraitDesc: 'A influência cultural sul-coreana alcança o mundo. Converter a Coreia do Sul dá +15% de conversão passiva no Japão e na Indonésia por ciclo.',
    coordinates: { x: 89, y: 30 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 30,
    tags: ['Secular', 'Progressista'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'indonesia',
    name: 'Indonésia',
    population: 277000000,
    converts: 0,
    resistance: 50,
    violence: 40,
    leaderInfiltration: 0,
    leaderName: 'Presidente Arief',
    regimeType: 'democracia',
    specialTrait: 'Maior Nação Islâmica do Mundo',
    specialTraitDesc: 'Resistência religiosa enraizada. Conversão base 30% mais lenta, mas quando supera 10% da população o crescimento se torna viral — +50% de conversão passiva.',
    coordinates: { x: 88, y: 62 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 80,
    tags: ['Devoto', 'Tribal'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'nigeria',
    name: 'Nigéria',
    population: 220000000,
    converts: 0,
    resistance: 30,
    violence: 65,
    leaderInfiltration: 0,
    leaderName: 'Presidente Emeka',
    regimeType: 'vibrante',
    specialTrait: 'Crescimento Demográfico Explosivo',
    specialTraitDesc: 'A população nigeriana cresce a cada ciclo. Converter agora vale mais no futuro — cada ciclo sem presença aumenta o potencial perdido.',
    coordinates: { x: 48, y: 60 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 60,
    tags: ['Devoto', 'Tribal'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'haiti',
    name: 'Haiti',
    population: 11500000,
    converts: 0,
    resistance: 18,
    violence: 78,
    leaderInfiltration: 0,
    leaderName: 'Presidente Conille',
    regimeType: 'vibrante',
    specialTrait: 'Povo em Busca de Esperança',
    specialTraitDesc: 'Extrema pobreza e caos criam receptividade imediata. Missões custam 50% menos de Fé, mas a alta violência destrói templos 2× mais rápido.',
    coordinates: { x: 22, y: 52 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 35,
    tags: ['Tribal', 'Progressista'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'ukraine',
    name: 'Ucrânia',
    population: 38000000,
    converts: 0,
    resistance: 35,
    violence: 72,
    leaderInfiltration: 0,
    leaderName: 'Presidente Volodymyr',
    regimeType: 'democracia',
    specialTrait: 'Nação em Guerra',
    specialTraitDesc: 'Tag Militarista regenera +0.3 violência/ciclo sempre. Enquanto a Rússia não for convertida, acrescenta +0.8/ciclo (total: +1.1). Ao converter a Rússia, o mecânico inverte para -0.5/ciclo (saldo real: -0.2).',
    coordinates: { x: 57, y: 26 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 55,
    tags: ['Militarista', 'Progressista'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'ethiopia',
    name: 'Etiópia',
    population: 125000000,
    converts: 0,
    resistance: 40,
    violence: 52,
    leaderInfiltration: 0,
    leaderName: 'Primeiro-Ministro Abebe',
    regimeType: 'autoritario',
    specialTrait: 'Terra das Igrejas Antigas',
    specialTraitDesc: 'Caminhos Místicos recebem +30% de crescimento pela afinidade espiritual ancestral. Caminhos Sincretistas encontram resistência religiosa crescente (+0.2 por ciclo).',
    coordinates: { x: 61, y: 63 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 75,
    tags: ['Devoto', 'Tribal'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'philippines',
    name: 'Filipinas',
    population: 115000000,
    converts: 0,
    resistance: 22,
    violence: 38,
    leaderInfiltration: 0,
    leaderName: 'Presidente Fernando',
    regimeType: 'democracia',
    specialTrait: 'Hub do Sudeste Asiático',
    specialTraitDesc: 'Quando o líder for convertido, a Indonésia e a Coreia do Sul recebem +1.5% de conversão por ciclo, irradiando fé pelo Pacífico.',
    coordinates: { x: 90, y: 50 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 40,
    tags: ['Devoto', 'Progressista'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'colombia',
    name: 'Colômbia',
    population: 52000000,
    converts: 0,
    resistance: 30,
    violence: 68,
    leaderInfiltration: 0,
    leaderName: 'Presidente Gustavo',
    regimeType: 'democracia',
    specialTrait: 'Terra de Contrastes',
    specialTraitDesc: 'Violência acima de 50 reduz o crescimento em 40%. Abaixo de 30, a conversão acelera 60%. Pacificar a Colômbia é transformar o caos em colheita.',
    coordinates: { x: 28, y: 68 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 40,
    tags: ['Devoto', 'Progressista'],
    lastActionCycle: 0,
    convertsHistory: []
  },
  {
    id: 'cuba',
    name: 'Cuba',
    population: 11000000,
    converts: 0,
    resistance: 62,
    violence: 20,
    leaderInfiltration: 0,
    leaderName: 'Presidente Díaz',
    regimeType: 'opressor',
    specialTrait: 'Culto Clandestino',
    specialTraitDesc: 'A cada 15 ciclos de presença, um encontro secreto ganha +30 fervor e converte 2% da população de uma vez. Quando o líder for convertido, a resistência cai a zero.',
    coordinates: { x: 23, y: 44 },
    missionariesSent: 0,
    temples: [0,0,0,0],
    templesBuilding: [0,0,0,0],
    templesBuildCycles: [0,0,0,0],
    templeSpec: null,
    cyclesPresent: 0,
    lastConflictCycle: -99,
    localReligionStrength: 30,
    tags: ['Secular', 'Tribal'],
    lastActionCycle: 0,
    convertsHistory: []
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
    phase: 1,
    effect: 'Aumenta em 25% a taxa de conversão em países liberais e estáveis (como Alemanha, EUA, Japão).'
  },
  {
    id: 'caridade_global',
    name: 'Sopa Comunitária',
    description: 'Ofereça comida e ajuda humanitária direta aos fragilizados por crises.',
    costFaith: 40,
    costFervor: 0,
    purchased: false,
    phase: 1,
    effect: 'Reduz a violência em 20% em países com violência alta e adiciona conversão significativa instantaneamente.'
  },
  {
    id: 'templos_sociais',
    name: 'Templos-Abrigo',
    description: 'Seus locais de culto também funcionam como refúgio social e médico durante tribulações.',
    costFaith: 55,
    costFervor: 10,
    purchased: false,
    phase: 1,
    effect: 'Gera +5 Fé por ciclo e diminui a hostilidade das autoridades (Resistência decai 10% globalmente).'
  },
  {
    id: 'lobby_politico',
    name: 'Conselheiros Espirituais',
    description: 'Coloque representantes devotos nos círculos de poder e assessorias ministeriais.',
    costFaith: 70,
    costFervor: 20,
    purchased: false,
    phase: 2,
    effect: 'Duplica a velocidade de infiltração na mente dos governantes mundiais.'
  },
  {
    id: 'radio_comunitaria',
    name: 'Rádio Comunitária',
    description: 'Transmita mensagens de esperança por emissoras locais e redes alternativas nos centros urbanos mais vibrantes.',
    costFaith: 45,
    costFervor: 0,
    purchased: false,
    phase: 1,
    effect: '+30% conversão em países com regime Vibrante (Brasil, México, África do Sul).'
  },
  {
    id: 'assistencia_medica',
    name: 'Assistência Médica',
    description: 'Leve enfermeiros e remédios às regiões mais esquecidas pela providência estatal.',
    costFaith: 50,
    costFervor: 0,
    purchased: false,
    phase: 1,
    effect: 'Reduz a violência em -2 por ciclo nos 2 países com maior violência do mundo.'
  },
  {
    id: 'embaixadas_fe',
    name: 'Embaixadas da Fé',
    description: 'Estabeleça escritórios de diálogo permanentes junto aos ministérios das nações mais hostis.',
    costFaith: 65,
    costFervor: 10,
    purchased: false,
    phase: 2,
    effect: 'A cada ciclo, o país com maior resistência perde -1 ponto automaticamente.'
  },
  {
    id: 'rede_ajuda_mutua',
    name: 'Rede de Ajuda Mútua',
    description: 'Crie uma rede de apoio entre comunidades carentes, fortalecendo laços horizontais de solidariedade.',
    costFaith: 45,
    costFervor: 5,
    purchased: false,
    phase: 2,
    effect: '+10% conversão em países com regime Vibrante ou Autoritário.'
  },
  {
    id: 'circulos_estudo',
    name: 'Círculos de Estudo',
    description: 'Promova debates abertos sobre textos sagrados em universidades e centros culturais das democracias.',
    costFaith: 40,
    costFervor: 0,
    purchased: false,
    phase: 1,
    effect: '+15% conversão em democracias; +5 Fé por ciclo.'
  },
  {
    id: 'jornadas_peregrinacao',
    name: 'Jornadas de Peregrinação',
    description: 'Organize caravanas de fiéis que percorrem o globo, levando a mensagem a todos os povos.',
    costFaith: 50,
    costFervor: 10,
    purchased: false,
    phase: 2,
    effect: '+30% na taxa de conversão global base em todos os países ativos.'
  },
  {
    id: 'clubes_jovens',
    name: 'Clubes de Jovens',
    description: 'Ofereça atividades esportivas e culturais para adolescentes nas periferias das grandes cidades vibrantes.',
    costFaith: 35,
    costFervor: 0,
    purchased: false,
    phase: 1,
    effect: '+25% conversão em países com regime Vibrante (Brasil, México, África do Sul).'
  },
  {
    id: 'selos_solidariedade',
    name: 'Selos de Solidariedade',
    description: 'Cunhe selos postais comemorativos que divulgam sua mensagem filantrópica nas sociedades mais letradas.',
    costFaith: 30,
    costFervor: 0,
    purchased: false,
    phase: 1,
    effect: '+5 Fé por ciclo; +10% conversão em países com alta alfabetização (liberal, estável, democracia).'
  },
  {
    id: 'guardioes_memoria',
    name: 'Guardiões da Memória',
    description: 'Crie arquivos históricos que preservam relatos de milagres e testemunhos de fé para as gerações futuras.',
    costFaith: 60,
    costFervor: 15,
    purchased: false,
    phase: 2,
    effect: 'Eventos do tipo Êxtase e Profecia geram +50% mais Fé quando ocorrem.'
  },
  {
    id: 'mercados_partilha',
    name: 'Mercados da Partilha',
    description: 'Incentive feiras livres onde fiéis trocam bens sem moeda, gerando capital social e espiritual.',
    costFaith: 55,
    costFervor: 0,
    purchased: false,
    phase: 2,
    effect: 'Ao ser comprado: -5 resistência em todos os países. Passivo: +3 Fé por ciclo.'
  },
  {
    id: 'liga_benfeitores',
    name: 'Liga dos Benfeitores',
    description: 'Una empresários convertidos em uma rede de financiamento ético para projetos sociais e espirituais.',
    costFaith: 80,
    costFervor: 20,
    purchased: false,
    phase: 3,
    effect: '+10 Fé por ciclo; reduz lentamente a resistência em países liberais e democráticos.'
  },

  // MÍSTICA (Mystic)
  {
    id: 'camino_santiago',
    name: 'Caminhos de Peregrinação',
    description: 'Crie grandes rotas místicas de caminhada espiritual carregadas de relíquias.',
    costFaith: 45,
    costFervor: 0,
    purchased: false,
    phase: 1,
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
    phase: 1,
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
    phase: 2,
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
    phase: 3,
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
    phase: 1,
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
    phase: 1,
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
    phase: 2,
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
    phase: 3,
    traitRequirement: 'Prophetic',
    effect: 'Reduz o custo em fé da conversão de líderes políticos em 50% globalmente.'
  },
  {
    id: 'cadernos_apocalipse',
    name: 'Cadernos do Apocalipse',
    description: 'Distribua panfletos com cálculos do fim dos tempos. A narrativa profética circula constantemente.',
    costFaith: 45,
    costFervor: 0,
    purchased: false,
    phase: 1,
    traitRequirement: 'Prophetic',
    effect: '+10% conversão global constante em todos os países ativos.'
  },
  {
    id: 'sinais_ceus',
    name: 'Sinais nos Céus',
    description: 'Instale observatórios populares que anunciam alinhamentos planetários como presságios divinos.',
    costFaith: 50,
    costFervor: 10,
    purchased: false,
    phase: 2,
    traitRequirement: 'Prophetic',
    effect: 'Sempre que um evento narrativo disparar, gera +20 Fervor adicional imediato.'
  },
  {
    id: 'profecia_seca',
    name: 'Profecia da Seca',
    description: 'Anuncie com exatidão o período de estiagem em regiões agrícolas, ganhando crédito quando se cumprir.',
    costFaith: 70,
    costFervor: 5,
    purchased: false,
    phase: 2,
    traitRequirement: 'Prophetic',
    effect: '+30% conversão em países agrícolas (Brasil, Índia, Egito, África do Sul).'
  },
  {
    id: 'rolos_fogo',
    name: 'Os Rolos de Fogo',
    description: 'Textos proféticos descrevem incêndios e catástrofes como anúncios divinos. Cada evento confirma a profecia.',
    costFaith: 85,
    costFervor: 15,
    purchased: false,
    phase: 2,
    traitRequirement: 'Prophetic',
    effect: 'No ciclo imediatamente após qualquer evento narrativo, conversão global aumenta em ×1.4.'
  },
  {
    id: 'vidente_nacoes',
    name: 'Vidente das Nações',
    description: 'Um líder profético viaja pelo mundo anunciando julgamento sobre governos corruptos.',
    costFaith: 90,
    costFervor: 10,
    purchased: false,
    phase: 2,
    traitRequirement: 'Prophetic',
    effect: 'Reduz em 25% o custo de Fé da ação de Infiltrar Líder em regimes opressores e autoritários.'
  },
  {
    id: 'relogio_juizo',
    name: 'Relógio do Juízo Final',
    description: 'Crie um contador público simbólico que mede o tempo até o colapso da civilização. A Ordem Tecnocrática recua.',
    costFaith: 70,
    costFervor: 15,
    purchased: false,
    phase: 2,
    traitRequirement: 'Prophetic',
    effect: '+15 Fervor por ciclo; a Ordem Tecnocrática avança 30% mais devagar.'
  },
  {
    id: 'arca_alianca_profetica',
    name: 'Arca da Aliança',
    description: 'Reconstrua uma suposta arca sagrada que, segundo a profecia, trará pragas se o mundo não se converter.',
    costFaith: 110,
    costFervor: 20,
    purchased: false,
    phase: 3,
    traitRequirement: 'Prophetic',
    effect: 'Ao ser comprado: -20 resistência em todos os países, mas +5 violência globalmente.'
  },
  {
    id: 'eco_trombetas',
    name: 'Eco das Trombetas',
    description: 'Toquem-se trombetas ritualísticas nas capitais ao amanhecer, recordando o apocalipse iminente.',
    costFaith: 65,
    costFervor: 15,
    purchased: false,
    phase: 2,
    traitRequirement: 'Prophetic',
    effect: '+25% conversão nos países mais populosos (China, Índia, EUA, Brasil).'
  },
  {
    id: 'pergaminho_terremotos',
    name: 'O Pergaminho dos Terremotos',
    description: 'Profetize abalos em falhas geológicas conhecidas. Quando desastres ocorrem, o fervor explode.',
    costFaith: 75,
    costFervor: 20,
    purchased: false,
    phase: 3,
    traitRequirement: 'Prophetic',
    effect: 'Quando eventos de penalidade ou neutros ocorrem, gera +40 Fervor adicional imediato.'
  },
  {
    id: 'cronicas_colapso',
    name: 'Crônicas do Colapso',
    description: 'Publique relatos de civilizações passadas que ruíram por desobediência espiritual. Democracias e teocracias vacilam.',
    costFaith: 95,
    costFervor: 10,
    purchased: false,
    phase: 3,
    traitRequirement: 'Prophetic',
    effect: 'Resistência de democracias e teocracias cai -1 por ciclo passivamente; +5 Fé por ciclo.'
  },
  {
    id: 'calice_redencao',
    name: 'Cálice da Redenção',
    description: 'Anuncie que quando o último governante incrédulo cair, a redenção se completará. Os 80% crentes aceleram o chamado.',
    costFaith: 150,
    costFervor: 40,
    purchased: false,
    phase: 3,
    traitRequirement: 'Prophetic',
    effect: 'Em qualquer país com mais de 80% de infiltração do líder, a conversão acelera em ×2.0.'
  },

  // ATIVISTA (Activist)
  {
    id: 'comissoes_justica',
    name: 'Comissões de Direitos Humanos',
    description: 'Estabeleça conselhos de apoio jurídico para proteger perseguidos políticos e minorias.',
    costFaith: 40,
    costFervor: 5,
    purchased: false,
    phase: 1,
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
    phase: 1,
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
    phase: 2,
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
    phase: 3,
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
    phase: 1,
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
    phase: 1,
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
    phase: 2,
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
    phase: 3,
    traitRequirement: 'Syncretist',
    effect: 'O Iluminado (conversão de líderes) avança automaticamente 20% em todos os países.'
  }
];

export const RANDOM_EVENTS_POOL: GameEvent[] = [

  // ── UNIVERSAIS (10) ──────────────────────────────────────────────────────────

  {
    id: 'universal_fronteiras_blindadas',
    title: 'Fronteiras Blindadas',
    description: 'Uma coalizão de países opressores fecha suas fronteiras para estrangeiros, alegando segurança nacional. Missionários são expulsos.',
    impactType: 'penalty',
    actionEffects: {
      globalFervorMod: 20,
      countryResistanceMod: { egypt: 25, saudi_arabia: 20, russia: 15, china: 15 }
    }
  },
  {
    id: 'universal_pandemia_silenciosa',
    title: 'Pandemia Silenciosa',
    description: 'Um vírus altamente contagioso se espalha pelo globo. Governos impõem quarentenas. O medo coletivo abre corações para a fé.',
    impactType: 'neutral',
    actionEffects: {
      countryConvertsMod: { usa: 24000, china: 90000, india: 90000, brazil: 12000, germany: 6000, russia: 9000 },
      countryResistanceMod: { china: 15, russia: 10, saudi_arabia: 10 }
    }
  },
  {
    id: 'universal_terremoto_megacidade',
    title: 'Terremoto em Megacidade',
    description: 'Um terremoto de magnitude 7,8 atinge uma grande metrópole, causando destruição e desamparo. A busca por sentido explode.',
    impactType: 'neutral',
    actionEffects: {
      globalFervorMod: 30,
      countryConvertsMod: { japan: 24000, mexico: 36000, usa: 12000 },
      countryViolenceMod: { japan: 15, mexico: 10 }
    }
  },
  {
    id: 'universal_tratado_desarmamento',
    title: 'Tratado de Desarmamento Nuclear',
    description: 'As maiores potências militares assinam um tratado histórico de redução de arsenais. O mundo respira aliviado e abre-se ao diálogo.',
    impactType: 'bonus',
    actionEffects: {
      globalFaithMod: 20,
      countryResistanceMod: { usa: -15, russia: -15, china: -10 }
    }
  },
  {
    id: 'universal_arqueologia_revolucionaria',
    title: 'Registro Arqueológico Revolucionário',
    description: 'Escavações na Mesopotâmia encontram tabletes de 5.000 anos que contradizem narrativas religiosas estabelecidas. O vácuo espiritual é imediato.',
    impactType: 'neutral',
    actionEffects: {
      countryConvertsMod: { usa: 18000, germany: 6000, egypt: 12000, india: 24000 },
      countryResistanceMod: { saudi_arabia: 10, russia: 8, china: 8 }
    }
  },
  {
    id: 'universal_furacao',
    title: 'Furacão de Categorias Múltiplas',
    description: 'Uma temporada recorde de furacões devasta o Caribe e o Golfo do México. Milhares de desabrigados clamam por respostas.',
    impactType: 'penalty',
    actionEffects: {
      globalFervorMod: 40,
      countryViolenceMod: { mexico: 25, usa: 15 },
      countryResistanceMod: { mexico: 15, usa: 10 }
    }
  },
  {
    id: 'universal_grande_debate',
    title: 'O Grande Debate',
    description: 'Uma transmissão internacional reúne pensadores para discutir fé e ciência. A audiência mundial questiona suas certezas.',
    impactType: 'neutral',
    actionEffects: {
      countryConvertsMod: { germany: 3000, usa: 12000, brazil: 9000 },
      countryResistanceMod: { egypt: 10, saudi_arabia: 10, india: 8 }
    }
  },
  {
    id: 'universal_marcha_aposentados',
    title: 'A Grande Marcha dos Aposentados',
    description: 'Milhões de idosos protestam contra cortes de pensões em capitais europeias. A repressão policial choca o mundo.',
    impactType: 'persecution',
    actionEffects: {
      globalFervorMod: 60,
      countryConvertsMod: { germany: 3000, russia: 6000 },
      countryResistanceMod: { germany: -12 }
    }
  },
  {
    id: 'universal_ilha_refugiados',
    title: 'A Ilha dos Refugiados Esquecidos',
    description: 'Uma ilha no Mediterrâneo abriga dezenas de milhares de refugiados à espera de acolhida. A comoção global abre fronteiras e corações.',
    impactType: 'bonus',
    actionEffects: {
      countryConvertsMod: { germany: 6000, egypt: 9000, south_africa: 6000 },
      countryResistanceMod: { germany: -15, egypt: -10, south_africa: -12 }
    }
  },
  {
    id: 'universal_fabrica_ocupada',
    title: 'A Fábrica Ocupada pelos Trabalhadores',
    description: 'Operários de uma fábrica ocupam as instalações após demissões em massa. O exército intervém. A indignação alimenta a busca espiritual.',
    impactType: 'persecution',
    actionEffects: {
      globalFervorMod: 40,
      countryConvertsMod: { india: 36000, china: 24000 },
      countryViolenceMod: { brazil: 5, mexico: 5, south_africa: 5 }
    }
  },

  // ── MÍSTICO (10) ─────────────────────────────────────────────────────────────

  {
    id: 'mystic_milagre_asturias',
    title: 'Milagre nas Astúrias',
    description: 'Uma fonte termal na Europa jorra água com propriedades curativas inexplicáveis. Peregrinos de todo o continente chegam em procissão.',
    impactType: 'ecstasy',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFaithMod: 40,
      globalFervorMod: 20,
      countryConvertsMod: { germany: 9000, usa: 18000, brazil: 36000 }
    }
  },
  {
    id: 'mystic_estatua_chora',
    title: 'Estátua que Chora no México',
    description: 'Milhares testemunham uma imagem sagrada derramando lágrimas de sangue. A ciência não consegue explicar. A comoção é global.',
    impactType: 'ecstasy',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFervorMod: 50,
      countryConvertsMod: { mexico: 90000, brazil: 114000, usa: 12000 },
      countryResistanceMod: { mexico: -10, brazil: -5, usa: -5, germany: -5, india: -5 }
    }
  },
  {
    id: 'mystic_arvore_deserto',
    title: 'A Árvore que Floresce no Deserto',
    description: 'No Saara, uma acácia completamente seca floresce da noite para o dia. Peregrinos acreditam ser um sinal divino inegável.',
    impactType: 'ecstasy',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFervorMod: 20,
      countryConvertsMod: { egypt: 24000, south_africa: 9000 },
      countryResistanceMod: { egypt: -12 }
    }
  },
  {
    id: 'mystic_cura_coletiva',
    title: 'Cura Coletiva em Santuário',
    description: 'Centenas de enfermos relatam curas instantâneas ao visitar um santuário misterioso. Médicos não encontram explicação.',
    impactType: 'ecstasy',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFaithMod: 50,
      countryResistanceMod: { germany: -12, australia: -8, usa: -8 }
    }
  },
  {
    id: 'mystic_sombra_dancante',
    title: 'A Sombra Dançante',
    description: 'Uma sombra inexplicável dança sobre uma cidade sagrada ao pôr do sol por sete dias. Teólogos do mundo divergem sobre o significado.',
    impactType: 'neutral',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFervorMod: 20,
      countryResistanceMod: { egypt: 8, saudi_arabia: 8, india: 5 }
    }
  },
  {
    id: 'mystic_reliquia_submersa',
    title: 'Relíquia Submersa',
    description: 'Pescadores encontram um antigo objeto sagrado no fundo do mar. O achado vira notícia mundial. Multidões buscam respostas.',
    impactType: 'ecstasy',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFaithMod: 15,
      countryConvertsMod: { japan: 18000, australia: 6000, usa: 12000, brazil: 24000 }
    }
  },
  {
    id: 'mystic_extase_passaros',
    title: 'O Êxtase dos Pássaros',
    description: 'Bandos de aves formam símbolos no céu durante uma semana inteira. Fenômeno sem explicação científica divide opiniões.',
    impactType: 'neutral',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFaithMod: 20,
      countryResistanceMod: { germany: 8, japan: 8, australia: 5 }
    }
  },
  {
    id: 'mystic_catedral_sal',
    title: 'A Catedral de Sal',
    description: 'Uma mina de sal revela uma formação natural que lembra perfeitamente uma catedral gótica. Peregrinos acorrem de todo o mundo.',
    impactType: 'ecstasy',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFervorMod: 25,
      countryConvertsMod: { russia: 24000, egypt: 12000, germany: 6000 }
    }
  },
  {
    id: 'mystic_aurora_vaticano',
    title: 'Aurora de Sangue',
    description: 'Durante uma tempestade solar, o céu se tinge de vermelho vivo por três noites seguidas sobre grandes cidades. Peregrinos chegam em massa.',
    impactType: 'ecstasy',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFervorMod: 30,
      countryConvertsMod: { usa: 12000, germany: 6000, brazil: 18000, south_africa: 6000 }
    }
  },
  {
    id: 'mystic_lago_vinho',
    title: 'O Lago que se Torna Vinho',
    description: 'Um pequeno lago adquire cor e sabor de vinho tinto por 40 dias. Cientistas não conseguem explicar. A peregrinação é imediata.',
    impactType: 'ecstasy',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFaithMod: 40,
      countryConvertsMod: { russia: 27000, egypt: 12000 },
      countryResistanceMod: { russia: -10 }
    }
  },

  // ── PROFÉTICO (10) ───────────────────────────────────────────────────────────

  {
    id: 'prophecy_eclipse_sangue',
    title: 'Grande Eclipse de Sangue',
    description: 'Um eclipse lunar avermelhado dura o dobro do normal. O fenômeno raro foi anunciado com meses de antecedência. Conversões explodem.',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      globalFaithMod: 50,
      countryConvertsMod: { mexico: 135000, brazil: 180000, india: 225000, egypt: 45000 },
      countryResistanceMod: { egypt: -20, saudi_arabia: -20, india: -15 }
    }
  },
  {
    id: 'prophecy_quebra_safra',
    title: 'Quebra na Safra de Trigo',
    description: 'Após meses de estiagem, colheitas fracassam em países do leste europeu. Pragas confirmam o julgamento prenunciado pelos profetas.',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      globalFaithMod: 35,
      countryConvertsMod: { russia: 90000, egypt: 24000, india: 45000 },
      countryResistanceMod: { russia: -15, egypt: -10 }
    }
  },
  {
    id: 'prophecy_tres_eclipses',
    title: 'O Eclipse das Três Luas',
    description: 'Três eclipses em uma mesma semana, fenômeno nunca registrado. Pânico espiritual global. Os profetas foram os únicos que previram.',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      globalFervorMod: 30,
      countryConvertsMod: { brazil: 180000, india: 225000, usa: 27000, germany: 9000 },
      countryResistanceMod: { egypt: 10, saudi_arabia: 10 }
    }
  },
  {
    id: 'prophecy_quebra_bolsa',
    title: 'A Quebra da Bolsa',
    description: 'Uma bolha financeira estoura em três continentes na mesma semana. Crise econômica súbita. O materialismo entra em colapso.',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      globalFaithMod: 30,
      countryResistanceMod: { usa: -15, germany: -12, australia: -10, japan: -12 }
    }
  },
  {
    id: 'prophecy_praga_silenciosa',
    title: 'A Praga Silenciosa',
    description: 'Uma doença que causa perda de voz por 40 dias ataca três capitais simultaneamente. O silêncio forçado leva populações à meditação.',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      globalFervorMod: 30,
      countryConvertsMod: { usa: 45000, germany: 12000, china: 90000 }
    }
  },
  {
    id: 'prophecy_rio_secou',
    title: 'O Rio que Secou e Renasceu',
    description: 'Um rio sagrado seca por três dias e, exatamente no quarto dia, volta a fluir com águas esverdeadas. Exatamente como foi profetizado.',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      countryConvertsMod: { egypt: 66000, saudi_arabia: 9000 },
      countryResistanceMod: { egypt: -10, saudi_arabia: -5 }
    }
  },
  {
    id: 'prophecy_sinal_noturno',
    title: 'O Sinal no Céu Noturno',
    description: 'Uma aurora boreal jamais vista naquela latitude surge na noite de um solstício. Astrônomos se calam. Os profetas já haviam avisado.',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      globalFaithMod: 20,
      countryConvertsMod: { usa: 24000, russia: 27000, germany: 9000, china: 45000 }
    }
  },
  {
    id: 'prophecy_fim_calendario',
    title: 'O Fim do Calendário',
    description: 'Uma reinterpretação de um calendário antigo viraliza nas redes. Multidões acreditam que o mundo se transformará — e os profetas confirmam.',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      globalFervorMod: 20,
      countryConvertsMod: { brazil: 66000, mexico: 36000, india: 45000 }
    }
  },
  {
    id: 'prophecy_estrela_deserto',
    title: 'A Estrela que Caiu no Deserto',
    description: 'Um meteoro cruza o céu e explode sobre o Saara, visível em três continentes. Nenhum astrônomo havia previsto. Os profetas, sim.',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      globalFervorMod: 20,
      countryConvertsMod: { egypt: 36000, south_africa: 18000, saudi_arabia: 6000 }
    }
  },
  {
    id: 'prophecy_ano_sem_verao',
    title: 'O Ano sem Verão',
    description: 'Uma erupção vulcânica lança cinzas à estratosfera. Colheitas fracassam no hemisfério norte. A fome acende o desespero espiritual.',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      countryConvertsMod: { russia: 66000, brazil: 90000, india: 114000, mexico: 27000 },
      countryResistanceMod: { egypt: 10, china: 10, russia: 8 }
    }
  },

  // ── ATIVISTA (10) ────────────────────────────────────────────────────────────

  {
    id: 'activist_greve_minerios',
    title: 'A Greve dos Minérios',
    description: 'Trabalhadores de minas param de extrair recursos para regimes opressores. A repressão é violenta. O mundo observa.',
    impactType: 'persecution',
    traitRequirement: 'Activist',
    actionEffects: {
      globalFervorMod: 50,
      countryResistanceMod: { china: 15, russia: 12, saudi_arabia: 10 }
    }
  },
  {
    id: 'activist_martir_mianmar',
    title: 'O Mártir',
    description: 'Um jovem ativista é executado publicamente por um regime autoritário. As imagens correm o mundo. A indignação é global.',
    impactType: 'persecution',
    traitRequirement: 'Activist',
    actionEffects: {
      globalFervorMod: 80,
      countryConvertsMod: { china: 45000, russia: 24000, egypt: 12000 }
    }
  },
  {
    id: 'activist_cozinhas_comunitarias',
    title: 'Cozinhas Comunitárias se Espalham',
    description: 'Uma rede independente de cozinhas comunitárias alimenta milhões por dia em cidades pobres. O ativismo humanitário ganha força.',
    impactType: 'bonus',
    traitRequirement: 'Activist',
    actionEffects: {
      globalFaithMod: 25,
      countryConvertsMod: { south_africa: 24000, brazil: 27000, india: 36000 },
      countryViolenceMod: { south_africa: -20, brazil: -15, mexico: -15 }
    }
  },
  {
    id: 'activist_voto_feminino',
    title: 'O Voto Feminino Sagrado',
    description: 'Movimentos feministas conquistam leis históricas de igualdade de gênero em três países. A mobilização popular atinge níveis nunca vistos.',
    impactType: 'bonus',
    traitRequirement: 'Activist',
    actionEffects: {
      countryConvertsMod: { usa: 27000, germany: 9000, australia: 6000 },
      countryResistanceMod: { germany: -10, usa: -8, australia: -8 }
    }
  },
  {
    id: 'activist_marcha_sem_teto',
    title: 'A Marcha dos Sem-Teto',
    description: 'Pessoas em situação de rua ocupam terras improdutivas em 12 cidades. Governos reagem com força bruta. O fervor dos oprimidos explode.',
    impactType: 'persecution',
    traitRequirement: 'Activist',
    actionEffects: {
      globalFervorMod: 60,
      countryConvertsMod: { south_africa: 18000, brazil: 24000, mexico: 18000 },
      countryViolenceMod: { brazil: 10, mexico: 10, south_africa: 10 }
    }
  },
  {
    id: 'activist_lei_anticorrupcao',
    title: 'Lei Anticorrupção Histórica',
    description: 'Parlamentos de quatro países aprovam uma lei rígida contra corrupção, inspirada em princípios de justiça social. A esperança renova a fé.',
    impactType: 'bonus',
    traitRequirement: 'Activist',
    actionEffects: {
      countryConvertsMod: { usa: 12000, germany: 6000, brazil: 9000, south_africa: 6000 },
      countryResistanceMod: { usa: -15, germany: -12, australia: -10 }
    }
  },
  {
    id: 'activist_crise_saneamento',
    title: 'Crise no Saneamento Básico',
    description: 'Surtos de cólera atingem cidades na África subsaariana. Governos locais colapsam. A urgência humanitária convoca ativistas de todo o mundo.',
    impactType: 'penalty',
    traitRequirement: 'Activist',
    actionEffects: {
      globalFervorMod: 30,
      countryResistanceMod: { south_africa: 20, egypt: 15 }
    }
  },
  {
    id: 'activist_pacto_aguas',
    title: 'O Pacto das Águas',
    description: 'Comunidades ribeirinhas organizam-se para proteger nascentes. Recebem apoio internacional e viram símbolo de resistência pacífica.',
    impactType: 'bonus',
    traitRequirement: 'Activist',
    actionEffects: {
      countryConvertsMod: { brazil: 66000 },
      countryViolenceMod: { brazil: -5 }
    }
  },
  {
    id: 'activist_greve_geral',
    title: 'Greve Geral no Leste Asiático',
    description: 'Milhões de trabalhadores param por 15 dias. A polícia prende líderes sindicais. A repressão alimenta o fervor dos que buscam justiça.',
    impactType: 'persecution',
    traitRequirement: 'Activist',
    actionEffects: {
      globalFervorMod: 45,
      countryConvertsMod: { japan: 18000, china: 27000 }
    }
  },
  {
    id: 'activist_tratado_comercio',
    title: 'Tratado de Livre Comércio Popular',
    description: 'Um bloco do sul global assina acordos que reduzem tarifas para produtos essenciais. A dignidade econômica fortalece a fé comunitária.',
    impactType: 'bonus',
    traitRequirement: 'Activist',
    actionEffects: {
      globalFaithMod: 15,
      countryConvertsMod: { brazil: 24000, south_africa: 9000, india: 18000, mexico: 12000 }
    }
  },

  // ── SINCRETISTA (10) ─────────────────────────────────────────────────────────

  {
    id: 'sync_mescla_solsticio',
    title: 'Mescla do Solstício',
    description: 'Uma celebração popular funde o solstício de inverno com rituais indígenas e elementos de várias tradições. Adotada em dezenas de países.',
    impactType: 'bonus',
    traitRequirement: 'Syncretist',
    actionEffects: {
      countryConvertsMod: { usa: 45000, germany: 12000, brazil: 45000, india: 66000 },
      countryResistanceMod: { usa: -5, germany: -8, brazil: -5, india: -5, australia: -5 }
    }
  },
  {
    id: 'sync_alianca_teologos',
    title: 'A Aliança dos Teólogos',
    description: 'Líderes de cinco tradições espirituais assinam um pacto de cooperação inter-religiosa. O ecumenismo avança em escala histórica.',
    impactType: 'bonus',
    traitRequirement: 'Syncretist',
    actionEffects: {
      globalFaithMod: 20,
      countryResistanceMod: { germany: -20, usa: -15, india: -15, brazil: -12, australia: -15 }
    }
  },
  {
    id: 'sync_museu_fes',
    title: 'O Museu das Fés',
    description: 'Um grande museu inter-religioso é inaugurado na Europa, com exposições permanentes de diversas tradições. Curiosidade espiritual aumenta.',
    impactType: 'bonus',
    traitRequirement: 'Syncretist',
    actionEffects: {
      countryConvertsMod: { germany: 12000, russia: 12000, usa: 9000 },
      countryResistanceMod: { germany: -10, usa: -5, australia: -5 }
    }
  },
  {
    id: 'sync_festival_luz',
    title: 'O Festival da Luz Mista',
    description: 'Um festival noturno mistura símbolos de diferentes crenças em 12 países. A adesão é massiva, mas conservadores protestam vigorosamente.',
    impactType: 'neutral',
    traitRequirement: 'Syncretist',
    actionEffects: {
      countryConvertsMod: { usa: 18000, germany: 6000, japan: 9000, brazil: 24000 },
      countryResistanceMod: { saudi_arabia: 8, egypt: 8, russia: 8 }
    }
  },
  {
    id: 'sync_livro_traducoes',
    title: 'O Livro das Mil Traduções',
    description: 'Editoras independentes traduzem textos sagrados antigos para centenas de línguas. O conhecimento espiritual torna-se acessível a todos.',
    impactType: 'bonus',
    traitRequirement: 'Syncretist',
    actionEffects: {
      globalFaithMod: 20,
      countryConvertsMod: { egypt: 12000, south_africa: 9000, australia: 6000, mexico: 12000 }
    }
  },
  {
    id: 'sync_tregua_templos',
    title: 'A Trégua dos Templos',
    description: 'Um acordo histórico permite que diferentes grupos espirituais compartilhem o mesmo complexo de templos em cidade sagrada. Paz rara.',
    impactType: 'neutral',
    traitRequirement: 'Syncretist',
    actionEffects: {
      globalFaithMod: 15,
      countryViolenceMod: { egypt: -20, saudi_arabia: -15 }
    }
  },
  {
    id: 'sync_sincretismo_pop',
    title: 'Sincretismo Pop',
    description: 'Artistas mundialmente famosos incorporam símbolos de várias tradições espirituais em shows e videoclipes. Jovens aderem em massa.',
    impactType: 'bonus',
    traitRequirement: 'Syncretist',
    actionEffects: {
      globalFervorMod: 10,
      countryConvertsMod: { usa: 36000, brazil: 45000, india: 66000, germany: 9000 }
    }
  },
  {
    id: 'sync_templo_subterraneo',
    title: 'O Templo Subterrâneo',
    description: 'Escavações encontram um templo com afrescos de três tradições espirituais antigas convivendo em harmonia. A história reescreve o presente.',
    impactType: 'bonus',
    traitRequirement: 'Syncretist',
    actionEffects: {
      globalFaithMod: 20,
      countryResistanceMod: { egypt: -15, saudi_arabia: -10, germany: -8 }
    }
  },
  {
    id: 'sync_casamento_real',
    title: 'O Casamento Real',
    description: 'O herdeiro de um trono europeu casa-se com uma plebeia de tradição distinta. O evento desafia conservadores e emociona o mundo.',
    impactType: 'neutral',
    traitRequirement: 'Syncretist',
    actionEffects: {
      countryConvertsMod: { usa: 12000, germany: 6000, australia: 6000, india: 18000 },
      countryViolenceMod: { saudi_arabia: 5, russia: 5, egypt: 5 }
    }
  },
  {
    id: 'sync_rede_dialogo',
    title: 'Rede de Diálogo Aberto',
    description: 'Uma rede de TV independente lança um programa que promove debates respeitosos entre visões de mundo distintas. O diálogo abre mentes.',
    impactType: 'bonus',
    traitRequirement: 'Syncretist',
    actionEffects: {
      globalFaithMod: 20,
      countryResistanceMod: { germany: -12, usa: -10, australia: -10, japan: -10 }
    }
  },

  // ── EVENTOS DE DEBUFF — PERDA DE DEVOTOS ─────────────────────────────────────

  {
    id: 'debuff_escandalo_conduta',
    title: 'Escândalo de Conduta',
    description: 'Líderes influentes da sua fé são expostos em casos de corrupção e abuso de poder. A confiança pública desaba nos países com maior presença.',
    impactType: 'penalty',
    actionEffects: {
      globalFervorMod: 25,
      countryConvertsModPct: { usa: -8, brazil: -8 },
      countryResistanceMod: { usa: 6, brazil: 6 }
    }
  },
  {
    id: 'debuff_campanha_desinformacao',
    title: 'Campanha de Desinformação',
    description: 'Uma rede coordenada de fake news espalha mentiras sobre sua doutrina em plataformas globais. A opinião pública se volta contra sua fé.',
    impactType: 'penalty',
    actionEffects: {
      globalFervorMod: 30,
      globalConvertsModPct: -8,
      countryResistanceMod: { usa: 8, germany: 8, australia: 6, japan: 6 }
    }
  },
  {
    id: 'debuff_decreto_fronteiras',
    title: 'Decreto de Fronteiras Fechadas',
    description: 'Governos de países opressores emitem decretos que expulsam pregadores estrangeiros e monitoram reuniões religiosas.',
    impactType: 'persecution',
    actionEffects: {
      globalFervorMod: 20,
      countryConvertsModPct: { china: -15, russia: -15, saudi_arabia: -15, egypt: -10 },
      countryResistanceMod: { china: 12, russia: 12, saudi_arabia: 10 }
    }
  },
  {
    id: 'debuff_reliquia_contestada',
    title: 'Relíquia Contestada',
    description: 'Uma relíquia amplamente venerada é exposta por historiadores como de origem duvidosa. Fiéis em todo o mundo se sentem traídos.',
    impactType: 'penalty',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFaithCostMod: -40,
      countryConvertsModPct: { brazil: -18, mexico: -18, russia: -15 },
      countryResistanceMod: { brazil: 10, mexico: 10, russia: 8 }
    }
  },
  {
    id: 'debuff_falha_extase',
    title: 'Falha no Êxtase',
    description: 'Um fenômeno místico esperado por milhares — luzes, curas, visões — não ocorre na data prevista. Fiéis se sentem enganados e abandonam a fé.',
    impactType: 'penalty',
    traitRequirement: 'Mistical',
    actionEffects: {
      globalFervorMod: 20,
      countryConvertsModPct: { usa: -12, germany: -12, australia: -10 },
      countryResistanceMod: { usa: 15, germany: 12, australia: 12 }
    }
  },
  {
    id: 'debuff_profecia_frustrada',
    title: 'Profecia Frustrada',
    description: 'Uma profecia de evento cósmico eminente falha em se concretizar. A zombaria internacional humilha o movimento profético.',
    impactType: 'penalty',
    traitRequirement: 'Prophetic',
    actionEffects: {
      globalFervorMod: 10,
      countryConvertsModPct: { brazil: -20, india: -20, mexico: -15, egypt: -15 },
      countryResistanceMod: { usa: 8, germany: 8, japan: 6, australia: 6 }
    }
  },
  {
    id: 'debuff_manuscrito_contraditor',
    title: 'Manuscrito Contraditório',
    description: 'Um texto antigo descoberto por acadêmicos contradiz ensinamentos centrais da doutrina. Teólogos entram em crise e a imprensa explora o debate.',
    impactType: 'penalty',
    traitRequirement: 'Prophetic',
    actionEffects: {
      globalFaithCostMod: -30,
      countryConvertsModPct: { germany: -12, japan: -12, usa: -10, australia: -10 }
    }
  },
  {
    id: 'debuff_repressao_sistemica',
    title: 'Repressão Sistêmica',
    description: 'Um governo opressor lança uma campanha nacional contra "seitas estrangeiras". Líderes locais são presos. O movimento é forçado à clandestinidade.',
    impactType: 'persecution',
    traitRequirement: 'Activist',
    actionEffects: {
      globalFervorMod: 90,
      countryConvertsModPct: { china: -20, russia: -15 },
      countryResistanceMod: { china: 20, russia: 18 }
    }
  },
  {
    id: 'debuff_ruptura_ideologica',
    title: 'Ruptura Ideológica',
    description: 'Facções internas divergem radicalmente sobre as táticas do movimento. A disputa pública afasta simpatizantes e enfraquece a base.',
    impactType: 'penalty',
    traitRequirement: 'Activist',
    actionEffects: {
      globalFaithCostMod: -20,
      globalConvertsModPct: -10,
      countryResistanceMod: { usa: 8, germany: 8, australia: 6 }
    }
  },
  {
    id: 'debuff_conflito_simbolos',
    title: 'Conflito de Símbolos',
    description: 'Comunidades tradicionais acusam publicamente sua fé de deturpar e apropriar seus rituais sagrados. O ressentimento se espalha rapidamente.',
    impactType: 'penalty',
    traitRequirement: 'Syncretist',
    actionEffects: {
      globalFervorMod: 12,
      countryConvertsModPct: { india: -20, egypt: -18, mexico: -15 },
      countryResistanceMod: { india: 18, egypt: 15, mexico: 12 }
    }
  },
  {
    id: 'debuff_cisma_doutrinario',
    title: 'Cisma Doutrinário',
    description: 'Um grupo de puristas rompe com a liderança central, acusando-a de trair a essência da fé. Formam uma seita rival que divide os fiéis.',
    impactType: 'penalty',
    traitRequirement: 'Syncretist',
    actionEffects: {
      globalFaithCostMod: -50,
      globalConvertsModPct: -12,
      countryResistanceMod: { usa: 10, germany: 8, australia: 8, japan: 8 }
    }
  }

];

export const INITIAL_DOCTRINES: DoctrineChoice[] = [
  // ── UNIVERSAIS 1–20 ──
  { id: 'doc_truth', topic: 'Verdade Religiosa', section: 'universal', tier: 'intermediate', chosen: null,
    optionA: { label: 'Exclusivismo', effectDesc: '+10% crescimento global, leve aumento de resistência em países abertos' },
    optionB: { label: 'Pluralismo', effectDesc: '−5 resistência em todos os países (imediato), +5% crescimento em regimes liberais' } },

  { id: 'doc_conversion', topic: 'Conversão', section: 'universal', tier: 'strategic', chosen: null,
    optionA: { label: 'Proselitismo Ativo', effectDesc: '+8% crescimento global permanente' },
    optionB: { label: 'Não-Proselitismo', effectDesc: '−30% crescimento, mas +3 Fé/ciclo passivo' } },

  { id: 'doc_violence', topic: 'Uso da Violência', section: 'universal', tier: 'intermediate', chosen: null,
    optionA: { label: 'Pacifismo', effectDesc: '−0.3 violência/ciclo em todos os países' },
    optionB: { label: 'Guerra Justa', effectDesc: '+15% crescimento em regimes opressores e autoritários' } },

  { id: 'doc_organization', topic: 'Organização Religiosa', section: 'universal', tier: 'strategic', chosen: null,
    optionA: { label: 'Hierarquia Forte', effectDesc: '+0.25 infiltração de líder/ciclo extra em todos os países' },
    optionB: { label: 'Autonomia Local', effectDesc: '−10% custo de missionários' } },

  { id: 'doc_state', topic: 'Relação com o Estado', section: 'universal', tier: 'strategic', chosen: null,
    optionA: { label: 'Religião Estatal', effectDesc: '+3 Fé/ciclo; +10 resistência em democracias (imediato)' },
    optionB: { label: 'Separação Estado-Religião', effectDesc: '−5 resistência global (imediato)' } },

  { id: 'doc_tradition', topic: 'Tradição', section: 'universal', tier: 'intermediate', chosen: null,
    optionA: { label: 'Tradicionalismo', effectDesc: '+5% crescimento em regimes estáveis e teocráticos' },
    optionB: { label: 'Reformismo', effectDesc: 'Barreira linguística encurta para 10 ciclos (era 15)' } },

  { id: 'doc_culture', topic: 'Cultura Local', section: 'universal', tier: 'intermediate', chosen: null,
    optionA: { label: 'Adaptação Cultural', effectDesc: 'Barreira linguística 30% mais fraca' },
    optionB: { label: 'Pureza Doutrinária', effectDesc: '+12% crescimento, mas barreira linguística 20% mais forte' } },

  { id: 'doc_economy', topic: 'Economia e Riqueza', section: 'universal', tier: 'intermediate', chosen: null,
    optionA: { label: 'Ascetismo', effectDesc: '+5 Fervor/ciclo' },
    optionB: { label: 'Teologia da Prosperidade', effectDesc: '+4 Fé/ciclo' } },

  { id: 'doc_salvation', topic: 'Salvação', section: 'universal', tier: 'intermediate', chosen: null,
    optionA: { label: 'Universalismo', effectDesc: 'Dispersão geográfica: chance sobe de 15% para 25%/ciclo' },
    optionB: { label: 'Particularismo', effectDesc: 'Apostasia −50%' } },

  { id: 'doc_destiny', topic: 'Destino Humano', section: 'universal', tier: 'basic', chosen: null,
    optionA: { label: 'Livre-Arbítrio', effectDesc: '+10% crescimento em regimes liberais e democracias' },
    optionB: { label: 'Predestinação', effectDesc: 'Fervor nunca cai abaixo de 5' } },

  { id: 'doc_leadership', topic: 'Liderança Espiritual', section: 'universal', tier: 'strategic', chosen: null,
    optionA: { label: 'Clero Profissional', effectDesc: '+0.3 infiltração de líder/ciclo extra' },
    optionB: { label: 'Sacerdócio Universal', effectDesc: '−15% custo de missionários' } },

  { id: 'doc_gender', topic: 'Papel da Mulher', section: 'universal', tier: 'intermediate', chosen: null,
    optionA: { label: 'Liderança Masculina', effectDesc: '+15% crescimento em regimes autoritários e teocracias' },
    optionB: { label: 'Igualdade Espiritual', effectDesc: '+10% crescimento em democracias, liberal e vibrante' } },

  { id: 'doc_science', topic: 'Relação com a Ciência', section: 'universal', tier: 'intermediate', chosen: null,
    optionA: { label: 'Literalismo', effectDesc: '+10% crescimento em regimes conservadores; +0.1 resistência/ciclo em liberais' },
    optionB: { label: 'Interpretação Simbólica', effectDesc: '−0.1 resistência/ciclo em democracias e liberais' } },

  { id: 'doc_afterlife', topic: 'Vida Após a Morte', section: 'universal', tier: 'basic', chosen: null,
    optionA: { label: 'Juízo Final', effectDesc: '+3 Fervor/ciclo quando resistência média global > 40%' },
    optionB: { label: 'Reencarnação/Ciclos', effectDesc: '−0.1 resistência/ciclo extra em todos os países' } },

  { id: 'doc_interfaith', topic: 'Relação com Outras Religiões', section: 'universal', tier: 'intermediate', chosen: null,
    optionA: { label: 'Tolerância Inter-religiosa', effectDesc: '−8 violência em todos os países (imediato)' },
    optionB: { label: 'Hostilidade Doutrinária', effectDesc: '+20% crescimento; +15 violência em todos os países (imediato)' } },

  { id: 'doc_morality', topic: 'Moral Social', section: 'universal', tier: 'intermediate', chosen: null,
    optionA: { label: 'Conservadorismo Moral', effectDesc: '+10% crescimento em regimes estáveis e autoritários' },
    optionB: { label: 'Progressismo Moral', effectDesc: '+10% crescimento em vibrante e liberal; −0.1 resistência nesses países/ciclo' } },

  { id: 'doc_charity', topic: 'Caridade', section: 'universal', tier: 'basic', chosen: null,
    optionA: { label: 'Caridade Obrigatória', effectDesc: '−0.5 violência/ciclo nos 2 países mais violentos' },
    optionB: { label: 'Caridade Voluntária', effectDesc: '+2 Fé/ciclo' } },

  { id: 'doc_ritual', topic: 'Ritual Religioso', section: 'universal', tier: 'basic', chosen: null,
    optionA: { label: 'Ritualismo Forte', effectDesc: '+8% crescimento; missionários custam +10 Fé' },
    optionB: { label: 'Espiritualidade Simples', effectDesc: 'Missionários −10 Fé; −5% crescimento' } },

  { id: 'doc_expansion', topic: 'Expansão Territorial', section: 'universal', tier: 'strategic', chosen: null,
    optionA: { label: 'Universalismo Missionário', effectDesc: '+10% crescimento global' },
    optionB: { label: 'Religião Étnica/Nacional', effectDesc: '+25% crescimento nos EUA; −20% nos demais países' } },

  { id: 'doc_authority', topic: 'Autoridade da Revelação', section: 'universal', tier: 'strategic', chosen: null,
    optionA: { label: 'Escritura Suprema', effectDesc: 'Apostasia −30%' },
    optionB: { label: 'Tradição Viva', effectDesc: '+0.5 infiltração de líder/ciclo em todos os países' } },

  // ── ESTRUTURA SOCIAL 21–30 ──
  { id: 'doc_family', topic: 'Estrutura Familiar', section: 'social', tier: 'basic', chosen: null,
    optionA: { label: 'Família Tradicional', effectDesc: '+10% crescimento em regimes autoritários e estáveis' },
    optionB: { label: 'Modelos Familiares Diversos', effectDesc: '+10% crescimento em vibrante, liberal e democracia' } },

  { id: 'doc_obedience', topic: 'Obediência à Autoridade', section: 'social', tier: 'intermediate', chosen: null,
    optionA: { label: 'Obediência Religiosa', effectDesc: '+0.4 infiltração de líder/ciclo' },
    optionB: { label: 'Consciência Individual', effectDesc: 'Apostasia −5% global' } },

  { id: 'doc_world', topic: 'Relação com o Mundo Material', section: 'social', tier: 'basic', chosen: null,
    optionA: { label: 'Mundo Transitório', effectDesc: '+4 Fervor/ciclo' },
    optionB: { label: 'Transformação do Mundo', effectDesc: '−0.4 violência/ciclo global' } },

  { id: 'doc_miracles', topic: 'Milagres', section: 'social', tier: 'basic', chosen: null,
    optionA: { label: 'Milagres Frequentes', effectDesc: '+20% crescimento no ciclo seguinte a qualquer evento narrativo' },
    optionB: { label: 'Milagres Raros', effectDesc: '+5 Fé/ciclo passivo' } },

  { id: 'doc_education', topic: 'Educação Religiosa', section: 'social', tier: 'basic', chosen: null,
    optionA: { label: 'Educação Obrigatória', effectDesc: 'Barreira linguística encurta para 10 ciclos' },
    optionB: { label: 'Educação Opcional', effectDesc: 'Missionários −10 Fé' } },

  { id: 'doc_unity', topic: 'Unidade da Fé', section: 'social', tier: 'intermediate', chosen: null,
    optionA: { label: 'Unidade Doutrinária', effectDesc: 'Apostasia −40%' },
    optionB: { label: 'Diversidade Interna', effectDesc: '−0.1 resistência/ciclo; +5% crescimento' } },

  { id: 'doc_human_nature', topic: 'Natureza Humana', section: 'social', tier: 'basic', chosen: null,
    optionA: { label: 'Natureza Corrompida', effectDesc: '+3 Fervor/ciclo quando algum país tem violência > 50%' },
    optionB: { label: 'Natureza Virtuosa', effectDesc: '−0.2 violência/ciclo em todos os países' } },

  { id: 'doc_cultures', topic: 'Relação com Outras Culturas', section: 'social', tier: 'intermediate', chosen: null,
    optionA: { label: 'Assimilação Cultural', effectDesc: 'Obstáculos de barreira e tradição 50% mais fracos' },
    optionB: { label: 'Multiculturalismo Religioso', effectDesc: '−10 resistência em todos os países (imediato)' } },

  { id: 'doc_gov_ideal', topic: 'Governo Ideal', section: 'social', tier: 'strategic', chosen: null,
    optionA: { label: 'Teocracia', effectDesc: '+30% crescimento em teocracias; +20% em autoritários' },
    optionB: { label: 'Governo Secular', effectDesc: '−0.1 resistência/ciclo em democracias, liberal e estável' } },

  { id: 'doc_moral_source', topic: 'Fonte da Moral', section: 'social', tier: 'strategic', chosen: null,
    optionA: { label: 'Mandamento Divino', effectDesc: 'Rival progride 20% mais lento' },
    optionB: { label: 'Ética Racional', effectDesc: '+5% crescimento em regimes liberais, estáveis e democracias' } },
];
