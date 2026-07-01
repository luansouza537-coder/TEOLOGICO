/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const COUNTRY_FLAGS: Record<string, string> = {
  usa: '🇺🇸', brazil: '🇧🇷', china: '🇨🇳', india: '🇮🇳', russia: '🇷🇺',
  germany: '🇩🇪', japan: '🇯🇵', mexico: '🇲🇽', egypt: '🇪🇬', south_africa: '🇿🇦',
  australia: '🇦🇺', indonesia: '🇮🇩', south_korea: '🇰🇷', nigeria: '🇳🇬', iran: '🇮🇷',
  saudi_arabia: '🇸🇦', haiti: '🇭🇹', ukraine: '🇺🇦', ethiopia: '🇪🇹',
  philippines: '🇵🇭', colombia: '🇨🇴', cuba: '🇨🇺',
};
import { Country } from '../types';
import { UserCheck, Shield, Crown, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

const COUNTRY_FLAGS: Record<string, string> = {
  usa: '🇺🇸', brazil: '🇧🇷', china: '🇨🇳', india: '🇮🇳', russia: '🇷🇺',
  germany: '🇩🇪', japan: '🇯🇵', mexico: '🇲🇽', egypt: '🇪🇬', south_africa: '🇿🇦',
  australia: '🇦🇺', indonesia: '🇮🇩', south_korea: '🇰🇷', nigeria: '🇳🇬', iran: '🇮🇷',
  saudi_arabia: '🇸🇦', haiti: '🇭🇹', ukraine: '🇺🇦', ethiopia: '🇪🇹',
  philippines: '🇵🇭', colombia: '🇨🇴', cuba: '🇨🇺',
};

interface LeadersPanelProps {
  countries: Country[];
  faith: number;
  fervor: number;
  hasGrandeJulgamento: boolean;
  hasVidenteNacoes: boolean;
  russiaConverted: boolean;
  totalTemples: number;
  getLeaderCost: (countryId: string) => { faith: number; fervor: number; canAct: boolean };
  onInfiltrateLeader: (countryId: string) => void;
}

export default function LeadersPanel({ countries, faith, fervor, totalTemples, getLeaderCost, onInfiltrateLeader }: LeadersPanelProps) {

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
      case 'australia':   return 'Dispersão transpacífica ativa: Austrália acessível por vizinhança.';
      case 'turkey':      return 'Resistência de Egito e Alemanha cai 8% permanentemente ao converter.';
      case 'iran':        return 'Sem presença: +0.3% resistência global/ciclo. Com presença: -0.3% global/ciclo.';
      case 'south_korea': return '+1.5% converts passivos no Japão e Indonésia por ciclo.';
      case 'indonesia':   return 'Após 10% da população: crescimento viral +50%. Antes: 30% mais lento.';
      case 'nigeria':     return 'População cresce 50.000/ciclo. Potencial de conversão aumenta com o tempo.';
      case 'haiti':       return 'Missões custam 50% menos. Violência destrói templos 2× mais rápido.';
      default: return 'Gera bônus de conversão regional.';
    }
  };

  const getCounterIntelRisk = (resistance: number) => {
    if (resistance > 60) return { label: '30% risco', color: 'text-red-400' };
    if (resistance > 40) return { label: '15% risco', color: 'text-orange-400' };
    return { label: 'Baixo risco', color: 'text-green-400' };
  };


  const convertedCount = countries.filter(c => c.leaderInfiltration >= 100).length;

  return (
    <div className="flex flex-col gap-5" id="leaders-panel-component">

      {/* Compact header line */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#dfcfa0]/40 mb-1">
        <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-[#cfb53b]" /> Converta líderes para bônus permanentes</span>
        <span>{convertedCount}/{countries.length} convertidos</span>
      </div>

      {/* Grid of Leaders */}
      <div className="grid grid-cols-2 gap-2">
        {countries.map((c) => {
          const isConverted = c.leaderInfiltration >= 100;
          const costs = getLeaderCost(c.id);
          const canAfford = faith >= costs.faith && fervor >= costs.fervor && costs.canAct;
          const progressColor = isConverted ? 'bg-sky-500' : c.leaderInfiltration > 50 ? 'bg-amber-400' : 'bg-sky-400';
          const convertPct = c.population > 0 ? ((c.converts / c.population) * 100).toFixed(1) : '0.0';
          const risk = getCounterIntelRisk(c.resistance);

          return (
            <div
              key={c.id}
              className={`rounded-lg p-2.5 border flex flex-col justify-between gap-2 relative overflow-hidden transition-all duration-300 ${
                isConverted
                  ? 'bg-[#12202b] border-sky-800 shadow-[0_0_15px_rgba(14,165,233,0.15)] text-sky-100'
                  : 'bg-[#1b1609] border-[#cfb53b]/20 hover:border-[#cfb53b]/40 text-[#dfcfa0]'
              }`}
            >
              {/* Country & Status badge */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold opacity-75">
                    {COUNTRY_FLAGS[c.id] ?? ''} {c.name}
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
                <h4 className="text-sm font-bold font-serif text-[#cfb53b]">
                  {c.leaderName}
                </h4>
                <p className="text-[10px] text-[#dfcfa0]/50 mt-0.5">
                  {convertPct}% pop · Res {Math.round(c.resistance * 10) / 10}%
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

              {/* Action button or converted state */}
              {!isConverted ? (
                <div className="flex flex-col gap-1.5 mt-1">
                  {/* Risk indicator - inline, only when resistance > 60 */}
                  {c.resistance > 60 && (
                    <span className="text-[9px] font-mono text-red-400">⚠ {risk.label}</span>
                  )}
                  <button
                    onClick={() => onInfiltrateLeader(c.id)}
                    disabled={!canAfford || c.converts === 0}
                    className={`py-1.5 px-2 rounded text-[10px] font-bold flex justify-between items-center transition-all ${
                      canAfford && c.converts > 0
                        ? 'bg-sky-900 hover:bg-sky-800 text-sky-100 hover:shadow-[0_0_10px_rgba(14,165,233,0.3)] cursor-pointer'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Semear Doutrina
                    </span>
                    <span className="font-mono text-[9px] bg-black/30 px-1 py-0.5 rounded flex gap-1 text-sky-300">
                      <span>{costs.faith}F {costs.fervor}Fv</span>
                    </span>
                  </button>
                  {c.converts === 0 && (
                    <p className="text-[9px] text-zinc-500 text-center">Requer ao menos 1 converso no país</p>
                  )}
                </div>
              ) : (
                <div className="mt-2 py-1.5 px-2 bg-sky-950/60 rounded border border-sky-900 text-[9px] text-sky-300 font-medium flex items-center justify-center gap-1.5">
                  ✦ Estabelecida
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
