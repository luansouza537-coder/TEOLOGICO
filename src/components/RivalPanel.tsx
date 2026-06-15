/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Country, VictoryGoalType } from '../types';
import { ShieldAlert, Crosshair, Users, Globe, Smile, Flame } from 'lucide-react';

interface RivalPanelProps {
  countries: Country[];
  rivalName: string;
  rivalProgress: number;
  victoryGoal: VictoryGoalType;
  resistanceStreak: number;
}

export default function RivalPanel({
  countries,
  rivalName,
  rivalProgress,
  victoryGoal,
  resistanceStreak
}: RivalPanelProps) {
  
  // Calculations
  const totalPopulation = countries.reduce((acc, curr) => acc + curr.population, 0);
  const totalConverts = countries.reduce((acc, curr) => acc + curr.converts, 0);
  const conversionRate = (totalConverts / totalPopulation) * 100;

  const avgResistance = countries.reduce((acc, curr) => acc + curr.resistance, 0) / countries.length;
  const avgViolence = countries.reduce((acc, curr) => acc + curr.violence, 0) / countries.length;

  const totalInfiltratedLeaders = countries.filter((c) => c.leaderInfiltration >= 100).length;

  // Superpowers tracking for "Um Só Rebanho"
  const superpowers = ['usa', 'china', 'india', 'germany'];
  const superpowersControlledCount = countries.filter(
    (c) => superpowers.includes(c.id) && c.converts >= c.population * 0.5 && c.leaderInfiltration >= 100
  ).length;

  const renderGoalStatus = () => {
    switch (victoryGoal) {
      case 'GlobalEcstasy':
        return (
          <div className="bg-[#241d0c] border border-[#cfb53b]/30 p-4 rounded-lg">
            <span className="text-[10px] uppercase font-mono text-[#cfb53b]">Objetivo Atual</span>
            <h4 className="text-base font-bold font-serif text-[#cfb53b] mt-0.5">Êxtase Global</h4>
            <p className="text-xs text-[#dfcfa0]/80 mt-1">
              Converter 80% da humanidade mundial.
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span>Progresso Real:</span>
                <span>{conversionRate.toFixed(4)}% / 80%</span>
              </div>
              <div className="w-full h-3 bg-black/60 rounded border border-[#cfb53b]/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-[#cfb53b] transition-all duration-300"
                  style={{ width: `${Math.min(100, (conversionRate / 80) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      case 'PerpetualPeace':
        const countriesOver20 = countries.filter((c) => c.violence >= 20).length;
        const totalCountriesPercentSafe = ((12 - countriesOver20) / 12) * 100;
        return (
          <div className="bg-[#241d00] border border-orange-700/30 p-4 rounded-lg">
            <span className="text-[10px] uppercase font-mono text-orange-400">Objetivo Atual</span>
            <h4 className="text-base font-bold font-serif text-orange-400 mt-0.5 font-sans">Paz Perpétua</h4>
            <p className="text-xs text-[#dfcfa0]/80 mt-1">
              Todos os 12 países devem possuir nível de violência abaixo de 20%.
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span>Países Pacíficos (Violência &lt; 20%):</span>
                <span>{12 - countriesOver20} / 12 países</span>
              </div>
              <div className="w-full h-3 bg-black/60 rounded border border-orange-500/20 overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${totalCountriesPercentSafe}%` }}
                />
              </div>
            </div>
          </div>
        );
      case 'OneFlock':
        return (
          <div className="bg-[#211d12] border border-[#cfb53b]/30 p-4 rounded-lg">
            <span className="text-[10px] uppercase font-mono text-[#cfb53b]">Objetivo Atual</span>
            <h4 className="text-base font-bold font-serif text-[#cfb53b] mt-0.5">Um Só Rebanho</h4>
            <p className="text-xs text-[#dfcfa0]/80 mt-1">
              Tomar poder político absoluto (conversão &ge; 50% AND mentes infiltradas a 100%) nas 4 superpotências: EUA, China, Índia e Alemanha.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span>Superpotências Controladas:</span>
                <span>{superpowersControlledCount} / 4 países</span>
              </div>
              <div className="w-full h-3 bg-black/60 rounded border border-[#cfb53b]/20 overflow-hidden">
                <div
                  className="h-full bg-amber-600 transition-all duration-300"
                  style={{ width: `${(superpowersControlledCount / 4) * 100}%` }}
                />
              </div>
              
              {/* Checkbox checklist */}
              <div className="grid grid-cols-2 gap-2 mt-2 border-t border-[#cfb53b]/10 pt-2 text-[10px] font-mono">
                {superpowers.map((id) => {
                  const country = countries.find((c) => c.id === id);
                  if (!country) return null;
                  const isConvertsOK = country.converts >= country.population * 0.5;
                  const isLeaderOK = country.leaderInfiltration >= 100;
                  const isControlled = isConvertsOK && isLeaderOK;
                  return (
                    <div key={id} className="flex flex-col gap-0.5">
                      <span className={`font-bold ${isControlled ? 'text-[#cfb53b]' : 'text-zinc-500'}`}>
                        {country.name}: {isControlled ? '✓ CONTROLADO' : '✗ INDEPENDENTE'}
                      </span>
                      <span className="text-[9px] text-zinc-400">
                        ({Math.round((country.converts / country.population) * 100)}% converts • {country.leaderInfiltration}% líder)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 'TheEnlightened':
        const percentEnlightened = (totalInfiltratedLeaders / 12) * 100;
        return (
          <div className="bg-[#12202c] border border-sky-800/40 p-4 rounded-lg">
            <span className="text-[10px] uppercase font-mono text-sky-400">Objetivo Atual</span>
            <h4 className="text-base font-bold font-serif text-sky-400 mt-0.5">O Iluminado</h4>
            <p className="text-xs text-[#dfcfa0]/80 mt-1">
              Infiltrar-se e converter os líderes supremos de todos os 12 países a 100%.
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span>Líderes Convertidos:</span>
                <span>{totalInfiltratedLeaders} / 12 líderes</span>
              </div>
              <div className="w-full h-3 bg-black/60 rounded border border-sky-500/20 overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-300"
                  style={{ width: `${percentEnlightened}%` }}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="rival-panel-component">
      
      {/* LEFT COLUMN: Core Worldwide Metrics & Goals */}
      <div className="flex flex-col gap-4">
        
        <h3 className="text-xl font-bold font-serif text-[#cfb53b] uppercase tracking-wider border-b border-[#cfb53b]/25 pb-1 flex items-center gap-1.5">
          <Globe className="w-5 h-5" /> Métricas e Metas Globais
        </h3>

        {/* Dynamic goal interface card */}
        {renderGoalStatus()}

        {/* Global Statistics Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#171308] border border-[#cfb53b]/10 p-3 rounded">
            <span className="text-[9px] uppercase font-mono text-[#dfcfa0]/50 block">Média de Resistência</span>
            <span className="text-lg font-bold font-mono text-[#8b0000] block mt-0.5">{avgResistance.toFixed(1)}%</span>
            <span className="text-[9px] text-[#dfcfa0]/60">Se passar de 85%, governos fecham cerco.</span>
          </div>

          <div className="bg-[#171308] border border-[#cfb53b]/10 p-3 rounded">
            <span className="text-[9px] uppercase font-mono text-[#dfcfa0]/50 block">Média de Violência</span>
            <span className="text-lg font-bold font-mono text-orange-400 block mt-0.5">{avgViolence.toFixed(1)}%</span>
            <span className="text-[9px] text-[#dfcfa0]/60">Reduzível com ações coletivas sociais.</span>
          </div>
        </div>

        {/* Warning Streak Indicator */}
        {resistanceStreak > 0 && (
          <div className="bg-red-950/80 border border-[#8b0000] rounded p-3 text-xs leading-relaxed text-red-200 flex items-start gap-2.5 animate-pulse">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <strong className="uppercase">Aviso de Perseguição Global!</strong>
              <p className="mt-0.5">
                A resistência mundial está em nível crítico (&gt; 85%). Você está há <strong>{resistanceStreak}/3 ciclos</strong> sob perseguição. Se atingir 3 consecutivos, todos os canais de fé serão demolidos (Derrota)!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: The Dreaded Rival Religion */}
      <div className="bg-[#1e1313] border-2 border-red-950 rounded-lg p-5 flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 bg-red-950 text-red-400 border border-red-900 rounded font-bold animate-pulse">
              Seita Adversária Ativa
            </span>
            <span className="text-xs font-mono font-semibold text-red-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-500" /> Rival do Amanhã
            </span>
          </div>

          <h3 className="text-2xl font-bold font-serif text-red-400 mt-2">
            {rivalName}
          </h3>
          <p className="text-xs text-[#dfcfa0]/75 leading-relaxed mt-2">
            Essa congregação rival de cientistas materialistas e niilistas nega o espírito e busca construir uma utopia mecânica estéril. Eles espalham sua dúvida entre os povos. Se alcançarem sua meta primeiro, você falhará em sua missão cósmica.
          </p>

          <hr className="border-red-950/50 my-4" />

          {/* Rival's progress bar */}
          <div className="bg-[#120505] border border-red-950/60 rounded p-4">
            <div className="flex justify-between items-center text-xs font-mono font-extrabold text-red-400 mb-1.5">
              <span>Progresso de Vitória Rival:</span>
              <span>{Math.round(rivalProgress)}% / 100%</span>
            </div>
            <div className="w-full h-3.5 bg-black rounded overflow-hidden border border-red-900/30">
              <div
                className="h-full bg-gradient-to-r from-[#8b0000] to-red-600 transition-all duration-300"
                style={{ width: `${rivalProgress}%` }}
              />
            </div>
            <span className="text-[9px] text-[#dfcfa0]/50 block mt-1 leading-normal">
              Eles convertem cidadãos passivamente no escuro do ceticismo. Cada dogma que você compra que estimula ceticismo ou cada escândalo seu acelera os planos da Ordem.
            </span>
          </div>
        </div>

        {/* Action item block */}
        <div className="bg-[#120a0a] border border-red-950 p-3 rounded mt-4">
          <span className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Antagonismo Religioso
          </span>
          <p className="text-[10px] text-[#dfcfa0]/70 mt-1 leading-normal">
            Você ganha mais <strong className="text-red-400">Fervor</strong> de emergência quando a resistência global está alta, permitindo adotar dogmas de oposição fundamentais. Balanceie a impopularidade com o ganho defensivo de Fervor!
          </p>
        </div>
      </div>

    </div>
  );
}
