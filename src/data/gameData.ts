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
      countryConvertsMod: { usa: 500000, china: 2000000, india: 2000000, brazil: 300000, germany: 100000, russia: 200000 },
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
      countryConvertsMod: { japan: 500000, mexico: 800000, usa: 300000 },
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
      countryConvertsMod: { usa: 400000, germany: 150000, egypt: 300000, india: 500000 },
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
      countryConvertsMod: { germany: 80000, usa: 300000, brazil: 200000 },
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
      countryConvertsMod: { germany: 60000, russia: 100000 },
      countryResistanceMod: { germany: -12 }
    }
  },
  {
    id: 'universal_ilha_refugiados',
    title: 'A Ilha dos Refugiados Esquecidos',
    description: 'Uma ilha no Mediterrâneo abriga dezenas de milhares de refugiados à espera de acolhida. A comoção global abre fronteiras e corações.',
    impactType: 'bonus',
    actionEffects: {
      countryConvertsMod: { germany: 100000, egypt: 200000, south_africa: 150000 },
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
      countryConvertsMod: { india: 800000, china: 500000 },
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
      countryConvertsMod: { germany: 200000, usa: 400000, brazil: 800000 }
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
      countryConvertsMod: { mexico: 2000000, brazil: 2500000, usa: 300000 },
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
      countryConvertsMod: { egypt: 500000, south_africa: 200000 },
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
      countryConvertsMod: { japan: 400000, australia: 150000, usa: 300000, brazil: 500000 }
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
      countryConvertsMod: { russia: 500000, egypt: 300000, germany: 100000 }
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
      countryConvertsMod: { usa: 300000, germany: 150000, brazil: 400000, south_africa: 100000 }
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
      countryConvertsMod: { russia: 600000, egypt: 250000 },
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
      countryConvertsMod: { mexico: 3000000, brazil: 4000000, india: 5000000, egypt: 1000000 },
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
      countryConvertsMod: { russia: 2000000, egypt: 500000, india: 1000000 },
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
      countryConvertsMod: { brazil: 4000000, india: 5000000, usa: 600000, germany: 200000 },
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
      countryConvertsMod: { usa: 1000000, germany: 300000, china: 2000000 }
    }
  },
  {
    id: 'prophecy_rio_secou',
    title: 'O Rio que Secou e Renasceu',
    description: 'Um rio sagrado seca por três dias e, exatamente no quarto dia, volta a fluir com águas esverdeadas. Exatamente como foi profetizado.',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      countryConvertsMod: { egypt: 1500000, saudi_arabia: 200000 },
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
      countryConvertsMod: { usa: 500000, russia: 600000, germany: 200000, china: 1000000 }
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
      countryConvertsMod: { brazil: 1500000, mexico: 800000, india: 1000000 }
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
      countryConvertsMod: { egypt: 800000, south_africa: 400000, saudi_arabia: 150000 }
    }
  },
  {
    id: 'prophecy_ano_sem_verao',
    title: 'O Ano sem Verão',
    description: 'Uma erupção vulcânica lança cinzas à estratosfera. Colheitas fracassam no hemisfério norte. A fome acende o desespero espiritual.',
    impactType: 'prophecy',
    traitRequirement: 'Prophetic',
    actionEffects: {
      countryConvertsMod: { russia: 1500000, brazil: 2000000, india: 2500000, mexico: 600000 },
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
      countryConvertsMod: { china: 1000000, russia: 500000, egypt: 300000 }
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
      countryConvertsMod: { south_africa: 500000, brazil: 600000, india: 800000 },
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
      countryConvertsMod: { usa: 600000, germany: 200000, australia: 150000 },
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
      countryConvertsMod: { south_africa: 400000, brazil: 500000, mexico: 400000 },
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
      countryConvertsMod: { usa: 300000, germany: 100000, brazil: 200000, south_africa: 100000 },
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
      countryConvertsMod: { brazil: 1500000 },
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
      countryConvertsMod: { japan: 400000, china: 600000 }
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
      countryConvertsMod: { brazil: 500000, south_africa: 200000, india: 400000, mexico: 300000 }
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
      countryConvertsMod: { usa: 1000000, germany: 300000, brazil: 1000000, india: 1500000 },
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
      countryConvertsMod: { germany: 300000, russia: 300000, usa: 200000 },
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
      countryConvertsMod: { usa: 400000, germany: 150000, japan: 200000, brazil: 500000 },
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
      countryConvertsMod: { egypt: 300000, south_africa: 200000, australia: 100000, mexico: 300000 }
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
      countryConvertsMod: { usa: 800000, brazil: 1000000, india: 1500000, germany: 200000 }
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
      countryConvertsMod: { usa: 300000, germany: 100000, australia: 100000, india: 400000 },
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
  }

];
