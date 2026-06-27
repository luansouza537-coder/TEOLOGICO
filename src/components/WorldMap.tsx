/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Country, ReligionTrait } from '../types';
import { Crosshair, ShieldAlert, HeartHandshake, Skull, Crown, Star, Network, Building2, X, Sword } from 'lucide-react';
import { calcPeaceEffectiveness } from '../utils/peaceEffectiveness';
import WorldMapFlat from './WorldMapFlat';

const COUNTRY_LORE: Record<string, string> = {
  usa: 'A maior potência ocidental vive uma guerra cultural interna. Evangelicalismo, ateísmo progressista e ceticismo tecnológico disputam corações num país de 335 milhões de almas fragmentadas.',
  china: 'O Partido controla cada palavra impressa e cada culto autorizado. Sob a superfície do ateísmo estatal, milhões buscam em segredo algo além do materialismo oficial.',
  india: 'Terra dos mil deuses, onde espiritualidade é o ar que se respira. O sincretismo ancestral absorve novas doutrinas como rio absorve afluentes.',
  germany: 'Sociedade laicizada pela razão iluminista. As igrejas esvaziam; os jovens buscam propósito em algoritmos e ideologias pós-modernas.',
  brazil: 'A nação mais espiritualmente intensa do planeta. Candomblé, catolicismo barroco e pentecostalismo explosivo convivem nas mesmas favelas.',
  russia: 'Alma eslava moldada por séculos de Ortodoxia e décadas de ateísmo soviético. O Kremlin usa a religião como instrumento de coesão nacional.',
  egypt: 'Encruzilhada de civilizações onde cada pedra guarda memória de deus. O Islã estrutura a vida pública, mas a modernidade corrói antigas certezas.',
  south_africa: 'País marcado pela ferida aberta do apartheid. A espiritualidade é coluna vertebral das comunidades — quem chegar com cura encontrará multidões.',
  japan: 'Civilização de precisão e silêncio interior. A fé aqui é privada, estética, quase silenciosa. Converter o Japão exige paciência monástica.',
  mexico: 'Terra da Virgem de Guadalupe e dos cartéis. O catolicismo popular é identidade — uma religião que ofereça paz comunitária pode varrer o país em meses.',
  saudi_arabia: 'Coração do Islã sunita. As leis teocráticas são muralhas de aço — e ainda assim uma juventude silenciosa questiona tudo que lhe foi ensinado.',
  australia: 'Continente-ilha de pragmatismo anglo-saxão. A solidão do interior imenso e a busca por identidade abrem janelas que o racional não fecha.',
  ukraine: 'Nação forjada na resistência. A guerra e o sofrimento abriram feridas profundas — e feridas profundas são solo fértil para a fé. Mas enquanto a Rússia arde, a violência não descansa.',
  ethiopia: 'Uma das mais antigas tradições cristãs do mundo vive aqui. A espiritualidade está nas pedras, nos cantos, no cheiro do café. Caminhos Místicos encontram eco ancestral nessa terra.',
  philippines: 'Arquipélago de fé intensa no coração do Pacífico. O catolicismo é identidade nacional — um povo já aberto ao sagrado aguarda apenas a mensagem certa para irradiar fé pelo Sudeste Asiático.',
  colombia: 'Terra de contrastes radicais: favelas e catedrais, cartéis e comunidades de fé. Quem conseguir pacificar a violência encontrará um dos povos mais receptivos da América do Sul.',
  cuba: 'Sob décadas de ateísmo estatal, a espiritualidade cubana sobreviveu em sussurros. Os cultos clandestinos guardam uma chama que o regime nunca apagou — só quem chegar com paciência colherá essa colheita proibida.',
};

const CONTINENTS = [
  { id: 'na', name: 'América do Norte', path: 'M 40,110 L 50,105 L 70,115 L 80,105 L 120,95 L 150,90 L 180,95 L 200,80 L 220,100 L 240,90 L 255,105 L 270,100 L 290,115 L 285,135 L 270,140 L 260,165 L 275,175 L 255,190 L 248,225 L 235,230 L 230,220 L 210,225 L 195,245 L 184,260 L 165,285 L 150,290 L 146,280 L 156,260 L 130,250 L 115,225 L 105,215 L 110,195 L 125,188 L 115,165 L 90,145 L 75,135 L 50,130 L 35,120 Z' },
  { id: 'sa', name: 'América do Sul', path: 'M 170,290 L 190,285 L 220,285 L 248,310 L 275,320 L 315,315 L 335,325 L 345,345 L 330,380 L 300,420 L 270,450 L 255,475 L 245,475 L 240,440 L 230,410 L 212,380 L 192,350 L 175,325 Z' },
  { id: 'eu', name: 'Europa', path: 'M 385,200 L 375,185 L 362,175 L 355,150 L 365,125 L 380,120 L 398,135 L 415,145 L 440,150 L 450,140 L 430,125 L 410,110 L 412,90 L 430,85 L 455,95 L 485,100 L 495,115 L 520,120 L 535,135 L 518,155 L 492,170 L 455,185 L 430,190 Z' },
  { id: 'af', name: 'África', path: 'M 380,210 L 410,205 L 435,215 L 480,215 L 525,230 L 540,245 L 536,260 L 518,265 L 528,285 L 552,310 L 565,340 L 555,370 L 535,405 L 515,420 L 495,415 L 485,395 L 475,370 L 450,335 L 420,315 L 395,302 L 375,285 L 365,260 L 355,235 Z' },
  { id: 'as', name: 'Ásia', path: 'M 495,115 L 520,120 L 540,110 L 580,105 L 630,95 L 680,100 L 730,90 L 780,100 L 830,95 L 880,105 L 900,120 L 920,145 L 910,170 L 895,185 L 865,205 L 845,225 L 830,245 L 820,255 L 802,245 L 795,225 L 778,215 L 760,230 L 748,255 L 732,260 L 720,242 L 705,230 L 690,245 L 675,255 L 655,250 L 640,235 L 610,235 L 590,215 L 575,230 L 550,230 L 535,210 Z' },
  { id: 'au', name: 'Austrália', path: 'M 810,360 L 840,345 L 885,348 L 915,365 L 925,395 L 890,418 L 845,415 L 815,395 Z' },
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
  onOpenTemple: (countryId: string, level: number) => void;
  onStageCoup: (countryId: string) => void;
  totalTemples: number;
  templeCosts: { faith: number; fervor: number; tithe: number }[];
  templeNames: Record<string, string[]>;
  floatingTexts?: { id: number; text: string; x: number; y: number; colorClass: string; countryId?: string }[];
}

type SheetTab = 'info' | 'acoes' | 'templo';

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
  onStageCoup,
  totalTemples,
  templeCosts,
  templeNames,
  floatingTexts = []
}: WorldMapProps) {
  const selectedCountry = countries.find((c) => c.id === selectedCountryId) ?? null;
  const [sheetTab, setSheetTab] = useState<SheetTab>('info');
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (selectedCountry) {
      setSheetOpen(true);
      setSheetTab('info');
    } else {
      setSheetOpen(false);
    }
  }, [selectedCountryId]);

  const getMissionaryCost = (c: Country) => {
    let base = 30;
    if (c.id === 'japan') base += 15;
    if (c.id === 'china') base += 20;
    if (c.id === 'saudi_arabia') base += 25;
    if (c.id === 'cuba') base = Math.round(base * 1.80); // antes do escalonamento
    base += (c.missionariesSent ?? 0) * 15;
    return base;
  };

  const LEADER_STAGES_UI = [
    { label: 'Ciente',       min: 0,  max: 25,  faith: 150, fervor: 0,   convertPct: 0.15, globalTemples: 5,  cyclesPresent: 0,  localTempleMinLevel: 0 },
    { label: 'Simpático',    min: 25, max: 50,  faith: 300, fervor: 300, convertPct: 0.30, globalTemples: 15, cyclesPresent: 10, localTempleMinLevel: 0 },
    { label: 'Comprometido', min: 50, max: 75,  faith: 500, fervor: 500, convertPct: 0.45, globalTemples: 25, cyclesPresent: 0,  localTempleMinLevel: 1 },
    { label: 'Convertido',   min: 75, max: 100, faith: 700, fervor: 700, convertPct: 0.60, globalTemples: 35, cyclesPresent: 0,  localTempleMinLevel: 2 },
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

  const closeSheet = () => {
    setSheetOpen(false);
    onSelectCountry('');
  };

  return (
    <div className="relative flex flex-col h-full w-full" id="world-map-component">

      {/* Map — fills all space */}
      <div className="flex-1 min-h-0">
        <WorldMapFlat
          countries={countries}
          selectedCountryId={selectedCountryId}
          onSelectCountry={onSelectCountry}
          floatingTexts={floatingTexts}
        />
      </div>

      {/* Global stats bar */}
      <div className="shrink-0 bg-[#241e0c] border-t border-[#cfb53b]/15 px-3 py-1.5 flex justify-between text-[10px] text-[#dfcfa0]/70 font-mono">
        <span>Pop: <span className="text-white">{(countries.reduce((a, c) => a + c.population, 0) / 1_000_000_000).toFixed(2)}B</span></span>
        <span>Fiéis: <span className="text-[#cfb53b] font-bold">{countries.reduce((a, c) => a + c.converts, 0).toLocaleString()}</span></span>
        <span>Global: <span className="text-[#cfb53b] font-bold">{((countries.reduce((a, c) => a + c.converts, 0) / countries.reduce((a, c) => a + c.population, 0)) * 100).toFixed(2)}%</span></span>
      </div>

      {/* Bottom Sheet + Backdrop — rendered in body via portal to escape Leaflet transforms */}
      {ReactDOM.createPortal(
        <>
          {/* Backdrop */}
          {sheetOpen && selectedCountry && (
            <div
              className="fixed inset-0 z-40 bg-black/40"
              style={{ bottom: '56px' }}
              onClick={closeSheet}
            />
          )}

          {/* Sheet */}
          <div
            className="fixed left-0 right-0 z-50 flex flex-col bg-[#181208] border-t-2 border-[#cfb53b]/60 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out"
            style={{
              bottom: '56px',
              height: '68dvh',
              transform: sheetOpen && selectedCountry ? 'translateY(0)' : 'translateY(110%)',
            }}
          >
        {selectedCountry && (
          <>
            {/* Sheet handle + header */}
            <div className="shrink-0 px-4 pt-3 pb-2">
              {/* Drag handle */}
              <div className="w-10 h-1 bg-[#cfb53b]/30 rounded-full mx-auto mb-3" />

              {/* Country title row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-amber-950 text-[#cfb53b] border border-[#cfb53b]/30 rounded">
                      {selectedCountry.regimeType}
                    </span>
                    <span className={`text-[9px] uppercase font-bold font-mono ${selectedCountry.converts > 0 ? 'text-[#cfb53b]' : 'text-red-400'}`}>
                      {selectedCountry.converts > 0 ? 'Semeado' : 'Não Semeado'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-serif text-[#cfb53b] mt-0.5 leading-tight">
                    {selectedCountry.name}
                  </h2>
                  <div className="text-[10px] font-mono text-[#dfcfa0]/50">
                    {(selectedCountry.population > 0 ? (selectedCountry.converts / selectedCountry.population * 100) : 0).toFixed(selectedCountry.converts / selectedCountry.population < 0.01 ? 3 : 1)}% convertido · {(selectedCountry.population / 1_000_000).toFixed(0)}M hab
                  </div>
                </div>
                <button
                  onClick={closeSheet}
                  className="shrink-0 p-1 rounded-full border border-[#cfb53b]/20 text-[#cfb53b]/50 hover:text-[#cfb53b] hover:border-[#cfb53b]/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab bar */}
              <div className="flex gap-1 mt-3">
                {(['info', 'acoes', 'templo'] as SheetTab[]).map(tab => {
                  const canBuildHere = tab === 'templo'
                    && selectedCountry.missionariesSent >= 1
                    && !(selectedCountry.temples ?? []).some(t => t > 0)
                    && !(selectedCountry.templesBuilding ?? []).some(t => t > 0)
                    && faith >= 40;
                  return (
                    <button
                      key={tab}
                      onClick={() => setSheetTab(tab)}
                      className={`relative flex-1 py-1 text-[10px] font-mono uppercase tracking-wider rounded border transition-all ${
                        sheetTab === tab
                          ? 'bg-[#cfb53b] text-[#1e1a0c] border-[#cfb53b] font-bold'
                          : 'bg-transparent text-[#cfb53b]/50 border-[#cfb53b]/20 hover:text-[#cfb53b]'
                      }`}
                    >
                      {tab === 'info' ? 'Info' : tab === 'acoes' ? 'Ações' : 'Templo'}
                      {canBuildHere && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#cfb53b] rounded-full animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">

              {/* ── INFO TAB ── */}
              {sheetTab === 'info' && (
                <div className="flex flex-col gap-3 pt-1">

                  {/* Progress bars */}
                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'Conversão', value: selectedCountry.population > 0 ? (selectedCountry.converts / selectedCountry.population) * 100 : 0, color: 'bg-gradient-to-r from-amber-600 to-[#cfb53b]', textColor: 'text-[#cfb53b]' },
                      { label: 'Resistência', value: selectedCountry.resistance, color: 'bg-[#8b0000]', textColor: 'text-red-500' },
                      { label: 'Violência', value: selectedCountry.violence, color: 'bg-orange-500', textColor: 'text-orange-400', icon: <Skull className="w-3 h-3" /> },
                      { label: `Líder (${selectedCountry.leaderName})`, value: selectedCountry.leaderInfiltration, color: 'bg-sky-500', textColor: 'text-sky-400', icon: <Crown className="w-3 h-3" /> },
                    ].map(bar => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-[10px] font-mono mb-0.5">
                          <span className={`flex items-center gap-1 ${bar.textColor}`}>{bar.icon}{bar.label}</span>
                          <span className={`font-bold ${bar.textColor}`}>{bar.value.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#120f05] rounded overflow-hidden border border-[#cfb53b]/15">
                          <div className={`h-full ${bar.color} transition-all`} style={{ width: `${Math.min(100, bar.value)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sparkline */}
                  {selectedCountry.convertsHistory && selectedCountry.convertsHistory.length > 2 && (
                    <div className="border border-[#cfb53b]/20 rounded-lg p-2.5 bg-[#0e0b05]/60">
                      <div className="text-[9px] font-mono text-[#cfb53b]/50 uppercase tracking-wider mb-1.5">Fiéis — últimos {selectedCountry.convertsHistory.length} ciclos</div>
                      <svg width="100%" height="36" viewBox="0 0 200 36" preserveAspectRatio="none">
                        {(() => {
                          const data = selectedCountry.convertsHistory!;
                          const max = Math.max(...data, 1);
                          const min = Math.min(...data, 0);
                          const range = max - min || 1;
                          const points = data.map((v, i) => {
                            const x = (i / (data.length - 1)) * 200;
                            const y = 36 - ((v - min) / range) * 32 - 2;
                            return `${x},${y}`;
                          }).join(' ');
                          return (
                            <>
                              <polyline points={points} fill="none" stroke="#cfb53b" strokeWidth="1.5" strokeLinejoin="round" />
                              <circle cx={200} cy={36 - ((data[data.length - 1] - min) / range) * 32 - 2} r="2.5" fill="#cfb53b" />
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedCountry.tags && selectedCountry.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {selectedCountry.tags.map(tag => {
                        const desc: Record<string, string> = {
                          'Secular': '-20% conversão', 'Devoto': '+30% nacionalismo',
                          'Autoritário': '+30% violência', 'Tribal': '+50% missionários',
                          'Progressista': '-20% resistência', 'Militarista': '+30% violência regen.',
                        };
                        return (
                          <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#cfb53b]/30 text-[#cfb53b]/70 uppercase tracking-wider" title={desc[tag]}>
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Special Trait */}
                  <div className="bg-[#171308] border border-[#cfb53b]/25 p-2.5 rounded">
                    <h4 className="text-[10px] font-bold text-[#cfb53b] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3 h-3" /> {selectedCountry.specialTrait}
                    </h4>
                    <p className="text-[10px] text-[#dfcfa0]/75 mt-1 leading-relaxed">{selectedCountry.specialTraitDesc}</p>
                  </div>

                  {/* Lore */}
                  {COUNTRY_LORE[selectedCountry.id] && (
                    <p className="text-[10px] text-[#dfcfa0]/60 leading-relaxed italic border-l-2 border-[#cfb53b]/20 pl-2">
                      {COUNTRY_LORE[selectedCountry.id]}
                    </p>
                  )}
                </div>
              )}

              {/* ── AÇÕES TAB ── */}
              {sheetTab === 'acoes' && (
                <div className="flex flex-col gap-3 pt-1">

                  {/* ACTION 1: Send missionary */}
                  <button
                    onClick={() => onSendMissionary(selectedCountry.id)}
                    disabled={faith < getMissionaryCost(selectedCountry)}
                    className={`py-2.5 px-3 rounded text-xs font-bold flex justify-between items-center transition-all ${
                      faith >= getMissionaryCost(selectedCountry)
                        ? `bg-[#cfb53b] text-[#1e1a0c] hover:bg-[#e6ca4a] cursor-pointer${selectedCountry.converts === 0 ? ' ring-2 ring-white/40' : ''}`
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Crosshair className="w-4 h-4" /> Enviar Missionários
                      {selectedCountry.converts === 0 && <span className="text-[9px] font-mono bg-white/20 px-1 py-0.5 rounded">✦ Recomendado</span>}
                    </span>
                    <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded text-[10px]">-{getMissionaryCost(selectedCountry)} Fé</span>
                  </button>

                  {/* ACTION 2: Pacify */}
                  {(() => {
                    const v = selectedCountry.violence;
                    const hasConverts = selectedCountry.converts > 0;
                    const tiers: { tier: 1|2|3; label: string; faith: number; fervor: number; violenceReq: number; baseViolence: number; baseResistance: number }[] = [
                      { tier: 1, label: 'Pregação de Paz',           faith: 15, fervor: 0,  violenceReq: 0,  baseViolence: -8,  baseResistance: 0  },
                      { tier: 2, label: 'Mobilização Comunitária',   faith: 25, fervor: 5,  violenceReq: 40, baseViolence: -20, baseResistance: -5 },
                      { tier: 3, label: 'Intervenção de Emergência', faith: 40, fervor: 15, violenceReq: 65, baseViolence: -35, baseResistance: 5  },
                    ];
                    const available = tiers.filter(t => v >= t.violenceReq);
                    const best = available[available.length - 1] ?? tiers[0];
                    const canAfford = faith >= best.faith && fervor >= best.fervor && hasConverts;
                    const templeEffLvl = Math.max(0, ...(selectedCountry.temples ?? [0,0,0,0]).map((n,i) => n > 0 ? i+1 : 0));
                    const eff = calcPeaceEffectiveness(selectedCountry.converts, selectedCountry.population, templeEffLvl, selectedCountry.leaderInfiltration, tithe);
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
                          className={`py-2.5 px-3 rounded text-xs font-bold flex justify-between items-center transition-all ${canAfford ? 'bg-orange-950 hover:bg-orange-900 text-orange-200 border border-orange-500/40 cursor-pointer' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                        >
                          <span className="flex items-center gap-1.5">
                            <HeartHandshake className="w-4 h-4" /> {best.label}
                            {v > 60 && <span className="text-[9px] font-mono bg-orange-400/20 px-1 py-0.5 rounded text-orange-200">✦ Rec</span>}
                          </span>
                          <span className="font-mono text-[9px] flex gap-1 bg-black/20 px-1.5 py-0.5 rounded">
                            <span>{best.faith} Fé</span>{best.fervor > 0 && <span>{best.fervor} Ferv</span>}
                          </span>
                        </button>
                        <div className="flex justify-between text-[9px] font-mono px-0.5">
                          <span className="text-[#dfcfa0]/40">{scaledV} violência{scaledR !== 0 ? `, ${scaledR > 0 ? '+' : ''}${scaledR} res` : ''}</span>
                          <span className={`font-bold ${effColor}`}>Influência: {effLabel} ({effPct}%)</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ACTION 3: Infiltrate Leader */}
                  {(() => {
                    const inf = selectedCountry.leaderInfiltration;
                    if (inf >= 100) {
                      return (
                        <div className="py-2.5 px-3 rounded text-xs font-bold flex items-center gap-2 bg-sky-950 border border-sky-600/40 text-sky-300">
                          <Crown className="w-4 h-4 text-yellow-400" />
                          {selectedCountry.leaderName} — <span className="text-yellow-400">CONVERTIDO</span>
                        </div>
                      );
                    }
                    const stageIdx = LEADER_STAGES_UI.findIndex(s => inf >= s.min && inf < s.max);
                    const stage = LEADER_STAGES_UI[stageIdx] ?? LEADER_STAGES_UI[0];
                    const nextStage = LEADER_STAGES_UI[stageIdx + 1];
                    const isSuperpower = SUPERPOWER_IDS_UI.includes(selectedCountry.id);
                    const reqConvertPct = isSuperpower ? stage.convertPct * 2 : stage.convertPct;
                    const reqTemples = isSuperpower ? stage.globalTemples + 8 : stage.globalTemples;
                    const actualPct = selectedCountry.population > 0 ? selectedCountry.converts / selectedCountry.population : 0;
                    const meetsConv = actualPct >= reqConvertPct;
                    const meetsTmpl = totalTemples >= reqTemples;
                    const meetsCyc = selectedCountry.cyclesPresent >= stage.cyclesPresent;
                    const meetsTmplLoc = stage.localTempleMinLevel === 0 || (selectedCountry.temples?.[stage.localTempleMinLevel - 1] ?? 0) > 0;
                    const meetsAll = meetsConv && meetsTmpl && meetsCyc && meetsTmplLoc;
                    const canAfford = faith >= stage.faith && fervor >= stage.fervor;
                    const canAct = meetsAll && canAfford;
                    const rates = SUCCESS_RATES_UI[selectedCountry.regimeType] ?? SUCCESS_RATES_UI['democracia'];
                    const successPct = Math.round((rates[stageIdx] ?? 0.5) * 100);
                    const rateColor = successPct >= 70 ? 'text-green-400' : successPct >= 40 ? 'text-yellow-400' : 'text-red-400';
                    const isHostile = ['opressor', 'autoritario'].includes(selectedCountry.regimeType);
                    return (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[9px] font-mono text-[#dfcfa0]/50">
                          <span>Estágio: <span className="text-sky-400 font-bold">{stage.label}</span></span>
                          <span>{inf.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-sky-600 rounded-full transition-all" style={{ width: `${inf}%` }} />
                        </div>
                        <div className="bg-zinc-900/60 rounded p-2 flex flex-col gap-0.5 text-[9px] font-mono">
                          <span className={meetsConv ? 'text-green-400' : 'text-red-400'}>{meetsConv ? '✓' : '✗'} {Math.round(reqConvertPct * 100)}% fiéis ({Math.round(actualPct * 100)}% atual)</span>
                          <span className={meetsTmpl ? 'text-green-400' : 'text-red-400'}>{meetsTmpl ? '✓' : '✗'} {reqTemples} templos globais ({totalTemples} atual)</span>
                          {stage.cyclesPresent > 0 && <span className={meetsCyc ? 'text-green-400' : 'text-red-400'}>{meetsCyc ? '✓' : '✗'} {stage.cyclesPresent} ciclos de presença ({selectedCountry.cyclesPresent} atual)</span>}
                          {stage.localTempleMinLevel > 0 && <span className={meetsTmplLoc ? 'text-green-400' : 'text-red-400'}>{meetsTmplLoc ? '✓' : '✗'} Templo nível {stage.localTempleMinLevel} local</span>}
                        </div>
                        <button
                          onClick={() => onInfiltrateLeader(selectedCountry.id)}
                          disabled={!canAct}
                          className={`py-2.5 px-3 rounded text-xs font-bold flex justify-between items-center transition-all ${canAct ? 'bg-sky-900 hover:bg-sky-800 text-sky-100 border border-sky-500/40 cursor-pointer' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Crown className="w-4 h-4" /> Infiltrar: {stage.label}
                            {nextStage && <span className="text-[9px] font-normal opacity-60">→ {nextStage.label}</span>}
                          </span>
                          <span className="font-mono text-[9px] flex gap-1 bg-black/20 px-1.5 py-0.5 rounded">
                            <span className={faith >= stage.faith ? 'text-[#cfb53b]' : 'text-red-500'}>{stage.faith} Fé</span>
                            {stage.fervor > 0 && <span className={fervor >= stage.fervor ? 'text-red-400' : 'text-red-500'}>{stage.fervor} Ferv</span>}
                          </span>
                        </button>
                        <div className="flex justify-between text-[9px] font-mono px-0.5">
                          <span className="text-[#dfcfa0]/40">Falha recua -20{isHostile && inf >= 50 ? ' +15 viol.' : ''}</span>
                          <span className={`font-bold ${rateColor}`}>Sucesso: {successPct}%</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ACTION 4: Ecstasy Ritual */}
                  {trait === 'Mistical' && (
                    <button
                      onClick={() => onPerformEcstasyRitual(selectedCountry.id)}
                      disabled={faith < 50 || fervor < 10 || selectedCountry.converts === 0}
                      className={`py-2.5 px-3 rounded text-xs font-bold flex justify-between items-center transition-all ${faith >= 50 && fervor >= 10 && selectedCountry.converts > 0 ? 'bg-amber-950 text-[#cfb53b] hover:bg-amber-900 border border-[#cfb53b] cursor-pointer' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                    >
                      <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-[#cfb53b]" /> Ritual de Êxtase Coletivo</span>
                      <span className="font-mono text-[9px] bg-black/30 px-1.5 py-0.5 rounded flex gap-1"><span>50 Fé</span><span>10 Ferv</span></span>
                    </button>
                  )}

                  {/* ACTION 5: Coup d'état — only shown for opressor/autoritario */}
                  {['opressor', 'autoritario'].includes(selectedCountry.regimeType) && (() => {
                    const COUP_COST = { faith: 350, fervor: 150, tithe: 80 };
                    const convertPct = selectedCountry.population > 0 ? selectedCountry.converts / selectedCountry.population : 0;
                    const isChina = selectedCountry.id === 'china';
                    const reqPct = isChina ? 0.35 : 0.25;
                    const hasTemple4 = (selectedCountry.temples?.[3] ?? 0) > 0;
                    const meetsLeader = selectedCountry.leaderInfiltration >= 100;
                    const meetsConverts = convertPct >= reqPct;
                    const meetsTemple = hasTemple4;
                    const meetsViolence = selectedCountry.violence <= 50;
                    const allMet = meetsLeader && meetsConverts && meetsTemple && meetsViolence;
                    const canAfford = faith >= COUP_COST.faith && fervor >= COUP_COST.fervor && tithe >= COUP_COST.tithe;
                    const canAct = allMet && canAfford;
                    return (
                      <div className="border border-red-900/40 rounded-lg bg-[#1a0808] p-2.5 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                          <Sword className="w-3.5 h-3.5" /> Golpe de Estado Teocrático
                        </div>
                        <div className="flex flex-col gap-0.5 text-[9px] font-mono">
                          <span className={meetsLeader ? 'text-green-400' : 'text-red-400'}>{meetsLeader ? '✓' : '✗'} Líder convertido (100%)</span>
                          <span className={meetsConverts ? 'text-green-400' : 'text-red-400'}>{meetsConverts ? '✓' : '✗'} {Math.round(reqPct * 100)}% de fiéis ({Math.round(convertPct * 100)}% atual)</span>
                          <span className={meetsTemple ? 'text-green-400' : 'text-red-400'}>{meetsTemple ? '✓' : '✗'} Templo nível 4 no país</span>
                          <span className={meetsViolence ? 'text-green-400' : 'text-red-400'}>{meetsViolence ? '✓' : '✗'} Violência ≤ 50 ({Math.round(selectedCountry.violence)} atual)</span>
                        </div>
                        {allMet && (
                          <p className="text-[9px] text-red-300/70 font-mono leading-relaxed">⚠ Violência subirá +25 após o golpe. O Estado adotará sua religião oficialmente.</p>
                        )}
                        <button
                          onClick={() => onStageCoup(selectedCountry.id)}
                          disabled={!canAct}
                          className={`py-2 px-3 rounded text-xs font-bold flex justify-between items-center transition-all ${canAct ? 'bg-red-950 hover:bg-red-900 text-red-100 border border-red-600/60 cursor-pointer' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}`}
                        >
                          <span className="flex items-center gap-1.5"><Sword className="w-3.5 h-3.5" /> Executar Golpe</span>
                          <span className="font-mono text-[9px] flex gap-1 bg-black/30 px-1.5 py-0.5 rounded">
                            <span className={faith >= COUP_COST.faith ? 'text-[#cfb53b]' : 'text-red-500'}>{COUP_COST.faith} Fé</span>
                            <span className={fervor >= COUP_COST.fervor ? 'text-red-300' : 'text-red-500'}>{COUP_COST.fervor} Ferv</span>
                            <span className={tithe >= COUP_COST.tithe ? 'text-emerald-400' : 'text-red-500'}>{COUP_COST.tithe} Díz</span>
                          </span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ── TEMPLO TAB ── */}
              {sheetTab === 'templo' && (
                <div className="flex flex-col gap-2 pt-1">
                  {(() => {
                    const PRESENCE_REQ = [0, 0.10, 0.25, 0.50];
                    const BUILD_CYCLES_ARR = [3, 6, 10, 15];
                    const LEVEL_LABELS = ['NIV 1', 'NIV 2', 'NIV 3', 'NIV 4'];
                    const MISSION_REQ = [1, 3, 6, 10];
                    const MAX_PER_LEVEL = 5;
                    const GROWTH_PER = [0.015, 0.025, 0.04, 0.06];
                    const RESIST_PER = [0.15, 0.3, 0.5, 0.9];
                    const convertPct = selectedCountry.population > 0 ? selectedCountry.converts / selectedCountry.population : 0;
                    const traitNames = templeNames[trait] ?? [];
                    const temples = selectedCountry.temples ?? [0,0,0,0];
                    const building = selectedCountry.templesBuilding ?? [0,0,0,0];
                    const buildCycles = selectedCountry.templesBuildCycles ?? [0,0,0,0];
                    const specLabel = selectedCountry.templeSpec === 'conversion' ? '⚡ Expansão da Fé' : selectedCountry.templeSpec === 'resistance' ? '🛡️ Bastião da Doutrina' : null;

                    // Global bonus preview
                    const growthBonus = Math.min(temples.reduce((s, n, i) => s + n * GROWTH_PER[i], 0), 0.5);
                    const resistDrop = Math.min(temples.reduce((s, n, i) => s + n * RESIST_PER[i], 0), 3.0);

                    return (
                      <>
                        {/* Header summary */}
                        <div className="flex justify-between items-center text-[10px] font-mono text-[#dfcfa0]/50 pb-0.5">
                          <span>Missionários: {selectedCountry.missionariesSent} · Presença: {selectedCountry.cyclesPresent} ciclos</span>
                          {specLabel && <span className="text-blue-400/80">{specLabel}</span>}
                        </div>

                        {/* Active bonus row */}
                        {temples.some(t => t > 0) && (
                          <div className="flex gap-2 text-[9px] font-mono bg-black/20 border border-[#cfb53b]/10 rounded px-2 py-1">
                            <span className="text-green-400">+{Math.round(growthBonus * 100)}% conv/ciclo</span>
                            <span className="text-[#dfcfa0]/30">·</span>
                            <span className="text-blue-400">-{resistDrop.toFixed(1)} res/ciclo</span>
                            {growthBonus >= 0.5 && <span className="text-[#cfb53b]/60 ml-auto">cap atingido</span>}
                          </div>
                        )}

                        {/* 4 level cards */}
                        {[0,1,2,3].map(lvl => {
                          const count = temples[lvl];
                          const inProgress = building[lvl];
                          const cyclesLeft = buildCycles[lvl];
                          const cost = templeCosts[lvl];
                          const name = traitNames[lvl] ?? `Nível ${lvl+1}`;
                          const presenceReq = PRESENCE_REQ[lvl];
                          const meetsPresence = convertPct >= presenceReq;
                          const missionReq = MISSION_REQ[lvl];
                          const meetsMissions = selectedCountry.missionariesSent >= missionReq;
                          const needsPrevLevel = lvl > 0 && temples[lvl-1] === 0;
                          const cyclesReq = lvl === 2 ? 25 : lvl === 3 ? 50 : 0;
                          const meetsCycles = selectedCountry.cyclesPresent >= cyclesReq;
                          const atCap = count >= MAX_PER_LEVEL;
                          const isBuilding = inProgress > 0;
                          const canUnlock = meetsMissions && meetsPresence && !needsPrevLevel && meetsCycles && !atCap;
                          const canAfford = cost ? faith >= cost.faith && fervor >= cost.fervor && tithe >= cost.tithe : false;
                          const totalBuildTime = BUILD_CYCLES_ARR[lvl];
                          const buildProgress = isBuilding && cyclesLeft > 0
                            ? Math.round(((totalBuildTime - cyclesLeft) / totalBuildTime) * 100)
                            : 0;

                          return (
                            <div key={lvl} className={`rounded-lg border p-3 flex flex-col gap-2 ${count > 0 ? 'border-[#cfb53b]/30 bg-[#1a1308]' : 'border-zinc-800/60 bg-black/20'}`}>
                              {/* Level header */}
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-mono font-bold text-[#cfb53b]/60 uppercase tracking-wider">{LEVEL_LABELS[lvl]}</span>
                                  <span className="text-[11px] font-serif font-bold text-[#dfcfa0]">{name}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {count > 0 && (
                                    <span className="text-[10px] font-mono font-bold text-[#cfb53b]">{count}/{MAX_PER_LEVEL}</span>
                                  )}
                                  {isBuilding && (
                                    <span className="text-[9px] font-mono text-yellow-400 animate-pulse">🏗️</span>
                                  )}
                                </div>
                              </div>

                              {/* Build progress bar (if building) */}
                              {isBuilding && (
                                <div className="flex flex-col gap-0.5">
                                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${buildProgress}%` }} />
                                  </div>
                                  <span className="text-[8px] font-mono text-yellow-400/70">{cyclesLeft} ciclos restantes — aguarde para construir mais</span>
                                </div>
                              )}

                              {/* Cap reached */}
                              {atCap && !isBuilding && (
                                <span className="text-[8px] font-mono text-[#cfb53b]/50">Capacidade máxima ({MAX_PER_LEVEL}/{MAX_PER_LEVEL})</span>
                              )}

                              {/* Unlock requirements if locked (and not building/at cap) */}
                              {!canUnlock && !isBuilding && !atCap && (
                                <div className="flex flex-col gap-0.5 text-[8px] font-mono">
                                  {!meetsMissions && <span className="text-red-400/70">✗ {missionReq} missionários (atual: {selectedCountry.missionariesSent})</span>}
                                  {needsPrevLevel && <span className="text-red-400/70">✗ Requer {traitNames[lvl-1] ?? `Nível ${lvl}`} construído</span>}
                                  {!meetsPresence && presenceReq > 0 && <span className="text-red-400/70">✗ {Math.round(presenceReq*100)}% conversão (atual: {(convertPct*100).toFixed(1)}%)</span>}
                                  {!meetsCycles && cyclesReq > 0 && <span className="text-red-400/70">✗ {cyclesReq} ciclos presença (atual: {selectedCountry.cyclesPresent})</span>}
                                </div>
                              )}

                              {/* Build button */}
                              {canUnlock && !isBuilding && cost && (
                                <button
                                  onClick={() => onOpenTemple(selectedCountry.id, lvl + 1)}
                                  disabled={!canAfford}
                                  className={`py-2 px-3 rounded text-[11px] font-bold flex justify-between items-center transition-all ${canAfford ? 'bg-[#1a2a1a] hover:bg-[#213021] text-green-300 border border-green-700/50 cursor-pointer' : 'bg-zinc-900/50 text-zinc-600 border border-zinc-800/40 cursor-not-allowed'}`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" /> + Construir
                                    <span className="text-[8px] text-zinc-500 font-normal">({BUILD_CYCLES_ARR[lvl]} ciclos)</span>
                                  </span>
                                  <span className="font-mono text-[8px] bg-black/30 px-1.5 py-0.5 rounded flex gap-1">
                                    <span className={faith >= cost.faith ? '' : 'text-red-400'}>{cost.faith} Fé</span>
                                    {cost.fervor > 0 && <span className={fervor >= cost.fervor ? '' : 'text-red-400'}>{cost.fervor} Ferv</span>}
                                    <span className={`text-emerald-400 ${tithe >= cost.tithe ? '' : '!text-red-400'}`}>{cost.tithe} Díz</span>
                                  </span>
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {/* Empty state */}
                        {selectedCountry.missionariesSent === 0 && (
                          <div className="text-[9px] text-zinc-500 font-mono text-center py-1">
                            Envie missionários para desbloquear templos
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

            </div>
          </>
        )}
          </div>
        </>,
        document.body
      )}

      {/* Hint when nothing is selected */}
      {!selectedCountry && (
        <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-20">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#cfb53b]/40 bg-[#0e0b04]/80 px-3 py-1.5 rounded-full border border-[#cfb53b]/10">
            <Network className="w-3 h-3" /> Toque num marcador para selecionar um país
          </div>
        </div>
      )}
    </div>
  );
}
