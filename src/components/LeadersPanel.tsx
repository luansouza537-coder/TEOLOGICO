/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Country } from '../types';
import { UserCheck, Shield, Crown, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

interface LeadersPanelProps {
  countries: Country[];
  faith: number;
  fervor: number;
  hasGrandeJulgamento: boolean;
  hasVidenteNacoes: boolean;
  russiaConverted: boolean;
  onInfiltrateLeader: (countryId: string) => void;
}

export default function LeadersPanel({ countries, faith, fervor, hasGrandeJulgamento, hasVidenteNacoes, russiaConverted, onInfiltrateLeader }: LeadersPanelProps) {

  const getLeaderPassiveBuff = (c: Country) => {
    switch (c.id) {
      case 'usa': return '+40% Fé gerada por ciclo globalmente.';
      case 'china': return '+50% conversão na China, Índia e Japão por ciclo.';
      case 'india': return '+30% conversão na Índia, África do Sul e Egito.';
      case 'germany': return 'Resistência de Alemanha e Rússia cai 30% por ciclo.';
      case 'brazil': return '+3 Fervor por ciclo. Espírito inabalável.';
      case 'russia': return '+10% Fé por ciclo. Infiltrações globais 20% mais baratas.';
      case 'egypt': return 'Dispersão terrestre ativa: Arábia Saudita e países vizinhos acessíveis.';
      case 'south_africa': return 'Violência da África do Sul travada em 5% permanentemente.';
      case 'japan': return '+20% Fé gerada por ciclo globalmente.';
      case 'mexico': return 'Violência no México, EUA e Brasil cai -1 por ciclo.';
      case 'saudi_arabia': return 'Resistência da Arábia Saudita reduzida a zero permanentemente.';
      case 'australia': return 'Dispersão transpacífica ativa: Austrália acessível por vizinhança.';
      default: return 'Gera bônus de conversão regional.';
    }
  };

  const getCounterIntelRisk = (resistance: number) => {
    if (resistance > 60) return { label: '30% risco', color: 'text-red-400' };
    if (resistance > 40) return { label: '15% risco', color: 'text-orange-400' };
    return { label: 'Baixo risco', color: 'text-green-400' };
  };

  const getInfiltrationCost = (c: Country) => {
    let baseFaith = Math.round(30 + Math.max(0, c.resistance - 30) * 0.8);
    let baseFervor = Math.round(10 + Math.max(0, c.resistance - 30) * 0.3);
    if (['opressor', 'teocracia'].includes(c.regimeType)) {
      baseFaith = Math.round(baseFaith * 1.5);
      baseFervor = Math.round(baseFervor * 1.5);
    }
    if (c.leaderInfiltration > 50) {
      baseFaith = Math.round(baseFaith * 0.7);
      baseFervor = Math.round(baseFervor * 0.7);
    }
    if (russiaConverted) { baseFaith = Math.round(baseFaith * 0.8); baseFervor = Math.round(baseFervor * 0.8); }
    if (hasGrandeJulgamento) { baseFaith = Math.floor(baseFaith * 0.5); baseFervor = Math.floor(baseFervor * 0.5); }
    if (hasVidenteNacoes && ['opressor', 'autoritario'].includes(c.regimeType)) {
      baseFaith = Math.floor(baseFaith * 0.75);
    }
    return { faith: Math.max(5, baseFaith), fervor: Math.max(2, baseFervor) };
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
          const progressColor = isConverted ? 'bg-sky-500' : c.leaderInfiltration > 50 ? 'bg-amber-400' : 'bg-sky-400';
          const convertPct = c.population > 0 ? ((c.converts / c.population) * 100).toFixed(1) : '0.0';
          const risk = getCounterIntelRisk(c.resistance);

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
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold opacity-75">
                    {c.name}
                  </span>
                  <span className="text-[9px] font-mono text-[#dfcfa0]/40 ml-2 capitalize">{c.regimeType}</span>
                </div>
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
                <p className="text-[10px] text-[#dfcfa0]/50 mt-0.5">
                  {convertPct}% da população convertida · Resistência {c.resistance}%
                </p>
              </div>

              {/* Progress Display */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> Infiltração:
                  </span>
                  <span className={`${isConverted ? 'text-sky-300 font-extrabold' : 'text-gray-300'}`}>
                    {c.leaderInfiltration.toFixed(1)}%
                    {!isConverted && <span className="text-[9px] text-[#dfcfa0]/40 ml-1">(+0.2/ciclo)</span>}
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
                  Bônus ao converter:
                </span>
                <span className="text-[10px] text-[#dfcfa0]/80 mt-1 block italic font-medium leading-normal">
                  {getLeaderPassiveBuff(c)}
                </span>
              </div>

              {/* Action button or converted state */}
              {!isConverted ? (
                <div className="flex flex-col gap-1.5 mt-1">
                  {/* Risk indicator */}
                  {c.resistance > 40 && (
                    <div className={`flex items-center gap-1 text-[9px] font-mono ${risk.color}`}>
                      <AlertTriangle className="w-3 h-3" />
                      <span>Contra-inteligência: {risk.label} de detecção</span>
                    </div>
                  )}
                  <button
                    onClick={() => onInfiltrateLeader(c.id)}
                    disabled={!canAfford || c.converts === 0}
                    className={`py-2 px-3 rounded text-[11px] font-bold flex justify-between items-center transition-all ${
                      canAfford && c.converts > 0
                        ? 'bg-sky-900 hover:bg-sky-800 text-sky-100 hover:shadow-[0_0_10px_rgba(14,165,233,0.3)] cursor-pointer'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Semear Doutrina
                    </span>
                    <span className="font-mono text-[9px] bg-black/30 px-1 py-0.5 rounded flex gap-1 text-sky-300">
                      <span>{costs.faith} Fé</span>
                      <span>{costs.fervor} Fervor</span>
                    </span>
                  </button>
                  {c.converts === 0 && (
                    <p className="text-[9px] text-zinc-500 text-center">Requer ao menos 1 converso no país</p>
                  )}
                </div>
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
