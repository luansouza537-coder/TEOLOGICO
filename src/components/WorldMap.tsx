/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Country, ReligionTrait } from '../types';
import { Crosshair, ShieldAlert, HeartHandshake, Skull, Crown, Star, Network, Building2 } from 'lucide-react';
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
  trait: ReligionTrait;
  onSendMissionary: (countryId: string) => void;
  onPacifyCountry: (countryId: string) => void;
  onInfiltrateLeader: (countryId: string) => void;
  onPerformEcstasyRitual: (countryId: string) => void;
  onOpenTemple: (countryId: string) => void;
  totalTemples: number;
  templeCosts: { faith: number; fervor: number }[];
  templeNames: Record<string, string[]>;
  floatingTexts?: { id: number; text: string; x: number; y: number; colorClass: string; countryId?: string }[];
}

export default function WorldMap({
  countries,
  selectedCountryId,
  onSelectCountry,
  faith,
  fervor,
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
    return base;
  };

  const getPacifyCost = (c: Country) => {
    // Mexico and Brazil are easier to pacify due to local faith, but others might vary
    let base = 25;
    if (c.id === 'mexico') base -= 5;
    return base;
  };

  const getLeaderInfiltrationCost = (c: Country) => {
    let baseFaith = 40;
    let baseFervor = 15;
    if (c.id === 'japan') {
      baseFaith -= 10; // easier as per technological ceticismo
    }
    if (c.id === 'russia') {
      baseFaith -= 5;
    }
    return { faith: baseFaith, fervor: baseFervor };
  };

  const getEcstasyCost = () => {
    return { faith: 50, fervor: 10 };
  };

  const getTempleUnlockLevel = (c: Country): number => {
    const sent = c.missionariesSent ?? 0;
    const level = c.templeLevel ?? 0;
    const convertPct = c.population > 0 ? (c.converts / c.population) * 100 : 0;
    if (sent >= 10 && convertPct >= 50 && level >= 3) return 4;
    if (sent >= 6 && convertPct >= 25 && level >= 2) return 3;
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
        
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pb-3 border-b border-[#cfb53b]/20 z-10 relative">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-[#cfb53b]" />
            <h3 className="uppercase tracking-widest text-[#cfb53b] font-bold font-serif text-sm">
              Tabuleiro Tático de Semeação (Planisfério Plano)
            </h3>
          </div>
        </div>

        {/* The Graphic Node Grid */}
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
            Poplação Mundial: <span className="text-white font-mono">4.18B</span>
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
      <div className="w-full lg:w-96 bg-[#211a0a] border-2 border-[#cfb53b] rounded-lg p-5 flex flex-col justify-between shadow-xl min-h-[480px]">
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
              <h2 className="text-2xl font-bold font-serif text-[#cfb53b] mt-1">
                {selectedCountry.name}
              </h2>
              <div className="text-xs text-[#dfcfa0]/65 font-mono">
                População: {selectedCountry.population.toLocaleString()}
              </div>
            </div>

            <hr className="border-[#cfb53b]/20" />

            {/* Micro Attributes Progress Bars */}
            <div className="flex flex-col gap-3">
              
              {/* Followers Progress */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Conversão:</span>
                  <span className="text-[#cfb53b] font-bold">
                    {((selectedCountry.converts / selectedCountry.population) * 100).toFixed(4)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#120f05] rounded overflow-hidden border border-[#cfb53b]/20">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-[#cfb53b] transition-all duration-300"
                    style={{ width: `${Math.min(100, (selectedCountry.converts / selectedCountry.population) * 100)}%` }}
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
                    ? 'bg-[#cfb53b] text-[#1e1a0c] hover:bg-[#e6ca4a] cursor-pointer'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4" /> Enviar Missionários
                </span>
                <span className="font-mono bg-[#171308]/20 px-1.5 py-0.5 rounded text-[10px]">
                  -{getMissionaryCost(selectedCountry)} Fé
                </span>
              </button>

              {/* ACTION 2: Pacify (Social actions) */}
              <button
                onClick={() => onPacifyCountry(selectedCountry.id)}
                disabled={faith < getPacifyCost(selectedCountry) || selectedCountry.converts === 0}
                className={`py-2 px-3 rounded text-xs font-bold flex justify-between items-center transition-all ${
                  faith >= getPacifyCost(selectedCountry) && selectedCountry.converts > 0
                    ? 'bg-orange-850 hover:bg-orange-800 text-orange-200 cursor-pointer border border-orange-500/40'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4" /> Pacificar Sociedade
                </span>
                <span className="font-mono bg-[#171308]/20 px-1.5 py-0.5 rounded text-[10px]">
                  -{getPacifyCost(selectedCountry)} Fé
                </span>
              </button>

              {/* ACTION 3: Infiltrate Leader */}
              {(() => {
                const costs = getLeaderInfiltrationCost(selectedCountry);
                const hasResources = faith >= costs.faith && fervor >= costs.fervor;
                return (
                  <button
                    onClick={() => onInfiltrateLeader(selectedCountry.id)}
                    disabled={!hasResources || selectedCountry.converts === 0 || selectedCountry.leaderInfiltration >= 100}
                    className={`py-2 px-3 rounded text-xs font-bold flex justify-between items-center transition-all ${
                      hasResources && selectedCountry.converts > 0 && selectedCountry.leaderInfiltration < 100
                        ? 'bg-sky-900 hover:bg-sky-800 text-sky-100 cursor-pointer border border-sky-500/40'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4" /> Converter Governante
                    </span>
                    <span className="font-mono bg-[#171308]/20 px-1.5 py-0.5 rounded text-[9px] flex gap-1">
                      <span>{costs.faith} Fé</span>
                      <span>{costs.fervor} Fervor</span>
                    </span>
                  </button>
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
                const availableLevel = getTempleUnlockLevel(selectedCountry);
                const nextLevel = selectedCountry.templeLevel + 1;
                const canBuildNext = availableLevel >= nextLevel && nextLevel <= 4;
                const cost = nextLevel <= 4 ? templeCosts[nextLevel - 1] : null;
                const canAfford = cost ? faith >= cost.faith && fervor >= cost.fervor : false;
                const traitNames = templeNames[trait] ?? [];
                const currentTempleName = selectedCountry.templeLevel > 0 ? traitNames[selectedCountry.templeLevel - 1] : null;
                const nextTempleName = nextLevel <= 4 ? traitNames[nextLevel - 1] : null;

                return (
                  <div className="flex flex-col gap-1 border-t border-[#cfb53b]/10 pt-2 mt-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#dfcfa0]/60">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#cfb53b]" />
                        Templo: {currentTempleName ? <span className="text-[#cfb53b] font-bold ml-1">{currentTempleName}</span> : <span className="text-zinc-500 ml-1">Nenhum</span>}
                      </span>
                      <span>Missionários: {selectedCountry.missionariesSent}</span>
                    </div>

                    {selectedCountry.templeLevel >= 4 ? (
                      <div className="py-1.5 px-3 rounded bg-amber-950/40 border border-[#cfb53b]/30 text-[10px] text-[#cfb53b] font-bold text-center">
                        🏛️ Santuário Máximo Atingido
                      </div>
                    ) : canBuildNext && cost ? (
                      <button
                        onClick={() => onOpenTemple(selectedCountry.id)}
                        disabled={!canAfford}
                        className={`py-2 px-3 rounded text-xs font-bold flex justify-between items-center transition-all ${
                          canAfford
                            ? 'bg-[#1a2a1a] hover:bg-[#213021] text-green-300 border border-green-700/50 cursor-pointer'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-green-400" /> Abrir {nextTempleName}
                        </span>
                        <span className="font-mono text-[9px] bg-black/30 px-1.5 py-0.5 rounded flex gap-1">
                          <span>{cost.faith} Fé</span>
                          <span>{cost.fervor} Fervor</span>
                        </span>
                      </button>
                    ) : (
                      <div className="py-1.5 px-3 rounded bg-zinc-900/50 border border-zinc-700/30 text-[10px] text-zinc-500 text-center">
                        {selectedCountry.missionariesSent === 0
                          ? 'Envie missionários para desbloquear templos'
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
