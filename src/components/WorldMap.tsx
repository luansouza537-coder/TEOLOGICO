/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Country, ReligionTrait } from '../types';
import { Crosshair, ShieldAlert, HeartHandshake, Skull, Crown, Star, Network, Building2 } from 'lucide-react';
import { calcPeaceEffectiveness } from '../utils/peaceEffectiveness';

const COUNTRY_LORE: Record<string, string> = {
  usa: 'A maior potência ocidental vive uma guerra cultural interna. Evangelicalismo, ateísmo progressista e ceticismo tecnológico disputam corações num país de 335 milhões de almas fragmentadas. A liberdade religiosa abre portas — mas a mídia corporativa amplifica qualquer escândalo ao extremo.',
  china: 'O Partido controla cada palavra impressa e cada culto autorizado. Sob a superfície do ateísmo estatal, milhões buscam em segredo algo além do materialismo oficial. A Grande Muralha Digital filtra tudo — mas o sussurro da fé viaja por canais que nenhum algoritmo enxerga.',
  india: 'Terra dos mil deuses, onde espiritualidade é o ar que se respira. O sincretismo ancestral absorve novas doutrinas como rio absorve afluentes — mas as tensões entre castas, o nacionalismo hindu e a violência sectária transformam cada pregação num ato político.',
  germany: 'Sociedade laicizada pela razão iluminista e dois séculos de ceticismo filosófico. As igrejas esvaziam; os jovens buscam propósito em algoritmos e ideologias pós-modernas. Quem conseguir oferecer sentido sem dogmatismo excessivo encontrará solo fértil.',
  brazil: 'A nação mais espiritualmente intensa do planeta. Candomblé, catolicismo barroco e pentecostalismo explosivo convivem nas mesmas favelas. A criminalidade é cicatriz profunda — mas em cada beco existe uma comunidade de fé esperando por uma voz que faça sentido do caos.',
  russia: 'Alma eslava moldada por séculos de Ortodoxia e décadas de ateísmo soviético. O Kremlin usa a religião como instrumento de coesão nacional — qualquer doutrina estrangeira é vista como espionagem ideológica. Mas o povo russo, no fundo, anseia pelo transcendente.',
  egypt: 'Encruzilhada de civilizações onde cada pedra guarda memória de deus. O Islã estrutura a vida pública, mas a modernidade corrói antigas certezas. As fronteiras militares e ideológicas são muralhas — porém as tradições sufi e as crises econômicas criam fissuras invisíveis.',
  south_africa: 'País marcado pela ferida aberta do apartheid e pela desigualdade que persiste em cada favela e mansão. A espiritualidade é coluna vertebral das comunidades — quem chegar com cura e justiça social encontrará multidões dispostas a ouvir e a seguir.',
  japan: 'Civilização de precisão e silêncio interior. O Shintoísmo e o Budismo zen permeiam a cultura sem proclamações barulhentas. A fé aqui é privada, estética, quase silenciosa. Converter o Japão exige paciência monástica — mas sua influência cultural irradia pelo mundo inteiro.',
  mexico: 'Terra da Virgem de Guadalupe e dos cartéis. O catolicismo popular é identidade, não apenas crença — mas a violência sistemática do crime organizado corrói a esperança. Uma religião que ofereça proteção espiritual concreta e paz comunitária pode varrer o país em meses.',
  saudi_arabia: 'Coração do Islã sunita e guardião das cidades sagradas. As leis teocráticas são muralhas de aço. Qualquer sinal de apostasia pode custar a vida. E ainda assim, sob a superfície de ouro negro e austeridade wahabita, uma juventude silenciosa questiona tudo que lhe foi ensinado.',
  australia: 'Continente-ilha de pragmatismo anglo-saxão e multiculturalismo vibrante. A distância geográfica criou uma cultura autossuficiente e refratária a entusiasmos religiosos importados. Mas a solidão do interior imenso e a busca por identidade abrem janelas que o racional não fecha.',
};

import WorldMapFlat from './WorldMapFlat';

const CONTINENTS = [
  {
    id: 'na',
    name: 'América do Norte',
    path: 'M 40,110 L 50,105 L 70,115 L 80,105 L 120,95 L 150,90 L 180,95 L 200,80 L 220,100 L 240,90 L 255,105 L 270,100 L 290,115 L 285,135 L 270,140 L 260,165 L 275,175 L 255,190 L 248,225 L 235,230 L 230,220 L 210,225 L 195,245 L 184,260 L 165,285 L 150,290 L 146,280 L 156,260 L 130,250 L 115,225 L 105,215 L 110,195 L 125,188 L 115,165 L 90,145 L 75,135 L 50,130 L 35,120 Z'
  },
  {
    id: 'gl',
    name: 'Groenlândia',
    path: 'M 290,50 L 340,40 L 360,55 L 345,85 L 315,95 L 295,75 Z'
  },
  {
    id: 'sa',
    name: 'América do Sul',
    path: 'M 170,290 L 190,285 L 220,285 L 248,310 L 275,320 L 315,315 L 335,325 L 345,345 L 330,380 L 300,420 L 270,450 L 255,475 L 245,475 L 240,440 L 230,410 L 212,380 L 192,350 L 175,325 Z'
  },
  {
    id: 'af',
    name: 'África',
    path: 'M 380,210 L 410,205 L 435,215 L 480,215 L 525,230 L 540,245 L 536,260 L 518,265 L 528,285 L 552,310 L 565,340 L 555,370 L 535,405 L 515,420 L 495,415 L 485,395 L 475,370 L 450,335 L 420,315 L 395,302 L 375,285 L 365,260 L 355,235 Z'
  },
  {
    id: 'eu',
    name: 'Europa',
    path: 'M 385,200 L 375,185 L 362,175 L 355,150 L 365,125 L 380,120 L 398,135 L 415,145 L 440,150 L 450,140 L 430,125 L 410,110 L 412,90 L 430,85 L 455,95 L 485,100 L 495,115 L 520,120 L 535,135 L 518,155 L 492,170 L 455,185 L 430,190 Z'
  },
  {
    id: 'as',
    name: 'Ásia',
    path: 'M 495,115 L 520,120 L 540,110 L 580,105 L 630,95 L 680,100 L 730,90 L 780,100 L 830,95 L 880,105 L 900,120 L 920,145 L 910,170 L 895,185 L 865,205 L 845,225 L 830,245 L 820,255 L 802,245 L 795,225 L 778,215 L 760,230 L 748,255 L 732,260 L 720,242 L 705,230 L 690,245 L 675,255 L 655,250 L 640,235 L 610,235 L 590,215 L 575,230 L 550,230 L 535,210 Z'
  },
  {
    id: 'au',
    name: 'Austrália',
    path: 'M 810,360 L 840,345 L 885,348 L 915,365 L 925,395 L 890,418 L 845,415 L 815,395 Z'
  },
  {
    id: 'md',
    name: 'Madagascar',
    path: 'M 575,365 L 585,360 L 582,390 L 572,385 Z'
  },
  {
    id: 'jp',
    name: 'Japão',
    path: 'M 915,145 L 925,150 L 920,175 L 910,170 Z'
  },
  {
    id: 'ant',
    name: 'Antártida',
    path: 'M 100,480 L 200,475 L 300,478 L 400,475 L 500,480 L 600,475 L 700,478 L 800,475 L 900,480 L 950,478 L 950,495 L 50,495 Z'
  }
];

interface WorldMapProps {
  countries: Country[];
  selectedCountryId: string | null;
  onSelectCountry: (id: string) => void;
  faith: number;
  fervor: number;
  tithe: number;
  trait: ReligionTrait;
  onSendMissionary: (countryId: string) => void;
  onPacifyCountry: (countryId: string, tier: 1 | 2 | 3) => void;
  onInfiltrateLeader: (countryId: string) => void;
  onPerformEcstasyRitual: (countryId: string) => void;
  onOpenTemple: (countryId: string) => void;
  totalTemples: number;
  templeCosts: { faith: number; fervor: number; tithe: number }[];
  templeNames: Record<string, string[]>;
  floatingTexts?: { id: number; text: string; x: number; y: number; colorClass: string; countryId?: string }[];
}

export default function WorldMap({
  countries,
  selectedCountryId,
  onSelectCountry,
  faith,
  fervor,
  tithe,
  trait,
  onSendMissionary,
  onPacifyCountry,
  onInfiltrateLeader,
  onPerformEcstasyRitual,
  onOpenTemple,
  totalTemples,
  templeCosts,
  templeNames,
  floatingTexts = []
}: WorldMapProps) {
  const selectedCountry = countries.find((c) => c.id === selectedCountryId);

  // Cost calculation helpers
  const getMissionaryCost = (c: Country) => {
    let base = 30;
    // Japan is highly secularized, China has censorship
    if (c.id === 'japan') base += 15;
    if (c.id === 'china') base += 20;
    if (c.id === 'saudi_arabia') base += 25;
    // Escalating cost per missionary already sent (mirrors App.tsx logic)
    base += (c.missionariesSent ?? 0) * 15;
    return base;
  };

  const LEADER_STAGES_UI = [
    { label: 'Ciente',       min: 0,  max: 25,  faith: 150, fervor: 0,   convertPct: 0.15, globalTemples: 5,  cyclesPresent: 0,  templeLevel: 0 },
    { label: 'Simpático',    min: 25, max: 50,  faith: 300, fervor: 300, convertPct: 0.30, globalTemples: 15, cyclesPresent: 10, templeLevel: 0 },
    { label: 'Comprometido', min: 50, max: 75,  faith: 500, fervor: 500, convertPct: 0.45, globalTemples: 25, cyclesPresent: 0,  templeLevel: 1 },
    { label: 'Convertido',   min: 75, max: 100, faith: 700, fervor: 700, convertPct: 0.60, globalTemples: 35, cyclesPresent: 0,  templeLevel: 2 },
  ];
  const SUPERPOWER_IDS_UI = ['usa', 'china', 'india', 'germany'];
  const SUCCESS_RATES_UI: Record<string, number[]> = {
    opressor:    [0.45, 0.30, 0.20, 0.10],
    autoritario: [0.65, 0.50, 0.35, 0.20],
    teocracia:   [0.70, 0.60, 0.45, 0.30],
    democracia:  [0.85, 0.70, 0.55, 0.40],
    liberal:     [0.85, 0.70, 0.55, 0.40],
    vibrante:    [0.85, 0.70, 0.55, 0.40],
    estavel:     [0.85, 0.70, 0.55, 0.40],
  };

  const getEcstasyCost = () => {
    return { faith: 50, fervor: 10 };
  };

  const getTempleUnlockLevel = (c: Country): number => {
    const sent = c.missionariesSent ?? 0;
    const level = c.templeLevel ?? 0;
    const cycles = c.cyclesPresent ?? 0;
    const convertPct = c.population > 0 ? (c.converts / c.population) * 100 : 0;
    // Phase 4: higher tiers require time (cultural consolidation)
    if (sent >= 10 && convertPct >= 50 && level >= 3 && cycles >= 50) return 4;
    if (sent >= 6 && convertPct >= 25 && level >= 2 && cycles >= 25) return 3;
    if (sent >= 3 && convertPct >= 10 && level >= 1) return 2;
    if (sent >= 1 && convertPct >= 2) return 1;
    return 0;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full" id="world-map-component">
      
      {/* LEFT PORTION: The Tactical Grid Map */}
      <div className="flex-1 bg-[#1a1508] border-2 border-[#cfb53b]/40 rounded-lg p-4 relative overflow-hidden flex flex-col justify-between min-h-[450px]">
        
        {/* Parchment background detail */}
        <div className="absolute inset-0 bg-[radial-gradient(#cfb53b_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
        
        {/* Map */}
        <div className="flex-1 my-4 flex flex-col justify-center">
          <WorldMapFlat
            countries={countries}
            selectedCountryId={selectedCountryId}
            onSelectCountry={onSelectCountry}
            floatingTexts={floatingTexts}
          />
        </div>

        {/* Global summary stats bar */}
        <div className="bg-[#241e0c] rounded border border-[#cfb53b]/15 p-2.5 flex justify-between text-xs text-[#dfcfa0]/80">
          <div>
            População Mundial: <span className="text-white font-mono">{countries.reduce((a, c) => a + c.population, 0).toLocaleString()}</span>
          </div>
          <div>
            Seguidores Totais:{' '}
            <span className="text-[#cfb53b] font-mono font-bold">
              {countries.reduce((acc, curr) => acc + curr.converts, 0).toLocaleString()}
            </span>
          </div>
          <div>
            Taxa Média de Conversão:{' '}
            <span className="text-[#cfb53b] font-mono font-bold">
              {(
                (countries.reduce((acc, curr) => acc + curr.converts, 0) /
                  countries.reduce((acc, curr) => acc + curr.population, 0)) *
                100
              ).toFixed(2)}
              %
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT PORTION: Detailed Info and Core Active Actions */}
      <div className="w-full lg:w-96 bg-[#211a0a] border-2 border-[#cfb53b]/60 rounded-lg p-5 flex flex-col justify-between shadow-xl min-h-[480px] overflow-y-auto max-h-[85vh]">
        {selectedCountry ? (
          <div className="flex-1 flex flex-col h-full gap-4">
            
            {/* Country Header */}
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 bg-amber-950 text-[#cfb53b] border border-[#cfb53b]/20 rounded">
                  {selectedCountry.regimeType}
                </span>
                <span className="text-[10px] uppercase font-bold text-red-400 font-mono">
                  {selectedCountry.converts > 0 ? 'Semeado' : 'Não Semeado'}
                </span>
              </div>
              {/* Conversion percentage — large bold display */}
              {(() => {
                const pct = selectedCountry.population > 0 ? (selectedCountry.converts / selectedCountry.population * 100) : 0;
                const pctStr = pct >= 1 ? `${pct.toFixed(1)}%` : `${pct.toFixed(3)}%`;
                return (
                  <div className="mt-1 text-2xl font-bold text-[#cfb53b] font-mono">{pctStr} <span className="text-xs text-[#dfcfa0]/50 font-normal">convertido</span></div>
                );
              })()}
              <h2 className="text-2xl font-bold font-serif text-[#cfb53b] mt-1">
                {selectedCountry.name}
              </h2>
              {selectedCountry.tags && selectedCountry.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-1">
                  {selectedCountry.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#cfb53b]/40 text-[#cfb53b]/70 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-xs text-[#dfcfa0]/65 font-mono mt-1">
                População: {selectedCountry.population.toLocaleString()}
              </div>
              {selectedCountry.tags && selectedCountry.tags.length > 0 && (
                <div className="flex flex-col gap-0.5 mt-1">
                  {selectedCountry.tags.map(tag => {
                    const desc: Record<string, string> = {
                      'Secular': 'Conversão -20%',
                      'Devoto': 'Nacionalismo +30%',
                      'Autoritário': 'Violência +30%',
                      'Tribal': 'Missionários +50%',
                      'Progressista': 'Resistência -20%',
                      'Militarista': 'Violência regenera +30%',
                    };
                    return desc[tag] ? (
                      <span key={tag} className="text-[9px] font-mono text-[#dfcfa0]/45">
                        [{tag}] {desc[tag]}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              {COUNTRY_LORE[selectedCountry.id] && (
                <p className="text-xs text-[#dfcfa0]/80 mt-2 leading-relaxed italic">
                  {COUNTRY_LORE[selectedCountry.id]}
                </p>
              )}
            </div>

            <hr className="border-[#cfb53b]/20" />

            {/* Micro Attributes Progress Bars */}
            <div className="flex flex-col gap-3">
              
              {/* Followers Progress */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Conversão:</span>
                  <span className="text-[#cfb53b] font-bold">
                    {(selectedCountry.population > 0 ? (selectedCountry.converts / selectedCountry.population) * 100 : 0).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#120f05] rounded overflow-hidden border border-[#cfb53b]/20">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-[#cfb53b] transition-all duration-300"
                    style={{ width: `${Math.min(100, selectedCountry.population > 0 ? (selectedCountry.converts / selectedCountry.population) * 100 : 0)}%` }}
                  />
                </div>
                <div className="text-[10px] text-amber-100/50 text-right mt-0.5">
                  {selectedCountry.converts.toLocaleString()} devotos
                </div>
              </div>

              {/* Resistance Progress (Crimson #8b0000) */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Resistência Local:</span>
                  <span className="text-[#8b0000] font-bold">{selectedCountry.resistance}%</span>
                </div>
                <div className="w-full h-2 bg-[#120f05] rounded overflow-hidden border border-[#cfb53b]/20">
                  <div
                    className="h-full bg-[#8b0000] transition-all duration-300"
                    style={{ width: `${selectedCountry.resistance}%` }}
                  />
                </div>
              </div>

              {/* Violence level (White-Yellow) */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="flex items-center gap-1 text-orange-400">
                    <Skull className="w-3.5 h-3.5" /> Nível de Violência:
                  </span>
                  <span className="text-orange-400 font-bold">{selectedCountry.violence}%</span>
                </div>
                <div className="w-full h-2 bg-[#120f05] rounded overflow-hidden border border-[#cfb53b]/20">
                  <div
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${selectedCountry.violence}%` }}
                  />
                </div>
              </div>

              {/* Leader Infiltration Progress */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="flex items-center gap-1 text-sky-400">
                    <Crown className="w-3.5 h-3.5" /> Conversão do Líder ({selectedCountry.leaderName}):
                  </span>
                  <span className="text-sky-400 font-bold">{selectedCountry.leaderInfiltration}%</span>
                </div>
                <div className="w-full h-2 bg-[#120f05] rounded overflow-hidden border border-[#cfb53b]/20">
                  <div
                    className="h-full bg-sky-500 transition-all duration-300"
                    style={{ width: `${selectedCountry.leaderInfiltration}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Converts History Sparkline */}
            {selectedCountry.convertsHistory && selectedCountry.convertsHistory.length > 2 && (
              <div className="border border-[#cfb53b]/20 rounded-lg p-3 bg-[#0e0b05]/60">
                <div className="text-[9px] font-mono text-[#cfb53b]/50 uppercase tracking-wider mb-2">Fiéis — últimos {selectedCountry.convertsHistory.length} ciclos</div>
                <svg width="100%" height="48" viewBox="0 0 200 48" preserveAspectRatio="none">
                  {(() => {
                    const data = selectedCountry.convertsHistory;
                    const max = Math.max(...data, 1);
                    const min = Math.min(...data, 0);
                    const range = max - min || 1;
                    const points = data.map((v, i) => {
                      const x = (i / (data.length - 1)) * 200;
                      const y = 48 - ((v - min) / range) * 44 - 2;
                      return `${x},${y}`;
                    }).join(' ');
                    return (
                      <>
                        <polyline points={points} fill="none" stroke="#cfb53b" strokeWidth="1.5" strokeLinejoin="round" />
                        <circle cx={200} cy={48 - ((data[data.length - 1] - min) / range) * 44 - 2} r="2.5" fill="#cfb53b" />
                      </>
                    );
                  })()}
                </svg>
              </div>
            )}

            <hr className="border-[#cfb53b]/10" />

            {/* Special Trait Box */}
            <div className="bg-[#171308] border border-[#cfb53b]/25 p-3 rounded">
              <h4 className="text-[11px] font-bold text-[#cfb53b] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> {selectedCountry.specialTrait}
              </h4>
              <p className="text-[10px] text-[#dfcfa0]/80 mt-1 leading-relaxed">
                {selectedCountry.specialTraitDesc}
              </p>
            </div>

            <hr className="border-[#cfb53b]/20" />

            {/* Active Actions Interface */}
            <div className="flex flex-col gap-2.5 mt-auto">
              <h3 className="text-xs font-bold uppercase text-[#cfb53b] tracking-widest font-serif mb-1">
                Ações Ativas:
              </h3>

              {/* ACTION 1: Send missionary */}
              <button
                onClick={() => onSendMissionary(selectedCountry.id)}
                disabled={faith < getMissionaryCost(selectedCountry)}
                className={`py-2 px-3 rounded text-xs font-bold flex justify-between items-center transition-all ${
                  faith >= getMissionaryCost(selectedCountry)
                    ? `bg-[#cfb53b] text-[#1e1a0c] hover:bg-[#e6ca4a] cursor-pointer${selectedCountry.converts === 0 ? ' ring-2 ring-white/50' : ''}`
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4" /> Enviar Missionários
                  {selectedCountry.converts === 0 && <span className="text-[9px] font-mono bg-white/20 px-1 py-0.5 rounded">✦ Recomendado</span>}
                </span>
                <span className="font-mono bg-[#171308]/20 px-1.5 py-0.5 rounded text-[10px]">
                  -{getMissionaryCost(selectedCountry)} Fé
                </span>
              </button>

              {/* ACTION 2: Pacify (3 tiers based on violence) */}
              {(() => {
                const v = selectedCountry.violence;
                const hasConverts = selectedCountry.converts > 0;
                const tiers: { tier: 1|2|3; label: string; faith: number; fervor: number; violenceReq: number; baseViolence: number; baseResistance: number }[] = [
                  { tier: 1, label: 'Pregação de Paz',          faith: 15, fervor: 0,  violenceReq: 0,  baseViolence: -8,  baseResistance: 0  },
                  { tier: 2, label: 'Mobilização Comunitária',  faith: 25, fervor: 5,  violenceReq: 40, baseViolence: -20, baseResistance: -5 },
                  { tier: 3, label: 'Intervenção de Emergência',faith: 40, fervor: 15, violenceReq: 65, baseViolence: -35, baseResistance: 5  },
                ];
                const available = tiers.filter(t => v >= t.violenceReq);
                const best = available[available.length - 1] ?? tiers[0];
                const canAfford = faith >= best.faith && fervor >= best.fervor && hasConverts;

                const eff = calcPeaceEffectiveness(
                  selectedCountry.converts, selectedCountry.population,
                  selectedCountry.templeLevel, selectedCountry.leaderInfiltration,
                  tithe
                );
                const effPct = Math.round(eff * 100);
                const scaledV = Math.round(best.baseViolence * eff);
                const scaledR = best.baseResistance !== 0 ? Math.round(best.baseResistance * eff) : 0;
                const effColor = effPct >= 70 ? 'text-green-400' : effPct >= 50 ? 'text-yellow-400' : effPct >= 35 ? 'text-orange-400' : 'text-red-400';
                const effLabel = effPct >= 90 ? 'Dominante' : effPct >= 70 ? 'Forte' : effPct >= 50 ? 'Moderada' : effPct >= 35 ? 'Fraca' : 'Mínima';

                return (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => onPacifyCountry(selectedCountry.id, best.tier)}
                      disabled={!canAfford}
                      className={`py-2 px-3 rounded text-xs font-bold flex justify-between items-center transition-all ${
                        canAfford
                          ? 'bg-orange-950 hover:bg-orange-900 text-orange-200 cursor-pointer border border-orange-500/40'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <HeartHandshake className="w-4 h-4" /> {best.label}
                        {v > 60 && <span className="text-[9px] font-mono bg-orange-400/20 px-1 py-0.5 rounded text-orange-200">✦ Recomendado</span>}
                      </span>
                      <span className="font-mono bg-[#171308]/20 px-1.5 py-0.5 rounded text-[9px] flex gap-1">
                        <span>{best.faith} Fé</span>
                        {best.fervor > 0 && <span>{best.fervor} Fervor</span>}
                      </span>
                    </button>
                    <div className="flex justify-between items-center text-[9px] font-mono px-0.5">
                      <span className="text-[#dfcfa0]/40">
                        {scaledV} violência{scaledR !== 0 ? `, ${scaledR > 0 ? '+' : ''}${scaledR} resistência` : ''}
                      </span>
                      <span className={`font-bold ${effColor}`}>
                        Influência: {effLabel} ({effPct}%)
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* ACTION 3: Infiltrate Leader — stage-based with prerequisites */}
              {(() => {
                const inf = selectedCountry.leaderInfiltration;
                if (inf >= 100) {
                  return (
                    <div className="py-2 px-3 rounded text-xs font-bold flex items-center gap-2 bg-sky-950 border border-sky-600/40 text-sky-300">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <span>{selectedCountry.leaderName} — <span className="text-yellow-400">CONVERTIDO</span></span>
                    </div>
                  );
                }

                const stageIdx = LEADER_STAGES_UI.findIndex(s => inf >= s.min && inf < s.max);
                const stage = LEADER_STAGES_UI[stageIdx] ?? LEADER_STAGES_UI[0];
                const nextStage = LEADER_STAGES_UI[stageIdx + 1];
                const isSuperpower = SUPERPOWER_IDS_UI.includes(selectedCountry.id);

                const reqConvertPct = isSuperpower ? stage.convertPct * 2 : stage.convertPct;
                const reqTemples    = isSuperpower ? stage.globalTemples + 8 : stage.globalTemples;
                const reqCycles     = stage.cyclesPresent;
                const reqTmplLocal  = stage.templeLevel;

                const actualPct   = selectedCountry.population > 0 ? selectedCountry.converts / selectedCountry.population : 0;
                const meetsConv   = actualPct >= reqConvertPct;
                const meetsTmpl   = totalTemples >= reqTemples;
                const meetsCyc    = selectedCountry.cyclesPresent >= reqCycles;
                const meetsTmplLoc= selectedCountry.templeLevel >= reqTmplLocal;
                const meetsAll    = meetsConv && meetsTmpl && meetsCyc && meetsTmplLoc;

                const stageFaith  = stage.faith;
                const stageFervor = stage.fervor;
                const canAfford   = faith >= stageFaith && fervor >= stageFervor;
                const canAct      = meetsAll && canAfford;

                const rates   = SUCCESS_RATES_UI[selectedCountry.regimeType] ?? SUCCESS_RATES_UI['democracia'];
                const successPct = Math.round((rates[stageIdx] ?? 0.5) * 100);
                const rateColor  = successPct >= 70 ? 'text-green-400' : successPct >= 40 ? 'text-yellow-400' : 'text-red-400';
                const isHostile  = ['opressor', 'autoritario'].includes(selectedCountry.regimeType);

                return (
                  <div className="flex flex-col gap-1.5">
                    {/* Stage progress bar */}
                    <div className="flex items-center justify-between text-[9px] font-mono text-[#dfcfa0]/50 mb-0.5">
                      <span>Estágio: <span className="text-sky-400 font-bold">{stage.label}</span></span>
                      <span>{inf.toFixed(0)}% / 100%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-600 rounded-full transition-all" style={{ width: `${inf}%` }} />
                    </div>

                    {/* Requirements checklist */}
                    <div className="bg-zinc-900/60 rounded p-2 flex flex-col gap-0.5 text-[9px] font-mono">
                      <span className={meetsConv    ? 'text-green-400' : 'text-red-400'}>
                        {meetsConv ? '✓' : '✗'} {Math.round(reqConvertPct * 100)}% fiéis no país ({Math.round(actualPct * 100)}% atual)
                      </span>
                      <span className={meetsTmpl    ? 'text-green-400' : 'text-red-400'}>
                        {meetsTmpl ? '✓' : '✗'} {reqTemples} templos globais ({totalTemples} atual)
                      </span>
                      {reqCycles > 0 && (
                        <span className={meetsCyc   ? 'text-green-400' : 'text-red-400'}>
                          {meetsCyc ? '✓' : '✗'} {reqCycles} ciclos de presença ({selectedCountry.cyclesPresent} atual)
                        </span>
                      )}
                      {reqTmplLocal > 0 && (
                        <span className={meetsTmplLoc ? 'text-green-400' : 'text-red-400'}>
                          {meetsTmplLoc ? '✓' : '✗'} Templo nível {reqTmplLocal} local (atual: {selectedCountry.templeLevel})
                        </span>
                      )}
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => onInfiltrateLeader(selectedCountry.id)}
                      disabled={!canAct}
                      className={`py-2 px-3 rounded text-xs font-bold flex justify-between items-center transition-all ${
                        canAct
                          ? 'bg-sky-900 hover:bg-sky-800 text-sky-100 cursor-pointer border border-sky-500/40'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-4 h-4" /> Infiltrar: {stage.label}
                        {nextStage && <span className="text-[9px] font-normal opacity-60">→ {nextStage.label}</span>}
                      </span>
                      <span className="font-mono bg-[#171308]/20 px-1.5 py-0.5 rounded text-[9px] flex gap-1">
                        <span className={faith >= stageFaith ? 'text-[#cfb53b]' : 'text-red-500'}>{stageFaith} Fé</span>
                        {stageFervor > 0 && <span className={fervor >= stageFervor ? 'text-red-400' : 'text-red-500'}>{stageFervor} Fervor</span>}
                      </span>
                    </button>

                    {/* Risk display */}
                    <div className="flex justify-between text-[9px] font-mono px-0.5">
                      <span className="text-[#dfcfa0]/40">Falha recua -20 infiltração{isHostile && inf >= 50 ? ' +15 violência' : ''}</span>
                      <span className={`font-bold ${rateColor}`}>Sucesso: {successPct}%</span>
                    </div>
                  </div>
                );
              })()}

              {/* ACTION 4: Special Trait-locked actions */}
              {trait === 'Mistical' && (
                <button
                  onClick={() => onPerformEcstasyRitual(selectedCountry.id)}
                  disabled={faith < getEcstasyCost().faith || fervor < getEcstasyCost().fervor || selectedCountry.converts === 0}
                  className={`py-2 px-3 rounded text-xs font-bold flex justify-between items-center transition-all ${
                    faith >= getEcstasyCost().faith && fervor >= getEcstasyCost().fervor && selectedCountry.converts > 0
                      ? 'bg-amber-950 text-[#cfb53b] hover:bg-amber-900 border border-[#cfb53b] cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#cfb53b]" /> Ritual de Êxtase Coletivo
                  </span>
                  <span className="font-mono text-[9px] bg-[#171308]/50 px-1.5 py-0.5 rounded flex gap-1">
                    <span>50 Fé</span>
                    <span>10 Fervor</span>
                  </span>
                </button>
              )}

              {/* ACTION 5: Open Temple */}
              {(() => {
                const PRESENCE_REQ = [0, 0.10, 0.25, 0.50];
                const BUILD_CYCLES = [3, 6, 10, 15];
                const availableLevel = getTempleUnlockLevel(selectedCountry);
                const nextLevel = selectedCountry.templeLevel + 1;
                const canBuildNext = availableLevel >= nextLevel && nextLevel <= 4;
                const cost = nextLevel <= 4 ? templeCosts[nextLevel - 1] : null;
                const presenceReq = nextLevel <= 4 ? PRESENCE_REQ[nextLevel - 1] : 0;
                const convertPct = selectedCountry.population > 0 ? selectedCountry.converts / selectedCountry.population : 0;
                const meetsPresence = convertPct >= presenceReq;
                const canAfford = cost ? faith >= cost.faith && fervor >= cost.fervor && tithe >= cost.tithe : false;
                const traitNames = templeNames[trait] ?? [];
                const currentTempleName = selectedCountry.templeLevel > 0 ? traitNames[selectedCountry.templeLevel - 1] : null;
                const nextTempleName = nextLevel <= 4 ? traitNames[nextLevel - 1] : null;
                const isBuilding = (selectedCountry.templePending ?? 0) > 0;
                const buildCyclesLeft = selectedCountry.templeBuildCyclesLeft ?? 0;
                const pendingName = isBuilding ? traitNames[(selectedCountry.templePending ?? 1) - 1] : null;
                const totalBuildCycles = isBuilding ? BUILD_CYCLES[(selectedCountry.templePending ?? 1) - 1] : 1;
                const buildProgress = isBuilding ? Math.round(((totalBuildCycles - buildCyclesLeft) / totalBuildCycles) * 100) : 0;
                const specLabel = selectedCountry.templeSpec === 'conversion' ? '⚡ Expansão da Fé' : selectedCountry.templeSpec === 'resistance' ? '🛡️ Bastião da Doutrina' : null;

                return (
                  <div className="flex flex-col gap-1 border-t border-[#cfb53b]/10 pt-2 mt-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#dfcfa0]/60">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#cfb53b]" />
                        Templo: {currentTempleName ? <span className="text-[#cfb53b] font-bold ml-1">{currentTempleName}</span> : <span className="text-zinc-500 ml-1">Nenhum</span>}
                        {specLabel && <span className="ml-1 text-[9px] text-blue-400/80">({specLabel})</span>}
                      </span>
                      <span>Missionários: {selectedCountry.missionariesSent}</span>
                    </div>

                    {isBuilding ? (
                      <div className="flex flex-col gap-1">
                        <div className="py-1.5 px-3 rounded bg-yellow-950/40 border border-yellow-700/40 text-[10px] text-yellow-300 font-bold text-center">
                          🏗️ Construindo {pendingName}... ({buildCyclesLeft} ciclos restantes)
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${buildProgress}%` }} />
                        </div>
                      </div>
                    ) : selectedCountry.templeLevel >= 4 ? (
                      <div className="py-1.5 px-3 rounded bg-amber-950/40 border border-[#cfb53b]/30 text-[10px] text-[#cfb53b] font-bold text-center">
                        🏛️ Santuário Máximo Atingido
                      </div>
                    ) : canBuildNext && cost ? (
                      <div className="flex flex-col gap-1">
                        {presenceReq > 0 && (
                          <div className={`text-[9px] font-mono px-2 py-0.5 rounded ${meetsPresence ? 'text-green-400/70' : 'text-red-400/70'}`}>
                            {meetsPresence ? '✓' : '✗'} Presença mínima: {Math.round(presenceReq * 100)}% (atual: {(convertPct * 100).toFixed(1)}%)
                          </div>
                        )}
                        <button
                          onClick={() => onOpenTemple(selectedCountry.id)}
                          disabled={!canAfford || !meetsPresence}
                          className={`py-2 px-3 rounded text-xs font-bold flex justify-between items-center transition-all ${
                            canAfford && meetsPresence
                              ? 'bg-[#1a2a1a] hover:bg-[#213021] text-green-300 border border-green-700/50 cursor-pointer'
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-green-400" /> Construir {nextTempleName}
                            <span className="text-[9px] text-zinc-400 font-normal">({BUILD_CYCLES[nextLevel - 1]} ciclos)</span>
                            {selectedCountry.converts > 0 && selectedCountry.templeLevel === 0 && tithe > 3 && <span className="text-[9px] font-mono bg-green-400/20 px-1 py-0.5 rounded text-green-200">✦ Recomendado</span>}
                          </span>
                          <span className="font-mono text-[9px] bg-black/30 px-1.5 py-0.5 rounded flex gap-1">
                            <span>{cost.faith} Fé</span>
                            <span>{cost.fervor} Ferv</span>
                            <span className="text-emerald-400">{cost.tithe} Díz</span>
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="py-1.5 px-3 rounded bg-zinc-900/50 border border-zinc-700/30 text-[10px] text-zinc-500 text-center">
                        {selectedCountry.missionariesSent === 0
                          ? 'Envie missionários para desbloquear templos'
                          : nextLevel === 3 && (selectedCountry.cyclesPresent ?? 0) < 25
                            ? `${nextTempleName} requer 25 ciclos de presença (atual: ${selectedCountry.cyclesPresent ?? 0})`
                            : nextLevel === 4 && (selectedCountry.cyclesPresent ?? 0) < 50
                              ? `${nextTempleName} requer 50 ciclos de presença (atual: ${selectedCountry.cyclesPresent ?? 0})`
                              : `Próximo templo: ${nextTempleName} — requer mais conversões`}
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-[#dfcfa0]/50 gap-2">
            <Network className="w-12 h-12 text-[#cfb53b]/30 animate-pulse" />
            <p className="text-sm font-serif font-semibold">Nenhum país selecionado</p>
            <p className="text-xs max-w-[240px]">
              Clique em um dos marcadores no mapa tático para analisar dados sociais e convocar missões especiais.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
