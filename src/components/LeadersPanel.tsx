/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Country } from '../types';
import { UserCheck, Shield, Crown, Sparkles, TrendingUp } from 'lucide-react';

interface LeadersPanelProps {
  countries: Country[];
  faith: number;
  fervor: number;
  onInfiltrateLeader: (countryId: string) => void;
}

export default function LeadersPanel({ countries, faith, fervor, onInfiltrateLeader }: LeadersPanelProps) {
  
  const getLeaderPassiveBuff = (c: Country) => {
    switch (c.id) {
      case 'usa': return '+40% de ganho passivo de Fé global.';
      case 'china': return 'A censura cai. Custo de missões na Ásia cai 50%.';
      case 'india': return '+50% de velocidade de dispersão orgânica na região.';
      case 'germany': return 'Sociedade secular convertida. Resistência europeia cai 30%.';
      case 'brazil': return 'Fervor inabalável. +25 Fervor extra por perseguição.';
      case 'russia': return 'Poder centralizado. Infiltrações globais são 20% mais baratas.';
      case 'egypt': return 'Fronteiras abertas. Dispersão vizinha ativada por terra.';
      case 'south_africa': return 'Igualdade decretada. Níveis de violência local travados em 5%.';
      case 'japan': return 'Tecnologia sagrada. +20% Fé por ciclo.';
      case 'mexico': return 'Cartéis pacificados. Reduz drasticamente a violência vizinha.';
      case 'saudi_arabia': return 'Teocracia aliada. Resistência local reduzida a zero.';
      case 'australia': return 'Dispersão insular transpacífica ativada.';
      default: return 'Gera bônus de conversão regional.';
    }
  };

  const getInfiltrationCost = (c: Country) => {
    let baseFaith = 40;
    let baseFervor = 15;
    if (c.id === 'japan') baseFaith -= 10;
    if (c.id === 'russia') baseFaith -= 5;
    return { faith: baseFaith, fervor: baseFervor };
  };

  return (
    <div className="flex flex-col gap-5" id="leaders-panel-component">
      
      {/* Informative Header card */}
      <div className="bg-[#241e0d] border border-[#cfb53b]/30 p-4 rounded-lg flex items-start gap-3">
        <Crown className="w-6 h-6 text-[#cfb53b] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#cfb53b] font-serif">
            A Conquista dos Governantes Mundiais
          </h4>
          <p className="text-xs text-[#dfcfa0]/85 mt-1 leading-relaxed">
            Converter a liderança política de um país é a forma máxima de consolidação teológica. Quando um líder atinge <strong className="text-sky-400">100% de conversão</strong>, ele decreta reformas de apoio e fornece um <strong className="text-amber-200">Bônus Passivo Permanente</strong> para a sua religião. O objetivo de vitória <strong>"O Iluminado"</strong> requer converter todos os 12 líderes, enquanto <strong>"Um Só Rebanho"</strong> exige converter as 4 superpotências (EUA, China, Índia e Alemanha).
          </p>
        </div>
      </div>

      {/* Grid of Leaders */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {countries.map((c) => {
          const isConverted = c.leaderInfiltration >= 100;
          const costs = getInfiltrationCost(c);
          const canAfford = faith >= costs.faith && fervor >= costs.fervor;
          const progressColor = isConverted ? 'bg-sky-500' : 'bg-sky-400';

          return (
            <div
              key={c.id}
              className={`rounded-lg p-4 border flex flex-col justify-between gap-3 relative overflow-hidden transition-all duration-300 ${
                isConverted
                  ? 'bg-[#12202b] border-sky-800 shadow-[0_0_15px_rgba(14,165,233,0.15)] text-sky-100'
                  : 'bg-[#1b1609] border-[#cfb53b]/20 hover:border-[#cfb53b]/40 text-[#dfcfa0]'
              }`}
            >
              {/* Country & Status badge */}
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold opacity-75">
                  {c.name}
                </span>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                  isConverted 
                    ? 'bg-sky-950 text-sky-300 border-sky-400/40' 
                    : 'bg-zinc-900 border-zinc-700/50 text-zinc-400'
                }`}>
                  {isConverted ? 'ILUMINADO' : 'COBIÇADO'}
                </span>
              </div>

              {/* Leader Details */}
              <div>
                <h4 className="text-base font-bold font-serif text-[#cfb53b]">
                  {c.leaderName}
                </h4>
                <p className="text-[10px] uppercase tracking-wider text-[#dfcfa0]/50 mt-0.5">
                  Líder Supremo
                </p>
              </div>

              {/* Progress Display */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> Conversão:
                  </span>
                  <span className={`${isConverted ? 'text-sky-300 font-extrabold' : 'text-gray-300'}`}>
                    {c.leaderInfiltration}%
                  </span>
                </div>
                <div className="w-full h-2 bg-black/60 rounded overflow-hidden border border-[#cfb53b]/10">
                  <div
                    className={`h-full ${progressColor} transition-all duration-300`}
                    style={{ width: `${c.leaderInfiltration}%` }}
                  />
                </div>
              </div>

              {/* Passive Reward display */}
              <div className="bg-black/40 rounded p-2 border border-[#cfb53b]/10">
                <span className="text-[9px] uppercase font-bold tracking-wider text-amber-200 block">
                  Bônus Passivo ao converter:
                </span>
                <span className="text-[10px] text-[#dfcfa0]/80 mt-1 block italic font-medium leading-normal">
                  {getLeaderPassiveBuff(c)}
                </span>
              </div>

              {/* Direct convert action button */}
              {!isConverted ? (
                <button
                  onClick={() => onInfiltrateLeader(c.id)}
                  disabled={!canAfford || c.converts === 0}
                  className={`mt-2 py-2 px-3 rounded text-[11px] font-bold flex justify-between items-center transition-all ${
                    canAfford && c.converts > 0
                      ? 'bg-sky-900 hover:bg-sky-800 text-sky-100 hover:shadow-[0_0_10px_rgba(14,165,233,0.3)] cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Semear Doutrina no Líder
                  </span>
                  <span className="font-mono text-[9px] bg-black/30 px-1 py-0.5 rounded flex gap-1 text-sky-300">
                    <span>{costs.faith} Fé</span>
                    <span>{costs.fervor} Fervor</span>
                  </span>
                </button>
              ) : (
                <div className="mt-2 py-1.5 px-2 bg-sky-950/60 rounded border border-sky-900 text-xs text-sky-300 font-medium flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Presença Divina Estabelecida
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
