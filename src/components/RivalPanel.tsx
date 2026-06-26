/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Country, VictoryGoalType, ReligionTrait, Dogma, DoctrineChoice } from '../types';
import { ShieldAlert, Flame, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface RivalPanelProps {
  countries: Country[];
  rivalName: string;
  rivalProgress: number;
  victoryGoal: VictoryGoalType;
  resistanceStreak: number;
  religionTrait: ReligionTrait;
  dogmas: Dogma[];
  doctrines: DoctrineChoice[];
}

export default function RivalPanel({
  countries,
  rivalName,
  rivalProgress,
  victoryGoal,
  resistanceStreak,
  religionTrait,
  dogmas,
  doctrines,
}: RivalPanelProps) {

  const totalPopulation = countries.reduce((a, c) => a + c.population, 0);
  const totalConverts = countries.reduce((a, c) => a + c.converts, 0);
  const conversionRate = totalPopulation > 0 ? totalConverts / totalPopulation : 0;
  const avgResistance = countries.reduce((a, c) => a + c.resistance, 0) / countries.length;
  const avgViolence = countries.reduce((a, c) => a + c.violence, 0) / countries.length;
  const activeCountries = countries.filter(c => c.converts > 0).length;
  const establishedTemples = countries.filter(c => (c.templeLevel ?? 0) >= 2).length;
  const totalInfiltratedLeaders = countries.filter(c => c.leaderInfiltration >= 100).length;
  const superpowers = ['usa', 'china', 'india', 'germany'];
  const superpowersControlled = countries.filter(c => superpowers.includes(c.id) && c.converts >= c.population * 0.5 && c.leaderInfiltration >= 100).length;
  const hasRelogioJuizo = dogmas.some(d => d.id === 'relogio_juizo' && d.purchased);
  const moralSourceDoc = doctrines.find(d => d.id === 'doc_moral_source');
  const hasMoralA = moralSourceDoc?.chosen === 'A';

  // Mirror speed calculation from App.tsx
  const calcSpeed = () => {
    let inc = 0.2;
    if (avgResistance > 60) inc += 0.4;
    else if (avgResistance > 40) inc += 0.2;
    if (activeCountries < 3) inc += 0.2;
    if (conversionRate > 0.5) inc *= 0.3;
    else if (conversionRate > 0.25) inc *= 0.5;
    if (establishedTemples > 0) inc *= Math.pow(0.92, establishedTemples);
    if (religionTrait === 'Syncretist') inc *= 0.7;
    if (hasMoralA) inc *= 0.80;
    if (hasRelogioJuizo) inc *= 0.7;
    const propheticL4 = countries.filter(c => religionTrait === 'Prophetic' && (c.templeLevel ?? 0) >= 4).length;
    if (propheticL4 > 0) inc *= Math.pow(0.85, propheticL4);
    return inc;
  };

  const speed = Math.max(0, calcSpeed());
  const rawCycles = speed > 0 ? Math.round((100 - rivalProgress) / speed) : 9999;
  const cyclesLeft = rawCycles > 0 ? rawCycles : 9999;
  const speedColor = speed <= 0.25 ? 'text-green-400' : speed <= 0.5 ? 'text-yellow-400' : speed <= 0.8 ? 'text-orange-400' : 'text-red-400';
  const SpeedIcon = speed <= 0.25 ? TrendingDown : speed <= 0.6 ? Minus : TrendingUp;

  const renderGoalProgress = () => {
    const convPct = conversionRate * 100;
    switch (victoryGoal) {
      case 'GlobalEcstasy':
        return { label: 'Êxtase Global', progress: Math.min(100, (convPct / 80) * 100), detail: `${convPct.toFixed(3)}% / 80% da humanidade`, color: 'bg-[#cfb53b]' };
      case 'PerpetualPeace': {
        const safe = countries.filter(c => c.violence < 20).length;
        return { label: 'Paz Perpétua', progress: (safe / 12) * 100, detail: `${safe}/12 países com violência < 20%`, color: 'bg-orange-500' };
      }
      case 'OneFlock':
        return { label: 'Um Só Rebanho', progress: (superpowersControlled / 4) * 100, detail: `${superpowersControlled}/4 superpotências controladas`, color: 'bg-[#cfb53b]' };
      case 'TheEnlightened':
        return { label: 'O Iluminado', progress: (totalInfiltratedLeaders / 12) * 100, detail: `${totalInfiltratedLeaders}/12 líderes convertidos`, color: 'bg-sky-500' };
      default:
        return null;
    }
  };

  const goal = renderGoalProgress();

  const modifiers = [
    { label: 'Resistência global', value: avgResistance > 60 ? '+0.4/ciclo' : avgResistance > 40 ? '+0.2/ciclo' : 'Neutra', active: avgResistance > 40, good: false },
    { label: 'Poucos países ativos', value: '+0.2/ciclo', active: activeCountries < 3, good: false },
    { label: `Conversão ${(conversionRate * 100).toFixed(1)}%`, value: conversionRate > 0.5 ? '×0.30' : conversionRate > 0.25 ? '×0.50' : 'Sem freio', active: conversionRate > 0.25, good: true },
    { label: `${establishedTemples} templo(s) nível 2+`, value: establishedTemples > 0 ? `×${Math.pow(0.92, establishedTemples).toFixed(2)}` : 'Nenhum', active: establishedTemples > 0, good: true },
    { label: 'Trait Sincretista', value: '×0.70', active: religionTrait === 'Syncretist', good: true },
    { label: 'Relógio do Juízo', value: '×0.70', active: hasRelogioJuizo, good: true },
    { label: 'Doutrina Fonte Moral A', value: '×0.80', active: hasMoralA, good: true },
  ];

  const countermeasures = [
    { label: 'Conversão > 25%', done: conversionRate > 0.25, tip: 'Envie missionários e construa templos' },
    { label: 'Resistência < 40%', done: avgResistance <= 40, tip: 'Use Pacificar e Intervenção de Emergência' },
    { label: '3+ países com fiéis', done: activeCountries >= 3, tip: 'Expanda para novos países' },
    { label: 'Templo nível 2+ ativo', done: establishedTemples > 0, tip: 'Construa e evolua templos' },
    { label: 'Sincretista ou Relógio do Juízo', done: religionTrait === 'Syncretist' || hasRelogioJuizo, tip: 'Compre o dogma Relógio do Juízo' },
  ];
  const doneCt = countermeasures.filter(c => c.done).length;

  return (
    <div className="flex flex-col gap-3" id="rival-panel-component">

      {/* Rival card */}
      <div className="bg-[#1a0808] border border-red-900/50 rounded-lg p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-[8px] uppercase font-mono tracking-widest px-1.5 py-0.5 bg-red-950 text-red-400 border border-red-900 rounded font-bold">Seita Adversária</span>
            <h3 className="text-lg font-bold font-serif text-red-400 mt-1 leading-tight">{rivalName}</h3>
            <p className="text-[9px] text-[#dfcfa0]/50 mt-0.5">Nega o espírito e busca uma utopia mecânica. Se vencerem primeiro, você perde.</p>
          </div>
          <Flame className="w-5 h-5 text-red-500 shrink-0 mt-1" />
        </div>

        {/* Progress bar */}
        <div className="flex justify-between text-[10px] font-mono mb-1">
          <span className="text-red-400 font-bold">Progresso Rival</span>
          <span className="text-red-300 font-bold">{Math.round(rivalProgress)}%</span>
        </div>
        <div className="w-full h-2.5 bg-black/60 rounded overflow-hidden border border-red-900/40">
          <div className="h-full bg-gradient-to-r from-[#8b0000] to-red-500 transition-all duration-300" style={{ width: `${rivalProgress}%` }} />
        </div>

        {/* A — Speed indicator */}
        <div className={`flex items-center justify-between text-[9px] font-mono mt-2 ${speedColor}`}>
          <span className="flex items-center gap-1">
            <SpeedIcon className="w-3 h-3" />
            <span className="font-bold">+{speed.toFixed(2)}%/ciclo</span>
            {speed <= 0.25 && <span className="text-green-400/70"> · Contido</span>}
            {speed > 0.25 && speed <= 0.5 && <span className="text-yellow-400/70"> · Moderado</span>}
            {speed > 0.5 && speed <= 0.8 && <span className="text-orange-400/70"> · Acelerando</span>}
            {speed > 0.8 && <span className="text-red-400/70"> · Crítico</span>}
          </span>
          <span className="text-[#dfcfa0]/35">{cyclesLeft < 9999 ? `~${cyclesLeft} ciclos` : '∞'}</span>
        </div>
      </div>

      {/* Your goal progress */}
      {goal && (
        <div className="bg-[#171308] border border-[#cfb53b]/20 rounded-lg px-3 py-2">
          <div className="flex justify-between text-[9px] font-mono mb-1.5">
            <span className="text-[#cfb53b]/70 uppercase tracking-wider">🎯 {goal.label}</span>
            <span className="text-[#cfb53b] font-bold">{Math.round(goal.progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/50 rounded overflow-hidden">
            <div className={`h-full ${goal.color} transition-all`} style={{ width: `${goal.progress}%` }} />
          </div>
          <div className="text-[9px] text-[#dfcfa0]/35 font-mono mt-1">{goal.detail}</div>
        </div>
      )}

      {/* B — Modifier breakdown */}
      <div className="bg-[#171308] border border-[#cfb53b]/15 rounded-lg px-3 py-2.5">
        <div className="text-[9px] font-mono text-[#cfb53b]/60 uppercase tracking-wider mb-2">📊 Por que avança {speed.toFixed(2)}%/ciclo</div>
        <div className="flex flex-col gap-1">
          {modifiers.map(m => (
            <div key={m.label} className="flex justify-between items-center text-[9px] font-mono">
              <span className={m.active ? (m.good ? 'text-green-400' : 'text-red-400') : 'text-zinc-600'}>
                {m.active ? (m.good ? '✓' : '▲') : '–'} {m.label}
              </span>
              <span className={`font-bold ml-2 ${m.active && !m.good ? 'text-red-400' : m.active ? 'text-green-400' : 'text-zinc-700'}`}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* C — Countermeasures */}
      <div className="bg-[#171308] border border-[#cfb53b]/15 rounded-lg px-3 py-2.5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] font-mono text-[#cfb53b]/60 uppercase tracking-wider">🛡️ Contramedidas</span>
          <span className={`text-[9px] font-mono font-bold ${doneCt >= 4 ? 'text-green-400' : doneCt >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>{doneCt}/{countermeasures.length} ativas</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {countermeasures.map(cm => (
            <div key={cm.label} className="flex items-start gap-2">
              <span className={`text-[10px] shrink-0 ${cm.done ? 'text-green-400' : 'text-zinc-600'}`}>{cm.done ? '✓' : '✗'}</span>
              <div>
                <span className={`text-[9px] font-mono font-bold ${cm.done ? 'text-green-400' : 'text-zinc-400'}`}>{cm.label}</span>
                {!cm.done && <div className="text-[8px] text-zinc-600 mt-0.5">{cm.tip}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resistance streak warning */}
      {resistanceStreak > 0 && (
        <div className="bg-red-950/80 border border-[#8b0000] rounded-lg p-3 flex items-start gap-2 animate-pulse">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[10px] uppercase text-red-300">Perseguição Global!</strong>
            <p className="text-[9px] text-red-200/80 mt-0.5">Resistência acima de 85% há <strong>{resistanceStreak}/3 ciclos</strong>. Em 3 ciclos consecutivos todos os templos são demolidos — derrota!</p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#171308] border border-[#cfb53b]/10 rounded px-2 py-1.5">
          <span className="text-[8px] uppercase font-mono text-[#dfcfa0]/40 block">Resistência Média</span>
          <span className={`text-sm font-bold font-mono ${avgResistance > 60 ? 'text-red-500' : avgResistance > 40 ? 'text-orange-400' : 'text-green-400'}`}>{avgResistance.toFixed(1)}%</span>
          <span className="text-[8px] text-[#dfcfa0]/30 block">{avgResistance > 85 ? '⚠ Zona crítica' : avgResistance > 60 ? 'Acelera rival' : 'Sob controle'}</span>
        </div>
        <div className="bg-[#171308] border border-[#cfb53b]/10 rounded px-2 py-1.5">
          <span className="text-[8px] uppercase font-mono text-[#dfcfa0]/40 block">Violência Média</span>
          <span className={`text-sm font-bold font-mono ${avgViolence > 60 ? 'text-red-500' : avgViolence > 40 ? 'text-orange-400' : 'text-green-400'}`}>{avgViolence.toFixed(1)}%</span>
          <span className="text-[8px] text-[#dfcfa0]/30 block">{avgViolence > 60 ? 'Use Pacificar' : 'Tolerável'}</span>
        </div>
      </div>

    </div>
  );
}
